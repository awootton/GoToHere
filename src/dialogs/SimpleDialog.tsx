


import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { FullscreenExitTwoTone } from '@material-ui/icons';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    root: {
      display: "flex",
      margin: '2 2px',
      border: '2 2px',
      padding: '2 2px',

      alignItems: "center",
      justifyContent: 'center',
    },
    scrollPaper: {
      maxHeight: "100%",
      maxWidth: "100%",
      minWidth: "85%",
   //   alignItems: "right",
      margin: '4 4px',
    },
    paperScrollPaper: {
      maxHeight: "100%",
      maxWidth: "100%",
      minWidth: "85%",
   //   alignItems: "right",
      margin: '4 4px',
    },
    paper: {
      margin: "2 2px",
      maxHeight: "100%",
      maxWidth: "100%",
      minWidth: "85%",
     // position: "relative"
    },
  })
);

export type PropType = {
  onClose: (value: any) => {},
  open: boolean,
  title: string
  //  selectedValue: PropTypes.string.isRequired,
};


export function SimpleDialog(props: any) {

  const classes = useStyles();

  //const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    props.onClose("selectedValue");
  };

  //   const handleListItemClick = (value : any) => {
  //     props.onClose("value");
  //   };

  const fillDialog = (props: any) => {
    return props.fillme(props)
  }

  return (
    <Dialog onClose={handleClose}
      open={props.open}
      className={classes.root}
      classes={{
        root: classes.root, // class name, e.g. `classes-nesting-root-x`
        paperScrollPaper: classes.paperScrollPaper, // class name, e.g. `classes-nesting-label-x`
        scrollPaper: classes.scrollPaper,
        paper: classes.paper
      }}
    >
      <DialogTitle >{props.title}</DialogTitle>
      {fillDialog(props)}
    </Dialog>
  );
}

