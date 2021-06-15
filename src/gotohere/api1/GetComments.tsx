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

import * as s from '../knotservice/SocialTypes';
import { WaitingRequest, SendApiReplyBack } from './Api';
import ApiCommand from "./Api"

//import * as fsApi from './FsUtil';
import * as util from '../knotservice/Util';
import * as api from "./Api"
//import * as c_util from "../components/CryptoUtil"
import * as config from "../knotservice/Config"

import * as friendsapi from "./GetFriends"
import * as   pingapi from './Ping';

import * as   getter from './Getter';

import * as fsutil from "./FsUtil" 
var fs : fsutil.OurFsAdapter
export function SetFs( anFs : fsutil.OurFsAdapter ){
    fs = anFs
}

class CommentGetterClass extends getter.Getter<s.Reference, s.Comment> {

    keyofN(t: s.Reference): string {
        return s.StringRefNew(t)
    }

    // override me
    keyofG(t: s.Comment): string {
        return s.StringRefNew(t)
    }

    // don't forget to delete the pending
    useTheApi(ref: string, getting: s.Reference[], cb: (gots: s.Comment[]) => any) {

        const commentsReceiver = (comments: s.Comment[], error: any) => {
            if (error) {
                console.log("ERROR CommentGetterClass useTheApi commentsReceiver has error", error)
            } else {
                var client = this.getClient(ref)
                for (const g of comments) {
                    const key: string = this.keyofG(g)
                    client.pending.delete(key) // keys match!  
                }
                cb(comments)
            }
        }
        IssueTheCommand(getting, commentsReceiver)
    }
}

export var CommentGetter: CommentGetterClass = new CommentGetterClass()

export default interface GetCommentsCmd extends ApiCommand {
    refs: s.Reference[]
}

export interface GetCommentsReply extends ApiCommand {
    comments: s.Comment[]
}

export const GetCommentsReplyEmpty: GetCommentsReply = {
    cmd: "GetComments",
    comments: []
}

export type CommentsReceiver = (comments: s.Comment[], error: any) => any

export function IssueTheCommand(refs: s.Reference[], receiver: CommentsReceiver) {
    // we have to send them to the refs. not to the usual username.
    // this is the first example of foreign assets I guess. 
    var separated: Map<string, s.Reference[]> = new Map()
    for (var r of refs) {
        var a = separated.get(r.by) || []
        a.push(r)
        separated.set(r.by, a)
    }

    separated.forEach((ref, key, map) => {
        const name: string = key.toLowerCase()

        console.log("top of getComments api pubk search")

        // before we do this we have top be sure we have the pubk for name
        var context: util.Context = util.getNameToContext(name, true)
        if (context.ourPublicKey.length === 0) {
            if (context.username != name) {
                const newContext: util.Context = {
                    ...util.emptyContext,
                    username: name
                }
                util.pushContext(newContext)
                context = util.getNameToContext(name, true)
            }
            const friendsReply: friendsapi.GetFriendsReply | undefined = friendsapi.GlobalFriendsMap.get(util.getProfileName())
            if (friendsReply != undefined) {
                const apubkArr = friendsReply.name2keys.get(name)
                if (apubkArr !== undefined) {
                    context.ourPublicKey = [util.fromBase64Url(apubkArr[0]), util.fromBase64Url(apubkArr[1])]
                }
            }
            // still no pubk?
            pingapi.IssueTheCommand(util.signedInAs, name, (cmd: pingapi.PingCmd, error: any) => {
                if (error) {
                    console.log("getComments ping failed ", name, error)
                    receiver([], "getComments ping failed " + name + error)
                } else {
                    context.ourPublicKey = [util.fromBase64Url(cmd.pub)]
                    context.unfamiliar = true
                    IssueTheCommandSorted(key, ref, receiver)
                }
            })

        } else {
            IssueTheCommandSorted(key, ref, receiver)
        }
    });

    // for ( var key in separated.entries .keys() ){
    //     var a = separated.get(key) || []
    //     IssueTheCommandSorted(key,a,receiver)
    // }
}

function IssueTheCommandSorted(username: string, refs: s.Reference[], receiver: CommentsReceiver) {

    var cmd: GetCommentsCmd = {
        cmd: "GetComments",
        refs: refs,
    }

    const jsonstr = JSON.stringify(cmd)
    // topic:string , jsonstr: string, cb: ( data:Uint8Array, error: any ) => {} ) {
    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = GetCommentsWaitingRequest

    //console.log("GetComments SendApiCommandOut calling with user", username )

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)

        console.log("GetComments have comments back ", error)

        var commList: s.Comment[] = strdata.length > 0 ? JSON.parse(strdata) : []

        if (error !== undefined) {
            console.log("GetComments SendApiCommandOut timed out, retrying ", username)
            // try again, in a sec.
            setTimeout(() => {
                console.log("GetComments SendApiCommandOut timer done. IssueTheCommand AGAIN. ")
                IssueTheCommandSorted(username, refs, receiver)
            }, 5000)
        } else {
            console.log("GetComments SendApiCommandOut receiver ")
            receiver(commList, error)
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

    //console.log("in the handleGetCommentApi with ", util.getTopicName(wr.topic), wr.message.toString(), util.getSecondsDisplay() )
    //console.log("in the handleGetCommentApi with ", util.getTopicName(wr.topic), " key id ", wr.options.get("nonc") , util.getSecondsDisplay())

    var cmd: GetCommentsCmd = JSON.parse(wr.message.toString())

    var cryptoContext = util.getHashedTopic2Context(wr.topic)
    var configItem = config.GetName2Config(cryptoContext.username)
    var cpath = "data/" + configItem.directory + "lists/comments/"
    var ppath = "data/" + configItem.directory + "lists/posts/"

    // make the directories if missing.
    fs.mkdirs(cpath,fs.dummyCb)
    
    const needed = cmd.refs.length
    var tried = 0
    var found: s.Comment[] = []

    for (const ref of cmd.refs) {
        const day = ("" + ref.id).substr(0, 6)
        var fname = cpath + day + "/" + ref.id
        const fname2 = ppath + day + "/" + ref.id
        // if (fs.existsSync(fname2)) { // FIXME: not sync
        //     fname = fname2
        // }
        var comment = s.emptyComment
        comment.id = ref.id;
        fs.readFile(fname, (error: any, data: any) => {
            tried += 1
            if (error) {
                // try again with fname2 
                fs.readFile(fname2, (error: any, data: any) => {
                    if (error) {
                    comment.title = "Oops..."
                    comment.theText = "We don't seem to be able to find this comment. Perhaps it was deleted. <sub>Err code:" + error + "<</sub> "
                   
                    } else {
                        const buff = Buffer.from(data)
                        const str = buff.toString('utf8')
                        //console.log("GetComments parsing ", str)
                        try {
                            const thecomment: s.Comment = JSON.parse(str)
                            comment = thecomment
                        } catch {
                            console.log("GetComments ERROR bad json", str)
                            comment.title = "Load fail: ERROR bad json" + " from " + fname
                            comment.theText = str
                            comment.id = ref.id
                            comment.by = ref.by
                        }
                    }
                    found.push(comment)
                    if ( tried >= needed) {
                        // we're good
                        var jsonstr = JSON.stringify(found)
                        //console.log("have reply GetComments ", jsonstr)
                        SendApiReplyBack(wr, Buffer.from(jsonstr), null)
                    }
                })
              
            } else {
                const buff = Buffer.from(data)
                const str = buff.toString('utf8')
                //console.log("GetComments parsing ", str)
                try {
                    const thecomment: s.Comment = JSON.parse(str)
                    comment = thecomment
                } catch {
                    console.log("GetComments ERROR bad json", str)
                    comment.title = "Load fail: ERROR bad json" + " from " + fname
                    comment.theText = str
                    comment.id = ref.id
                    comment.by = ref.by
                }
            }
            found.push(comment)
            if ( tried >= needed) {
                // we're good
                var jsonstr = JSON.stringify(found)
                //console.log("have reply GetComments ", jsonstr)
                SendApiReplyBack(wr, Buffer.from(jsonstr), null)
            }
        })
    }
}

