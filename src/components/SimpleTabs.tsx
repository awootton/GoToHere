import React , { FC }from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import PostList from './PostList';

import * as reactlisttest from  './ReactListTest';

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

// TabPanel.propTypes = {
//   username: PropTypes.string,
//   children: PropTypes.node,
//   index: PropTypes.any.isRequired,
//   value: PropTypes.any.isRequired,
// };

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

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label={<span className={classes.tabLabel}>Events</span>} {...a11yProps(0)} />
          <Tab label={<span className={classes.tabLabel}>Posts</span>} {...a11yProps(1)} />
          <Tab label={<span className={classes.tabLabel}>Media</span>} {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} username = {props.username}  >
        {/* <PostList message="from App" folder="timeline" username = { props.username}  ></PostList> */}
        <reactlisttest.PostListManager2 message={"none"} folder = {"lists/posts/"} username = {props.username}  ></reactlisttest.PostListManager2>
      </TabPanel>
      <TabPanel value={value} index={1} username = {props.username}>
        {/* <PostList message="from App2" folder="posts"  username = {props.username}  ></PostList> */}
      </TabPanel>
      <TabPanel value={value} index={2} username = {props.username}  >
        <>
        {/* <reactlisttest.PostListManager2 message={"none"} folder = {"lists/posts/"} username = {props.username}  ></reactlisttest.PostListManager2> */}
        </>
      </TabPanel>

      {/* <TabPanel value={value} index={3}>
        compose a new post here. 
      </TabPanel> */}

    </div>
  );
}
//     list of my images here.
//         <Tab label={<span className={classes.tabLabel}>+</span>} {...a11yProps(3)} />


export default SimpleTabs;