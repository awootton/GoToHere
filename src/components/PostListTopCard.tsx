


import * as social from '../server/SocialTypes'

export {}

export function makeTopCard( username: string ) : social.Post {

    var apost : social.Post = {
        id : 210101010000000,
        title : "Waiting...",
        theText: "No posts loaded yet.",
        likes: [],
        retweets : [],
        comments: [] ,
        postedByName : username
    }
    return apost
}

export function makeEditCard(username: string) : social.Post {

    var apost : social.Post = {
        id : 210101010000000,
        title : "",
        theText: "",//  You can edit this one and save.  You can edit this one and save.",
        likes: [],
        retweets : [],
        comments: []    , 
        editable : true,
        postedByName : username

    }
    return apost
}
