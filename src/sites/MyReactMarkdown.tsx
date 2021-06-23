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


import React, { FC, ReactElement } from "react";
import { createStyles, makeStyles, Theme, withStyles } from "@material-ui/core/styles";


import ReactMarkdown from 'react-markdown'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        divstyle: {

            padding: 20,
            backgroundColor: 'rgba(250, 250, 250, 0.85)',
            //  width: "75vw",

            textAlign: 'left',//'left',

            //textAlign: 'center' 
        }
    })
);

type funtype = () => any
type atofType = (fname: any) => any

type Props = {
    stringToFunction: (fname: any) => any
    children: any
}

export const MyReactMarkdown: FC<Props> = (props: Props) => {

    const stos = (s: any): string => { return "" + s }

    const classes = useStyles();

    const topprops = props

    return (
        <ReactMarkdown children={props.children}

            className={classes.divstyle}
            //    linkTarget={linkTargetFilter}
            components={{
                // Rewrite links to be onClick
                a: ({ node, ...props }) => {
                    var thefunct = topprops.stringToFunction(props.href)
                    var theHref = stos(props.href)
                    if (thefunct === undefined) {
                        thefunct = () => { }
                    } else {
                        theHref = "#"
                    }
                    console.log(" ReactMarkdown components href ", theHref)

                    return (<a href={theHref} onClick={thefunct}  >{props.children}</a>)
                }
            }}
        />
    )
}