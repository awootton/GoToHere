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

import React, { ReactElement, FC, useEffect } from "react";
import ReactList from 'react-list';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';


import * as s from "../gotohere/knotservice/SocialTypes"
import * as postitem from "./PostItem"
import * as cards from "./CardUtil"
import * as util from "../gotohere/knotservice/Util"
import * as event from "../gotohere/api1/Event"
import * as broadcast from "../gotohere/knotservice/BroadcastDispatcher"

import * as commentsapi from "../gotohere/api1/GetComments"
import * as postsapi from "../gotohere/api1/GetPosts"
import * as savepostapi from "../gotohere/api1/SavePost"


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
  username: string
}

type IndentedRef = {
  ref: s.StringRef
  depth: number
}

type State = {
  posts: Map<number, s.Post>
  comments: Map<s.StringRef, s.Comment>
  references: IndentedRef[] // sorted newest on top
  opened: Map<s.StringRef, boolean>,
  full: boolean // hit the end of the posts
  random: string
  sequence: number
}

const emptyState: State = {

  posts: new Map(),
  comments: new Map(),
  opened: new Map(),
  references: [],
  full: false,
  random: util.randomString(16),
  sequence: 0
}

export const PostListManager2: FC<Props> = (props: Props): ReactElement => {

  // we need a mapping from ordinal index of the item to the post.id and then to the post
  const [state, setState] = React.useState(emptyState)

  const subscribeName = "postlist" + props.username + state.random

  console.log("PostListManager2 redraw", state.random)

  useEffect(() => {
    var isFull = false
   // const n = "postlist" + props.username + state.random
    postsapi.PostGetter.subscribe(subscribeName, (ready: postsapi.PostGetReply []) => {
      var newState = cloneState()
      for (var postreply of ready) {
        if ( postreply.posts.length != 6 ) {
          isFull = true
        }
        for ( var post of postreply.posts) { 
          newState.posts.set(post.id, post)
        }
      }
      if (isFull) {  
        console.log("PostGetter len != 6 ",ready.length)
        // we must have run out.  FIXME: better logic and functionality
        newState.full = true
      }
      console.log("PostGetter sets new state")
      recalculate(newState)
      setState(newState)
    })
    commentsapi.CommentGetter.subscribe(subscribeName, (ready: s.Comment[]) => {
      console.log(" timeline handleGotComments", ready)
      var newState = cloneState()
      for (var com of ready) {
        const key = s.StringRefNew(com)
        if (com.parent === undefined) {
          newState.posts.set(com.id,com) // it's a post and not a comment
        } else {
          newState.comments.set(key, com)
        }
      }
      recalculate(newState)
      setState(newState)
      console.log("CommentsGetter sets new state")
    })
    return () => {
      
      postsapi.PostGetter.unsubscribe(subscribeName)
      commentsapi.CommentGetter.unsubscribe(subscribeName)
    };
  }, [state, props.username]);

  const requestDefaultTopOfPosts = ( ) => {
    var when = s.InTenYears
    const needed: postsapi.PostNeed = {
      username: props.username,
      when: when,
      amt: 6,
    }
    postsapi.PostGetter.clearCache(subscribeName)
    postsapi.PostGetter.need(subscribeName,[needed])
  }

  const handleEvent = (event: event.EventCmd) => {
    //console.log("PostListManager2 have event", event, event.who, props.username,dates.length)
    // FIXME: optimise. Don't refresh everything.
    if (event.what.cmd === 'DeletePost' && event.who === props.username) { //event.what.cmd
      
      console.log("PostListManager2 have delete event", event, event.who, props.username)
      console.log("handleEvent DeletePost setState")
      setState(emptyState)
      requestDefaultTopOfPosts()

    } else if (event.what.cmd === 'SavePost' && event.who === props.username) { //event.what.cmd
      console.log("handleEvent PostListManager2 have SavePost event", event, event.who, props.username, state.references.length)
      console.log("SavePost setState")
      //setState(emptyState)
      requestDefaultTopOfPosts()
    } else if (event.what.cmd === 'IncrementLikes' && event.who === props.username) { //event.what.cmd
      console.log("PostListManager2 have IncrementLikes event", event, event.who, props.username, state.references.length)
      setState(emptyState)
      requestDefaultTopOfPosts()
    } else {
      // this is not really an error. The save general info broadcasts go through here.
      // console.log("ERROR PostListManager2 handleEvent unkn own event",event.what.cmd )
    }
  }

  useEffect(() => {
    //console.log("PostListManager2 subscribe folder,user,count", props.folder,props.username, dates.length)
    broadcast.Subscribe(props.username, props.username + state.random, handleEvent.bind(this))
    return () => {
      //console.log("PostListManager2 UNsubscribe folder,user,count", props.folder,props.username, dates.length)
      broadcast.Unsubscribe(props.username, props.username + state.random)
    };
  }, [state, props.username]);

  const cloneState = (): State => {
    var newState: State = {
      ...state,
      posts: clonePosts(state.posts),
      comments: cloneComments(state.comments),
      references: [],
      opened: cloneOpenedMap(state.opened),
    }
    return newState
  }

  const pushCommentRefs = (cref: s.StringRef, newState: State, depth: number) => {

    const isOpened = newState.opened.get(cref) || false
    if (isOpened) {
      // push refs for the comments, FIXME: recurse. keep track of level.
      // do we have the post? 
      const comm: s.Comment = newState.comments.get(cref) || s.emptyComment
      for (var commentRef of comm.comments) {
        const ind: IndentedRef = {
          ref: commentRef,
          depth: depth,
        }
        newState.references.push(ind)
        pushCommentRefs(commentRef, newState, depth + 1) // recurse
      }
    }
  }

  const recalculate = (newState: State) => {

    console.log("ReactListTest recalculate ")

    let newPosts = newState.posts
    // merge in the new ones
    var postids = getSortedIdsFromPosts(newPosts)

    // let's calculate references now.
    for (var id of postids) {
      const reference: s.Reference = {
        id: id,
        by: props.username
      }
      const ref: IndentedRef = {
        ref: s.StringRefNew(reference),
        depth: 0
      }
      newState.references.push(ref)

      const isOpened = newState.opened.get(ref.ref) || false
      if (isOpened) {
        // push refs for the comments, recurse. keep track of level.
        const post: s.Post = newPosts.get(id) || s.emptyPost
        for (var commentRef of post.comments) {
          const indented: IndentedRef = {
            ref: commentRef,
            depth: 1
          }
          newState.references.push(indented)
          pushCommentRefs(commentRef, newState, 2)
        }
      }
    }
  }

  const toggleOpened = (ref: s.StringRef) => {
    console.log("renderItem 2 toggleOpened set state")
    const open: boolean = state.opened.get(ref) || false
    var newState = cloneState()
    newState.opened.set(ref, !open)
    recalculate(newState)
    setState(newState)
  }

  const renderItem = (index: number, key: number | string): JSX.Element => {

    var post = cards.makeTopCard(props.username)
    var depth = 0
    var isOpen = false
    if (index < state.references.length) {
      const indented = state.references[index]
      depth = indented.depth
      const reference = s.ReferenceFromStr(indented.ref)
      if (reference.by === props.username) {
        post = state.posts.get(reference.id) || post
      } else {
        post = state.comments.get(indented.ref) || post
        if (state.comments.get(indented.ref) === undefined) {
          post.theText = "Loading comment by " + reference.by + ". Who might be offline."
          commentsapi.CommentGetter.need(subscribeName, [s.ReferenceFromStr(indented.ref)])
        }
      }
      const got = state.opened.get(indented.ref)
      if (got !== undefined) {
        isOpen = got
      }
    } else {
      // off the end
      post.theText = ""  //  "index # " + index + " key " + key
      post.title = ""
      post.id = 0

      var when = s.InTenYears
      if (state.references.length > 0) {
        when = s.ReferenceFromStr(state.references[state.references.length - 1].ref).id
      }
      const need: postsapi.PostNeed = {
        username: props.username,
        when: when,
        amt: 6,
        //trackingId: "dummyTracker"
      }
      if ( !state.full ){
        const isNew = postsapi.PostGetter.need(subscribeName, [need])
        if (isNew) {
          console.log("postsapi.PostGetter.need", need)
        }
      }
    }

    var evens = classes.evens
    var odds = classes.odds
    return (

      <div
        key={key}
        className={(index % 2 ? odds : evens)}
      >
        <postitem.PostItem
          post={post}
          username={props.username}
          commentsOpen={isOpen}
          parentOpen={false}
          toggleOpened={toggleOpened}
          toggleParent={() => { }}
          depth={depth}
          why={""}
        ></postitem.PostItem>
      </div>
    )
  }

  var listLength = state.references.length + 1
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

const getSortedIdsFromPosts = (somePosts: Map<number, s.Post>): s.DateNumber[] => {
  var theDates = somePosts.keys()
  var datesArray = Array.from(theDates)
  var sortedArray: number[] = datesArray.sort((n1, n2) => n2 - n1);
  return sortedArray
}

const clonePosts = (somePosts: Map<number, s.Post>): Map<number, s.Post> => {
  let newPosts: Map<number, s.Post> = new Map()// shit don work: Array.from(posts.entries())  );
  somePosts.forEach((value: s.Post, key: number) => {
    newPosts.set(key, value)
  });
  return newPosts
}

const cloneOpenedMap = (oldmap: Map<s.StringRef, boolean>): Map<s.StringRef, boolean> => {
  let newmap: Map<s.StringRef, boolean> = new Map()// shit don work: Array.from(posts.entries())  );
  oldmap.forEach((value: boolean, key: s.StringRef) => {
    newmap.set(key, value)
  });
  return newmap
}

const cloneComments = (someComments: Map<string, s.Comment>): Map<string, s.Comment> => {
  let newPosts: Map<string, s.Comment> = new Map()// shit don work: Array.from(posts.entries())  );
  someComments.forEach((value: s.Comment, key: string) => {
    newPosts.set("" + key, value)
  });
  return newPosts
}
