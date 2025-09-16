const express = require("express");
const router = express.Router();

const User = require("../models/User");

// Redis lists are linked lists of string values
// LPUSH adds a new element to the head of a list; 
// RPUSH adds to the tail.
// LPOP removes and returns an element from the head of a list; 
// RPOP does the same but from the tails of a list.
// LLEN returns the length of a list.
// LMOVE atomically moves elements from one list to another.
// LRANGE extracts a range of elements from a list.
// LTRIM reduces a list to the specified range of elements.



router.post("/", async (req,res) => {
try {
    const { name, email, age, mobile } = req.body;
    const user = new User({name, email , age, mobile})
    // add data to tail of "users_list", same as lpush will add from head
    await req.app.locals.redisClient.rPush("users_list",JSON.stringify(user))
    res.json({message:"User added to list",data: user});
} catch (error) {
    res.status(500).json({ error: error.message });
}
})

// get users using lRange
router.get("/", async (req,res) => {
    try {
    const users = await req.app.locals.redisClient.lRange("users_list",0,-1) 
    const len = await req.app.locals.redisClient.lLen("users_list") 
    // 0 to -1 means full list , 0 0 means first element 
    if(users){
      res.json({users:JSON.parse(users), length:len});
    }
    res.json({users:null, length:0});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// lpop - pop from head. rpop = pop from tail.
router.delete("/lpop",async (req,res) => {
   try {
    const user = await req.app.locals.redisClient.lPop("users_list");
    if(user){
        res.json({message:"popped element for head",popped:JSON.parse(user)})
    }
    res.json({message:"list is empty",popped:null})
   } catch (error) {
    res.status(500).json({ error: error.message });
   }
})

// lMove - move elements between 2 lists
router.post("/move", async (req,res) =>{
    try {
        // source list, dest list, left(get element form head of source), right(push element to tail of dest)
        const movedUser = await req.app.locals.redisClient.lMove("users_list","move_users","LEFT","RIGHT");
       if(movedUser){
         res.json({message:"user moved",movedUser : JSON.parse(movedUser)});
       }
        res.json({message:"no user moved",movedUser : null});

    } catch (error) {
         res.status(500).json({ error: error.message });
    }
})

module.exports = router;
