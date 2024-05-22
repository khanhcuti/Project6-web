import * as React from "react";
import axios from "axios";
import { Redirect } from 'react-router-dom';
import { Typography, Grid, FormControl, InputLabel, Input, Button } from "@material-ui/core";

export default class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginName: "",
      password: "",
      loginMessage: "", 
      newLoginName: "",
      firstName: "",
      lastName: "",
      description: "",
      location: "",
      occupation: "",
      newPassword: "",
      newPassword2: "",
      registeredMessage: "", 
    };
  }

  handleInputChange = ({ target }) => this.setState({ [target.name]: target.value });

  handleLoginSubmit = e => {
    e.preventDefault();
    console.log("** Sending login Info to server: ", this.state.loginName + "  " + this.state.password + " **");

    const loginUser = {         
      login_name: this.state.loginName, 
      password: this.state.password 
    };  

    axios
      .post("/admin/login", loginUser)
      .then(response => { 
        console.log(`** LoginRegister: login Success! **`); 
        this.setState({ loginMessage: response.data.message });
        this.props.onLoginUserChange(response.data);  
      })
      .catch(error => { 
        console.log(`** LoginRegister: login Fail! **`); 
        this.setState({ loginMessage: error.response.data.message });
        this.props.onLoginUserChange(null);  
      });
  };

  getNewUser() {
    const newUser = {
      login_name: this.state.newLoginName, 
      password: this.state.newPassword,
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      location: this.state.location,
      description: this.state.description,
      occupation: this.state.occupation
    };  
    
    this.setState({ 
      newLoginName: "", 
      newPassword: "",
      newPassword2: "",
      firstName: "",
      lastName: "",
      location: "",
      description: "",
      occupation: "",
    });
    return newUser;
  }

  handleRegisterSubmit = e => {
    e.preventDefault();

    if (this.state.newPassword !== this.state.newPassword2) {
      this.setState({ registeredMessage: "The two passwords are NOT the same, please try again" }); 
      return;
    }
    const newUser = this.getNewUser();
    console.log(newUser);
    
    axios
      .post("/user", newUser) 
      .then(response => { 
        console.log(`** LoginRegister: new User register Success! **`); 
        this.setState({ registeredMessage: response.data.message }); 
      })
      .catch(error => { 
        console.log(`** LoginRegister: new User register Fail! **`); 
        this.setState({ registeredMessage: error.response.data.message }); 
      });
  };

  customForm(inputLabel, id, type, value, required, autoFocus = false) {
     return (
       <FormControl fullWidth>
         <InputLabel htmlFor={id}>{inputLabel}</InputLabel>
         <Input
           name={id}
           id={id}
           autoFocus={autoFocus}
           autoComplete="on"
           type={type}
           value={value}
           onChange={this.handleInputChange}
           required={required}
         />
       </FormControl>
     );
  }

  render() {
    const loginUser = this.props.loginUser;
    if (loginUser) {
      return <Redirect from="/login-register" to={`/users/${loginUser._id}`} />;
    }

    return (
      <Grid container>
        <Grid container item direction="column" alignItems="center" xs={6}>
          <Typography variant="h5">Log In</Typography>
          <Grid item xs={8}>
            <form onSubmit={this.handleLoginSubmit}>
              {this.customForm("Login Name", "loginName", "text", this.state.loginName, true, true)}
              {this.customForm("Password", "password", "password", this.state.password, true)}
              <br/><br/>
              <Button
                type="submit"
                disabled={this.state.loginName.length === 0}
                fullWidth
                variant="contained"
                color="primary"
              >
                Login
              </Button>
              <br/><br/>
              {this.state.loginMessage && (
                <Typography style={{ color: "red" }}>
                  {this.state.loginMessage}
                </Typography>
              )}
            </form>
          </Grid>
        </Grid>

        <Grid container item direction="column" alignItems="center" xs={6}>
          <Typography variant="h5">Create New Account</Typography>
          <Grid item xs={8}>
            <form onSubmit={this.handleRegisterSubmit}>
              {this.customForm("New Login Name*", "newLoginName", "text", this.state.newLoginName, true)}
              {this.customForm("First Name*", "firstName", "text", this.state.firstName, true)}
              {this.customForm("Last Name*", "lastName", "text", this.state.lastName, true)}
              {this.customForm("Description", "description", "text", this.state.description)}
              {this.customForm("Location", "location", "text", this.state.location)}
              {this.customForm("Occupation", "occupation", "text", this.state.occupation)}
              {this.customForm("New Password*", "newPassword", "password", this.state.newPassword, true)}
              {this.customForm("Re-enter Password*", "newPassword2", "password", this.state.newPassword2, true)}
              <br/><br/>
              <Button
                type="submit"
                disabled={this.state.newLoginName.length === 0}
                fullWidth
                variant="contained"
                color="primary"
              >
                Register Me
              </Button>
              <br/><br/>
              {this.state.registeredMessage && (
                <Typography style={{ color: this.state.registeredMessage.includes("successfully") ? "green" : "red" }}>
                  {this.state.registeredMessage}
                </Typography>
              )}
            </form>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
