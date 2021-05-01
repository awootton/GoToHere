import   { ReactElement, FC , useState} from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import * as social from "../server/SocialTypes"

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
 
import Typography from '@material-ui/core/Typography';
import ReactMarkdown from 'react-markdown'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

import TextField from '@material-ui/core/TextField';

 
// define css-in-js
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
 
        root: {
            minWidth: 275,
          },
          bullet: {
            display: 'inline-block',
            margin: '0 2px',
            transform: 'scale(0.8)',
          },
          title: {
            fontSize: 14,
          },
          pos: {
            marginBottom: 12,
          },
    })
);

// define interface to represent component props
interface Props {
    post: social.Post
}

const PostItem: FC<Props> = (props: Props): ReactElement => {

    const [state, setState] = useState(props.post)

    const classes = useStyles();

    const getTitleStuff = (post: social.Post) => {
        if (post.from !== undefined) {
            return (
                <Typography component="div" className={classes.title} color="textSecondary" gutterBottom>
                    {post.from}: {post.title}
                </Typography>
            )
        } else {
            return (
                <Typography component="div" className={classes.title} color="textSecondary" gutterBottom>
                    {post.title}
                </Typography>
            )
        }
    }

    const handleCommentClick = () => {

    }

    const renderPlainCard = (post: social.Post) => {
        return (
            <>
                <Card elevation={2} className={`background-color: gray;`} key={post.id} >
        
                    <CardContent>
                     {getTitleStuff(post)}
                        <Typography variant="body2" color="textSecondary" component="div">
                            <ReactMarkdown>{post.theText}</ReactMarkdown>
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button size="small" onClick={handleCommentClick} >Comments</Button>
                        <Button size="small">Re-post</Button>
                        <Button size="small">Like</Button>
                    </CardActions>
                </Card>
            </>
        )
    }
    
    const dummy = () => {}

    const handleTitleChange :  React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str:string = event.target.value
        //console.log("title is now ", str)
        const newState = {
            ...state,
            title: str
        }
        setState(newState)
    }
    const handleBodyChange :  React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str:string = event.target.value
        //console.log("body is now ", str)
        const newState = {
            ...state,
            theText: str
        }
        setState(newState)
    }

    const renderEditCard = (post: social.Post) => {

        

        return (
            <>
                <Card elevation={2} className={`background-color: gray;`} key={post.id} >
                    <TextField
                        //inputProps={inputProps} // attributes applied to input
                        // error={state.isError}
                        //style={someStyles}
                        fullWidth
                        id="titleeditor"
                        type="text"
                        label="Edit the title (if any):"
                        placeholder= { post.title}
                        margin="normal"
                        onChange={  handleTitleChange   }
                        defaultValue={ post.title}
                        multiline={true}
                    />
                    <CardContent>
                    <TextField
                        //inputProps={inputProps} // attributes applied to input
                        // error={state.isError}
                        //style={someStyles}
                        fullWidth
                        id="contenteditor"
                        type="text"
                        label="Edit the item here:"
                        placeholder= { post.theText}
                        margin="normal"
                        onChange={  handleBodyChange   }
                        defaultValue={ post.theText}
                        multiline={true}
                    />
                        {/* <Typography variant="body2" color="textSecondary" component="div">
                            <ReactMarkdown>{post.theText}</ReactMarkdown>
                        </Typography> */}
                    </CardContent>
                     <CardActions>
                     <Button variant="contained" onClick={dummy} >Post</Button>
                    </CardActions>  
                </Card>
            </>
        )
    }

    if (props.post.editable) {
        return (
            <>
                {renderEditCard(props.post)}
            </>
        );
    } else {
        return (
            <>
                {renderPlainCard(props.post)}
            </>
        );
    }
};



export default PostItem;
