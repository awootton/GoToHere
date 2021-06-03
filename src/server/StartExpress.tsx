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

import express from 'express';


import { Request, Response } from 'express';


function replacer(key:any, value:any) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

// we only serve the static files now. 
export function start_express( port: number) {

  const app = express();
  //const port = 3010;
    
  // app.get('/api/postslist', (req: any, res: any) => {
  //   console.log("serving /api/postslist ");
  //   var oldest = req.query.oldest
  //   var newest = req.query.newest
  //   var folder = req.query.folder
  //   console.log("serving /api/postslist args are ", oldest, newest)
  //   fsGetPosts(res , oldest, newest, folder )
  // });

  // app.get('/api/hello', (req: any, res: any) => {
  //   console.log("serving /api/hello ");
  //   res.send({ express: 'Hello From Express' });
  // });

  // app.get('/api/hellotest', (req: any, res: any) => {
  //   console.log("serving /api/hellotest ");
  //   res.send({ express: 'Hello test From Express and atw' });
  // });

  // //app.use('/files', express.static('pagefiles'))

  // app.use('/fileslist', (req: any, res: any) => {
  //   var directoryPath = "pagefiles"
  //   fs.readdir(directoryPath, function (err, files) {
  //     //handling error
  //     if (err) {
  //       return console.log('Unable to scan directory: ' + err);
  //     }
  //     //listing all files using forEach
  //     files.forEach(function (file) {
  //       // Do whatever you want to do with the file
  //       console.log(file);
  //     });
  //   });
  //   res.send({ express: 'serving a dir list sorted by name' });
  // });

  app.get('/', express.static('build'))

  app.get('*', express.static('build'))
  
  // no chunked encoding. The go will be trying to parse the reply so NO chunked encoding
  app.set('static buffer size', Number.MAX_VALUE) // no chunked encoding

  //err: any
  app.listen(port, () => {
    // if (err) {
    //   return console.error(err);
    // }
    return console.log(`server tsx listening on ${port}`);
  });

}
