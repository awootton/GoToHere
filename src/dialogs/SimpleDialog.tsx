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

import { ReactElement} from "react";

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'; 

// TODO: get rid of this. just use dialog directly DEPRECATED

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    root: {
      display: "flex",
      margin: '2 2px',
      border: '2 2px',
      padding: '2 2px',

      alignItems: "center",
      justifyContent: 'center',
    },
    scrollPaper: {
      maxHeight: "100%",
      maxWidth: "100%",
      minWidth: "85%",
      margin: '4 4px',
    },
    paperScrollPaper: {
      maxHeight: "100%",
      maxWidth: "100%",
      minWidth: "85%",
      margin: '4 4px',
    },
    paper: {
      margin: "2 2px",
      padding: "2 2px",
      maxHeight: "85%",
      maxWidth: "85%",
      minWidth: "85%",
    },
  })
);

export type Props = {
  onClose: (value: any) => any,
  open: boolean,
  title: string,
  fillme: (props: any)   => any
};

// yikes ! 
// help export const SimpleDialog: FC<Props> = ( props: Props ): ReactElement => {
// props: any? really  !?!  wtf
export function XxxSimpleDialog(props: any) {

  const classes = useStyles();

  //console.log("SimpleDialog props", props)

  const handleClose = ( value: any ) => {
    props.onClose(value);
  };

  const fillDialog = (props: any) => {
    return props.fillme(props)
  }

  function addDialogerHeader():ReactElement  {
    if ( props.title.length === 0 ){
      return ( <></>)
    }
    return (
      <DialogTitle >{props.title}</DialogTitle>
    )
  }
  return (
    <Dialog 
      onClose={handleClose}
      open={props.open}
      className={classes.root}
      classes={{
        root: classes.root, // class name, e.g. `classes-nesting-root-x`
        paperScrollPaper: classes.paperScrollPaper, // class name, e.g. `classes-nesting-label-x`
        scrollPaper: classes.scrollPaper,
        paper: classes.paper
      }}
    >
      {addDialogerHeader()}
      {fillDialog(props)}
    </Dialog>
  );
}

//export default SimpleDialog
