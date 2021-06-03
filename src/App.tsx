
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
import { ReactElement, FC, useState } from "react";
//import Dialog from '@material-ui/core/Dialog';
import { unstable_createMuiStrictModeTheme } from '@material-ui/core/styles'; // makeStyles,

import * as util from "./server/Util"
 
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
// or these?
// xs: 0,
// sm: 600,
// md: 960,
// lg: 1280,
// xl: 1920,


interface Props {
}

export const App: FC<Props> = (props: Props): ReactElement => {

  const [initialized, setInitialized] = useState(false);
  const [sequence, SetSequence] = useState(0);

  apputil.bootSequence( ( finished: boolean ) => {
     if ( finished ){
       setInitialized(true)
     } else {
      SetSequence(sequence+1)
     }
  })

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
        <div style={{ display: 'flex', textAlign: 'center', alignItems: "center", justifyContent: "center"}}> 
        <div>{sequence}</div>
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
