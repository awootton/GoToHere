

 
import * as nacl from 'tweetnacl-ts'

// crypto-js/sha256 is banned for life for not using uin8array import sha256 from 'crypto-js/sha256';

import * as config from "./Config"
// import * as util from "./Util"
// import * as c_util from "../components/CryptoUtil"


// to run this:
// node --loader ts-node/esm.mjs  --es-module-specifier-resolution=node --trace-warnings src/server/config

export var StrangerPublicKey: string = "jcQ9YJGsLEPheD-Pni5dUxf0c6WadsuuCuNjIoGyodI"
export var StrangerPrivateKey: string = "cc0Obtu-3pBttENYZ2TqIMmbHH0Iv10U8SA8HXzEi0CNxD1gkawsQ-F4P4-eLl1TF_RzpZp2y64K42MigbKh0g"

export type ServerConfigItem = {
  name: string,
  nameReservationToken: string,
  port: string, // for forwarding http
  directory: string, // where the data lives

  passphrase: string,

  publicLey?: Buffer,
  privateKey?: Buffer
}

export const EmptyServerConfigItem : ServerConfigItem = {
  name: "",
  nameReservationToken: "",
  port: "", // for forwarding http
  directory: "", // where the data lives
  passphrase: "",
}


export type ServerConfigList = {
  token: string // for accessing knotfree,
  items: ServerConfigItem[]
}

export var empty_server_config: config.ServerConfigList = {
  token: "dummy",
  items: []
}




// export function readServerConfig(specialpath?: string): ServerConfigList {

//   var path = "data/server_config.json"
//   if (specialpath) {
//     path = specialpath
//   }
//   var bytes = fs.readFileSync(path)

//   var itemsList: ServerConfigList = JSON.parse(bytes.toString("utf8"))

//   // check the token? 

//   // check the paths

//   // check the private keys how? 

//   for (let item of itemsList.items) {
//     const userName = item.name
//     const phrase = item.passphrase
//     const keypair: nacl.BoxKeyPair = util.getBoxKeyPairFromPassphrase(userName, phrase)
//     item.publicLey = Buffer.from(keypair.publicKey)
//     item.privateKey = Buffer.from(keypair.secretKey)
//   };

//   for (let item of itemsList.items) {
//     if (!item.directory.endsWith("/")) {
//       item.directory = item.directory + "/"
//       if (!fs.existsSync("data/" + item.directory)) {
//         fs.mkdirSync("data/" + item.directory)
//       }
//     }
//   }

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
//   // we probably need some maps and hefre would ab a gppd place


//   console.log(" AFTER config fills in the c_util len = ", c_util.contexts.length)

//   return itemsList
// }

// //saveSample()

// readServerConfig()



// we don't use the http API anymore. It's all knotfree
// export var API = "something"
// if (process.env.NODE_ENV == 'development') {
//   API = 'http://localhost:3000'; // has a proxy to move requests to 3010
//   console.log("process.env.NODE_ENV sets dev API as ", API)
// } else {
//     API = 'http://localhost:3010';
//     console.log("process.env.NODE_ENV sets release API as ", API)
// }
