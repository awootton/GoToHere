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


import * as util from '../mqtt/Util';

import * as api from "./Api"

import ApiCommand, { WaitingRequest, SendApiReplyBack, SendApiCommandOut} from './Api';

import * as config from "../mqtt/Config"

import * as cardutil from '../../components/CardUtil'

import * as s from '../mqtt/SocialTypes'

// to run just this file :
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/api1/SaveComment

 
export interface SaveCommentCmd extends ApiCommand {
    comment: s.Comment
}

export interface SaveCommentReply  extends ApiCommand {
    comment: s.Comment
}

export const SaveCommentReplyEmpty: SaveCommentReply = {
    cmd: "SaveComment",
    comment: cardutil.makeEmptyComment("anon err"),
}

export type SaveCommentReceiver = (reply: SaveCommentReply, error: any) => any

export const defaultRetry = 20

export function IssueTheCommand(username: string, Comment: s.Comment, receiver: SaveCommentReceiver) {

    var cmd: SaveCommentCmd = {
        cmd: "SaveComment",
        comment: Comment
    }
    const jsonstr = JSON.stringify(cmd, replacer)

    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = SaveCommentWaitingRequest

    SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        //console.log("App is  back from SendApiCommandOut with data ", strdata)

        var reply: SaveCommentReply = strdata.length > 0 ? JSON.parse(strdata, reviver) : {}

        if (error !== undefined ) {
            // try again, in a sec.
            setTimeout(() => {
                IssueTheCommand(username, Comment, receiver)
            }, 1000)
        } else {
            receiver(reply, error)
        }
    })
}

const SaveCommentWaitingRequest: WaitingRequest = {
    id: "SaveComment",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleSaveCommentApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    //callerPublicKey64:  "unknown"
}

// export function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

//     SaveCommentWaitingRequest.options.set("api1", SaveCommentWaitingRequest.id)
//     // returnsWaitingMap map is handling incoming packets in mqttclient 
//     returnsWaitingMap.set(SaveCommentWaitingRequest.id, SaveCommentWaitingRequest)
// }

// mqttclient.returnsWaitingMapset(SaveCommentWaitingRequest.id, SaveCommentWaitingRequest)

export function getWr(): api.WaitingRequest {
    return SaveCommentWaitingRequest
}



// writeCommentToFile ripped off from initFake
function writeCommentToFile(path: string, comment: s.Comment) {
    
    console.log(" saveComment writeCommentToFile", comment.id)
    const theDay = Math.floor(comment.id / 1000000000)
    const dirpath = path + "lists/comments/" + theDay + "/" // "data/lists/"+folder+"/" + theDay
    const fname = "" + comment.id
    const wholepath = dirpath + fname
    var fbody = JSON.stringify(Comment,null,2)

    var pathParts = dirpath.split("/")
    var tmpPath = ""
    pathParts.forEach((part, i, arr) => {
        tmpPath += part + "/"
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }
    })

    console.log(" writeCommentToFile writing ", wholepath);

    fs.writeFile(wholepath, fbody, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(" writeCommentToFile File created!");
    });

}

function handleSaveCommentApi(wr: WaitingRequest, err: any) {

    console.log("in the handleSaveCommentApi with ", util.getTopicName(wr.topic), wr.message.toString())

    var cmd: SaveCommentCmd = JSON.parse(wr.message.toString(),reviver)

    if (cmd.comment === undefined) {
        console.log("in the handleSaveCommentApi error undefined Comment ", util.getTopicName(wr.topic), wr.message.toString())
        return
    }
    // if the id exists then it's an edit and not a new. 
    if ( cmd.comment.id === 0 ) {
        var newid: s.DateNumber = util.getCurrentDateNumber()
        cmd.comment.id = newid
    }
    const Comment = cmd.comment

    console.log(" on the server in handleSaveCommentApi with ", Comment.id , Comment.title)

    var cryptoContext = util.getHashedTopic2Context( wr.topic ) || util.emptyContext // this smells
    var configItem =  config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory

    writeCommentToFile(path, Comment)

    // now send reply
    const reply : SaveCommentReply = {
        cmd : "SaveComment",
        comment : cmd.comment
    }
    var jsonstr = JSON.stringify(reply,replacer)
                // console.log("have reply saveComment ", jsonstr  )
    SendApiReplyBack(wr, Buffer.from(jsonstr), null)

    const mostlyEmptyComment: s.Comment = {
        ...s.emptyComment,
        id : cmd.comment.id
    }
    cmd.comment = mostlyEmptyComment //FIXME: use BroadcastCommand 
    api.Broadcast(cryptoContext, cmd)
}

function replacer(key: any, value: any) {

    //console.log("replacer", key, value)

    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    // } else if (value instanceof social.Comment) {
    //     return {
    //         dataType: 'Comment',
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
        // if (value.dataType === 'Comment') {
        //     console.log(value.dataType,)
        //     return "" // new social.Comment(value.value); // new social.Comment(value.value);
        // }
    }
    return value;
}

// function testJson() {
//     console.log("in testJson")

//     var cmd: SaveCommentCmd = {
//         cmd: "SaveComment",
//         Comment: cardutil.makeEmptyCard("noname")
//     }
//     const jsonstr = JSON.stringify(cmd, replacer)

//     console.log("json of this cmd ", jsonstr,)

//     var cmd2: SaveCommentCmd = JSON.parse(jsonstr)

//     console.log("reconstructed cmd ", cmd2,)

// }

// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/api1/SaveComment
//testJson()
