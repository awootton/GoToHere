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
  //folder: string;
  username: string
}

type IndentedRef =   {
  ref : s.StringRef
  depth: number
}

type State = {
  posts: Map<number, s.Post>
  comments: Map<s.StringRef, s.Comment>
  references: IndentedRef[] // sorted newest on top
  opened: Map<s.StringRef, boolean>,

  needsMore: boolean
  //needsMoreComments:boolean
  full: boolean
 // pending: boolean
  // lastDate: social.DateNumber
  random: string
  sequence: number
}

const emptyState: State = {

  posts: new Map(),
  comments: new Map(),
  opened: new Map(),
  references: [],

  needsMore: true,
 // needsMoreComments: true,
  full: false,
 // pending: false,
 // lastDate: 0,
  random: util.randomString(16),
  sequence: 0
}

type AuxState = {
  
  // postspending:boolean
  // commentspending:boolean

  // postsNeeded: boolean //social.DateNumber[]
  // commentsNeeded: Set<s.StringRef>

  // when: number // in milliseconds so we can clean them up later
  // timerId: NodeJS.Timeout | undefined
}

// const emptyAux: AuxState = {
//   postspending: false,
//   commentspending: false,
   
//   postsNeeded : false,
//   commentsNeeded: new Set(),
//   when: util.getMilliseconds(),
//   timerId: undefined
// }

var auxMap: Map<string, AuxState> = new Map()

export const PostListManager2: FC<Props> = (props: Props): ReactElement => {

  // need a mapping from ordinal index of the item to the post.id and then to the post

  const [state, setState] = React.useState(emptyState)

  // const tmpaux: AuxState | undefined = auxMap.get(state.random)
  // if (tmpaux === undefined) {
  //   const newaux: AuxState = {
  //     ...emptyAux,
  //     when: util.getMilliseconds(),
  //   }
  //   auxMap.set(state.random, newaux)
  // }
  // var auxState: AuxState = auxMap.get(state.random) || emptyAux

  console.log("PostListManager2 redraw", state.random)

  useEffect(() => {
    const n = "postlist" + props.username + state.random
    postsapi.PostGetter.subscribe(n, (ready: s.Post[])=>{
      var newState = cloneState()
      for (var post of ready) {
        newState.posts.set(post.id,post)
      }
      if (ready.length !== 10) { // 10 is  the amt in in teh Need type
        // we must have run out. 
        newState.full = true
      }
      // sort them?
      console.log("PostGetter sets new state")
      recalculate(newState)  
      setState(newState)
    })
    commentsapi.CommentGetter.subscribe(n,  (ready: s.Comment[]) => {
      console.log(" timeline handleGotComments", ready)
      var newState = cloneState()
      for (var com of ready) {
        const key = s.StringRefNew(com)
        newState.comments.set(key, com)
      }
      recalculate(newState)
      setState(newState)
      console.log("CommentsGetter sets new state")
    })
    return () => {
      const n = "timeline" + props.username + state.random
      postsapi.PostGetter.unsubscribe(n)
      commentsapi.CommentGetter.unsubscribe(n)
    };
  }, [state,props.username]);



  const handleEvent = (event: event.EventCmd) => {
    //console.log("PostListManager2 have event", event, event.who, props.username,dates.length)
    // FIXME: optimise. Don't refresh everything.
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
      console.log("handleEvent DeletePost setState")
      setState(emptyState)

    } else if (event.what.cmd === 'SavePost' && event.who === props.username) { //event.what.cmd
      console.log("handleEvent PostListManager2 have SavePost event", event, event.who, props.username, state.references.length)
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
      console.log("PostListManager2 have IncrementLikes event", event, event.who, props.username, state.references.length)
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

  useEffect(() => {
    //console.log("PostListManager2 subscribe folder,user,count", props.folder,props.username, dates.length)
    broadcast.Subscribe(props.username, props.username + state.random, handleEvent.bind(this))
    return () => {
      //console.log("PostListManager2 UNsubscribe folder,user,count", props.folder,props.username, dates.length)
      broadcast.Unsubscribe(props.username, props.username + state.random)
    };
  }, [state,props.username]);

  // const setTimer = () => {
  //   if (timerId === undefined && ! full) {
  //     let t: NodeJS.Timeout = setTimeout(() => {
  //       // timerId = undefined
  //       loadMore()
  //     }, 100)
  //     timerId = t
  //   }
  // }

  // we would like to only call this once and never until after it's done.
  // const XXXXXloadMore = (aStart?: s.DateNumber, howMany?: number) => {

  //   if (state.needsMore === false || auxState.postspending) { // this is shit. TODO: sort it out.
  //     return
  //   }
  //   auxState.postspending = true
  //   var startDate = util.getCurrentDateNumber()
  //   if (state.references.length !== 0) {
  //     const r = s.ReferenceFromStr(state.references[state.references.length - 1].ref)
  //     startDate = r.id
  //   }
  //   startDate = aStart || startDate

  //   // if (startDate === state.lastDate) {
  //   //   return
  //   // }
  //   // var newState: State = {
  //   //   ...state,
  //   //   pending: true,
  //   //   lastDate: startDate
  //   // }
  //   //console.log("loadMore top setState")
  //   //setState(newState)

  //   auxState.postspending = true

  //   const top = "" + startDate
  //  // const fold = props.folder // eg. "lists/posts/"
  //   const count = howMany || 6
  //   const old = ""

  //   console.log("calling loadMore in PostListManager2 dates,startdate ", state.references.length, startDate, util.getSecondsDisplay())

  //   postsapi.IssueTheCommand(props.username, top, count, gotMorePosts.bind(this))
  // }

  // const XXXXgotMoreComments = ( comments: s.Comment[], error: any) => {

  //   console.log("gotMoreComments top setState", comments, "error=",error)

  //   // put them in the state
  //   for ( const com of comments){
  //     state.comments.set(s.StringRefNew(com),com)
  //   }

  //   if ( ! error ) { // fixme. this races and this is not the way to fix it.
  //     auxState.commentspending = false
  //   }
    
  //   const newState : State = {
  //     ...state,
  //     sequence : state.sequence + 1
  //   }
  //   setState(newState) // refresh
  // }


  // const XXXloadMoreComments = () => {

  //   if ( auxState.commentsNeeded.size === 0 ){
  //     return 
  //   }
  //   if (auxState.commentspending) {
  //     return 
  //   }
  //   auxState.commentspending = true
  //   console.log("loadMoreComments top setState")

  //   var needList : s.Reference[] = []

  //   auxState.commentsNeeded.forEach( strref => {
  //     needList.push(s.ReferenceFromStr(strref))
  //   });
  //   for ( const ref of needList){
  //     auxState.commentsNeeded.delete( s.StringRefNew(ref))
  //   }
  //   console.log("loading comments !!!  ",needList)
  //   if ( needList.length > 0 ) {
  //     commentsapi.IssueTheCommand( needList , XXXXgotMoreComments.bind(this))
  //   } else {
  //     // unreachable
  //     // auxState.commentspending = false
  //     // const newState : State = {
  //     //   ...state,
  //     //   needsMoreComments : false
  //     // }
  //     // setState(newState)
  //   }
  //}

  //const loadMoreCallback = useCallback(() => { loadMore() }, [])

//   useEffect(() => {

//   if (  auxState.postspending===false && auxState.postsNeeded && !state.full){
//     console.log("PostListManager2 aux loadmore ")
//     loadMore()
//   }

//   if ( auxState.commentsNeeded.size > 0 && auxState.commentspending === false){
//     console.log("PostListManager2 aux loadMoreComments ")
//     loadMoreComments()
//   }

// } ) // always

  // call load more as necessary
  // useEffect(() => {
  //   //console.log("PostListManager2 will loadMore, needsMore=", needsMore)
  //   if (state.needsMore) {
  //     loadMore()
  //   }
  //   //setTimer()
  //   // listen for events that may affect us.

  // }, [state.needsMore])

  const cloneState = ( )  : State => {
    var newState: State = {
      ...state,
      posts:clonePosts(state.posts),
      comments: cloneComments(state.comments),
      references: [],
      opened:  cloneOpenedMap(state.opened),
    }
    return newState
  }

  // const XXXgotMorePosts = (postslist: s.Post[], countRequested: number, error: any) => {

  //   console.log("ReactListTest gotMorePosts just got back from issueTheCommand ")
  //   auxState.postsNeeded = false
  //   auxState.postspending = false

  //   var newState2: State = cloneState()
  //   newState2.needsMore= false
  
  //   if (error) {
  //     console.log("getpostsapi.IssueTheCommand had an error ", error)
  //   } else {


  //   recalculate(newState2)
  //   setState(newState2)


  //     // let newPosts = clonePosts(newState2.posts)
  //     // // merge in the new ones
  //     // for (var post of postslist) {
  //     //   newPosts.set(post.id, post)
  //     // }
  //     // var postids = getSortedIdsFromPosts(newPosts)

  //     // if (postslist.length !== countRequested) {
  //     //   newState2.full = true
  //     // }

  //     // // let's calculate references now.
  //     // var refs: IndentedRef[] = []
  //     // for (var id of postids) {
  //     //   const reference: s.Reference = {
  //     //     id: id,
  //     //     by: props.username
  //     //   }
  //     //   const indentedRef : IndentedRef = {
  //     //     ref : s.StringRefNew(reference),
  //     //     depth : 0
  //     //   }
  //     //   refs.push(indentedRef)

  //     //   checkComments(ref)

  //       // const isOpened = state.opened.get(ref) || false
  //       // if (isOpened) {
  //       //   // push refs for the comments, FIXME: recurse. keep track of level.
  //       //   // do we have the post? 
  //       //   const post: s.Post = newPosts.get(id) || s.emptyPost
  //       //   for (var commentRef of post.comments) {
  //       //     refs.push(commentRef)
  //       //     // check for if they are loaded and clicked open
  //       //   }
  //       // }
  //     //}
  //   //  newState2.references = refs
  //   //  newState2.posts = newPosts

  //   }// else no error
  //   //console.log("loadMore bottom setState")
  //   auxState.postspending = false
  //   setState(newState2)
  // }

  const pushCommentRefs = ( cref: s.StringRef ,  newState: State, depth: number) => {

    const isOpened = newState.opened.get(cref) || false
      if (isOpened) {
        // push refs for the comments, FIXME: recurse. keep track of level.
        // do we have the post? 
        const comm: s.Comment = newState.comments.get(cref) || s.emptyComment
        for (var commentRef of comm.comments) {
          const ind : IndentedRef = {
            ref : commentRef,
            depth : depth,
          } 
          newState.references.push(ind)
          pushCommentRefs (commentRef, newState, depth + 1 ) // recurse
        }
      }
  }
 
  const recalculate = ( newState: State ) => {

    console.log("ReactListTest recalculate ")

    let newPosts = newState.posts
    // merge in the new ones
    var postids = getSortedIdsFromPosts(newPosts)

    // let's calculate references now.
   // var refs: s.StringRef[] = []
    for (var id of postids) {
      const reference: s.Reference = {
        id: id,
        by: props.username
      }
      const ref : IndentedRef = {
        ref: s.StringRefNew(reference),
        depth : 0
      }
      newState.references.push(ref)

      const isOpened = newState.opened.get(ref.ref) || false
      if (isOpened) {
        // push refs for the comments, FIXME: recurse. keep track of level.
        // do we have the post? 
        const post: s.Post = newPosts.get(id) || s.emptyPost
        for (var commentRef of post.comments) {
          const indented : IndentedRef = {
            ref:  commentRef ,
            depth : 1
          }
          newState.references.push(indented)
          pushCommentRefs (commentRef, newState , 2) 
        }
      }
    }
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

  // this is called from renderItem which is when the eract-list is udating.
  // and that makes react mad. So, a timer
  // const setNeedsMore2 = () => {
  //   {
  //     // setInterval( () => {
  //     var newState: State = {
  //       ...state,
  //       needsMore: true,
  //     }
  //     console.log("renderItem 2 setNeedsMore2 setState")
  //     setState(newState)
  //     //   },100)
  //   }
  // }

  // const setNeedsMore3 = () => {
  //   {
  //     // setInterval( () => {
  //     var newState: State = {
  //       ...state,
  //       needsMore: true,
  //     }
  //     console.log("renderItem 3 setNeedsMore2 setState")
  //     setState(newState)
  //     //   },100)
  //   }
  // }

  // const setNeedsMoreComments = () => {
  //   if (auxState.commentspending === false) {
  //     // setInterval( () => {
  //     var newState: State = {
  //       ...state,
  //       needsMore: true,
  //     }
  //     console.log("renderItem setNeedsMoreComments setState")
  //     setState(newState)
  //     //   },100)
  //   }
  // }

  const toggleOpened = (ref: s.StringRef) => {
    console.log("renderItem 2 toggleOpened set state")
    const open: boolean = state.opened.get(ref) || false
    var newState = cloneState()
    newState.opened.set(ref,!open)
    recalculate(newState)
    setState(newState)
  }

  const renderItem = (index: number, key: number | string): JSX.Element => {

    var post = cards.makeTopCard(props.username)
    //var isComment: number = 0
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
        //isComment = 1
        if (state.comments.get(indented.ref) === undefined) {
          //auxState.commentsNeeded.add(indented.ref)
          post.theText = "Loading comment by " + reference.by + ". Who might be offline."
          //setNeedsMoreComments()
          const n = "postlist" + props.username + state.random
          commentsapi.CommentGetter.need(n, [  s.ReferenceFromStr(indented.ref) ] )
        }
      }
      const got = state.opened.get(indented.ref)
      if ( got !== undefined){
        isOpen = got
      }
    } else {
      // off the end
      post.theText = ""  //  "index # " + index + " key " + key
      post.title = ""
      post.id = 0

      var when = s.InTenYears
      if ( state.references.length > 0 ) {
        when = s.ReferenceFromStr(state.references[state.references.length-1].ref).id
      }
      // can we suppress the menu?
      // need to load more
      //setTimer()
      //aux.changed = true
      //auxState.postsNeeded = true
      // need to trigger 
      //if (!state.full && !state.needsMore) {
      //  setNeedsMore3()
      //
      const n = "postlist" + props.username + state.random
      const need : postsapi.PostNeed = {
        username : props.username,
        when: when,
        amt: 6
      }
      postsapi.PostGetter.need(n,  [ need ] )
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
            toggleParent={()=>{}} 
            depth = {depth}
            why = {""}
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

const cloneComments = ( someComments: Map<string, s.Comment>): Map<string, s.Comment> => {
  let newPosts: Map<string, s.Comment> = new Map()// shit don work: Array.from(posts.entries())  );
  someComments.forEach((value: s.Comment, key: string) => {
    newPosts.set( "" + key, value)
  });
  return newPosts
}
