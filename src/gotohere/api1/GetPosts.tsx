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

import * as s from '../mqtt/SocialTypes';
import { WaitingRequest, SendApiReplyBack } from './Api';
import ApiCommand from "./Api"

import * as fsApi from './FsUtil';
import * as util from '../mqtt/Util';
import * as api from "./Api"
//import * as c_util from "../components/CryptoUtil"
import * as config from "../mqtt/Config"
import * as   getter from './Getter';


export type PostNeed = {
    username: string
    when: s.DateNumber
    amt: number
}
 
export class PostGetterClass extends getter.Getter<PostNeed, s.Post> {

    keyofN(t: PostNeed): string {
        return  "" + t.when + " " + t.username
    }

    // override me
    keyofG(t: s.Post): string {
        return s.StringRefNew(t)
    }

    // don't forget to delete the pending
    useTheApi( ref: string , needing: PostNeed[], cb: (gots: s.Post[]) => any) {

        const postsListReceiver = (postslist: s.Post[], countRequested:number, error: any) => {
            if (error) {
                console.log("ERROR useTheApi commentsReceiver has error",error)
            } else {
                var client = this.getClient(ref)
                client.pending.clear()
                cb(postslist)
            }
        }
        for ( var need of needing) {
            IssueTheCommand(need.username, ""+need.when, need.amt, postsListReceiver)
        }
    }
}

export var PostGetter: PostGetterClass = new PostGetterClass()

export default interface GetPostsCmd extends ApiCommand {
    // posts are in reverse order, id's are YYMMDDHHMMSSmmm

    top: string // a newer data, typically now()
    //fold: string // folder to use eg. data/alice/posts

    count: number // get this many
  //  old: string // or, if no count, collect posts back to this time
}

export type PostsListReceiver = (postslist: s.Post[], countRequested:number, error: any) => any

export function IssueTheCommand(username: string, top: string, count: number, receiver: PostsListReceiver) {

    var cmd: GetPostsCmd = {
        cmd: "getPosts",
        top: top,
      //  fold: fold,
        count: count,
     //   old: old
    }
 
    const jsonstr = JSON.stringify(cmd)
    // topic:string , jsonstr: string, cb: ( data:Uint8Array, error: any ) => {} ) {
    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = getPostsWaitingRequest

    //console.log("GtePosts SendApiCommandOut calling with user", username )

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        
        console.log("GetPostsCmd returns w err ", error)

        var postslist: s.Post[] = strdata.length>0 ? JSON.parse(strdata) : []

        if ( error !== undefined  ){
            console.log("GetPostsCmd SendApiCommandOut have error,user " ,error, username, util.getSecondsDisplay())
            // try again, in a sec.
            setTimeout(()=>{
                console.log("GetPostsCmd SendApiCommandOut timer done. IssueTheCommand AGAIN. " )
                IssueTheCommand(username, top, count, receiver)
            },9000 )
        } else {
            //console.log("GtePosts SendApiCommandOut receiver " )
            receiver(postslist, count ,error)
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

//   function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

//     getPostsWaitingRequest.options.set("api1", getPostsWaitingRequest.id)
//      // returnsWaitingMap map is handling incoming packets in mqttclient 
//     returnsWaitingMap.set(getPostsWaitingRequest.id, getPostsWaitingRequest)
// }

//mqttclient.returnsWaitingMapset(getPostsWaitingRequest.id, getPostsWaitingRequest)

export function getWr(): WaitingRequest {
    return getPostsWaitingRequest
}


function handleGetPostApi(wr: WaitingRequest, err: any) {

    //console.log("in the handleGetPostApi with ", util.getTopicName(wr.topic), wr.message.toString(), " by ",util.getPubkToName(wr.callerPublicKey))
    //
    console.log("in the handleGetPostApi with ", util.getTopicName(wr.topic), " key id ", wr.options.get("nonc") , util.getSecondsDisplay())

    var getPostCmd: GetPostsCmd = JSON.parse(wr.message.toString())

    const top = getPostCmd.top // the newest date inclusive
    const count = getPostCmd.count
    //const folder = "lists/posts/"//getPostCmd.fold

    var cryptoContext = util.getHashedTopic2Context( wr.topic )
    var configItem =  config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory + "lists/posts/" 

    // make the directories if missing.
    if (!fs.existsSync(path)){
        fs.mkdirSync(path);
    }

    if (count !== 0) {
        // add end date ? 
        var items: s.Post[] = []
        var done = false

        var haveOne = (data: Buffer): number => {
            if (done) {
                return items.length
            }

            var apost: s.Post = JSON.parse(data.toString("utf8"))
            items.push(apost)

            if (items.length >= count && done === false) {
                var listBytes = JSON.stringify(items)
                //console.log("GetPosts calling handleSendReplyCallback with",listBytes )
                SendApiReplyBack(wr, Buffer.from(listBytes), null)
                // and, we're done here
                done = true
            }
            return items.length
        }
        var context: fsApi.fsGetContext = {
            countNeeded: count,
            newer: top,
            basePath: path,
            haveOne: haveOne,
            done: false
        }
        fsApi.fsGetPostsCounted(context)
    } else {
        // broken and lost (and shitty)  fsGetPosts(wr, old, top, folder, handleSendReplyCallback);
    }
}

