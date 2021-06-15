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


import React, { FC, ReactElement, useEffect } from "react";
import { PayPalButton } from "react-paypal-button-v2";
import ReactGA from 'react-ga';

import * as util from "../gotohere/knotservice/Util"
import Paper from '@material-ui/core/Paper';

import { CopyToClipboard } from 'react-copy-to-clipboard';


import * as apiutil from "../AppUtil";



type Props = {
    title: string
}

export const FreeToken: FC<Props> = (props: Props): ReactElement => {

    const serverName = util.getServerName() // eg. gotolocal.com:3000
    var host = "http://" + serverName
    host = host.replace("3000", "8085") // for local dev

    const [theToken, setTheToken] = React.useState("");
    const [pending, setPending] = React.useState(false);

    console.log("PalPalDialog serverName", serverName)

    useEffect(() => {
        if (!pending && theToken === "") {
            setPending(true)
            const serverName = util.getServerName()
            apiutil.getFreeToken(serverName, (ok: boolean, tok: string) => {
                if ( ok ) {
                    setTheToken(tok)
                    setPending(false)
                }
            })
        }
    }, [pending, theToken])

    ReactGA.event({
        category: 'User',
        action: 'In FreeToken with ' + serverName
    });

    const getDownloadLink = () => {
        var thehref = window.URL.createObjectURL(
            new Blob([theToken], { type: "application/octet-stream" })
        );
        return (
            <a href={thehref} download="KnotFree32xlargeToken.txt">Download as file.</a>
        )
    }

    const showToken = () => {
        if (theToken != "") {
            return (<>
                <h2>Here is your token! You should save it in a safe place. Click on 'Download'.</h2>
                <Paper>{theToken}</Paper>
                <div style={{ padding: 12 }}>
                    <CopyToClipboard text={theToken}
                        onCopy={() => console.log("theToken copied to clipboard")}>
                        <button>Copy to clipboard.</button>
                    </CopyToClipboard>
                </div>
                <div style={{ padding: 24 }}>
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
                For free! you will receive a tiny, x-small, token which is good for 2 connection. It expires in 30 days.
                It's worth $0.00168 or 2 cents per year.
                {showToken()}
            </div>
        </div>
    )

}


