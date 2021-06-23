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


import React, { FC, ReactElement } from "react";
import { PayPalButton } from "react-paypal-button-v2";
import ReactGA from 'react-ga';

import * as util from "../gotohere/knotservice/Util"
import Paper from '@material-ui/core/Paper';

import { CopyToClipboard } from 'react-copy-to-clipboard';
 
import * as apputil from "../AppUtil"



type Props = {
    title: string
}

export const PalPalDialog: FC<Props> = (props: Props): ReactElement => {

    const serverName = util.getServerName() // eg. gotolocal.com:3000
    var host = "http://" + serverName
    host = host.replace("3000", "8085") // for local dev

    const [theToken, setTheToken] = React.useState("");

    console.log("PalPalDialog serverName", serverName)

    ReactGA.event({
        category: 'User',
        action: 'In PayPal with ' + serverName
    });

    const onClipClick = () => {
        console.log("in onClipClick")
        // if (!navigator.clipboard) {
        //     document.execCommand("paste")
        //     return
        // }
        // navigator.clipboard.writeText(theToken)
    }

    const onClickDownload = () => {
        console.log("in onClickDownload")
        // if (!navigator.clipboard) {
        //     document.execCommand("paste")
        //     return
        // }
        // navigator.clipboard.writeText(theToken)
    }

    const getDownloadLink = () => {
        var thehref =  window.URL.createObjectURL(
            new Blob([theToken], { type: "application/octet-stream" })
          );
        return (
            <a href={thehref} download = "KnotFree32xlargeToken.txt">Download as file.</a>
        )
    }

    const showToken = () => {
        if (theToken != "") {
            return (<>
                <h2>Here is your token! You should save it in a safe place. Click on 'Download'.</h2>
                <Paper>{theToken}</Paper>
                <div style = {{padding : 12}}>
                <CopyToClipboard text={theToken}
                    onCopy={() => console.log("theToken copied to clipboard")}>
                    <button>Copy to clipboard.</button>
                </CopyToClipboard>
                </div>
                <div style = {{padding : 24}}>
                {getDownloadLink()}
                </div>
            </>
            )
        } else {
            return (<></>)
        }
    }

    return (

        <div style={{ width: 500, height: 700, padding: 24 }} >
            <div style={{ width: 400, height: 400, padding: 12 }} >
                <h3>{props.title}</h3>
                For $5 you will receive a monster, 5xlarge, token which is enough for a small village and expires in 12 months..
                <PayPalButton
                    amount="5.00"
                    shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
                    style={{ height: 30, width: 256 }}
                    onSuccess={(details: any, data: any) => {
                        console.log("Transaction completed by " + details.payer.name.given_name, " data is ", data);

                        // OPTIONAL: Call your server to save the transaction
                        var fpromise = fetch(host + "/api1/paypal-transaction-complete", {
                            method: "post",
                            body: JSON.stringify({
                                orderID: data.orderID,
                                payerID: data.payerID,
                                raw: data
                            })
                        });
                        fpromise.then((resp: Response) => {
                            console.log("have get buy token response ", resp)
                            if (resp.ok) {
                                resp.text().then((repl: string) => {
                                    // data is TokenReply  ?? 
                                    console.log("have get buy token fetch result ", repl)
                                    setTheToken(repl)
                                    apputil.localStorage_setItem('knotfree_access_token_v2', repl);
                                })
                            }
                        })
                    }}
                    options={{
                        // sandbox 
                        clientId: "AV0OVlxl84D_i5XxkhbJWYLEJKj1S03A-shkckJjLC9RBTXyHvUhGG0KCnPcSqtVOp_c7u5_5U3Qzkmi", // sandbox
                        //clientId: "ARoX8jMu0bzy6YCspsr9PUsO5pHYgKZCpR_uDKNxCrwkOK6aTm1GTZ03IlHW_n8AW6pId7EsNyvykiDS", // production
                        //amt:1,
                        //type:"4xl"
                    }}
                />
                {showToken()}
            </div>
        </div>
    )
}


