const jwt = require("jsonwebtoken");
const axios = require("axios");

let filePath = "";
if (process.argv.length > 2) {
  filePath = process.argv[2];
}
if (!filePath || filePath === "") {
  console.log(
    "Please enter file name\nfor example: npm start ~/path/to/my/jsonKey/file\n\n"
  );
  process.exit();
}
try {
  const keyFile = require(filePath);
  if (keyFile.type !== "service_account") {
    throw "This file is not for a service account";
  }
  const jwtExpirySeconds = 3600;
  const currentTime = Math.floor(new Date().getTime() / 1000);
  console.log(keyFile.project_id);
  console.log(keyFile.client_email);

  const payload = {
    iss: keyFile.client_email,
    scope: " https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: currentTime + jwtExpirySeconds,
    iat: currentTime,
  };

  const jwtToken = jwt.sign(payload, keyFile.private_key, {
    algorithm: "RS256",
  });
  console.log("\n\nJWT:\n", jwtToken);

  const postData = encodeURI(
    `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`
  );

  axios
    .post("https://oauth2.googleapis.com/token", postData, {
      "Content-Type": "application/x-www-form-urlencoded",
    })
    .then((response) => {
      console.log("\n\nGreat! access token is:\n", response.data.access_token);
      console.log(
        "\n\nIt will expire at",
        new Date(
          (currentTime + response.data.expires_in) * 1000
        ).toLocaleString()
      );
      console.log("\n\n\n");
    });
} catch (e) {
  console.log(e);
}
