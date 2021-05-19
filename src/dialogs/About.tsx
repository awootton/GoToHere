
import React, { ReactElement, FC } from "react";



//import { makeStyles } from '@material-ui/core/styles';
//import { blue } from '@material-ui/core/colors';

//import CSS from 'csstype';

import Typography from '@material-ui/core/Typography';

import Paper from '@material-ui/core/Paper';

import * as profile from "../components/ProfileMain"
import * as tok from '../components/TokenScreen';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
//import { FormatColorResetTwoTone } from "@material-ui/icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    // doesn't work. 
    root: {
        margin : 2,
        padding : "20 20px",
      //  width : 100
      width: "98%",
      //height: theme.spacing(150),
      //minWidth : theme.spacing(150), 
    }
   })
);

export const FillAbout = () => {

    const classes = useStyles();

    return (
        <div  >
            <div  >
                <Paper>zBanter project by Alan Wootton</Paper>
                <Paper>  <a href = "https://github.com/awootton/zBanter" target="_blank" >https://github.com/awootton/zBanter</a> </Paper>
                <Paper></Paper>
                <Paper>in fillAboutDialog</Paper>
            </div>
        </div>
    )
}

export default FillAbout

