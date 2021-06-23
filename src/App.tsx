
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
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
//import Dialog from '@material-ui/core/Dialog';
import { unstable_createMuiStrictModeTheme } from '@material-ui/core/styles'; // makeStyles,
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Avatar from '@material-ui/core/Avatar';

import Header from './components/Header'

import * as util from "./gotohere/knotservice/Util"

import * as apputil from "./AppUtil"

import * as profile from "./components/ProfileMain"

import SimpleTabs from './components/SimpleTabs'
import GeneralInfoLayout from './dialogs/General'
import FriendTabs from './components/FriendTabs'

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {

      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      minHeight: "100%"

    },
    paperLeft: {

      padding: theme.spacing(2),
      textAlign: 'center',//'left',
      color: theme.palette.text.secondary,

    },
    avatar: {
      flexGrow: 1,
      width: 75,// theme.spacing(window.innerWidth * 16 / 450),
      height: 75, //theme.spacing(window.innerWidth * 16 / 450),
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
);


interface Props {
}

export const App: FC<Props> = (props: Props): ReactElement => {

  const [initialized, setInitialized] = useState(false);
  const initialSequence: string[] = []
  const [sequence, setSequence] = useState(initialSequence);

  useEffect(() => {
    if (!initialized) {
      console.log("starting apputil.bootSequence sequence=", sequence)
      apputil.bootSequence((done: boolean, why: string) => {
        if (done) {
          setInitialized(true)
        } else {
          var news: string[] = []
          for (const s of sequence) {
            news.push(s)
          }
          news.push(why)
          setSequence(news)
        }
      })
    }
  }, [sequence, initialized])

  console.log("top of APP sequence=", sequence)
  console.log("rendering App window.innerWidth = ", window.innerWidth)

  function getSequenceElements() {
    const items = []
    for (const s of sequence) {
      const item = (
        <div>
          {s}
        </div>
      )
      items.push(item)
    }
    return items
  }

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
          <div>Waiting for server to respond:</div>
          <div> {getSequenceElements()}  </div>
        </div>
      );
    }
  }

  //   <div style={{ display: 'flex', textAlign: 'center', alignItems: "center", justifyContent: "center" }}>
  //   <div>Waiting for server to respond:</div>
  //   aa bb
  // </div>

  const classes = useStyles();

  function getHeader() {
    const profileName = util.getProfileName()
    var ourName = util.getSignedInContext().username
    return (
      <div>
      <Header title={"Viewing " + profileName + " as " + ourName} username={profileName} />
      </div>
    )
  }

  function getGeneralInfo() {
    const profileName = util.getProfileName()
    return (
      <GeneralInfoLayout username={profileName} mobile={true}  cancel={() => { }} editing={false} />
    )
  }

  const profileName = util.getProfileName()

  // TODO: move to ProfileMain
  function makeMobileApp() {

    // two horz bars , vertical split in top bar

    return (
      <>
        {getHeader()}

        <Grid container spacing={0} direction="column"
        >
          <Grid item xs={12} >

            {/* <Paper className={classes.paper}>ad div 1 ad div 1 ad div 1 </Paper> */}
            <Grid container spacing={0} // spacing between items
              direction="row"
              justify="center"
              style={{}}
            >
              <Grid item xs={2} style={{ height: '128'  }}   >
                <Container fixed style={{ padding: "0" ,  minWidth: '100'  ,  height: '100' }} >
                  {/* Avatar here */}
                  {/* <Typography component="div" style={{ backgroundColor: '#cfe8fc' }}  >  ss ff ss ff ss ff ss ff ss ff left column left column left column </Typography> */}
                  <div className={classes.avatar} style={{ padding: "0" ,  width: '100'  ,  height: '100' }} >
                    <Avatar alt="Example Alt" src="http://loremflickr.com/300/200" className={classes.avatar} />
                  </div>
                </Container>
              </Grid>
              <Grid item xs={5} style={{ padding: "0"  }} >
                {/* friends and about mix */}
                {/* <Paper className={classes.paper}>middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 </Paper> */}
                {getGeneralInfo()}
          
              </Grid>
              <Grid item xs={5} style={{ padding: "0"   }} >
                {/* friends and about mix */}
                {/* <Paper className={classes.paper}>middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 </Paper> */}
               
                <FriendTabs username={profileName} ></FriendTabs>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {/* put the main tab pane here  */}
            {/* <Paper className={classes.paper}>ad div 222</Paper> */}
            <SimpleTabs username={util.getProfileName()} ></SimpleTabs>
          </Grid>

        </Grid>
      </>
    );
  }

  if (window.innerWidth <= 600 && initialized) {
    return (
      <>
        {makeMobileApp()}
      </>
    )
  }
  return (
    <>
      {makeApp()}
    </>
  )
}

export default App;
