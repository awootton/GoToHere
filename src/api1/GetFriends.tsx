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

import { WaitingRequest, SendApiReplyBack } from './Api';
import * as util from '../server/Util';
import ApiCommand from "./Api"
import * as api from "./Api"
import * as config from "../server/Config"

import * as mqttclient from "../server/MqttClient";

export interface GetFriendsCmd extends ApiCommand {

    count: number // get this many. TODO: count and offset don't work now
    offset: number
}

export interface GetFriendsReply extends ApiCommand {

    friends: string[]
    followers: string[]
    following: string[]
    blocked: string[]
    name2keys: Map<string, string[]> // name to it's public keys
}

export const GetFriendsReplyEmpty: GetFriendsReply = {

    cmd: "getFriends",
    friends: [],
    followers: [],
    following: [],
    blocked: [],
    name2keys: new Map()
}

export type GetFriendsReceiver = (reply: GetFriendsReply, error: any) => any

export function IssueTheCommand(username: string, count: number, offset: number, receiver: GetFriendsReceiver) {
    setTimeout(() => {
        myIssueTheCommand(username, count, offset, receiver)
    }, 10);
}

function myIssueTheCommand(username: string, count: number, offset: number, receiver: GetFriendsReceiver) {

    var cmd: GetFriendsCmd = {
        cmd: "getFriends",
        count: count,
        offset: offset
    }

    // if ( retries === undefined ){
    //     retries = 0
    // }
    // var nextRetryNumber = retries + 1

    const jsonstr = JSON.stringify(cmd)

    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = getFriendsWaitingRequest

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        console.log("getFriends return ", error)
        if (error !== undefined) {
            // try again, in a sec.
            console.log("GetFriends SendApiCommandOut error, retrying ", username)
            setTimeout(() => {
                IssueTheCommand(username, count, offset, receiver)
            }, 5000)
        } else {
            var reply: GetFriendsReply = strdata.length > 0 ? JSON.parse(strdata, reviver) : {}
            receiver(reply, error)
        }
    })
}

const getFriendsWaitingRequest: WaitingRequest = {
    id: "getFriends",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleGetFriendsApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    // callerPublicKey64 : "unknown"
}

//   function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

//     getFriendsWaitingRequest.options.set("api1", getFriendsWaitingRequest.id)
//      // returnsWaitingMap map is handling incoming packets in mqttclient 
//     returnsWaitingMap.set(getFriendsWaitingRequest.id, getFriendsWaitingRequest)
// }

//mqttclient.returnsWaitingMapset(getFriendsWaitingRequest.id, getFriendsWaitingRequest)

export function getWr(): WaitingRequest {
    return getFriendsWaitingRequest
}

function handleGetFriendsApi(wr: WaitingRequest, err: any) {

    console.log("in the handleGetFriendsApi with ", util.getTopicName(wr.topic), wr.message.toString())

    var cmd: GetFriendsCmd = JSON.parse(wr.message.toString())

    const count = cmd.count
    //const offset = cmd.offset

    var cryptoContext = util.getHashedTopic2Context(wr.topic) || util.emptyContext // this smells
    var configItem = config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory

    if (count !== 0) {
        // add end date ? 
        var reply: GetFriendsReply = GetFriendsReplyEmpty

        var expecting = 0

        expecting += 1
        fs.readFile(path + "friends.txt", (err, data) => {
            if (err) {
                console.log(" read friends error " + path, err)
            } else {
                reply.friends = data.toString('utf8').split("\n")
            }
            checkDone()
        })
        expecting += 1
        fs.readFile(path + "followers.txt", (err, data) => {
            if (err) {
                console.log(" read followers error " + path, err)
            } else {
                reply.followers = data.toString('utf8').split("\n")
            }
            checkDone()
        })
        expecting += 1
        fs.readFile(path + "following.txt", (err, data) => {
            if (err) {
                console.log(" read following error " + path, err)
            } else {
                reply.following = data.toString('utf8').split("\n")
            }
            checkDone()
        })
        expecting += 1
        fs.readFile(path + "blocks.txt", (err, data) => {
            if (err) {
                console.log(" read blocked error " + path, err)
            } else {
                reply.blocked = data.toString('utf8').split("\n")
            }
            checkDone()
        })
        expecting += 1
        fs.readFile(path + "key.txt", (err, data) => {
            if (err) {
                console.log(" read key error " + path, err)
            } else {
                var array = data.toString('utf8').split("\n")
                array.forEach(str => {
                    const parts = str.split(" ")
                    const name = parts[0]
                    const keys: string[] = parts.slice(1)
                    reply.name2keys.set(name, keys)
                });
            }
            checkDone()
        })

        const checkDone = () => {
            expecting -= 1
            if (expecting <= 0) {
                var jsonstr = JSON.stringify(reply, replacer)
                // console.log("have reply friends ", jsonstr  )
                SendApiReplyBack(wr, Buffer.from(jsonstr), null)
                // and, we're done here
            }
        }
    }
}

function replacer(key: any, value: any) {
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
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}

export type FriendsCache = {
    who: string
    when: number // of ms
}
