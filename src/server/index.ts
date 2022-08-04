// Require the framework and instantiate it
const fastify = require("fastify")({ logger: true });

fastify.register(require("@fastify/mongodb"), {
    forceClose: true,
    url: "mongodb+srv://seujinsa:tmwlstk7102!@cluster0.3wrxb.mongodb.net/seujinsa?retryWrites=true&w=majority",
});
fastify
    .listen({ port: 3300 })
    .then((e) => {
        console.log("listening on", e);
    })
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });

fastify.get("/user/:id", function (req, reply) {
    const users = this.mongo.db.collection("test");
    users.insertOne({ _id:"gkdkdk",test:"gkdnl" }, (err, user) => {
        if (err) {
            reply.send(err);
            return;
        }
        reply.send(user);
    });
});
fastify.get("/", async (request, reply) => {
    return { hello: "world" };
});
