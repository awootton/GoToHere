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

import {FC } from "react";


import * as profile from "../components/ProfileMain"
//import * as tok from '../components/TokenScreen';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

//import { FormatColorResetTwoTone } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    // scrollPaper : {
    //   maxHeight:  "100%"  ,
    //   maxWidth:  "100%"  ,
    //   alignItems : "right",
    //   margin : '4 4px',
    // },
    // paperScrollPaper : {
    //   maxHeight:  "100%"  ,
    //   maxWidth:  "100%"  ,
    //   alignItems : "right",
    //   margin : '4 4px',
    // },
    // container : {
    //   maxHeight:  "100%"  ,
    //   maxWidth:  "100%"  ,
    //   alignItems : "left",

    //   margin : '0 11px',
    // },
    // paper: {
    //   margin : "2px",
    //   maxHeight:  "100%"  ,
    //   position: "relative"
    // },

    root : {
       display : "flex",
        
        margin : '2 2px',
        border : '2 2px',

        padding: "0px 0px",

        alignItems : "center",
        justifyContent: 'center',

        // height: theme.spacing(100-32) ,
        
        //minWidth : theme.spacing(50-32),

       
        // width: "98%",

        // height: theme.spacing(50),
        // minWidth : theme.spacing(50), 


  
    },

   })
);
 

interface Props {
    username:string
    pubkeys: string[]
    // tokenState : tok.State //  tok.initialState,
    hasHeader: boolean
}

export const FillAppFrame : FC<Props> = ( props : Props ) => {
    const classes = useStyles();
    return (
        <div className = {classes.root}>
            <profile.ProfileMain username={props.username} hasHeader={false} ></profile.ProfileMain>
        </div>
    )
}

export default FillAppFrame
