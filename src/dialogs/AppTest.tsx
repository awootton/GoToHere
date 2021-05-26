
import {FC } from "react";



//import { makeStyles } from '@material-ui/core/styles';
//import { blue } from '@material-ui/core/colors';

//import CSS from 'csstype';

//import Typography from '@material-ui/core/Typography';

//import Paper from '@material-ui/core/Paper';

import * as profile from "../components/ProfileMain"
import * as tok from '../components/TokenScreen';

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
    tokenState : tok.State //  tok.initialState,
    hasHeader: boolean
}

export const FillAppTest : FC<Props> = ( props : Props ) => {
    const classes = useStyles();
    return (
        <div className = {classes.root}>
            <profile.ProfileMain tokenState = {props.tokenState} username={props.username} hasHeader={false} ></profile.ProfileMain>
        </div>
    )
}

export default FillAppTest
