import React, { Component } from 'react';
import { updateUser } from './../../ducks/users';
import { connect } from 'react-redux';
import axios from 'axios';

class Private extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {}
    }
  }

  async componentDidMount() {
    let res = await axios.get('/api/user-data');
    this.props.updateUser(res.data)
  }

  render() {
    console.log(this.props);
    let { user } = this.props;
    // logged in user: {user_name: 'joe', email: 'sdlkfj' etc..}
    // no log in user: {}
    return (
      <div>
        <h1>Account Details</h1>
        <hr /><hr /><hr />
        {
          user.user_name ? (
            <div>
              <p>Account Holder: {user.user_name}</p>
              <p>Email: {user.email}</p>
              <p>Account ID: {user.auth_id}</p>
              <p>Balance: $10.00</p>
              <img src={user.picture} alt="" />
            </div>
          )
            : (<p>Please log in</p>)
        }
        <a href='http://localhost:3005/auth/logout'>
          <button>Logout</button>
        </a>

      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  }
}
// this.props = Object.assign(this.props, {user: state.user})

export default connect(mapStateToProps, { updateUser })(Private);