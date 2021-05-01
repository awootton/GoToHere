//import React from 'react';
//import { render, screen } from '@testing-library/react';
//import App from './App';

import { ZeroPadLeft2 } from './Util'
import * as social from './SocialTypes'

import { ZeroPadLeft3, ConvertFromMsToDateString } from './Util'

import * as util from "./Util"

// FIXME atw
test('check out some utilities', () => {
  console.log("just log to console")

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

  var got = ConvertFromMsToDateString(start)
  console.log(" ConvertFromMsToDateNums makes ", got)

  var gotn = util.ConvertFromMsToDateNumber(start)
  console.log(" ConvertFromMsToDateNumber makes ", gotn)

});

