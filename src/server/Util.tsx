 
// crypto-js/sha256 is banned for life import sha256 from 'crypto-js/sha256';
// also banned import Base64 from 'crypto-js/enc-base64';

import * as nacl from 'tweetnacl-ts'
import * as crypto from 'crypto'

import * as social from './SocialTypes'

import base64url from 'base64url';

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

    console.log("getBoxKeyPairFromPassphrase making keypair from ", username, base64url.encode(Buffer.from(seedKeyPair3.publicKey)))

    return seedKeyPair3
}

export function getMilliseconds() : number {
    return new Date().getTime()
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


var theLastOne: social.DateNumber = 0
export function getUniqueId() : social.DateNumber {

    const startDate = new Date()
    const start = startDate.getTime()
    var nnn =  ConvertFromMsToDateNumber(start)
    if (nnn <= theLastOne) {
        // this is when less than 1 ms has elapsed since the last time we were here
        nnn = theLastOne + 1
        // TODO: watch for roll over from 59 to 60 sec which should increment minute
    }
    theLastOne = nnn
    return nnn
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

    tmp = tmp.replace("/","_")
    tmp = tmp.replace("+","-")
    return tmp
}

// deprecate me
export function xxxxxConvertFromMsToDateString( millis : number ) : string{
    const startDate = new Date(millis)
    var date = startDate.getDate(); //returns date (1 to 31) you can getUTCDate() for UTC date
    var month = startDate.getMonth() + 1 ; // returns 1 less than month count since it starts from 0
    var year = startDate.getFullYear(); //returns year 
    year = year % 100
    var hours = startDate.getHours();
    var minutes = startDate.getMinutes();
    var seconds = startDate.getSeconds();
    millis = millis % 1000
    var result = year + ZeroPadLeft2(month) + ZeroPadLeft2(date) + ZeroPadLeft2(hours) + ZeroPadLeft2(minutes) + ZeroPadLeft2(seconds) + millis

    return result
}

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