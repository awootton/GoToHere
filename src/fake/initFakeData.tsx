
import fs from 'fs'

import * as nacl from 'tweetnacl-ts'

//import Rand, { PRNG } from 'rand-seed';
//import * as crypto from 'crypto'

import * as  fakeTextcupcake from './fakeTextCupcake'
import * as  fakeTextHipster from './fakeTextHipster'
import * as  fakeTextKafka from './fakeTextKafka'
import * as  fakeTextLorem from './fakeTextLorem'
import * as  fakeTextMonacle from './fakeTextMonacle'
import * as  fakeTextSpace from './fakeTextSpace'
import * as  words from './wordlist'

import * as  util from '../server/Util'
import * as  social from '../server/SocialTypes'
import * as config from "../server/Config"

import Rand32 from './Rand32'


// to run this file :
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/fake/initFakeData

export { }

const wordArray: string[] = words.English_words.split("\n")

type fakeTextIterator = {
    pos: number, // position or offet from the beginning
    fakeText: string // a big batch of fake text
}

var name2Fake = new Map<string, fakeTextIterator>()

function initfakes() {
    name2Fake.set("cupcake", { pos: 0, fakeText: fakeTextcupcake.fakeText })
    name2Fake.set("hipster", { pos: 0, fakeText: fakeTextHipster.fakeText })
    name2Fake.set("kafka", { pos: 0, fakeText: fakeTextKafka.fakeText })
    name2Fake.set("lorem", { pos: 0, fakeText: fakeTextLorem.fakeText })
    name2Fake.set("monacle", { pos: 0, fakeText: fakeTextMonacle.fakeText })
    name2Fake.set("space", { pos: 0, fakeText: fakeTextSpace.fakeText })
}
initfakes()
var themeKeys: string[] = []
var arr = Array.from(name2Fake.keys())
for (let key of arr) {
    themeKeys.push(key)
}

console.log("in init fake data")
initPeople() // the entry point here <<===--- 

function getSomeFakeText(wordCount: number, which: string): string {

    var tmp = name2Fake.get(which)
    var fakeText = { pos: 0, fakeText: "oops" }
    if (tmp == undefined) {
        console.log("didn't file fake text name ", which, " excpected ", name2Fake.keys())
    } else {
        fakeText = tmp
    }

    fakeText.fakeText = fakeText.fakeText.replace("\n", " ")
    fakeText.fakeText = fakeText.fakeText.replace("  ", " ")
    fakeText.fakeText = fakeText.fakeText.replace("  ", " ")

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

function makeFakePost( username:string, id: number, path: string, theme: string) {  // eg timeline.posts, or photos

    console.log("making fake post ", id, path, theme)

    // 4 per day so every 6 hours
    // every hour 

    var aTitle = getSomeFakeText(3, theme)

    var wordCount = Math.floor(15 + Math.random() * 40)
    var someText = getSomeFakeText(wordCount, theme)

    var post: social.Post = {
        id: id,
        title: aTitle.trim(),
        theText: someText.trim(), // ATW FIXME: shorter names text
        likes: [],  // like
        retweets: [], // rt
        comments: [], // comm
        postedByName : username
    }

    console.log(post)
    const theDay = Math.floor(id / 1000000000)
    const dirpath = path + "/" + theDay + "/" // "data/lists/"+folder+"/" + theDay
    const fname = "" + id
    const wholepath = dirpath + fname
    var fbody = JSON.stringify(post)

    var pathParts = dirpath.split("/")
    var tmpPath = ""
    pathParts.forEach((part, i, arr) => {
        tmpPath += part + "/"
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }
    })
    fs.writeFile(wholepath, fbody, function (err) {
        if (err) {
            return console.error(err);
        }
        //console.log(" makeFakePost File created!");
    });
}

// this.topic2datafolder.set("alice_vociferous_mcgrath", "alice")
// this.topic2datafolder.set("building_bob_bottomline_boldness", "bob")
// this.topic2datafolder.set("charles_everly_erudite", "charles")
// this.topic2datafolder.set("alan_tracey_wootton", "alan")
// "data/lists/"+folder+"/" + theDay becomes  data/alice/lists/posts/
// and data/alice/lists/timeline/

// for (var i = 0; i < 24; i++) {

//     makeFakePost(i, "data/alice/lists/posts/", "cupcake")
//     makeFakePost(i, "data/alice/lists/timeline/", "cupcake")

//     makeFakePost(i, "data/bob/lists/posts/", "hipster")
//     makeFakePost(i, "data/bob/lists/timeline/", "hipster")

//     makeFakePost(i, "data/charles/lists/posts/", "monacle")
//     makeFakePost(i, "data/charles/lists/timeline/", "monacle")

//     makeFakePost(i, "data/alan/lists/posts/", "space")
//     makeFakePost(i, "data/alan/lists/timeline/", "space")

// }

// The trick: make it idempotent

type FakeProfileProfile = {
    item: config.ServerConfigItem
    pubk64: string // the public key in base64url
    theme: string
    blocks: string []   // of pubk64
    friends: string []  // of pubk64
    relatives: string [] // of pubk64
    following: string [] // of pubk64
    key : string [] // pub key followed by space then name
}

// The trick: make it idempotent
// for that to work the nowMillis can't change every milli

function initPeople() {

    var localConfig: config.ServerConfigList = readServerConfig("sample_server_config.json")

    var rand: Rand32 = new Rand32('123456')

    var profileList: FakeProfileProfile[] = []

    var nowMillis = 1620894344588 // (new Date()).getTime() // 21 may 13 was last run

    var pubkToName: Map<string,string> = new Map()

    // 20 people.
    for (var personIndex = 0; personIndex < 20; personIndex++) {
        var item: config.ServerConfigItem
        var pro: FakeProfileProfile
        if (personIndex < localConfig.items.length) {
            item = localConfig.items[personIndex]
            pro = {
                item: item,
                pubk64: "",
                theme: "fixme",
                blocks: [],
                friends:   [] ,
                relatives:   [],
                following:   [],
                key :   []
            }
        } else {
            var theName = makeRandName(rand, 3)
            item = {
                name: theName,
                nameReservationToken: "nonameReservationToken",
                port: "3010",  // for forwarding http
                directory: theName,  // where the data lives
                passphrase: makeRandName(rand, 4)
            }
            localConfig.items.push(item)
            pro = {
                item: item,
                pubk64: "",
                theme: "fixme",
                blocks: [],
                friends:   [] ,
                relatives:   [],
                following:   [],
                key :   []
            }
        }

        var theme = ""
        if (item.name === "alice_vociferous_mcgrath") {
            theme = "cupcake"
        }
        if (item.name === "building_bob_bottomline_boldness") {
            theme = "hipster"
        }
        if (item.name === "charles_everly_erudite") {
            theme = "monacle"
        }
        if (theme.length == 0) {
            theme = themeKeys[Math.floor(rand.next() * themeKeys.length)]
        }
        pro.theme = theme
        profileList.push(pro)
    }// people loop
    //console.log(localConfig)
    for (var pro of profileList) {
        // check for the directory
        var dirName = "data/" + pro.item.directory
        if (!fs.existsSync(dirName)) {
            console.log("making directory ", dirName)
            fs.mkdirSync(dirName)
        }
    }// people loop

    for (var pro of profileList) {
        // init all the keys? 
        var keypair: nacl.BoxKeyPair = util.getBoxKeyPairFromPassphrase(pro.item.name, pro.item.passphrase)
        pro.pubk64 = util.toBase64Url(keypair.publicKey)

        pubkToName.set(pro.pubk64,pro.item.name)
    }// people loop

    for (var pro of profileList) {
        // init the posts 
        // check the first one
        
        var id = util.ConvertFromMsToDateNumber(nowMillis)
        var path = "data/" + pro.item.directory + "/lists/posts/"
        var fname = "" + id
        fname = fname.substr(0, 6)
        fname = path + fname
        if (!fs.existsSync(fname)) {

            for (var i = 0; i < 24; i++) {
                var ms = nowMillis - 1000 * 60 * 60 * 6 * i // 6 hours in ms
                var id = util.ConvertFromMsToDateNumber(ms)
                makeFakePost(pro.item.name, id, "data/" + pro.item.directory + "/lists/posts/",  pro.theme)

            }
            // do timeline, aka events, later 
            for (var i = 0; i < 24; i++) {
                var ms = nowMillis - 1000 * 60 * 60 * 6 * i // 6 hours in ms
                var id = util.ConvertFromMsToDateNumber(ms)
                //makeFakePost(id, "data/" + pro.item.directory + "/lists/timeline/",  pro.theme)
            }
        }

    }// people loop

    for (var pro of profileList) {
         // block 3 people
         for ( let i = 0; i < 3; i ++ ){
            while( true ){
                var other = profileList[ Math.floor(rand.next() * profileList.length)]
                if ( other.item.name != pro.item.name && pro.blocks.find(x => x === other.pubk64) == undefined){
                    pro.blocks.push(other.pubk64 )
                    break
                }
            }
         }
         // write it 
         const str = pro.blocks.join("\n")
         fs.writeFileSync("data/" + pro.item.directory + "/blocks.txt", str)
    }// people loop

    for (var pro of profileList) {
        // make friends 
        for ( let i = 0; i < 5; i ++ ){
            while( true ){
                var other = profileList[ Math.floor(rand.next() * profileList.length)]
                if ( other.item.name != pro.item.name && pro.friends.find(x => x === other.pubk64) == undefined){
                    pro.friends.push(other.pubk64 )
                    break
                }
            }
         }
         // write it 
         const str = pro.friends.join("\n")
         fs.writeFileSync("data/" + pro.item.directory + "/friends.txt", str)

    }// people loop

    for (var pro of profileList) {
        // make relatives 
        for ( let i = 0; i < 5; i ++ ){
            while( true ){
                var other = profileList[ Math.floor(rand.next() * profileList.length)]
                if ( other.item.name != pro.item.name && pro.relatives.find(x => x === other.pubk64) == undefined){
                    pro.relatives.push(other.pubk64 )
                    break
                }
            }
         }
         // write it 
         const str = pro.relatives.join("\n")
         fs.writeFileSync("data/" + pro.item.directory + "/relatives.txt", str)

    }// people loop

    for (var pro of profileList) {
        // make following 
        for ( let i = 0; i < 5; i ++ ){
            while( true ){
                var other = profileList[ Math.floor(rand.next() * profileList.length)]
                if ( other.item.name != pro.item.name  && pro.following.find(x => x === other.pubk64) == undefined){
                    pro.following.push(other.pubk64 )
                    break
                }
            }
         }
         // write it 
         const str = pro.following.join("\n")
         fs.writeFileSync("data/" + pro.item.directory + "/following.txt", str)

    }// people loop

    for (var pro of profileList) {
        // form the 'key'
        var mySet : Set<String> = new Set()
        
        pro.blocks.forEach(item => mySet.add(item))
        pro.friends.forEach(item => mySet.add(item))
        pro.relatives.forEach(item => mySet.add(item))
        pro.following.forEach(item => mySet.add(item))

        mySet.forEach( item => {
            var str:string = item + " " + (pubkToName.get(item.toString()) || "wtf")
            pro.key.push( str)
        } )
        const str = pro.key.join("\n")
         fs.writeFileSync("data/" + pro.item.directory + "/key.txt", str)

    }// people loop


    for (var pro of profileList) {
        // make permissions 

    }// people loop

    for (var pro of profileList) {
        // make comments 

    }// people loop

    for (var pro of profileList) {
        // make events 

    }// people loop

    for (var pro of profileList) {
        pro.item.port = "3010"
    }// people loop

    // write out the new config
    
    var previousConfig = readServerConfig("data/server_config.json")
    var newList: config.ServerConfigList = {
        token:"",
        items:[]
    }
    for (var pro of profileList) {
        newList.items.push(pro.item)
    }
    newList.token = previousConfig.token
    writeServerConfig("data/server_config.json",newList)

    var previousLoaclConfig = readServerConfig("data/server_config_local.json")
    newList = {
        token:"",
        items:[]
    }
    for (var pro of profileList) {
        newList.items.push(pro.item)
    }
    newList.token = previousLoaclConfig.token
    writeServerConfig("data/server_config_local.json",newList)
  

}

function makeRandName(rand: Rand32, size: number): string {
    var result = ""
    for (var i = 0; i < size; i++) {
        if (i != 0) {
            result += "_"
        }
        const r = rand.next()
        const which: number = Math.floor(r * wordArray.length)
        result += wordArray[which]
    }
    return result
}

function writeServerConfig( path : string, con : config.ServerConfigList)  {

    var str = JSON.stringify(con, null, 2) // indented json pretty
    fs.writeFileSync(path, str)
}



function readServerConfig(specialpath?: string): config.ServerConfigList {

    var path = "data/server_config.json"
    if (specialpath) {
        path = specialpath
    }
    var bytes = fs.readFileSync(path)

    var itemsList: config.ServerConfigList = JSON.parse(bytes.toString("utf8"))

    // check the token? 

    // check the paths

    // check the private keys how? 

    // for (let item of itemsList.items) {
    //     const userName = item.name
    //     const phrase = item.passphrase
    //     const keypair: nacl.BoxKeyPair = util.getBoxKeyPairFromPassphrase(userName, phrase)
    //    // item.publicLey = Buffer.from(keypair.publicKey)
    //    // item.privateKey = Buffer.from(keypair.secretKey)
    // };

    // for (let item of itemsList.items) {
    //     if (!item.directory.endsWith("/")) {
    //         item.directory = item.directory + "/"
    //         if (!fs.existsSync("data/" + item.directory)) {
    //             fs.mkdirSync("data/" + item.directory)
    //         }
    //     }
    // }


    //   c_util.cleanContexts()

    //   console.log(" BEFORE config fills in the c_util len = ", c_util.contexts.length)
    //   for (let item of itemsList.items) { // init the c_util
    //     var con: c_util.Context = {
    //       ...c_util.emptyContext,
    //       usernameFromApp: item.name,
    //       passwordFromApp: item.passphrase,
    //       profileNameFromApp: item.name,
    //       tokenFromApp: itemsList.token,
    //       config: item
    //     }
    //     c_util.initContext(con)
    //     c_util.contexts.push(con)
    //   }
    //   c_util.setCurrentIndex(0)  
    // we probably need some maps and hefre would ab a gppd place


    //console.log(" AFTER config fills in the c_util len = ", c_util.contexts.length)

    return itemsList
}

