
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
import * as postapi from '../gotohere/api1/GetPosts';
import * as fake from '../fake/initFakeData';
import * as apputil from '../AppUtil'
import * as util from '../gotohere/knotservice/Util'
import * as config from '../gotohere/knotservice/Config'


 export {} 

//  node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/test/GetPostTest
 
console.log('Batman begins');
process.on('exit', function(code) {
    return console.log(`About to exit with code ${code}`);
});

function runit() {


    // make posts first
    var item : config.ServerConfigItem={
        name:"dummy",
        nameReservationToken: "none",
        port: "3010", // for forwarding http
        directory: "dummy", // where the data lives
      
        passphrase: [ "dummy","dummy2"],
    }
    fake.initPeople(item)

    const done = ()=>{
        console.log("back from somewhere" )
        process.exit(0) // there's hearbeat timers. it will never quit
    }

    console.log("in GetPostTest")

    var received: s.Post[] = []

    util.setisTestingNotClient()
    apputil.setisTestingNotClient()

    const bootCallback = ( done: boolean ) => {
        if (done) {
            dotherest()
        } else {
            console.log("waiting GetPostTest to boot")
            apputil.bootSequence(bootCallback)
        }
    }
    apputil.bootSequence(bootCallback)

    const dotherest = () => {
        // var path = 'data/dummy/lists/posts'

        // if (fs.existsSync(path)) {
        //     // you suck fs.unlinkSync(path);
        // }
        // //fs.mkdirSync(path);

        // 21 05 12 01:30:44 588ms gmt
        const testid = 210512013044588
        const componentref = "87654321"

        const theme = fake.themeKeys[3]
        const parent: s.Reference = s.ReferenceFromStr("" + (testid + 1) + " dummy")
        //var c: s.Comment = fake.makeFake("dummy", testid, theme, parent)
        const post = fake.makeFakePost("dummy", testid, theme)
        fake.writeFakePost("dummy", post)

        var ref: s.Reference = {
            id: testid,
            by: "dummy"
        }

        var pref : postapi.PostNeed = {
            username: "dummy",
            when: testid - 477 ,
            amt: 6
        }
        const callback = (ready: s.Post[]) => {
            for ( const post of ready) {
                console.log(" loaded post c", post.id)
                received.push(post)
            }
        }

        postapi.PostGetter.isTesting = true
        postapi.PostGetter.subscribe(componentref, callback)

        var client = postapi.PostGetter.getClient(componentref)
        assert.ok(client.callback !== undefined)
        assert.ok(client.subscribeLevel === 1)

        postapi.PostGetter.need(componentref, [pref])
        assert.ok(client.needed.size !== 0)

        var waitingCoounter = 0
        var timerid = setInterval(() => {

            if (received.length !== 0) {
                // good
                clearInterval(timerid)

                console.log("got post SUCCESS !!! ", received.length)

                done();

            } else if (waitingCoounter > 20) {
                // and error, for sure
                assert.ok(waitingCoounter < 20)
            }
            waitingCoounter += 1

        }, 5000)
    }
}

runit()


