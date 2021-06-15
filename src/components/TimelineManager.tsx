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
import * as timeapi from "../gotohere/api1/GetTimeline"

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
  username: string // when this is alice we show alice timeline. 
}

interface IndentedItem extends s.TimelineItem {
  depth: number
}

type State = {
  pomments: Map<s.StringRef, s.Comment> // comments and posts 
  timeItems: s.TimelineItem[] // sorted newest on top, from the api

  references: IndentedItem[] // this one has opened comments

  opened: Map<s.StringRef, boolean>,
  parentOpened: Map<s.StringRef, boolean>,
  random: string
  sequence: number
  full: boolean
}
const emptyState: State = {
  pomments: new Map(),
  opened: new Map(),
  parentOpened: new Map(),
  references: [],
  timeItems: [],
  random: util.randomString(16),
  sequence: 0,
  full: false
}
export const TimelineManager: FC<Props> = (props: Props): ReactElement => {

  const [state, setState] = React.useState(emptyState)

  console.log("TimelineManager redraw", state.random)
  const n = "timeline" + props.username + state.random

  // const handleGotTimes = (ready: s.TimelineItem[]) => {
  //   var newState = cloneState(state)
  //   for (var tli of ready) {
  //     newState.timeItems.push(tli)
  //   }
  //   if (ready.length !== 10) { // 10 is  the amt in in teh Need type
  //     // we must have run out. 
  //     newState.full = true
  //   }
  //   // sort them?
  //   recalculate(newState)
  //   setState(newState)
  // }

  // const handleGotComments = (ready: s.Comment[]) => {
  //   console.log(" timeline handleGotComments", ready)
  //   var newState = cloneState(state)
  //   for (var com of ready) {
  //     const key = s.StringRefNew(com)
  //     newState.pomments.set(key, com)
  //   }
  //   recalculate(newState)
  //   setState(newState)
  // }

  useEffect(() => {
    const n = "timeline" + props.username + state.random
    timeapi.TimelineGetter.subscribe(n, (ready: s.TimelineItem[])=>{
      var newState = cloneState(state)
      for (var tli of ready) {
        newState.timeItems.push(tli)
      }
      if (ready.length !== 10) { // 10 is  the amt in in teh Need type
        // we must have run out. 
        newState.full = true
      }
      // sort them?
      recalculate(newState)  
      setState(newState)
    })
    commentsapi.CommentGetter.subscribe(n,  (ready: s.Comment[]) => {
      console.log(" timeline handleGotComments", ready)
      var newState = cloneState(state)
      for (var com of ready) {
        const key = s.StringRefNew(com)
        newState.pomments.set(key, com)
      }
      recalculate(newState)
      setState(newState)
    })
    return () => {
      const n = "timeline" + props.username + state.random
      timeapi.TimelineGetter.unsubscribe(n)
      commentsapi.CommentGetter.unsubscribe(n)
    };
  }, [state,props.username]);


  // without this notifications of changes isn't working. 
  const handleEvent = (event: event.EventCmd) => {
    // see the version in postlistmgr for hints
    // FIXME: atw 
  }

  useEffect(() => {
    //console.log("TimelineManager subscribe folder,user,count", props.folder,props.username, dates.length)
    broadcast.Subscribe(props.username, "timeline" + props.username + state.random, handleEvent.bind(this))
    return () => {
      //console.log("TimelineManager UNsubscribe folder,user,count", props.folder,props.username, dates.length)
      broadcast.Unsubscribe(props.username, "timeline" + props.username + state.random)
    };
  }, [state,props.username]);

  // const addCommentChildren = (newState: State, tli: s.Reference, depth: number) => {
  //   const ref = s.StringRefNew(tli)
  //   const post = newState.pomments.get(ref)
  //   if (post !== undefined) {
  //     if (post.comments.length > 0) {
  //       const opened = newState.opened.get(ref)
  //       if (opened) {
  //         for (const child of post.comments) {
  //           const childref = s.ReferenceFromStr(child)
  //           const tli: IndentedItem = {
  //             ...childref,
  //             why: "",
  //             depth: depth
  //           }
  //           newState.references.push(tli)
  //           addCommentChildren(newState, s.ReferenceFromStr(child), depth + 1)
  //         }
  //       }
  //     }
  //   }
  // }

  // const addCommentParent = (newState: State, tli: s.Reference, depth: number): number => {
  //   var finalDepth = depth
  //   const ref = s.StringRefNew(tli)
  //   const post = newState.pomments.get(ref)
  //   if (post !== undefined) {
  //     if (post.parent !== undefined) {
  //       const opened = newState.parentOpened.get(ref)
  //       if (opened) {
  //         var d = addCommentParent(newState, s.ReferenceFromStr(post.parent), depth + 1)
  //         finalDepth += d
  //         // now we can add ourselves to the list

  //         const parentref = s.ReferenceFromStr(post.parent)
  //         const tli: IndentedItem = {
  //           ...parentref,
  //           why: "",
  //           depth: depth
  //         }
  //         newState.references.push(tli)
  //       }
  //     }
  //   }
  //   return finalDepth
  // }

  // const recalculate = (newState: State) => {

  //   console.log("ReactListTest recalculate ")

  //   var sortedArray: s.TimelineItem[] = newState.timeItems.sort((n1, n2) => (n2.id > n1.id) ? 1 : ((n2.id === n1.id) ? 0 : -1));
  //   var prev: s.TimelineItem = {
  //     id: 0,
  //     by: "",
  //     why: ""
  //   }
  //   var deduped: s.TimelineItem[] = []
  //   for (const tli of sortedArray) {
  //     if (tli !== prev) {
  //       deduped.push(tli)
  //     }
  //     prev = tli
  //   }
  //   newState.timeItems = deduped

  //   var references: IndentedItem[] = []
  //   newState.references = references
  //   for (const tli of newState.timeItems) {
  //     var parentDepth = addCommentParent(newState, tli, 0)
  //     // check for parents
  //     const indented: IndentedItem = {
  //       ...tli,
  //       depth: 0 + parentDepth
  //     }
  //     references.push(indented)
  //     addCommentChildren(newState, tli, 1 + parentDepth)
  //   }
  //   setState(newState)
  // }

  const toggleOpened = (ref: s.StringRef) => {
    var newState: State = cloneState(state)
    //console.log("renderItem timeline toggleOpened")
    const open: boolean = newState.opened.get(ref) || false
    newState.opened.set(ref, !open)
    recalculate(newState)
    setState(newState)
  }

  const toggleParent = (ref: s.StringRef) => {
    var newState: State = cloneState(state)
    //console.log("renderItem timeline toggleParent")
    const open: boolean = newState.parentOpened.get(ref) || false
    newState.parentOpened.set(ref, !open)
    recalculate(newState)
    setState(newState)
  }


  const renderItem = (index: number, key: number | string): JSX.Element => {

    var isOpen = false
    var depth = 0
    var why = ""
    if (index < state.references.length) {
      const indentedTli = state.references[index]
      depth = indentedTli.depth
      why = indentedTli.why
      var post = state.pomments.get(s.StringRefNew(indentedTli))
      if (post === undefined) {
        post = cards.makeTopCard(props.username)
        post.theText = "Loading:" + indentedTli.why + ". Who might be offline." + indentedTli.id + " by " + indentedTli.by
        const isNew = commentsapi.CommentGetter.need(n, [indentedTli])
        if (isNew) {
          console.log("Need new comment loaded", indentedTli)
        }
      }
      const got = state.opened.get(s.StringRefNew(indentedTli))
      isOpen = got || isOpen
    } else { // off the end , order more tli 
      var when: number = 0
      const tlilen = state.timeItems.length
      if (tlilen > 0) {
        when = state.timeItems[state.timeItems.length - 1].id // last one is smallest date
      } else {
        when = s.InTenYears
      }
      const tln: timeapi.TimelineNeed = {
        when: when,
        username: props.username,
        amt: 10
      }
      if (state.full === false) {
        const isNew = timeapi.TimelineGetter.need("timeline" + props.username + state.random, [tln])
        if (isNew) {
          console.log("Need new timeline loaded", tln)
        }
      }
      post = cards.makeTopCard(props.username)
      post.title = ""
      post.id = 0
    }
    var evens = classes.evens
    var odds = classes.odds
    return (
      <div
        key={key}
        className={(index % 2 ? odds : evens)}
      >
        <postitem.PostItem post={post}
          username={props.username}
          commentsOpen={isOpen}
          parentOpen={isOpen}
          toggleOpened={toggleOpened}
          toggleParent={toggleParent}
          depth={depth}
          why={why} ></postitem.PostItem>
      </div>
    )
  }

  var listLength = state.references.length
  if (listLength === 0) {
    listLength = 100
  }
  if (!state.full) {
    listLength += 1
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

const clonePosts = (somePosts: Map<s.StringRef, s.Comment>): Map<s.StringRef, s.Comment> => {
  let newPosts: Map<s.StringRef, s.Comment> = new Map()// shit don work: Array.from(posts.entries())  );
  somePosts.forEach((value: s.Post, key: s.StringRef) => {
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

function cloneState(state: State): State {
  // do we have to do this. can I make a new state with the old maps?
  var newState: State = {
    pomments: clonePosts(state.pomments),
    timeItems: Array.from(state.timeItems),
    references: Array.from(state.references), // we could skip this one

    opened: cloneOpenedMap(state.opened),
    parentOpened: cloneOpenedMap(state.parentOpened),

    random: state.random,
    sequence: state.sequence,
    full: state.full
  }
  return newState
}


function addCommentParent (newState: State, tli: s.Reference, depth: number): number   {
  var finalDepth = depth
  const ref = s.StringRefNew(tli)
  const post = newState.pomments.get(ref)
  if (post !== undefined) {
    if (post.parent !== undefined) {
      const opened = newState.parentOpened.get(ref)
      if (opened) {
        var d = addCommentParent(newState, s.ReferenceFromStr(post.parent), depth + 1)
        finalDepth += d
        // now we can add ourselves to the list

        const parentref = s.ReferenceFromStr(post.parent)
        const tli: IndentedItem = {
          ...parentref,
          why: "",
          depth: depth
        }
        newState.references.push(tli)
      }
    }
  }
  return finalDepth
}

const addCommentChildren = (newState: State, tli: s.Reference, depth: number) => {
  const ref = s.StringRefNew(tli)
  const post = newState.pomments.get(ref)
  if (post !== undefined) {
    if (post.comments.length > 0) {
      const opened = newState.opened.get(ref)
      if (opened) {
        for (const child of post.comments) {
          const childref = s.ReferenceFromStr(child)
          const tli: IndentedItem = {
            ...childref,
            why: "",
            depth: depth
          }
          newState.references.push(tli)
          addCommentChildren(newState, s.ReferenceFromStr(child), depth + 1)
        }
      }
    }
  }
}


const recalculate = (newState: State) => {

  console.log("Timelinemanager recalculate ")

  var sortedArray: s.TimelineItem[] = newState.timeItems.sort((n1, n2) => (n2.id > n1.id) ? 1 : ((n2.id === n1.id) ? 0 : -1));
  var prev: s.TimelineItem = {
    id: 0,
    by: "",
    why: ""
  }
  var deduped: s.TimelineItem[] = []
  for (const tli of sortedArray) {
    if (tli !== prev) {
      deduped.push(tli)
    }
    prev = tli
  }
  newState.timeItems = deduped

  var references: IndentedItem[] = []
  newState.references = references
  for (const tli of newState.timeItems) {
    var parentDepth = addCommentParent(newState, tli, 0)
    // check for parents
    const indented: IndentedItem = {
      ...tli,
      depth: 0 + parentDepth
    }
    references.push(indented)
    addCommentChildren(newState, tli, 1 + parentDepth)
  }
  // setState(newState)
}
