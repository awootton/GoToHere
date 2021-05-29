

//import { updateTypeLiteralNode } from 'typescript';
import * as api from '../api1/Api';
import * as mqtt_stuff from './MqttClient';
import * as util from './Util';

// we should move this to Api TODO: soon seee HandleApiIncoming
// this is different on client and server.
// Deprecated. TODO: delete me. 
export function xxxHandleApi1PacketIn( mqttThing: mqtt_stuff.MqttTestServerTricks,
                 isApi:string,
                 ourParams: api.WaitingRequest ) {

    var returnHandler = mqttThing.returnsWaitingMap.get(isApi)
    if (returnHandler !== undefined) {

        // some of the things are known to the handler
        ourParams.id = returnHandler.id
        ourParams.when = returnHandler.when
        ourParams.permanent = returnHandler.permanent
        ourParams.replydata = returnHandler.replydata
        ourParams.waitingCallbackFn = returnHandler.waitingCallbackFn // the main thing !
        //ourParams.callerPublicKey64 =  ourParams.options.get("pubk") || ""
        
      // const hadReturnHandler = returnHandler
      // it's a return. Just dispatch it,
      if (!returnHandler.permanent) {
        mqttThing.returnsWaitingMap.delete(isApi)
      }

      const msg:string = Buffer.from(ourParams.message).toString('utf-8')
      const isPingPacket = msg.startsWith('{"cmd":"ping"')
      const weShouldSkipCrypto: boolean = ! api.BoxItUp || isPingPacket
   
      // // FIXME needs crypto  - unbox it now
      if ( weShouldSkipCrypto) {

        // console.log("calling return handler callbask ping")// if call a callbask yiu turn to stone 
        ourParams.waitingCallbackFn(ourParams)

      } else {

        const message:Buffer = Buffer.from(ourParams.message)
      
        const nonce: Buffer = Buffer.from(ourParams.options.get("nonc") || "")
        if ( nonce.length === 0 ){
          console.log("ERROR missing nonc ")
        }
        const theirPubk : string = ourParams.options.get("pubk") || ""
        if ( theirPubk.length === 0 ){
          console.log("ERROR missing pubk ")
        }
        const theirPublicKey:Buffer = util.fromBase64Url(theirPubk)
        const secret: Buffer = util.getHashedTopic2Context(ourParams.topic).ourSecretKey 

        const unboxed:Buffer = util.UnBoxIt(message,nonce,theirPublicKey,secret)
        ourParams.message = unboxed

        if ( unboxed.length === 0) {
          console.log("unboxing disaster inHandleApi1PacketIn  ")
        } else {
          console.log("HandleApi1PacketIn calling 2 waitingCallbackFn", unboxed.toString('utf8'))
          ourParams.waitingCallbackFn(ourParams)
        }
      }

    } else {
      // no returnHandler found
      console.log("ERROR had api1 but unknown cmd. did you forget to 'load up the api with handlers for the various'? cmd was:", isApi) 

    }
}
