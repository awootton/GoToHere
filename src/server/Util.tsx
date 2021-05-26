 
// crypto-js/sha256 is banned for life import sha256 from 'crypto-js/sha256';
// also banned import Base64 from 'crypto-js/enc-base64';

import * as nacl from 'tweetnacl-ts'
import * as crypto from 'crypto'
import base64url from 'base64url'

import * as social from './SocialTypes'
import * as config from "./Config"


var theLastOne: social.DateNumber = 0
export function getUniqueId() : social.DateNumber {

    //const startDate = new Date()
    //const start = startDate.getTime()
    const s2 = new Date().getTime()
    var nnn =  ConvertFromMsToDateNumber(s2)
    if (nnn <= theLastOne) {
        // this is when less than 1 ms has elapsed since the last time we were here
        nnn = theLastOne + 1
        // TODO: watch for roll over from 59 to 60 sec which should increment minute
    }
    theLastOne = nnn
    return nnn
}


// the first return is the hostname from **inside** the token
// the 2nd return is a string with an error
export function VerifyToken(myToken :string) : [  string,string ] {

    if ( myToken.length < 200 ) {
        return ["", "token is too short to be a token"]
    }

    console.log("about to verify the token")

    var pos = 0
    var longestPos1 = 0
    var longestPos2 = 0
    for ( var i = 0; i < myToken.length; i ++ ){
        const c = myToken[i]
        if ( (c >= 'a' && c<='z') || (c >= 'A' && c<='Z') || (c >= '0' && c<='9') || c==='-'  || c==='_' || c==='.' ) {
            var newLen = i - pos
            if ( newLen > (longestPos2-longestPos1)){
                longestPos1 = pos
                longestPos2 = i
            }
        } else {
            pos = i + 1
        }
    }
    var justTheToken = myToken.substring(longestPos1,longestPos2+1)
    var parts = justTheToken.split('.')
    if ( parts.length !== 3 ){
        return ["", "Token needs 3 periods"]
    } 
    var middle =  parts[1]
    var unpacked = base64url.decode(middle)

    console.log("verify the token found ", unpacked)

    var obj = JSON.parse(unpacked) || {}
    if ( obj.url !== undefined  ){
        return [obj.url, ""]
    } else {
        console.log("expected  ", unpacked)
    }
    return ["", "expected 'url' in token "]
}

export function getBoxKeyPairFromPassphrase( username: string , phrase: string ): nacl.BoxKeyPair{

    // eg. 
    // var sha256 = new jsSHA('SHA-256', 'TEXT');
    // sha256.update(elem.value);
    // var hash = sha256.getHash("B64");
    // anonymousanonymous becvomes  DehWi0kF8HS3evNlnMwjdGhyvfg-p0jRMwQUXVp-5O4

    const hash = crypto.createHash('sha256');
    hash.write(username+phrase);
    hash.end();
    var hashBytes = hash.digest()

    const seedKeyPair3 = nacl.box_keyPair_fromSecretKey(hashBytes)

    //console.log("getBoxKeyPairFromPassphrase making keypair from ", username, base64url.encode(Buffer.from(seedKeyPair3.publicKey)))

    return seedKeyPair3
}

 
export function getMilliseconds() : number {
    return new Date().getTime()
}

 
export function getSecondsDisplay() : string {
    var ms =  getMilliseconds()
    var tmp = ms
    const millis : number = tmp % 1000
    tmp = Math.floor(tmp / 1000)

    const secs : number = tmp % 60
    
    return ":" + secs + "." + millis
}


export function getCurrentDateNumber() : number {
    var millis = getMilliseconds()
    return ConvertFromMsToDateNumber(millis)
}

// export function getCurrentDateString() : string {
//     var millis = getMilliseconds()
//     return ConvertFromMsToDateString(millis)
// }

// FIXME: atw use crypto.randomBytes(size[, callback]) and convert to b64
export function randomString(len:number) {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
}

export type Context = {
    username: string  // the username and password go together
    password: string  // 
    // usually username and profileNameFromApp will match.
    // sometimes from a topic when messages received
    profileNameFromApp: string   // this is from the url, on the server it's == username 

    tokenFromApp: string
    serverPubKeyFromApp: string

    initialized: boolean

    ourPublicKey: Buffer
    ourSecretKey: Buffer
    profileHash: string
    serversPubKey: Buffer

    config?: config.ServerConfigItem
}
export const emptyContext = {
    username: "",
    password: "",
    profileNameFromApp: "",
    tokenFromApp: "",
    serverPubKeyFromApp: "",

    initialized: false,

    ourPublicKey: Buffer.from(""),
    ourSecretKey: Buffer.from(""),
    profileHash: "", // starts with = and has exactly 43 following
    serversPubKey: Buffer.from(""),// as obtained by TokenScreen using profileName, client
}

// not public
var contexts: Context[] = []
contexts.push(emptyContext)
var currentIndex = 0

export function getCurrentContext(): Context {
    var cx = contexts[currentIndex]
    initContext(cx)
    return cx
}

export function getMatchingNamedContext(username: string): Context {
    // FIXME: use a map
    var found = contexts[currentIndex] // a bad default 
    contexts.forEach(context => {
        initContext(context)
        if (context.username === username) {
            found = context
        }
    });
    return found
}

export function getMatchingTopicContext( hashedtopic: string): Context {
    // FIXME: use a map
    var found = contexts[currentIndex] // a bad default 
    contexts.forEach(context => {
        initContext(context)
        if (context.profileHash === hashedtopic) {
            found = context
        }
    });
    return found
}

// used by logging
export function getTopicName( topic: string ) : string {
    if ( ! topic.startsWith("=")) {
        return topic
    }
    return getMatchingTopicContext(topic).username
}

// pubkToName is useful for logging
export function getPubkToName( pubk: Buffer ) : string {
     // FIXME: use a map
    for ( var i = 0 ; i < contexts.length; i ++ ){
        const context = contexts[i]
        initContext(context)
        //const pubk64 = toBase64Url(pubk)
        //const ourPublicKey64 = toBase64Url(context.ourPublicKey)
        if (context.ourPublicKey === pubk) {
            return context.username
        }
    }
    return toBase64Url(pubk)
}


export function getMatchingContext(topic: string): Context {
    // FIXME: use a map
    var found = contexts[currentIndex] // a bad default 
    var wasFound = false
    contexts.forEach(context => {
        initContext(context)
        if (context.profileHash === topic) {
            found = context
            wasFound = true
        }
    });
    if ( ! wasFound ){
        console.log("ERROR context not found for topic ", topic, contexts )
    }
    return found
}


export function setCurrentIndex(i: number) {
    currentIndex = i
}

export function cleanContexts() {
    contexts = []
    currentIndex = 0
}

export function pushContext(context: Context) {
    contexts.push(context)
}

export function initContext(context: Context) {
    if (context.initialized) {
        return
    }
    const keypair: nacl.BoxKeyPair = getBoxKeyPairFromPassphrase(context.username, context.password)
    context.ourPublicKey = Buffer.from(keypair.publicKey)
    context.ourSecretKey = Buffer.from(keypair.secretKey)
    context.profileHash = "=" + KnotNameHash(context.profileNameFromApp)
    context.serversPubKey = fromBase64Url(context.serverPubKeyFromApp)
    context.initialized = true
}
export function SetUsernameFromApp(str: string) {
    contexts[currentIndex].username = str
}
export function SetPasswordFromApp(str: string) {
    contexts[currentIndex].password = str
}
export function SetProfileNameFromApp(str: string) {
    contexts[currentIndex].profileNameFromApp = str
}
export function SetTokenFromApp(str: string) {
    contexts[currentIndex].tokenFromApp = str
}

export function SetServerPubKeyFromApp(str: string) {
    contexts[currentIndex].serverPubKeyFromApp = str
}

// base64 convert base64 encode base64
export function toBase64Url(buf: Uint8Array): string {
    const buffer = Buffer.from(buf)
    return base64url.encode(buffer)
}

export function fromBase64Url(str: string): Buffer {
    var buf: Buffer = Buffer.from(base64url.decode(str))
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


export function KnotNameHash(name: string): string {
    //var result: Uint8Array

    //var enc = new TextEncoder();
    //result = enc.encode(name)

    //const hashDigest = sha256(name);
   // var tmp = Base64.stringify(hashDigest);

   const hash = crypto.createHash('sha256') 
   hash.write(name) 
   hash.end() 
   var  hbytes = hash.digest()
   var tmp = base64url.encode(hbytes).substring(0,32)
    return tmp
}

// deprecate me
// export function xxxxxConvertFromMsToDateString( millis : number ) : string{
//     const startDate = new Date(millis)
//     var date = startDate.getDate(); //returns date (1 to 31) you can getUTCDate() for UTC date
//     var month = startDate.getMonth() + 1 ; // returns 1 less than month count since it starts from 0
//     var year = startDate.getFullYear(); //returns year 
//     year = year % 100
//     var hours = startDate.getHours();
//     var minutes = startDate.getMinutes();
//     var seconds = startDate.getSeconds();
//     millis = millis % 1000
//     var result = year + ZeroPadLeft2(month) + ZeroPadLeft2(date) + ZeroPadLeft2(hours) + ZeroPadLeft2(minutes) + ZeroPadLeft2(seconds) + millis

//     return result
//}

export function ConvertFromMsToDateNumber( millis : number ) : social.DateNumber{
    const startDate = new Date(millis)
    var date = startDate.getDate(); //returns date (1 to 31) you can getUTCDate() for UTC date
    var month = startDate.getMonth() + 1 ; // returns 1 less than month count since it starts from 0
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

export function DateFromDateNumber ( dn : social.DateNumber ) : Date  {

    var tmp = dn
    const millis : number = tmp % 1000
    tmp = Math.floor(tmp / 1000)

    const secs : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const mins : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const hours : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const day : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const month : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const year : number = tmp % 100
    //tmp = tmp / 100


    var res : Date = new Date()
    res.setMilliseconds(millis)
    res.setSeconds(secs)
    res.setMinutes(mins)
    res.setHours(hours)
    res.setFullYear(2000 + year, month,day)
    // does it know it's supposed to be in gmt ?
    return res
}

export function FormatDateNumber ( dn : social.DateNumber ) : string  { 
    //var date: Date = DateFromDateNumber(dn)

    var tmp = dn
    //const millis : number = tmp % 1000
    tmp = Math.floor(tmp / 1000)

    //const secs : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const mins : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const hours : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const day : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const month : number = tmp % 100
    tmp = Math.floor(tmp / 100)

    const year : number = tmp % 100
    //tmp = tmp / 100

    return "" + month + "/" + day + "/" + year + " " + hours + ":" + mins 
  
    //return "" + date

}

// ZeroPadLeft2 adds '0' on the left, as needed, to make the result have 2 length === 2
export function ZeroPadLeft2( sss : (number|string) ) : string {
    var tmp = "00"+sss
    var x = tmp.length
    tmp = tmp.substr(x-2,x-1)
    return tmp
}

// ZeroPadLeft3 adds '0' on the left, as needed, to make the result have 2 length === 3
export function ZeroPadLeft3( sss : (number|string) ) : string {
    var tmp = "000"+sss
    var x = tmp.length
    tmp = tmp.substr(x-3,x-1)
    return tmp
}


