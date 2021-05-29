


import * as social from '../server/SocialTypes'

export {}

export function makeTopCard( username: string ) : social.Post {

    var apost : social.Post = {
        id : 0,
        title : "Waiting...",
        theText: "No posts loaded yet.",
        likes: 0,
        retweets : [],
        comments: [] ,
        postedByName : username
    }
    return apost
}

export function makeEditCard(username: string) : social.Post {

    var apost : social.Post = {
        id : 0,
        title : "",
        theText: "", 
        likes: 0,
        retweets : [],
        comments: []    , 
        editable : true,
        postedByName : username

    }
    return apost
}

export function makeEmptyCard( username: string ) : social.Post {

    var apost : social.Post = {
        id : 0,
        title : "",
        theText: "",
        likes: 0,
        retweets : [],
        comments: [] ,
        postedByName : username
    }
    return apost
}

