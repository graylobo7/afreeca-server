const { getAfreecaInfo } = require("../utils/utils");

// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/mongodb"), {
  forceClose: true,
  url: "mongodb+srv://seujinsa:tmwlstk7102!@cluster0.3wrxb.mongodb.net/seujinsa?retryWrites=true&w=majority",
});
fastify
  .listen({ port: process.env.PORT||3300 })
  .then((e) => {
    console.log("listening on", e);
  })
  .catch((e) => {
    console.log("에러발생",e);
  });

(async function getAfreecaInfoInterval() {
  while (true) {
    try {
      let res = await getAfreecaInfo();
      let excludeList = [];
      for (const key in res) {
        excludeList.push(key);
        const result = await new Promise((resolve, reject) => {
            this.mongo.db.collection("gamer").updateOne(
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
        // console.log("OnAir: ", result);
      }
      const result = await new Promise((resolve, reject) => {
        this.mongo.db.collection("gamer").updateMany({ _id: { $nin: excludeList } }, { $set: { afreeca: null } }, (err, result) => {
          if (err) {
            reject(err);
          }
          resolve("방송정보 초기화 완료.");
        });
      });
      await sleep(10000);
    } catch (error) {
      console.log(error);
    }
  }
})();

fastify.get("/user/:id", function (req, res) {

  const some = req.params.id;

  this.mongo.db.collection("test").insertOne({ _id: "zzzas", test: req.params.id }, (err, user) => {
    if (err) {
      res.send(err);
      return;
    }
    res.send(user);
  });
});
fastify.get("/", async (req, res) => {
  return { hello: "world" };
});

fastify.get("/test",async(req,res)=>{
  await new Promise((resolve, reject) => {
    this.mongo.db.collection("gamer").updateOne(
    { _id: "이제동" },
    {
      $set: {
        afreeca: "알룡",
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
})