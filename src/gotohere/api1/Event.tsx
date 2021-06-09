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
//import fs from 'fs'

//import { WaitingRequest, ApiCommand, handleSendReplyCallback } from './Api';
import * as util from '../mqtt/Util';

import ApiCommand from "./Api"
import * as api from "./Api"
//import * as config from "../server/Config"
import * as broadcast from "../mqtt/BroadcastDispatcher"

import * as mqttclient from "../mqtt/MqttClient";

//import * as cardutil from '../components/CardUtil'

//import * as s from '../server/SocialTypes'

// to run just this file :
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/api1/Event


export interface EventCmd extends ApiCommand {
    //cmd: string
    who: string
    what: ApiCommand

}

export type EventReceiver = (reply: EventCmd, error: any) => any

export const defaultRetry = 20

export function XxdeletemexxxIssueTheCommand(username: string, what: ApiCommand, receiver: EventReceiver) {

    var cmd: EventCmd = {
        cmd: "Event",
        who: username,
        what: what
    }
    const jsonstr = JSON.stringify(cmd, replacer)

    console.log("Event IssueTheCommand ", jsonstr)

    //const theRetries = retries || defaultRetry

    const wr: api.WaitingRequest = EventWaitingRequest

    // if we call this it sets up a wr for the receiver and there's no reply to broadcast
 //   wr.callerPublicKey: "unknown"

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

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

const EventWaitingRequest: api.WaitingRequest = {
    id: "Event",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleEventApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    isEvent:true
}

//   function InitApiHandler(returnsWaitingMap: Map<string, api.WaitingRequest>) {

//     EventWaitingRequest.options.set("api1", EventWaitingRequest.id)
//     // returnsWaitingMap map is handling incoming packets in mqttclient 
//     returnsWaitingMap.set(EventWaitingRequest.id, EventWaitingRequest)
// }

//mqttclient.returnsWaitingMapset(EventWaitingRequest.id, EventWaitingRequest)

export function getWr(): api.WaitingRequest {
    return EventWaitingRequest
}


function handleEventApi(wr: api.WaitingRequest, err: any) {

    //console.log("in the handleEventApi with ", wr.topic, wr.message.toString())

    var cmd: EventCmd = JSON.parse(wr.message.toString(),reviver)

    //console.log(" on the ?? in handleEventApi with ", cmd)

    broadcast.DispatchAll(cmd)

    // do we write it to the timeline? now
    // no - the caller will do that? 
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
