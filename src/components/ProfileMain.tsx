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

import React, { FC } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
//import Button from '@material-ui/core/Button';

import SimpleTabs from './SimpleTabs'
import FriendTabs from './FriendTabs'
import Header from './Header'

import GeneralInfoLayout from '../dialogs/General'

import * as util from '../gotohere/knotservice/Util'

//import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core';
//import * as tok from "./TokenScreen"

import { Typography } from '@material-ui/core';


//import { updateWhile } from 'typescript';
//import * as login from "./Login"
//import * as app from "../App"

export type ProfileProps = {
  // setAppHasPassword: (pass: login.State) => any,
  // tokenState: tok.State // has the token and the host 
  username: string // to identify which context to send it to
  hasHeader: boolean
}


const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    root: {
      flexGrow: 1,
      minWidth: theme.spacing(16),
    },

    avatar: {
      flexGrow: 1,
      width: 200,// theme.spacing(window.innerWidth * 16 / 450),
      height: 200, //theme.spacing(window.innerWidth * 16 / 450),
      justifyContent: 'center',
      alignItems: 'center',
    },

    leftDivTop: {
      width: "100%",
      height: theme.spacing(50),
      minWidth: 200,
      // borderRadius : 16
    },

    leftDivBot: {
      width: "100%",
      height: theme.spacing(50),
      minWidth: theme.spacing(16),
      // borderRadius : 16
    },

    rightDiv: {
      width: "100%",
      height: theme.spacing(100),
      minWidth: theme.spacing(16),
      //    borderRadius : 16
    },

  })
);


export const ProfileMain: FC<ProfileProps> = (props: ProfileProps) => {

  const classes = useStyles();

  //  <Header title={ profileName + " Profile Page."}  />
  // var was = (
  //   <>

  //     <Grid container spacing={0}>

  //       <Grid item xs={4} >
  //         <Avatar alt="Example Alt" src="http://loremflickr.com/300/200" className={classes.avatar} />
  //         <Paper >About Me:</Paper>
  //         <Paper >
  //           { getAbout() }
  //         </Paper>
  //       </Grid>

  //       <Grid item xs={8}>
  //         <SimpleTabs username={props.username} ></SimpleTabs>
  //       </Grid>

  //     </Grid>

  //   </>
  // );

  function getHeader() {
    if (props.hasHeader === true) {
      var ourName = util.getSignedInContext().username
      return (<Header title={"Viewing " + props.username + " as " + ourName} username={props.username} />)
    }
    return (<></>)

  }

  function getGeneralInfo() {
    return (
      <GeneralInfoLayout username={props.username} mobile={false} cancel={() => { }} editing={false} />
    )
  }

  return (
    <>
      {getHeader()}
      <Grid spacing={0} container className={classes.root} >

        <Grid item xs={4}  >

          <Paper className={classes.leftDivTop}>
            <div className={classes.avatar}>
              <Avatar alt="Example Alt" src="http://loremflickr.com/300/200" className={classes.avatar} />
            </div>
            <Typography component="div" >
              {getGeneralInfo()}
            </Typography>
          </Paper>

          <Paper className={classes.leftDivBot}>

            <FriendTabs username={props.username} ></FriendTabs>

          </Paper>

        </Grid>

        <Grid item xs={8}>

          <Paper className={classes.rightDiv} >
            <SimpleTabs username={props.username} ></SimpleTabs>
          </Paper>

        </Grid>

      </Grid>

    </>
  );

}

export default ProfileMain;