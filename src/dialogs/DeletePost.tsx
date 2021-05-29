import { FC } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import * as social from "../server/SocialTypes"

import Card from '@material-ui/core/Card'
//import CardContent from '@material-ui/core/CardContent'

import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

//import Container from "@material-ui/core/Container";

//import Menu from '@material-ui/core/Menu'
//import TextField from '@material-ui/core/TextField';

//import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import * as deletepostapi from '../api1/DeletePost'
//import * as savepostapi from '../api1/SavePost'
//import * as cardutil from '../components/CardUtil'


const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        root: {
            flexGrow: 1,
            height: 800, // this also sets the size
        },
    })
);

type Props = {
    post: social.Post
    username: string
    cancel: () => any
}

export const FillDeletePost: FC<Props> = (props: Props) => {

    //const [state,setState] = useState(cardutil.makeEmptyCard(props.username))

    const classes = useStyles();

    const onDeleteButton = () => {

        if (props.post.id === 0) {
            props.cancel() // close the dialog
            return
        }

        const deletePostReceiver = (reply: deletepostapi.DeletePostReply, error: any) => {
            console.log(" back from deleting with err ", error, " and ", reply)
            if (error !== undefined) {
                //add error to invisible note
                console.log("ERROR DeletePost ", error, " and ", reply)
            } else {
                props.cancel() // close the dialog
            }
        }
        // const newPost = state
        deletepostapi.IssueTheCommand(props.username, props.post.id, deletePostReceiver, 10)

    }

    const renderEditCard = (post: social.Post) => {
        return (
            <Box className={classes.root} borderColor="secondary.main"  >
                <Card elevation={2} key={post.id} >
                    <CardActions>
                        <Button variant="contained" onClick={() => { props.cancel() }} >Cancel</Button>
                        <Button variant="contained" onClick={onDeleteButton} >Delete</Button>
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



export default FillDeletePost;
