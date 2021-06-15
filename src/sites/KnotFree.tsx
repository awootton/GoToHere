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


import React,{ FC, useState } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

//import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';

//import Card from '@material-ui/core/Card'
//import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
 
import * as paypal from "../components/PayPal"
import ReactMarkdown from 'react-markdown'

import ReactGA from 'react-ga';

import * as getfree from "../components/FreeToken"
import * as util from "../gotohere/knotservice/Util"

//ReactGA.initialize('UA-62339543-1');
ReactGA.initialize('UA-198012996-1', {
   // debug: true,
    titleCase: false,
    gaOptions: {
      //userId: '123',
      siteSpeedSampleRate: 100
    }
  } );

ReactGA.pageview(window.location.pathname + window.location.search + "knotfree");

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flex: 1,
            //  justifyContent: 'center',
            //  alignItems: 'center',
            width: theme.spacing(50),
            height: theme.spacing(75),

            top: "10%",// "12vw",
            left: "10%",
            position: "absolute"
        },

        divstyle: {

            padding: 20,
            //  background: "white",
            backgroundColor: 'rgba(250, 250, 250, 0.95)',
            width: "80vw",

            //textAlign: 'center' 
        }
    })
);

type Props = {

}

type State = {
    random: string
}

const emptyState: State = {
    random: util.randomString(16)
}

// const divstyle = {
//     margin: "120 120px",
//     padding: "120 120px",
//     background: "white",
//     width:120,
//     height:32,

//     display: 'flex', 
//     textAlign: 'center'
// }

const aStyle = {
    backgroundImage: `url(${"images/usa-1327120_960_720.jpg"})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    height: '100vh'
};

export const KnotFreeApp: FC<Props> = (props: Props) => {

    const [isBuyToken, setBuyToken] = React.useState(false);
    const [isGetFreeToken, setGetFreeToken] = React.useState(false);

    const classes = useStyles();

    const page = util.getServerPage()

    console.log(" in KnotFreeApp page is ", page)

    const handleDialogClose = () => {
        setBuyToken(false);
        setGetFreeToken(false);
    }
    const buyToken = () => {
        ReactGA.event({
            category: 'User',
            action: 'Clicked buyToken'
          });
        setBuyToken(true)
    }
    const getFreeToken = () => {
        ReactGA.event({
            category: 'User',
            action: 'Clicked getFreeToken'
          });
        setGetFreeToken(true)
    }

    type funtype = () => any
    const stringToFunction = (fname: any): funtype | undefined => {
        if (fname === "buyToken") {
            console.log("stringToFunction returning " + fname)
            return buyToken
        } else if (fname === "getFreeToken") {
            console.log("stringToFunction returning " + fname)
            return getFreeToken
        } 
        return undefined // () => { }
    }

    const stos = (s: any): string => { return "" + s }

    return (
        <div style={aStyle} >

            <Grid className={classes.root} container direction="column" component="div"   >
                
            <ReactMarkdown children={theText} 
                className={classes.divstyle} 
                linkTarget={"_blank"}
                components={{
                    // Rewrite links to be onClick
                    a: ({ node, ...props }) => { 
                        var thefunct  = stringToFunction(props.href)
                        var theHref = stos(props.href)
                        if ( thefunct === undefined ){
                            thefunct = ()=>{}
                        } else {
                            theHref = "#"
                        }
                        console.log(" ReactMarkdown components href ", theHref )

                        return(<a href={theHref} onClick={thefunct}  >{props.children}</a>) }
                }}
                />
            </Grid>

            <Dialog style={{width: 600, height:800, padding:24}}
                className={classes.root}
                open={isBuyToken}
                onClose={handleDialogClose}
            >
                <paypal.PalPalDialog title="Please buy a token here. Computers aren't free." />
            </Dialog>

            <Dialog
                className={classes.root}
                open={page === "getFreeToken"}
                onClose={handleDialogClose}
            >
                <getfree.FreeToken title="This page will dispense a free token." />
            </Dialog>

        </div>
    )
}

export default KnotFreeApp;

const theText =
`### KnotFree.net  

The knot free net consists of network services so it's all technical 
with not much to show here.

Instead of requiring registration with an email address, which is much too heavy
for most situations, it runs on 'tokens'. Think of arcade tokens only much cheaper.

A smart-tv does not have an email address. The aim is to fix this problem and 
to recognize that we may not want a smart-tv to go through the servers of a foreign company, 
or any middleman really. Having direct secure communication between smart appliances
and your phone is going to require a new internet. This one: the knot free net. 

The cheap, and weak, free tokens expire in months but more powerful 
and long lived tokens are available.

You can [buy tokens](buyToken) here and the small ones are being [given out for free](getFreeToken). 

The main user of this network is the decentralised social platform [GoToHere.com](http://GoToHere.com).

#### If you are in favor of this movement, and you wish it to grow, [follow it on Twitter](https://twitter.com/GotohereC?ref_src=twsrc%5Etfw"). 
This is the single most important thing to do.

[All the code is open source](https://github.com/awootton/knotfreeiot).

Those who know about mqtt (one of the services) and ports and addresses 
[should check out the technical documentation](https://github.com/awootton/GoToHere/wiki/KnotFree.net-ports-and-services.)
Later we'll have some examples for arduino and other uses.

atw - 6/14/21 - launch day!
`