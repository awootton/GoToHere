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
import { WaitingRequest, SendApiReplyBack } from './Api';
import ApiCommand from "./Api"
import * as api from './Api';
import * as util from '../knotservice/Util';
//import * as c_util from '../components/CryptoUtil';

 
export interface PingCmd extends ApiCommand {
    pub: string // a public key in base64url
}

export type PingReceiver = ( cmd: PingCmd, error: any) => any

export function IssueTheCommand(from : string,to: string, receiver: PingReceiver) {

    from = from.toLowerCase()
    const fromcontext: util.Context = util.getNameToContext(from)

    const cmd: PingCmd = {
        cmd: "ping",
        pub: util.toBase64Url(fromcontext.ourPublicKey[0])
    }
    const jsonstr = JSON.stringify(cmd)
    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = pingsWaitingRequest
    const topic = to
    
    console.log(" Ping IssueTheCommand using topic ", topic , from, to )
     
    api.SendApiCommandOut(wr, topic, jsonstr, (data: Uint8Array, error: any) => {

        const strdata = new TextDecoder().decode(data)
        //console.log("App is  back from ping with data ", strdata, error)
        if (error || strdata.length === 0) {
            cmd.pub = error
            receiver( cmd , error)
        } else {
            var gotcmd: PingCmd = JSON.parse(strdata)
            receiver(gotcmd, error)
        }
    })
}

const pingsWaitingRequest: WaitingRequest = {
    id: "ping",
    when: util.getMilliseconds(),
    permanent: true,
    topic: "unknown",
    message: new Uint8Array(),
    replydata: new Uint8Array(),
    waitingCallbackFn: handlePingApi,
    options: new Map<string, string>(),
    returnAddress: "unused now",
    isPing:true
    // skipCryptoForThisOne: true, // NEVER DO THIS
    //callerPublicKey64 : "unknown"
}

//    function InitApiHandler( ) {

//     pingsWaitingRequest.options.set("api1", pingsWaitingRequest.id)
//     mqttclient.returnsWaitingMapset(pingsWaitingRequest.id, pingsWaitingRequest)
// }

// console.log("in the handlePingApi main") // why does this not work?
// mqttclient.returnsWaitingMapset(pingsWaitingRequest.id, pingsWaitingRequest)

export function getWr(): api.WaitingRequest {
    return pingsWaitingRequest
}



export function handlePingApi(wr: WaitingRequest, err: any) {

    var context: util.Context = util.getHashedTopic2Context(wr.topic)

    console.log("in the handlePingApi with ", wr.topic, wr.message.toString(), util.KnotNameHash("alice_vociferous_mcgrath"))

    var pingCmd: PingCmd = JSON.parse(wr.message.toString())

    pingCmd.pub = util.toBase64Url(context.ourPublicKey[0])
    const cmdBytes = JSON.stringify(pingCmd)
    SendApiReplyBack(wr, Buffer.from(cmdBytes), null)
}
