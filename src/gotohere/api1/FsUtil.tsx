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
//import fs from 'fs'
//import * as timeapi from "./GetTimeline"
//import * as s from "../mqtt/SocialTypes"

type errorcb = (err:any) => any
type errordatacb = (err:any,data:Buffer) => any

// use this instead of fs because fs doesn't work in react-native
export class OurFsAdapter  {

    isTesting : boolean

    constructor() {
        this.isTesting = false
    }

    writeFile(path : string , data: any, cb: errorcb ) {
        cb("unimplemented-override-me")
    }

    readFile(path : string , cb: errordatacb ) {
        cb("unimplemented-override-me",Buffer.from(""))
    }  

    readdir(path : string , cb: (err:any, items: string[])=>any ) {
        cb("unimplemented-override-me",[])
    }  

    dummyCb = (err:any) => {
        if (err) {
            console.log("ERROR dummy ", err);
        } else {
            //console.log("dummy ok");
        }
    }

    // override me
    unlink( fname: string, cb: (err:any)=> any) {
        cb("unimplemented-override-me")
    }
    // make dirs as necessary
    mkdirs( path: string , cb: (err:any)=> any) {
        cb("unimplemented-override-me")
    }
}

export default OurFsAdapter

var fs : OurFsAdapter
export function SetFs( anFs : OurFsAdapter ){
    fs = anFs
}



type haveOneType = (data: Buffer, err: any) => any

export type fsGetContext = {
    countNeeded: number,
    newer: string,
    basePath: string,
    haveOne: haveOneType,
    done: boolean
}

export type fsGetTimeContext = {
    countNeeded: number,
    newer: number,
    basePath: string,
    haveOne: haveOneType,
    done: boolean
    force: boolean
}


export function fsGetPostsCounted(c: fsGetContext) {

    var newFolderDayName = c.newer.substr(0, 6) // year month day
    const theDir = c.basePath

    console.log("fsGetPostsCounted dir is ", theDir)

    // we should cache this
    fs.readdir(theDir, function (err, items) {
        if (err) {
            console.log('Unable to scan directory: ' + err + theDir);
            //var uint8array = new TextEncoder().encode("[]");
            // FIXME: return error  onCompletion(wr, uint8array, err)
            return
        }
        var daysNeededList: string[] = []
        items.forEach(function (aname) {
            if (aname <= newFolderDayName) {
                daysNeededList.push(aname)
                //console.log("collecting fname ", aname);
            }
        });

        daysNeededList.sort();
        daysNeededList.reverse(); // newest first means largest first 
        readFilesInDirList(c, daysNeededList)

    });
}


function readFilesInDirList(c: fsGetContext, daysList: string[]) {

    // the days list is actually a list of folder names
    // it's too long
    if (daysList.length === 0 || c.done) {
        return
    }
    var adirName = c.basePath + daysList[0].substring(0, 6)
    daysList = daysList.slice(1)

    fs.readdir(adirName, (err, itemsList) => {
        if (err) {
            console.log("readFilesInDirList readdir error ", err, adirName)
            return
        }

        // these are the posts
        // we only want the ones < c.newer
        var newList: string[] = []

        itemsList.sort()
        for (var i = 0; i < itemsList.length; i++) {
            const item = itemsList[i]
            if (item < c.newer) {
                newList.push(item)
            } else {
                break
            }
        }
        newList.reverse()

        // now we have some file names
        readFilesInFileList(c, newList, daysList)
    })
}

function readFilesInFileList(c: fsGetContext,
    fileNameList: string[],
    daysList: string[]) {

    if (fileNameList.length === 0) {
        if (!c.done) {
            readFilesInDirList(c, daysList)
        }
        return
    }

    var aFileMame = c.basePath + fileNameList[0].substring(0, 6) + "/" + fileNameList[0]
    fileNameList = fileNameList.slice(1)

    //console.log("readFilesInFileList about to read file "  , aFileMame )

    fs.readFile(aFileMame, (err, data) => {
        if (err) {
            //var uint8array = new TextEncoder().encode("[]");
            // FIXME: onCompletion(wr, uint8array, err)
            console.log("readFilesInFileList read file error " + aFileMame, err)
            return
        }
        var currentCount = c.haveOne(data, null)
        if (currentCount < c.countNeeded) {
            // read the next file
            readFilesInFileList(c, fileNameList, daysList)
        } else {
            c.done = true // do we really need this? 
        }

    })

}


function readTimelineDay(c: fsGetTimeContext, daysList: string[]) {

    if ( daysList.length === 0){
        c.force = true
        c.haveOne( Buffer.from(""),null)
        return
    }
    const thePath = c.basePath + daysList[0]
    //console.log("readTimelineDay reading ", thePath)
    fs.readFile(thePath, (err, data) => {

        if (err) {
            c.haveOne( data , err)
            return
        }
        //console.log("readTimelineDay found ")
        c.haveOne(data, err)
        if (c.done) {
            return
        }
        // get the next one
        readTimelineDay(c, daysList.slice(1))
    })

}

export function fsGetTimelineCounted(c: fsGetTimeContext) {

    var newFolderDayName = (""+c.newer).substr(0, 6) // year month day
    const theDir = c.basePath

    //console.log("fsGetTimelineCounted dir is ", theDir)

    // we should cache this
    fs.readdir(theDir, function (err, items) {
        if (err) {
            console.log('Unable to scan directory: ' + err + theDir);
            //var uint8array = new TextEncoder().encode("[]");
            // FIXME: return error  onCompletion(wr, uint8array, err)
            return
        }
        items.sort();
        items.reverse(); // newest first means largest first 
        //console.log("fsGetTimelineCounted have days ", items)
        //const day: string = c.newer.slice(0, 6)
        var i = 0
        for (i = 0; i < items.length; i++) {
            if (items[i] <= newFolderDayName) {
                break
            }
        }
        var daysList = items.slice(i)
        readTimelineDay(c, daysList)

    });
}