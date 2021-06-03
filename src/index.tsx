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

// should we pushContext with profileContext() here

import * as pingapi from "./api1/Ping"
import * as util from "./server/Util"

import GoToHereApp from "./sites/GoToHere"
import KnotFreeApp from "./sites/KnotFree"

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
