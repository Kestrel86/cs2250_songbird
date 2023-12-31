const express = require("express");
const router = express.Router();
const schemas = require("../models/schemas");
const request = require("request");
const dotenv = require("dotenv");

global.access_token = "";

dotenv.config();

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

var spotify_redirect_uri = "http://localhost:4000/auth/callback";

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

router.post("/contact/:a", async (req, res) => {
  const { email, website, message } = req.body;
  const action = req.params.a;

  switch (action) {
    case "send":
      const contactData = { email: email, website: website, message: message };
      const newContact = new schemas.Contact(contactData);
      const saveContact = await newContact.save();
      if (saveContact) {
        res.send("Message Sent. Thank you");
      } else {
        res.send("Failed to send message.");
      }

      break;

    default:
      res.send("Invalid request");
      break;
  }
  res.end();
});

router.post("/support/:a", async (req, res) => {
  const { name, email, donation, message } = req.body;
  const action = req.params.a;

  switch (action) {
    case "send":
      const supportData = {
        email: email,
        name: name,
        message: message,
        donation: donation,
      };
      const newSupport = new schemas.Support(supportData);
      const saveSupport = await newSupport.save();
      if (saveSupport) {
        res.send("Message Sent. Thank you");
      } else {
        res.send("Failed to send message.");
      }

      break;

    default:
      res.send("Invalid request");
      break;
  }
  res.end();
});

router.get("/support", async (req, res) => {
  const support = schemas.Support;

  const supportData = await support.find({}).exec();
  if (supportData) {
    res.send(JSON.stringify(supportData));
  }
});

router.get("/users", async (req, res) => {
  const users = schemas.Users;

  const userData = [
    {
      id: 1,
      donation: "$0.01",
    },
    {
      id: 2,
      donation: "$1.00",
    },
    {
      id: 3,
      donation: "$5.00",
    },
    {
      id: 4,
      donation: "$10.00",
    },
    {
      id: 5,
      donation: "$15.00",
    },
    {
      id: 6,
      donation: "$25.00",
    },
    {
      id: 7,
      donation: "$50.00",
    },
    {
      id: 8,
      donation: "$100.00",
    },
  ];

  res.send(userData);
});

router.get("/auth/login", async (req, res) => {
  //sets the scopes of the website. Spotify api requires these to be manually set and allows for the website to read data and modify data
  var scope =
    "user-read-currently-playing user-read-playback-state user-modify-playback-state streaming user-read-private user-read-email";
  var state = generateRandomString(16);

  //parameters for the user authorization
  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  });
  // will redirect user to authorize with their account based on which scopes, client id, and other parameters
  return res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

router.get("/auth/callback", (req, res) => {
  var code = req.query.code;
  //the authorizations allowed by the user
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };
  /*if the request was a success then the access token (global variable) is set based on auth token given back by spotify
    this access token is needed to all fetches from the api and is neccessary for any changes*/
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      console.log(access_token);
      res.redirect("http://localhost:3000/songbird");
    }
  });
});

router.get("/auth/token", (req, res) => {
  res.json({ access_token: access_token });
});

module.exports = router;
