import React from "react";
import { Button, Dialog, DialogContent, DialogContentText, TextField, DialogActions, Chip } from "@material-ui/core";
import "./commentDialog.css";
import axios from "axios";

/**
 * * Jian Zhong
 * CommentDialog, a React componment of CS142 project #7
 * This component is for creating a comment dialog UI, 
 * send newly added comment to server,
 * notifiy upper level for the comment added,
 * so that UserPohtos component will re-fetch data, and update UI.
 * @param this.props.handleSumbitChange: handle update notification.
 * @param this.props.photo_id: photo id that is being commmented.
 */
export default class CommentDialog extends React.Component {
    constructor(props) {
      super(props);
      this.state = { 
        open: false,
        comment: "",
      };
    }

    handleClickOpen = () => this.setState({ open: true });  // open comment dialog
    handleClickClose = () => this.setState({ open: false });// close comment dialog
    handleCommentChange = e => this.setState({ comment: e.target.value }); 

  
    handleCommentSubmit = () => {
      const commentText = this.state.comment; 
      this.setState({ comment: "" }); 
      this.setState({ open: false }); 

      axios
        .post(`/commentsOfPhoto/${this.props.photo_id}`, { comment: commentText }) 
        .then(() => this.props.onCommentSumbit())                 
    };
  
    render() {
      return (
        <div className="comment-dialog">
          <Chip label="Reply" onClick={this.handleClickOpen}/>
          {/* onClose: when mouse click outside of the dialog box, then close the dialog */}
          <Dialog open={this.state.open} onClose={this.handleClickClose} >
            <DialogContent>
              <DialogContentText>Add a comment...</DialogContentText>
              <TextField value={this.state.comment} onChange={this.handleCommentChange} autoFocus multiline margin="dense" fullWidth />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClickClose}>Cancel</Button>
              <Button onClick={this.handleCommentSubmit}>Submit</Button>
            </DialogActions>
          </Dialog>
        </div>
      );
    }
  }