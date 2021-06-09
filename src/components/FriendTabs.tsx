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
import React, { FC, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import AppBar from '@material-ui/core/AppBar';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
// import Typography from '@material-ui/core/Typography';
//import Box from '@material-ui/core/Box';

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';

import Paper from '@material-ui/core/Paper';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';

import * as dialogs_apptest from '../dialogs/AppFrame'

import * as friendsapi from '../gotohere/api1/GetFriends'
import * as util from "../gotohere/mqtt/Util"
import { MqttClient } from 'mqtt';

const useStyles = makeStyles((theme) => ({

    root: {
        flexGrow: 1,
        height: 12,
        backgroundColor: theme.palette.background.paper,

        padding: "0px 0px",
        justifyContent: 'center',
        alignItems: 'center'

    },

    showingstyle: {
        textTransform: 'capitalize',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 16,
        fontWeight: "bold",

        boxShadow: "0",

        margin: "24 0px",
        border: "24 0px",

    },

    friendItem: {
        margin: 0,
        textTransform: 'none',
    },

    appbar: {

        width: "100%",
        height: theme.spacing(4)

    },
    tabLabel: {
        fontSize: 12,
        height: 14,
        textTransform: 'capitalize'
    }
    ,
    tabs: { // the container for all the tabs
        width: "auto",
        backgroundColor: "green"
    }

}));


export interface FriendTabsProps {
    username: string,
}

type NameProps = {
    index: number,
    name: string
    pubkeys: string[] 
}
export const LinkedName: FC<NameProps> = (props: NameProps) => {

    const [openAppDialog, setOpenAppDialog] = React.useState(false);

    const classes = useStyles();

    const handleDialogClose = (value: any) => {
        setOpenAppDialog(false);
    };

    const showTheAppDialog = () => {
        setOpenAppDialog(true)
    }

    var ourName = util.getSignedInContext().username

    const getTitle = () => { // for the dialog if opened
        return (
            <div>
                <Button onClick={handleDialogClose} ><ArrowBackIosIcon /></Button>
                Viewing {props.name} as {ourName}
            </div>
        )
    }

    const item = (

        <div key={props.index} className={classes.friendItem} >
            <Button
                onClick={showTheAppDialog}
                className={classes.friendItem}
            >
                {props.name}
            </Button>

            <Dialog
                open={openAppDialog}
               // fillme={dialogs_apptest.FillAppFrame}
                //title={getTitle()}
                onClose={handleDialogClose}
                >
                <DialogTitle>{getTitle()}</DialogTitle>
                <dialogs_apptest.FillAppFrame username={props.name} pubkeys={props.pubkeys} hasHeader = {false}  />
            </Dialog>

        </div>
    )
    return item
}

export const FriendTabs: FC<FriendTabsProps> = (props: FriendTabsProps) => {

    const classes = useStyles();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [showing, setShowing] = React.useState("friends");
    const [sequence, setSequence] = React.useState(0);

    const [friendsData, setFriendsData] = React.useState(friendsapi.GetFriendsReplyEmpty);

    const loadTheData = () => {
        console.log("in useEffect of FriendTabs")
        // call the api for our friends! 
        friendsapi.IssueTheCommand(props.username, 9999, 0, gotFriendsReceiver)
        setTimeout(()=>{
            setSequence(sequence+1)
        },10)
    }

    useEffect( () => { loadTheData() }, [] )// once

    const gotFriendsReceiver = (reply: friendsapi.GetFriendsReply, error: any) => {
        //console.log("have friends data", reply)
        if (reply.friends === undefined || error) {
            reply = friendsapi.GetFriendsReplyEmpty
        }
        setFriendsData(reply)
    }

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    const handleClickOpenFriends = () => {
        setShowing('friends')
        handleClose()
    };
    const handleClickOpenFollowers = () => {
        setShowing('followers')
        handleClose()
    };
    const handleClickOpenFollowing = () => {
        setShowing('following')
        handleClose()
    };
    const handleClickOpenBlocked = () => {
        setShowing('blocked')
        handleClose()
    };

    const getPanel = () => {

        //console.log("getPanel of", showing)

        const items = []
        var theList: string[] = []

        if (showing === "friends") {
            theList = friendsData.friends
        } else if (showing === "followers") {
            theList = friendsData.followers
        } else if (showing === "following") {
            theList = friendsData.following
        } else if (showing === "blocked") {
            theList = friendsData.blocked
        }
        var index = 0
        //console.log("FriendTabs getPanel ", friendsData)
        for (const name of theList) {
            const keys: string[]  = friendsData.name2keys.get(name) || []
            //util.SetName2Pubk(name, util.fromBase64Url(pubk))
            const item = (
                <div key={index}>
                    <LinkedName index={index} name={name} pubkeys={keys} ></LinkedName>
                </div>
            )
            items.push(item)
            index += 1
        }
        return (
            <>
                {items}
            </>
        )
    }

    return (
        <div className={classes.root}>

            <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                {/* <MenuIcon />
                <div className={classes.showing} >{ "   " + whoIsShowing}</div> */}
                <MenuIcon /><Paper elevation={0} className={classes.showingstyle} >{showing}</Paper>
            </Button>

            <Menu
                //id="simple-menu" causes dom-node warning
                anchorEl={anchorEl}
                // keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >

                <MenuItem onClick={handleClickOpenFriends}>Friends</MenuItem>
                <MenuItem onClick={handleClickOpenFollowers}>Followers</MenuItem>
                <MenuItem onClick={handleClickOpenFollowing}>Following</MenuItem>
                <MenuItem onClick={handleClickOpenBlocked}>Blocked</MenuItem>

            </Menu>

            { getPanel()}

            {/* <AppBar position="static" className={classes.appbar} >
          <Tabs value={value} onChange={handleChange} className={classes.tabs} >
            <Tab label={<span className={classes.tabLabel}>Friends</span>}   />
            <Tab label={<span className={classes.tabLabel}>Relatives</span>}   />
            <Tab label={<span className={classes.tabLabel}>Following</span>}   />
            <Tab label={<span className={classes.tabLabel}>Blocked</span>}   />
          </Tabs>
        </AppBar> */}

            {/* <TabPanel value={value} index={0} username = {props.username}>
      
        Friends
        </TabPanel> 

        <TabPanel value={value} index={1} username = {props.username}>
        
          followers
        </TabPanel> 

        <TabPanel value={value} index={2} username = {props.username}>
        
           Following
        </TabPanel>

        <TabPanel value={value} index={3} username = {props.username}>
       
           Blocked
        </TabPanel> */}

        </div>
    );
}

export interface TabPropsType {
    username: string,
    children: any,
    value: any,
    index: any,
    other?: any,
}

// const TabPanel: FC<TabPropsType> = (props: TabPropsType) => {

//     const { username, children, value, index, ...other } = props;

//     return (
//         <div
//             role="tabpanel"
//             hidden={value !== index}
//             id={`simple-tabpanel-${index}`}
//             {...other}
//         >
//             {value === index && (
//                 //   <Box p={2}>
//                 <Typography component="div" >{children}</Typography>
//                 //   </Box>
//             )}
//         </div>
//     );
// }


export default FriendTabs;