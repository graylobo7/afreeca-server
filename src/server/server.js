const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
let db;
MongoClient.connect(
  "mongodb+srv://seujinsa:tmwlstk7102!@cluster0.3wrxb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);
    db = client.db("seujinsa");
    app.listen(process.env.PORT || 3003, () => {
      console.log(`listening on ${process.env.PORT || 3003}`);
    });
  }
);
