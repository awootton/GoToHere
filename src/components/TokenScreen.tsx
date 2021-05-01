
import { Component } from 'react'; // let's also import Component
//import ShowMore from 'react-show-more-button/dist/module';
import Paper from '@material-ui/core/Paper';
//import { Theme } from '@material-ui/core/styles';
//import { makeStyles, createStyles } from '@material-ui/core/styles';
import CSS from 'csstype';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
//import EditorFormatLineSpacing from 'material-ui/svg-icons/editor/format-line-spacing';

import * as util from "../server/Util"
import * as mqtt_stuff from "../server/MqttClient"
import { getProfileName } from '../App';
import { getServerName } from '../App';
//import { RestoreOutlined } from '@material-ui/icons';
// import base64url from 'base64url';
import * as nacl from 'tweetnacl-ts'


export type TokenState = {
    complaints: string
    serverName: string
    theToken: string
    serverPublicKeyB64: string
    counter: number
    isMore: boolean
    isVerified: boolean
}

export const initialTokenState: TokenState = {
    complaints: "", // aka messages
    serverName: "",
    theToken: "",
    serverPublicKeyB64: "",
    counter: 0,
    isMore : false,
    isVerified : false
}

type TokenProps = {
    setAppHasToken: (s: TokenState) => any
}
// this KnotFree stuff glommed from go in that project
// KnotFreeContactStats is the numeric part of the token claims
// it is floats to compress numbers and allow fractions in json
// these don't count above 2^24 or else we need more bits.
// type KnotFreeContactStats = {
//     //
//     in: number //`json:"in"`  // bytes per sec
//     out: number //`json:"out"` // bytes per sec
//     su: number          //`json:"su"`  // Subscriptions seconds per sec
//     co: number        //`json:"co"`  // Connections seconds per sec
// }

type KnotFreeTokenPayload = {
    //
    exp: number //`json:"exp,omitempty"` // ExpirationTimeunix seconds
    iss: string //`json:"iss"`           // Issuer first 4 bytes (or more) of base64 public key of issuer
    jti: string //`json:"jti,omitempty"` // JWTID a unique serial number for this Issuer

    //KnotFreeContactStats // limits on what we're allowed to do.
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
	nonce :  string                 // `json:"nonce"`
}

export class TokenScreen extends Component<TokenProps, TokenState> {

    state = initialTokenState  

    haveChecked: boolean = false

    constructor(props: TokenProps) {
        super(props)
        //console.log("TokenScreen constructor with ", this.state.serverPublicKeyB64)
        let savedToken = localStorage.getItem('knotfree_access_token_v1');
        var goodToken = ""
        //console.log(" localStorage.getItem  knotfree_access_token_v1  ", savedToken)
        if (this.state.theToken.length === 0) {
            if (savedToken !== undefined) {
                goodToken = savedToken || ""
                const newState: TokenState = {
                    ...this.state,
                    theToken: savedToken || "",
                }
                this.setState(newState)
                //console.log(" constructor set newState  ", savedToken)
            }
        }
        if (!this.haveChecked) {
            console.log(" checkTokenIsGood in constructor", goodToken)
            this.checkTokenIsGood(goodToken)
            // it won't be done right away now
            this.haveChecked = true
        }
    }

    // componentWillMount() {
    // }

    // componentDidMount() {
    // }

    checkTokenIsGood = (aToken: string) => {

        var sname: string
        var complaints: string
        [sname, complaints] = util.VerifyToken(aToken)

        if (complaints.length === 0 && sname.length > 0) {
            console.log("have serverName from verify ", sname)
            this.tryToStartMqtt(aToken, sname)
        } else {
            // there was complaints and or no server
            console.log("token verify was bad ", complaints)
            const newState: TokenState = {
                ...this.state,
                theToken: aToken,
                complaints: complaints,
                serverName: sname
            }
            this.setState(newState)
            this.props.setAppHasToken(newState)
        }
    }

    tryToStartMqttPart2 = (aToken: string, serverName: string, serverPubKey: string) => {
        console.log("try to start mqtt now")
        // can we start mqtt? 
        if (mqtt_stuff.mqttServerThing && mqtt_stuff.mqttServerThing.client) {
            // don't start again
            console.log("dont restart mqtt unnecessarily")
            console.log("mqtt success in TokenScreen")
            // success, tell ourselves
            const newState: TokenState = {
                ...this.state,
                theToken: aToken,
                complaints: "",
                serverName: serverName,
                serverPublicKeyB64: serverPubKey
            }
            // don't refresh self on success this.setState(newState)
            localStorage.setItem('knotfree_access_token_v1', aToken);
            console.log("setAppHasToken knotfree_access_token_v1 ", newState.serverPublicKeyB64)
            this.setState(newState)
            this.props.setAppHasToken(newState)

        } else {
            mqtt_stuff.StartClientMqtt(aToken, serverName, (errmsg: string) => {

                console.log("returned from mqtt with good news ", errmsg)
                if (errmsg.length) {
                    console.log("mqtt has err here ", errmsg)
                    // failed
                    // tell ourselves 
                    const newState: TokenState = {
                        ...this.state,
                        theToken: aToken,
                        complaints: "mqtt has err here " + errmsg,
                        serverName: serverName
                    }
                    this.setState(newState)
                    mqtt_stuff.mqttServerThing.CloseTheConnect()

                } else {
                    console.log("mqtt success in TokenScreen")
                    // success, tell ourselves
                    const newState: TokenState = {
                        ...this.state,
                        theToken: aToken,
                        complaints: "",
                        serverName: serverName,
                        serverPublicKeyB64: serverPubKey
                    }
                    // don't refresh self on success this.setState(newState)
                    localStorage.setItem('knotfree_access_token_v1', aToken);
                    console.log("mqtt success in TokenScreen pubkey ", newState.serverPublicKeyB64)
                    this.props.setAppHasToken(newState)
                }
            })
        }

    }

    tryToStartMqtt = (aToken: string, serverName: string) => {

        //const hoststr = "http://" + getProfileName() + "." + serverName + "/api1/getPublicKey"
        const hoststr = "http://" +  serverName + "/api1/getPublicKey"
        //const hoststr = "http://alice_vociferous_mcgrath.knotfree2.com:3000/robots.txt"
        //const hoststr = "http://" + serverName + "/api1/getPublicKey"

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
                    this.setState({
                        ...this.state,
                        serverName: serverName,
                        theToken: aToken,
                        serverPublicKeyB64: thedata
                    })
                    var serverPubKey = thedata
                    this.tryToStartMqttPart2(aToken, serverName, serverPubKey)
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
            this.setState({
                ...this.state,
                theToken: aToken,
                serverName: serverName,
                complaints: "got error contacting host " + hoststr + " " + err
            })
        })
    }
    handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        var theToken = event.target.value
        console.log(" calling checkTokenIsGood from handleInputChange with ")//, theToken)
        this.checkTokenIsGood(theToken)
    }

    getFreeTokenHandler = () => {
        var serverName = getServerName()
        if (process.env.NODE_ENV === "development") {
            serverName = serverName.replace("3000", "8085")
        }
        const hoststr = "http://" + getProfileName() + "." + serverName + "api1/getToken"

        console.log("it's ftech time again ... for a Token !!", hoststr)
        var data = getSampleKnotFreeTokenRequest()
        const myKeyPair : nacl.BoxKeyPair  = nacl.box_keyPair()
        // arg!! wants hex ! data.pkey =  base64url.encode(Buffer.from(keyPair.publicKey))
        data.pkey =  (Buffer.from(myKeyPair.publicKey)).toString('hex')
        // FIXME: use fetchWithTimeout with longer timeout 
        //const response = fetchWithTimeout(hoststr, { method: 'POST', body: JSON.stringify(data)}); // , { mode: "no-cors" });
        const response = fetch(hoststr, { method: 'POST', body: JSON.stringify(data)}); // , { mode: "no-cors" });
        response.then((resp: Response) => {
            console.log("have get free token response ", resp)
            if (resp.ok) {
                resp.json().then(( repl : TokenReply) => { // TokenReply
                    // data is TokenReply 
                    console.log("have get free token  fetch result ", repl)
                    // box_open(box, nonce, theirPublicKey, mySecretKey)
                    // nonce is in b64 and is just a string 
                    // pkey and payload are in hex
                    const pkeyBytes = Buffer.from(repl.pkey , 'hex') 
                    const payloadBytes = Buffer.from(repl.payload , 'hex') 
                    const nonceBytes = Buffer.from(repl.nonce)
                    const gotTok = nacl.box_open(payloadBytes, nonceBytes, pkeyBytes, myKeyPair.secretKey)
                    if (gotTok=== undefined) {
                        console.log("FAILURE decoded free token fetch result ", gotTok)
                        this.setState({ ...this.state, complaints: "Failed to get free token"  })
                    } else {
                        const asciiTok = Buffer.from(gotTok).toString("utf8")
                        console.log("have decoded free token  fetch result ", asciiTok)
                        const newState : TokenState = { ...this.state, complaints: "Got Free Token... " + asciiTok, theToken: asciiTok }
                        localStorage.setItem('knotfree_access_token_v1', asciiTok);
                        this.setState(newState)
                        this.props.setAppHasToken(newState)// tell the app 
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

    render() {

        console.log(" the token Screen complaints are currently", this.state.complaints)

        var theComplaintParts = this.state.complaints.split("\n")
        theComplaintParts.push("The server name is: " + this.state.serverName)
        theComplaintParts.push("The server public key is: " + this.state.serverPublicKeyB64)
        theComplaintParts.push("Retry count: " + this.state.counter)

        if (this.state.theToken.length === 0 || this.state.serverName.length === 0 || this.state.complaints.length > 0) {
            return (
                <div style={someStyles}  >
                    {/* <Paper > */}
                    <div >You will need an 'access token' for the network.</div>
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
                        onChange={this.handleInputChange}
                        // onKeyPress={handleKeyPress}
                        // autoComplete="tpken"
                        defaultValue={this.state.theToken}
                        multiline={true}
                    />
                    {/* styleButton = { {fontSize: '1.0rem'} } 
                            FIXME: smaller matching button
                    */}

                    <Button variant="contained"
                                size="small"
                                color="secondary"
                                //className={classes.loginBtn}
                                onClick={ ()=> {this.setState({ ...this.state, isMore: ! this.state.isMore})}} >
                                {this.state.isMore ? "^" : "V"}
                    </Button>

                    {/* <ShowMore maxHeight={48} > */}

                    { this.state.isMore  ? 
                        <>
                        {theComplaintParts.map((value, index) => {
                            return <li key={index}>{value}</li>
                        })}
                        </>
                        : <div></div>
                    }
                    {/* </ShowMore> */}
                    <Button variant="contained" onClick={this.retryHandler} >Refresh</Button>
                    <Button variant="contained" onClick={this.getFreeTokenHandler} >Get Free Small Token from knotfree.net</Button>

                    {/* </Paper> */}
                </div>
            )
        }

        // this never happens because if the token is good then we just show something else
        return (
            <div style={someStyles}   >
                <Paper variant="outlined"
                >
                    <div>Token looks good </div>
                    <div>{this.state.theToken}</div>
                    {/* <Button>Ok</Button>
                    <Button>Reset</Button> */}

                </Paper>
            </div>
        )
    }

    retryHandler = (event: any) => {
        // force a refresh   
        const newState: TokenState = {
            ...this.state,
            counter: this.state.counter + 1
        }
        this.setState(newState) // this doesn't really work
        console.log("time to retryHandler retryHandler ", newState.serverPublicKeyB64)
        //this.props.setAppHasToken(newState)// refresh the app
    }
}
const inputProps = {
    step: 300,
};

const someStyles: CSS.Properties = {
    // centered 
    position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",

  //margin-top: -50px;
  //margin-left: -100px;


    //backgroundColor: 'rgba(255, 128, 255, 0.85)',
   // backgroundColor: 'white',
    // position: "absolute",
   // right: 0,
   // bottom: '22rem',
  //  margin: 'auto' ,
//    padding: '10.5rem',
    fontFamily: 'sans-serif',
    fontSize: '1.0rem',
    //boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    boxShadow: '0 0 0px rgba(0, 0, 0, 0.0)',
    display: 'inline-block'

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

function getSampleKnotFreeTokenPayload() : KnotFreeTokenPayload{
   var res: KnotFreeTokenPayload = {
    exp: 999, //`json:"exp,omitempty"` // ExpirationTimeunix seconds
    iss: "xxx" , //`json:"iss"`           // Issuer first 4 bytes (or more) of base64 public key of issuer
    jti: "xxx", //`json:"jti,omitempty"` // JWTID a unique serial number for this Issuer

    //KnotFreeContactStats // limits on what we're allowed to do.
    in: 32, //`json:"in"`  // bytes per sec
    out: 32, //`json:"out"` // bytes per sec
    su: 10,          //`json:"su"`  // Subscriptions seconds per sec
    co: 2 ,       //`json:"co"`  // Connections seconds per sec

    URL: "unknown" //`json:"url"` // address of the service eg. "knotfree.net" or knotfree0.com for localhost
   }
   return res
}

function getSampleKnotFreeTokenRequest()  : TokenRequest{
    var res: TokenRequest = {
        pkey    : "fixme"    ,        //    `json:"pkey"` // a curve25519 pub key of caller
        payload : getSampleKnotFreeTokenPayload(),
        Comment : "For " + getProfileName()             // `json:"comment"`
    }
    return res
 }