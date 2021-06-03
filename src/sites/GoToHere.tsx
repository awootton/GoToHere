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


import React, { FC, useState, useEffect } from "react";
import { Redirect } from 'react-router-dom';
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ReactMarkdown from 'react-markdown'
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';

import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Paper from '@material-ui/core/Paper'

import * as util from "../server/Util"


// FIXME add remark-gfm 
// remarkPlugins={[gfm]}
// import gfm from 'remark-gfm'


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flex: 1,
            //  justifyContent: 'center',
            //  alignItems: 'center',
            width: theme.spacing(50),
            height: theme.spacing(75),

            top: "12%",// "12vw",
            left: "12%",
            position: "absolute"
        },

        divstyle: {

            padding: 20,
            //  background: "white",
            backgroundColor: 'rgba(250, 250, 250, 0.85)',
            width: "75vw",

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

const aStyle = {
    backgroundImage: `url(${"images/jakob-owens-isCDC9Q1hbY-unsplash2.jpeg"})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    height: '100vh'
};
// style={styles.MainContainer}
// style={aStyle}
//<img src="images/jakob-owens-isCDC9Q1hbY-unsplash2.jpeg" alt="flags standing" />
//  linkTarget="_blank"

export const GoToHereApp: FC<Props> = (props: Props) => {

    const classes = useStyles();

    const page = util.getServerPage()

    console.log(" in GoToHereApp page is ", page)

    const handleDialogClose = (value: any) => {
        if ( page === "") {
            return
        }
        var loc = window.location.href
        const i = loc.indexOf(page) // eg getFreeToken
        if ( i >= 0 ){
            loc = loc.slice(0,i)
        }
        window.location.replace(loc)
    };

    // this does NOT do what I thought. shit.
    const linkTargetFilter = (href:string, children:any, title : any) : string  => {
        if (href === "getFreeToken"){
            return href
        }
        return "_blank"
    }
    // <a class="twitter-timeline"
    //  class="twitter-follow-button"
    return (
        <div style={aStyle} >
            <Grid className={classes.root} container direction="column" component="div"   >

            {/* <div><a href="https://twitter.com/GotohereC?ref_src=twsrc%5Etfw" data-show-count="false">Follow @GotohereC</a><script async src="https://platform.twitter.com/widgets.js"  ></script>
                </div> */}


                <ReactMarkdown children={theText} 
                className={classes.divstyle} 
                linkTarget={linkTargetFilter}
                />

                {/* <Paper className={classes.divstyle} >
                    <a href="https://twitter.com/GotohereC?ref_src=twsrc%5Etfw">Tweets by GotohereC</a> <script async src="https://platform.twitter.com/widgets.js" ></script>
                </Paper> */}
                {/* <div><a href="https://twitter.com/GotohereC?ref_src=twsrc%5Etfw" data-show-count="false">Follow @GotohereC</a><script async src="https://platform.twitter.com/widgets.js"  ></script>
                </div> */}

            </Grid>

            <Dialog
                className={classes.root}
                open={page === "getFreeToken"}
                onClose={handleDialogClose}
            >
                <div>get free token  here</div>
            </Dialog>
        </div>
    )
}

export default GoToHereApp;


const theText =
    `### GoToHere.com  

GoToHere is a movement to produce a decentralized social platform. Capabilities:

*  You cannot be banned. There's no 'jail' possible.
*  You own all your own data. Everything is kept safe on your device.
*  There is no tracking. No user tracking. No 'cookies'. Privacy.
*  Posts cannot be censored. Only you can change them. 
*  There are no ads. You and your friends can post advertisements if you wish.
*  There can be no 'spying' or 'tapping'. Messages are secure.
 
The trick is that posts travel, encrypted, directly from you to your friends and followers.
The posts don't take a detour to visit the mothership (like with the middlemen twitter and facebook etc)
so the posts cannot be examined or blocked or modified.

To pull off this trick actually required writing a new form of the internet with advanced capabilities. 
That new internet, the knot free net, is at [KnotFree.net](http://KnotFree.net). 
Instead of requiring email registration to use that network it uses 'tokens'. 
Think of arcade tokens. You can buy them from [KnotFree.net](http://KnotFree.net), or [here](buyTokens). 
Small tokens are being [given out](getFreeToken) for free.

#### If you are in favor of this movement, and you would wish it to grow, [follow it on Twitter](https://twitter.com/GotohereC?ref_src=twsrc%5Etfw"). 
This is the single most important thing to do.

The smart-phone apps are not ready but brave souls can now [create profiles](https://github.com/awootton/GoToHere/wiki/Create-a-GoToHere-profile.) on GoToHere.  

please [donate](buyDonation)

See essays at medium

Ask questions on the forum.

[Technicle documentation is here](https://github.com/awootton/GoToHere/wiki) at this wiki.

[Source code](https://github.com/awootton/GoToHere) is available.

needs:

* reserve a name how to
* donate please paypal
* how to make a new profile.
* finish getFreeToken.

atw - 6/2/21
`

//    😃 