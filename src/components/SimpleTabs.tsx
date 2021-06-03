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

import React , { FC }from 'react';
//import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
//import Box from '@material-ui/core/Box';

//import PostList from './PostList';

import * as reactlisttest from  './PostListManager2';

export interface TabPropsType {
  username: string,
  children: any,
  value: any,
  index: any,
  other?: any,
}

export interface SimpleTabsProps {
  username: string,
}

const TabPanel: FC<TabPropsType> = (props: TabPropsType) => {

  const { username, children, value, index, ...other } = props;

  const classes = useStyles();

  return (
    <div
      role="tabpanel"
      className={classes.tabPanel}
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        // <Box p={4}>
          <Typography component="div" className={classes.tabPanel}  >{children}</Typography>
        // </Box>
      )}
    </div>
  );
}

// I don't even know what this is. It sets an id.
// wtf is aria?
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: 18,
    backgroundColor: theme.palette.background.paper,
  },
  tabLabel : {
     fontSize: 12,
     height: 18,
     textTransform: 'capitalize'
    },

    tabPanel : {
      height: theme.spacing(50) ,
      width: "100%"
     }
   
}));

export const  SimpleTabs : FC<SimpleTabsProps> = (props: SimpleTabsProps) => {
  
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  //console.log("rendering SimpleTabs window.innerWidth = " , window.innerWidth )

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label={<span className={classes.tabLabel}>Posts</span>} {...a11yProps(0)} />
          <Tab label={<span className={classes.tabLabel}>Notices</span>} {...a11yProps(1)} />
          {/* <Tab label={<span className={classes.tabLabel}>Media</span>} {...a11yProps(2)} /> */}
        </Tabs>
      </AppBar>

      <TabPanel value={value} index={0} username = {props.username}>
      <reactlisttest.PostListManager2 message={"none"} folder = {"lists/posts/"} username = {props.username}  ></reactlisttest.PostListManager2>
      </TabPanel>

      <TabPanel value={value} index={1} username = {props.username}  >
        <reactlisttest.PostListManager2 message={"none"} folder = {"lists/events/"} username = {props.username}  ></reactlisttest.PostListManager2>
      </TabPanel>

    </div>
  );
}
//     list of my images here.
//         <Tab label={<span className={classes.tabLabel}>+</span>} {...a11yProps(3)} />


export default SimpleTabs;