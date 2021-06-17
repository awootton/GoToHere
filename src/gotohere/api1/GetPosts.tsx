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

import * as fsApi from './FsUtil';
import * as util from '../knotservice/Util';
import * as api from "./Api"
import * as config from "../knotservice/Config"
import * as   getter from './Getter';

import * as fsutil from "./FsUtil" 
var fs : fsutil.OurFsAdapter
export function SetFs( anFs : fsutil.OurFsAdapter ){
    fs = anFs
}

export type PostNeed = {
    username: string
    when: s.DateNumber
    amt: number
    //trackingId : string
}

export type PostGetReply = {
    username: string
    when: s.DateNumber
  //  trackingId : string
    posts: s.Post[]
}

export class PostGetterClass extends getter.Getter<PostNeed, PostGetReply> {

    keyofN(t: PostNeed): string {
        return  "" + t.when + " " + t.username 
    }
    // override me
    keyofG(t: PostGetReply): string {
        return "" + t.when + " " + t.username  
    }

    // don't forget to delete the pending - or not. They should never repeat
    useTheApi( ref: string , needing: PostNeed[], cb: (gots: PostGetReply[]) => any) {

        const postsListReceiver = (postslist: PostGetReply[], error: any) => {
            if (error) {
                console.log("ERROR useTheApi postsListReceiver has error",error)
            } else {
                var client = this.getClient(ref)
                // just clear the ones that match: 
                for ( const pgr of postslist ) {
                    client.pending.delete(this.keyofG(pgr))
                }
                cb(postslist)
            }
        }
        for ( var need of needing) {
            IssueTheCommand(need, postsListReceiver)
        }
    }
}

export var PostGetter: PostGetterClass = new PostGetterClass()

export default interface GetPostsCmd extends ApiCommand {
    // posts are in reverse order, id's are YYMMDDHHMMSSmmm

    top: s.DateNumber // a newer data, typically now() or a year from now
    count: number // get this many
   // trackingId: string
}

export type PostsListReceiver = ( postsreply: PostGetReply[], error: any) => any

export function IssueTheCommand(need: PostNeed , receiver: PostsListReceiver) {

    var cmd: GetPostsCmd = {
        cmd: "getPosts",
        top: need.when,
        count: need.amt,
      //  trackingId : need.trackingId
    }
 
    const jsonstr = JSON.stringify(cmd)
    // topic:string , jsonstr: string, cb: ( data:Uint8Array, error: any ) => {} ) {
    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = getPostsWaitingRequest

    //console.log("GtePosts SendApiCommandOut calling with user", username )

    api.SendApiCommandOut(wr, need.username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        
        console.log("GetPostsCmd returns w err ", error)

        var postsReply: PostGetReply = strdata.length>0 ? JSON.parse(strdata) : []

        if ( error !== undefined  ){
            console.log("GetPostsCmd SendApiCommandOut have error,user " ,error, need.username, util.getSecondsDisplay())
            // try again, in a sec.
            setTimeout(()=>{
                console.log("GetPostsCmd SendApiCommandOut timer done. IssueTheCommand AGAIN. " )
                IssueTheCommand(need, receiver)
            },9000 )
        } else {
            //console.log("GtePosts SendApiCommandOut receiver " )
            receiver([postsReply] ,error)
        }
    })
}

const getPostsWaitingRequest: WaitingRequest = {
    id: "getPosts",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleGetPostApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    //callerPublicKey64 : "unknown+now" 
    //debug: true
}
export function getWr(): WaitingRequest {
    return getPostsWaitingRequest
}

function handleGetPostApi(wr: WaitingRequest, err: any) {

    //console.log("in the handleGetPostApi with ", util.getTopicName(wr.topic), wr.message.toString(), " by ",util.getPubkToName(wr.callerPublicKey))
    //
    console.log("in the handleGetPostApi with ", util.getTopicName(wr.topic), " key id ", wr.options.get("nonc") , util.getSecondsDisplay())

    var getPostCmd: GetPostsCmd = JSON.parse(wr.message.toString())

    //const top = getPostCmd.top // the newest date inclusive
    //const count = getPostCmd.count
     
    //const tracking = getPostCmd.trackingId
  

    var cryptoContext = util.getHashedTopic2Context( wr.topic )
    var configItem =  config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory + "lists/posts/" 

    // make the directories if missing.
    fs.mkdirs(path,fs.dummyCb)

    if (getPostCmd.count !== 0) {
        var items: s.Post[] = []
        var done = false

        var haveOne = (data: Buffer): number => {
            if (done) {
                return items.length
            }

            var apost: s.Post = JSON.parse(data.toString("utf8"))
            items.push(apost)

            if (items.length >= getPostCmd.count && done === false) {

                var reply : PostGetReply = {
                    username : cryptoContext.username,
                    when: getPostCmd.top,
                    posts: items,
                    //
                }
                var replyBytes = JSON.stringify(reply)
                //console.log("GetPosts calling handleSendReplyCallback with",replyBytes )
                SendApiReplyBack(wr, Buffer.from(replyBytes), null)
                // and, we're done here
                done = true
            }
            return items.length
        }
        var context: fsApi.fsGetContext = {
            countNeeded: getPostCmd.count,
            newer: "" + getPostCmd.top,
            basePath: path,
            haveOne: haveOne,
            done: false
        }
        fsApi.fsGetPostsCounted(context)
    } else {
        // broken and lost (and shitty)  fsGetPosts(wr, old, top, folder, handleSendReplyCallback);
    }
}

