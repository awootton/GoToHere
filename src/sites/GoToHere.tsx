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

import '../App.css';
import '../index.css';

import React, { FC } from "react";
//import { Redirect } from 'react-router-dom';
import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core/styles";
import ReactMarkdown from 'react-markdown'
import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
//import CardActions from '@material-ui/core/CardActions'
//import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
//import Box from '@material-ui/core/Box'
import Paper from '@material-ui/core/Paper'

import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import * as util from "../gotohere/knotservice/Util"

import * as paypal from "../components/PayPal"
import * as getfree from "../components/FreeToken"
import * as mymarkdown from "./MyReactMarkdown"

import ReactGA from 'react-ga';

//ReactGA.initialize('UA-62339543-1');
ReactGA.initialize('UA-198012996-1', {
    //debug: true,
    titleCase: false,
    gaOptions: {
        //userId: '123',
        siteSpeedSampleRate: 100
    }
});

ReactGA.pageview(window.location.pathname + window.location.search + "gotohere");


// FIXME add remark-gfm 
// remarkPlugins={[gfm]}
// import gfm from 'remark-gfm'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {

            fontFamily: 'Noto Serif'

            // flex: 1,
            //  justifyContent: 'center',
            //  alignItems: 'center',
            //   width: theme.spacing(50),
            //   height: theme.spacing(75),

            //   top: "12%",// "12vw",
            //   left: "12%",
            //   position: "absolute"
        },
        paper: {

            fontFamily: 'Noto Serif',

            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary,
            minHeight: "100%",
            backgroundColor: 'rgba(250, 250, 250, 0.85)',

        },

        divstyle: {

            fontFamily: 'Noto Serif',

            padding: 20,
            //  background: "white",
            backgroundColor: 'rgba(250, 250, 250, 0.85)',
            //  width: "75vw",

            textAlign: 'left',//'left',

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

const backgroundFlagStyle = {
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

    //const [anchorEl, setAnchorEl] = React.useState(null);
    const [isBuyToken, setBuyToken] = React.useState(false);
    const [isGetFreeToken, setGetFreeToken] = React.useState(false);
    const [isBuyDonation, setBuyDonation] = React.useState(false);

    const [activeIndex, setActiveIndex] = React.useState(0);

    console.log("rendering GoToHereApp window.innerWidth = ", window.innerWidth)

    const handleDialogClose = () => {
        setBuyToken(false);
        setGetFreeToken(false);
        setBuyDonation(false);
    };
    const classes = useStyles();

    const page = util.getServerPage()

    console.log(" in GoToHereApp page is ", page)

    const buyToken = () => {
        setBuyToken(true)
        ReactGA.event({
            category: 'User',
            action: 'gth Clicked buyToken'
        });
    }
    const getFreeToken = () => {
        ReactGA.event({
            category: 'User',
            action: 'gth Clicked getFreeToken'
        });
        setGetFreeToken(true)
    }
    const buyDonation = () => {
        ReactGA.event({
            category: 'User',
            action: 'gth Clicked getFreeToken'
        });
        setBuyDonation(true)
    }

    type funtype = () => any
    const stringToFunction = (fname: any): funtype | undefined => {
        if (fname === "buyToken") {
            console.log("stringToFunction returning " + fname)
            return buyToken
        } else if (fname === "getFreeToken") {
            console.log("stringToFunction returning " + fname)
            return getFreeToken
        } else if (fname === "buyDonation") {
            console.log("stringToFunction returning " + fname)
            return buyDonation
        } //else
        //    console.log("ERROR unhandled fname " + fname)
        return undefined // () => { }
    }

    const stos = (s: any): string => { return "" + s }

    // this does NOT do what I thought. shit.
    // const linkTargetFilter = (href:string, children:any, title : any) : string  => {
    //     if (href === "getFreeToken"){
    //         return href
    //     }
    //     return "_blank"
    // }
    // <a class="twitter-timeline"
    //  class="twitter-follow-button"

    // class="twitter-follow-button"

    const getTwitterButton = () => {
        return (
            <>
                <a href="https://twitter.com/gotoherec?ref_src=twsrc%5Etfw" className="twitter-follow-button" data-show-count="false">Follow @gotoherec</a><script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
            </>
        )
    }

    const home = () => (
        <div className={classes.divstyle} >
            {/* <Grid className={classes.root} container direction="column" component="div"   > */}

            {/* <div><a href="https://twitter.com/GotohereC?ref_src=twsrc%5Etfw" data-show-count="false">Follow @GotohereC</a><script async src="https://platform.twitter.com/widgets.js"  ></script>
                </div> */}

            {getTwitterButton()}

            <ReactMarkdown children={homeText}
                className={classes.divstyle}
                //    linkTarget={linkTargetFilter}
                components={{
                    // Rewrite links to be onClick
                    a: ({ node, ...props }) => {
                        var thefunct = stringToFunction(props.href)
                        var theHref = stos(props.href)
                        if (thefunct === undefined) {
                            thefunct = () => { }
                        } else {
                            theHref = "#"
                        }
                        console.log(" ReactMarkdown components href ", theHref)

                        return (<a href={theHref} onClick={thefunct}  >{props.children}</a>)
                    }
                }}
            />

            {/* <Paper className={classes.divstyle} >
                    <a href="https://twitter.com/GotohereC?ref_src=twsrc%5Etfw">Tweets by GotohereC</a> <script async src="https://platform.twitter.com/widgets.js" ></script>
                </Paper> */}
            {/* <div><a href="https://twitter.com/GotohereC?ref_src=twsrc%5Etfw" data-show-count="false">Follow @GotohereC</a><script async src="https://platform.twitter.com/widgets.js"  ></script>
                </div> */}

            {/* </Grid> */}

            {/* <Dialog style={{ width: 600, height: 800, padding: 24 }}
                className={classes.root}
                open={isBuyToken}
                onClose={handleDialogClose}
            >
                <paypal.PalPalDialog title="Please buy a token here. Computers aren't free." />
            </Dialog>

            <Dialog style={{ width: 600, height: 800, padding: 24 }}
                className={classes.root}
                open={isGetFreeToken}
                onClose={handleDialogClose}
            >
                <getfree.FreeToken title="This page will eventually dispense a free token." />
            </Dialog>

            <Dialog style={{ width: 600, height: 800, padding: 24 }}
                className={classes.root}
                open={isBuyDonation}
                onClose={handleDialogClose}
            >
                <paypal.PalPalDialog title="Please donate to this worthy cause and you will receive a complementary token." />
            </Dialog> */}
        </div>
    )

    const about = () => (
        <div className={classes.divstyle} >

            <ReactMarkdown children={aboutText}
                className={classes.divstyle}
                //    linkTarget={linkTargetFilter}
                components={{
                    // Rewrite links to be onClick
                    a: ({ node, ...props }) => {
                        var thefunct = stringToFunction(props.href)
                        var theHref = stos(props.href)
                        if (thefunct === undefined) {
                            thefunct = () => { }
                        } else {
                            theHref = "#"
                        }
                        console.log(" ReactMarkdown components href ", theHref)

                        return (<a href={theHref} onClick={thefunct}  >{props.children}</a>)
                    }
                }}
            />


        </div>
    )

    const handleChange = (blank: any, newactiveIndex: number) => setActiveIndex(newactiveIndex)

    function verticalBody() {

        // 2 vertical bars 
        //, height: "100%"

        // how do we subtract the header off of the height?
        //  style={{ backgroundColor: '#cfe8fc' }}
        return (

            <Grid container spacing={0} // spacing between items

                direction="row"
                justify="center"

                style={{}}

            >
                <Grid item xs={3} style={{ height: '100vh', fontFamily: 'Noto Serif', }}  >

                    <Container fixed style={{ padding: "0" }} >
                        {/* <Typography component="div" style={{}}  >   </Typography> */}
                        <div className={classes.divstyle}
                            style={{
                                display: 'flex',
                            }}
                        >
                            <VerticalTabs
                                value={activeIndex}
                                onChange={handleChange}
                            >
                                {theMenuItems}
                            </VerticalTabs>
                        </div>

                    </Container>

                </Grid>

                <Grid item xs={9}>

                    <Paper className={classes.paper} style={{ fontFamily: 'Noto Serif', }} >

                        {activeIndex === 0 && <TabContainer>{home()}</TabContainer>}
                        {activeIndex === 1 && <TabContainer><mymarkdown.MyReactMarkdown stringToFunction={stringToFunction} children={aboutText} /></TabContainer>}
                        {activeIndex === 2 && <TabContainer><paypal.PalPalDialog title="Please buy a token here. Computers aren't free." /></TabContainer>}
                        {activeIndex === 3 && <TabContainer><paypal.PalPalDialog title="Please donate to the cause and we'll give you a token." /></TabContainer>}
                        {activeIndex === 4 && <TabContainer>Help promote a free internet.</TabContainer>}
                        {activeIndex === 5 && <TabContainer>Reserve your name on the network. Coming soon.</TabContainer>}
                        {activeIndex === 6 && <TabContainer><mymarkdown.MyReactMarkdown stringToFunction={stringToFunction} children={profilesList} /> </TabContainer>}
                        {activeIndex === 7 && <TabContainer>Create a profile. Coming soon.</TabContainer>}
                        {activeIndex === 8 && <TabContainer>Token inspector</TabContainer>}
                    </Paper>

                    <Dialog style={{ width: 600, height: 800, padding: 24 }}
                        className={classes.root}
                        open={isBuyToken}
                        onClose={handleDialogClose}
                    >
                        <paypal.PalPalDialog title="Please buy a token here. Computers aren't free." />
                    </Dialog>

                    <Dialog style={{ width: 600, height: 800, padding: 24 }}
                        className={classes.root}
                        open={isGetFreeToken}
                        onClose={handleDialogClose}
                    >
                        <getfree.FreeToken title="This page will eventually dispense a free token." />
                    </Dialog>

                    <Dialog style={{ width: 600, height: 800, padding: 24 }}
                        className={classes.root}
                        open={isBuyDonation}
                        onClose={handleDialogClose}
                    >
                        <paypal.PalPalDialog title="Please donate to this worthy cause and you will receive a complementary token." />
                    </Dialog>
                </Grid>
            </Grid>
        );
    }
    var theMenuItems = [

        <MyTab label='Home' />, // 0
        <MyTab label='About' />, // 1
        <MyTab label='Buy a Token' />, // 2
        <MyTab label='Donate' />, // 3
        <MyTab label='Help promote a free internet.' />, // 4
        <MyTab label='Reserve your name on the network.' />, // 5
        <MyTab label='Test profiles.' />, // 6
        <MyTab label='Create a profile.' />, // 7
        <MyTab label='Token inspector.' />, // 8
    ]

    function headAndBody() {

        // three horz bars 

        return (
            <Grid container spacing={0} direction="column">
                <Grid item xs={12} >

                    <AppBar position="static" className={classes.paper} >
                        <Typography variant="h4" style={{ fontFamily: 'Noto Serif', }} >
                            GoToHere
                        </Typography>
                        <Typography variant="h6" style={{ fontFamily: 'Noto Serif', }} >
                            A movement to promote a decentralised social platform.
                        </Typography>
                    </AppBar>

                </Grid>
                <Grid item xs={12}>

                    {verticalBody()}

                </Grid>
            </Grid>
        );
    }

    return (
        <div style={backgroundFlagStyle} >
            {headAndBody()}
        </div>
    )
}

// const [isBuyToken, setBuyToken] = React.useState(false);
// const [isGetFreeToken, setGetFreeToken] = React.useState(false);
// const [isBuyDonation, setBuyDonation] = React.useState(false);


export default GoToHereApp;


const homeText = `
    
#### If you are in favor of this movement, and you wish it to grow, [follow it on Twitter](https://twitter.com/GotohereC?ref_src=twsrc%5Etfw"). 

Please [donate](buyDonation). This is a worthy cause that might die without support. With support it will grow to challenge the tech monopolies.

The smart-phone apps are not ready but brave souls can now [create profiles](https://github.com/awootton/GoToHere/wiki/Create-a-GoToHere-profile.) on GoToHere.  

[Technical documentation is here](https://github.com/awootton/GoToHere/wiki) at this wiki.

[Source code](https://github.com/awootton/GoToHere) is publicly available.

`

const aboutText =
    `### Features:

*  You cannot be banned. There's no 'jail' possible.
*  You own all your own data. Everything is kept safe on your device.
*  There is no tracking. No user tracking. No 'cookies'. Privacy.
*  Posts cannot be censored. Only you can change them. 
*  There are no ads. You and your friends can post advertisements if you wish.
*  There can be no 'spying' or 'tapping'. Messages are secure.
 
### How it works.
The trick is that posts travel, encrypted, directly from you to your friends and followers.
The posts don't take a detour to visit the mothership (like with the middlemen twitter and facebook etc)
so the posts cannot be examined or blocked or modified.

To pull off this trick actually required writing a new form of the internet with advanced capabilities. 
That new internet, the knot free net, is at [KnotFree.net](http://KnotFree.net) and is useful for IOT and many other things. 

Instead of requiring email registration to use that network it uses 'tokens'. 
Think of arcade tokens. [You can buy them here](buyToken) or from [KnotFree.net](http://KnotFree.net). 
Small tokens are being [given out for free.](getFreeToken)
`

const profilesList =
    `
Here are some test profiles so you can get an idea of how a decentralized social net would work: (and because Alice, Bob, and Charlie are the traditional subjects of crypto demos).

*  [alice_vociferous_mcgrath](http://alice_vociferous_mcgrath.gotohere.com/)
*  [building_bob_bottomline_boldness](http://building_bob_bottomline_boldness.gotohere.com/)
*  [charles_everly_erudite](http://charles_everly_erudite.gotohere.com/)
*  [Ruth_Anna_Amanda](http://Ruth_Anna_Amanda.gotohere.com/)
*  [Carl_Austin_Alexander](http://Carl_Austin_Alexander.gotohere.com/)
*  [Beverly_Grace_Lauren](http://Beverly_Grace_Lauren.gotohere.com/)
*  [Kenneth_Randy_Jeffrey](http://Kenneth_Randy_Jeffrey.gotohere.com/)
*  [Roy_Logan_Christian](http://Roy_Logan_Christian.gotohere.com/)
*  [James_Vincent_Nicholas](http://James_Vincent_Nicholas.gotohere.com/)
*  [Edward_Larry_Zachary](http://Edward_Larry_Zachary.gotohere.com/)
*  [Ashley_Andrea_Melissa](http://Ashley_Andrea_Melissa.gotohere.com/)
*  [Philip_Ronald_Daniel](http://Philip_Ronald_Daniel.gotohere.com/)
*  [Roger_Sean_Randy](http://Roger_Sean_Randy.gotohere.com/)
*  [Rachel_Teresa_Doris](http://Rachel_Teresa_Doris.gotohere.com/)
*  [Bruce_Charles_Logan](http://Bruce_Charles_Logan.gotohere.com/)
*  [Kyle_Russell_Gerald](http://Kyle_Russell_Gerald.gotohere.com/)
*  [Lisa_Margaret_Sharon](http://Lisa_Margaret_Sharon.gotohere.com/)
*  [Susan_Rebecca_Amanda](http://Susan_Rebecca_Amanda.gotohere.com/)
*  [Joyce_Joyce_Rose](http://Joyce_Joyce_Rose.gotohere.com/)
*  [Joan_Joyce_Catherine](http://Joan_Joyce_Catherine.gotohere.com/)

These test profiles are literally running on my laptop and are made available worldwide by the new network, knotfree.net. Soon we shall have some real people. 
 
`

//    😃    smilie face smiley face 


const VerticalTabs = withStyles(theme => ({
    flexContainer: {
        flexDirection: 'column'
    },
    indicator: {
        display: 'none',
    }
}))(Tabs)


const MyTab = withStyles(theme => ({
    root: {
        textTransform: 'capitalize',
        fontFamily: 'Noto Serif',
    },
    selected: {
        color: 'tomato',
        borderBottom: '2px solid tomato',
        fontFamily: 'Noto Serif',
        textTransform: 'capitalize' // lowercase, capitalize, uppercase
    }
}))(Tab);


function TabContainer(props: any) {
    return (

        <Typography component="div" style={{ padding: 24, fontFamily: 'Noto Serif' }}>
            {props.children}
        </Typography>
    );
}


