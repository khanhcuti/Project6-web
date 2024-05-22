import React from "react";
import { Link, Redirect } from "react-router-dom";
import { Button, Grid, Typography } from "@material-ui/core";
import "./userDetail.css";
import axios from "axios";



class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  axios_fetchData(url) {
    axios
    .get(url)
    .then((response) => { // Handle success:
      this.setState({ user: response.data });
      this.props.onUserNameChange( response.data.first_name + " " + response.data.last_name );
      console.log("** UserDetail: fetched user detial **");
    })
    .catch(error => {     // Handle error:
      console.log("** Error: something happened in the setting up the request. **\n", error.message);
    });
  }


  componentDidMount() {

    if (this.props.match.params.userId) {
      const url = `http://localhost:3000/user/${this.props.match.params.userId}`;
      this.axios_fetchData(url);
    }
  }

 
  componentDidUpdate(prevProps) {
    const prevUserID = prevProps.match.params.userId;
    const currUserID = this.props.match.params.userId;
    if (prevUserID !== currUserID && currUserID) {
      const url = `http://localhost:3000/user/${currUserID}`;
      this.axios_fetchData(url);
    }
  }

  render() {
    // redirect to login page if not logged in
    if (!this.props.loginUser) {
      return <Redirect to={`/login-register`} />;
    }

    return this.state.user && (
      <Grid container>
        <Grid item xs={12}>
          <Typography color="textSecondary">Name:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${this.state.user.first_name} ${this.state.user.last_name}`}
          </Typography>
          <Typography color="textSecondary">Description:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${this.state.user.description}`}
          </Typography>
          <Typography color="textSecondary">Location:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${this.state.user.location}`}
          </Typography>
          <Typography color="textSecondary">Occupation:</Typography>
          <Typography variant="h6" gutterBottom>
            {`${this.state.user.occupation}`}
          </Typography>
        </Grid>
        <Grid item xs={4} />
        <Grid item xs={4}>
          <Button
            size="large"
            to={this.state.user && `/photos/${this.state.user._id}`}
            component={Link}
            variant="contained"
            color="primary"
          >
            See Photos
          </Button>
        </Grid>
        <Grid item xs={4} />
      </Grid>
    );
  }
}

export default UserDetail;
