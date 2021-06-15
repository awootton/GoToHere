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

import { FC } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import * as s from "../gotohere/knotservice/SocialTypes"

import Card from '@material-ui/core/Card'
//import CardContent from '@material-ui/core/CardContent'

import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

//import Container from "@material-ui/core/Container";

//import Menu from '@material-ui/core/Menu'
//import TextField from '@material-ui/core/TextField';

//import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import * as deletepostapi from '../gotohere/api1/DeletePost'
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
    post: s.Post
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

    const renderEditCard = (post: s.Post) => {
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
