
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
