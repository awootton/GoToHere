
//import fs from 'fs'

//import { WaitingRequest, ApiCommand, handleSendReplyCallback } from './Api';
import * as util from '../server/Util';

import ApiCommand from "./Api"
import * as api1 from "./Api"
//import * as config from "../server/Config"
import * as broadcast from "../server/BroadcastDispatcher"

//import * as cardutil from '../components/CardUtil'

//import * as social from '../server/SocialTypes'

// to run just this file :
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/api1/Event


export interface EventCmd extends ApiCommand {
    //cmd: string
    who: string
    what: ApiCommand

}

export type EventReceiver = (reply: EventCmd, error: any) => any

export const defaultRetry = 20

export function XxxIssueTheCommand(username: string, what: ApiCommand, receiver: EventReceiver) {

    var cmd: EventCmd = {
        cmd: "Event",
        who: username,
        what: what
    }
    const jsonstr = JSON.stringify(cmd, replacer)

    console.log("Event IssueTheCommand ", jsonstr)

    //const theRetries = retries || defaultRetry

    var wr: api1.WaitingRequest = EventWaitingRequest

    // if we call this it sets up a wr for the receiver and there's no reply to broadcast
 //   wr.callerPublicKey: "unknown"

    api1.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        console.log("Event is  back from SendApiCommandOut with data ", strdata)

        // var reply: EventReply = strdata.length > 0 ? JSON.parse(strdata, reviver) : {}

        // if (error !== undefined && (theRetries > 0)) {
        //     // try again, in a sec.
        //     setTimeout(() => {
        //         const newretries = theRetries - 1
        //         IssueTheCommand(username, id, receiver, newretries)
        //     }, 1000)
        // } else {
        //     receiver(reply, error)
        // }
    })
}

const EventWaitingRequest: api1.WaitingRequest = {
    id: "Event",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleEventApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    callerPublicKey64: "unknown"
}

export function InitApiHandler(returnsWaitingMap: Map<string, api1.WaitingRequest>) {

    EventWaitingRequest.options.set("api1", EventWaitingRequest.id)
    // returnsWaitingMap map is handling incoming packets in mqttclient 
    returnsWaitingMap.set(EventWaitingRequest.id, EventWaitingRequest)
}

function handleEventApi(wr: api1.WaitingRequest, err: any) {

    console.log("in the handleEventApi with ", wr.topic, wr.message.toString())

    var cmd: EventCmd = JSON.parse(wr.message.toString(),reviver)

    //var cryptoContext = util.getMatchingContext(wr.topic)
    // var configItem = cryptoContext.config || config.EmptyServerConfigItem
    // var path = "data/" + "lists/events/" //configItem.directory

    //var newid: social.DateNumber = util.getCurrentDateNumber()
    console.log(" on the ?? in handleEventApi with ", cmd)

    broadcast.DispatchAll(cmd)

    // do we write it to the timeline? now
    // no - the caller will do that? 

    //post.id = newid

    // EventFile(path, cmd.id)

    // // now send reply
    // const reply : EventReply = {
    //     cmd : "Event",
    //     id : cmd.id
    // }
    // var jsonstr = JSON.stringify(reply,replacer)
    // // console.log("have reply Event ", jsonstr  )
    // api1.handleSendReplyCallback(wr, Buffer.from(jsonstr), null)

    // // and broadcast the change

    // api1.Broadcast(cryptoContext, Buffer.from(wr.message))
}

function replacer(key: any, value: any) {

    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
      } else {
        return value;
    }
}

function reviver(key: any, value: any) {

    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}
