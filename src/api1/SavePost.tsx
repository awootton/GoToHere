
import fs from 'fs'

//import { WaitingRequest, ApiCommand, handleSendReplyCallback } from './Api';
import * as util from '../server/Util';
import * as api1 from "./Api"
import * as config from "../server/Config"

import * as cardutil from '../components/CardUtil'

import * as social from '../server/SocialTypes'


export class SavePostCmd extends api1.ApiCommand {

    post: social.Post
    constructor( cmd: string, post: social.Post ){
        super(cmd)
        this.post = post
    }
}

export class SavePostReply extends api1.ApiCommand {
    post: social.Post
    constructor( cmd: string, post: social.Post ){
        super(cmd)
        this.post = post
    }
}

export const SavePostReplyEmpty: SavePostReply = {
    cmd: "SavePost",
    post: cardutil.makeEmptyCard("anon err"),
}

export type SavePostReceiver = (reply: SavePostReply, error: any) => any

export const defaultRetry = 20

export function IssueTheCommand(username: string, post: social.Post, receiver: SavePostReceiver, retries?: number) {

    var cmd: SavePostCmd = {
        cmd: "SavePost",
        post: post
    }
    const jsonstr = JSON.stringify(cmd, replacer)

    console.log("jsonstr of cmd ", jsonstr,)

    const theRetries = retries || defaultRetry

    var wr: api1.WaitingRequest = SavePostWaitingRequest

    api1.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        //console.log("App is  back from SendApiCommandOut with data ", strdata)

        var reply: SavePostReply = strdata.length > 0 ? JSON.parse(strdata, reviver) : {}

        if (error !== undefined && (theRetries > 0)) {
            // try again, in a sec.
            setTimeout(() => {
                const newretries = theRetries - 1
                IssueTheCommand(username, post, receiver, newretries)
            }, 1000)
        } else {
            receiver(reply, error)
        }
    })
}

const SavePostWaitingRequest: api1.WaitingRequest = {
    id: "SavePost",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleSavePostApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    callerPublicKey: "unknown"
}

export function InitApiHandler(returnsWaitingMap: Map<string, api1.WaitingRequest>) {

    SavePostWaitingRequest.options.set("api1", SavePostWaitingRequest.id)
    // returnsWaitingMap map is handling incoming packets in mqttclient 
    returnsWaitingMap.set(SavePostWaitingRequest.id, SavePostWaitingRequest)
}

// writePostToFile ripped off from initFake
function writePostToFile(path: string, post: social.Post) {
    console.log(path, post)
    const theDay = Math.floor(post.id / 1000000000)
    const dirpath = path + "/" + theDay + "/" // "data/lists/"+folder+"/" + theDay
    const fname = "" + post.id
    const wholepath = dirpath + fname
    var fbody = JSON.stringify(post)

    var pathParts = dirpath.split("/")
    var tmpPath = ""
    pathParts.forEach((part, i, arr) => {
        tmpPath += part + "/"
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }
    })

    console.log(" writePostToFile writing ", wholepath);

    // fs.writeFile(wholepath, fbody, function (err) {
    //     if (err) {
    //         return console.error(err);
    //     }
    //     console.log(" writePostToFile File created!");
    // });

}

function handleSavePostApi(wr: api1.WaitingRequest, err: any) {

    console.log("in the handleSavePostApi with ", wr.topic, wr.message.toString())

    var cmd: SavePostCmd = JSON.parse(wr.message.toString())

    if (cmd.post == undefined) {
        console.log("in the handleSavePostApi error undefined post ", wr.topic, wr.message.toString())
        return
    }

    const post = cmd.post

    var cryptoContext = util.getMatchingContext(wr.topic)
    var configItem = cryptoContext.config || config.EmptyServerConfigItem
    var path = "data/" + configItem.directory

    var newid: social.DateNumber = util.getCurrentDateNumber()
    console.log(" on the server in handleSavePostApi with ", post)

    post.id = newid

    writePostToFile(path, post)
}

function replacer(key: any, value: any) {

    console.log("replacer", key, value)

    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else if (value instanceof social.Post) {
        return {
            dataType: 'Post',
            value: Array.from(""), // or with spread: value: [...value]
        };
    } else {

        return value;
    }
}

function reviver(key: any, value: any) {

    console.log("reviver", key, value)

    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
        if (value.dataType === 'Post') {
            console.log(value.dataType,)
            return "" // new social.Post(value.value); // new social.Post(value.value);
        }
    }
    return value;
}

function testJson() {


}

testJson()


