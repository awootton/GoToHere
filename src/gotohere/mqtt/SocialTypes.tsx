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

// this is a date in this format: 210413141933845 (it starts with the year, month, etc)
// these are sortable but can't do arighmetic
export type DateNumber = number;
// same but a string
export type DateString = string;

export type Person = string;

export type Reference = {
    id: DateNumber; // this is actually a timestamp. a 
    by: Person; // this is the topic name 
    value? : Post | Comment | TimelineItem 
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
    parent?: StringRef;
}

// We'll just use the one direct parent for now.
export interface Comment extends Post {
   // I moved the parent to Post. any post can be a comment. The diff is that comments have a parent.
   // the GetComments api will also get posts. 
}

export interface TimelineItem extends Reference {
    why: string
}

export function StringRefNew(ref: Reference | Post | Comment): StringRef {
    return ref.id + " " + ref.by
}

export function ReferenceFromStr(str: StringRef): Reference {
    const parts = str.split(" ")
    const ref: Reference = {
        id: +parts[0],
        by: parts[1]
    }
    return ref
}

export const emptyPost: Post = {

    id: 0,
    title: "",
    theText: "",
    likes: 0, //PersonAlias[],
    retweets: [], // what type ? 
    comments: [],
    by: "", // who sent it. including us. a username
}

export const emptyComment: Comment = {

    id: 0,
    title: "",
    theText: "",
    likes: 0, //PersonAlias[],
    retweets: [], // what type ? 
    comments: [],
    by: "", // who sent it. including us. a username
    parent: ""
}

export const InTenYears: DateNumber = 310607124441000