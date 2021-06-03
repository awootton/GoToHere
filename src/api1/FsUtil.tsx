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
import fs from 'fs'


type haveOneType = ( data: Buffer) => any

export type fsGetContext = {
    countNeeded: number,
    newer : string,
    basePath : string,
    haveOne: haveOneType,
    done:boolean
}

export function fsGetPostsCounted( c: fsGetContext )  {

    var newFolderDayName = c.newer.substr(0, 6) // year month day
    const theDir = c.basePath // "./data/lists/" + folder + "/"

    //console.log("fsGetPostsCounted dir is ", theDir)

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
        readFilesInDirList(c, daysNeededList )
         
    }); 
}

function readFilesInDirList( c: fsGetContext, daysList: string[] )  {

    // the days list is actually a list of folder names
    // it's too long
    if ( daysList.length === 0 || c.done ){
        return
    }
    var adirName = c.basePath + daysList[0].substring(0,6)  
    daysList = daysList.slice(1)

    fs.readdir(adirName, (err, itemsList) => {
        if ( err ) {
            console.log("readFilesInDirList readdir error ", err,adirName)
            return
        }
        
        // these are the posts
        // we only want the ones < c.newer
        var newList : string[] = []
       
        itemsList.sort()
        for ( var i = 0; i < itemsList.length; i ++ ){
            const item = itemsList[i]
            if ( item < c.newer ){
                newList.push(item)
            } else {
                break
            }
        }
        newList.reverse()

        // now we have some file names
        readFilesInFileList( c, newList, daysList  )
    })
}

function readFilesInFileList( c : fsGetContext, 
                    fileNameList : string[], 
                    daysList: string[] ) {

        if ( fileNameList.length === 0  ) {
            if ( ! c.done ){
                readFilesInDirList( c, daysList   ) 
            }
            return
        }

    var aFileMame = c.basePath + fileNameList[0].substring(0,6) + "/" + fileNameList[0]
    fileNameList = fileNameList.slice(1)

    //console.log("readFilesInFileList about to read file "  , aFileMame )

    fs.readFile( aFileMame, (err, data) => {
        if (err) {
            //var uint8array = new TextEncoder().encode("[]");
            // FIXME: onCompletion(wr, uint8array, err)
            console.log("readFilesInFileList read file error " + aFileMame , err)
            return
        }
        var currentCount = c.haveOne(data)
        if (currentCount < c.countNeeded) {
            // read the next file
            readFilesInFileList( c, fileNameList,daysList )
        } else {
            c.done = true // do we really need this? 
        }
        
    })

}

