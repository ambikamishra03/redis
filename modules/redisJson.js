const express = require("express");
const redis = require("redis");

console.log(redis);

// create a redis client that connects to local redis stack server
const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379"
});

(async () => {
  await redisClient.connect();   // connection establishment
  console.log("Connected to Redis Stack");

// add json module(.json)
// $ is path which is root of json

  await redisClient.json.set("user:1", "$",{
    name: "Ambika",
    email: "ambika@gmail.com",
    age: 24
    })
await redisClient.json.set("user:2", "$",{
    name: "Ambika123",
    email: "ambika123@gmail.com",
    age: 22
    })

  // await redisClient.json.set("user:1", "$.name", "anything");


const user = await redisClient.json.mGet(["user:1","user:2"],"$");
console.log(user);

// await redisClient.json.del("user:2")

})();



