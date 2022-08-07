const express = require("express");
const { gamerInfoDataList } = require("../data/gamerInfoJson");
const { getAfreecaInfo, sleep } = require("../utils/utils");
const app = express();
const cors = require("cors");
let corsOptions = {
  origin: ["https://seujinsa.netlify.app", "http://localhost:3000", "https://seujinsa.com"],
  credentials: true,
};

app.use(cors(corsOptions));
const MongoClient = require("mongodb").MongoClient;
let db;
MongoClient.connect("mongodb+srv://seujinsa:tmwlstk7102!@cluster0.3wrxb.mongodb.net/seujinsa?retryWrites=true&w=majority", function (err, client) {
  if (err) return console.log(err);
  db = client.db("seujinsa");
  app.listen(process.env.PORT || 3005, () => {
    console.log(`listening on ${process.env.PORT || 3005}`);
  });
});

(async function getAfreecaInfoInterval() {
  while (true) {
    try {
      let res = await getAfreecaInfo();
      let excludeList = [];
      for (const key in res) {
        excludeList.push(key);
        const result = await new Promise((resolve, reject) => {
          db.collection("afreeca").updateOne(
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
      }
      await new Promise((resolve, reject) => {
        db.collection("afreeca").updateMany({ _id: { $nin: excludeList } }, { $set: { afreeca: null } }, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve("방송정보 초기화 완료.");
        });
      });

      const finalResult =  await new Promise((resolve,reject)=>
      {
        db.collection("afreeca")
        .find({})
        .toArray((err, res) => {
          const result = {};
          for (const e of res) {
            if (e["afreeca"]) {
              result[e["_id"]] = e["afreeca"];
            }
          }
          db.collection("live").updateOne({ _id: "live" }, { $set: { data: null } }, (err, res) => {
            db.collection("live").updateOne({ _id: "live" }, { $set: { data: result } }, (err, res) => {
              resolve(result)
            });
          });
        });
      })
      console.log("갱신완료: ",finalResult);
      await sleep(10000);
    } catch (error) {
      console.log(error);
    }
  }
})();

app.get("/test", (req, res) => {
  for (const key in gamerInfoDataList) {
    let result = "";
    if (gamerInfoDataList[key]["eloCategory"].includes("|")) {
      const category = gamerInfoDataList[key]["eloCategory"].split("|")[0];
      const page = gamerInfoDataList[key]["eloPageNum"].split("|")[0];
      result = `${category}|${page}`;
    } else {
      result = `${gamerInfoDataList[key]["eloCategory"]}|${gamerInfoDataList[key]["eloPageNum"]}`;
    }
    db.collection("gamer").updateOne(
      { _id: key },
      {
        $set: {
          ["platform.elo"]: result,
        },
      },
      (err, result) => {
        console.log(err, result);
      }
    );
  }
});

app.get("/insert", (req, res) => {
  for (const key in gamerInfoDataList) {
    db.collection("afreeca").insertOne({ _id: key, afreeca: {} });
  }

  res.send("");
});
async function deleteColumn(collection, column) {
  return await collection.updateMany({}, { $unset: { [column]: 1 } });
}

app.delete("/column/:collection/:field", async (req, res) => {
  try {
    const result = await deleteColumn(db.collection(req.params.collection), req.params.field);
    res.send(result);
  } catch (error) {
    res.send(error);
  }
});

app.get("/live", (req, response) => {});
