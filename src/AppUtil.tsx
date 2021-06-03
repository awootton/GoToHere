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

import * as nacl from 'tweetnacl-ts'

import * as util from "./server/Util"
import * as mqttclient from "./server/MqttClient"
import * as pingapi from "./api1/Ping"
import * as friendsapi from './api1/GetFriends'

// do we really need this? 
export var theKnotPubk = ""
export var theToken = ""
export var theServerName = ""

export function setToken(s: string) {
  theToken = s
}

var bootPhase = 0

var timerId: NodeJS.Timeout | undefined = undefined

var delay = 100
var showDialogs = false // to see it in the ui

var pending = false

var reschedules = 0
var pingsDone = 0

function reschedule(increment: (finished: boolean) => any) {
  reschedules += 1
  if (reschedules > 20) { // kinda arbitrary
    console.log("too many retries. Now we're going slow bootPhase=", bootPhase)
    delay = 5000
    showDialogs = true
  }
  if (showDialogs) {
    delay = 10000
    increment(false)
    reschedules += 1
  }
  if (delay === 0) {
    bootSequence(increment)
  } else {
    if (timerId === undefined) {
      timerId = setTimeout(() => {
        if (showDialogs) {
          increment(false)// redraws the app
        }
        timerId = undefined
        reschedules += 1
        bootSequence(increment)
      }, delay)
    }
  }
}

// only call increment at the end
export function bootSequence(increment: (finished: boolean) => any) {

  console.log("in bootSequence with ", bootPhase)
  if (pending) {
    console.log("bootSequence pending with ", bootPhase)
    return
  }

  if (bootPhase === 0) {

    //  localStorage.setItem('knotfree_access_token_v1', aToken);
    // the first thing to do is try to get a token.
    let savedToken = localStorage.getItem('knotfree_access_token_v2');
    if (savedToken && savedToken.length > 0) {
      var sname: string
      var complaints: string
      [sname, complaints] = util.VerifyToken(savedToken)
      if (complaints == "") {
        console.log("got token from local knotfree_access_token_v2 server = ", sname)
        // let's use the servername from the window serverName = sname
        setToken(savedToken)
        bootPhase = 1  // progress
        reschedule(increment) // back to top
      } else {
        // bad token
        localStorage.setItem('knotfree_access_token_v2', "");
        reschedule(increment) // back to top
      }
    } else {
      // no saved token
      // must fetch one
      // first, ping the server for it's pubk to be sure it's there.
      pending = true
      const aname = util.getServerName()
      pingServer(aname, (ok: boolean) => {
        pending = false
        if (ok) {
          // now, ask the server for a token.
          const aname = util.getServerName()
          pending = true
          getFreeToken(aname, (ok: boolean) => {
            pending = false
            console.log("back from apputil.getFreeToken, ", ok)
            if (ok) {
              console.log("have token , ", theToken)
              bootPhase = 1
              reschedule(increment)
            } else {
              reschedule(increment) // try again later. state remains the same
            }
          })
        } else {
          // fail. crap. 
          console.log("apputil.pingServer fail with knotfree.net ")
          reschedule(increment) // try again later. state remains the same
        }
      })
    }
  } else if (bootPhase === 1) {
    // we have response from server
    console.log("we have the pubk  ", theKnotPubk)
    console.log("we have the token  ", theToken)
    // start mqtt
    pending = true
    startTheMqtt((ok: boolean) => {
      pending = false
      if (ok) {
        bootPhase = 2 // progress
        reschedule(increment)
      } else {
        reschedule(increment)
      }
    })
  } else if (bootPhase === 2) {
    // ping the knot server
    pending = true
    pingForPubk((ok: boolean) => {
      pending = false
      if (ok) {
        pingsDone += 1
        console.log("we have a good ping  ", util.getSecondsDisplay())
        if (pingsDone > 4) {
          //increment(true)// we're done
          bootPhase = 3
          reschedule(increment)
        } else {
          reschedule(increment)// try again
        }
      } else {
        reschedule(increment)// try again
      }
    })
  } else if (bootPhase === 3) {
    // get friends
    pending = true
    getFriends((ok: boolean) => {
      pending = false
      if (ok) {
        console.log("we friends  ", util.getSecondsDisplay())
        bootPhase = 4
        increment(true)// we're done
      } else {
        reschedule(increment)// try again
      }
    })
  }
}

function getFriends(done: (ok: boolean) => any) {

  const context: util.Context = util.getNameToContext(util.getProfileName())
  console.log("AppUtil getFriends will use this name", context.username, util.getSecondsDisplay())
  const profileName = util.getProfileName()
  // get the friends info right now.
  // export type GetFriendsReceiver = ( reply: GetFriendsReply, error: any) => any
  friendsapi.IssueTheCommand(profileName, 1, 0, (reply: friendsapi.GetFriendsReply, error: any) => {
    if (error) {
      console.log("ERROR in getFriends from apiUtil ")
      done(false)
    } else {
      console.log("AppUtil getFriends is back ", util.getSecondsDisplay())
      done(true)
    }
  })
}

export function pingForPubk(done: (ok: boolean) => any) {

  const context: util.Context = util.getNameToContext(util.getProfileName())
  console.log("AppUtil ping will use this name", context.username, util.getSecondsDisplay())
  const profileName = util.getProfileName()
  // send a ping to get the pubk of the profile
  pingapi.IssueTheCommand("Anonymous", profileName, (cmd: pingapi.PingCmd, error: any) => {
    if (error) {
      console.log("ERROR in ping from token screen ")
      done(false)
    } else {
      console.log("AppUtil Ping is back ", util.getSecondsDisplay())

      var context: util.Context = util.getNameToContext(util.getProfileName())

      console.log("Have pubk from ping of ", context.username)

      // success, tell ourselves
      // is cmd.pub is in b64
      const pubk: Buffer = util.fromBase64Url(cmd.pub)

      // now that we have the pubk we can set up the context
      context.initialized = false
      util.initContext(context) // fix the wong hash of the name
      context.ourPublicKey = [pubk]
      context = util.getNameToContext(util.getProfileName())
      console.log("Have pubk from ping of ", util.toBase64Url(context.ourPublicKey[0]))

      //util.SetPserverPubKey(util.getProfileName())
      // don't refresh self on success setState(newState)
      localStorage.setItem('knotfree_access_token_v2', theToken);
      console.log("mqtt success 2 pubkey setting localStorage.setItem knotfree_access_token_v2")
      done(true)
    }
  })
}
export function startTheMqtt(done: (ok: boolean) => any) {

  var serverName = util.getServerName()
  if (process.env.NODE_ENV === "development") {
    serverName = serverName.replace("3000", "8085")
  }
  if (serverName.endsWith("/")) {
    serverName = serverName.slice(0, serverName.length - 1)// it has an extr / at the end
  }
  console.log("startTheMqtt with.", serverName)
  mqttclient.StartClientMqtt(theToken, serverName, (errmsg: string) => {

    console.log("returned from mqtt no news is good: ", errmsg)
    if (errmsg.length) {
      console.log("mqtt has err here ", errmsg)
      // failed
      // tell ourselves 
      if (mqttclient.mqttServerThing) {
        mqttclient.mqttServerThing.CloseTheConnect()
      } else {
        console.log("ERROR tryToStartMqttPart2 freaking fail. damn.")
      }
      done(false)

    } else {
      console.log("mqtt 2 success in AppUtil 2")
      done(true)
    }
  })
}

export function getFreeToken(serverName: string, done: (ok: boolean) => any) {
  //var serverName = util.getServerName()
  if (process.env.NODE_ENV === "development") {
    serverName = serverName.replace("3000", "8085")
  }
  if (!serverName.endsWith("/")) {
    serverName += "/"
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
          //setState({ ...state, complaints: "Failed to get free token" })
          done(false)
        } else {
          const asciiTok = Buffer.from(gotTok).toString("utf8")
          console.log("have decoded free token  fetch result ", asciiTok)
          theToken = asciiTok
          // const newState: State = { ...state, complaints: "Got Free Token... " + asciiTok, theToken: asciiTok }
          // localStorage.setItem('knotfree_access_token_v1', asciiTok);
          // setState(newState)
          // props.setAppHasToken(newState)// tell the app 
          done(true)
        }
      })
    }
    else {
      // resp not OK 
      console.log("have get free token fetch problem ", resp)
      done(false)
    }
  }
  )
}

export function pingServer(serverName: string, done: (ok: boolean) => any) {

  serverName = serverName.replace("3000", "8085")
  if (!serverName.endsWith("/")) {
    serverName += "/"
  }
  const hoststr = "http://" + serverName + "api1/getPublicKey"
  console.log("in pingServer with", hoststr)
  const response = fetchWithTimeout(hoststr, {}); // , { mode: "no-cors" });
  response.then((resp: Response) => {
    console.log("pingServer have response ", resp, "from server", hoststr)
    if (resp.ok) {
      resp.text().then((thedata: string) => {
        console.log("pingServer have fetch result ", thedata)
        theKnotPubk = thedata
        done(true)
      })
    }
    else {
      // resp not OK 
      console.log("pingServer have fetch problem ", resp)
      done(false)
    }
  })
  response.catch((err: any) => {
    console.log("pingServer got error contacting host " + hoststr, err)
    done(false)
  })
}

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

function getSampleKnotFreeTokenRequest(): TokenRequest {
  var res: TokenRequest = {
    pkey: "fixme",        //    `json:"pkey"` // a curve25519 pub key of caller
    payload: getSampleKnotFreeTokenPayload(),
    Comment: "For " + util.getProfileName()             // `json:"comment"`
  }
  return res
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
