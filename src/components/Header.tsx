import React, { ReactElement, FC } from "react";

import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

// import AppsIcon from '@material-ui/icons/Apps';
import MenuIcon from '@material-ui/icons/Menu';


// define interface to represent component props
interface Props {
  title: String
}

const Header: FC<Props> = ({ title }): ReactElement => {

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  return (
    <div >
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
        {/* Open Menu */} <MenuIcon/>
</Button>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>Settings</MenuItem>
      </Menu>
      {/* // FIXME: atw use style */}
      {title}

    </div>
  );
};

export default Header;