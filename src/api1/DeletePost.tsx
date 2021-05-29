
import fs from 'fs'

//import { WaitingRequest, ApiCommand, handleSendReplyCallback } from './Api';
import * as util from '../server/Util';

import ApiCommand from "./Api"
import * as api from "./Api"
import * as config from "../server/Config"

//import * as cardutil from '../components/CardUtil'

import * as social from '../server/SocialTypes'

// to run just this file :
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/api1/DeletePost


export interface DeletePostCmd extends ApiCommand {
    //cmd: string
    id: social.DateNumber
    // constructor(cmd: string, id: social.DateNumber) {
    //     //super(cmd)
    //     this.cmd = cmd
    //     this.id = id
    // }
}

export interface DeletePostReply extends ApiCommand {
    //cmd: string
    id: social.DateNumber
    // constructor(cmd: string, id: social.DateNumber) {
    //     //super(cmd)
    //     this.cmd = cmd
    //     this.id = id
    // }
}

export const DeletePostReplyEmpty: DeletePostReply = {
    cmd: "DeletePost",
    id: 0,
}

export type DeletePostReceiver = (reply: DeletePostReply, error: any) => any

export const defaultRetry = 20

export function IssueTheCommand(username: string, id: social.DateNumber, receiver: DeletePostReceiver, retries?: number) {

    var cmd: DeletePostCmd = {
        cmd: "DeletePost",
        id: id
    }
    const jsonstr = JSON.stringify(cmd, replacer)

    //console.log("jsonstr of cmd ", jsonstr,)

    const theRetries = retries || defaultRetry

    const wr: api.WaitingRequest = DeletePostWaitingRequest 

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        //console.log("App is  back from SendApiCommandOut with data ", strdata)

        var reply: DeletePostReply = strdata.length > 0 ? JSON.parse(strdata, reviver) : {}

        if (error !== undefined && (theRetries > 0)) {

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

const DeletePostWaitingRequest: api.WaitingRequest = {
    id: "DeletePost",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleDeletePostApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    //callerPublicKey64: "unknown+so+far"
}

export function InitApiHandler(returnsWaitingMap: Map<string, api.WaitingRequest>) {

    DeletePostWaitingRequest.options.set("api1", DeletePostWaitingRequest.id)
    // returnsWaitingMap map is handling incoming packets in mqttclient 
    returnsWaitingMap.set(DeletePostWaitingRequest.id, DeletePostWaitingRequest)
}

// writePostToFile ripped off from initFake
function deletePostFile(path: string, id: social.DateNumber) {
    //console.log(" DeletePost deletePostFile", path, post)
    const theDay = Math.floor(id / 1000000000)
    const dirpath:string = path + "lists/posts/" + theDay + "/" // "data/lists/"+folder+"/" + theDay
    const fname:string = ""+id
    const wholepath = dirpath + fname
    //var fbody = JSON.stringify(post)

    // var pathParts = dirpath.split("/")
    // var tmpPath = ""
    // pathParts.forEach((part, i, arr) => {
    //     tmpPath += part + "/"
    //     if (!fs.existsSync(tmpPath)) {
    //         fs.mkdirSync(tmpPath);
    //     }
    // })

    console.log(" deletePostFile writing ", wholepath);

    //fs.writeFile(wholepath, fbody, function (err) {
    fs.unlink(wholepath, function (err) {
            if (err) {
            return console.error(err);
        }
        console.log(" deletePostFile File deleted!");
    });

}

function handleDeletePostApi(wr: api.WaitingRequest, err: any) {

    console.log("in the handleDeletePostApi with ", wr.topic, wr.message.toString())

    var cmd: DeletePostCmd = JSON.parse(wr.message.toString(),reviver)

    // if (cmd.post == undefined) {
    //     console.log("in the handleDeletePostApi error undefined post ", wr.topic, wr.message.toString())
    //     return
    // }

    //const post = cmd.post

    var cryptoContext = util.getHashedTopic2Context(wr.topic)
    var configItem =  config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory

    //var newid: social.DateNumber = util.getCurrentDateNumber()
    console.log(" on the server in handleDeletePostApi with ", cmd.id)

    //post.id = newid

    deletePostFile(path, cmd.id)

    // now send reply
    const reply : DeletePostReply = {
        cmd : "DeletePost",
        id : cmd.id
    }
    var jsonstr = JSON.stringify(reply,replacer)
    // console.log("have reply DeletePost ", jsonstr  )
    api.SendApiReplyBack(wr, Buffer.from(jsonstr), null)

    // and broadcast the change

    api.Broadcast(cryptoContext, cmd)
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
