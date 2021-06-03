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

import * as social from '../server/SocialTypes';
import { WaitingRequest, SendApiReplyBack } from './Api';
import ApiCommand from "./Api"

import * as fsApi from './FsUtil';
import * as util from '../server/Util';
import * as api from "./Api"
//import * as c_util from "../components/CryptoUtil"
import * as config from "../server/Config"

//import * as mqttclient from "../server/MqttClient";

export default interface GetCommentsCmd extends ApiCommand {
    refs: social.Reference[] 
}

export interface GetCommentsReply extends ApiCommand {

    comments: social.Comment[]
}

export const GetCommentsReplyEmpty: GetCommentsReply = {

    cmd: "GetComments",
    comments:[]
}

export type CommentsReceiver = ( comments: social.Comment[], error: any) => any

export function IssueTheCommand( refs: social.Reference[] , receiver: CommentsReceiver) {
    // we have to send them to the refs. not to the usual username.
    // this is the first example of foreign assets I guess. 
    var separated : Map<string,social.Reference[]> = new Map()
    for ( var r of refs ){
        var a = separated.get(r.by) || []
        a.push(r)
        separated.set(r.by,a)
    }
    for ( var key in separated.keys() ){
        var a = separated.get(key) || []
        IssueTheCommandSorted(key,a,receiver)
    }
}

function IssueTheCommandSorted( username: string, refs: social.Reference[] , receiver: CommentsReceiver) {

    var cmd: GetCommentsCmd = {
        cmd: "GetComments",
        refs: refs,
    }
 
    const jsonstr = JSON.stringify(cmd)
    // topic:string , jsonstr: string, cb: ( data:Uint8Array, error: any ) => {} ) {
    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = GetCommentsWaitingRequest

    //console.log("GtePosts SendApiCommandOut calling with user", username )

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        
        //console.log("GtePosts SendApiCommandOut ", error )

        var commList: social.Comment[] = strdata.length>0 ? JSON.parse(strdata) : []

        if ( error !== undefined  ){
            console.log("GetComments SendApiCommandOut timed out, retrying ", username)
            // try again, in a sec.
            setTimeout(()=>{
                console.log("GetComments SendApiCommandOut timer done. IssueTheCommand AGAIN. " )
                IssueTheCommandSorted(username,refs,receiver)
            },5000 )
        } else {
            //console.log("GtePosts SendApiCommandOut receiver " )
            receiver(commList ,error)
        }
    })
}

const GetCommentsWaitingRequest: WaitingRequest = {
    id: "GetComments",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleGetCommentApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    //callerPublicKey64 : "unknown+now" 
}

//   function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

//     GetCommentsWaitingRequest.options.set("api1", GetCommentsWaitingRequest.id)
//      // returnsWaitingMap map is handling incoming packets in mqttclient 
//     returnsWaitingMap.set(GetCommentsWaitingRequest.id, GetCommentsWaitingRequest)
// }

export function getWr(): WaitingRequest {
    return GetCommentsWaitingRequest
}

//mqttclient.returnsWaitingMapset(GetCommentsWaitingRequest.id, GetCommentsWaitingRequest)

function handleGetCommentApi(wr: WaitingRequest, err: any) {

    console.log("in the handleGetCommentApi with ", util.getTopicName(wr.topic), wr.message.toString(), util.getSecondsDisplay() )
    //console.log("in the handleGetCommentApi with ", util.getTopicName(wr.topic), " key id ", wr.options.get("nonc") , util.getSecondsDisplay())

    var cmd: GetCommentsCmd = JSON.parse(wr.message.toString())

    var cryptoContext = util.getHashedTopic2Context( wr.topic )
    var configItem =  config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory  + "comments"

    // make the directories if missing.
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }

    // if (count !== 0) {
    //     // add end date ? 
    //     var items: social.Post[] = []
    //     var done = false

    //     var haveOne = (data: Buffer): number => {
    //         if (done) {
    //             return items.length
    //         }

    //         var apost: social.Post = JSON.parse(data.toString("utf8"))
    //         items.push(apost)

    //         if (items.length >= count && done === false) {
    //             var listBytes = JSON.stringify(items)
    //             //console.log("GetComments calling handleSendReplyCallback with",listBytes )
    //             SendApiReplyBack(wr, Buffer.from(listBytes), null)
    //             // and, we're done here
    //             done = true
    //         }
    //         return items.length
    //     }
    //     var context: fsApi.fsGetContext = {
    //         countNeeded: count,
    //         newer: top,
    //         basePath: path,
    //         haveOne: haveOne,
    //         done: false
    //     }
    //     fsApi.fsGetCommentsCounted(context)
    // } else {
    //     // broken and lost (and shitty)  fsGetComments(wr, old, top, folder, handleSendReplyCallback);
    // }

}

