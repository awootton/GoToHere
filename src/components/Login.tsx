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

//import React, { FC, useState, useEffect } from 'react';
import React, { FC, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
// causes restart -> import ShowMore from 'react-show-more-button/dist/module';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import Header from './Header';

//typescript-eslint/no-unused-vars
//@typescript-eslint/no-unused-vars
import * as util from '../gotohere/mqtt/Util';
import * as tok from './TokenScreen';
import * as app from '../App';


// eg alice_vociferous_mcgrath
// join_red_this_string_plain_does_quart_simple_buy_line_fun_look_original_deal 
// [My_token_expires:_2021-12-31,{exp:1641023999,iss:_9sh,jti:amXYKIuS4uykvPem9Fml371o,in:32,out:32,su:4,co:2,url:knotfree.net},eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJleHAiOjE2NDEwMjM5OTksImlzcyI6Il85c2giLCJqdGkiOiJhbVhZS0l1UzR1eWt2UGVtOUZtbDM3MW8iLCJpbiI6MzIsIm91dCI6MzIsInN1Ijo0LCJjbyI6MiwidXJsIjoia25vdGZyZWUubmV0In0.7ElPyX1Vju8Q5uDOEfgAblwvE2gxT78Jl68JPlqLRcFeMJ7if39Ppl2_Jr_JTky371bIXAn6S-pghtWSqTBwAQ]


//export function MakeLogin(tokenState: tok.State, setAppHasPassword: (passCb: State) => any) {
 export const MakeLogin: FC<LoginProps> = (props: LoginProps) => {

  // var myloginProps: LoginProps = {
  //   setAppHasPassword: setAppHasPassword ,
  //   tokenState: tokenState
  // }
  return (
    <>
      <Header title={util.getProfileName() } username = {util.getProfileName()} />
      <Login {...props} ></Login>
    </>
  );
}

var invocations : number = 0

const Login: FC<LoginProps> = (props: LoginProps) => {

  //console.log("top of the Login v"+invocations+" to ya " )
  //invocations++

  // var tokenisOK = false
  // var complaint = ""
  // var serverName = ""
  // let myToken = localStorage.getItem('knotfree_access_token_v1');
  // if (myToken !== null) {
  //   [serverName, complaint] = util.VerifyToken(myToken)
  //   if (complaint === "") {
  //     tokenisOK = true
  //   }
  // } else {
  //   console.log("have complaint abou ttoken ", complaint)
  //   tokenisOK = false
  // }
  //console.log("found myToken ", myToken)

  const profileName = util.getProfileName()
  //console.log("profile name is", profileName) eg. alice_vociferous_mcgrath
  initialState.username = profileName

  const classes = useStyles();

  const [state, setState] = useState(initialState)// useReducer(Reducer, initialState);
  
  //console.log("now we've defined state,  v=", state.isVerified, "  ", state.counter)

  // what does this do? does an init after the render
  // useEffect(() => {
  //   if ( state.username === profileName && state.password.trim().length > 5) {
  //     console.log("useEffect set disables false")
  //     setState({ ...state, isButtonDisabled: false })
  //     // dispatch({
  //     //   type: 'setIsButtonDisabled',
  //     //   payload: false
  //     // });

  //   } else {
  //     console.log("useEffect set disables true")
  //     setState({ ...state, isButtonDisabled: true })
  //     // dispatch({
  //     //   type: 'setIsButtonDisabled',
  //     //   payload: true
  //     // });
  //   }
  // }, [state.username, state.password]);

  const checkIfRespondingPing= () => {
  }

  const handleLogin = () => {

    console.log("in handleLogin with ")
    // if (state.username === 'abc@email.com' && state.password === 'password') {
    if (state.username === profileName && state.password.length > 5) {
      const newState : State = {
        ...state,
        helperText: 'Login Successfull',
        counter : state.counter * 1000000,
        isVerified : true
      }
      setState(newState)
      props.setAppHasPassword(newState)

      checkIfRespondingPing()
       
    } else {
      const newState : State = {
        ...state,
        helperText: 'Incorrect username or password',
        counter : state.counter * 1000000,
        isVerified : false
      }
      setState(newState)
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13 || event.which === 13) {
      state.isButtonDisabled || handleLogin();
    }
  };

  const handleUsernameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      setState({ ...state, username: profileName , counter : state.counter * 100})
      // dispatch({
      //   type: 'setUsername',
      //   payload: profileName
      // });
    };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> =
    (event) =>  { 
      var newState = { ...state , counter : state.counter+1}
      const thePass = event.target.value
      if ( thePass.length > 5 ){
        newState.isButtonDisabled = false
        newState.password = thePass
      }
      setState(newState)
      // and also, we're done so tell the app
      // do this in the login button:
      console.log("login handlePasswordChange setState")
      // props.setAppHasPassword(newState)

      // dispatch({
      //   type: 'setPassword',
      //   payload: event.target.value
      // });
    }

  //var someSampleText = "some sample text with a newline some sample text"

  const makeTokenDisplay = () => {
    return (
      <React.Fragment>
        {/* <div>Caution:</div>
        <div className = {classes.sometext}  >Only put your password here if the name is YOU.</div> */}
        {/* <div>It should be the same as in the url.</div> */}
      </React.Fragment>
    )
  }

  const handleIsMore = (event: any) => {
    setState({ ...state, isMore: !state.isMore , counter : state.counter+100000000000000})
  }

  const handleBeAnon = (event: any) => {

    var newState : State = {
      ...state,
      username : "Anonymous",
      password : "Anonymous",
      isVerified : true,
      counter : state.counter+1000000000000
    }
    setState(newState)
    // and also, we're done so tell the app
    console.log("handleBeAnon about to setAppHasPassword to app ", newState)
    props.setAppHasPassword(newState)

    checkIfRespondingPing()
    
  }

  const handleResetToken = (event: any) => {

    localStorage.setItem('knotfree_access_token_v1', "");
    console.log("about to setAppHasPassword to app ", state)
    const newState = {
      ...state,
      helperText: "reset the token",
      counter : state.counter+1000000000000
    }
    props.setAppHasPassword( newState )
  }
// <form className={classes.container} noValidate autoComplete="off" >
//   type="text" in user button
  return (
    <form className={classes.container} noValidate >
      <Card className={classes.card}>
        <CardHeader className={classes.header} title="Provide credentials" />
        <CardContent>
          <div>
            <TextField
              //error={state.isError}
              fullWidth
              id="username"
            
              label="Profile name"
              placeholder="eg. alice_vociferous_mcgrath"
              margin="normal"
              onChange={handleUsernameChange}
              onKeyPress={handleKeyPress}
              autoComplete="username"
              defaultValue={profileName}
            //disabled={true}
            />
            {makeTokenDisplay()}
            <TextField
              error={true} //state.isError}
              fullWidth
              id="password"
              type="password"
              label="Password"
              placeholder="eg. nice_big_fat_password_or_phrase"
              margin="normal"
              helperText={state.helperText}
              onChange={handlePasswordChange}
              onKeyPress={handleKeyPress}
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardActions>
          <Button
            variant="contained"
            size="large"
            color="secondary"
            className={classes.loginBtn}
            onClick={handleLogin}
            disabled={state.isButtonDisabled}>
            Login
          </Button>

          <br></br>
          <Button variant="contained"
            size="small"
            color="secondary"
            className={classes.loginBtn}
            onClick={ handleIsMore} >
            {state.isMore ? <ExpandMoreIcon/> : <ExpandLessIcon/> }
          </Button>
          <Button variant="contained"
            size="small"
            color="secondary"
            className={classes.loginBtn}
            onClick={ handleBeAnon } >
            Be Anonymous
          </Button>  
        </CardActions>
        <Paper>
          <div >
            {state.isMore  ? 
            <div>
                <li> Token is: { props.tokenState.theToken} </li>
                <li> Server is: { props.tokenState.serverName} </li>
                <li> KnotFree server public key is: { props.tokenState.serverPublicKeyB64} </li>
                <Button variant="contained"
                size="small"
                color="secondary"
                className={classes.loginBtn}
                onClick={  handleResetToken } >
                ResetToken
                </Button>
            </div>
            : <div></div>
            }
          </div>
          </Paper>

      </Card>
    </form>
  );

}

//  {/* <Paper >
//       <div>
//         {/* <ShowMore maxHeight={48} > */}
//         sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk
//         sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk
//         sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk
//         sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk
//         sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk
//         sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk  sssls  sksk
//     {/* </ShowMore> */}

//     </div>
//   </Paper> */}

export default Login;

//state type
export type State = {
  username: string
  password: string
  isButtonDisabled: boolean
  helperText: string
  isMore: boolean
  isVerified: boolean
  counter: number
};

export const initialState: State = {
  username: '',
  password: '',
  isButtonDisabled: true,
  helperText: "",
  isMore: false, 
  isVerified : false,
  counter : 0
  //  isError: false,
  //  token: "",
  // verified: false
};

export type LoginProps = {
  setAppHasPassword: (pass: State) => any,
  tokenState: tok.State // has the token and the host 
}

// type Action = { type: 'setUsername', payload: string }
//   | { type: 'setPassword', payload: string }
//   // | { type: 'setToken', payload: string }
//   | { type: 'setIsButtonDisabled', payload: boolean }
//   | { type: 'loginSuccess', payload: string }
//   | { type: 'loginFailed', payload: string }
//   | { type: 'setIsError', payload: boolean };

// const Reducer = (state: State, action: Action): State => {
//   switch (action.type) {
//     case 'setUsername':
//       return {
//         ...state,
//         username: action.payload
//       };
//     case 'setPassword':
//       return {
//         ...state,
//         password: action.payload
//       };
//     case 'setIsButtonDisabled':
//       return {
//         ...state,
//         isButtonDisabled: action.payload
//       };
//     case 'loginSuccess':
//       return {
//         ...state,
//         helperText: action.payload,
//         //  isError: false
//       };
//     case 'loginFailed':
//       return {
//         ...state,
//         helperText: action.payload,
//         //  isError: true
//       };
//     case 'setIsError':
//       return {
//         ...state,
//         //isError: action.payload
//       };
//   }
// }

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
      width: 400,
      margin: `${theme.spacing(0)} auto`
    },
    loginBtn: {
      marginTop: theme.spacing(2),
      flexGrow: 0, // 1
      textTransform: 'capitalize'
    },
    header: {
      textAlign: 'center',
      background: '#212121',
      color: '#fff'
    },
    card: {
      marginTop: theme.spacing(10)
    },
    sometext : {
      textAlign: 'center',
     // margin : 66
    }
  })
);

