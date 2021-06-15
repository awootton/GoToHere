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
import * as util from '../knotservice/Util';

import ApiCommand from "./Api"
import * as api from "./Api"
import * as config from "../knotservice/Config"

import * as s from '../knotservice/SocialTypes'


import * as fsutil from "./FsUtil" 
var fs : fsutil.OurFsAdapter
export function SetFs( anFs : fsutil.OurFsAdapter ){
    fs = anFs
}


export interface IncrementLikesCmd extends ApiCommand {
    id: s.DateNumber
    who: string
}

export interface IncrementLikesReply extends ApiCommand {

    id: s.DateNumber

}

export const IncrementLikesReplyEmpty: IncrementLikesReply = {
    cmd: "IncrementLikes",
    id: 0,
}

export type IncrementLikesReceiver = (reply: IncrementLikesReply, error: any) => any

export const defaultRetry = 20

export function IssueTheCommand(username: string, id: s.DateNumber, who: string, receiver: IncrementLikesReceiver) {

    var cmd: IncrementLikesCmd = {
        cmd: "IncrementLikes",
        id: id,
        who: who
    }
    const jsonstr = JSON.stringify(cmd, replacer)

    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: api.WaitingRequest = IncrementLikesWaitingRequest

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        //console.log("App is  back from SendApiCommandOut with data ", strdata)

        var reply: IncrementLikesReply = strdata.length > 0 ? JSON.parse(strdata, reviver) : {}

        if (error !== undefined) {
            console.log("IncrementLikesCmd error ", error)
            // try again, in a sec.
            setTimeout(() => {
                IssueTheCommand(username, id, who, receiver)
            }, 1000)
        } else {
            receiver(reply, error)
        }
    })
}

const IncrementLikesWaitingRequest: api.WaitingRequest = {
    id: "IncrementLikes",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleIncrementLikesApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    //callerPublicKey64: "unknown+so+far"
}

//   function InitApiHandler(returnsWaitingMap: Map<string, api.WaitingRequest>) {

//     IncrementLikesWaitingRequest.options.set("api1", IncrementLikesWaitingRequest.id)
//     // returnsWaitingMap map is handling incoming packets in mqttclient 
//     returnsWaitingMap.set(IncrementLikesWaitingRequest.id, IncrementLikesWaitingRequest)
// }

//mqttclient.returnsWaitingMapset(IncrementLikesWaitingRequest.id, IncrementLikesWaitingRequest)

export function getWr(): api.WaitingRequest {
    return IncrementLikesWaitingRequest
}


// writePostToFile ripped off from initFake
function IncrementLikesFile(path: string,
                            id: s.DateNumber,
                            wr: api.WaitingRequest,
                            cryptoContext: util.Context,
                            cmd: IncrementLikesCmd) {
                                
    //console.log(" IncrementLikes IncrementLikesFile", path, post)
    const theDay = Math.floor(id / 1000000000)
    const dirpath: string = path + "lists/posts/" + theDay + "/" // "data/lists/"+folder+"/" + theDay
    const fname: string = "" + id
    const wholepath = dirpath + fname

    console.log(" IncrementLikesFile writing ", wholepath);

    fs.readFile(wholepath, (err, data) => {
        if (err) {
            console.log(" read post in likes error " + path, err)
        } else {
            const post: s.Post = JSON.parse(data.toString("utf8"), reviver)
            post.likes += 1
            var jsonstr = JSON.stringify(post, replacer)
            fs.writeFile(wholepath, jsonstr, function (err) {

                if (err) {
                    console.log(" write post in likes error " + path, err)
                } else {

                    // now send reply
                    const reply: IncrementLikesReply = {
                        cmd: "IncrementLikes",
                        id: id
                    }
                    var jsonstr = JSON.stringify(reply, replacer)
                    // console.log("have reply IncrementLikes ", jsonstr  )
                    api.SendApiReplyBack(wr, Buffer.from(jsonstr), null)

                    // and broadcast the change
                    api.Broadcast(cryptoContext, cmd)
                }
            })
        }
    })

    // fs.writeFile(wholepath, fbody, function (err) {
    // fs.unlink(wholepath, function (err) {
    //         if (err) {
    //         return console.error(err);
    //     }
    //     console.log(" IncrementLikesFile File deleted!");
    // });

}


function handleIncrementLikesApi(wr: api.WaitingRequest, err: any) {

    console.log("in the handleIncrementLikesApi with ", wr.topic, wr.message.toString())

    var cmd: IncrementLikesCmd = JSON.parse(wr.message.toString(), reviver)

    var cryptoContext = util.getHashedTopic2Context(wr.topic)
    var configItem =  config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory

    console.log(" on the server in handleIncrementLikesApi with ", cmd.id)

    IncrementLikesFile(path, cmd.id, wr, cryptoContext, cmd)
    // todo: fixme: use a db????
}

function replacer(key: any, value: any) {

    //console.log("replacer", key, value)

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

    //console.log("reviver", key, value)

    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}
