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
import assert from 'assert'


import * as s from '../gotohere/knotservice/SocialTypes';
import * as commapi from '../gotohere/api1/GetComments';
import * as fake from '../fake/initFakeData';
import * as apputil from '../AppUtil'
import * as util from '../gotohere/knotservice/Util'

//const assert = require('assert');

// npm test GetComments.test.tsx

// this will require that the servefr is runnign 

export {} 

// test('try the Getter', done => {
//     // not sure this works testBody(done)
//     console.log("these tests don't really work as unit tests. More like system tests.")
// } )


test('just log to console', () => {
    console.log("just log to console from GetComments.test")
  });
  

export function testBody ( done : ()=>any ) {

    console.log("in GetComments.test")

    var received: s.Comment[] = []

    util.setisTestingNotClient()
    apputil.setisTestingNotClient()
//    global.fetch = fetch

    const bootCallback = ( done: boolean ) => {
        if (done) {
            dotherest()
        } else {
            console.log("waiting GetComments.test to book")
            apputil.bootSequence(bootCallback)
        }
    }
    apputil.bootSequence(bootCallback)

    const dotherest = () => {
        var path = 'data/dummy/lists/comments'

        // if (fs.existsSync(path)) {
        //     // you suck fs.unlinkSync(path);
        // }
        //fs.mkdirSync(path);

        // 21 05 12 01:30:44 588ms gmt
        const testid = 210512013044588
        const componentref = "87654321"

        const theme = fake.themeKeys[3]
        const parent: s.Reference = s.ReferenceFromStr("" + (testid + 1) + " dummy")
        var c: s.Comment = fake.makeComment("dummy", testid, theme, parent)
        fake.writeComment("dummy", c)

        var ref: s.Reference = {
            id: testid,
            by: "dummy"
        }
        const callback = (ready: s.Comment[]) => {
            for (c of ready) {
                console.log(" loaded commnent c", c.id)
                received.push(c)
            }
        }

        commapi.CommentGetter.isTesting = true
        commapi.CommentGetter.subscribe(componentref, callback)

        var client = commapi.CommentGetter.getClient(componentref)
        assert.ok(client.callback !== undefined)
        assert.ok(client.subscribeLevel === 1)

        commapi.CommentGetter.need(componentref, [ref])
        assert.ok(client.needed.size !== 0)

        var waitingCoounter = 0
        var timerid = setInterval(() => {

            if (received.length !== 0) {
                // good
                clearInterval(timerid)

                console.log("got commennt SUCCESS !!! ", received.length)

                done();

            } else if (waitingCoounter > 20) {
                // and error, for sure
                assert.ok(waitingCoounter < 20)
            }
            waitingCoounter += 1

        }, 5000)

        // setInterval(() => {

        //     console.log("just wait here a minjute ")

        // }, 5000)
    }
}

