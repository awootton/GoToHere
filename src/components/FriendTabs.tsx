
import React, { FC, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
// import AppBar from '@material-ui/core/AppBar';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
//import Box from '@material-ui/core/Box';

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';

import { SimpleDialog } from './SimpleDialog'
import * as dialog2 from './DialogScreens'

import * as api from '../api1/GetFriends'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        height: 12,
        backgroundColor: theme.palette.background.paper,

        padding: "0px 0px",
        justifyContent: 'center',
        alignItems: 'center'

    },

    showing: {
        textTransform: 'capitalize',
        justifyContent: 'center',
        alignItems: 'center'
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

    const getTitle = () => {
        return (
            <div>
                <Button onClick = {handleDialogClose} ><ArrowBackIosIcon/></Button>
                {props.name}
            </div>
        )
    }

    const item = (
        <>
            <div key={props.index} className={classes.friendItem} >
                <Button
                    onClick={showTheAppDialog}
                    className={classes.friendItem}
                >
                    {props.name}
                </Button>

                <SimpleDialog selectedValue={"dummy"}
                    // style = {someAppStyles}
                    className={classes.root}
                    open={openAppDialog}
                    fillme={dialog2.fillAppTestDialog}
                    title={getTitle()}
                    onClose={handleDialogClose}
                    username={props.name} />

            </div>
        </>

    )
    return item
}

export const FriendTabs: FC<FriendTabsProps> = (props: FriendTabsProps) => {

    const classes = useStyles();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [showing, setShowing] = React.useState("friends");

    const [friendsData, setFriendsData] = React.useState(api.GetFriendsReplyEmpty);


    useEffect(() => { reload() }, [])

    const reload = () => {
        console.log("in useEffect of FriendTabs")
        // call the api for our friends! 
        api.IssueTheCommand(props.username, 9999, 0, gotFriendsReceiver, 3)
    }

    const gotFriendsReceiver = (reply: api.GetFriendsReply, error: any) => {
        console.log("have friends data", reply)
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
    const handleClickOpenRelatives = () => {
        setShowing('relatives')
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

    var whoIsShowing: string = showing

    const getPanel = () => {

        //console.log("getPanel  ", showing)

        const items = []

        if (showing === "friends") {
            var index = 0
            for (const pubk of friendsData.friends) {
                const name = friendsData.key2name.get(pubk) || "noname"
                const item = (
                    <>
                        <LinkedName index={index} name={name} ></LinkedName>
                    </>
                )
                items.push(item)
                index += 1
            }
        }
        if (showing === "relatives") {
            var index = 0
            for (const pubk of friendsData.relatives) {
                const name = friendsData.key2name.get(pubk) || "noname"
                const item = (
                    <>
                        <LinkedName index={index} name={name} ></LinkedName>
                    </>
                )
                items.push(item)
                index += 1
            }
        }
        if (showing === "following") {
            var index = 0
            for (const pubk of friendsData.following) {
                const name = friendsData.key2name.get(pubk) || "noname"
                const item = (
                    <>
                        <LinkedName index={index} name={name} ></LinkedName>
                    </>
                )
                items.push(item)
                index += 1
            }
        }
        if (showing === "blocked") {
            var index = 0
            for (const pubk of friendsData.following) {
                const name = friendsData.key2name.get(pubk) || "noname"
                const item = (
                    <>
                        <LinkedName index={index} name={name} ></LinkedName>
                    </>
                )
                items.push(item)
                index += 1
            }
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
                <MenuIcon />
                <div className={classes.showing} >{whoIsShowing}</div>
            </Button>

            <Menu
                //id="simple-menu" causes dom-node warning
                anchorEl={anchorEl}
                // keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >

                <MenuItem onClick={handleClickOpenFriends}>Friends</MenuItem>
                <MenuItem onClick={handleClickOpenRelatives}>Relatives</MenuItem>
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
        
          relatives
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

const TabPanel: FC<TabPropsType> = (props: TabPropsType) => {

    const { username, children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                //   <Box p={2}>
                <Typography component="div" >{children}</Typography>
                //   </Box>
            )}
        </div>
    );
}


export default FriendTabs;