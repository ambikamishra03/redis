
const redis = require("redis");


// RedisGraph is a graph database module for Redis. 
// Node: represents an entity (like a person, product, etc.)
// Edge: represents relationships between nodes (like FRIENDS_WITH, BOUGHT, etc.)
// Properties: key-value pairs on nodes or edges

// create a redis client that connects to local redis stack server
const redisClient = redis.createClient({
  url: "redis://127.0.0.1:6379"
});

(async () => {
  await redisClient.connect(); 
  console.log("Redis connection established");

  // creating a graph
  const graphName = 'social_graph'

  // cypher query
  // 3 nodes labeled person with properties name and age
  const createNodes = `CREATE (:Person {name: 'Ambika', age: 23}),
                              (:Person {name: 'abcd', age: 18}),
                              (:Person {name: 'sara', age: 35})`;

    await redisClient.sendCommand(["GRAPH.QUERY",graphName,createNodes])   // storing nodes in graph
    console.log("Nodes created");
   
    // creating relationships edges
    const createEdges = `
    MATCH(a:Person{name:'Ambika'}),(b:Person{name:'abcd'})
    CREATE (a)-[:FRIENDS_WITH]->(b)
    MATCH(c:Person{name:'Ambika'}),(d:Person{name:'sara'})
    CREATE (c)-[:FRIENDS_WITH]->(d)
    `;
  await redisClient.sendCommand(["GRAPH.QUERY", graphName, createEdges]);
  console.log("Relationship created"); 


//  Ambika -> abcd
// Ambika -> sara

  // query on graph
const query = `
MATCH (f1:Person)-[:FRIENDS_WITH]->(f2)
RETURN f1.name, f2.name
`;

const result = await redisClient.sendCommand(["GRAPH.QUERY", graphName, query]);
console.log(result);   // result- column name and row data 

// sendcommand - low level method manually send special module commands

const update =`
MATCH(p:Person{name:Ambika})
SET p.age =32
RETURN p
`


})();


// cli
// GRAPH.QUERY social_graph "CREATE (:Person {name: 'Ambika', age: 23}), 
//                                 (:Person {name: 'Tanu', age: 18}), 
//                                 (:Person {name: 'Sara', age: 35})"

// GRAPH.QUERY social_graph "MATCH (a:Person {name:'Ambika'}), (b:Person {name:'Tanu'}) 
//                           CREATE (a)-[:FRIENDS_WITH]->(b)"

// GRAPH.QUERY social_graph "MATCH (a:Person {name:'Ambika'}), (b:Person {name:'Sara'}) 
//                           CREATE (a)-[:FRIENDS_WITH]->(b)"

