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

// TODO: use knotfree api directly and dump mqtt.

import mqtt from 'mqtt';

import { ProxyPortInstance, PacketCallParams } from "./Proxy"

import * as util from './Util';
import * as config from './Config';

import * as broadcast from './BroadcastDispatcher'

import { WaitingRequest } from '../api1/Api';  
import * as api from '../api1/Api';  
import * as eventapi from '../api1/Event';  
import * as pingapi from '../api1/Ping'  

type MqttServerPropsType = {

  config: config.ServerConfigList,
  isClient: boolean,
}

export type MqttOptionsType = {
  keepalive: number,
  reschedulePings: boolean,
  protocolId: string,
  protocol: any,
  //protocolVersion: 4,
  protocolVersion: number,//5,
  clean: boolean,//true,
  reconnectPeriod: number,//1000,
  connectTimeout: number,//30 * 1000,
  // will: { // atw FIXME: this will cause error if present. 
  //   topic: string,//"WillMsg",
  //   payload: string,//"Connection Closed abnormally..!",
  //   qos: number,//0,
  //   retain: boolean,//false,
  // },
  rejectUnauthorized: false,

  clientId: string,//this.state.clientId,
  username: string,//this.state.username,
  password: string,//this.state.token
};

const SomeMqttOptions: MqttOptionsType = {

  keepalive: 30 * 10,
  reschedulePings: true,

  protocolId: "MQTT",
  protocol: "ws", // 
  //protocolVersion: 4,
  protocolVersion: 5, // we need this. not 4

  clean: true,
  reconnectPeriod: 4000, // try reconnect after 4 sec
  connectTimeout: 300 * 1000,  // 5 minutes

  // will: {  // atw FIXME: it's not just that we don't implement 'will' it's that it errors. FIXME: fix the go
  //   topic: "WillMsg",
  //   payload: "Connection Closed abnormally..!",
  //   qos: 0,
  //   retain: false,
  // },
  rejectUnauthorized: false,

  clientId: "anyclient",//this.state.clientId,
  username: "someuser",//this.state.username,
  password: "",// this.state.token
};

var haveWeEverInitialisedThatPingTimer: boolean = false;

  // map from an api hash val to the handler
  // there's really just one of these. 
  // returnsWaitingMap is really more of an Api1 thing because it's the
  // dispatcher for api1. It's here because of how close to mqtt onMessage it is. 
var  returnsWaitingMap = new Map<string, WaitingRequest>()

export function returnsWaitingMapset( a:string, w:WaitingRequest){
  //console.log("setting returnsWaitingMapset  ",a)
  returnsWaitingMap.set(a,w)
}

var topic2port = new Map<string, string>()
var topic2datafolder = new Map<string, string>()

export function topic2portset( a:string, b:string){
  console.log("setting topic2portset ",a,b)
  topic2port.set(a,b)
}

export function topic2datafolderset( a:string, b:string){
  //console.log("setting topic2datafolderset ",a,b)
  topic2datafolder.set(a,b)
}


export class MqttTestServerTricks {

  client: any // mqtt client
  //timerID: NodeJS.Timeout

  isClient : boolean // we're in the browser if true. otherwise, node.js

  //state: MqttTestScreenState
  connectStatus: string

  server_config: config.ServerConfigList
  // topic2port = new Map<string, string>()
  // topic2datafolder = new Map<string, string>()
  hashed2name = new Map<string, string>()// lookup the hash of a topic/name and get the name.

  myReplyChannel: string

  cleanerIntervalID: NodeJS.Timeout

  restartCallback: () => any

  host : string
  mqttOptions: MqttOptionsType
  successCallback: (err: string) => any 

  constructor(props: MqttServerPropsType, restartCallback: () => any) {

    this.restartCallback = restartCallback
    this.host = "later"
    this.mqttOptions = SomeMqttOptions
    this.successCallback = (err: string) => {}

    this.server_config = props.config
    this.cleanerIntervalID = setInterval(cleaner, 1000 * 1); //  

    this.myReplyChannel = "=" + util.randomString(32)
    //this.topic2port = new Map<string, string>()
    this.isClient = props.isClient
    if (props.isClient === false) {
      // fixme with config
      for (let item of props.config.items) {
        topic2portset(item.name.toLowerCase(), item.port)
        topic2datafolderset(item.name.toLowerCase(), item.directory)
      }

      topic2port.forEach((value: string, key: string) => {
        var k2 = util.KnotNameHash(key.toLowerCase())
        k2 = "=" + k2
        //console.log(" new k,v ", k2, value)
        this.hashed2name.set(k2, key.toLowerCase())
      })

      // load up the api with handlers for the various api's
      for ( var wr of   api.getAllHooks() ){
        returnsWaitingMap.set(wr.id,wr)
      }
    } else {
      // we're in the client in chrome 
      // eventapi.InitApiHandler(this.returnsWaitingMap)
      var wr = eventapi.getWr()
      returnsWaitingMap.set(wr.id,wr)
      wr = pingapi.getWr()
      returnsWaitingMap.set(wr.id,wr)
    }

    this.connectStatus = "closed"

    var timeout = 30000 // 240 * 1000 //4*60*1000
    console.log("initializing ping setInterval")
    
    //this.timerID = 
    //var ourPubKey64: string = util.toBase64Url(util.getCurr entContext().ourPublicKey)
    if ( haveWeEverInitialisedThatPingTimer === false) {
      setInterval(() => { this.sendAPing() }, timeout);
    }
    haveWeEverInitialisedThatPingTimer = true

    this.client = null
  }

  sendAPing() {

    console.log("mqtt ping")
 
    const receiver: pingapi.PingReceiver = (cmd: pingapi.PingCmd, error: any) => {
      console.log("mqtt client ping receiver", (error) ? "ERROR:"+error: "OK")//: pingapi.PingReceiver ", cmd, error)
      if ( (error!=undefined) && this.isClient !== true ){
        console.log("mqtt client ping ERROR RESTARTING err=",error) 
        this.client.end(() => {
          console.log("Calling connect again") 
          this.client = mqtt.connect(this.host, this.mqttOptions)
          console.log("finished connect ")
          this.setupClient()
        });
      }
    }
    pingapi.IssueTheCommand("Anonymous", "Anonymous", receiver) // todo: intercept in knotfree, reserve name Anonymous forever.
  }

  CloseTheConnect() {

    // don't do anything. The client will reconnect. see the error of ping
    // and the onError

    // console.log("mqtt CloseTheConnect is a messy mess ")
    // if (this.client) {
    //   this.client.end();
    // }
    // //this.client = undefined
    // //clearInterval(this.cleanerIntervalID)
    // // and restart:: 
    // const timeout = 5000
    // //if (mqttServerThing !== undefined) {
    // setInterval(() => {
    //   if (this.client ) {
    //     mqttServerThing.restartCallback()
    //   }
    // }, timeout);
    // //}
  }

  subscribeFunc = (key: string) => {
    const qos = 0
    var topic = key
    if (!topic.startsWith("=")) {
      topic = key.toLowerCase()
    }

    //console.log("setting subscribe topic", topic)
    this.client.subscribe(topic, { qos }, (error: any) => {
      if (error) {
        console.error("have error on subscribe ", error, topic)
      } else {
        console.log("subscribe ok ", topic, " aka ", "=" + util.KnotNameHash(topic))
      }
    });
  }

  unsubscribeFunc = (key: string) => {
    const qos = 0
    var topic = key
    if (!topic.startsWith("=")) {
      topic = key.toLowerCase()
    }

    console.log("setting unsubscribe topic", topic)
    this.client.unsubscribe(topic, { qos }, (error: any) => {
      if (error) {
        console.error("have error on unsubscribe ", error, topic)
      } else {
        console.log("unsubscribe ok ", topic)
      }
    });
  }
  
  setupClient = () => {
    this.client.on("connect", () => {
      console.log(" Have on connect cb ")
      var complaints = ""
      if (!this.client.connected) {
        console.log("ERROR ERROR Mqtt failed to connect to " + this.host + " with token. ")
        complaints = "Mqtt failed to connect to " + this.host + " with token. "
        this.successCallback(complaints)
        this.successCallback = () => { } // nothing
        this.CloseTheConnect()
        return;
      }
      if (this.client) {
        topic2port.forEach((value: string, key: string) => {
          //console.log("will now be subscribing to ", key, value);
        });

        this.subscribeFunc(this.myReplyChannel)
        topic2port.forEach((value: string, key: string) => { this.subscribeFunc(key) })
        
        broadcast.SubscribeAll()

        this.successCallback("") // no complaints
        this.successCallback = () => { } // nothing

      } else {
        // what do we do when client is null reconnect? 
        this.successCallback("mqtt client was null") //   complaints
        this.successCallback = () => { } // nothing
      }
      setTimeout(() => { this.sendAPing() }, 500);
   
    });

    this.client.on("error", (err: any) => {
      console.error("MQTT error: ", err);
      this.successCallback("MQTT error: " + err) //   complaints
      this.successCallback = () => { } // nothing
      this.CloseTheConnect()
      console.log("mqtt client ERROR RESTARTING err=",err) 
        this.client.end(() => {
          console.log("Calling connect again2") 
          this.client = mqtt.connect(this.host, this.mqttOptions)
          console.log("finished connect2 ")
          this.setupClient()
        });
    });
    this.client.on("failure", (message: any) => {
      console.error("MQTT failure: ", message);
      this.successCallback("MQTT failure: " + message)
      this.successCallback = () => { } // nothing
      this.CloseTheConnect()
    });
    this.client.on("reconnect", () => {
      console.log("MQTT Reconnecting " + new Date() + " to " + this.host)
      // repeat the subscriptions should this be setupClient ?
      this.subscribeFunc(this.myReplyChannel)
      topic2port.forEach((value: string, key: string) => { this.subscribeFunc(key) })
      broadcast.SubscribeAll()
    });
    this.client.on("message", (topic: any, message: any, packet: any) => {

      // this is where the deliveries arrive fresh from mqtt
      // console.log("mqtt_stuff have on message ", message.toString('utf8'))
      // console.log("have on  message packet ", packet)
      // console.log("have user data ", packet.properties.userProperties)

      const returnAddress = packet.properties.responseTopic// has responseTopic: and userProperties:
      // console.log("have top of on message returnAddress ", returnAddress)
      // console.log("mqtt_stuff have a message: " + msgstring.substr(0, end))
      // console.log("have topic " + topic)

      // we need to unpack this bad boy right here
      const gotOptions: Map<string, string> = util.UnpackMqttOptions(packet)
      const isApi = gotOptions.get("api1")
      // console.log("found user val for api1 ", isApi) // should be a big key, or short api name

      if (isApi !== undefined) {

        // the are several possibilities now.
        // 1) it's an api call. Normally this means we're on the server. 
        // 2) it's a return. Normally this mean we're in the client. 
        // Event can happen. Ping can happen. Ping's are api1 but no crypto. 

        const returnHandler = returnsWaitingMap.get(isApi)
        if (returnHandler !== undefined) {

          returnHandler.message = message
          returnHandler.options = gotOptions
          returnHandler.topic = topic
          returnHandler.returnAddress = returnAddress

          if (returnHandler.permanent) {  // an api call

            api.HandleApiIncoming(this, isApi, returnHandler)

          } else { // a return

            returnsWaitingMap.delete(isApi)
            api.HandleApiReplyArrival(this, isApi, returnHandler)

          }

        } else {
          // if returnHandler is undefined then this packet is not for us.
          // no returnHandler found
          console.log("ERROR had api1 but unknown cmd. did you forget to 'load up the api with handlers for the various'? cmd was:", isApi)

        }
        // var ourParams: WaitingRequest = {
        //   id: "unknown",
        //   when: 0,
        //   permanent: false,
        //   topic: topic,
        //   message: message,
        //   packet: packet,
        //   replydata: Buffer.from(""),
        //   waitingCallbackFn: (wr: WaitingRequest, err: any) => { },
        //   options: gotOptions,
        //   returnAddress: packet.properties.responseTopic,
        //   //callerPublicKey64: "unknown"
        // }

        // mqtt_util.HandleApi1PacketIn(this, isApi, ourParams)


      } else {
        // the proxy route - has no crypto
        // maybe
        const str = Buffer.from(message).toString('utf8')
        if (!str.startsWith("GET ")) {
          console.log("Spooky: Have unknown packet. not api1 and not GET ", topic, str)
        } else {
          // the proxy route 
          const realname = this.hashed2name.get(topic)
          if (!realname) {
            console.log("failed to find topic in map", topic, this.hashed2name)
            if (topic === this.myReplyChannel) {
              console.log("myReplyChannel has a proxy request??", topic, this.hashed2name)
            }
            //var gotOptions: Map<string, string> = mqtt_util.UnpackMqttOptions(packet)
            console.log("failed to find topic. Options:", gotOptions)

            // TODO: this is where the billing errors come through eg  BILLING ERROR 330.38766 bytes out > 128/s
            // FIXME: push to somewhere. It's in the client so ...  
            console.log("failed to find topic. Message:", Buffer.from(message).toString('utf8'))

            // FIXME: systemErrorReceiver( Buffer.from(message).toString('utf8') )

          } else {
            var portStr = topic2port.get(realname)
            if (portStr === undefined) {
              console.log("ERROR we really need to know a port for EVERY name ", realname, topic)
              portStr = "9090"
            }
            // message is supposed to be a GET

            console.log("in the proxy route now", topic)
            // i guess. what todo with non api1 packets?
            // fall back and handle packet as proxy request
            var callParams = new PacketCallParams(message, topic, packet)
            var ppi = new ProxyPortInstance(this, topic, returnAddress, portStr, callParams)
            ppi.go()
          }
        }
      }
    });
  } 

  handleMqttConnect = (host: string,
    mqttOptions: MqttOptionsType,
    successCallback: (err: string) => any) => {

    console.log("have handleMqttConnect only call this ONCE", host)

    this.successCallback = successCallback

    mqttOptions.password = this.server_config.token
    mqttOptions.clientId = "someweirdclientid2345"
    mqttOptions.username = "someuser2345"
    mqttOptions.protocol = "ws"

    host = 'ws://' + host + '/mqtt'
    this.host = host
    this.mqttOptions = mqttOptions
    this.client = mqtt.connect(host, mqttOptions)

    //console.log("have client ? ", typeof this.client)

    console.log("host ", host)
    //console.log("options ", mqttOptions)

    if (this.client) { 

      this.setupClient()

    } else {
      console.error("ERROR client was null")
    }
  };

  handleDisconnect = () => {
    console.log("ERROR   !!!   have handleDisconnect ")
    if (this.client) {
      this.client.end(() => {
        this.client = null
        console.log("finished disconnect ")
      });
    }
  };
}

export var mqttServerThing: MqttTestServerTricks;
export var isClient: boolean;

// im not sure if this works correctly
// export function xxxxgetMqttThing(): MqttTestServerTricks | undefined {
//   if (mqttServerThing !== undefined) {
//     if (mqttServerThing.client !== undefined) {
//       return mqttServerThing
//     }
//   }
//   console.log("WARNING why is mqtt undefined?")
//   return undefined
// }

// This creates timeouts for waiting commands. 
function cleaner() {

  //console.log("in cleaner")
  var mqtt = mqttServerThing
  if (mqtt !== undefined) {

    // timeout the broadcast subscriptions
    broadcast.CleanOldItems()

    // timeout the returnsWaitingMap
    var deletelist: string[] = []

    returnsWaitingMap.forEach((value: WaitingRequest, key: string) => {
      //console.log(" mqtt.returnsWaitingMap key ", key, value)
      const nowms = util.getMilliseconds()
      if (!value.permanent) {
        if ((value.when + 15000) < nowms) { // timeout after 15 seconds 
          deletelist.push(key)
        }
      }
    });
    deletelist.forEach((key: string) => {
      var mqtt = mqttServerThing
      if (mqtt !== undefined) {
        const val = returnsWaitingMap.get(key)
        if (val !== undefined) {

          console.log("cleaning ", key )//, val)

          var err = "ERROR ERROR timeout error " + key
          val.waitingCallbackFn(val, err)
          returnsWaitingMap.delete(key)
        }
      }
    })
  }
}

export function StartClientMqtt(aToken: string, aServer: string, successCb: (msg: string) => any) {

  console.log("StartClientMqtt called")

  // is there a sooner place to init context? for client.
  const anonContext: util.Context = {
    ...util.emptyContext,
    username: "Anonymous",
    password: ["Anonymous","Anonymous"]
  }
  util.initContext(anonContext)
  util.pushContext(anonContext)

  const profileContext: util.Context = {
    ...util.emptyContext,
    username: util.getProfileName(),
    password: [],
  }
  util.initContext(profileContext)
  util.pushContext(profileContext)

  const start = () => {

    var ourConfig: config.ServerConfigList = {
      token: aToken,
      items: []
    }
    const props: MqttServerPropsType = {
      config: ourConfig,
      isClient: true
    }

    mqttServerThing = new MqttTestServerTricks(props, () => {
      console.log("RE-StartClientMqtt called") // this is a dead feature
      // no no no no start()
    })

    const options = SomeMqttOptions

    mqttServerThing.handleMqttConnect(aServer, options, successCb)
  }

  start()
}

export function StartServerMqtt(ourConfig: config.ServerConfigList) {

  const isClient_ = false

  console.log("StartServerMqtt in run_forever")// with ", ourConfig)

  isClient = isClient_
      // we'll have to glom the servername from the token
      var server: string
      var complaint: string
      [server, complaint] = util.VerifyToken(ourConfig.token)
      if (complaint.length !== 0) {
        console.log("ERROR tartServerMqtt util.VerifyToken has complaint ", complaint)
      }
  

  const start = () => {
    const props: MqttServerPropsType = {
      config: ourConfig,
      isClient: isClient_
    }
    mqttServerThing = new MqttTestServerTricks(props, () => {
      
      console.log("RE-StartServerMqtt called")
      console.log("RE-StartServerMqtt called")
      console.log("RE-StartServerMqtt called")

      //start()
      // mqttServerThing.handleMqttConnect( server, options, (msg: string) => {
      //   console.log("RE- handleMqttConnect complete with:", msg)
      // })
    })

    const options = SomeMqttOptions

    mqttServerThing.handleMqttConnect(server, options, (msg: string) => {
      console.log(" handleMqttConnect complete with:", msg)
    })

  }
  start()

}