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

export type TimelineNeed = {
    when: s.DateNumber
    username: string
    amt: number
}

export class TimelineGetterClass extends getter.Getter<TimelineNeed, s.TimelineItem> {

    keyofN(t: TimelineNeed): string {
        return "" + t.when + " " + t.username
    }
    keyofG(t: s.TimelineItem): string {
        return s.StringRefNew(t)
    }
    // don't forget to delete the pending
    useTheApi(ref: string, needing: TimelineNeed[], cb: (gots: s.TimelineItem[]) => any) {
        // countRequested feature not working
        const timelineListReceiver = (postslist: s.TimelineItem[], countRequested: number, error: any) => {
            if (error) {
                console.log("ERROR useTheApi commentsReceiver has error", error)
            } else {
                var client = this.getClient(ref)
                client.pending.clear()
                cb(postslist)
            }
        }
        for (var need of needing) {
            IssueTheCommand(need.username, "" + need.when, need.amt, timelineListReceiver)
        }
    }
}

export var TimelineGetter: TimelineGetterClass = new TimelineGetterClass()

export default interface GetTimelineCmd extends ApiCommand {
    // Timeline are in reverse order, id's are YYMMDDHHMMSSmmm

    top: string // a newer data, typically now() or in 2031 
    count: number // get this many
}

export type TimelineListReceiver = (Timelinelist: s.TimelineItem[], countRequested: number, error: any) => any

export function IssueTheCommand(username: string, top: string, count: number, receiver: TimelineListReceiver) {

    var cmd: GetTimelineCmd = {
        cmd: "GetTimeline",
        top: top,
        count: count,
    }

    const jsonstr = JSON.stringify(cmd)
    // topic:string , jsonstr: string, cb: ( data:Uint8Array, error: any ) => {} ) {
    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = GetTimelineWaitingRequest

    //console.log("GetTimelineCmd SendApiCommandOut calling with user", username )

    api.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)

        console.log("GetTimelineCmd returns w err ", error)

        var Timelinelist: s.TimelineItem[] = strdata.length > 0 ? JSON.parse(strdata) : []

        if (error !== undefined) {
            console.log("GetTimelineCmd SendApiCommandOut have error,user ", error, username, util.getSecondsDisplay())
            // try again, in a sec.
            setTimeout(() => {
                console.log("GetTimelineCmd SendApiCommandOut timer done. IssueTheCommand AGAIN. ")
                IssueTheCommand(username, top, count, receiver)
            }, 3000)
        } else {
            //console.log("GteTimeline SendApiCommandOut receiver " )
            receiver(Timelinelist, count, error)
        }
    })
}

const GetTimelineWaitingRequest: WaitingRequest = {
    id: "GetTimeline",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handleGetTimelineApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    //callerPublicKey64 : "unknown+now" 
    //debug: true
}
export function getWr(): WaitingRequest {
    return GetTimelineWaitingRequest
}

function handleGetTimelineApi(wr: WaitingRequest, err: any) {

    //console.log("in the handleGetPostApi with ", util.getTopicName(wr.topic), wr.message.toString(), " by ",util.getPubkToName(wr.callerPublicKey))
    //console.log("in the handleGetPostApi with ", util.getTopicName(wr.topic), " key id ", wr.options.get("nonc") , util.getSecondsDisplay())

    var getTimelineCmd: GetTimelineCmd = JSON.parse(wr.message.toString())

    const top: number = + getTimelineCmd.top // the newest date inclusive
    const count = getTimelineCmd.count

    var cryptoContext = util.getHashedTopic2Context(wr.topic)
    var configItem = config.GetName2Config(cryptoContext.username)
    var path = "data/" + configItem.directory + "lists/timeline/"

    // make the directories if missing.
    fs.mkdirs(path,fs.dummyCb)

    if (count !== 0) {
        // add end date ? 
        var items: s.TimelineItem[] = []
        var done = false

        var haveOne = (data: Buffer): number => {
            if (done) {
                return items.length
            }
            if (context.force) {

                // we ran out of days but still not enough items
                var listBytes = JSON.stringify(items)
                //console.log("GetTimeline calling handleSendReplyCallback with",listBytes )
                SendApiReplyBack(wr, Buffer.from(listBytes), null)
                // and, we're done here
                done = true
                return items.length
            }
            const strdata: string = Buffer.from(data).toString('utf8')
            //console.log("haveOne with a days worth ", strdata)
            var tliList: string[] = strdata.split("\n")
            // skip the ones greater than us
            var i = 0
            for (i = 0; i < tliList.length; i++) {
                const str: string = tliList[i]
                const tli: s.TimelineItem = JSON.parse(str)
                const anid: number = tli.id
                if (anid <= top) {
                    break
                }
            }
            tliList = tliList.slice(i)
            for (i = 0; i < tliList.length; i++) {
                const tli: s.TimelineItem = JSON.parse(tliList[i])
                items.push(tli)
                if (items.length >= count && done === false) {
                    break
                }
            }

            if (items.length >= count && done === false) {
                var listBytes = JSON.stringify(items)
                //console.log("GetTimeline calling handleSendReplyCallback with",listBytes )
                SendApiReplyBack(wr, Buffer.from(listBytes), null)
                // and, we're done here
                done = true
            }
            return items.length
        }
        var context: fsApi.fsGetTimeContext = {
            countNeeded: count,
            newer: top,
            basePath: path,
            haveOne: haveOne,
            done: false,
            force: false
        }
        fsApi.fsGetTimelineCounted(context)
    }
}

