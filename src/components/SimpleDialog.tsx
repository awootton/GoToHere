 
 
 
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
 
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

 
const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    scrollPaper : {
      maxHeight:  "100%"  ,
      maxWidth:  "100%"  ,
      alignItems : "right",
      margin : '4 4px',
    },
    paperScrollPaper : {
      maxHeight:  "100%"  ,
      maxWidth:  "100%"  ,
      alignItems : "right",
      margin : '4 4px',
    },
    container : {
      maxHeight:  "100%"  ,
      maxWidth:  "100%"  ,
      alignItems : "left",

      margin : '0 11px',
    },
    paper: {
      margin : "2px",
      maxHeight:  "100%"  ,
      position: "relative"
    },

    root : {
        margin : '0 11px',
        border : '0 12px',
  
        padding: '0 13px',
    },

   })
);
 
  export type PropType = {
    onClose: (value:any) => {},
    open: boolean,
    title: string
  //  selectedValue: PropTypes.string.isRequired,
  };
  

export function SimpleDialog(props : any) {

  const classes = useStyles();

  //const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    props.onClose("selectedValue");
  };

//   const handleListItemClick = (value : any) => {
//     props.onClose("value");
//   };

  const fillDialog = (props : any) => {
      return props.fillme(props)
  }

  return (
    <Dialog onClose={handleClose}  
            open={props.open} 
            className = {classes.root}
            classes={{
              root: classes.root, // class name, e.g. `classes-nesting-root-x`
              paperScrollPaper: classes.paperScrollPaper, // class name, e.g. `classes-nesting-label-x`
              scrollPaper : classes.scrollPaper,
              paper: classes.paper
            }}
             >
      <DialogTitle >{props.title}</DialogTitle>
      {fillDialog(props)}
    </Dialog>
  );
}

//<DialogTitle >{props.title}</DialogTitle>

// aria-labelledby="simple-dialog-title"     


      // {/* <List>
      //   {emails.map((email) => (
      //     <ListItem button onClick={() => handleListItemClick(email)} key={email}>
      //       <ListItemAvatar>
      //         <Avatar className={classes.avatar}>
      //           <PersonIcon />
      //         </Avatar>
      //       </ListItemAvatar>
      //       <ListItemText primary={email} />
      //     </ListItem>
      //   ))}

      //   <ListItem autoFocus button onClick={() => handleListItemClick('addAccount')}>
      //     <ListItemAvatar>
      //       <Avatar>
      //         <AddIcon />
      //       </Avatar>
      //     </ListItemAvatar>
      //     <ListItemText primary="Add account" />
      //   </ListItem>
      // </List> */}

// export default function SimpleDialogDemo() {
//   const [open, setOpen] = React.useState(false);
//   const [selectedValue, setSelectedValue] = React.useState(emails[1]);

//   const handleClickOpen = () => {
//     setOpen(true);
//   };

//   const handleClose = (value:any) => {
//     setOpen(false);
//     setSelectedValue(value);
//   };

//   return (
//     <div>
//       <Typography variant="subtitle1">Selected: {selectedValue}</Typography>
//       <br />
//       <Button variant="outlined" color="primary" onClick={handleClickOpen}>
//         Open simple dialog
//       </Button>
//       <SimpleDialog selectedValue={selectedValue} open={open} onClose={handleClose} />
//     </div>
//   );
// }
