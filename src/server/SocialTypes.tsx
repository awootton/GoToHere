
//import * as util from "./util"
//import * as social from "./social_types"


// this is a date in this format: 210413141933845 (it starts with the year, month, etc)
// these are sortable but can't do arighmetic
export type DateNumber = number;
// same but a string
export type DateString = string;

// This is the standard alias of another social account. 
// it is the first 16 bytes of a sha256 of the name, in url encoded base 64
export type PersonAlias = string;
 
export type Reference = {
    id : DateNumber; // this is actually a timestamp. a 
    alias: PersonAlias; // this is the sha256 of the topic name 
}

export type LikeReference = {
    who : PersonAlias;
}

export type Friend = {
    name: string // the full name aka alice_vociferous_mcgrath
    nameHash : string // in sha256 of the name
    publicKey : Buffer // ready to go
    
}

export type Post = {
    id : DateNumber,
    title: string,
    theText: string,
    likes: PersonAlias[],
    retweets: string[], // what type ? 
    comments : Reference[],
    postedByName : string; // who sent it. including us. a username
    editable? :boolean,
    more?: any
    //replyingTo? : Reference // if this is a comment then this is the parent
}

export interface Comment extends Post {
     parents :  Reference[];
}

