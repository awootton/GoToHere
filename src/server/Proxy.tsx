
import { MqttTestServerTricks } from './MqttClient'

import net from 'net'
//import { CallReceived } from '@material-ui/icons'

export { }

// var StrangerPublicKey:string = "jcQ9YJGsLEPheD-Pni5dUxf0c6WadsuuCuNjIoGyodI"
// var StrangerPrivateKey:string = "cc0Obtu-3pBttENYZ2TqIMmbHH0Iv10U8SA8HXzEi0CNxD1gkawsQ-F4P4-eLl1TF_RzpZp2y64K42MigbKh0g"

export class PacketCallParams {
    message: Uint8Array
    topic: string
    packet: any
    constructor(mm: Uint8Array, t: string, p: any) {
        this.message = mm
        this.topic = t
        this.packet = p
    }
}

export class ProxyPortInstance {

    topic: string = "";
    replyAddress: string;
    port: number = 0;
    socket: net.Socket;
    owner: MqttTestServerTricks

    packetSentCount = 0;
    packetSentSize = 0;
    theLengthWeNeed = 0;

    firstline = "";

    params: PacketCallParams;

    constructor(caller: MqttTestServerTricks, topic: string, returnTopic: string, portStr: string, params: PacketCallParams) {

        this.topic = topic;
        this.replyAddress = returnTopic;
        this.owner = caller;
        this.port = +portStr

        this.params = params

        this.socket = new net.Socket();
        this.socket.setTimeout(30 * 1000, () => {
            console.log("socket timed out socket timed out socket timed out socket timed out socket timed out ")
            this.finishSocket()
        })

        this.socket.connect(this.port, '127.0.0.1', this.client_on_connect)
        this.socket.on('data', this.client_on_data)
        this.socket.on('close', this.client_on_close)
    }

    go(){

    }

    finishSocket = () => {
        if (this.socket !== undefined) {
            this.socket.destroy()
        }
    }


    client_on_close = () => {
        console.log('Socket Connection closed', this.firstline);
        // this.socket == undefined
    }

    client_on_connect = () => {

        var partial = Buffer.from(this.params.message).indexOf("\n")
        if (partial <= 0) {
            partial = 32
        }
        if (partial > this.params.message.length) {
            partial = this.params.message.length
        }
        var partialMessage = Buffer.from(this.params.message).toString("utf8").substr(0, partial)
        console.log('Connected, sending initial request from packet', partialMessage);
        
        // push the packet get request up to the port
        this.socket.write(this.params.message);
    }

    // socket data coming in hot
    // publish it to the reply address
    client_on_data = (socketdata: Uint8Array) => {

        // chop it up into 63 k or bigger chunks
        var datatmp = Buffer.from(socketdata)
        var dataparts: Buffer[] = []
        while (true) {
            var pos = 64 * 1024 * 999999999
            if (pos >= datatmp.length) {
                pos = datatmp.length
            }
            dataparts.push(datatmp.slice(0, pos))
            datatmp = datatmp.slice(pos)
            if (datatmp.length == 0) {
                break
            }
        }
        dataparts.forEach(data => {
            // console.log('atw data Received: ' + data);  HTTP/1.1 200 OK 
            // this.caller.

            if (this.packetSentCount == 0) {
                // the first one. Should be a reply.
                var linePos = data.indexOf(Buffer.from("\n"))
                this.firstline = data.slice(0, linePos).toString('utf8')
                console.log('Socket data Received: ' + this.firstline);

                // we shuld parse the header and figure out how many bytes expected.
                {
                    const headerEndBytes = Buffer.from("\r\n\r\n")
                    const headerPos = data.indexOf(headerEndBytes)
                    if (headerPos <= 0) {
                        console.log("no header was found in first packet")
                    } else {
                        // parse the header
                        const header = data.slice(0, headerPos)
                        const clStr = Buffer.from("Content-Length:")
                        const clPos = header.indexOf(clStr)
                        if (clPos <= 0) {
                            console.log("no Content-Length was found in first packet")
                        }
                        const hpart = header.slice(clPos + clStr.length)
                        const lineEndBytes = Buffer.from("\r\n")
                        const endPos = hpart.indexOf(lineEndBytes)
                        const cldigits = hpart.slice(0, endPos).toString('utf8')
                        var i: number = +cldigits.trim()
                        console.log("the Content length is ", i)
                        this.theLengthWeNeed = i + header.length + 4
                    }
                }
            }

            var message = data

            //console.log('atw data Received amt: ', this.packetSentSize , " indx#", this.packetSentCount );//  HTTP/1.1 200 OK 

            //let utf8Encode = new TextEncoder();
            var options = {
                retain: true,
                qos: 1,
                properties: {
                    userProperties: {
                        "indx": "" + this.packetSentCount
                    },
                    responseTopic: this.params.topic,
                }
            };
            // no crypto for proxy 
            this.owner.client.publish(this.replyAddress, message, options)
            this.packetSentCount += 1
            this.packetSentSize += message.length
            if (this.packetSentSize >= this.theLengthWeNeed) {
                // we're done here. 
                console.log("Publishing reply finished", this.firstline)
                this.finishSocket()
            }
        });
    }


    // handlePacket() { // params: PacketCallParams) {
    //     console.log("handlePacket have knotfree packet, send to port ", this.port)

        // // socket data coming in hot
        // // publish it to the reply address
        // const client_on_data = (socketdata: Uint8Array) => {

        //     // chop it up into 63 k or bigger chunks
        //     var datatmp = Buffer.from(socketdata)
        //     var dataparts: Buffer[] = []
        //     while (true) {
        //         var pos = 64 * 1024 * 999999999
        //         if (pos >= datatmp.length) {
        //             pos = datatmp.length
        //         }
        //         dataparts.push(datatmp.slice(0, pos))
        //         datatmp = datatmp.slice(pos)
        //         if (datatmp.length == 0) {
        //             break
        //         }
        //     }
        //     dataparts.forEach(data => {
        //         // console.log('atw data Received: ' + data);  HTTP/1.1 200 OK 
        //         // this.caller.

        //         if ( this.packetSentCount == 0 ){
        //             // the first one. Should be a reply.
        //             var linePos = data.indexOf(Buffer.from("\n"))
        //             this.firstline = data.slice(0,linePos)
        //             console.log('Socket data Received: ' + this.firstline);

        //             // we shuld parse the header and figure out how many bytes expected.
        //             {
        //                 const headerEndBytes = Buffer.from("\r\n\r\n")
        //                 const headerPos = data.indexOf(headerEndBytes)
        //                 if (headerPos <= 0) {
        //                     console.log("no header was found in first packet")
        //                 } else {
        //                     // parse the header
        //                     const header = data.slice(0,headerPos)
        //                     const clStr  = Buffer.from("Content-Length:")
        //                     const clPos = header.indexOf(clStr)
        //                     if (clPos  <= 0) {
        //                         console.log("no Content-Length was found in first packet")
        //                     }
        //                     const hpart = header.slice(clPos+ clStr.length)
        //                     const lineEndBytes = Buffer.from("\r\n")
        //                     const endPos = hpart.indexOf(lineEndBytes)
        //                     const cldigits = hpart.slice(0,endPos).toString('utf8')
        //                     var i : number = +cldigits.trim()
        //                     console.log("the Content length is ", i)
        //                     this.theLengthWeNeed = i + header.length + 4
        //                 }
        //             }
        //         }

        //         var message = data

        //         //console.log('atw data Received amt: ', this.packetSentSize , " indx#", this.packetSentCount );//  HTTP/1.1 200 OK 

        //         //let utf8Encode = new TextEncoder();
        //         var options = {
        //             retain: true,
        //             qos: 1,
        //             properties: {
        //                 userProperties: {
        //                     "indx": "" + this.packetSentCount
        //                 },
        //                 responseTopic: params.topic,
        //             }
        //         };
        //         // no crypto for proxy 
        //         this.owner.client.publish(this.replyAddress, message, options)
        //         this.packetSentCount += 1
        //         this.packetSentSize += message.length
        //         if ( this.packetSentSize >= this.theLengthWeNeed){
        //             // we're done here. 
        //             console.log("Publishing reply finished",this.firstline)
        //             this.finishSocket()
        //         }
        //     });
        // }

       // if (this.socket) {
        //    console.log("have packet, after open -- need to parse FIXME: deal with this packet ")
        //} else {
            // dude. open the socket

            // const client_on_connect = () => {

            //     var partial = Buffer.from(params.message).indexOf("\n")
            //     if (partial <= 0) {
            //         partial = 32
            //     }
            //     if (partial > params.message.length) {
            //         partial = params.message.length
            //     }
            //     var partialMessage = Buffer.from(params.message).toString("utf8").substr(0, partial)
            //     console.log('Connected, sending initial request from packet', partialMessage);
            //     this.socket.write(params.message);
            // }

            // var client = new net.Socket();
            // client.setTimeout(30 * 1000, () => {
            //     console.log("socket timed out socket timed out socket timed out socket timed out socket timed out ")
            //     finishSocket()
            //     // if (this.socket !== undefined) {
            //     //     this.socket.close()
            //     // }
            // })
            // this.socket = client
            // client.connect(this.port, '127.0.0.1', client_on_connect)
            // client.on('data', client_on_data)
            // client.on('close', this.client_on_close)
        //}
    //}

    // constructor(caller: MqttTestServerTricks, topic: string, returnTopic: string, portStr: string, params: PacketCallParams) {

    //     this.topic = topic;
    //     this.replyAddress = returnTopic;
    //     this.owner = caller;
    //     this.port = +portStr

    //     this.params = params

    //     this.socket = new net.Socket();
    //     this.socket.setTimeout(30 * 1000, () => {
    //         console.log("socket timed out socket timed out socket timed out socket timed out socket timed out ")
    //         this.finishSocket()
    //     })

    //     this.socket.connect(this.port, '127.0.0.1', this.client_on_connect)
    //     this.socket.on('data', this.client_on_data)
    //     this.socket.on('close', this.client_on_close)

    // }


}