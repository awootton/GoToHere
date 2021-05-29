
import {start_express} from "./StartExpress";
import * as config from "./Config";
import * as configloader from "./ConfigLoader";
import {StartServerMqtt} from "./MqttClient";

import * as util from "./Util";

console.log("init in index TSX  ")

const hhh = util.KnotNameHash('alice_vociferous_mcgrath')
console.log( "std  hash of  alice_vociferous_mcgrath is ", hhh)

var path = "data/server_config.json"
var port = 3020 
if (process.env.ATWDEBUG == 'Y') {
    path = "data/server_config_local.json"
    port = 3010 
}

start_express( port )

// var path = "data/server_config.json"
// if (process.env.ATWDEBUG == 'Y') {
//     path = "data/server_config_local.json"
// }

console.log("Using config located here:  ", path)

var the_server_config: config.ServerConfigList = configloader.readServerConfig(path)

StartServerMqtt(the_server_config)
