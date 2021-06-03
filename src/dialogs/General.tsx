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

import { FC, useState, useEffect } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

import TextField from '@material-ui/core/TextField';

import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'

import * as generalapi from '../api1/GeneralApi'
import * as broadcast from "../server/BroadcastDispatcher"
import * as event from "../api1/Event"
import * as util from "../server/Util"
 
// This is both a component and the body of an 'edit' dialog. 

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        thebox: {
            fontSize: 13,
        },
        thecard: {
            display: "flex",
            padding: "8px 8px",
            margin: "8px 8px",
            //    height: 200, // done 'manually' below
            //    width: 200, // done 'manually' below
            // overflow: 'auto',
            // overflowX: 'auto',
            // overflowY: 'auto',
            flexDirection : "column"
        }
    })
);

type Props = {
    username: string
    editing: boolean
    cancel: (value: any) => any
}

type ItemProps = {
    // username: string
    editing: boolean
    itemname: string
    value: string
    changed: (value: string) => any
}

type State = {
    generalInfo: generalapi.GeneralInfo
    pending: boolean
    random: string
}

const emptyState: State = {
    generalInfo: generalapi.GeneralInfoSample,
    pending: false,
    random: util.randomString(16)
}

export const GeneralInfoLayout: FC<Props> = (props: Props) => {

    const [state, setState] = useState(emptyState)

    const classes = useStyles();

    var theCardStyle = {
        height: "800px",
        width:  "800px"
    };
    if (props.editing == false) {
        theCardStyle.height = "200px"
        theCardStyle.width = "200px"
    }

    useEffect(() => {
        if (state.pending == false) {
            const newState: State = {
                ...state,
                pending: true
            }
            setState(newState)
            generalapi.IssueTheCommand(props.username, undefined, (reply: generalapi.GeneralApiReply, error: any) => {
                const newState: State = {
                    ...state,
                    generalInfo: reply.generalInfo,
                    pending: false
                }
                setState(newState)
                console.log("got reply.generalInfo", reply.generalInfo)
            })
        }
    }, []) // once? 

    const handleEvent = (event: event.EventCmd) => {
        //console.log("PostListManager2 have event", event, event.who, props.username,dates.length)
        if (event.what.cmd === 'GeneralApi' && event.who === props.username) { //event.what.cmd
          //console.log("GeneralApi have GeneralApi event", event, event.who, props.username)
          const cmd : generalapi.GeneralApiCmd = event.what as generalapi.GeneralApiCmd
          if ( cmd.generalInfo != undefined ) {
            const newState: State = {
                ...state,
                generalInfo: cmd.generalInfo
            }
            setState(newState)
            console.log("got reply.generalInfo", cmd.generalInfo)
          } else {
            console.log("ERROR  generalInfo cmd undefiend")
        
        }
      }
    }

    useEffect(() => {
        broadcast.Subscribe(props.username, "generalInfo"+state.random+ props.username, handleEvent.bind(this))
        return () => {
          broadcast.Unsubscribe(props.username, "generalInfo"+state.random+ props.username)
        };
      }, [state]);
    
    const onSaveButton = () => {

        console.log("saving edited general info ", state.generalInfo)
        const saveGenReceiver = (reply: generalapi.GeneralApiReply, error: any) => {
            console.log(" back from saving with err ", error, " and ", reply)
            if (error !== undefined) {
                //add error to invisible note
                console.log("ERROR GeneralInfo ", error, " and ", reply)
            } else {
                props.cancel("") // close the dialog
            }
            const newState: State = {
                ...state,
                generalInfo: state.generalInfo,
                pending: false
            }
            setState(newState)
        }
        generalapi.IssueTheCommand(props.username, state.generalInfo, saveGenReceiver)
    }

    const addSomeButtonsIfEditing = () => {
        if (props.editing) {
            return (
                <CardActions style={{flexDirection:"row" }}>
                    <Box flexGrow={1}  >
                        <Button  variant="contained" onClick={() => { props.cancel("") } } >Cancel</Button>
                    </Box>
                    <Box flexGrow={1}  > 
                        <Button variant="contained" onClick={onSaveButton} >Save</Button>
                    </Box>
                </CardActions>
            )
        } else {
            return (<></>)
        }
    }

    const statehanged = () => {
        var newState: State = {
            ...state,
        }
        setState(newState)
    }

    return (
        <Grid className={classes.thecard} container direction="row" component="div" style={theCardStyle}  >
            <div style={{ width: '100%', overflowY:"auto" }}>

            {addSomeButtonsIfEditing()}

            {/* <GeneralItem editing={props.editing}
                itemname="Name"
                value={state.generalInfo.name} /> */}

            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.about = val; statehanged() }}
                itemname={"about"}
                value={state.generalInfo.about} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.location = val; statehanged() }}
                itemname={"location"}
                value={state.generalInfo.location} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.publickey = val; statehanged() }}
                itemname={"publickey"}
                value={state.generalInfo.publickey} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.tags = val; statehanged() }}
                itemname={"tags"}
                value={state.generalInfo.tags} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.twitter = val; statehanged() }}
                itemname={"twitter"}
                value={state.generalInfo.twitter} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.facebook = val; statehanged() }}
                itemname={"facebook"}
                value={state.generalInfo.facebook} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.instagram = val; statehanged() }}
                itemname={"instagram"}
                value={state.generalInfo.instagram} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.youtube = val; statehanged() }}
                itemname={"youtube"}
                value={state.generalInfo.youtube} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.tiktok = val; statehanged() }}
                itemname={"tiktok"}
                value={state.generalInfo.tiktok} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.patreon = val; statehanged() }}
                itemname={"patreon"}
                value={state.generalInfo.patreon} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.bitcoin = val; statehanged() }}
                itemname={"bitcoin"}
                value={state.generalInfo.bitcoin} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.linkedin = val; statehanged() }}
                itemname={"linkedin"}
                value={state.generalInfo.linkedin} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.github = val; statehanged() }}
                itemname={"github"}
                value={state.generalInfo.github} />
            <GeneralItem editing={props.editing}
                changed={(val: string) => { state.generalInfo.more = val; statehanged() }}
                itemname={"more"}
                value={state.generalInfo.more} />

            {addSomeButtonsIfEditing()}
            </div>
        </Grid>
    )
}

export const GeneralItem: FC<ItemProps> = (props: ItemProps) => {

    //console.log("GeneralItem key = ",props.itemname)
    const classes = useStyles();

    const getValue = () => {
        if (props.value.startsWith("https://") || props.value.startsWith("http://")) {
            return (
                <a href={props.value} target="_blank" rel="noreferrer" >{props.value}</a>
            )
        } else {
            return (
                <>
                    {props.value}
                </>
            )
        }
    }

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const str: string = event.target.value
        //console.log(props.itemname, "item is now ", str)
        props.changed(str)
    }

    const capitalize = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    if (props.editing) {
        return (
            <TextField
                fullWidth
                id="titleeditor"
                type="text"
                label={"Edit the " + capitalize(props.itemname) + " (if any):"}
                placeholder={props.itemname}
                margin="normal"
                onChange={handleChange}
                defaultValue={props.value}
                multiline={true}
            />
        )
    } else {
        if (props.value.length === 0) {
            return (<div> </div>)
        } else {
            return (
                <div className={classes.thebox}  >
                    <b><span>{capitalize(props.itemname) + ":"}</span></b>
                    <span>{getValue()}</span>
                </div>
            )
        }
    }


}

export default GeneralInfoLayout;