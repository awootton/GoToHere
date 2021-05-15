import React, { ReactElement, FC } from "react";

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

//import { makeStyles } from '@material-ui/core/styles';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

// import AppsIcon from '@material-ui/icons/Apps';
import MenuIcon from '@material-ui/icons/Menu';
//import CSS from 'csstype';

import { SimpleDialog } from './SimpleDialog'
import * as dialog2 from './DialogScreens'
//import { blue } from "@material-ui/core/colors";
//import { propTypes } from "react-markdown";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    // .MuiButtonBase-root : {
    //   margin : 2
    // },
    root : {
        margin : "2px"
    },
   })
);

// define interface to represent component props
interface Props {
  title: String
  username: string
}

const Header: FC<Props> = ( props: Props ): ReactElement => {

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [openEdit, setOpenEdit] = React.useState(false);
  const [openAbout, setOpenAbout] = React.useState(false);

  const [openAppTest, setOpenAppTest] = React.useState(false);


  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickOpenEditSettings = () => {
    setOpenEdit(true);
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
    setOpenEdit(false);
    setOpenAbout(false);
    setOpenAppTest(false);
    //setSelectedValue(value);
  };

  var selectedValue = 'dummy'

  var testUsernameTest = "building_bob_bottomline_boldness"

  const classes = useStyles();

  return (
    <div className = {classes.root} >
      
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
        <MenuItem onClick={handleClickOpenAbout}>About</MenuItem>
        <MenuItem onClick={handleClickOpenAppTest}>App test</MenuItem>
      </Menu>

      {props.title}

      <SimpleDialog selectedValue={selectedValue}
        //style = {someStyles}
        className = {classes.root}
        open={openEdit}
        fillme={dialog2.fillEditDialog}
        title="Edit general info."
        onClose={handleDialogClose} 
        username = {testUsernameTest} />

      <SimpleDialog selectedValue={selectedValue}
       // style = {someStyles}
        open={openAbout}
        fillme={dialog2.FillAboutDislog}
        title="About..."
        onClose={handleDialogClose}
        username = {testUsernameTest} />

      <SimpleDialog selectedValue={selectedValue}
       // style = {someAppStyles}
        className = {classes.root}
        open={openAppTest}
        fillme={dialog2.fillAppTestDialog}
        title={ testUsernameTest }
        onClose={handleDialogClose} 
        username = {testUsernameTest} />

    </div>
  );
};


export default Header;