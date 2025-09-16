const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config();
const redis = require("redis");


const app = express();
app.use(express.json());

// connect to db
const MONGO_URI = process.env.MONGO_URI;
// console.log(MONGO_URI );


const dbConnection = async () => {
    try{
      await mongoose.connect(MONGO_URI);
      console.log("MongoDB connected");

    }catch(error){
      console.log("Connection failed", error);
    }
}
dbConnection();

// routes
const userRoutes = require("./routes/userRoutes");
const listRoutes = require("./routes/listRoutes");
app.use("/api/users", userRoutes);
app.use("/api/list",listRoutes);

// redis client instance
const redisClient = redis.createClient({
  url:"redis://127.0.0.1:6379"
});


redisClient.on("connect", () => { console.log("Redis Client Connected")});
redisClient.on("error",(err) => console.log("redis error", err));

(async () =>{
   await redisClient.connect();
  //  console.log("Connected to redis");
})();
app.locals.redisClient = redisClient;  // available for routes


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
