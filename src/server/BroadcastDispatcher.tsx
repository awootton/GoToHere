
import { getMqttThing } from "./MqttClient"

import * as event from "../api1/Event"
import * as util from "./Util"

export { }

export type ReceiverFunc = (event: event.EventCmd) => any

type receiverType = {
    rname: string // used to id this receiver
    receiver: ReceiverFunc
}

type BroadcastItem = {
    name: string
    when: number
    receivers: receiverType[]
}

var globalMap: Map<string, BroadcastItem> = new Map()

export function SubscribeAll() {
    globalMap.forEach((value: BroadcastItem, key: string, map: Map<string, BroadcastItem>) => {
        var mqtt = getMqttThing()
        if (mqtt !== undefined) {
            mqtt.subscribeFunc(value.name)
        } else {
            console.log("ERROR SubscribeAll no mqtt")
        }
    })
}

export function DispatchAll(event: event.EventCmd) {
    var sitename = event.who
    if (sitename.startsWith("=")) {
        console.log("ERROR names cannot be alieases here. no starts with =")
    }
    sitename = sitename.toLowerCase() + "_broadcast"
    var found: BroadcastItem | undefined = globalMap.get(sitename)
    if (found !== undefined) {
        found.receivers.forEach(item => {
            item.receiver(event)
        });
    }
}

export function Subscribe(sitename: string, rname: string, receiver: ReceiverFunc) {
    if (sitename.startsWith("=")) {
        console.log("ERROR names cannot be alieases here. no starts with =")
    }
    sitename = sitename.toLowerCase() + "_broadcast"

    var found: BroadcastItem | undefined = globalMap.get(sitename)
    if (found === undefined) {
        var newItem: BroadcastItem = {
            name: sitename,
            receivers: [],
            when: util.getMilliseconds()
        }
        found = newItem
        globalMap.set(sitename, found)
    }

    // jeez
    var index: number = -1//found.receivers.indexOf(receiver, 0)
    for (var i = 0; i < found.receivers.length; i++) {
        const r = found.receivers[i]
        // if ( r.receiver === receiver ){
        //     index = i
        // }
        if (r.rname === rname) {
            index = i
        }
    }
    if (index >= 0) {
        found.receivers.splice(index, 1); // just in case so there's not 2 - we do subscribe over and over
    }
    const newReceiverStruct: receiverType = {
        rname: rname,
        receiver: receiver
    }
    found.receivers.push(newReceiverStruct)

    if (found.receivers.length === 1 && index < 0) {
        var mqtt = getMqttThing()
        if (mqtt !== undefined) {
            mqtt.subscribeFunc(sitename)
        } else {
            console.log("ERROR Subscribe no mqtt")
        }
    }
}

export function Unsubscribe(sitename: string, rname: string) {
    if (sitename.startsWith("=")) {
        console.log("ERROR names cannot be alieases here. can't start with =")
    }
    sitename = sitename.toLowerCase() + "_broadcast"

    var found: BroadcastItem | undefined = globalMap.get(sitename)
    if (found === undefined) {
        return
    }
    // jeez
    var index: number = -1//found.receivers.indexOf(receiver, 0)
    for (var i = 0; i < found.receivers.length; i++) {
        const r = found.receivers[i]
        if (r.rname === rname) {
            index = i
        }
    }
    if (index >= 0) {
        found.receivers.splice(index, 1);
    }

    if (found.receivers.length === 0) {
        found.when = util.getMilliseconds()
    }
    // do this part later: in the cleaner. see CleanOldItems()
    // if (found.receivers.length == 0) {
    //     var mqtt = getMqttThing()
    //     if ( mqtt !== undefined ){
    //         mqtt.unsubscribeFunc(sitename)
    //     }
    //     globalMap.delete(sitename)
    // }
}

export function CleanOldItems() {

    var mqtt = getMqttThing()
    if (mqtt === undefined) {
        // later
        console.log("ERROR CleanOldItems no mqtt")
        return
    }
    var deadItems: string[] = []
    var now = util.getMilliseconds()

    globalMap.forEach((value: BroadcastItem, key: string, map: Map<string, BroadcastItem>) => {
        if (value.receivers.length === 0 && (now - value.when) > 2000) {
            deadItems.push(key)
        }
    })
    for (var i = 0; i < deadItems.length; i++) {
        var key = deadItems[i]
        mqtt.unsubscribeFunc(key)
        globalMap.delete(key)
    }
}