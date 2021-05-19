
import React, { ReactElement, FC, useState } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import Box from "@material-ui/core/Box";

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import Typography from '@material-ui/core/Typography';
import ReactMarkdown from 'react-markdown'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';

//import TextField from '@material-ui/core/TextField';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

import { SimpleDialog } from '../dialogs/SimpleDialog'
 
import * as postedit from '../dialogs/EditPost'
import * as social from "../server/SocialTypes"


// define css-in-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        // root: {
        // },

        // title: {
        //     fontSize: 14,
        //     padding: "4px 4px",
        // },
        // // pos: {
        // //     marginBottom: 12,
        // // },
        // nopadding: {
        //     padding: "0px 0px",
        // },

        // pushedright: {
        //     display: "flex",
        //     justifyContent: "space-between" //justifyContent: "flex-end",
        //     //alignItems: 'center', // vertical
        // },

        button: {
            margin: "0px 0px",
            padding: "0px 0px",
            height: "40",
            width: "32px"
        },

        // scrollingEdit : {
        //     overflow-y: scroll
        // }
    })
);


type CardMenuProps = {
    //id: string
    post: social.Post
    username: string
}
export const CardMenu: FC<CardMenuProps> = (props: CardMenuProps): ReactElement => {

    const classes = useStyles();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openEdit, setOpenEdit] = React.useState(false);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDialogClose = (value: any) => {
        setOpenEdit(false);
    };

    const handleClickDoSomething = () => {
        handleClose()
    };

    const handleClickEdit = () => {
        setOpenEdit(true);
        handleClose()
    };

    //const selectedValue = 'dummy'
    //const testUsernameTest = "building_bob_bottomline_boldness"

    return (
        <>
            <Button onClick={handleClick} className={classes.button}>
                <MenuIcon />
            </Button>

            <Menu
                //id="simple-menu" causes dom-node warning
                anchorEl={anchorEl}
                // keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >

                <MenuItem onClick={handleClickDoSomething}>Show Comments</MenuItem>
                <MenuItem onClick={handleClickDoSomething}>New Comment</MenuItem>
                <MenuItem onClick={handleClickEdit}>Edit</MenuItem>
                <MenuItem onClick={handleClickDoSomething}>Delete</MenuItem>

            </Menu>

            {/* // I hate to put a dialog in every post!  */}

            <SimpleDialog selectedValue={"dummy"}
                // style = {someAppStyles}
               // className={classes.root}
                open={openEdit}
                fillme={postedit.FillEditPost}
                post={props.post}
                username={props.username}
                cancel = {handleDialogClose}
                
                title={"Edit " + props.post.title}
                onClose={handleDialogClose}
            />

        </>
    )
}