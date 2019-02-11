const cors = require("cors")({ origin: true });
const axios = require("axios");
const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

exports.hello = functions.https.onRequest((request, response) => {
  axios
    .get(
      "https://script.google.com/a/kidocode.com/macros/s/AKfycbzV0aQ1xs5ieJoOb7qBeZLflorMFi01Gs_0FDgqhQ/exec?test=123&method=email&email=unclecode@kidocode.com"
    )
    .then(data => {
      console.log("email");
      console.log(data.data);
    });
  response.send("Hello from myself!");
});

exports.hello2 = functions.https.onRequest((request, response) => {
  response.send("Hello from other!");
});

// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  const original = req.query.text;
  return admin
    .database()
    .ref("/messages")
    .push({ original: original })
    .then(snapshot => {
      return res.json({ ref: snapshot.ref.toString() });
    });
});

exports.addUser = functions.https.onRequest((req, res) => {
  cors(req, res, () => {});
  const email = req.query.email;
  return admin
    .database()
    .ref("/users")
    .push({ email: email })
    .then(snapshot => {
      return res.json({ ref: snapshot.ref.toString() });
    });
});

exports.sendWelcomeEmail = functions.database
  .ref("/users/{pushId}/email")
  .onCreate((snapshot, context) => {
    const email = snapshot.val();
    console.log("preparing to send email", context.params.pushId, email);
    const appScriptUrl =
      "https://script.google.com/a/kidocode.com/macros/s/AKfycbzV0aQ1xs5ieJoOb7qBeZLflorMFi01Gs_0FDgqhQ/exec";
    return axios
      .get(`${appScriptUrl}?method=email&email=${email}&message=welcomezzz ${(new Date()).toLocaleString()}`)
      .then(data => {
        console.log("email");
        console.log(data.data);
        return snapshot.ref.parent.child("sent").set(true);
      });
  });

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database
  .ref("/messages/{pushId}/original")
  .onCreate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const original = snapshot.val();
    console.log("Uppercasing", context.params.pushId, original);
    const uppercase = original.toUpperCase();
    if (uppercase === "EMAIL") {
      return axios
        .get(
          "https://script.google.com/a/kidocode.com/macros/s/AKfycbzV0aQ1xs5ieJoOb7qBeZLflorMFi01Gs_0FDgqhQ/exec?test=123&method=email&email=unclecode@kidocode.com"
        )
        .then(data => {
          console.log("email");
          console.log(data.data);
          return snapshot.ref.parent.child("uppercase").set("Email Sent");
        });
    }
    return snapshot.ref.parent.child("uppercase").set(uppercase);
    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    // return snapshot.ref.parent.child("uppercase").set(uppercase);
  });
