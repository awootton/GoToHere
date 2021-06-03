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
        by : username
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
        by : username

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
        by : username
    }
    return apost
}

