require('dotenv').config();
const express = require('express')
  , session = require('express-session')
  , massive = require('massive')
  , axios = require('axios');

// initialize express app
const app = express();
// destructure from process.env
const {
  SERVER_PORT,
  SECRET,
  REACT_APP_CLIENT_ID,
  REACT_APP_DOMAIN,
  CLIENT_SECRET,
  CONNECTION_STRING,
  NODE_ENV
} = process.env;
// database connection
massive(CONNECTION_STRING).then(db => {
  app.set('db', db);
})
// middleware
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: true
}))
// endpoints
app.get('/auth/callback', async (req, res) => {
  // use code from query in payload for token
  const payload = {
    client_id: REACT_APP_CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: req.query.code,
    grant_type: 'authorization_code',
    redirect_uri: `http://${req.headers.host}/auth/callback`
  }

  // trade code for token
  let resWithToken = await axios.post(`https://${REACT_APP_DOMAIN}/oauth/token`, payload)
  // use token to get user data
  let resWithUserData = await axios.get(`https://${REACT_APP_DOMAIN}/userinfo?access_token=${resWithToken.data.access_token}`)

  let {
    email,
    name,
    picture,
    sub
  } = resWithUserData.data;

  let db = req.app.get('db');
  let foundUser = await db.find_user([sub])
  if (foundUser[0]) {
    req.session.user = foundUser[0];
    res.redirect('/#/private')
  } else {
    let createdUser = await db.create_user([name, email, picture, sub])
    req.session.user = createdUser[0];
    res.redirect('/#/private');
  }

})

function envCheck(req, res, next) {
  if (NODE_ENV === 'dev') {
    req.app.get('db').get_user_by_id().then(userWithIdOne => {
      req.session.user = userWithIdOne[0]
      next();
    })
  } else {
    next()
  }
}

app.get('/api/user-data', envCheck, (req, res) => {
  if (req.session.user) {
    res.status(200).send(req.session.user);
  } else {
    res.status(401).send("NOOOO!")
  }
})

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('http://localhost:3000/')
})



// listen on port
app.listen(SERVER_PORT, () => {
  console.log(`Listening on port: ${SERVER_PORT}`)
})

