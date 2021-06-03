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
import fs from 'fs'


import * as util from '../server/Util';

import * as api from "./Api"

import ApiCommand, { WaitingRequest, SendApiReplyBack, SendApiCommandOut} from './Api';

import * as config from "../server/Config"

import * as cardutil from '../components/CardUtil'

import * as social from '../server/SocialTypes'

import * as mqttclient from "../server/MqttClient";

// to run just this file :
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/api1/SavePost

 
export interface SavePostCmd extends ApiCommand {
    post: social.Post
}

export interface SavePostReply  extends ApiCommand {
    post: social.Post
}

export const SavePostReplyEmpty: SavePostReply = {
    cmd: "SavePost",
    post: cardutil.makeEmptyCard("anon err"),
}

export type SavePostReceiver = (reply: SavePostReply, error: any) => any

export const defaultRetry = 20

export function IssueTheCommand(username: string, post: social.Post, receiver: SavePostReceiver) {

    var cmd: SavePostCmd = {
        cmd: "SavePost",
        post: post
    }
    const jsonstr = JSON.stringify(cmd, replacer)

    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = SavePostWaitingRequest

    SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        //console.log("App is  back from SendApiCommandOut with data ", strdata)

        var reply: SavePostReply = strdata.length > 0 ? JSON.parse(strdata, reviver) : {}

        if (error !== undefined ) {
            // try again, in a sec.
            setTimeout(() => {
                IssueTheCommand(username, post, receiver)
            }, 1000)
        } else {
            receiver(reply, error)
        }
    })
}

const SavePostWaitingRequest: WaitingRequest = {
    id: "SavePost",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleSavePostApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    //callerPublicKey64:  "unknown"
}

// export function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

//     SavePostWaitingRequest.options.set("api1", SavePostWaitingRequest.id)
//     // returnsWaitingMap map is handling incoming packets in mqttclient 
//     returnsWaitingMap.set(SavePostWaitingRequest.id, SavePostWaitingRequest)
// }

// mqttclient.returnsWaitingMapset(SavePostWaitingRequest.id, SavePostWaitingRequest)

export function getWr(): api.WaitingRequest {
    return SavePostWaitingRequest
}



// writePostToFile ripped off from initFake
function writePostToFile(path: string, post: social.Post) {
    
    console.log(" savepost writePostToFile", post.id)
    const theDay = Math.floor(post.id / 1000000000)
    const dirpath = path + "lists/posts/" + theDay + "/" // "data/lists/"+folder+"/" + theDay
    const fname = "" + post.id
    const wholepath = dirpath + fname
    var fbody = JSON.stringify(post,null,2)

    var pathParts = dirpath.split("/")
    var tmpPath = ""
    pathParts.forEach((part, i, arr) => {
        tmpPath += part + "/"
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }
    })

    console.log(" writePostToFile writing ", wholepath);

    fs.writeFile(wholepath, fbody, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(" writePostToFile File created!");
    });

}

function handleSavePostApi(wr: WaitingRequest, err: any) {

    console.log("in the handleSavePostApi with ", util.getTopicName(wr.topic), wr.message.toString())

    var cmd: SavePostCmd = JSON.parse(wr.message.toString(),reviver)

    if (cmd.post === undefined) {
        console.log("in the handleSavePostApi error undefined post ", util.getTopicName(wr.topic), wr.message.toString())
        return
    }
    // if the id exists then it's an edit and not a new. 
    if ( cmd.post.id === 0 ) {
        var newid: social.DateNumber = util.getCurrentDateNumber()
        cmd.post.id = newid
    }
    const post = cmd.post

    console.log(" on the server in handleSavePostApi with ", post.id , post.title)

    var cryptoContext = util.getHashedTopic2Context( wr.topic ) || util.emptyContext // this smells
    var configItem =  config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory

    writePostToFile(path, post)

    // now send reply
    const reply : SavePostReply = {
        cmd : "SavePost",
        post : cmd.post
    }
    var jsonstr = JSON.stringify(reply,replacer)
                // console.log("have reply savepost ", jsonstr  )
    SendApiReplyBack(wr, Buffer.from(jsonstr), null)

    const mostlyEmptyPost: social.Post = {
        ...social.emptyPost,
        id : cmd.post.id
    }
    cmd.post = mostlyEmptyPost //FIXME: use BroadcastCommand 
    api.Broadcast(cryptoContext, cmd)
}

function replacer(key: any, value: any) {

    //console.log("replacer", key, value)

    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    // } else if (value instanceof social.Post) {
    //     return {
    //         dataType: 'Post',
    //         value: Array.from(""), // or with spread: value: [...value]
    //     };
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
        // if (value.dataType === 'Post') {
        //     console.log(value.dataType,)
        //     return "" // new social.Post(value.value); // new social.Post(value.value);
        // }
    }
    return value;
}

// function testJson() {
//     console.log("in testJson")

//     var cmd: SavePostCmd = {
//         cmd: "SavePost",
//         post: cardutil.makeEmptyCard("noname")
//     }
//     const jsonstr = JSON.stringify(cmd, replacer)

//     console.log("json of this cmd ", jsonstr,)

//     var cmd2: SavePostCmd = JSON.parse(jsonstr)

//     console.log("reconstructed cmd ", cmd2,)

// }

// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/api1/SavePost
//testJson()
