

import React, { FC, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
//import Button from '@material-ui/core/Button';

import SimpleTabs from './SimpleTabs'
import FriendTabs from './FriendTabs'
import Header from './Header'

//import { unstable_createMuiStrictModeTheme as createMuiTheme } from '@material-ui/core';


import * as tok from "./TokenScreen"
import { Typography } from '@material-ui/core';
//import * as login from "./Login"
//import * as app from "../App"

export type ProfileProps = {
  // setAppHasPassword: (pass: login.State) => any,
  tokenState: tok.State // has the token and the host 
  username: string // to identify which context to send it to
  hasHeader: boolean
}


const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    root: {
      flexGrow: 1,
      minWidth : theme.spacing(16),
    },
    xxxpaper: {
      padding: 66, // theme.spacing(30),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },

    avatar: {
      width: theme.spacing(16),
      height: theme.spacing(16),
    },

    leftDivTop: {
      width: "98%",
      height: theme.spacing(50) ,
      minWidth : 200,
      borderRadius : 16
    },
    
    leftDivBot: {
      width: "98%",
      height: theme.spacing(50) ,
      minWidth : theme.spacing(16),
      borderRadius : 16
    },
    
    rightDiv: {
      width: "98%",
      height: theme.spacing(100),
      minWidth : theme.spacing(16),
      borderRadius : 16
    },

  })
);


export const ProfileMain: FC<ProfileProps> = (props: ProfileProps) => {

  const classes = useStyles();

  //  <Header title={ profileName + " Profile Page."}  />
  var was = (
    <>

      <Grid container spacing={0}>

        <Grid item xs={4} >
          <Avatar alt="Example Alt" src="http://loremflickr.com/300/200" className={classes.avatar} />
          <Paper >About Me:</Paper>
          <Paper >
            { getAbout() }
          </Paper>
        </Grid>

        <Grid item xs={8}>
          <SimpleTabs username={props.username} ></SimpleTabs>
        </Grid>

      </Grid>

    </>
  );

  function getHeader() {
    if ( props.hasHeader === true ){
      return (<Header title={  " Profile Page."} username={props.username} />)
    } 
    return ( <></> )
    
  }

  return (
    <>
      {getHeader()}
      <Grid spacing={0} container className={classes.root} >

        <Grid item xs={4}  >

        <Paper className={classes.leftDivTop}> 
            <Avatar alt="Example Alt" src="http://loremflickr.com/300/200" className={classes.avatar} />
            <Typography>
            about me: about me:about me: about me:about me: about me:about me: about me:about me: about me:
            about me: about me:about me: about me:about me: about me:about me: about me:about me: about me:
            about me: about me:about me: about me:about me: about me:about me: about me:about me: about me:
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

function getAbout () {
  var str = "bone. Airport Gaggenau Lufthansa remarkable soft power finest the best Marylebone wardrobe first-class Muji iz"
  str += "Sed illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
  str += "Sed illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
  str += "Sed illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
  return str
}


export default ProfileMain;