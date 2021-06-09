
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
 
//const assert = require('assert');

// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/test/GetCommentstestcaller

// this will require that the servefr is runnign 


import * as tt from './GetComments.test'

console.log('Batman begins');
process.on('exit', function(code) {
    return console.log(`About to exit with code ${code}`);
});

function runit() {
    
    tt.testBody ( ()=>{
        console.log("back from somewhere" )
        process.exit(0) // there's hearbeat timers. it will never quit
    } )  
}

runit()

// test('try the Getter', done => {

//     console.log("in GetComments.test")

//     var received: s.Comment[] = []

//     apputil.bootSequence((done: boolean) => {
//         if (done) {
//             dotherest()
//         } else {
//             console.log("waiting GetComments.test to book")
//         }
//     })

//     const dotherest = () => {
//         var path = 'data/dummy/lists/comments'

//         if (fs.existsSync(path)) {
//             // you suck fs.unlinkSync(path);
//         }
//         //fs.mkdirSync(path);

//         // 21 05 12 01:30:44 588ms gmt
//         const testid = 210512013044588
//         const componentref = "87654321"

//         const theme = fake.themeKeys[3]
//         const parent: s.Reference = s.StringRefToRef("" + (testid + 1) + " dummy")
//         var c: s.Comment = fake.makeComment("dummy", testid, theme, parent)
//         fake.writeComment("dummy", c)

//         var ref: s.Reference = {
//             id: testid,
//             by: "dummy"
//         }
//         const callback = (ready: s.Comment[]) => {
//             for (c of ready) {
//                 console.log(" loaded commnent c", c.id)
//                 received.push(c)
//             }
//         }

//         commapi.CommentGetter.isTesting = true
//         commapi.CommentGetter.subscribe(componentref, callback)

//         var client = commapi.CommentGetter.getClient(componentref)
//         assert.ok(client.callback !== undefined)
//         assert.ok(client.subscribeLevel === 1)

//         commapi.CommentGetter.need(componentref, [ref])
//         assert.ok(client.needed.size !== 0)

//         var waitingCoounter = 0
//         var timerid = setInterval(() => {

//             if (received.length !== 0) {
//                 // good
//                 clearInterval(timerid)

//                 console.log("got commennt ", received)

//                 done(null);

//             } else if (waitingCoounter > 20) {
//                 // and error, for sure
//                 assert.ok(waitingCoounter < 20)
//             }
//             waitingCoounter += 1

//         }, 5000)

//         setInterval(() => {

//             console.log("just wait here a minjute ")

//         }, 5000)
//     }

// });

