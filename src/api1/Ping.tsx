
import { WaitingRequest, SendApiReplyBack } from './Api';
import ApiCommand from "./Api"
import * as api from './Api';
import * as util from '../server/Util';
//import * as c_util from '../components/CryptoUtil';


export interface PingCmd extends ApiCommand {
    pub: string // a public key in base64url
}

export type PingReceiver = ( cmd: PingCmd, error: any) => any

export function IssueTheCommand(from : string,to: string, receiver: PingReceiver) {

    const fromcontext: util.Context = util.getNameToContext(from)

    const cmd: PingCmd = {
        cmd: "ping",
        pub: util.toBase64Url(fromcontext.ourPublicKey)
    }
    const jsonstr = JSON.stringify(cmd)
    //console.log("jsonstr of cmd ", jsonstr,)

    const wr: WaitingRequest = pingsWaitingRequest
    const topic = to
    console.log(" Ping IssueTheCommand using topic ", topic , from, to )
    // "alice_vociferous_mcgrath" // double FIXME:

    api.SendApiCommandOut(wr, topic, jsonstr, (data: Uint8Array, error: any) => {

        const strdata = new TextDecoder().decode(data)
        console.log("App is  back from ping with data ", strdata, error)
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

export function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

    pingsWaitingRequest.options.set("api1", pingsWaitingRequest.id)
    returnsWaitingMap.set(pingsWaitingRequest.id, pingsWaitingRequest)
}

export function handlePingApi(wr: WaitingRequest, err: any) {

    var context: util.Context = util.getHashedTopic2Context(wr.topic)

    console.log("in the handlePingApi with ", wr.topic, wr.message.toString(), util.KnotNameHash("alice_vociferous_mcgrath"))

    var pingCmd: PingCmd = JSON.parse(wr.message.toString())

    pingCmd.pub = util.toBase64Url(context.ourPublicKey)
    const cmdBytes = JSON.stringify(pingCmd)
    SendApiReplyBack(wr, Buffer.from(cmdBytes), null)
}
