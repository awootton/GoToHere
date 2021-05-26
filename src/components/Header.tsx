
import React, { ReactElement, FC } from "react";

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

//import Zoom from '@material-ui/core/Zoom';

//import { makeStyles } from '@material-ui/core/styles';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

// import AppsIcon from '@material-ui/icons/Apps';
import MenuIcon from '@material-ui/icons/Menu';
//import CSS from 'csstype';

import { SimpleDialog } from '../dialogs/SimpleDialog'
//import * as dialog2 from '../dialogs/DialogScreens'

import * as dialogs_about from '../dialogs/About'
//import * as dialogs_editpost from '../dialogs/EditPost'
import * as dialogs_apptest from '../dialogs/AppTest'
import * as dialogs_editpost from '../dialogs/EditPost'

import * as cardutil from './CardUtil'

//import { blue } from "@material-ui/core/colors";
//import { propTypes } from "react-markdown";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    root: { // for the wrapping div
      margin: "2px",
    },
    // for the popup edit dialog 
    editdialog: {
      flexGrow: 1,
      margin: "2 2px"
    },

    aboutdialog: {

      //flexGrow: 1,
      margin: "20 20px",
      padding: "20 20px",
      width: 800,
      height: 800,

      minWidth: 800
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

  const [openAppTest, setOpenAppTest] = React.useState(false);

  const [openNewPost, setOpenNewPost] = React.useState(false);


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

  const handleClickOpenAppTest = () => {
    setOpenAppTest(true);
    handleClose()
  };

  const handleDialogClose = (value: any) => {
    //setOpenEditSettings(false);
    setOpenAbout(false);
    setOpenAppTest(false);
    setOpenNewPost(false)
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

        {/* <MenuItem onClick={handleClickOpenEditSettings}>Edit Settings</MenuItem> */}
        <MenuItem onClick={handleClickOpenNewPost}>New Post.</MenuItem>
        <MenuItem onClick={handleClickOpenAbout}>About</MenuItem>
        {/* <MenuItem onClick={handleClickOpenAppTest}>App test</MenuItem> */}
      </Menu>

      {props.title}

      {/* <SimpleDialog
        // style = {someStyles}
        className = {classes.aboutdialog}
        open={openAbout}
        fillme={dialogs_about.FillAbout}
        title="About..."
        onClose={handleDialogClose}
        username={ourName} /> */}

      <Dialog
        onClose={handleDialogClose}
        open={openAbout}
        className={classes.aboutdialog}
      >

        <dialogs_about.FillAbout></dialogs_about.FillAbout>

      </Dialog>



      <SimpleDialog
        // style = {someAppStyles}
        //className = {classes.root}
        open={openAppTest}
        fillme={dialogs_apptest.FillAppTest}
        title={""}
        onClose={handleDialogClose}
        username={props.username} />


      <SimpleDialog
        // style = {someAppStyles}
        // className = {classes.editdialog}
        open={openNewPost}
        fillme={dialogs_editpost.FillEditPost}
        // props for edit post 
        username={ourName}
        post={cardutil.makeEditCard(props.username)}
        cancel={handleDialogClose}

        title={"New Post"}
        onClose={handleDialogClose}
      />

    </div>
  );
};


export default Header;