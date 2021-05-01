
 
import base64url from 'base64url';

import * as nacl from 'tweetnacl-ts'

//import sha256 from 'crypto-js/sha256';

import * as util from "../server/Util"

import * as config from "../server/Config"


// to run this:
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/components/CryptoUtil

export type Context = {
    usernameFromApp:string  
    passwordFromApp:string  
    profileNameFromApp:string  
    tokenFromApp:string 
    serverPubKeyFromApp: string

    initialized: boolean

    ourPublicKey: Buffer
    ourSecretKey: Buffer
    profileHash: string
    serversPubKey: Buffer

    config?: config.ServerConfigItem
}
export const emptyContext = {
    usernameFromApp:""  ,
    passwordFromApp:""  ,
    profileNameFromApp:""  ,
    tokenFromApp:"" ,
    serverPubKeyFromApp:"",

    initialized: false,

    ourPublicKey: Buffer.from(""),
    ourSecretKey: Buffer.from(""),
    profileHash: "", // starts with = and has exactly 43 following
    serversPubKey: Buffer.from(""),// as obtained by TokenScreen using profileName
}

export var contexts : Context[] = []
contexts.push(emptyContext)
export var currentIndex = 0

export function getCurrentContext(): Context {
    return contexts[currentIndex]
}

export function getMatchingContext( topic: string ): Context {
    // FIXME: use a map
    var found = contexts[currentIndex] // a bad default 
    contexts.forEach(context => {
        initContext(context)
        if (context.profileHash == topic) {
            found = context
        }
    });
    return found
}


export function setCurrentIndex( i : number)   {
        currentIndex = i
}

export function cleanContexts() {
    contexts = []
    currentIndex = 0
}

export function initContext( context: Context ){
    if ( context.initialized){
        return
    }
    const keypair: nacl.BoxKeyPair = util.getBoxKeyPairFromPassphrase(context.usernameFromApp, context.passwordFromApp)
    context.ourPublicKey = Buffer.from(keypair.publicKey)
    context.ourSecretKey = Buffer.from(keypair.secretKey)
    context.profileHash =  "=" + util.KnotNameHash(context.profileNameFromApp)
    context.serversPubKey = fromBase64Url(context.serverPubKeyFromApp)
    context.initialized = true
}
export function SetUsernameFromApp( str : string ){
    contexts[currentIndex].usernameFromApp = str
}
export function SetPasswordFromApp( str : string ){
    contexts[currentIndex].passwordFromApp = str
}
export function SetProfileNameFromApp( str : string ){
    contexts[currentIndex].profileNameFromApp = str
}
export function SetTokenFromApp( str : string ){
    contexts[currentIndex].tokenFromApp = str
}

export function SetServerPubKeyFromApp( str : string ){
    contexts[currentIndex].serverPubKeyFromApp = str
}


// not exported or referenced anywhere by anyone:
// ts-ignore: Unreachable code error
// typescript-eslint/no-unused-vars
// @typescript-eslint/no-unused-vars
//export var thisIsWhereWeAreKeepingThePrivateKey: Uint8Array = new Uint8Array()
// it can be set but never read.

// export var thePublicKey: Uint8Array = new Uint8Array()
// export var thePublicKey64: string = ""

// // we need this for ping 
// // I think we'll not box and unbox proxy messages. or ping
// export var theirPublicKey64: string = ""
// export var theirPublicKey: Buffer = Buffer.from("")

// please pass in base64
// export function xxxSetPrivateKey(key: string) {

//     key = key.trim()
//     var bbb = base64url.toBuffer(key)
//     thisIsWhereWeAreKeepingThePrivateKey = bbb

//     // get the public key
// }

// export function SetPrivatePassphraseXX(userName: string, phrase: string) {

//     const keypair: nacl.BoxKeyPair = util.getBoxKeyPairFromPassphrase(userName, phrase)

//     // typescript-eslint/no-unused-vars
//     // @typescript-eslint/no-unused-vars
//     thisIsWhereWeAreKeepingThePrivateKey = keypair.secretKey

//     //var b64 = base64url.encode(Buffer.from(keypair.publicKey))

//     // thePublicKey64 = b64
//     // thePublicKey = keypair.publicKey
// }
// export function GetPublicKey(): string {
//     return thePublicKey64
// }

// base64 convert base64 encode base64
export function toBase64Url(buf: Uint8Array): string {
    const buffer = Buffer.from(buf)
    return base64url.encode(buffer)
}

export function fromBase64Url(str:string) : Buffer {
    var buf:Buffer = Buffer.from(base64url.decode(str))
    return buf
}

export function testSomeStuff() {
  //  SetPrivatePassphrase("anonymous", "anonymous")

    // send from anon to alice
    var aliceUser = "alice_vociferous_mcgrath"
    var alicePass = "join_red_this_string_plain_does_quart_simple_buy_line_fun_look_original_deal"
    const aliceKeyPair: nacl.BoxKeyPair = util.getBoxKeyPairFromPassphrase(aliceUser, alicePass)

    var anonUser = "anonymous"
    var anonPass = "anonymous"
    const anonKeyPair: nacl.BoxKeyPair = util.getBoxKeyPairFromPassphrase(anonUser, anonPass)

    var message = Buffer.from("send help quick DehWi0kF8H")

    var nonce = Buffer.from(util.randomString(24))

    console.log(" alice public ", toBase64Url(aliceKeyPair.publicKey) )
    console.log(" alice secret ", toBase64Url(aliceKeyPair.secretKey))
    console.log(" anon public ", toBase64Url(anonKeyPair.publicKey))
    console.log(" anoon secret ", toBase64Url(anonKeyPair.secretKey))

    // from anoon to alice

    var boxed = BoxItItUp(message, nonce, Buffer.from(aliceKeyPair.publicKey),
        Buffer.from(anonKeyPair.secretKey))

    console.log("length before boxing ", message.length)
    console.log("length after boxing ", boxed.length)

    // the same nonce 
    // we are alice now
    var unboxed = UnBoxIt(boxed, nonce, Buffer.from(anonKeyPair.publicKey),
        Buffer.from(aliceKeyPair.secretKey))

    var str: string = unboxed.toString('utf8')
    console.log("we have unboxed: ", str)  // should be   send help quick DehWi0kF8H             
}

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

// testSomeStuff()

// (Buffer.from(keyPair.publicKey)).toString('hex')  tohex to hex from hex fromhex

// 
// console.log(buf.toString('hex'));
// // Prints: 68656c6c6f20776f726c64
// console.log(buf.toString('base64url'));
// // Prints: aGVsbG8gd29ybGQ=

//Buffer.from('1634', 'hex');
// Prints <Buffer 16 34>, all data represented.
