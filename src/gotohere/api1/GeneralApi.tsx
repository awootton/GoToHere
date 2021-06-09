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
import * as util from '../mqtt/Util';
import ApiCommand from "./Api"
import * as api from "./Api"
import * as config from "../mqtt/Config"

import * as mqttclient from "../mqtt/MqttClient";

export {} // i want to beeee a module

// General means the 'generalInfo' in the UI
// we'll also use this as SaveGeneral 

export type GeneralInfo = {

    image: string // a url

    name: string
    publickey: string,
    location: string
    about: string
    tags: string

    twitter: string
    facebook: string
    instagram: string
    youtube: string
    tiktok: string
    patreon: string
    bitcoin: string

    linkedin: string
    github: string

    more: string
}

export const GeneralInfoSample: GeneralInfo = {

    image: "http://loremflickr.com/300/200",

    name: "your name here",
    publickey: "",
    location: "anytown usa",
    about: "",
    tags: "",

    twitter: "",
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    patreon: "",
    bitcoin: "35fqMZwsNokbAZsznmCvjVZLmiejAjW9EB",
    linkedin: "",
    github: "",
    more: "",
}

// GeneralApiCmd has !== undefined when it's a save
export interface GeneralApiCmd extends ApiCommand {
    generalInfo: GeneralInfo | undefined
}

export interface GeneralApiReply extends ApiCommand {

    generalInfo: GeneralInfo
}

export const GeneralApiReplyEmpty: GeneralApiReply = {

    cmd: "GeneralApi",
    generalInfo: GeneralInfoSample
}

export type GeneralApiReceiver = (reply: GeneralApiReply, error: any) => any

export function IssueTheCommand(username: string, generalInfo: GeneralInfo | undefined, receiver: GeneralApiReceiver) {

    var cmd: GeneralApiCmd = {
        cmd: "GeneralApi",
        generalInfo: generalInfo
    }

    const jsonstr = JSON.stringify(cmd)

    console.log("jsonstr of GeneralApiCmd ", jsonstr )

    const wr: WaitingRequest = GeneralApiWaitingRequest

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        console.log("App is  back from GeneralApi SendApiCommandOut from user ", username)

        if (error !== undefined) {
            // try again, in a sec. forever
            console.log("GeneralApi SendApiCommandOut timed out, retrying ", username)
            setTimeout(() => {
                IssueTheCommand(username, generalInfo, receiver)
            }, 15000)
        } else {
            var reply: GeneralApiReply = strdata.length > 0 ? JSON.parse(strdata, reviver) : {}
            receiver(reply, error)
        }
    })
}

const GeneralApiWaitingRequest: WaitingRequest = {
    id: "GeneralApi",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleGeneralApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    //callerPublicKey64: "unknown"
}

//   function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

//     GeneralApiWaitingRequest.options.set("api1", GeneralApiWaitingRequest.id)
//     // returnsWaitingMap map is handling incoming packets in mqttclient 
//     returnsWaitingMap.set(GeneralApiWaitingRequest.id, GeneralApiWaitingRequest)
// }


//mqttclient.returnsWaitingMapset(GeneralApiWaitingRequest.id, GeneralApiWaitingRequest)


export function getWr(): WaitingRequest {
    return GeneralApiWaitingRequest
}

 

function handleGeneralApi(wr: WaitingRequest, err: any) {

    console.log("in the handleGeneralApi with ", util.getTopicName(wr.topic), wr.message.toString())

    const cmd: GeneralApiCmd = JSON.parse(wr.message.toString())

    var cryptoContext = util.getHashedTopic2Context(wr.topic)
    var configItem =  config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory + "generalinfo.txt"

    const done = (data: any) => {

        // the data is the info
        const gen : GeneralInfo = JSON.parse(data)

        const reply: GeneralApiReply = {
            cmd: "GeneralApi",
            generalInfo : gen
        }

        var jsonstr = JSON.stringify(reply, replacer)
        // console.log("have reply GeneralApi ", jsonstr  )
        SendApiReplyBack(wr, Buffer.from(jsonstr), null)

        // and, we're done here, except - broadcast event
        cmd.generalInfo = gen
        api.Broadcast(cryptoContext, cmd)
    }

    if (cmd.generalInfo != undefined) { // it's a save
        const data = JSON.stringify(cmd.generalInfo, null,2)
        fs.writeFile(path, data, (err) => {
            // when it's just a save
            if (err) {
                console.log(" write GeneralInfo error " + path, err)
            } else {
               
            }
            done(data)
        })
        return
    } else { // it's a get

        fs.readFile(path, (err, data) => {
            if (err) {
                console.log(" read GeneralInfo error " + path, err)
            } else {

            }
            done(data)
        })
    }

}

// let's get rid of these or move them TODO: (atw)
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


