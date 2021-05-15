
import * as social from '../server/SocialTypes';
import { WaitingRequest, ApiCommand, handleSendReplyCallback } from './Api';
import * as fsApi from './FsUtil';
import * as util from '../server/Util';
import * as api1 from "./Api"
//import * as c_util from "../components/CryptoUtil"
import * as config from "../server/Config"

//import { HandleApi1PacketIn } from '../server/MqttClient2';

export default interface GetPostsCmd extends ApiCommand {
    // posts are in reverse order, id's are YYMMDDHHMMSSmmm

    top: string // a newer data, typically now()
    fold: string // folder to use eg. data/alice/posts

    count: number // get this many
    old: string // or, if no count, collect posts back to this time
}

export type PostsListReceiver = (postslist: social.Post[], error: any) => any

export function IssueTheCommand(username: string, top: string, fold: string, count: number, old: string, receiver: PostsListReceiver, retries? : number) {

    var cmd: GetPostsCmd = {
        cmd: "getPosts",
        top: top,
        fold: fold,
        count: count,
        old: old
    }

    if ( retries === undefined ){
        retries = 0
    }
    var nextRetryNumber = retries + 1
 
    const jsonstr = JSON.stringify(cmd)
    // topic:string , jsonstr: string, cb: ( data:Uint8Array, error: any ) => {} ) {
    //console.log("jsonstr of cmd ", jsonstr,)

    var wr: WaitingRequest = getPostsWaitingRequest
    //var topic = c_util.getCurrentContext().profileNameFromApp

    api1.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        //console.log("App is  back from SendApiCommandOut with data ", strdata)

        var postslist: social.Post[] = strdata.length>0 ? JSON.parse(strdata) : []

        if ( error !== undefined && nextRetryNumber < 20 ){
            // try again, in a sec.
            setTimeout(()=>{
                IssueTheCommand(username, top, fold, count, old, receiver, nextRetryNumber)
            },1000)
        } else {
            receiver(postslist, error)
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
    callerPublicKey : "unknown" 
}

export function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

    getPostsWaitingRequest.options.set("api1", getPostsWaitingRequest.id)
     // returnsWaitingMap map is handling incoming packets in mqttclient 
    returnsWaitingMap.set(getPostsWaitingRequest.id, getPostsWaitingRequest)
}

function handleGetPostApi(wr: WaitingRequest, err: any) {

    // console.log("in the handleGetPostApi with ", wr.topic, wr.message.toString())

    var getPostCmd: GetPostsCmd = JSON.parse(wr.message.toString())

    const top = getPostCmd.top // the newest date inclusive
    const count = getPostCmd.count
    const folder = getPostCmd.fold

    var cryptoContext = util.getMatchingContext( wr.topic )
    var configItem = cryptoContext.config || config.EmptyServerConfigItem
    var path = "data/" + configItem.directory  + folder

    if (count !== 0) {
        // add end date ? 
        var items: social.Post[] = []
        var done = false

        var haveOne = (data: Buffer): number => {
            if (done) {
                return items.length
            }

            var apost: social.Post = JSON.parse(data.toString("utf8"))
            items.push(apost)

            if (items.length >= count && done === false) {
                var listBytes = JSON.stringify(items)
                handleSendReplyCallback(wr, Buffer.from(listBytes), null)
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

