

import { start_express } from "./gotohere/knotservice/StartExpress";
import * as config from "./gotohere/knotservice/Config";
import * as configloader from "./gotohere/knotservice/ConfigLoader";
import { StartServerMqtt } from "./gotohere/knotservice/MqttClient";
import * as fsutil from "./gotohere/api1/FsUtil";

import * as api from "./gotohere/api1/Api";

import fs from "fs"

export { }

console.log("init in index TSX  ")

// const hhh = util.KnotNameHash('alice_vociferous_mcgrath')
// console.log( "std  hash of  alice_vociferous_mcgrath is ", hhh)

var path = "data/server_config.json"
var port = 3020
if (process.env.ATWDEBUG == 'Y') {
    path = "data/server_config_local.json"
    port = 3010
}

start_express(port)

type errorcb = (err: any) => any
type errordatacb = (err: any, data: Buffer) => any

class OurNodeFsAdapter extends fsutil.OurFsAdapter {

    writeFile(path: string, data: any, cb: errorcb) {
        fs.writeFile(path, data, cb)
    }

    readFile(path: string, cb: errordatacb) {
        fs.readFile(path, cb)
    }

    readdir(path: string, cb: (err: any, items: string[]) => any) {
        fs.readdir(path, cb)
    }

    // override me
    unlink(fname: string, cb: (err: any) => any) {
        fs.unlink(fname, cb)
    }
    // make dirs as necessary
    mkdirs(dirpath: string, cb: (err: any) => any) {
        var pathParts = dirpath.split("/")
        var tmpPath = ""
        pathParts.forEach((part, i, arr) => {
            tmpPath += part + "/"
            if (!fs.existsSync(tmpPath)) {
                fs.mkdirSync(tmpPath);
            }
        })
    }
}

const fsadapter = new OurNodeFsAdapter()
api.setAllFs(fsadapter)

console.log("Using config located here:  ", path)

configloader.readServerConfig(path, ( the_server_config:config.ServerConfigList ) => {
    StartServerMqtt(the_server_config)
})


