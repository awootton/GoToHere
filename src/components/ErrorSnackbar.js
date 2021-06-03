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

import React from 'react';
import {
    withStyles,
    Snackbar,
    SnackbarContent,
    IconButton,
} from '@material-ui/core';
import { Error as ErrorIcon, Close as CloseIcon } from '@material-ui/icons';
import { compose, withState } from 'recompose';
import uuid from 'uuid/v4';

const styles = theme => ({
    snackbarContent: {
        backgroundColor: theme.palette.error.dark,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing(1),
    },
});

const ErrorSnackbar = ({ id, message, onClose, classes }) => ( <
    Snackbar open autoHideDuration = { 6000 }
    onClose = { onClose } >
    <
    SnackbarContent className = { `${classes.margin} ${classes.snackbarContent}` }
    aria - describedby = { id }
    message = { <
        span id = { id }
        className = { classes.message } >
        <
        ErrorIcon className = { `${classes.icon} ${classes.iconVariant}` }
        /> { message } < /
        span >
    }
    action = {
        [ <
            IconButton key = "close"
            aria - label = "Close"
            color = "inherit"
            onClick = { onClose } >
            <
            CloseIcon className = { classes.icon }
            /> < /
            IconButton >
        ]
    }
    /> < /
    Snackbar >
);

export default compose(
    withState('id', 'setId', uuid),
    withStyles(styles),
)(ErrorSnackbar);