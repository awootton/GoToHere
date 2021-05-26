

import mqtt from 'mqtt';

import { ProxyPortInstance, PacketCallParams } from "./Proxy"


import * as util from './Util';
import * as config from './Config';


import * as get_posts from '../api1/GetPosts';

import { WaitingRequest } from '../api1/Api';

import * as mqtt_util from "./MqttClient2"

//import * as c_util from "../components/CryptoUtil"
import * as pingapi from '../api1/Ping'
import * as friendsapi from '../api1/GetFriends'
import * as savepostapi from '../api1/SavePost'
import * as deletepostapi from '../api1/DeletePost'
import * as broadcast from '../server/BroadcastDispatcher'
import * as eventapi from '../api1/Event'

type MqttServerPropsType = {

  config: config.ServerConfigList,
  isClient: boolean,

}

export type MqttOptionsType = {
  keepalive: number,
  reschedulePings : boolean,
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
  reschedulePings : true,

  protocolId: "MQTT",
  protocol: "ws", // 
  //protocolVersion: 4,
  protocolVersion: 5, // we need this. not 4

  clean: true,
  reconnectPeriod: 4000, // try reconnect after 4 sec
  connectTimeout: 300 * 1000 ,  // 5 minutes

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

export class MqttTestServerTricks {

  client: any // mqtt client
  //timerID: NodeJS.Timeout

  //state: MqttTestScreenState
  connectStatus: string

  server_config: config.ServerConfigList
  topic2port = new Map<string, string>()
  topic2datafolder = new Map<string, string>()
  hashed2name = new Map<string, string>()// lookup the hash of a topic/name and get the name.

  // map from an api hash val to the handler
  returnsWaitingMap = new Map<string, WaitingRequest>()

  myReplyChannel: string

  cleanerIntervalID: NodeJS.Timeout

  restartCallback: () => any

  constructor(props: MqttServerPropsType, restartCallback: () => any) {

    this.restartCallback = restartCallback

    this.server_config = props.config
    this.cleanerIntervalID = setInterval(cleaner, 1000 * 100 ); // FIXME cleaner is off 

    this.myReplyChannel = "=" + util.randomString(32)
    this.topic2port = new Map<string, string>()
    if (props.isClient === false) {

      // fixme with config
      for (let item of props.config.items) {
        this.topic2port.set(item.name, item.port)
        this.topic2datafolder.set(item.name, item.directory)
      }

      this.topic2port.forEach((value: string, key: string) => {
        var k2 = util.KnotNameHash(key)
        k2 = "=" + k2
        //console.log(" new k,v ", k2, value)
        this.hashed2name.set(k2, key)
      })

      // load up the api with handlers for the various api's
      get_posts.InitApiHandler(this.returnsWaitingMap)
      pingapi.InitApiHandler(this.returnsWaitingMap)
      friendsapi.InitApiHandler(this.returnsWaitingMap)
      friendsapi.InitApiHandler(this.returnsWaitingMap)
      savepostapi.InitApiHandler(this.returnsWaitingMap)
      deletepostapi.InitApiHandler(this.returnsWaitingMap)
      eventapi.InitApiHandler(this.returnsWaitingMap)

      //console.log(" returnsWaitingMap initialised to ", this.returnsWaitingMap)

    } else {
      // we're in the client in chrome 
      eventapi.InitApiHandler(this.returnsWaitingMap)
    }

    this.connectStatus = "closed"

    var timeout = 240 * 1000 //4*60*1000
    if (haveWeEverInitialisedThatPingTimer) {
      timeout = 30 * 1000 * 999999
      console.log("WARNING don't init ping timer twice")
    }
    console.log("initializing ping setInterval")
    haveWeEverInitialisedThatPingTimer = true
    //this.timerID = 
    //var ourPubKey64: string = util.toBase64Url(util.getCurrentContext().ourPublicKey)
    setInterval(() => { this.sendAPing() }, timeout);

    this.client = null
  }

  // gotAPong( wr: WaitingRequest , err:any ) {
  //   console.log("mqtt pong " , Buffer.from(wr.replydata).toString("utf8") , err)
  // }  

  sendAPing() {

    console.log("mqtt ping")

    const receiver: pingapi.PingReceiver = (cmd: pingapi.PingCmd, error: any) => {
      console.log("mqtt client receiver")//: pingapi.PingReceiver ", cmd, error)
    }
    pingapi.IssueTheCommand(receiver)

    // send ping.
    //console.log("mqtt ping ing", ourPubKey64)
    // if (this.client) {
    //   //this.client.pingreq()
    //   //console.log("have client ping")
    //   var topic =  c_util.getCurrentContext().profileNameFromApp
    //   var message = "ping " + pubKey
    //   // var options = {
    //   //   retain: false,
    //   //   qos: 0,
    //   //   properties: {
    //   //     responseTopic: this.myReplyChannel,
    //   //     userProperties: {
    //   //     }
    //   //   }
    //   // };

    //   var destTopic = topic

    //   const random24 = util.randomString(24)
    //   const timeout = Date.now()  

    //   var waitingRequest: WaitingRequest = {
    //     id: random24,
    //     when: timeout,
    //     permanent: false,
    //     topic: destTopic,
    //     message: new Uint8Array(), // going out
    //     //packet: undefined, // coming in
    //     replydata: new Uint8Array(), // when coming back
    //     waitingCallbackFn: pongCallback, // when coming back

    //     options: new Map<string, string>(),
    //     returnAddress: this.myReplyChannel
    // }

    // this.returnsWaitingMap.set(waitingRequest.id, waitingRequest)
    // // now send the packet

    // var message = "ping " + "skdjkduehbdFIXME"
    // // packet.properties.userProperties
    // // let utf8Encode = new TextEncoder();
    // var options = {
    //     retain: false,
    //     qos: 0,
    //     properties: {
    //       responseTopic: this.myReplyChannel,
    //         userProperties: {
    //             "api1": "pong",
    //             "id": random24
    //         }
    //     }
    // };

    // // console.log("the c_util public is ",  c_util.toBase64Url(c_util.thePublicKey) )
    // // console.log("the c_util public is ",   c_util.thePublicKey64)

    // // console.log("the c_util their public is ",  c_util.toBase64Url(c_util.thePublicKey) )
    // // console.log("the c_util public is ",   c_util.thePublicKey64)

    // console.log("api1 posting box usernameFromApp  ",  c_util.getCurrentContext().usernameFromApp )
    // console.log("api1 posting box passwordFromApp  ",  c_util.getCurrentContext().passwordFromApp )
    // console.log("api1 posting box profileNameFromApp  ",  c_util.getCurrentContext().profileNameFromApp )
    // //console.log("api1 posting box tokenFromApp  ",  c_util.getCurrentContext().tokenFromApp )
    // console.log("api1 posting box serverPubKeyFromApp   ",  c_util.getCurrentContext().serverPubKeyFromApp )



    // // client: 

    // // FIXME needs crypto  - box it up
    // // this is client to server api request
    // //var nonce = random24 // Buffer.from(util.randomString(24))
    // // client is anon aka me

    // var context = c_util.getCurrentContext()
    // c_util.initContext(context)


    //   // Ping not needs crypto  - don't box it up / what is the servers public key?
    //   this.client.publish(topic, message, options)

    // }
  }

  CloseTheConnect() {
    console.log("mqtt CloseTheConnect")
    if (this.client) {
      this.client.end();
    }
    this.client = undefined
    clearInterval(this.cleanerIntervalID)
    // and restart:: 
    const timeout = 5000
    //if (mqttServerThing !== undefined) {
      setInterval(() => { 
        if (mqttServerThing !== undefined) {
          mqttServerThing.restartCallback() 
        }
      }, timeout);
    //}
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
        console.log("subscribe ok ", topic, " aka ", "="+util.KnotNameHash(topic) )
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

  handleMqttConnect = (host: string,
    mqttOptions: MqttOptionsType,
    successCallback: (err: string) => any) => {

    console.log("have handleMqttConnect", host)

    mqttOptions.password = this.server_config.token
    mqttOptions.clientId = "someweirdclientid2345"
    mqttOptions.username = "someuser2345"
    mqttOptions.protocol = "ws"

    host = 'ws://' + host + '/mqtt'
    this.client = mqtt.connect(host, mqttOptions)

    //console.log("have client ? ", typeof this.client)

    console.log("host ", host)
    //console.log("options ", mqttOptions)

    if (this.client) {

      this.client.on("connect", () => {
        console.log(" Have on connect cb ")
        var complaints = ""
        if (!this.client.connected) {
          console.log("Mqtt failed to connect to " + host + " with token. ")
          complaints = "Mqtt failed to connect to " + host + " with token. "
          successCallback(complaints)
          successCallback = () => { } // nothing

          this.CloseTheConnect()
          return;
        }
        if (this.client) {
          this.topic2port.forEach((value: string, key: string) => {
            //console.log("will now be subscribing to ", key, value);
          });

          this.subscribeFunc(this.myReplyChannel)
          this.topic2port.forEach((value: string, key: string) => { this.subscribeFunc(key) })
          broadcast.SubscribeAll()

          successCallback("") // no complaints
          successCallback = () => { } // nothing

        } else {
          // what do we do when client is null reconnect? 
          successCallback("mqtt client was null") //   complaints
          successCallback = () => { } // nothing
        }
        setTimeout(() => { this.sendAPing() }, 500);
        // setTimeout(() => { this.sendAPing() }, 600);
        // setTimeout(() => { this.sendAPing() }, 700);
        // setTimeout(() => { this.sendAPing() }, 800);
        // setTimeout(() => { this.sendAPing() }, 900);
      });

      this.client.on("error", (err: any) => {
        console.error("MQTT error: ", err);
        successCallback("MQTT error: " + err) //   complaints
        successCallback = () => { } // nothing
        this.CloseTheConnect()
      });
      this.client.on("failure", (message: any) => {
        console.error("MQTT failure: ", message);
        successCallback("MQTT failure: " + message)
        successCallback = () => { } // nothing
        this.CloseTheConnect()
      });
      this.client.on("reconnect", () => {
        console.log(" Reconnecting " + new Date())
        // repeat the subscriptions
        this.subscribeFunc(this.myReplyChannel)
        this.topic2port.forEach((value: string, key: string) => { this.subscribeFunc(key) })
        broadcast.SubscribeAll()

      });
      this.client.on("message", (topic: any, message: any, packet: any) => {
        // this is where the deliveries arrive fresh from mqtt
        // console.log("mqtt_stuff have on message ", message.toString('utf8'))
        // see notes 
        // console.log("have on  message packet ", packet)
        // console.log("have user data ", packet.properties.userProperties)

        var returnAddress = packet.properties.responseTopic// has responseTopic: and userProperties:
        //console.log("have top of on message returnAddress ", returnAddress)
        //console.log("mqtt_stuff have a message: " + msgstring.substr(0, end))
        //console.log("have topic " + topic)

        // we need to unpack this bad boy right here
        var gotOptions: Map<string, string> = mqtt_util.UnpackMqttOptions(packet)

        var isApi = gotOptions.get("api1")
        //console.log("found user val for api1 ", isApi) // should be a big key, or short api name

        if (isApi !== undefined) {

          var ourParams: WaitingRequest = {
            id: "unknown",
            when: 0,
            permanent: false,
            topic: topic,
            message: message,
            packet: packet,
            replydata: Buffer.from(""),
            waitingCallbackFn: (wr: WaitingRequest, err: any) => { },
            options: gotOptions,
            returnAddress: packet.properties.responseTopic,
            callerPublicKey64: "unknown"
          }

          mqtt_util.HandleApi1PacketIn(this, isApi, ourParams)


        } else {
          // the proxy route - has no crypto
          // maybe
          const str = Buffer.from(message).toString('utf8')
          if ( ! str.startsWith("GET ")) {
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
            var portStr = this.topic2port.get(realname)
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
        }}
      });
    } else {
      console.error("ERROR client was null")
    }
  };

  handleDisconnect = () => {
    console.log("have handleDisconnect ")
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
export function getMqttThing(): MqttTestServerTricks | undefined {
  if (mqttServerThing !== undefined) {
    if (mqttServerThing.client !== undefined) {
      return mqttServerThing
    }
  }
  console.log("WARNING why is mqtt undefined?")
  return undefined
}

// This creates timeouts for waiting commands. 
function cleaner() {

  //console.log("in cleaner")
  var mqtt = mqttServerThing
  if (mqtt !== undefined) {

    // timeout the broadcast subscriptions
    broadcast.CleanOldItems()

    // timeout the returnsWaitingMap
    var deletelist: string[] = []

    mqtt.returnsWaitingMap.forEach((value: WaitingRequest, key: string) => {
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
        const val = mqtt.returnsWaitingMap.get(key)
        if (val !== undefined) {
          var err = "ERROR ERROR timeout error " + key
          val.waitingCallbackFn(val, err)
          mqtt.returnsWaitingMap.delete(key)
        }
      }
    })
  }
}

export function StartClientMqtt(aToken: string, aServer: string, successCb: (msg: string) => any) {

  console.log("StartClientMqtt called")

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
      console.log("RE-StartClientMqtt called")
      start()
    })

    const options = SomeMqttOptions

    mqttServerThing.handleMqttConnect(aServer, options, successCb)
  }

  start()

  // var ourConfig: config.ServerConfigList = {
  //   token: aToken,
  //   items: []
  // }
  // const props: MqttServerPropsType = {
  //   config: ourConfig,
  //   isClient: true
  // }
  // mqttServerThing = new MqttTestServerTricks(props)

  // const options = SomeMqttOptions

  // mqttServerThing.handleMqttConnect(aServer, options, successCb)

}

export function StartServerMqtt(ourConfig: config.ServerConfigList) {

  const isClient_ = false

  console.log("StartServerMqtt in run_forever")// with ", ourConfig)

  isClient = isClient_

  const start = () => {
    const props: MqttServerPropsType = {
      config: ourConfig,
      isClient: isClient_
    }
    mqttServerThing = new MqttTestServerTricks(props, () => {
      console.log("RE-StartServerMqtt called")
      start()
    })

    const options = SomeMqttOptions

    // we'll have to glom the servername from the token
    var server: string
    var complaint: string
    [server, complaint] = util.VerifyToken(ourConfig.token)
    if (complaint.length !== 0) {
      console.log("ERROR tartServerMqtt util.VerifyToken has complaint ", complaint)
    }

    mqttServerThing.handleMqttConnect(server, options, (msg: string) => {
      console.log(" handleMqttConnect complete with:", msg)
    })

  }
  start()

}