
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


 
import { ReactElement, FC } from "react";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
//import Dialog from '@material-ui/core/Dialog';
import { unstable_createMuiStrictModeTheme } from '@material-ui/core/styles'; // makeStyles,
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';


//import * as util from "../gotohere/knotservice/Util"

//import * as apputil from "../AppUtil"


// eslint-disable-next-line 
export const theme = unstable_createMuiStrictModeTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {

      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      minHeight: "100%"

    },
    paperLeft: {

      padding: theme.spacing(2),
      textAlign: 'center',//'left',
      color: theme.palette.text.secondary,

    }
  })
);


interface Props {
}

export const LayoutTest2: FC<Props> = (props: Props): ReactElement => {

  //   <div style={{ display: 'flex', textAlign: 'center', alignItems: "center", justifyContent: "center" }}>
  //   <div>Waiting for server to respond:</div>
  //   aa bb
  // </div>

  const classes = useStyles();

  function makeTest1() {

    // three vertical bars 
    //, height: "100%"
    // It's easy to just have 2
    // how do we subtract the header off of the height?
    return (

      <Grid container spacing={0} // spacing between items

        direction="row"
        justify="center"

        style={{   }}

      >
        <Grid item xs={2} style={{   height: '100vh' }}  >


          <Container fixed style={{ padding: "0" }} >

            <Typography component="div" style={{ backgroundColor: '#cfe8fc' }}  >  ss ff ss ff ss ff ss ff ss ff left column left column left column </Typography>

          </Container>

        </Grid>

        <Grid item xs={8}>

          <Paper className={classes.paper}>middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 middle column makeTest1 </Paper>

        </Grid>

        <Grid item xs={2} >

          <Paper className={classes.paper}>right column makeTest1</Paper>

        </Grid>


      </Grid>

    );
  }

  function makeTest2() {

    // three horz bars 

    return (

      <Grid container spacing={0} direction="column"
      >
        <Grid item xs={12} >

          <Paper className={classes.paper}>ad div 1 ad div 1 ad div 1 </Paper>

        </Grid>

        <Grid item xs={12}>

          {/* <Paper className={classes.paper}>ad div 222</Paper> */}

          {makeTest1()}
        </Grid>

      </Grid>

    );
  }

  return (
    <>
      {makeTest2()}
    </>
  )
}

 
