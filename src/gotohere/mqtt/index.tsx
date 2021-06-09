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

import {start_express} from "./StartExpress";
import * as config from "./Config";
import * as configloader from "./ConfigLoader";
import {StartServerMqtt} from "./MqttClient";

//import * as util from "./Util";

console.log("init in index TSX  ")

// const hhh = util.KnotNameHash('alice_vociferous_mcgrath')
// console.log( "std  hash of  alice_vociferous_mcgrath is ", hhh)

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
