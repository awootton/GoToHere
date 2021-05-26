 
//import * as mqttserver from '../server/MqttClient';
import {mqttServerThing} from '../server/MqttClient';
import * as util from '../server/Util';
import * as eventapi from '../api1/Event';

//import * as c_util from '../components/CryptoUtil';

export default interface ApiCommand {
    cmd: string
}

 
// we have a map from api1 names to these structs:
// 
export type WaitingRequest = {

    id: string,
    when: number,
    permanent: boolean,

    topic: string, // to retry as necessary  
    message: Uint8Array,// to retry as necessary  

    options: Map<string, string>,
    returnAddress: string,

    callerPublicKey64: string,

    packet?: object, // the mqtt packet received during the reply, try to dep
    replydata: Uint8Array, // during the reply

    waitingCallbackFn: (req: WaitingRequest, err?: any) => void
    // only Ping should EVER set this 
    skipCryptoForThisOne?: boolean // NEVER set this

    context? : util.Context
}

export function SendApiCommandOut(commandWr: WaitingRequest, topic: string, jsonstr: string, finalCallback: (data: Uint8Array, error: any) => void) {

    // const mqtt = mqttServerThing // getMqttThing()
    // if (mqtt === undefined) {
    //     // we may have to wait for a while
    //     console.log("ERROR SendApiCommandOut with no mqtt")
    //     finalCallback(new Uint8Array(), "ERROR mqtt undefined")
    //     return
    // }
    // the command is in the jsonstr 
    if ( ! topic.startsWith("=") ){
        topic = topic.toLowerCase()
    }
    var destTopic = topic

    const random24 = util.randomString(24)
    const timeout = Date.now()

    var context = util.getCurrentContext() // should we do this in caller? It's ambiguous on server

    // const timer = setTimeout(()=>{
    //     console.log("SendApiCommandOut SendApiCommandOut timeout ",  jsonstr )
    //     finalCallback(Buffer.from(""), "SendApiCommandOut timeout")
    // },10 * 1000)

    const localcallbackWithFsData = (req: WaitingRequest, error: any) => {
        //console.log("SendApiCommandOut callback message ", req.message)
        //console.log("SendApiCommandOut callback error ", error)
        //console.log("SendApiCommandOut clearing timeout ")

        //clearTimeout(timer)

        finalCallback(req.message, error)
    }

    var waitingRequest: WaitingRequest = {
        id: random24,
        when: timeout,
        permanent: false,
        topic: destTopic,
        message: new Uint8Array(), // going out
        //packet: undefined, // coming in
        replydata: new Uint8Array(), // when coming back
        waitingCallbackFn: localcallbackWithFsData, // when coming back

        options: new Map<string, string>(),
        returnAddress: mqttServerThing.myReplyChannel,
        callerPublicKey64: commandWr.callerPublicKey64
    }
    
    mqttServerThing.returnsWaitingMap.set(waitingRequest.id, waitingRequest)
   
    // now send the packet

    var message = jsonstr
    // packet.properties.userProperties
    // let utf8Encode = new TextEncoder();
    var options = {
        retain: false,
        qos: 0,
        properties: {
            responseTopic: mqttServerThing.myReplyChannel,
            userProperties: {
                "api1": commandWr.id,
                "nonc": random24,
                "pubk": util.toBase64Url(context.ourPublicKey),
                "debg": "12345678"
            }
        }
    };
    
    if (waitingRequest.skipCryptoForThisOne === true) {

        mqttServerThing.client.publish(topic, message, options)
        //mqtt.client.publish("dummy", message, options)
    
       //mqtt.sendAPing()
    
        console.log("sent out api1 skipCryptoForThisOne  topic,id ", topic, random24, " with " + message, "pubk ", util.getPubkToName(context.ourPublicKey), util.getSecondsDisplay())
    

    } else { // in SendApiCommandOut
        // client: 
        // FIXME needs crypto  - box it up
        // this is the client to server api request
        //var nonce = random24 // Buffer.from(util.randomString(24))
        // client is anon aka me
        mqttServerThing.client.publish(topic, message, options)
        //mqtt.client.publish("dummy", message, options)
    
        if ( ! message.startsWith('{"cmd":"ping"')){ // what the actual fuck is going on here where this is needed?
            //mqttServerThing.sendAPing()
            setTimeout(() => { mqttServerThing.sendAPing() }, 100);
        }
        
        console.log("sent out api1 call topic,id ", topic, random24, " with " + message, "pubk ", util.getPubkToName(context.ourPublicKey), util.getSecondsDisplay())
    }

}

// the buff is the reply already serialized
export const handleSendReplyCallback = (wr: WaitingRequest, replyData: Uint8Array, err: any) => {

    // var strbuf = new TextDecoder().decode(replyData)
    // console.log("api1 gave us ", strbuf)

    //the channel id for return
    var returnId = wr.options.get("nonc")
    if (returnId === undefined) {
        returnId = wr.id
        console.log("ERROR returnId === undefined happened")
    }

    interface LooseObject {
        [key: string]: any
    }

    var options: LooseObject = {
        retain: false,
        qos: 0,
        properties: {
            userProperties: {
                api1: returnId
            }
        }
    };

    // TODO copy over options. ?
    for (let entry of Array.from(wr.options.entries())) {
        let key = entry[0];
        if ( key !== "api1" && key !== "nonc"){
            let value = entry[1];
            options.properties.userProperties[key] = value 
        }
    }

    //console.log("publish api1 reply address:", wr.returnAddress)
    var topic = wr.returnAddress
    if ( ! topic.startsWith("=") ){
        topic = topic.toLowerCase()
    }
    if (wr.skipCryptoForThisOne === true ) {
       
    } else { // in handleSendReplyCallback
                // FIXME needs crypto  - box it up
                // add pubk to options
    }
    // var mqtt = getMqttThing()
    // if ( mqtt ){
        console.log("Sending mqtt.client.publish REPLY with api1 key", options.properties.userProperties["api1"], util.getSecondsDisplay() )
        mqttServerThing.client.publish(topic, replyData, options)
    // } else {
    //     console.log("ERROR no publish due to missing mqtt")
    //     console.log("ERROR no publish due to missing mqtt")
    //     console.log("ERROR no publish due to missing mqtt")
    //     console.log("ERROR no publish due to missing mqtt")
    //     console.log("ERROR no publish due to missing mqtt")
    //     console.log("ERROR no publish due to missing mqtt")
    //     mqtt = getMqttThing()
    // }
}

// Broadcast has no WaitingRequest
export function Broadcast( context: util.Context, something: ApiCommand ) {
   
    var topic = context.username + "_broadcast"
    if ( ! topic.startsWith("=") ){
        topic = topic.toLowerCase()
    }
    const cmd : eventapi.EventCmd = {
        cmd:"Event",
        who: context.username,
        what: something
    }
    var options = {
        retain: false,
        qos: 0,
        properties: {
            responseTopic: context.username,
            userProperties: {
                "api1": "Event",
                "nonc": util.randomString(24),
                "pubk": util.toBase64Url(context.ourPublicKey)
            }
        }
    };

    const message = JSON.stringify(cmd)

    console.log("Api Event Broadcast ", options, message  )

    // const mqtt = getMqttThing()
    // if (mqtt) {
        mqttServerThing.client.publish(topic, message, options)
    // } else {
    //     console.log("ERROR Broadcast fail: no mqtt")
    // }
}
 