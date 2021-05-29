
import React, { ReactElement, FC, useEffect,useCallback } from "react";
import ReactList from 'react-list';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import * as getpostsapi from "../api1/GetPosts"

import * as social from "../server/SocialTypes"
import * as postitem from "./PostItem"
import * as cards from "./CardUtil"
import * as util from "../server/Util"
import * as event from "../api1/Event"
import * as broadcast from "../server/BroadcastDispatcher"

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
      //backgroundColor: 'lightgrey',
    },
  })
);

type Props = {
  message: string;
  folder: string;
  username: string
}

type State = {
  posts: Map<number, social.Post>
  dates: social.DateNumber[] // sorted newest on top
  needsMore: boolean
  full: boolean
  pending: boolean
  lastDate: social.DateNumber
}

const emptyState: State = {
  posts: new Map<number, social.Post>(),
  dates: [],
  needsMore: true,
  full: false,
  pending: false,
  lastDate: 0
}

export const PostListManager2: FC<Props> = (props: Props): ReactElement => {

  // need a mapping from ordinal index of the item to the post.id and then to the post

  const [state, setState] = React.useState(emptyState)

  const handleEvent = (event: event.EventCmd) => {
    //console.log("PostListManager2 have event", event, event.who, props.username,dates.length)
    if (event.what.cmd === 'DeletePost' && event.who === props.username) { //event.what.cmd
      console.log("PostListManager2 have delete event", event, event.who, props.username)
      // delete it directly
      // const deleteCmd : deletepostapi.DeletePostCmd = event.what as deletepostapi.DeletePostCmd
      // var newPosts = clonePosts(state.posts)
      // newPosts.delete(deleteCmd.id)
      //var newDates = getDates(newPosts)
      //setDates(newDates)
      //setPosts(newPosts)
      // setDates([]) // FIXME: a cop out and ugly
      // setPosts(new Map())// FIXME: a cop out and ugly
      // loadMore(util.getCurrentDateNumber())// FIXME: a cop out and ugly
      console.log("DeletePost setState")
      setState(emptyState)

    } else if (event.what.cmd === 'SavePost' && event.who === props.username) { //event.what.cmd
      console.log("PostListManager2 have SavePost event", event, event.who, props.username, state.dates.length)
      //const saveCmd : savepostapi.SavePostCmd = event.what as savepostapi.SavePostCmd
      //loadMore(ssaveCmd util.getCurrentDateNumber())
      // don't load - we have it
      // var newPosts = clonePosts(posts)
      // newPosts.set(saveCmd.post.id, saveCmd.post)
      // var newDates = getDates(newPosts)
      // dates.push(saveCmd.post.id)
      // var sortedArray: number[] = dates.sort((n1, n2) => n2 - n1);
      // posts.set(saveCmd.post.id, saveCmd.post)
      // setDates(newDates)
      // setPosts(newPosts)
      // setDates([]) // FIXME: a cop out and ugly
      // setPosts(new Map())// FIXME: a cop out and ugly
      //loadMore(util.getCurrentDateNumber(),1)// FIXME: a cop out and ugly
      console.log("SavePost setState")
      setState(emptyState)
    } else if (event.what.cmd === 'IncrementLikes' && event.who === props.username) { //event.what.cmd
      console.log("PostListManager2 have SavePost event", event, event.who, props.username, state.dates.length)
      setState(emptyState)
    } else {
      // this is not really an error. The save general info broadcasts go through here.
      //console.log("ERROR PostListManager2 handleEvent unkn own event",event.what.cmd )
    }
  }

  // const subscribeEffect = () => {
  //   //console.log("PostListManager2 subscribe folder,user,count", props.folder,props.username, dates.length)
  //   broadcast.Subscribe(props.username, props.folder + props.username, handleEvent.bind(this))
  //   return () => {
  //     //console.log("PostListManager2 UNsubscribe folder,user,count", props.folder,props.username, dates.length)
  //     broadcast.Unsubscribe(props.username, props.folder + props.username)
  //   };
  // }

  //console.log("PostListManager2 rendering len = ", state.dates.length, util.getSecondsDisplay())

  //useEffect(subscribeEffect.bind(this), [state]);
  useEffect(() => {
    //console.log("PostListManager2 subscribe folder,user,count", props.folder,props.username, dates.length)
    broadcast.Subscribe(props.username, props.folder + props.username, handleEvent.bind(this))
    return () => {
      //console.log("PostListManager2 UNsubscribe folder,user,count", props.folder,props.username, dates.length)
      broadcast.Unsubscribe(props.username, props.folder + props.username)
    };
  }, [state]);

  // const setTimer = () => {
  //   if (timerId === undefined && ! full) {
  //     let t: NodeJS.Timeout = setTimeout(() => {
  //       // timerId = undefined
  //       loadMore()
  //     }, 100)
  //     timerId = t
  //   }
  // }

  //  useCallback(debounce( loadMore ,1000),[])

  // we would like to only call this once and never until after it's done.
  const loadMore = (aStart?: social.DateNumber, howMany?: number) => {

    if (state.needsMore === false || state.pending === true) {
      return
    }
    var startDate = util.getCurrentDateNumber()
    if (state.dates.length !== 0) {
      startDate = state.dates[state.dates.length - 1]
    }
    startDate = aStart || startDate

    if (startDate === state.lastDate) {
      return
    }
    var newState: State = {
      ...state,
      pending: true,
      lastDate: startDate
    }

    console.log("loadMore top setState")
    setState(newState)

    const top = "" + startDate
    const fold = props.folder // eg. "lists/posts/"
    const count = howMany || 6
    const old = ""

    console.log("calling loadMore in PostListManager2 dates,startdate ", state.dates.length, startDate, util.getSecondsDisplay())

    getpostsapi.IssueTheCommand(props.username, top, fold, count, old, gotMorePosts.bind(this))
  }

  const loadMoreCallback = useCallback( () => {loadMore()} , [])

  // call load more as necessary
  useEffect(() => {
    //console.log("PostListManager2 will loadMore, needsMore=", needsMore)
    if (state.needsMore) {
      loadMore()
    }
    //setTimer()
    // listen for events that may affect us.

  }, [state.needsMore])


  const gotMorePosts = (postslist: social.Post[], countRequested: number, error: any) => {

    // console.log("ReactListTest just got back from issueTheCommand ")

    var newState2: State = {
      ...state,
      pending: false,
      needsMore: false
    }
    if (error) {
      console.log("getpostsapi.IssueTheCommand had an error ", error)
    } else {

      let newPosts = clonePosts(newState2.posts)
      // merge in the new ones
      for (var post of postslist) {
        newPosts.set(post.id, post)
      }
      var newDates = getDates(newPosts)

      if (postslist.length !== countRequested) {
        newState2.full = true
      }
      newState2.dates = newDates
      newState2.posts = newPosts

    }// else no error
    //console.log("loadMore bottom setState")
    setState(newState2)
  }

  //const loadMoreDebounced = useCallback(debounce( loadMore ,1000),[needsMore])

  // const loadMoreDebounced = useCallback(
  //   () => {
  //     loadMore();
  //   },
  //   [],
  // );

  // if ( needsLoad ) {
  //   loadMore() 
  //   // setNeedsLoad(false)
  //   console.log(" needsload  needsload  needsload  needsload  needsload " )
  // }

  // const renderVariableHeightItem  = (index: number, key: number | string): JSX.Element => {
  //   return renderItem(index, key)
  // }


  var localNeedsTest = false

  // const setNeedsMore = useCallback(() => { 
  //  if (state.needsMore === false && localNeedsTest === false){
  //   var newState:State = {
  //     ...state,
  //     needsMore :true,
  //   }
  //   console.log("renderItem setState")
  //   localNeedsTest = true
  //   setState(newState) 
  //   }
  // },[])

  const setNeedsMore2 =  () => { 
    if (localNeedsTest === false ){
     var newState:State = {
       ...state,
       needsMore :true,
     }
     console.log("renderItem 2 setState")
     localNeedsTest = true
     setState(newState) 
     }
   }
 
  const renderItem = (index: number, key: number | string): JSX.Element => {

    var post = cards.makeTopCard(props.username)

    if (index < state.dates.length) {
      const theDate = state.dates[index]
      post = state.posts.get(theDate) || post
    } else {
      post.theText = ""//  "index # " + index + " key " + key
      post.title = ""
      post.id = 0
      // can we suppress the menu?
      // need to load more
      //setTimer()
      if (!state.full && !state.needsMore) {
        setNeedsMore2()
      }
    }
    var evens = classes.evens
    var odds = classes.odds
    return (

      <div
        key={key}
        className={(index % 2 ? odds : evens)}
      >
        <postitem.PostItem post={post} username={props.username} ></postitem.PostItem>
      </div>
    )
  }

  var listLength = state.dates.length + 1
  if (listLength === 0) {
    listLength = 100
  }

  const classes = useStyles()
  var dom = (
    <div className={classes.wrapper} >
      <ReactList
        itemRenderer={renderItem.bind(this)}
        length={listLength}
        type='uniform'
      />
    </div>
  );
  return dom

}

const getDates = (somePosts: Map<number, social.Post>): social.DateNumber[] => {
  var theDates = somePosts.keys()
  var datesArray = Array.from(theDates)
  var sortedArray: number[] = datesArray.sort((n1, n2) => n2 - n1);
  return sortedArray
}

const clonePosts = (somePosts: Map<number, social.Post>): Map<number, social.Post> => {
  let newPosts: Map<number, social.Post> = new Map()// shit don work: Array.from(posts.entries())  );
  somePosts.forEach((value: social.Post, key: number) => {
    newPosts.set(key, value)
  });
  return newPosts
}
