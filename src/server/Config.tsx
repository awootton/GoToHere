
import * as config from "./Config"

// TODO: merge this with the loader. Can's because th eloader includes fs and th eclient hates that.

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

 // publicLey?: Buffer, these are in Context
 // privateKey?: Buffer
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

export var EmptyServerConfigList: config.ServerConfigList = {
  token: "dummy",
  items: []
}

export var itemsList: config.ServerConfigList = config.EmptyServerConfigList

export function  GetName2Config( name: string ) : config.ServerConfigItem {
  for (let item of itemsList.items) {
     if ( item.name === name ){
        return item
     }
  }
  return config.EmptyServerConfigItem
}
