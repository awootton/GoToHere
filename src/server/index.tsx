
import {start_express} from "./StartExpress";
import * as config from "./Config";
import * as configloader from "./ConfigLoader";
import {StartServerMqtt} from "./MqttClient";

console.log("init in index TSX  ")


var path = "data/server_config.json"
var port = 3020 
if (process.env.ATWDEBUG == 'Y') {
    path = "data/server_config_local.json"
    port = 3010 
}

start_express( port )

var path = "data/server_config.json"
if (process.env.ATWDEBUG == 'Y') {
    path = "data/server_config_local.json"
}

console.log("Using config located here:  ", path)

var the_server_config: config.ServerConfigList = configloader.readServerConfig(path)

StartServerMqtt(the_server_config)
