import  { useState } from 'react';

import './App.css';
import Header from './components/Header';
import { createMuiTheme, createStyles } from '@material-ui/core/styles'; // makeStyles,
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import SimpleTabs from './components/TabPanel'

 import * as login from './components/Login';
import * as util from "./server/Util" 
import * as tok from "./components/TokenScreen"
import * as c_util from "./components/CryptoUtil"
import * as getpostsapi from "./api1/GetPosts"
import * as pingapi from "./api1/Ping"
import * as social from "./server/SocialTypes"

// eslint-disable-next-line 
export const theme = createMuiTheme({
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

const appStyles = (theme: any) => createStyles({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: 66, // theme.spacing(30),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
});

// Theme-dependent styles
// const styles = ({ palette, spacing }: Theme) => createStyles({
//   root: {
//     display: 'flex',
//     flexDirection: 'column',
//     padding: spacing.unit,
//     backgroundColor: palette.background.default,
//     color: palette.primary.main,
//   },
// });

//export var isMqttStarted: boolean = false

//export var globalAppTokenState: tok.TokenState = tok.initialTokenState // token and serverName
//export var globalAppLoginState: login.State = login.initialState // username password 

export function App() {

  const [hasPassword, setIsPassVerified] = useState( login.initialState )//globalAppLoginState ); // is Login State
  
  const [hasToken, setHasToken] = useState(  tok.initialTokenState ); // is TokenState

  //console.log("in App returning page pub key = " , globalAppTokenState.serverPublicKeyB64 )
  console.log("in App returning page pub key2 = " , hasToken.serverPublicKeyB64 )
  //console.log("c ", process.env.NODE_ENV) // eg. development

  const someAppStypes = appStyles(theme)
  const paperStrStyles = someAppStypes.paper.toString()

  console.log("typeof someAppStypes ", someAppStypes)
  console.log("paperStrStyles ", paperStrStyles)


  if ( hasToken.theToken === undefined || hasToken.theToken.length === 0) {
    //console.log("in App about to render TokenScreen")
    return (
      <>
        <tok.TokenScreen setAppHasToken={setAppHasToken} ></tok.TokenScreen>
        <div hidden >
          ssss
      </div>
      </>
    )
  }
  else if ( hasPassword.isVerified === false) {
    //
    console.log("in App TokenScreen finished ", hasToken.theToken)
    //
    console.log("in App about to render MakeLogin", hasToken.serverPublicKeyB64)
    //
    //
    return login.MakeLogin( hasToken , setAppHasPassword)
    //
  } else { 
    //
    //
    console.log("in App about to render App") 
    // now that we have have the username and pass and token.
    // export var usernameFromApp:string = "none"
    // export var passwordFromApp:string = "none"
    // export var profileNameFromApp:string = "none"
    // export var tokenFromApp:string = "none"
    //  c_util.SetUsernameFromApp(hasPassword.username)
    //c_util.profileNameFromApp = getProfileName()

    return makeApp()
    //
  }

  // Having weird side effects in a call back is weird TODO: find better way
  function setAppHasToken( tokState : tok.TokenState ) {
    console.log("App localTokenHook setting token ", tokState)
    console.log("   current pass state ", hasPassword)

    // if (tokState.serverPublicKeyB64.length === 0 && globalAppTokenState.serverPublicKeyB64.length ) {
    //   tokState.serverPublicKeyB64 = globalAppTokenState.serverPublicKeyB64
    // }
    // globalAppTokenState = tokState
    setHasToken(tokState)// force refresh
  }

  // Having weird side effects in a call back is weird TODO: find better way
  function setAppHasPassword(passState: login.State) {
    console.log("App localLoginHook has passState  ", passState)
  
    if (passState.helperText === "reset the token" ){ // worst hack ever
      console.log("App localLoginHook RESETTING the token   ", passState)
      //globalAppTokenState =  { ...globalAppTokenState, theToken : ""}
      var newState =  { ...hasToken, 
        theToken : ""}
      setHasToken( newState )
    }
    var newPassState : login.State = {
      ...passState,
      counter : hasPassword.counter + 1
    }
    if ( newPassState.isVerified ){
      c_util.SetUsernameFromApp(newPassState.username)
      c_util.SetPasswordFromApp(newPassState.password )
      c_util.SetProfileNameFromApp(getProfileName() )
      c_util.SetTokenFromApp(  hasToken.theToken )
      c_util.SetServerPubKeyFromApp( hasToken.serverPublicKeyB64)
      console.log("App sending values to crypto   ", passState)
      // TODO: app should forget the password now
      // newPassState.password = "erased"
    }
    setIsPassVerified(newPassState)
  }

  function pushMeAction2() {
  
    console.log("pushed2")

    const receiver: pingapi.PingReceiver = (cmd: pingapi.PingCmd, error: any)  => {
        console.log("receiver: pingapi.PingReceiver ", cmd, error)
    }
    pingapi.IssueTheCommand( receiver )
}


  function pushMeAction() {
  
      console.log("pushed")

      //
      const top = "" + util.getCurrentDateNumber()
      //const fold = "data/alice/lists/posts/" // fixme
      const fold = "lists/posts/" // the receiver (the server) will figure out the first part
      const count = 4
      const old = ""

      getpostsapi.IssueTheCommand(top, fold, count, old,   ( posts:social.Post[] , error:any) => {
        console.log("just got back from issueTheCommand with ", posts)
    })

      // const cmd: GetPostsCmd = {// for a demo
      //   cmd: "getPosts",
      //   top: util.getCurrentDateString(),
      //   fold: "data/alice/lists/posts/", // FIXME: client doesn't know 'alice/' just knows lists/posts/
      //   count: 4,
      //   old: ""
      // }
      // const jsonstr = JSON.stringify(cmd)
      // // topic:string , jsonstr: string, cb: ( data:Uint8Array, error: any ) => {} ) {
      // console.log("jsonstr of cmd ", jsonstr,)
      // var destTopic = hasPassword.username

      // var wr: WaitingRequest =  getpostsapi

      // api1.SendApiCommandOut(wr,destTopic, cmd.cmd, jsonstr, (data: Uint8Array, error: any) => {
      //   var strdata = new TextDecoder().decode(data)
      //   console.log("App is  back from SendApiCommandOut with data ", strdata)
      // })
  }

  function makeApp() {

    const profileName = getProfileName()

    return (
      <>
        <Header title={ profileName + " Profile Page."}  />
        <Grid container spacing={0}>
          <Grid item xs={4} >
            {/* <Image src="http://loremflickr.com/300/200" /> */}
            <img src="http://loremflickr.com/300/200" width="250" alt="sample here" />
            <Paper className={paperStrStyles} >About Me:</Paper>
            <Paper >
              "Sed illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
             
            </Paper>
            <Button onClick={pushMeAction} >push me</Button>
            <Button onClick={pushMeAction2} >push me2</Button>
          </Grid>
          <Grid item xs={8}>
            {/* <Paper className={styles().paper}>  className={someAppStypes.paper}
          " sunt in culpa qui officia deserunt mollit anim id est laborum."
        </Paper> */}
            <SimpleTabs></SimpleTabs>
          </Grid>
        </Grid>
       

      </>
    );
  }
}

export default App;

// export function startMqtt() {
//     var server_config: config.ServerConfigList = {
//       token: "dummy",
//       items : []
//   }

//   if (isMqttStarted === false) {
//     //let timerId = 
//     setTimeout(() => {
//       // launch a thread later
//      const isClient = false
//      mqttserver.RunForever(server_config, isClient)
//     }, 100)

//     // we'll set this when it's actuall done in RunForever
//     //isMqttStarted = true
//   }
// }

// what? 
// {/* <Grid item xs={2}>
// <Paper > 
//   "laborum."
//   <div>aaaa</div>
//   <div>bbbb</div>
//    <PostList message="from App"></PostList> 
// </Paper>
// </Grid> */}

// {/* <Button onClick={() => {
//   console.log("pushed")
//   const endpoint = "/api/postslist?oldest=210414044940943&newest=210415164940943"

//   console.log("calling", API + endpoint)
//   const response = fetch(`${API}${endpoint}`);
//   response.then((resp: Response) => {
//     var txtPromise = resp.text()
//     txtPromise.then((ttt: string) => {
//       console.log(" onClick fetch result ", ttt)
//     });
//     console.log(" txtPromise ", txtPromise)
//   });
// }} >push me</Button> */}

// eg alice_vociferous_mcgrath
export function getProfileName(): string {
  var profileName = "unknown"
  var locationhref = window.location.href // eg http://alice_vociferous_mcgrath.knotfree2.com:3000/
  var ind = locationhref.indexOf("//")
  if (ind > 0) {
    locationhref = locationhref.substring(ind + 2)
    var parts = locationhref.split(".")
    if (parts.length <= 0) {
      console.log("how can we have missing parts here?")
    }
    profileName = parts[0]
  }
  return profileName
}

// eg knotfree.net
export function getServerName(): string {
  var serverName = "unknown"
  var locationhref = window.location.href // eg http://alice_vociferous_mcgrath.knotfree2.com:3000/
  var ind = locationhref.indexOf("//")
  if (ind > 0) {
    locationhref = locationhref.substring(ind + 2)
    var parts = locationhref.split(".")
    if (parts.length <= 0) {
      console.log("how can we have missing parts here?")
    }
    serverName = parts[1] + "." + parts[2]
  }
  return serverName
}
