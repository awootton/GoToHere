// Copyright 2021 Alan Tracey Wootton
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// crypto-js/sha256 is banned for life import sha256 from 'crypto-js/sha256';
// also banned import Base64 from 'crypto-js/enc-base64'

import * as nacl from 'tweetnacl-ts'
//import * as crypto from 'crypto'
// this acts differently in browser !!!!!  import { createHash } from "crypto";
 
import base64url from 'base64url'

import sha256 from "fast-sha256";

import * as s from './SocialTypes'

// BEFORE you change this make sure that 
// a context has been added.
// chenge this when the user signs in.
export var signedInAs: string = 'Anonymous'


export interface LooseObject { // decend mqtt uer props from this 
    [key: string]: any
}

export var isTestingNotClient: boolean = false
export function setisTestingNotClient() {
    isTestingNotClient = true
}

export type Context = {
    username: string
    password: string[]  // might be "" in which case the ourSecretKey is "" and ourPublicKey must be set manually

    // delete me usually username and profileNameFromApp will match.
    // sometimes from a topic when messages received
    //profileNameFromApp: string   // this is from the url, on the server it's == username 

    tokenFromApp: string
    //   knotServerPubKeyFromApp: string

    initialized: boolean
    unfamiliar: boolean // as in: a friend or follower or something and not just someone 

    ourPublicKey: Buffer[]
    ourSecretKey: Buffer[]
    profileHash: string
    //   knotServersPubKey: Buffer

    //onfig?: config.ServerConfigItem
}

export const emptyContext: Context = {
    username: "",
    password: [],
    //profileNameFromApp: "",
    tokenFromApp: "",
    //knotServerPubKeyFromApp: "",

    initialized: false,
    unfamiliar: false,

    ourPublicKey: [],
    ourSecretKey: [],
    profileHash: "", // starts with = and has exactly 43 following
    // knotServersPubKey: Buffer.from(""),// as obtained by TokenScreen using profileName, client
}

// not public
var contexts: Context[] = []

// export function XXXgetCurrent Context(): Context {
//     var cx = contexts[currentIndex]
//     initContext(cx)
//     return cx
// }

export function getSignedInContext(): Context {
    const c = getNameToContext(signedInAs)
    if (c) {
        return c
    }
    // fuck
    console.log("getSignedInContext fail. was hoping to avoid this.")
    return emptyContext
}

export function getNameToContext(username: string, ignoreWarning?: boolean): Context {
    // FIXME: use a map
    for (var context of contexts) {
        initContext(context)
        if (context.username.toLowerCase() === username.toLowerCase()) {
            return context
        }
    };
    // fuck
    if (ignoreWarning !== true) {
        console.log("getNameToContext fail. was hoping to avoid this.", username)
    }
    return emptyContext
}

export function getMatchingHashedTopicContext(hashedtopic: string): Context {
    // FIXME: use a map
    for (var context of contexts) {
        initContext(context)
        if (context.profileHash === hashedtopic) {
            return context
        }
    };
    // fuck
    console.log("getMatchingHashedTopicContext fail. was hoping to avoid this.")
    return emptyContext
}

// used by logging
export function getTopicName(topic: string): string {
    if (!topic.startsWith("=")) {
        return topic
    }
    return getMatchingHashedTopicContext(topic).username
}

// pubkToName is useful for logging
export function getPubkToName(pubk: Buffer): string {
    // FIXME: use a map
    for (var context of contexts) {
        initContext(context)
        for (var i = 0; i < context.ourPublicKey.length; i++) {
            if (context.ourPublicKey[i] === pubk) {
                return context.username
            }
        }
    }
    return toBase64Url(pubk)
}


export function getHashedTopic2Context(hashedTopic: string): Context {
    if (!hashedTopic.startsWith("=")) {
        console.log("ERROR expecting HASHED topic ", hashedTopic)
    }
    // FIXME: use a map
    for (var context of contexts) {
        initContext(context)
        if (context.profileHash === hashedTopic) {
            return context
        }
    };
    // fuck
    console.log("getHashedTopic2Context fail. was hoping to avoid this.", hashedTopic)
    return emptyContext
}


// export function setCurrentIndex(i: number) {
//     currentIndex = i
// }

export function cleanContexts() {
    contexts = []
}

export function pushContext(context: Context) {
    // don't do it twice. FIXME: use map
    for (var c of contexts) {
        if (c.username === context.username) {
            return
        }
    }
    contexts.push(context)
}

export function initContext(context: Context) {
    if (context.initialized) {
        return
    }
    if (context.password.length !== 0) {
        context.ourPublicKey = []
        context.ourSecretKey = []
        for (var i = 0; i < context.password.length; i++) {
            const keypair: nacl.BoxKeyPair = getBoxKeyPairFromPassphrase(context.username, context.password[i])
            context.ourPublicKey.push(Buffer.from(keypair.publicKey))
            context.ourSecretKey.push(Buffer.from(keypair.secretKey))
        }
    }
    context.profileHash = "=" + KnotNameHash(context.username.toLowerCase())
    // context.knotServersPubKey = fromBase64Url(context.knotServerPubKeyFromApp)
    context.initialized = true
}
// export function SetUsernameFromApp(str: string) {
//     contexts[currentIndex].username = str
//     contexts[currentIndex].initialized = false
// }
// export function SetPasswordFromApp(str: string) {
//     contexts[currentIndex].password = str
//     contexts[currentIndex].initialized = false
// }
// export function SetProfileNameFromApp(str: string) {
//     contexts[currentIndex].profileNameFromApp = str
//     contexts[currentIndex].initialized = false
// }
// export function SetTokenFromApp(str: string) {
//     contexts[currentIndex].tokenFromApp = str
//     contexts[currentIndex].initialized = false
// }

// export function SetKnotServerPubKeyFromApp(str: string) {
//     contexts[currentIndex].knotServerPubKeyFromApp = str
//     contexts[currentIndex].initialized = false
// }

var theLastOne: s.DateNumber = 0
export function getUniqueId(): s.DateNumber {
    const s2 = new Date().getTime()
    var nnn = ConvertFromMsToDateNumber(s2)
    if (nnn <= theLastOne) {
        // this is when less than 1 ms has elapsed since the last time we were here
        nnn = theLastOne + 1
        // watch for roll over from 59 to 60 sec which should increment minute, which *might* inc hour etc.
        // to have that happen we'd have to call this 1000 times in a sec?
        // I'm bett it doesn't happen
        if (nnn % 100000 === 60000) {
            console.log("ERROR FIXME: rollover problem")
        }
    }
    theLastOne = nnn
    return nnn
}

// the first return is the hostname from **inside** the token
// the 2nd return is a string with an error
export function VerifyToken(myToken: string): [string, string] {

    if (myToken.length < 200) {
        return ["", "token is too short to be a token"]
    }
    console.log("about to verify the token")
    var pos = 0
    var longestPos1 = 0
    var longestPos2 = 0
    for (var i = 0; i < myToken.length; i++) {
        const c = myToken[i]
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '-' || c === '_' || c === '.') {
            var newLen = i - pos
            if (newLen > (longestPos2 - longestPos1)) {
                longestPos1 = pos
                longestPos2 = i
            }
        } else {
            pos = i + 1
        }
    }
    var justTheToken = myToken.substring(longestPos1, longestPos2 + 1)
    var parts = justTheToken.split('.')
    if (parts.length !== 3) {
        return ["", "Token needs 3 periods"]
    }
    var middle = parts[1]
    var unpacked = base64url.decode(middle)

    console.log("verify the token found ", unpacked)

    var obj = JSON.parse(unpacked) || {}
    if (obj.url !== undefined) {
        return [obj.url, ""]
    } else {
        console.log("expected  ", unpacked)
    }
    return ["", "expected 'url' in token "]
}

export function Sha256Hash(str: string): Uint8Array {
    const data = Buffer.from(str)
    return sha256(data)
}

export function getBoxKeyPairFromPassphrase(username: string, phrase: string): nacl.BoxKeyPair {
    // this is how we do
    // const hash = createHash('sha256');
    // hash.write(username + phrase);
    // hash.end();
    // var hashBytes = hash.digest()
    const hashBytes = Sha256Hash(username + phrase)
    const seedKeyPair3 = nacl.box_keyPair_fromSecretKey(hashBytes)
    return seedKeyPair3
}


export function getMilliseconds(): number {
    return new Date().getTime()
}

export function getSecondsDisplay(): string {
    var ms = getMilliseconds()
    var tmp = ms
    const millis: number = tmp % 1000
    tmp = Math.floor(tmp / 1000)
    const secs: number = tmp % 60
    return ":" + secs + "." + millis
}

export function getCurrentDateNumber(): number {
    var millis = getMilliseconds()
    return ConvertFromMsToDateNumber(millis)
}

// FIXME: atw use crypto.randomBytes(size[, callback]) and convert to b64 ?
export function randomString(len: number) {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}



// base64 convert base64 encode base64
export function toBase64Url(buf: Buffer): string {
    const result: string = base64url.encode(buf)
    // const lll = result.length 32 to 43
    return result
}

export function fromBase64Url(str: string): Buffer {
    const buf: Buffer = base64url.toBuffer(str)
    //const lll = buf.length // 43 to 32
    return buf
}

//  
export function BoxItItUp(message: Buffer, nonce: Buffer, theirPublicKey: Buffer, ourSecretKey: Buffer): Buffer {
    const mySecretKey = ourSecretKey
    const rtmp = nacl.box(message, nonce, theirPublicKey, mySecretKey)
    const result = Buffer.from(rtmp)
    return result
}

export function UnBoxIt(message: Buffer, nonce: Buffer, theirPublicKey: Buffer, ourSecretKey: Buffer): Buffer {
    var publicKey = theirPublicKey
    const mySecretKey = ourSecretKey
    const rtmp = nacl.box_open(message, nonce, publicKey, mySecretKey)
    const result = Buffer.from(rtmp || Buffer.from(""))
    return result
}

// KnotNameHash must match exactly what KnotFree does to topics.
export function KnotNameHash(name: string): string {
    // const hash = createHash('sha256')
    // hash.write(name)
    // hash.end()
    // const hbytes = hash.digest()
    const hbuff = Buffer.from(Sha256Hash(name))
    var tmp = toBase64Url(hbuff)
    tmp = tmp.slice(0, 32)
    return tmp
}

export function ConvertFromMsToDateNumber(millis: number): s.DateNumber {
    const startDate = new Date(millis)
    var date = startDate.getDate(); //returns date (1 to 31) you can getUTCDate() for UTC date
    var month = startDate.getMonth() + 1; // returns 1 less than month count since it starts from 0
    var year = startDate.getFullYear(); //returns year 
    year = year % 100
    var hours = startDate.getHours();
    var minutes = startDate.getMinutes();
    var seconds = startDate.getSeconds();
    millis = millis % 1000
    var result = +year
    result = result * 100 + month
    result = result * 100 + date
    result = result * 100 + hours
    result = result * 100 + minutes
    result = result * 100 + seconds
    result = result * 1000 + millis
    return result
}

export function DateFromDateNumber(dn: s.DateNumber): Date {

    var tmp = dn
    const millis: number = tmp % 1000
    tmp = Math.floor(tmp / 1000)

    const secs: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const mins: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const hours: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const day: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const month: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const year: number = tmp % 100

    var res: Date = new Date()
    res.setMilliseconds(millis)
    res.setSeconds(secs)
    res.setMinutes(mins)
    res.setHours(hours)
    res.setFullYear(2000 + year, month - 1, day)
    // does it know it's supposed to be in gmt ?
    return res
}

export function FormatDateNumber(dn: s.DateNumber): string {

    var tmp = dn
    //const millis : number = tmp % 1000
    tmp = Math.floor(tmp / 1000)

    //const secs : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const mins: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const hours: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const day: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const month: number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const year: number = tmp % 100
    //tmp = tmp / 100

    return "" + month + "/" + day + "/" + year + " " + hours + ":" + mins
}

// ZeroPadLeft2 adds '0' on the left, as needed, to make the result have 2 length === 2
export function ZeroPadLeft2(sss: (number | string)): string {
    var tmp = "00" + sss
    var x = tmp.length
    tmp = tmp.substr(x - 2, x - 1)
    return tmp
}

// ZeroPadLeft3 adds '0' on the left, as needed, to make the result have 2 length === 3
export function ZeroPadLeft3(sss: (number | string)): string {
    var tmp = "000" + sss
    var x = tmp.length
    tmp = tmp.substr(x - 3, x - 1)
    return tmp
}
if (isTestingNotClient) {

}
// getProfileName comes from the client browser eg alice_vociferous_mcgrath
export function getProfileName(): string {

    var profileName = "unknown"
    var locationhref = isTestingNotClient ? "http://dummy.knotlocal.com:8085/" : window.location.href 
    // eg http://alice_vociferous_mcgrath.knotlocal.com:3000/

    var ind = locationhref.indexOf("//")
    if (ind > 0) {
        locationhref = locationhref.substring(ind + 2)
        var parts = locationhref.split(".")
        if (parts.length <= 0) {
            console.log("how can we have missing parts here?")
        }
        if (parts.length <= 2) {
            return ""
        }
        profileName = parts[0]
    }
    return profileName
}

// eg gotohere.com
export function getServerNamepart(): string {
    var serverName = "unknown"
    var locationhref = isTestingNotClient ? "http://dummy.knotlocal.com:8085/" : window.location.href

    var ind = locationhref.indexOf("//")
    if (ind > 0) {
        locationhref = locationhref.substring(ind + 2)
        var parts = locationhref.split(".")
        if (parts.length <= 0) {
            console.log("how can we have missing parts here?")
        }
        if (parts.length <= 2) {
            return locationhref
        }
        serverName = parts[1] + "." + parts[2]
    }
    return serverName
}

export function getServerName(): string {
    var str = getServerNamepart() // eg gotolocal.com:3000/getFreeToken w/o the alice part
    const ind = str.indexOf("/")
    if (ind >= 0) {
        str = str.slice(0, ind)
    }
    return str
}
// eg alice.gotolocal.com:3000/getFreeToken return the getFreeToken
export function getServerPage(): string {
    var str = getServerNamepart() // eg gotolocal.com:3000/getFreeToken w/o the alice part
    const ind = str.indexOf("/")
    if (ind >= 0) {
        str = str.slice(ind + 1)
    } else {
        str = ""
    }
    return str
}



// UnpackMqttOptions will pull the key,value pairs from the mqtt userProperties
// and put them into a Map of strings and not a funky js object
// sometimes they are wrapped with [ ] and I don't know why.
// probably the mqtt5 spec allows mutliple values which is dumb.
export function UnpackMqttOptions(packet: any): Map<string, string> {
    var gotOptions = new Map<string, string>()
    //console.log("unpacking packet.properties.userProperties ", Object.keys(packet.properties.userProperties))
    Object.keys(packet.properties.userProperties).forEach((key: string) => {
        var val = packet.properties.userProperties[key]// copy over the user stuff
        if (val) {
            var tmp = val.toString()
            if (tmp[0] === '[') {
                tmp = tmp.substr(1)
            }
            if (tmp[tmp.length - 1] === ']') {
                tmp = tmp.substr(0, tmp.length - 1)
            }
            gotOptions.set(key, tmp)
        }
    });
    //console.log(" userProperties unpacked as ",  gotOptions )
    return gotOptions
}

export function hashCode(str: string): number {
    var h: number = 0;
    for (var i = 0; i < str.length; i++) {
        h = 31 * h + str.charCodeAt(i);
    }
    return h & 0xFFFFFFFF
}

export function emptyComment( username: string ) : s.Comment {

    var apost : s.Comment = {
        id : 0,
        title : "",
        theText: "",
        likes: 0,
        retweets : [],
        comments: [] ,
        by : username,
        parent: ""
    }
    return apost
}

export function makeEmptyCard( username: string ) : s.Post {

    var apost : s.Post = {
        id : 0,
        title : "",
        theText: "",
        likes: 0,
        retweets : [],
        comments: [] ,
        by : username
    }
    return apost
}
