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

import React, { ReactElement, FC } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

// import Box from "@material-ui/core/Box";

// import Card from '@material-ui/core/Card'
// import CardContent from '@material-ui/core/CardContent'

// import Typography from '@material-ui/core/Typography';
// import ReactMarkdown from 'react-markdown'
//import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';

//import TextField from '@material-ui/core/TextField';
//import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

//import { SimpleDialog } from '../dialogs/SimpleDialog'
 
import * as postedit from '../dialogs/EditPost'
import * as postdelete from '../dialogs/DeletePost'
import * as s from "../gotohere/mqtt/SocialTypes"
import * as util from "../gotohere/mqtt/Util"
import * as cardutil from "../components/CardUtil"

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';


// define css-in-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        editdialog: {
            flexGrow: 1,
            margin: "2 2px",
            padding: "20 20px",
            width: 800,
            height: 800,
            minWidth: 800
          },
        button: {
            margin: "0px 0px",
            padding: "0px 0px",
            height: "40",
            width: "32px"
        },
    })
);


type CardMenuProps = {
    //id: string
    post: s.Post | s.Comment
    username: string
}
export const CardMenu: FC<CardMenuProps> = (props: CardMenuProps): ReactElement => {

    //console.log("CardMenu post = ", props.post, props.username )

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openEdit, setOpenEdit] = React.useState(false);
    const [openDelete, setOpenDelete] = React.useState(false);
    const [openComment, setOpenComment] = React.useState(false);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDialogClose = (value: any) => {
        handleDialogClosePlain()
    };

    const handleDialogClosePlain = () => {
        setOpenEdit(false);
        setOpenDelete(false);
    };

    // const handleClickDoSomething = () => {
    //     handleClose()
    // };

    const handleClickEdit = () => {
        setOpenEdit(true);
        handleClose()
    };

    const handleClickComment = () => {
        setOpenComment(true);
        handleClose()
    };

    // savepostapi.IssueTheCommand(props.username, newPost, savePostReceiver, 10 )
    const handleClickDelete = () => {
        setOpenDelete(true);
        handleClose()
    };


    const classes = useStyles();

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

                {/* <MenuItem onClick={handleClickDoSomething}>Show Comments</MenuItem>
                <MenuItem onClick={handleClickDoSomething}>New Comment</MenuItem> */}
                <MenuItem onClick={handleClickEdit}>Edit</MenuItem>
                <MenuItem onClick={handleClickDelete}>Delete</MenuItem>
                <MenuItem onClick={handleClickComment}>Comment</MenuItem>

            </Menu>

            <Dialog  
                className = {classes.editdialog}
                open={openEdit}
                onClose={handleDialogClose}
             > 
                <DialogTitle>{"Edit " + props.post.title}</DialogTitle>
                <postedit.FillEditPost  post={props.post} 
                                       // parent ={props.post.parent}
                                        username={props.username} 
                                        cancel = {handleDialogClosePlain} /> 
            </Dialog>

            <Dialog  
                open={openDelete}
                onClose={handleDialogClose}
            >
                <DialogTitle>{"Delete " + props.post.title + " by " + props.post.by + " on " + util.FormatDateNumber(props.post.id) }</DialogTitle>
                <postdelete.FillDeletePost username={props.username}  post={props.post} cancel = {handleDialogClosePlain} /> 
            </Dialog>

            <Dialog
                className = {classes.editdialog}
                open={openComment}
                onClose={handleDialogClose}
            >
                <DialogTitle>New Comment</DialogTitle>
                <postedit.FillEditPost username={props.username} 
                                        post={cardutil.makeEditComment(props.username,props.post)} 
                                        cancel={handleDialogClose}/>
            </Dialog>


        </>
    )
}