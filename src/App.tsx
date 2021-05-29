
import './App.css';
import { ReactElement, FC, useState } from "react";
import Dialog from '@material-ui/core/Dialog';
import { unstable_createMuiStrictModeTheme } from '@material-ui/core/styles'; // makeStyles,

//import * as dialogs from './dialogs/SimpleDialog'

// import Paper from '@material-ui/core/Paper';
// import Grid from '@material-ui/core/Grid';

// import SimpleTabs from './components/SimpleTabs'

import * as login from './components/Login';
import * as util from "./server/Util"
import * as tok from "./components/TokenScreen"
 
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

// const useStyles = (theme: any) => createStyles({
//   root: {
//     flexGrow: 1,
//   },
//   paper: {
//     padding: 16, // theme.spacing(30),
//     textAlign: 'center',
//     color: theme.palette.text.secondary,
//   },
// });

interface Props {
}


//export function App() {
export const App: FC<Props> = (props: Props): ReactElement => {

  const [loginState, setLoginState] = useState(login.initialState)//globalAppLoginState ); // is Login State

  const [tokenState, setTokenState] = useState(tok.initialState); // is TokenState

  const [openTokenScreen, setOpenTokenScreen] = useState(true);
  const [openLoginScreen, setOpenLoginScreen] = useState(false);

  //console.log("in App returning page pub key = " , globalAppTokenState.serverPublicKeyB64 )
  //console.log("in App returning page pub key2 = " , tokenState.serverPublicKeyB64 )
  //console.log("rendering App window.innerWidth = " , window.innerWidth )
  //console.log("c ", process.env.NODE_ENV) // eg. development

  //const someAppStypes = useStyles(theme)
  //const paperStrStyles = someAppStypes.paper.toString()

  //console.log("typeof someAppStypes ", someAppStypes)
  //console.log("paperStrStyles ", paperStrStyles)

  // if ( hasToken.theToken === undefined || hasToken.theToken.length === 0) {
  //   //console.log("in App about to render TokenScreen")
  //   return (
  //     <>
  //       <tok.TokenScreen setAppHasToken={setAppHasToken} ></tok.TokenScreen>
  //       <div hidden >
  //         ssss
  //     </div>
  //     </>
  //   )
  // }
  // else if ( hasPassword.isVerified === false) {
  //   //
  //   console.log("in App TokenScreen finished ", hasToken.theToken)
  //   //
  //   console.log("in App about to render MakeLogin", hasToken.serverPublicKeyB64)
  //   //
  //   //
  //   return login.MakeLogin( hasToken , setAppHasPassword)
  //   //
  // } else { 
  //   //
  //   //
  //   console.log("in App about to render App") 
  //   // now that we have have the username and pass and token.
  //   // export var usernameFromApp:string = "none"
  //   // export var passwordFromApp:string = "none"
  //   // export var profileNameFromApp:string = "none"
  //   // export var tokenFromApp:string = "none"
  //   //  c_util.SetUsernameFromApp(hasPassword.username)
  //   //c_util.profileNameFromApp = getProfileName()

  //   return makeApp()
  //   //
  // }

  // Having weird side effects in a call back is weird TODO: find better way
  function setAppHasToken(tokState: tok.State) {
    console.log("App localTokenHook setting token ", tokState)
    console.log("   current pass state ", loginState)

    // if (tokState.serverPublicKeyB64.length === 0 && globalAppTokenState.serverPublicKeyB64.length ) {
    //   tokState.serverPublicKeyB64 = globalAppTokenState.serverPublicKeyB64
    // }
    // globalAppTokenState = tokState

    if (tokState.isVerified && openTokenScreen) {
      setTokenState(tokState)
      setOpenTokenScreen(false)
      setOpenLoginScreen(true)
    }
  }

  // Having weird side effects in a call back is weird TODO: find better way
  function setAppHasPassword(passState: login.State) {
    console.log("App localLoginHook has passState  ", passState)

    if (passState.helperText === "reset the token") { // worst hack ever
      console.log("App localLoginHook RESETTING the token   ", passState)
      //globalAppTokenState =  { ...globalAppTokenState, theToken : ""}
      var newState = {
        ...tokenState,
        theToken: ""
      }
      setTokenState(newState)
    }
    var newPassState: login.State = {
      ...passState,
      counter: loginState.counter + 1
    }
    if (newPassState.isVerified) {
      // FIXME: new version of login and token
      // util.SetUsernameFromApp(newPassState.username)
      // util.SetPasswordFromApp(newPassState.password)
      // util.SetProfileNameFromApp(util.getProfileName())
      // util.SetTokenFromApp(tokenState.theToken)
      // util.SetKnotServerPubKeyFromApp(tokenState.serverPublicKeyB64)
      console.log("App sending values to crypto   ", passState)
      // TODO: app should forget the password now
      // newPassState.password = "erased"
      setOpenLoginScreen(false)
      setOpenTokenScreen(false)
      setLoginState(newPassState)
    }
  }

  //   function pushMeAction2() {

  //     console.log("pushed2")

  //     const receiver: pingapi.PingReceiver = (cmd: pingapi.PingCmd, error: any)  => {
  //         console.log("receiver: pingapi.PingReceiver ", cmd, error)
  //     }
  //     pingapi.IssueTheCommand( receiver )
  // }


  //   function pushMeAction() {

  //       console.log("pushed")

  //       //
  //       const top = "" + util.getCurrentDateNumber()
  //       //const fold = "data/alice/lists/posts/" // fixme
  //       const fold = "lists/posts/" // the receiver (the server) will figure out the first part
  //       const count = 4
  //       const old = ""

  //       getpostsapi.IssueTheCommand("alice_vociferous_mcgrath",top, fold, count, old,   ( posts:social.Post[] , error:any) => {
  //         console.log("just got back from issueTheCommand with ", posts)
  //     })

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
  //}

  function makeApp() {

    const profileName = util.getProfileName()

    // tokenState = {tokenState}

    const hhh = util.KnotNameHash('alice_vociferous_mcgrath')
    console.log( "std  hash of  alice_vociferous_mcgrath is ", hhh)

    if (openLoginScreen === false && openTokenScreen === false && loginState.isVerified === true) {
      return (
        <>
          <profile.ProfileMain username={profileName} hasHeader={true} ></profile.ProfileMain>
        </>
      );
    } else {
      return (
        <>
        </>
      );
    }
  }

  // force anonymous in login. hack.
  if (loginState.isVerified === false && openLoginScreen) {
    var newLoginState: login.State = {
      ...loginState,
      username: "Anonymous",
      password: "Anonymous",
      isVerified: true
    }
    setAppHasPassword(newLoginState)
  }


  return (
    <>

      {makeApp()}

      <Dialog
        open={openTokenScreen}
        //  fillme={tok.TokenScreen}
        //   title=""
        onClose={(value: any) => { }} // nothing! we don't close here
      >
        <tok.TokenScreen setAppHasToken={setAppHasToken} />
      </Dialog>

      <Dialog
        open={openLoginScreen}
        //    fillme={login.MakeLogin}
        //  title= ""
        onClose={(value: any) => { }} // nothing! we don't close here
      >
        <login.MakeLogin tokenState={tokenState} setAppHasPassword={setAppHasPassword} />
      </Dialog>


    </>
  )

  // function xxxmakeApp() {

  //   const profileName = getProfileName()

  //   // fixme: use ProfileMain
  //   return (
  //     <>
  //       <Header title={ profileName } username = {profileName} />


  //       <Grid container spacing={0}>
  //       <Grid item xs={4} >
  //         {/* <Image src="http://loremflickr.com/300/200" /> */}
  //         <img src="http://loremflickr.com/300/200" width="250" alt="sample here" />
  //         <Paper className={paperStrStyles} >About Me:</Paper>
  //         <Paper >
  //           "Sed illum qui dolorem eum fugiat quo voluptas nulla pariatur?"

  //         </Paper>
  //         {/* <Button onClick={pushMeAction} >push me</Button>
  //         <Button onClick={pushMeAction2} >push me2</Button> */}
  //       </Grid>
  //       <Grid item xs={8}>
  //         <SimpleTabs username={profileName} ></SimpleTabs>
  //       </Grid>
  //       </Grid>
  //     </>
  //   );
  // }
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

