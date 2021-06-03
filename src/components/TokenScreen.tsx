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

import React, { ReactElement, FC } from "react";

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

//import { Component } from 'react'; // let's also import Component
//import ShowMore from 'react-show-more-button/dist/module';
import Paper from '@material-ui/core/Paper';
//import { Theme } from '@material-ui/core/styles';
//import { makeStyles, createStyles } from '@material-ui/core/styles';
//import CSS from 'csstype';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

//import * as mqttclient from '../server/MqttClient';

import * as util from "../server/Util"
import * as mqttclient from "../server/MqttClient"


import * as nacl from 'tweetnacl-ts'
import * as pingapi from "../api1/Ping";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            // centered 
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",

            //margin-top: -50px;
            //margin-left: -100px;


            //backgroundColor: 'rgba(255, 128, 255, 0.85)',
            backgroundColor: 'white',
            // position: "absolute",
            // right: 0,
            // bottom: '22rem',
            //  margin: 'auto' ,
            padding: '10.5rem',
            fontFamily: 'sans-serif',
            fontSize: '1.0rem',
            //boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
            boxShadow: '0 0 0px rgba(0, 0, 0, 0.0)',
            display: 'inline-block'
        }
    })
);

export type State = {
    complaints: string
    serverName: string
    theToken: string
    serverPublicKeyB64: string
    counter: number
    isMore: boolean // expand the bottom
    isVerified: boolean
}

export const initialState: State = {
    complaints: "", // aka messages
    serverName: "",
    theToken: "",
    serverPublicKeyB64: "",
    counter: 0,
    isMore: false,
    isVerified: false
}

type Props = {
    setAppHasToken: (s: State) => any
}

type KnotFreeTokenPayload = {
    //
    exp: number //`json:"exp,omitempty"` // ExpirationTimeunix seconds
    iss: string //`json:"iss"`           // Issuer first 4 bytes (or more) of base64 public key of issuer
    jti: string //`json:"jti,omitempty"` // JWTID a unique serial number for this Issuer

    in: number //`json:"in"`  // bytes per sec
    out: number //`json:"out"` // bytes per sec
    su: number          //`json:"su"`  // Subscriptions seconds per sec
    co: number        //`json:"co"`  // Connections seconds per sec

    URL: string //`json:"url"` // address of the service eg. "knotfree.net" or knotfree0.com for localhost
}

type TokenRequest = {
    //
    pkey: string                //`json:"pkey"` // a curve25519 pub key of caller
    payload: KnotFreeTokenPayload  //`json:"payload"`
    Comment: string                //`json:"comment"`
}
type TokenReply = {
    pkey: string                //`json:"pkey"` // a curve25519 pub key of caller
    payload: string         //`json:"payload"`
    nonce: string                 // `json:"nonce"`
}

//export class TokenScreen extends Component<TokenProps, State> {
export const TokenScreen: FC<Props> = (props: Props): ReactElement => {

    //state = initialState  

    const [state, setState] = React.useState(initialState);
    const [checked, setChecked] = React.useState(false);

    // haveChecked: boolean = false

    //constructor(props: TokenProps) 

    // componentWillMount() {
    // }

    // componentDidMount() {
    // }

    //console.log(" top of TokenScreen render")

    const checkTokenIsGood = (aToken: string) => {

        var sname: string
        var complaints: string
        [sname, complaints] = util.VerifyToken(aToken)

        if (complaints.length === 0 && sname.length > 0) {
            console.log("have serverName from verify ", sname)
            tryToStartMqtt(aToken, sname)
        } else {
            // there was complaints and or no server
            console.log("token verify was bad ", complaints)
            const newState: State = {
                ...state,
                theToken: aToken,
                complaints: complaints,
                serverName: sname
            }
            setState(newState)
        }
    }

    const tryToStartMqttPart2 = (aToken: string, serverName: string, serverPubKey: string) => {
        console.log("try to start mqtt now")
        // can we start mqtt? 
        // the first path is for when it's already started
        // the 2nd starts it. 
        if ( mqttclient.mqttServerThing !== undefined) {
            // don't start again
            console.log("didn't restart mqtt unnecessarily")
            console.log("mqtt success in TokenScreen")
            // success 
            const newState: State = {
                ...state,
                theToken: aToken,
                complaints: "",
                serverName: serverName,
                serverPublicKeyB64: serverPubKey,
              //  isVerified: true
            }
            // don't refresh self on success setState(newState)
            localStorage.setItem('knotfree_access_token_v1', aToken);
            console.log("setAppHasToken knotfree_access_token_v1 ", newState.serverPublicKeyB64)
            setState(newState)
            props.setAppHasToken(newState)

        } else {
            mqttclient.StartClientMqtt(aToken, serverName, (errmsg: string) => {

                console.log("returned from mqtt no news is good: ", errmsg)
                if (errmsg.length) {
                    console.log("mqtt has err here ", errmsg)
                    // failed
                    // tell ourselves 
                    const newState: State = {
                        ...state,
                        theToken: aToken,
                        complaints: "mqtt has err here " + errmsg,
                        serverName: serverName
                    }
                    setState(newState)
                    const mqtt = mqttclient.mqttServerThing
                    if ( mqtt ){
                        mqtt.CloseTheConnect()
                    } else {
                        console.log("ERROR tryToStartMqttPart2 no mqtt")
                    }
                    setChecked(false)

                } else {
                    console.log("mqtt 2 success in TokenScreen 2")
                    
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 100);
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 200);
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 300);
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 400);
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 500);
                    
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 2100);
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 2200);
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 2300);
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 2400);
                    // setTimeout(() => { mqttstuff.mqttServerThing.sendAPing() }, 2500);

                    const context: util.Context = util.getNameToContext(util.getProfileName()) 
                    console.log("TokenScreen ping will use this name", context.username)  
                    const profileName = util.getProfileName()
                    // send a ping to get the pubk of the profile
                    pingapi.IssueTheCommand("Anonymous",profileName,(cmd: pingapi.PingCmd, error: any) => {
                        if ( error ){
                            console.log("ERROR in ping from token screen ")
                        } else {
                            console.log("TokenScreen Ping is back ")

                            var context: util.Context = util.getNameToContext(util.getProfileName()) 
        
                            console.log("Have pubk from ping of " , context.username)
                  
                            // success, tell ourselves
                            // is cmd.pub is in b64
                            const pubk:Buffer = util.fromBase64Url(cmd.pub)

                            // now that we have the pubk we can set up the context
                            context.initialized = false
                            util.initContext(context) // fix the wong hash of the name
                            context.ourPublicKey = [pubk]
                            context = util.getNameToContext(util.getProfileName()) 
                            console.log("Have pubk from ping of " , util.toBase64Url(context.ourPublicKey[0]) )

                            const newState: State = {
                                ...state,
                                theToken: aToken,
                                complaints: "",
                                serverName: serverName,
                                serverPublicKeyB64: serverPubKey,
                                isVerified: true
                            }
                            //util.SetPserverPubKey(util.getProfileName())
                            // don't refresh self on success setState(newState)
                            localStorage.setItem('knotfree_access_token_v1', aToken);
                            console.log("mqtt success 2 pubkey ", newState.serverPublicKeyB64)
                            //tell the app
                            props.setAppHasToken(newState)
                        }
                    })




                    
                }
            })
        }
    }

    const tryToStartMqtt = (aToken: string, serverName: string) => {

        const hoststr = "http://" + serverName + "/api1/getPublicKey"

        console.log("calling GetPublicKey at  ", hoststr)

        // fetch(hoststr)
        //     .then(response => {
        //         if (response.ok) {
        //             //console.log("fetch1 has resp", response)
        //             response.text().then(thedata => { console.log("fetch1 has data", thedata) })
        //         } else {
        //             console.log("fetch1 has problem", response)
        //         }
        //     })
        //     .catch(e => {
        //         console.log("fetch1 error ", e);
        //     })

        const response = fetchWithTimeout(hoststr, {}); // , { mode: "no-cors" });

        response.then((resp: Response) => {

            console.log("have GetPublicKey response ", resp)

            if (resp.ok) {
                resp.text().then((thedata: string) => {
                    console.log("have GetPublicKey fetch result ", thedata)
                    setState({
                        ...state,
                        serverName: serverName,
                        theToken: aToken,
                        serverPublicKeyB64: thedata
                    })
                    var serverPubKey = thedata
                    tryToStartMqttPart2(aToken, serverName, serverPubKey)
                })
            }
            else {
                // resp not OK 
                console.log("have GetPublicKey fetch problem ", resp)
            }
        }
        )
        response.catch((err: any) => {
            console.log("got error contacting host " + hoststr, err)
            setState({
                ...state,
                theToken: aToken,
                serverName: serverName,
                complaints: "got error contacting host " + hoststr + " " + err
            })
        })
    }

    const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        var theToken = event.target.value
        console.log(" calling checkTokenIsGood from handleInputChange with ")//, theToken)
        checkTokenIsGood(theToken)
    }

    const getFreeTokenHandler = () => {
        var serverName = util.getServerName()
        if (process.env.NODE_ENV === "development") {
            serverName = serverName.replace("3000", "8085")
        }
        const hoststr = "http://" + util.getProfileName() + "." + serverName + "api1/getToken"

        console.log("it's ftech time again ... for a Token !!", hoststr)
        var data = getSampleKnotFreeTokenRequest()
        const myKeyPair: nacl.BoxKeyPair = nacl.box_keyPair()
        // arg!! wants hex ! data.pkey =  base64url.encode(Buffer.from(keyPair.publicKey))
        data.pkey = (Buffer.from(myKeyPair.publicKey)).toString('hex')
        // FIXME: use fetchWithTimeout with longer timeout 
        //const response = fetchWithTimeout(hoststr, { method: 'POST', body: JSON.stringify(data)}); // , { mode: "no-cors" });
        const response = fetch(hoststr, { method: 'POST', body: JSON.stringify(data) }); // , { mode: "no-cors" });
        response.then((resp: Response) => {
            console.log("have get free token response ", resp)
            if (resp.ok) {
                resp.json().then((repl: TokenReply) => { // TokenReply
                    // data is TokenReply 
                    console.log("have get free token  fetch result ", repl)
                    // box_open(box, nonce, theirPublicKey, mySecretKey)
                    // nonce is in b64 and is just a string 
                    // pkey and payload are in hex
                    const pkeyBytes = Buffer.from(repl.pkey, 'hex')
                    const payloadBytes = Buffer.from(repl.payload, 'hex')
                    const nonceBytes = Buffer.from(repl.nonce)
                    const gotTok = nacl.box_open(payloadBytes, nonceBytes, pkeyBytes, myKeyPair.secretKey)
                    if (gotTok === undefined) {
                        console.log("FAILURE decoded free token fetch result ", gotTok)
                        setState({ ...state, complaints: "Failed to get free token" })
                    } else {
                        const asciiTok = Buffer.from(gotTok).toString("utf8")
                        console.log("have decoded free token  fetch result ", asciiTok)
                        const newState: State = { ...state, complaints: "Got Free Token... " + asciiTok, theToken: asciiTok }
                        localStorage.setItem('knotfree_access_token_v1', asciiTok);
                        setState(newState)
                        props.setAppHasToken(newState)// tell the app 
                    }
                })
            }
            else {
                // resp not OK 
                console.log("have get free token fetch problem ", resp)
            }
        }
        )
    }

    // { was the constructor
    //   super(props)
    //console.log("TokenScreen constructor with ", state.serverPublicKeyB64)
    let savedToken = localStorage.getItem('knotfree_access_token_v1');
    var goodToken = ""
    //console.log(" localStorage.getItem  knotfree_access_token_v1  ", savedToken)
    if (state.theToken.length < 100) {
        if ((savedToken || "" ).length > 100) {
            goodToken = savedToken || ""
            const newState: State = {
                ...state,
                theToken: savedToken || "",
            }
            setState(newState)
            setChecked(true)
            //console.log(" constructor set newState  ", savedToken)
        }
    }
    if (!checked) {
        console.log(" checkTokenIsGood in constructor", goodToken)
        checkTokenIsGood(goodToken)
        // it won't be done right away now
        setChecked(true)// haveChecked = true
    }
    //  }

    const retryHandler = (event: any) => {
        // force a refresh   
        const newState: State = {
            ...state,
            counter: state.counter + 1
        }
        setState(newState) // this doesn't really work
        console.log("time to retryHandler retryHandler ", newState.serverPublicKeyB64)
        //props.setAppHasToken(newState)// refresh the app
        // }
    }

    //  render() {

    //console.log(" the token Screen complaints are currently", state.complaints)

    var theComplaintParts = state.complaints.split("\n")
    theComplaintParts.push("The server name is: " + state.serverName)
    theComplaintParts.push("The server public key is: " + state.serverPublicKeyB64)
    theComplaintParts.push("Retry count: " + state.counter)

    const classes = useStyles();

    if (!state.isVerified) {
        return (
            <div className={classes.root} >
                {/* <Paper > */}
                <div >We will need an access token for the knotfree network.</div>
                <TextField
                    inputProps={inputProps} // attributes applied to input
                    // error={state.isError}
                    //style={someStyles}
                    fullWidth
                    id="tokenentry"
                    type="text"
                    label="Paste token here:"
                    placeholder="eg. [My_token_expires:_2021..."
                    margin="normal"
                    onChange={handleInputChange}
                    // onKeyPress={handleKeyPress}
                    // autoComplete="tpken"
                    defaultValue={state.theToken}
                    multiline={true}
                />
                {/* styleButton = { {fontSize: '1.0rem'} } 
                            FIXME: smaller matching button
                    */}

                <Button variant="contained"
                    size="small"
                    color="secondary"
                    //className={classes.loginBtn}
                    onClick={() => { setState({ ...state, isMore: !state.isMore }) }} >
                    {state.isMore ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </Button>

                {/* <ShowMore maxHeight={48} > */}

                { state.isMore ?
                    <>
                        {theComplaintParts.map((value, index) => {
                            return <li key={index}>{value}</li>
                        })}
                    </>
                    : <div></div>
                }
                {/* </ShowMore> */}
                <Button variant="contained" onClick={retryHandler} >Refresh</Button>
                <Button variant="contained" onClick={getFreeTokenHandler} >Get Free Small Token from knotfree.net</Button>

                {/* </Paper> */}
            </div>
        )
    } else {

        // this never happens because if the token is good then we just show something else
        return (
            <div className={classes.root} >
                <Paper variant="outlined"
                >
                    <div>Token looks good </div>
                    <div>{state.theToken}</div>
                    {/* <Button>Ok</Button>
                    <Button>Reset</Button> */}

                </Paper>
            </div>
        )
    }

}



const inputProps = {
    step: 300,
};


// export const FOOTER_HEIGHT = 30
// export const HEADER_HEIGHT = 60
// export const DRAWER_WIDTH = 250

// const useStyles = makeStyles((theme: Theme) =>
//     createStyles({
//         root: {
//             flex: 1,
//             display: "flex",
//             flexDirection: "column",
//         },
//         content: {
//             flexGrow: 1,
//             padding: theme.spacing(3),
//             minHeight: `calc(100vh - ${FOOTER_HEIGHT}px)`,
//             background: theme.palette.background.paper,
//             marginLeft: theme.spacing(7) + 1,
//             [theme.breakpoints.up("sm")]: {
//                 marginLeft: theme.spacing(9) + 1,
//             },
//         },
//         toolbar: {
//             ...theme.mixins.toolbar,
//         },
//         contentShift: {
//             transition: theme.transitions.create("margin", {
//                 easing: theme.transitions.easing.easeOut,
//                 duration: theme.transitions.duration.enteringScreen,
//             }),
//             marginLeft: DRAWER_WIDTH,
//         },
//     })
// );


// Non-dependent styles
// const styles = createStyles({
//     root: {
//       display: 'flex',
//       flexDirection: 'column',
//     },
//   });

//   // Theme-dependent styles
//   const tstyles = ({ palette, spacing }: Theme) => createStyles({
//     root: {
//       display: 'flex',
//       flexDirection: 'column',
//       padding: 22, // spacing.unit,
//       backgroundColor: palette.background.default,
//       color: palette.primary.main,
//     },
//   });

//const tokenStyles = createStyles({
// const XXtokenStyles = (theme:Theme) => ({
//     container: {
//         display: 'flex',
//         flexWrap: 'wrap',
//         width: 400,
//         margin: `${theme.spacing(0)} auto`
//       },
//       paper: {
//         display: 'flex',
//         flexWrap: 'wrap',
//         width: 400,
//         margin: `${theme.spacing(0)} auto`
//       },
//       loginBtn: {
//         marginTop: theme.spacing(2),
//         flexGrow: 1
//       },
//       header: {
//         textAlign: 'center',
//         background: '#212121',
//         color: '#fff'
//       },
//       card: {
//         marginTop: theme.spacing(10)
//       }
// });

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     container: {
//       display: 'flex',
//       flexWrap: 'wrap',
//       width: 400,
//       margin: `${theme.spacing(0)} auto`
//     },
//     loginBtn: {
//       marginTop: theme.spacing(2),
//       flexGrow: 1
//     },
//     header: {
//       textAlign: 'center',
//       background: '#212121',
//       color: '#fff'
//     },
//     card: {
//       marginTop: theme.spacing(10)
//     }
//   })
// );


async function fetchWithTimeout(resource: string, options: object) {
    const timeout: number = 1000//  } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);

    return response;
}

function getSampleKnotFreeTokenPayload(): KnotFreeTokenPayload {
    var res: KnotFreeTokenPayload = {
        exp: 999, //`json:"exp,omitempty"` // ExpirationTimeunix seconds
        iss: "xxx", //`json:"iss"`           // Issuer first 4 bytes (or more) of base64 public key of issuer
        jti: "xxx", //`json:"jti,omitempty"` // JWTID a unique serial number for this Issuer

        //KnotFreeContactStats // limits on what we're allowed to do.
        in: 32, //`json:"in"`  // bytes per sec
        out: 32, //`json:"out"` // bytes per sec
        su: 10,          //`json:"su"`  // Subscriptions seconds per sec
        co: 2,       //`json:"co"`  // Connections seconds per sec

        URL: "unknown" //`json:"url"` // address of the service eg. "knotfree.net" or knotfree0.com for localhost
    }
    return res
}

function getSampleKnotFreeTokenRequest(): TokenRequest {
    var res: TokenRequest = {
        pkey: "fixme",        //    `json:"pkey"` // a curve25519 pub key of caller
        payload: getSampleKnotFreeTokenPayload(),
        Comment: "For " + util.getProfileName()             // `json:"comment"`
    }
    return res
}