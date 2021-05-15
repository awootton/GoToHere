
import React, { ReactElement, FC, useEffect } from "react";
import ReactList from 'react-list';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import * as getpostsapi from "../api1/GetPosts"

import * as social from "../server/SocialTypes"
import * as postitem from "../components/PostItem"
import * as cards from "../components/PostListTopCard"
import * as util from "../server/Util"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    root: {
      margin: '0 11px',
      border: '0 12px',

      padding: '0 13px',
    },
    wrapper: {
      overflow: 'auto',
      maxHeight: theme.spacing(100 - 6) // fixme: make the Events tab bar < 6 high
    },
    evens: {
    },
    odds: {
      //backgroundColor: 'blue',
    },
  })
);


type Props = {
  message: string;
  folder: string;
  username: string
  // topdate : social.DateNumber 
}

let timerId: NodeJS.Timeout | undefined

//export class PostListManager2 extends React.Component {
export const PostListManager2: FC<Props> = (props: Props): ReactElement => {

  // need a mapping from ordinal index of the item to the post id and then to the post

  const emptydates: social.DateNumber[] = []

  // post.id to post map
  const [posts, setPosts] = React.useState(new Map<number, social.Post>());

  // sorted list of the dates/ids of the posts in posts
  const [dates, setDates] = React.useState(emptydates);

  const [full, setFull] = React.useState(false);

  useEffect(() => {
    loadMore()
    //setTimer()
  }, [])

  const setTimer = () => {
    if (timerId === undefined && ! full) {
      let t: NodeJS.Timeout = setTimeout(() => {
        // timerId = undefined
        loadMore()
      }, 100)
      timerId = t
    }
  }

  const loadMore = () => {
    //
    //console.log("calling loadMore in ReactListTest ")
    //
    var startDate = util.getCurrentDateNumber()
    if (dates.length !== 0) {
      startDate = dates[dates.length - 1]
    }
    const top = "" + startDate
    const fold = "lists/posts/"
    const count = 6
    const old = ""

    getpostsapi.IssueTheCommand(props.username, top, fold, count, old, (postslist: social.Post[], error: any) => {
      //console.log("ReactListTest just got back from issueTheCommand ")
      if (error) {
        console.log("getpostsapi.IssueTheCommand had an error ", error)
      } else {
        // this.setState({ loading: false, postslist: postslist })

        // what we want to do is merge the new list with the existing list
        // sorted 
        //var xxnewPosts : social.Post[] = []
        // var snewPosts = new Map<number, social.Post>()

        let newPosts: Map<number, social.Post> = new Map()// shit don work: Array.from(posts.entries())  );
        posts.forEach((value: social.Post, key: number) => {
          newPosts.set(key, value)
        });
        for (var post of postslist) {
          newPosts.set(post.id, post)
        }

        var datesArray: social.DateNumber[] = []

        var theDates = newPosts.keys()
        datesArray = Array.from(theDates)
        var sortedArray: number[] = datesArray.sort((n1, n2) => n2 - n1);
        //console.log("datesArray datesArray  datesArray datesArray  datesArray datesArray  datesArray datesArray  ", sortedArray)
        if (postslist.length !== count ) {
          setFull(true)
        }
        setDates(sortedArray)
        setPosts(newPosts)
      }// else no error
      //setLoading(false)
      //loadNeedCount = 0
      timerId = undefined

    })
  }

  // if ( needsLoad ) {
  //   loadMore() 
  //   // setNeedsLoad(false)
  //   console.log(" needsload  needsload  needsload  needsload  needsload " )
  // }

  // const renderVariableHeightItem  = (index: number, key: number | string): JSX.Element => {
  //   return renderItem(index, key)
  // }

  const renderItem = (index: number, key: number | string): JSX.Element => {

    var post = cards.makeTopCard( props.username )

    if (index < dates.length) {
      const theDate = dates[index]
      post = posts.get(theDate) || post
    } else {
      post.theText = ""//  "index # " + index + " key " + key
      post.title = ""
      // need to load more
      setTimer()
    }
    var evens = classes.evens
    var odds = classes.odds
    return (

      <div
        key={key}
        className={(index % 2 ? odds : evens)}
      // style={{ lineHeight: `${getHeight(index)}px` }}
      >
        <postitem.PostItem post={post} username= {props.username} ></postitem.PostItem>
      </div>
    )
  }

  const getHeight = (i: number): number => {
    return 50

  }

  //          <h1>Accounts</h1>

  var listLength = dates.length + 1
  if ( listLength === 0 ) {
    listLength = 100
  }

  const classes = useStyles()
  return (
    // <div>

    <div className={classes.wrapper} >
      <ReactList
        itemRenderer={renderItem.bind(this)}
        length={listLength}  
        type='uniform'
      />
    </div>

    // </div>
  );

}