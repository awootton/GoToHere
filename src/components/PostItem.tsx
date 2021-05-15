import React, { ReactElement, FC, useState } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import * as social from "../server/SocialTypes"

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

import TextField from '@material-ui/core/TextField';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

import { SimpleDialog } from './SimpleDialog'
import classes from "*.module.css";


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
        nopadding: {
            padding: "0px 0px",
        },

        pushedright: {
            display: "flex",
            justifyContent: "space-between" //justifyContent: "flex-end",
            //alignItems: 'center', // vertical
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

    const [state, setState] = useState(props.post)

    const classes = useStyles();

    // todo: add from  {post.from}: <b>{post.title}</b>   
    const getTitleStuff = (post: social.Post) => {

        var x = (
            <Typography component="div" className={classes.title} color="textSecondary" gutterBottom>
                <b>{post.title}</b>
                <span className={classes.pushedright} >
                    <>
                        <Button onClick={handleClickHeart} className={classes.button} > <FavoriteBorderIcon /> </Button>
                        <CardMenu post={post} username={props.username} >
                        </CardMenu>
                    </>
                </span>
            </Typography>
        )

        var x2 = (
            <Box
                display="flex"
                flexDirection="row"
                p={1}
                m={1}
                bgcolor="background.paper"

                className={classes.pushedright}
            >

                <b>{post.title}</b>
                <span className={classes.pushedright} >
                    <>
                        <Button onClick={handleClickHeart} className={classes.button} > <FavoriteBorderIcon /> </Button>
                        <CardMenu post={post}  username={props.username} >
                        </CardMenu>
                    </>
                </span>

            </Box>
        )

        var y = (
            <Box
                display="flex"
                flexDirection="row"
                p={1}
                m={1}
                bgcolor="background.paper"

                className={classes.pushedright}
            >
                <Box p={1} bgcolor="grey.300">
                    Item 1
                </Box>
                <Box p={1} bgcolor="grey.300">
                    Item 2
                </Box>
                <Box p={1} bgcolor="grey.300" >
                    Item 3
                </Box>
            </Box>
        )

        return x2
    }

    const handleClickHeart = () => {

    };

    const handleCommentClick = () => {

    }

    const renderPlainCard = (post: social.Post) => {
        return (
            <>
                <Card elevation={2} className={classes.nopadding} key={post.id} >

                    <CardContent className={classes.nopadding} >
                        {getTitleStuff(post)}
                        <Typography variant="body2" color="textSecondary" component="div" className={classes.nopadding}  >
                            <ReactMarkdown className={classes.nopadding} >{post.theText}</ReactMarkdown>
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

    const dummy = () => { }

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
                className={classes.root}
                open={openEdit}
                fillme={FillEditDialog}
                post={props.post}
                username={props.username}
                title={"Edit " + props.post.title}
                onClose={handleDialogClose}
            />

        </>
    )
}

type EditProps = {
    post : social.Post
    username: string
}

export const FillEditDialog: FC<EditProps> = (props: EditProps) => {

    const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str: string = event.target.value
        console.log("title is now ", str)
        // const newState = {
        //     ...state,
        //     title: str
        // }
        // setState(newState)
    }
    const handleBodyChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str: string = event.target.value
        console.log("body is now ", str)
        // const newState = {
        //     ...state,
        //     theText: str
        // }
        // setState(newState)
    }

    const classes = useStyles();

    const renderEditCard = (post: social.Post) => {
        return (
            <>
                <Card elevation={2} className={`background-color: gray;`} key={post.id} >
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
                            style={{maxHeight: 200, overflow: 'auto'}}
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
                        <Button variant="contained" onClick={ () => {} } >Save</Button>
                    </CardActions>
                </Card>
            </>
        )
    }
    return (
        <>
             {renderEditCard(props.post)}
        </>
    )
}



export default PostItem;
