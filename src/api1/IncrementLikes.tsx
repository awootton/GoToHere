
import fs from 'fs'

//import { WaitingRequest, ApiCommand, handleSendReplyCallback } from './Api';
import * as util from '../server/Util';

import ApiCommand from "./Api"
import * as api from "./Api"
import * as config from "../server/Config"

import * as social from '../server/SocialTypes'


export interface IncrementLikesCmd extends ApiCommand {
    id: social.DateNumber
    who: string
}

export interface IncrementLikesReply extends ApiCommand {

    id: social.DateNumber

}

export const IncrementLikesReplyEmpty: IncrementLikesReply = {
    cmd: "IncrementLikes",
    id: 0,
}

export type IncrementLikesReceiver = (reply: IncrementLikesReply, error: any) => any

export const defaultRetry = 20

export function IssueTheCommand(username: string, id: social.DateNumber, who: string, receiver: IncrementLikesReceiver, retries?: number) {

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

            receiver(reply, error)

            // try again, in a sec.
            // setTimeout(() => {
            //     const newretries = theRetries - 1
            //     IssueTheCommand(username, id, receiver, newretries)
            // }, 1000)
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

export function InitApiHandler(returnsWaitingMap: Map<string, api.WaitingRequest>) {

    IncrementLikesWaitingRequest.options.set("api1", IncrementLikesWaitingRequest.id)
    // returnsWaitingMap map is handling incoming packets in mqttclient 
    returnsWaitingMap.set(IncrementLikesWaitingRequest.id, IncrementLikesWaitingRequest)
}

// writePostToFile ripped off from initFake
function IncrementLikesFile(path: string,
                            id: social.DateNumber,
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
            const post: social.Post = JSON.parse(data.toString("utf8"), reviver)
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


    //fs.writeFile(wholepath, fbody, function (err) {
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
