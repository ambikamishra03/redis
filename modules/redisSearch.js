
const redis = require("redis");

// console.log(redis);

// create a redis client that connects to local redis stack server
const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379"
});

(async () => {
  await redisClient.connect(); 
  
  // Drop old index if exists
  try {
    await redisClient.ft.dropIndex("idx:users", { DD: true }); // DD also drops docs from index
  } catch (e) {
    console.log("No old index to drop");
  }

// redis search module(.ft) --- querying, secondary indexing, and full-text search
// json doc pr index add krenge

    // create full text search index on json documents
    await redisClient.ft.create(
        "idx:users", // index name
        {
            // schema create kr rha text me full text search and numeric me range query ya aggregation perform
          "$.name": { type: redis.SCHEMA_FIELD_TYPE.TEXT, AS: "name" },
          "$.email": { type: redis.SCHEMA_FIELD_TYPE.TEXT, AS: "email" },
          "$.age": { type: redis.SCHEMA_FIELD_TYPE.NUMERIC, AS: "age" }
        },
        {
            ON:"JSON",  // index to json
            PREFIX:["user:"]  // only index key starting with user:
        }

    );


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
    await redisClient.json.set("user:3", "$",{
    name: "eiuhi",
    email: "ambika1@gmail.com",
    age: 30
    })
const user = await redisClient.json.mGet(["user:1","user:2"],"$");
// console.log(user);

// search by name
const name = await redisClient.ft.search("idx:users",'@name:Ambika') 
// console.log("Result:",JSON.stringify(name));

// search user age between 20 to 25
const res = await redisClient.ft.search("idx:users","@age:[20 25]",{
  SORTBY:{
    BY:"age",DIRECTION:"DESC"  // sort age desc 
  },
  RETURN:["name","email","age"]
})
  console.log("search by age",JSON.stringify(res));
  
})();