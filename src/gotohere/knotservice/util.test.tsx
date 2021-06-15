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

//import React from 'react';
//import { render, screen } from '@testing-library/react';
//import App from './App';

import { ZeroPadLeft2 } from './Util'
// import * as s from './SocialTypes'

import { ZeroPadLeft3, ConvertFromMsToDateNumber } from './Util'

import * as util from "./Util"

// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/gotohere/knotservice/util.test

const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

var b64reverse : Buffer = Buffer.alloc(128)
for ( var i=0;  i < b64reverse.length ; i ++  ){
  b64reverse[i] = 0
}
for ( var i=0;  i < b64ch.length ; i ++  ){
  var tmp = b64ch.charCodeAt(i)
  b64reverse[tmp] = i
}

function encode( bytes : Uint8Array ) : string {
  var dest = Buffer.alloc( Math.floor(bytes.length * 4 / 3 ) + 1 )
  
  var s = 0
  for ( var i=0;  i < bytes.length ;  ){

    const zero = bytes[i]
    i += 1
    const one = i<bytes.length ?  bytes[i] : 0
    i += 1
    const two = i<bytes.length ?  bytes[i] : 0
    i += 1

    var sum = 0

    var tmp = zero >> 2
    sum = b64ch.charCodeAt(tmp)
    dest[s++] = sum

    tmp = ((zero & 3) << 4)+ (one >> 4)
    sum = b64ch.charCodeAt(tmp)
    dest[s++] = sum

    tmp =  ((one & 0x0F) << 2) + (two >> 6)
    sum = b64ch.charCodeAt(tmp)
    dest[s++] = sum

    tmp =  (two & 0x03F) 
    sum = b64ch.charCodeAt(tmp)
    dest[s++] = sum
  }
  return dest.toString('utf8')
}

function decode( str : string ) : Buffer {
  var dest = Buffer.alloc( Math.floor(str.length * 3 / 4 ) )

  return dest
}

// var charsOf64 : number[] = []
// for ( var c = 'A' ; c < )


//test('stupid base64url', () => {
function testb64() {

  console.log("just log stupid base64url")

  for ( var len = 1; len < 10; len++ ){
    const test = new Uint8Array(len)
    for ( var i=0;  i < test.length ; i ++){
      test[i] = i + 7
    }
    const str = encode(test)
    console.log("have  ", str)
    console.log("need  ", util.toBase64Url(Buffer.from(test)))
  }
};

testb64()

if ( test === undefined ){
  const test = ( a: string , cb: () => any ) => {
  }
}

// FIXME atw
test('check out some utilities', () => {
 

  const startDate = new Date()
  const start = startDate.getTime()
  console.log(" current millis ", start)

  var date = startDate.getDate(); //returns date (1 to 31) you can getUTCDate() for UTC date
  var month = startDate.getMonth() + 1; // returns 1 less than month count since it starts from 0
  var year = startDate.getFullYear(); //returns year 

  //month = "0" + month

  var hours = startDate.getHours();
  // Minutes part from the timestamp
  var minutes = startDate.getMinutes();
  // Seconds part from the timestamp
  var seconds = startDate.getSeconds();

  var millis = start % 1000
  console.log(" day month year ", ZeroPadLeft2(date), ZeroPadLeft2(month), year) // the day of month
  console.log(" hours minutes seconds ms ", ZeroPadLeft2(hours), ZeroPadLeft2(minutes), ZeroPadLeft2(seconds), ZeroPadLeft3(millis)) // the day of month

  var got = "" + ConvertFromMsToDateNumber(start)
  console.log(" ConvertFromMsToDateNums makes ", got)

  var gotn = util.ConvertFromMsToDateNumber(start)
  console.log(" ConvertFromMsToDateNumber makes ", gotn)

});

