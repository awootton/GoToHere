
import fs from 'fs'

import * as  fakeTextcupcake from './fakeTextCupcake'
import * as  fakeTextHipster from './fakeTextHipster'
import * as  fakeTextKafka from './fakeTextKafka'
import * as  fakeTextLorem from './fakeTextLorem'
import * as  fakeTextMonacle from './fakeTextMonacle'
import * as  fakeTextSpace from './fakeTextSpace'

import * as  util from '../server/Util'
import * as  social from '../server/SocialTypes'


// to run this:
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/server/initFakeData

export { }

type fakeTextSelector = {
    pos: number,
    fakeText: string
}

var name2Fake = new Map<string, fakeTextSelector>()
name2Fake.set("cupcake", { pos: 0, fakeText: fakeTextcupcake.fakeText })
name2Fake.set("hipster", { pos: 0, fakeText: fakeTextHipster.fakeText })
name2Fake.set("kafka", { pos: 0, fakeText: fakeTextKafka.fakeText })
name2Fake.set("lorem", { pos: 0, fakeText: fakeTextLorem.fakeText })
name2Fake.set("monacle", { pos: 0, fakeText: fakeTextMonacle.fakeText })
name2Fake.set("space", { pos: 0, fakeText: fakeTextSpace.fakeText })

console.log("in init fake data")

function getSomeFakeText(wordCount: number, which: string): string {

    var tmp = name2Fake.get(which)
    var fakeText = { pos: 0, fakeText: "oops" }
    if (tmp == undefined) {
        console.log("didn't file fake text name ", which, " excpected ", name2Fake.keys())
    } else {
        fakeText = tmp
    }

    fakeText.fakeText = fakeText.fakeText.replace("\n"," ")
    fakeText.fakeText = fakeText.fakeText.replace("  "," ")
    fakeText.fakeText = fakeText.fakeText.replace("  "," ")

    var originalTextPos = fakeText.pos
    var someText = fakeText.fakeText
    var wcount = 0
    while (wcount < wordCount) {
        fakeText.pos++
        fakeText.pos = fakeText.pos % someText?.length
        if (someText[fakeText.pos] == ' ') {
            wcount++
            while (someText[fakeText.pos] == ' ') {
                fakeText.pos++
                fakeText.pos = fakeText.pos % someText.length
            }
        }
    }
    var gotSome = someText.substring(originalTextPos, fakeText.pos)
    return gotSome
}

function makeFakePost(i: number, path: string, theme: string) {  // eg timeline.posts, or photos

    console.log("making fake post")

    // 4 per day so every 6 hours
    // every hour 

    var nowMillis = (new Date()).getTime()
    nowMillis -= 1000 * 60 * 60 * 6 * i // 6 hours in ms
    var id = util.ConvertFromMsToDateNumber(nowMillis)

    var aTitle = getSomeFakeText(3, theme)

    var wordCount = Math.floor(15 + Math.random() * 40)
    var someText = getSomeFakeText(wordCount, theme)

    var post: social.Post = {
        id: id,
        title: aTitle.trim(),
        theText: someText.trim(), // ATW FIXME: shorter names text
        likes: [],  // like
        retweets: [], // rt
        comments: [] // comm
    }

    console.log(post)
    const theDay = Math.floor(id / 1000000000)
    const dirpath = path + "/" + theDay  + "/" // "data/lists/"+folder+"/" + theDay
    const fname = "" + id
    const wholepath = dirpath + fname
    var fbody = JSON.stringify(post)

    var pathParts = dirpath.split("/")
    var tmpPath  = ""
    pathParts.forEach( (part,i,arr) => {
        tmpPath += part + "/"
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }
    })

   
    fs.writeFile(wholepath, fbody, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(" makeFakePost File created!");
    });
}

    // this.topic2datafolder.set("alice_vociferous_mcgrath", "alice")
    // this.topic2datafolder.set("building_bob_bottomline_boldness", "bob")
    // this.topic2datafolder.set("charles_everly_erudite", "charles")
    // this.topic2datafolder.set("alan_tracey_wootton", "alan")
    // "data/lists/"+folder+"/" + theDay becomes  data/alice/lists/posts/
    // and data/alice/lists/timeline/

    for (var i = 0; i < 24; i++) {

        makeFakePost(i, "data/alice/lists/posts/", "cupcake")
        makeFakePost(i, "data/alice/lists/timeline/", "cupcake")

        makeFakePost(i, "data/bob/lists/posts/", "hipster")
        makeFakePost(i, "data/bob/lists/timeline/", "hipster")

        makeFakePost(i, "data/charles/lists/posts/", "monacle")
        makeFakePost(i, "data/charles/lists/timeline/", "monacle")

        makeFakePost(i, "data/alan/lists/posts/", "space")
        makeFakePost(i, "data/alan/lists/timeline/", "space")
        
    }