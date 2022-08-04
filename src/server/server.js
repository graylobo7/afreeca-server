const express = require("express");
const { getAfreecaInfo, sleep } = require("../utils/utils");
const app = express();
const MongoClient = require("mongodb").MongoClient;
let db;
MongoClient.connect(
  "mongodb+srv://seujinsa:tmwlstk7102!@cluster0.3wrxb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);
    db = client.db("seujinsa");
    app.listen(process.env.PORT || 3005, () => {
      console.log(`listening on ${process.env.PORT || 3005}`);
    });
  }
);


(async function getAfreecaInfoInterval() {
    while (true) {
      try {
        let res = await getAfreecaInfo();
        let excludeList = [];
        for (const key in res) {
          excludeList.push(key);
          const result = await new Promise((resolve, reject) => {
              db.collection("gamer").updateOne(
              { _id: key },
              {
                $set: {
                  afreeca: { ...res[key] },
                },
              },
              (err, result) => {
                if (err) {
                  reject(err);
                }
                resolve(key);
              }
            );
          });
          console.log("OnAir: ", result);
        }
        const result = await new Promise((resolve, reject) => {
          db.collection("gamer").updateMany({ _id: { $nin: excludeList } }, { $set: { afreeca: null } }, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve("방송정보 초기화 완료.");
          });
        });
        console.log(result)
        await sleep(10000);
      } catch (error) {
        console.log(error);
      }
    }
  })();


  app.get("/test", (req, res) => {
   res.send("zzz")
  });