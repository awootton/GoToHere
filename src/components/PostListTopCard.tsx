


import * as social from '../server/SocialTypes'

export {}

export function makeTopCard() : social.Post {

    var apost : social.Post = {
        id : 210101010000000,
        title : "Waiting...",
        theText: "No posts loaded yet.",
        likes: [],
        retweets : [],
        comments: []     
    }
    return apost
}

export function makeEditCard() : social.Post {

    var apost : social.Post = {
        id : 210101010000000,
        title : "",
        theText: "",//  You can edit this one and save.  You can edit this one and save.",
        likes: [],
        retweets : [],
        comments: []    , 
        editable : true
    }
    return apost
}
