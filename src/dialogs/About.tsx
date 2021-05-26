
// import React, { ReactElement, FC } from "react";



//import { makeStyles } from '@material-ui/core/styles';
//import { blue } from '@material-ui/core/colors';

//import CSS from 'csstype';

// import Typography from '@material-ui/core/Typography';

import DialogTitle from '@material-ui/core/DialogTitle';

import Paper from '@material-ui/core/Paper';

// import * as profile from "../components/ProfileMain"
// import * as tok from '../components/TokenScreen';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
//import { FormatColorResetTwoTone } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    // 
    root: {

      //  flexGrow: 1,
    //  position: 'absolute', 
    //  left: '50%', 
    //  top: '50%',
   //   transform: 'translate(-50%, -50%)',

        margin : "20 20px",
        padding : "20 20px",
 
        width: theme.spacing(50),
        height: theme.spacing(50),

       minWidth : 200,
       
 
        justifyContent: 'center',
        alignItems: 'center', // centers vertically? 

        textAlign: 'center',
       
      //height: theme.spacing(150),
      //minWidth : theme.spacing(150), 
    }
   })
);

export const FillAbout = () => {

    const classes = useStyles();

    return (
        <div className = {classes.root} >
            <div className = {classes.root} >
            <DialogTitle >About...</DialogTitle>
                <Paper>GoToHere project by Alan Tracey Wootton</Paper>
                <Paper>  
                    <a href = "https://github.com/awootton/zBanter" target="_blank" >https://github.com/awootton/zBanter</a> </Paper>
                <Paper></Paper>
             
            </div>
        </div>
    )
}

export default FillAbout

