
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


import './App.css';
import { ReactElement, FC, useState, useEffect } from "react";
//import Dialog from '@material-ui/core/Dialog';
import { unstable_createMuiStrictModeTheme } from '@material-ui/core/styles'; // makeStyles,

import * as util from "./gotohere/knotservice/Util"

import * as apputil from "./AppUtil"

import * as profile from "./components/ProfileMain"

// eslint-disable-next-line 
export const theme = unstable_createMuiStrictModeTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})

interface Props {
}

// type okCallback = ( ok: boolean)=> any
// export var LatestCallbackPointer : okCallback |  undefined = undefined

export const App: FC<Props> = (props: Props): ReactElement => {

  const [initialized, setInitialized] = useState(false);
  const [sequence, setSequence] = useState(0);

  useEffect( () => {
    if ( ! initialized ){
      apputil.bootSequence(( done: boolean) => {
        if ( done ){
          setInitialized(true)
        } else {
          setSequence(sequence+1)
        }
      })
    }
   
  } , [sequence, initialized])

  console.log("top of APP sequence=",sequence)

    // apputil.bootSequence((finished: boolean) => {
    //   if (finished) {
    //     console.log("App is initialized")
    //     setTimeout( () => {
    //       console.log("App Incrementing finally")
    //       SetSequence(sequence + 1)
    //       SetInitialized(true)
    //     }, 10)
    //   } else {
    //     console.log("Incrementing APP sequence=",sequence)
    //     SetSequence(sequence + 1)
    //   }
    // })
 

  function makeApp() {

    const profileName = util.getProfileName()

    const hhh = util.KnotNameHash('alice_vociferous_mcgrath')
    console.log("std  hash of  alice_vociferous_mcgrath is ", hhh)

    if (initialized === true) {
      return (
        <>
          <profile.ProfileMain username={profileName} hasHeader={true} ></profile.ProfileMain>
        </>
      );
    } else {
      // todo: add log of boot sequence.
      return (
        <div style={{ display: 'flex', textAlign: 'center', alignItems: "center", justifyContent: "center" }}>
          <div>Waiting for server to respond: {sequence} {initialized} </div>
        </div>
      );
    }
  }

  return (
    <>
      {makeApp()}
    </>
  )
}

export default App;
