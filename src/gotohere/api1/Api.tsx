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

import { mqttServerThing } from '../knotservice/MqttClient';
import * as util from '../knotservice/Util';

import * as mqttclient from '../knotservice/MqttClient';

import * as eventapi from './Event';
import * as deletepostapi from './DeletePost';
import * as generalapi from './GeneralApi';
import * as commentsapi from './GetComments';
import * as friendsapi from './GetFriends';
import * as getpostsapi from './GetPosts';
import * as likesapi from './IncrementLikes';
import * as pingapi from './Ping';
import * as savepostapi from './SavePost';
import * as timeapi from './GetTimeline';
import * as fsutil from './FsUtil';
import * as configloader from '../knotservice/ConfigLoader'

var ourFs : fsutil.OurFsAdapter 

export function SetFs( anFs : fsutil.OurFsAdapter ){
    ourFs = anFs
}

export function getAllHooks(): WaitingRequest[] {
    var res: WaitingRequest[] = []

    res.push(eventapi.getWr())
    res.push(deletepostapi.getWr())
    res.push(generalapi.getWr())
    res.push(commentsapi.getWr())
    res.push(friendsapi.getWr())
    res.push(getpostsapi.getWr())
    res.push(pingapi.getWr())
    res.push(savepostapi.getWr())
    res.push(eventapi.getWr())
    res.push(likesapi.getWr())
    res.push(timeapi.getWr())

    return res
}

export function setAllFs( anfs: fsutil.OurFsAdapter)  {
  
 //   eventapi.SetFs()
    deletepostapi.SetFs(anfs)
    generalapi.SetFs(anfs)
    commentsapi.SetFs(anfs)
    friendsapi.SetFs(anfs)
    getpostsapi.SetFs(anfs)
 //   pingapi.SetFs(anfs)
    savepostapi.SetFs(anfs)
 //   eventapi.SetFs(anfs)
    likesapi.SetFs(anfs)
    timeapi.SetFs(anfs)
    fsutil.SetFs(anfs)
    configloader.SetFs(anfs)
}


export default interface ApiCommand {
    cmd: string
}

export interface BroadcastCommand {
    cmd: string
}

export const BoxItUp = true // if true encrypt all api traffic except Ping

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

    //packet?: object, // the mqtt packet received during the reply, try to dep
    replydata: Uint8Array, // during the reply

    waitingCallbackFn: (req: WaitingRequest, err?: any) => void

    // only Ping should EVER set this 
    isPing?: boolean
    isEvent?: boolean

    context?: util.Context
    debug?: boolean
}

// Who is this from? The util.getProfileName() ? 
// usually this is called from the various Api's in the client.
//  SendApiCommandOut sets up a return handler and publishes a packet to mqtt.
export function SendApiCommandOut(commandWr: WaitingRequest, topic: string, jsonstr: string, finalCallback: (data: Uint8Array, error: any) => void) {

    // the command is in the jsonstr 
    if (!topic.startsWith("=")) {
        topic = topic.toLowerCase()
    } else {
        console.log("WARNING why are we using a hashed topic?")
    }
    var destTopic = topic

    const isPingPacket = commandWr.isPing === true

    const random24 = util.randomString(24)
    const timeout = Date.now()
    var context = util.getSignedInContext() // should we do this in caller? It's ambiguous on server

    const localcallbackWithFsData = (req: WaitingRequest, error: any) => {

        // this is coming back from the server
        //console.log("SendApiCommandOut callback message ", Buffer.from(req.message).toString('utf8'))
        //console.log("SendApiCommandOut callback error ", error)
        //console.log("SendApiCommandOut clearing timeout ")
        finalCallback(req.message, error)
    }

    var waitingRequest: WaitingRequest = {
        ...commandWr,
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
        context: context
    }

    // when the reply arrives it will have the rand24 as its api1 id and that will match with this:
    mqttclient.returnsWaitingMapset(waitingRequest.id, waitingRequest)

    // now send the packet
    const ourPubk: Buffer = util.getSignedInContext().ourPublicKey[0]
    const theirPubk: Buffer = util.getNameToContext(topic).ourPublicKey[0]

    var message = jsonstr
    // packet.properties.userProperties
    // let utf8Encode = new TextEncoder();
    var options: util.LooseObject = {
        retain: false,
        qos: 0,
        properties: {
            responseTopic: mqttServerThing.myReplyChannel,
            userProperties: {
                "api1": commandWr.id,
                "nonc": random24,
                "pubk": util.toBase64Url(ourPubk),
                //"debg": "12345678"
            }
        }
    };
    if (commandWr.debug === true) {
        options.properties.userProperties["debg"] = "12345678" // trace publish in knotfree
    }

    const weShouldSkipCrypto: boolean = !BoxItUp || isPingPacket
    if (weShouldSkipCrypto) {

        if (mqttServerThing.client === undefined) {
            console.log("ERROR mqttServerThing.client === undefined")
            return
        }
        mqttServerThing.client.publish(topic, message, options)
        if (!isPingPacket) {
            console.log("sent out api1 DANGER skipCryptoForThisOne  topic,id ", topic, random24, " with " + message, "pubk ", util.getPubkToName(context.ourPublicKey[0]), util.getSecondsDisplay())
        }

    } else { // in SendApiCommandOut
        // client: box it up

        console.log("sending api1 call topic,id ", topic, random24, " with " + message, "pubk ", util.getPubkToName(context.ourPublicKey[0]), util.getSecondsDisplay())
        const ourSecret: Buffer = util.getSignedInContext().ourSecretKey[0]

        const boxed: Buffer = util.BoxItItUp(Buffer.from(message), Buffer.from(random24), theirPubk, ourSecret)

        if (mqttServerThing.client === undefined) {
            console.log("ERROR mqttServerThing.client === undefined")
            return
        }
        mqttServerThing.client.publish(topic, boxed, options)

        // message reappears in HandleApi1PacketIn
    }
    if (!isPingPacket) { // what the actual fuck is going on here where this is needed? TODO: FIXME
        // without this the mqtt.client.publish packets get stuck and come out way later
        if (timeoutThing !== undefined) {
            clearTimeout(timeoutThing)
        }
        // some kind of weird race condition? 
        timeoutThing = setTimeout(() => { mqttServerThing.sendAPing() }, 100);        
    }
}

var timeoutThing: NodeJS.Timeout | undefined = undefined

// the buff is the reply already serialized
// SendApiReplyBack is called after HandleApiIncoming 
export const SendApiReplyBack = (wr: WaitingRequest, replyData: Buffer, err: any) => {

    //console.log("api1 gave us ", new TextDecoder().decode(replyData))

    //the channel id for return
    var waitingHandlerId = wr.options.get("nonc")
    if (waitingHandlerId === undefined) {
        waitingHandlerId = wr.id
        console.log("ERROR returnId === undefined happened")
    }

    var options: util.LooseObject = {
        retain: false,
        qos: 0,
        properties: {
            userProperties: {
                // see below api1: waitingHandlerId
            }
        }
    };

    // copy over all the options.
    for (let entry of Array.from(wr.options.entries())) {
        let key = entry[0];
        let value = entry[1];
        options.properties.userProperties[key] = value
    }
    const context = util.getHashedTopic2Context(wr.topic)

    // TODO: api1 and nonc are the same value. optimize.
    options.properties.userProperties["api1"] = waitingHandlerId
    options.properties.userProperties["nonc"] = waitingHandlerId
    options.properties.userProperties["pubk"] = util.toBase64Url(context.ourPublicKey[0])

    //console.log("publish api1 reply address:", wr.returnAddress)
    var topic = wr.returnAddress
    if (!topic.startsWith("=")) {
        console.log("error topic should be hashed in server?") //topic = topic.toLowerCase()
    }
    const isPingPacket = wr.isPing === true
    const shouldSkipCrypto = isPingPacket
    if (shouldSkipCrypto === true) {

        mqttServerThing.client.publish(topic, replyData, options)

    } else { // in handleSendReplyCallback
        //   needs crypto  - box it up
        // added pubk to options
        // can we reuse the nonce? 
        const nonce = Buffer.from(waitingHandlerId)
        const passedPubk: string = wr.options.get("pubk") || "" // but what if ...?
        const theirPublicKey = util.fromBase64Url(passedPubk)// it was sent to us

        const ourSecretKey = context.ourSecretKey

        const boxed = util.BoxItItUp(replyData, nonce, theirPublicKey, ourSecretKey[0])

        mqttServerThing.client.publish(topic, boxed, options)
    }
}

// a server thing, unless it's an Event
// HandleApiIncoming deals with a packet which is an api request
export function HandleApiIncoming(mqttThing: mqttclient.MqttTestServerTricks,
    isApi: string,
    permanent_handler: WaitingRequest) {

    // some of the things are known to the handler
    // ourParams.id = returnHandler.id
    // ourParams.when = returnHandler.when
    // ourParams.permanent = returnHandler.permanent
    // ourParams.replydata = returnHandler.replydata
    // ourParams.waitingCallbackFn = returnHandler.waitingCallbackFn // the main thing !
    // //ourParams.callerPublicKey64 =  ourParams.options.get("pubk") || ""

    // we need to copy it before we pass it off to the various api classes 
    var handler: WaitingRequest = {
        ...permanent_handler
    }

    if (!handler.permanent) {
        console.log("no no no, this is the handler for api calls which are permanent")
        //mqttThing.returnsWaitingMap.delete(isApi)
    }

    const msg: string = Buffer.from(handler.message).toString('utf-8')

    // // FIXME needs crypto  - unbox it now
    const isPingPacket = handler.isPing === true
    const isEventPacket = handler.isEvent === true
    const weShouldSkipCrypto: boolean = !BoxItUp || isPingPacket || isEventPacket
    if (weShouldSkipCrypto) {

        //console.log("calling return handler callbask ping or event")// if ya call a callbask ya turn to dead 
        handler.waitingCallbackFn(handler)

    } else {

        const message: Buffer = Buffer.from(handler.message)

        const nonce: Buffer = Buffer.from(handler.options.get("nonc") || "")
        if (nonce.length === 0) {
            console.log("ERROR missing nonc ")
        }
        const theirPubk: string = handler.options.get("pubk") || ""
        if (theirPubk.length === 0) {
            console.log("ERROR missing pubk ")
        }
        const theirPublicKey: Buffer = util.fromBase64Url(theirPubk)
        const secret: Buffer = util.getHashedTopic2Context(handler.topic).ourSecretKey[0]

        const unboxed: Buffer = util.UnBoxIt(message, nonce, theirPublicKey, secret)
        handler.message = unboxed

        if (unboxed.length === 0) {
            console.log("unboxing disaster inHandleApi1PacketIn  ")
        } else {
            //console.log("HandleApi1PacketIn calling waitingCallbackFn ", unboxed.toString('utf8'))
            handler.waitingCallbackFn(handler)
        }
    }

}
// HandleApiReplyArrival deals with a packet which is a reply to a *previous* api request
// set up by SendApiCommandOut. 
// a client thing.
export function HandleApiReplyArrival(mqttThing: mqttclient.MqttTestServerTricks,
    isApi: string,
    handler: WaitingRequest) {

    if (handler.permanent) {
        console.log("oops, this is the handler for replies which are not permanent")
    }

    const msg: string = Buffer.from(handler.message).toString('utf-8')

    // needs crypto  - unbox it now
    const isPingPacket = handler.isPing === true
    var weShouldSkipCrypto: boolean = !BoxItUp || isPingPacket
    if (weShouldSkipCrypto) {

        //console.log("calling return handler callbask")// if call a callbask yiu turn to stone 
        handler.waitingCallbackFn(handler)

    } else {

        if (handler.context == undefined) {
            console.log("ERROR context was supposed to be set by SendApiCommandOut ")
        }
        const message: Buffer = Buffer.from(handler.message)

        const nonce: Buffer = Buffer.from(handler.options.get("nonc") || "")
        if (nonce.length === 0) {
            console.log("ERROR missing nonc ")
        }
        const theirPubk: string = handler.options.get("pubk") || ""
        if (theirPubk.length === 0) {
            console.log("ERROR missing pubk ")
        }
        const theirPublicKey: Buffer = util.fromBase64Url(theirPubk)
        const context = handler.context || util.emptyContext// was set when we started this request

        const secret: Buffer = context.ourSecretKey[0]

        const unboxed: Buffer = util.UnBoxIt(message, nonce, theirPublicKey, secret)
        handler.message = unboxed

        if (unboxed.length === 0) {
            console.log("unboxing disaster inHandleApi1PacketIn  ")
        } else {
            //console.log("HandleApi1PacketIn HandleApiReplyArrival calling waitingCallbackFn ", unboxed.toString('utf8'))
            handler.waitingCallbackFn(handler)
        }
    }

}

// Broadcast has no WaitingRequest
// should we encrypt them to Anon ?
// Broadcast is a situation where we send (and not just reply) from the server.
export function Broadcast(context: util.Context, something: BroadcastCommand) {

    var topic = context.username + "_broadcast"
    if (!topic.startsWith("=")) {
        topic = topic.toLowerCase()
    }
    const cmd: eventapi.EventCmd = {
        cmd: "Event",
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
                "pubk": util.toBase64Url(context.ourPublicKey[0]) // pubk of sender
            }
        }
    };
    const message = JSON.stringify(cmd)

    //console.log("Api Event Broadcast ", options, message)

    const shouldSkipCrypto = true
    if (shouldSkipCrypto === true) { // TODO: check Everyone who broadcasts
        mqttServerThing.client.publish(topic, message, options)
    } else {
        mqttServerThing.client.publish(topic, message, options)
    }
}