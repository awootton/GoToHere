
import fs from 'fs'

import { WaitingRequest, ApiCommand, handleSendReplyCallback } from './Api';
import * as util from '../server/Util';
import * as api1 from "./Api"
import * as config from "../server/Config"

 
export  interface GetFriendsCmd extends ApiCommand {
    
    count: number // get this many. TODO: count and offset don't work now
    offset: number 
}

export  interface GetFriendsReply extends ApiCommand {
    
    friends: string [] 
    followers: string [] 
    following: string [] 
    blocked: string [] 
    key2name: Map<string,string> // maps pubk to  name
}

export const GetFriendsReplyEmpty : GetFriendsReply = {

    cmd: "getFriends",
    friends:   [] ,
    followers:   [] ,
    following:   [] ,
    blocked:   [] ,
    key2name:  new Map()
}

export type GetFriendsReceiver = ( reply: GetFriendsReply, error: any) => any

export function IssueTheCommand(username: string, count:number, offset:number, receiver: GetFriendsReceiver, retries? : number) {

    var cmd: GetFriendsCmd = {
        cmd: "getFriends",
        count: count, 
        offset: offset
    }

    if ( retries === undefined ){
        retries = 0
    }
    var nextRetryNumber = retries + 1
 
    const jsonstr = JSON.stringify(cmd)
    
    //console.log("jsonstr of cmd ", jsonstr,)

    var wr: WaitingRequest = getFriendsWaitingRequest

    api1.SendApiCommandOut(wr, username, jsonstr, (data: Uint8Array, error: any) => {

        var strdata = new TextDecoder().decode(data)
        //console.log("App is  back from SendApiCommandOut with data ", strdata)

        var reply: GetFriendsReply = strdata.length>0 ? JSON.parse(strdata,reviver ) : {}

        if ( error !== undefined && nextRetryNumber < 20 ){
            // try again, in a sec.
            setTimeout(()=>{
                IssueTheCommand(username, count, offset, receiver, nextRetryNumber)
            },1000)
        } else {
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
    callerPublicKey : "unknown" 
}

export function InitApiHandler(returnsWaitingMap: Map<string, WaitingRequest>) {

    getFriendsWaitingRequest.options.set("api1", getFriendsWaitingRequest.id)
     // returnsWaitingMap map is handling incoming packets in mqttclient 
    returnsWaitingMap.set(getFriendsWaitingRequest.id, getFriendsWaitingRequest)
}

function handleGetFriendsApi(wr: WaitingRequest, err: any) {

    console.log("in the handleGetfriendsApi with ", wr.topic, wr.message.toString())

    var cmd: GetFriendsCmd = JSON.parse(wr.message.toString())

    const count = cmd.count
    const offset = cmd.offset
    
    var cryptoContext = util.getMatchingContext( wr.topic )
    var configItem = cryptoContext.config || config.EmptyServerConfigItem
    var path = "data/" + configItem.directory

    if (count !== 0) {
        // add end date ? 
        var reply: GetFriendsReply = GetFriendsReplyEmpty

        var expecting = 0

        expecting += 1
        fs.readFile( path + "friends.txt", (err, data) => {
            if (err) {
                console.log(" read friends error " + path , err)
            } else {
                reply.friends = data.toString('utf8').split("\n")
            }
            checkDone()
        })
        expecting += 1
        fs.readFile( path + "followers.txt", (err, data) => {
            if (err) {
                console.log(" read followers error " + path , err)
            } else {
                reply.followers = data.toString('utf8').split("\n")
            }
            checkDone()
        })
        expecting += 1
        fs.readFile( path + "following.txt", (err, data) => {
            if (err) {
                console.log(" read following error " + path , err)
            } else {
                reply.following = data.toString('utf8').split("\n")
            }
            checkDone()
        })
        expecting += 1
        fs.readFile( path + "blocks.txt", (err, data) => {
            if (err) {
                console.log(" read blocked error " + path , err)
            } else {
                reply.blocked = data.toString('utf8').split("\n")
            }
            checkDone()
        })
        expecting += 1
        fs.readFile( path + "key.txt", (err, data) => {
            if (err) {
                console.log(" read key error " + path , err)
            } else {
                var array = data.toString('utf8').split("\n")
                array.forEach(str => {
                    const i = str.indexOf(" ")
                    const key = str.substring(0,i)
                    const name = str.substring(i+1)
                    reply.key2name.set(key,name)
                });
            }
            checkDone()
        })

        const checkDone = () => {
            expecting -= 1
            if ( expecting <= 0 ){
                var jsonstr = JSON.stringify(reply,replacer)
                // console.log("have reply friends ", jsonstr  )
                handleSendReplyCallback(wr, Buffer.from(jsonstr), null)
                // and, we're done here
            }
        }
    }
}

function replacer(key : any, value : any) {
    if(value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    } else {
      return value;
    }
  }

  function reviver(key: any, value: any) {
    if(typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }


