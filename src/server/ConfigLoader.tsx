
import fs from 'fs'
import * as nacl from 'tweetnacl-ts'
 
// crypto-js/sha256 is banned for life for not using uint8array import sha256 from 'crypto-js/sha256';

import * as config from "./Config"
import * as util from "./Util"
//import * as c_util from "../components/CryptoUtil"

export function readServerConfig(specialpath?: string): config.ServerConfigList {

  var path = "data/server_config.json"
  if (specialpath) {
    path = specialpath
  }

  console.log("reading config frm ", path)

  var bytes = fs.readFileSync(path)

  var itemsList: config.ServerConfigList = JSON.parse(bytes.toString("utf8"))

  // check the token? 

  // check the paths

  // check the private keys how? 

  for (let item of itemsList.items) {
    const userName = item.name
    const phrase = item.passphrase
    const keypair: nacl.BoxKeyPair = util.getBoxKeyPairFromPassphrase(userName, phrase)
    //item.publicLey = Buffer.from(keypair.publicKey)
    //item.privateKey = Buffer.from(keypair.secretKey)
  };

  for (let item of itemsList.items) {
    if (!item.directory.endsWith("/")) {
      item.directory = item.directory + "/"
      if (!fs.existsSync("data/" + item.directory)) {
        fs.mkdirSync("data/" + item.directory)
      }
    }
  }

  util.cleanContexts()

  console.log(" BEFORE config fills in the c_util len = ", util.contexts.length)
  for (let item of itemsList.items) { // init the c_util
    var con: util.Context = {
      ...util.emptyContext,
      username: item.name,
      password: item.passphrase,
      profileNameFromApp: item.name,
      tokenFromApp: itemsList.token,
      config: item
    }
    util.initContext(con)
    util.contexts.push(con)
  }
  util.setCurrentIndex(0)  
  // we probably need some maps and hefre would ab a gppd place


  console.log(" AFTER config fills in the c_util len = ", util.contexts.length)

  return itemsList
}

const sampleItemsList: config.ServerConfigList =
{
  token: "[My_token_expires:_2021-12-31,{exp:1641023999,iss:_9sh,jti:amXYKIuS4uykvPem9Fml371o,in:32,out:32,su:4,co:2,url:knotfree.net},eyJhbGciOiJFZDI1NTE5IiwidHlwIjoiSldUIn0.eyJleHAiOjE2NDEwMjM5OTksImlzcyI6Il85c2giLCJqdGkiOiJhbVhZS0l1UzR1eWt2UGVtOUZtbDM3MW8iLCJpbiI6MzIsIm91dCI6MzIsInN1Ijo0LCJjbyI6MiwidXJsIjoia25vdGZyZWUubmV0In0.7ElPyX1Vju8Q5uDOEfgAblwvE2gxT78Jl68JPlqLRcFeMJ7if39Ppl2_Jr_JTky371bIXAn6S-pghtWSqTBwAQ]",
  items: [
    {
      name: "alice_vociferous_mcgrath",
      nameReservationToken: "fixme",
      port: "3000",
      directory: "alice",
      passphrase: "join_red_this_string_plain_does_quart_simple_buy_line_fun_look_original_deal",
    },
    {
      name: "building_bob_bottomline_boldness",
      nameReservationToken: "fixme",
      port: "3000",
      directory: "bob",
      passphrase: "tail_wait_king_particular_track_third_arrive_agree_plural_charge_rise_grew_continent_fact"
    },
    {
      name: "charles_everly_erudite",
      nameReservationToken: "fixme",
      port: "3000",
      directory: "charles",
      passphrase: "sense_trouble_lost_final_crowd_child_fear_buy_card_apple_such_it_as_note"
    },
  ]
}


export function saveSample() {
  var str = JSON.stringify( sampleItemsList, null, 2) // indented json pretty
  console.log(str)
  fs.writeFileSync("sample_server_config.json", str)
}

//saveSample()

readServerConfig()

