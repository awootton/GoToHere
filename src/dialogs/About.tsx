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

//import DialogTitle from '@material-ui/core/DialogTitle';

//import Paper from '@material-ui/core/Paper';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import ReactMarkdown from 'react-markdown'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        // 
        root: {

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: "20 20px",
            padding: "20 20px",

            width: theme.spacing(50),
            height: theme.spacing(75),

            minWidth: 200,

            font: "Ubuntu",
            flexDirection: "column",

            //    justifyContent: 'center',
            //   alignItems: 'center', // centers vertically? 

            textAlign: 'center',

            //height: theme.spacing(150),
            //minWidth : theme.spacing(150), 
        }
    })
);

export const FillAbout = () => {

    const classes = useStyles();

    return (
        <div className={classes.root} >
            <ReactMarkdown children={TheText} linkTarget="_blank"  />

            {/* <div  style={{font: "Ubuntu"}}  >
                <DialogTitle >About...</DialogTitle>
                <Paper><p>GoToHere project by Alan Tracey Wootton</p></Paper>
                <Paper>
                    <a href="https://github.com/awootton/gotohere" target="_blank" rel="noreferrer" >https://github.com/awootton/gotohere</a> </Paper>
                <Paper><p>Whole lotta skull sweat in here.</p><p>Hope you like it.</p> Follow @GoToHereC on twitter</Paper>
                <ReactMarkdown children={featList} linkTarget="_blank"  />
            </div> */}
        </div>
    )
}

export default FillAbout

const TheText = 
`### About...
GoToHere project by Alan Tracey Wootton

Whole lotta skull sweat in here.
Hope you like it.
Follow @GoToHereC on twitter
[https://github.com/awootton/gotohere](https://github.com/awootton/gotohere)
#### Missing features:
DM's

timeline

new comments

usable layout for phone

atw - 6/2/21 - alpha release v0.001
`
