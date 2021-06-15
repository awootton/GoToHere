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

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import ReactGA from 'react-ga';

// should we pushContext with profileContext() here

import * as util from "./gotohere/knotservice/Util"

import GoToHereApp from "./sites/GoToHere"
import KnotFreeApp from "./sites/KnotFree"

//ReactGA.initialize('UA-62339543-1');
ReactGA.initialize('UA-198012996-1', {
  //debug: true,
  titleCase: false,
  gaOptions: {
    //userId: '123',
    siteSpeedSampleRate: 100
  }
} );

ReactGA.pageview(window.location.pathname + window.location.search + util.getProfileName());

function getApp() {
  console.log("index getApp starting ", util.getProfileName() )
  if (util.getProfileName() === "") {
    const urlname = util.getServerName()
    if (urlname.startsWith("goto")) {
      return (
        <GoToHereApp/>
      )
    } else if (urlname.startsWith("knot")) {
      return (
        <KnotFreeApp/>
      )
    } else {
      return (<App />)
    }
  } else {
    return (<App />)
  }
}

ReactDOM.render(
  <React.StrictMode>
    {getApp()}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
