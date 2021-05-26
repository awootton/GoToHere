

import * as api1 from '../api1/Api';
import * as mqtt_stuff from './MqttClient';

export function HandleApi1PacketIn( mqttThing: mqtt_stuff.MqttTestServerTricks,
                 isApi:string,
                 ourParams: api1.WaitingRequest ) {
    var returnHandler = mqttThing.returnsWaitingMap.get(isApi)
    if (returnHandler !== undefined) {

        // some of the things are known to the handler
        ourParams.id = returnHandler.id
        ourParams.when = returnHandler.when
        ourParams.permanent = returnHandler.permanent
        ourParams.replydata = returnHandler.replydata
        ourParams.waitingCallbackFn = returnHandler.waitingCallbackFn // the main thing !
        ourParams.callerPublicKey64 =  ourParams.options.get("pubk") || "unfound"
        
      // const hadReturnHandler = returnHandler
      // it's a return. Just dispatch it,
      if (!returnHandler.permanent) {
        mqttThing.returnsWaitingMap.delete(isApi)
      }

      // // FIXME needs crypto  - unbox it now
      if ( returnHandler.skipCryptoForThisOne === true) {

        // console.log("calling return handler callbask ping")// if call a callbask yiu turn to stone 
        ourParams.waitingCallbackFn(ourParams)

      } else {

        // console.log("HandleApi1PacketIn Return Handler unbox usernameFromApp  ",  c_util.contexts[c_util.currentIndex].usernameFromApp )
        // console.log("HandleApi1PacketIn Return Handler unbox passwordFromApp  ",  c_util.contexts[c_util.currentIndex].passwordFromApp )
        // console.log("HandleApi1PacketIn Return Handler unbox profileNameFromApp  ",  c_util.contexts[c_util.currentIndex].profileNameFromApp )
        // //console.log("HandleApi1PacketIn Return Handler unbox tokenFromApp  ",  c_util.contexts[c_util.currentIndex].tokenFromApp )
        // console.log("HandleApi1PacketIn Return Handler unbox serverPubKeyFromApp   ",  c_util.contexts[c_util.currentIndex].serverPubKeyFromApp )
   
        // FIXME unbox it now. we're on the server seeing an api1 request
        // figure out which c_util.context to use 
        
        //console.log("calling return handler callbask")
        ourParams.waitingCallbackFn(ourParams)
      }

    } else {
      // no returnHandler found
      console.log("ERROR had api1 but unknown cmd. did you forget to 'load up the api with handlers for the various'? cmd was:", isApi) 

    }
}

// UnpackMqttOptions will pull the key,value pairs from the mqtt userProperties
// and put them into a Map of strings and not a funky js object
// sometimes they are wrapped with [ ] and I don't know why.
// probably the mqtt5 spec allows mutliple values which is dumb.
export function UnpackMqttOptions( packet : any ) :Map<string, string>  {
    var gotOptions = new Map<string, string>()
    //console.log("unpacking packet.properties.userProperties ", Object.keys(packet.properties.userProperties))
    Object.keys(packet.properties.userProperties).forEach((key: string) => {
      var val = packet.properties.userProperties[key]// copy over the user stuff
      if (val) {
        var tmp = val.toString()
        if (tmp[0] === '[') {
          tmp = tmp.substr(1)
        }
        if (tmp[tmp.length - 1] === ']') {
          tmp = tmp.substr(0, tmp.length - 1)
        }
        gotOptions.set(key, tmp)
      }
    });
    //console.log(" userProperties unpacked as ",  gotOptions )
    return gotOptions
}