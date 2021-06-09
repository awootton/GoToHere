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
import React, { ReactElement, FC } from "react";

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import MenuIcon from '@material-ui/icons/Menu';

import * as about from '../dialogs/About'
import * as editpost from '../dialogs/EditPost'
import * as general from '../dialogs/General'
import * as cardutil from './CardUtil'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    root: { // for the wrapping div
      margin: "12 12px",
    },

    // for the popup edit dialog 
    editdialog: {
      //flexGrow: 1,
      margin: "2 2px",
      padding: "20 20px",
      width: 800,
      height: 800,
      minWidth: 800
    },

    editgeneral: {

        flexGrow: 1,
     //   width: 200,// theme.spacing(window.innerWidth * 16 / 450),
        height: 800,  
        justifyContent: 'center',
        alignItems: 'center',
      
      //flexGrow: 1,
      margin: "2 2px",
      padding: "20 20px",
      // width: 800,
      // height: 800,
      // minWidth: 800
    },

    aboutdialog: {

      //flexGrow: 1,
      // margin: "20 20px",
      // padding: "20 20px",
      // width: 800,
      // height: 800,
      // minWidth: 800
    }

  })
);

// define interface to represent component props
interface Props {
  title: String
  username: string
}

const Header: FC<Props> = (props: Props): ReactElement => {

  const [anchorEl, setAnchorEl] = React.useState(null);

  //const [openEditSettings, setOpenEditSettings] = React.useState(false);
  const [openAbout, setOpenAbout] = React.useState(false);

  //const [openAppTest, setOpenAppTest] = React.useState(false);

  const [openNewPost, setOpenNewPost] = React.useState(false);

  const [openEditGeneral, setOpenEditGeneral ] = React.useState(false);


  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const handleClickOpenEditSettings = () => {
  //   setOpenEditSettings(true);
  //   handleClose()
  // };

  const handleClickOpenNewPost = () => {
    setOpenNewPost(true);
    handleClose()
  };


  const handleClickOpenAbout = () => {
    setOpenAbout(true);
    handleClose()
  };

  const handleClickOpenEditGeneral = () => {
    setOpenEditGeneral(true);
    handleClose()
  };

  // const handleClickOpenAppTest = () => {
  //   setOpenAppTest(true);
  //   handleClose()
  // };

  const handleDialogClose = (value: any) => {
    //setOpenEditSettings(false);
    setOpenAbout(false);
   // setOpenAppTest(false);
   setOpenNewPost(false)
   setOpenEditGeneral(false)
  };

  var ourName = props.username// "building_bob_bottomline_boldness"

  const classes = useStyles();

  return (
    <div className={classes.root} >

      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        <MenuIcon />
      </Button>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClickOpenNewPost}>New Post</MenuItem>
        <MenuItem onClick={handleClickOpenAbout}>About GoToHere</MenuItem>
        <MenuItem onClick={handleClickOpenEditGeneral}>Edit Profile Info</MenuItem>
      </Menu>

      {props.title}

      <Dialog
        className={classes.aboutdialog}
        open={openAbout}
        onClose={handleDialogClose}
      >
        <about.FillAbout></about.FillAbout>
      </Dialog>


      <Dialog
      className={classes.editgeneral}
        onClose={handleDialogClose}
        open={openEditGeneral}
        
      > <div className={classes.editgeneral}>
        <general.GeneralInfoLayout username = {props.username} editing= {true} cancel={handleDialogClose} />
        </div>
      </Dialog>


      <Dialog
        className = {classes.editdialog}
        open={openNewPost}
        onClose={handleDialogClose}
      >
        <DialogTitle>New Post</DialogTitle>
        <editpost.FillEditPost username={ourName} 
                    post={cardutil.makeEditCard(props.username)} 
                 //   parent={cardutil.makeEmptyCard(props.username)}
                    cancel={handleDialogClose}/>
      </Dialog>

    </div>
  );
};


export default Header;