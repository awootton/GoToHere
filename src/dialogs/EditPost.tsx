import React, { ReactElement, FC, useState } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import * as social from "../server/SocialTypes"

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

import Container from "@material-ui/core/Container";

//import Menu from '@material-ui/core/Menu'
import TextField from '@material-ui/core/TextField';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import * as savepostapi from '../api1/SavePost'


// define css-in-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        root: {
           flexGrow: 1,
            //height: 12,
          //  backgroundColor: theme.palette.background.paper,

            // padding: "0px 0px",
            // justifyContent: 'center',
            // alignItems: 'center',

            height:  800, // this also sets the size

           //minWidth: theme.spacing(85),

        //   minWidth: theme.spacing(150),

           //width: 800,
          // height: 400,
          //bgcolor: 'blue',


        },


    })
);

type Props = {
    post: social.Post
    username: string
    cancel: () => any
}

export const FillEditPost: FC<Props> = (props: Props) => {

    const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str: string = event.target.value
        //console.log("title is now ", str)
        // const newState = {
        //     ...state,
        //     title: str
        // }
        // setState(newState)
    }
    const handleBodyChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str: string = event.target.value
        //console.log("body is now ", str)
        // const newState = {
        //     ...state,
        //     theText: str
        // }
        // setState(newState)
    }

    const classes = useStyles();

    const onSaveButton = () => {

        const savePostReceiver = ( reply: savepostapi.SavePostReply, error: any) => {
                console.log(" back from saving with err ", error, " and ", reply )
        }

        savepostapi.IssueTheCommand(props.username, props.post, savePostReceiver, 10 )
    }

    // sx={{ p: 2, border: '1px dashed grey' }} 

    const renderEditCard = (post: social.Post) => {
        return (
            <Box  className={classes.root} borderRadius={64}  borderColor="secondary.main"  >
                <Card elevation={2} key={post.id} >
                    <TextField
                        fullWidth
                        id="titleeditor"
                        type="text"
                        label="Edit the title (if any):"
                        placeholder={post.title}
                        margin="normal"
                        onChange={handleTitleChange}
                        defaultValue={post.title}
                        multiline={true}
                    />
                    <CardContent>
                        <TextField
                            //style={{maxHeight: 200, overflow: 'auto'}}
                            fullWidth
                            id="contenteditor"
                            type="text"
                            label="Edit the item here:"
                            placeholder={post.theText}
                            margin="normal"
                            onChange={handleBodyChange}
                            defaultValue={post.theText}
                            multiline={true}
                        />
                        {/* <Typography variant="body2" color="textSecondary" component="div">
                            <ReactMarkdown>{post.theText}</ReactMarkdown>
                        </Typography> */}
                    </CardContent>
                    <CardActions>
                        <Button variant="contained" onClick={onSaveButton} >Save</Button>
                        <Button variant="contained" onClick={() => { props.cancel()}} >Cancel</Button>
                    </CardActions>
                </Card>
            </Box>
        )
    }
    return (
        <>
            {renderEditCard(props.post)}
        </>
    )
}



export default FillEditPost;
