"use strict";

const createApplication = require("./");
const { AuthorizationCode } = require("./../");

createApplication(({ app, callbackUrl }) => {
  console.log("callback", callbackUrl);
  const client = new AuthorizationCode({
    client: {
      id: "oauth-test2",
      secret: "secret",
    },
    auth: {
      tokenHost: "http://localhost:5444",
      tokenPath: "/oauth2/token",
      authorizePath: "/oauth2/auth",
    },
  });

  // Authorization uri definition
  const authorizationUri = client.authorizeURL({
    redirect_uri: callbackUrl,
    scope: "openid",
    state: "veimvfgqexjicockrwsgcb333o3a",
  });

  // Initial page redirecting to Github
  app.get("/auth", (req, res) => {
    console.log(authorizationUri);
    res.redirect(authorizationUri);
  });

  // Callback service parsing the authorization token and asking for the access token
  app.get("/callback", async (req, res) => {
    const { code } = req.query;
    console.log(code, "this is the code");
    const options = {
      code,
      redirect_uri: callbackUrl,
    };

    try {
      console.log("aaa");
      const accessToken = await client.getToken(options);
      console.log("bbb");

      console.log("The resulting token: ", accessToken.token);

      return res.status(200).json(accessToken.token);
    } catch (error) {
      console.error("Access Token Error", error);
      return res.status(500).json("Authentication failed");
    }
  });

  app.get("/", (req, res) => {
    res.send('Hello<br><a href="/auth">Log in with Github</a>');
  });
});
