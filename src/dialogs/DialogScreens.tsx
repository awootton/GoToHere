
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

type fillDialogProps = {

}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    root : {
        margin : 2,
        border : 2,
        padding: 2
    },
    paper: {
        margin : 2,
      //  width: "98%",
      height: theme.spacing(50),
      minWidth : theme.spacing(50), 
    }
   })
);


// export const fillEditDialog: FC<fillDialogProps> = (): ReactElement => {

//     return (
//         <div  >
//                 <Typography component="div"   color="textSecondary" gutterBottom >fillEditDialog     </Typography>
//         </div>
//     )
// }

// export const FillAboutDislog = () => {

//     const classes = useStyles();

//     return (
//         <div  className = {classes.paper} >
//             <div  >
//                 <Paper>zBanter project by Alan Wootton</Paper>
//                 <Paper>  <a href = "https://github.com/awootton/zBanter" target="_blank" >https://github.com/awootton/zBanter</a> </Paper>
//                 <Paper></Paper>
//                 <Paper>in fillAboutDialog</Paper>
//             </div>
//         </div>
//     )
// }

// interface AppTestProps {
//     username:string
//     tokenState : tok.State //  tok.initialState,
//     hasHeader: boolean
// }

// export const fillAppTestDialog : FC<AppTestProps> = ( props : AppTestProps ) => {

//     return (
//         <>
//             <profile.ProfileMain tokenState = {props.tokenState} username={props.username} hasHeader={false} ></profile.ProfileMain>
//         </>
//     )
// }



