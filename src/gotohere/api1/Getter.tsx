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

// import * as s from '../server/SocialTypes';

export { } // my lifes ambition is to be a module

export type ItemVars<NeedType, GotType> = {
    ref: string

    needed: Map<string, NeedType>
    pending: Map<string, NeedType>
    ready: GotType[]

    owned: Map<string, GotType>

    subscribeLevel: number

    callback?: (ready: GotType[]) => any // the subscription
}


export class Getter<NeedType, GotType> {

    theClients: Map<string, ItemVars<NeedType, GotType>>
    timerID: NodeJS.Timer
    isTesting : boolean

    constructor() {
        this.isTesting = false
        this.timerID = setInterval(() => {
            this.heartbeat()
        }, 100)
        this.theClients = new Map()
    }

    // override me
    keyofN(t: NeedType): string {
        return "keyoffixme1"
    }

    // override me
    keyofG(t: GotType): string {
        return "keyoffixme2"
    }

    getClient(ref: string): ItemVars<NeedType, GotType> {
        var got = this.theClients.get(ref)
        if (got !== undefined) {
            return got
        }
        var client: ItemVars<NeedType, GotType> = {
            needed: new Map(),
            pending: new Map(),
            ready: [],
            owned: new Map(),
            ref: ref,
            subscribeLevel: 0
        }
        this.theClients.set(ref, client)
        return client
    }

    // if it's not pending then queue  in needed.
    // if it exists, and is in owned, that will be dealt with later
    // we return isNew for convenience
    need(ref: string, array: NeedType[]) : boolean {
        var isNew = false
        var client = this.getClient(ref)
        for (const r of array) {
            const key = this.keyofN(r)
            const ispending = client.pending.get(key)
            if (ispending === undefined) {
                client.needed.set(key, r)
                isNew = true
            }
        }
        return isNew
    }

    subscribe(ref: string, callback: (ready: GotType[]) => any) {
        var client = this.getClient(ref)
        client.callback = callback
        client.subscribeLevel += 1
    }

    unsubscribe(ref: string) {
        var client = this.getClient(ref)
        client.subscribeLevel -= 1
    }

    heartbeat() {

        this.theClients.forEach((value: ItemVars<NeedType, GotType>, key: string) => {
             
            const client: ItemVars<NeedType, GotType> = value

            // request the need and move them to pending and to the commend api
            // need is screened for 
            var getting : NeedType[] = []
            client.needed.forEach((value: NeedType, key: string) => {
                const p  = client.owned.get(key)
                if ( p ){
                    client.ready.push(p)
                } else {
                    getting.push(value)
                }
            });
            client.needed.clear()

            const dataArrivingCb = ( gots : GotType[] ) => {
                for ( var got of gots ){
                    const key = this.keyofG(got)
                    client.owned.set(key,got)
                    client.ready.push( got)
                    // client.pending.delete(key) // assumes the key compare 
                }
            }
            // magically convert an array of needtype to an array of gottype
            if ( getting.length > 0 ) { 
                // move the getting to pending
                for ( const g of getting){
                    client.pending.set( this.keyofN(g) , g)
                }
                this.useTheApi( key, getting,  dataArrivingCb)
            }
            
            // move the ready to the callback 
            if (client.callback && client.ready.length !== 0) {
                client.callback(client.ready)
                // copy to owned?
                client.ready = []
            }
        });
    }

    // don't forget to delete the pending that are not pending anymore now.
    useTheApi( ref: string, getting: NeedType [] , cb:( gots : GotType[] ) => any) {
        // no magic here. need override
        console.log("over ride me for petes sake")
    }
}

export default Getter














