



import { Component, Fragment } from 'react';

import * as social from '../server/SocialTypes'

//import * as topcard from "./PostListTopCard"


import * as getpostsapi from "../api1/GetPosts"

//import * as api1 from "../api1/Api"

import * as cards from "./CardUtil"
import * as util from "../server/Util"

import PostItem from '../components/PostItem'

type PostListProps = {
    // using `interface` is also ok
    message: string;
    folder: string;
    username: string
};
type PostListState = {
    //count: number; // like this
    start: social.DateNumber;
    end: social.DateNumber
    postslist: social.Post[],
    loading: boolean
};

function getDefaultList(username: string, error: string): social.Post[] {
    var anarr: social.Post[] = [cards.makeTopCard(username)]
    var somedata: number = 210101010000000
    anarr.forEach((val: social.Post, index: Number, postslist: social.Post[]) => {
        val.id = somedata
        somedata++
    })
    return anarr
}

export class PostList extends Component<PostListProps, PostListState> {

    state: PostListState = {// do we use this?
        start: 210413164940943,
        end: 210414194940943,
        postslist: getDefaultList("someusername",""),
        loading: true
    };

    componentDidMount() {
        //console.log("componentDidMount in PostList")
        this.getPosts();
    }

    async fetchPosts() {
        //
        // console.log("calling fetchPosts in PostList")
        //
        const top = "" + util.getCurrentDateNumber()
        const fold = "lists/posts/"
        const count = 6
        const old = ""

        // this could be a different username

        getpostsapi.IssueTheCommand(this.props.username, top, fold, count, old, (postslist: social.Post[], error: any) => {
            //console.log("just got back from issueTheCommand ")
            if (error) {
                console.log("getpostsapi.IssueTheCommand had an error ", error)
            } else {
                this.setState({ loading: false, postslist: postslist })
            }

        })
    }

    async getPosts() {
        //this.setState({ loading: false, posts: (await this.fetch('get', '/posts')) || [] });
        //this.setState({ loading: false, this.fetchPosts() });

        this.fetchPosts()
    }

    async deletePost(post: any) {
        if (window.confirm(`Are you sure you want to delete "${post.title}"`)) {
            // ATW FIXme: delete unwritten
            //await this.fetch('delete', `/posts/${post.id}`);
            await this.getPosts();
        }
    }

    getListToUse() {
        console.log("typeof this.state.list ", typeof this.state.postslist)
        if (this.state.postslist === undefined) {
            return getDefaultList(this.props.username,"")
        }
        if (this.state.postslist.length === 0) {
            return getDefaultList(this.props.username,"")
        }
        return this.state.postslist
    }

    returnPostsListDom() {
        const postsListDom = this.state.postslist.map((aPost) => (
            <Fragment key={aPost.id} >
                <PostItem key={aPost.id} post={aPost} username = {this.props.username} ></PostItem>
            </Fragment>
        ));
        //console.log("PostsList DOM is=" , postsListDom )
        //console.log("PostsList generated len=" + postsList.length )
        return (
            <>
                {postsListDom}
            </>
        )
    }

    render() {
        // const ourStyles = postListStyles;  how do styles work FIXME: atw
        return (
            <>
                { this.returnPostsListDom()}
            </>
        );
    }
}

export default PostList



// </CardActionArea>  
// <CardActions>
//   <Button size="small" color="primary">
//     Share
//   </Button>
//   <Button size="small" color="primary">
//     Learn More
//   </Button>
// </CardActions>


// const cardStyle = {
//     float: 'left',
//     width: '400px',
//     margin: '2px',
// };

//const useStyles = makeStyles({

// const postListStyles = createStyles({
//     root: {
//         minWidth: 275,
//         padding: 0
//     },
//     // spacing: {
//     // },
//     bullet: {
//         display: 'inline-block',
//         margin: '0 2px',
//         transform: 'scale(0.8)',
//     },
//     title: {
//         fontSize: 18,
//     },
//     pos: {
//         marginBottom: 0,
//         marginTop: 2,
//     },
//     padding: {
//         top: 0,
//         bottom: 0
//     }
// });

// Theme-dependent styles
// const styles = ({ palette, spacing }: Theme) => createStyles({
//     root: {
//       display: 'flex',
//       flexDirection: 'column',
//       padding: spacing.unit,
//       backgroundColor: palette.background.default,
//       color: palette.primary.main,
//     },
//   });

