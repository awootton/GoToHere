import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import PostList from './PostList'


export interface TabPropsType {
  children: any,
  value: any,
  index: any,
  other?: any,
}

function TabPanel(props: TabPropsType) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component="div" >{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Events" {...a11yProps(0)} />
          <Tab label="My Posts" {...a11yProps(1)} />
          <Tab label="Images" {...a11yProps(2)} />
          <Tab label="+" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <PostList message="from App" folder="timeline "></PostList>
      </TabPanel>
      <TabPanel value={value} index={1}>
        {/* Item Two */}
        <PostList message="from App" folder="posts "></PostList>
      </TabPanel>
      <TabPanel value={value} index={2}>
        list of my images here.
      </TabPanel>
      <TabPanel value={value} index={3}>
        compose a new post here. 
      </TabPanel>
    </div>
  );
}
