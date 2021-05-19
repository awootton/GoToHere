 
import * as mqttserver from '../server/MqttClient';
import * as util from '../server/Util';

//import * as c_util from '../components/CryptoUtil';
 
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

    callerPublicKey: string,

    packet?: object, // the mqtt packet received during the reply, try to dep
    replydata: Uint8Array, // during the reply

    waitingCallbackFn: (req: WaitingRequest, err?: any) => void
    // only Ping should EVER set this 
    skipCryptoForThisOne?: boolean // NEVER set this

    context? : util.Context
}

//  export const emptyWaitingRequest : WaitingRequest = {
//     id: "",
//     when: 0,
//     permanent: false,

//     topic: "none", // to retry as necessary  
//     message: Buffer.from(""),// to retry as necessary  

//     options: new Map<string, string>(),
//     returnAddress: "none",

//     packet?: undefined, // the mqtt packet received during the reply, try to dep
//     replydata: Buffer.from(""), // during the reply

//     waitingCallbackFn: (req: WaitingRequest, err?: any) => {}} 
//  }

export function SendApiCommandOut(commandWr: WaitingRequest, topic: string, jsonstr: string, finalCallback: (data: Uint8Array, error: any) => void) {

    if (mqttserver.mqttServerThing === undefined) {
        // we have to wait for a while
        console.log("this CANNOT happen mqttserver.mqttServerThing === undefined hardly ever")
        finalCallback(new Uint8Array(), "ERROR mqttserver.mqttServerThing == undefined")
        return
    }
    // the command is in the jsonstr 
    var destTopic = topic

    const random24 = util.randomString(24)
    const timeout = Date.now()

    const localcallbackWithFsData = (req: WaitingRequest, error: any) => {
        //console.log("SendApiCommandOut callback message ", req.message)
        //console.log("SendApiCommandOut callback error ", error)
        //console.log("SendApiCommandOut callback message ")
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
        returnAddress: mqttserver.mqttServerThing.myReplyChannel,
        callerPublicKey: "unknown"
    }

    mqttserver.mqttServerThing.returnsWaitingMap.set(waitingRequest.id, waitingRequest)
    // now send the packet

    var message = jsonstr
    // packet.properties.userProperties
    // let utf8Encode = new TextEncoder();
    var options = {
        retain: false,
        qos: 0,
        properties: {
            responseTopic: mqttserver.mqttServerThing.myReplyChannel,
            userProperties: {
                "api1": commandWr.id,
                "nonc": random24
            }
        }
    };
    
    //console.log("sending out api1 call to", topic, " with " + message)

    if (waitingRequest.skipCryptoForThisOne === true) {


    } else { // in SendApiCommandOut
        // client: 
        // FIXME needs crypto  - box it up
        // this is client to server api request
        //var nonce = random24 // Buffer.from(util.randomString(24))
        // client is anon aka me

        var context = util.getCurrentContext()
        util.initContext(context) 
        // set publicKey aka pubk in options
        // replace message

    }
    mqttserver.mqttServerThing.client.publish(topic, message, options)
}

export class ApiCommand {
    cmd: string
    constructor(cmd: string){
        this.cmd = cmd
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
        if ( key !== "api1" && key != "nonc"){
            let value = entry[1];
            options.properties.userProperties[key] = value 
        }
    }

    //console.log("publish api1 reply address:", wr.returnAddress)
    const topic = wr.returnAddress
    if (wr.skipCryptoForThisOne === true ) {
       
    } else { // in handleSendReplyCallback
                // FIXME needs crypto  - box it up
                // add pubk to options
    }
    mqttserver.mqttServerThing.client.publish(topic, replyData, options)
}

