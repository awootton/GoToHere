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

import React, {FC, useState } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import * as social from "../server/SocialTypes"

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

//import Container from "@material-ui/core/Container";

//import Menu from '@material-ui/core/Menu'
import TextField from '@material-ui/core/TextField';

//import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import * as savepostapi from '../api1/SavePost'
import * as cardutil from '../components/CardUtil'


const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        root: {

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin : "20 20px",
            padding : "20 20px",
     
            width: theme.spacing(50),
            height: theme.spacing(50),
    
            minWidth : theme.spacing(50),
           
     
        //    justifyContent: 'center',
         //   alignItems: 'center', // centers vertically? 
    
            textAlign: 'center',

      //     flexGrow: 1,
            //height: 12,
          //  backgroundColor: theme.palette.background.paper,

            // padding: "0px 0px",
            // justifyContent: 'center',
            // alignItems: 'center',

     //       height:  800, // this also sets the size

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
    cancel: (value: any) => any
}

export const FillEditPost: FC<Props> = (props: Props) => {

    //console.log("FillEditPost post ", props.post )

    const [state,setState] = useState(props.post)

    const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str: string = event.target.value
       
        //console.log("title is now ", str)
        const newState : social.Post = {
             ...state,
             title: str
         }
         setState(newState)
    }
    const handleBodyChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str: string = event.target.value
      
        //console.log("body is now ", str)
        const newState : social.Post = {
            ...state,
            theText: str
        }
        setState(newState)
    }

    const classes = useStyles();

    const onSaveButton = () => {

        const savePostReceiver = ( reply: savepostapi.SavePostReply, error: any) => {
                console.log(" back from saving with err ", error, " and ", reply )
                if ( error !== undefined ) {
                    //add error to invisible note
                    console.log("ERROR SavePost ", error, " and ", reply )
                } else {
                    props.cancel("") // close the dialog
                }
        }
        const newPost = state
        savepostapi.IssueTheCommand(props.username, newPost, savePostReceiver)
    }

    // sx={{ p: 2, border: '1px dashed grey' }}  borderRadius={64}

    const renderEditCard = (post: social.Post) => {
        return (
            <Box  className={classes.root}   borderColor="secondary.main"  >
                <Card elevation={2} key={post.id} > 
                    <CardContent>
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
                        <Button variant="contained" onClick={() => { props.cancel("")}} >Cancel</Button>
                       <Button variant="contained" onClick={onSaveButton} >Save</Button>
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
