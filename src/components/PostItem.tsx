
//import React, { ReactElement, FC, useState } from "react";
import { ReactElement, FC } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import * as social from "../server/SocialTypes"

import Box from "@material-ui/core/Box";

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import Typography from '@material-ui/core/Typography';
import ReactMarkdown from 'react-markdown'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

import Tooltip from '@material-ui/core/Tooltip'
 
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';

import * as menus_card from '../menus/Card'
import * as util from '../server/Util'
import * as likesapi from "../api1/IncrementLikes"


// define css-in-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        root: {
        },

        title: {
            fontSize: 14,
            padding: "4px 4px",
        },
        // pos: {
        //     marginBottom: 12,
        // },
        theText: {
            display : "flex",
            padding: "0px 0px",
            height: 120, // 
            
            overflow: 'auto',
        },

        nopadding: {
            padding: "0px 0px",
        },

        pushedright: {
            display: "flex",
            justifyContent: "space-between" //justifyContent: "flex-end",
            //alignItems: 'center', // vertical
        },

        centered : {
            display: "flex",
            justifyContent: "space-between" ,
            fontSize: 11,
            alignItems : 'center', // centers vertical
        },

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

// define interface to represent component props
export interface Props {
    post: social.Post
    username: string
}

export const PostItem: FC<Props> = (props: Props): ReactElement => {

    //const [state, setState] = useState(props.post)

    const classes = useStyles();

    // todo: add from  {post.from}: <b>{post.title}</b>   
    const getTitleStuff = (post: social.Post) => {

        var dom = (
            <Box
                display="flex"
                flexDirection="row"
                p={1}
                m={1}
                bgcolor="background.paper"

                className={classes.pushedright}
            >

                <b>{post.title}</b>
                <span className={classes.centered} >
                    { post.id !==0 ? util.FormatDateNumber(post.id):"" }
                </span>
                <span className={classes.pushedright} >
                { post.id !== 0 ? (
                    <>
                        <Tooltip title={post.likes.toString() + " likes" }  >
                        
                        <Button onClick={handleClickHeart} className={classes.button} > 
                            {post.likes === 0 ? <FavoriteBorderIcon/> : <FavoriteIcon/> }
                        </Button>
                 
                        </Tooltip>
                        <menus_card.CardMenu post={post}  username={props.username} />
                    </>
                 ) : (<></>)
                }
                </span>

            </Box>
        )

        // var y = (
        //     <Box
        //         display="flex"
        //         flexDirection="row"
        //         p={1}
        //         m={1}
        //         bgcolor="background.paper"

        //         className={classes.pushedright}
        //     >
        //         <Box p={1} bgcolor="grey.300">
        //             Item 1
        //         </Box>
        //         <Box p={1} bgcolor="grey.300">
        //             Item 2
        //         </Box>
        //         <Box p={1} bgcolor="grey.300" >
        //             Item 3
        //         </Box>
        //     </Box>
        // )

        return dom
    }

    const handleClickHeart = () => {

        // should be alice, anon
        console.log("like pushed for ", props.username, " by ", util.getSignedInContext().username)
        likesapi.IssueTheCommand(props.username,props.post.id, util.getSignedInContext().username, (reply: likesapi.IncrementLikesReply, error: any) => {
            console.log("nobody really give a shit about the likes return. The action is in the broadcast event")
        })
    };

    const handleCommentClick = () => {
    }

    const renderPlainCard = (post: social.Post) => {
        return (
            <>
                <Card elevation={2} className={classes.nopadding} key={post.id} >

                    <CardContent className={classes.nopadding} >
                        {getTitleStuff(post)}
                        <Typography variant="body2" color="textSecondary" component="div" className={classes.theText}  >
                            <ReactMarkdown className={classes.theText} >{post.theText}</ReactMarkdown>
                        </Typography>
                    </CardContent>
                    <CardActions>

                        {/* <Button size="small" onClick={handleCommentClick} >Comments</Button>
                        <Button size="small">Re-post</Button>
                        <Button size="small">Like</Button> */}

                    </CardActions>
                </Card>
            </>
        )
    }

    //const dummy = () => { }

    // if (props.post.editable) {
    //     return (
    //         <>
    //             {renderEditCard(props.post)}
    //         </>
    //     );
    // } else 
    {
        return (
            <>
                {renderPlainCard(props.post)}
            </>
        );
    }
};



// type EditProps = {
//     post : social.Post
//     username: string
// }

// export const FillEditDialog: FC<EditProps> = (props: EditProps) => {

//     const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
//         const str: string = event.target.value
//         console.log("title is now ", str)
//         // const newState = {
//         //     ...state,
//         //     title: str
//         // }
//         // setState(newState)
//     }
//     const handleBodyChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
//         const str: string = event.target.value
//         console.log("body is now ", str)
//         // const newState = {
//         //     ...state,
//         //     theText: str
//         // }
//         // setState(newState)
//     }

//     const classes = useStyles();

//     const renderEditCard = (post: social.Post) => {
//         return (
//             <>
//                 <Card elevation={2} className={`background-color: gray;`} key={post.id} >
//                     <TextField
                        
//                         fullWidth
//                         id="titleeditor"
//                         type="text"
//                         label="Edit the title (if any):"
//                         placeholder={post.title}
//                         margin="normal"
//                         onChange={handleTitleChange}
//                         defaultValue={post.title}
//                         multiline={true}
//                     />
//                     <CardContent>
//                         <TextField
//                             style={{maxHeight: 200, overflow: 'auto'}}
//                             fullWidth
//                             id="contenteditor"
//                             type="text"
//                             label="Edit the item here:"
//                             placeholder={post.theText}
//                             margin="normal"
//                             onChange={handleBodyChange}
//                             defaultValue={post.theText}
//                             multiline={true}
//                         />
//                         {/* <Typography variant="body2" color="textSecondary" component="div">
//                             <ReactMarkdown>{post.theText}</ReactMarkdown>
//                         </Typography> */}
//                     </CardContent>
//                     <CardActions>
//                         <Button variant="contained" onClick={ () => {} } >Save</Button>
//                     </CardActions>
//                 </Card>
//             </>
//         )
//     }
//     return (
//         <>
//              {renderEditCard(props.post)}
//         </>
//     )
// }



export default PostItem;
