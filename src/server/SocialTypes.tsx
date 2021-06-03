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

//import * as util from "./util"
//import * as social from "./social_types"


// this is a date in this format: 210413141933845 (it starts with the year, month, etc)
// these are sortable but can't do arighmetic
export type DateNumber = number;
// same but a string
export type DateString = string;

export type Person = string;

export type Reference = {
    id: DateNumber; // this is actually a timestamp. a 
    by: Person; // this is the topic name 
}

export type StringRef = string // like a Reference but put in a string as "id by"


// Friend is for a friends list. The publicKey is for verification of identity.
export type Friend = {
    name: string // the full name aka alice_vociferous_mcgrath
    //nameHash: string // in sha256 of the name
    publicKey: Buffer // ready to go
}

export type Post = {
    id: DateNumber;
    title: string;
    theText: string;
    likes: number; //PersonAlias[];
    retweets: string[]; // what type ? 
    comments: StringRef[];
    by: string; // who sent it. including us. a username
    editable?: boolean;
    //more?: any
}

// We'll just use the one direct parent for now.
// if the parents.length = 1 doesn't mean there are no grandparents. We just didn't look yet
export interface Comment extends Post {
    parent: StringRef;
}


export function StringRefNew(ref: Reference | Post | Comment): StringRef {
    return ref.id + " " + ref.by
}

export function StringRefToRef(str: StringRef): Reference {
    const parts = str.split(" ")
    const ref: Reference = {
        id: +parts[0],
        by: parts[1]
    }
    return ref
}


// export class StringRef {
//     str: string;
//     constructor(str: string) {
//         this.str = str;
//     }
//     static from(ref: Reference | Post | Comment) {
//         return new StringRef(ref.id + " " + ref.by)
//     }
//     getReference(): Reference {
//         const parts = this.str.split(" ")
//         const ref: Reference = {
//             id: +parts[0],
//             by: parts[1]
//         }
//         return ref
//     }
// }



export const emptyPost: Post = {

    id: 0,
    title: "",
    theText: "",
    likes: 0, //PersonAlias[],
    retweets: [], // what type ? 
    comments: [],
    by: "", // who sent it. including us. a username
}

// why is this a class and not a type? 
// export class Post {
//     id: DateNumber;
//     title: string;
//     theText: string;
//     likes: number; //PersonAlias[];
//     retweets: string[]; // what type ? 
//     comments: Reference[];
//     postedByName: string; // who sent it. including us. a username
//     editable?: boolean;
//     more?: any
//     //replyingTo? : Reference // if this is a comment then this is the parent
//     constructor(
//         id: DateNumber,
//         title: string,
//         theText: string,
//         likes: number, // PersonAlias[],
//         retweets: string[], // what type ? 
//         comments: Reference[],
//         postedByName: string, // who sent it. including us. a username
//         editable?: boolean,
//         more?: any
//     ) {
//         this.id = id;
//         this.title = title;
//         this.theText = theText;
//         this.likes = 0;
//         this.retweets = retweets;
//         this.comments = comments;
//         this.postedByName = postedByName;
//     }
// }

