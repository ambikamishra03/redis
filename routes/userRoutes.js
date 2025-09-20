const express = require("express");
const router = express.Router();

const User = require("../models/User");

// post request

router.post("/",async (req,res)=>{
    try {
        const { name, email , age, mobile} = req.body;
        const user = new User({
            name, email , age, mobile
        })
        await user.save();
        res.status(200).json(user);
        console.log(req.body);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
})


// get request
router.get("/",async (req,res) =>{
    try {
        // caching
        const cachedUsers = await req.app.locals.redisClient.get("all_users");
        if(cachedUsers){
            // console.log(typeof cachedUsers); // string 
          return res.json({source: "cache", data: JSON.parse(cachedUsers)})
        }
        // if not cached check in mongoDB

        const users = await User.find();
        await req.app.locals.redisClient.setEx("all_users", 12000, JSON.stringify(users));

         res.json({ source: "database", data: users });
         console.log(req.body);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})


// get request  with id

// router.get("/:id",async (req,res) =>{
//     try {
//         const userId = req.params.id;
//         const cachedUser = await req.app.locals.redisClient.get(`user_${userId}`);
//         if(cachedUser){
//             return res.json({ source: "cache", data: JSON.parse(cachedUser) });
//         }
//         const user = await User.findById(userId)
//         if(user){
//         await req.app.locals.redisClient.setEx(`user_${userId}`, 12000, JSON.stringify(user));
//         }
//         res.json({ source: "database", data: user });

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// })

router.get("/:id",async (req,res) =>{
    try {
        const userId = req.params.id;
        const cachedUser = await req.app.locals.redisClient.get("all_users"); // string 
        if(cachedUser){
            const users = JSON.parse(cachedUser);
            const user = users.find(item => item._id.toString() === userId);
            if(user){
                return res.json({ source:"cache", data: user})
            }
        }
        const user = await User.findById(userId);

        // refresh all_users cache with db data 
        if(user){
        const users = await User.find();
        await req.app.locals.redisClient.setEx("all_users", 12000, JSON.stringify(users));
        }
        res.json({ source: "database", data: user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})





// delete by id
// router.delete("/:id",async (req,res) => {
//    try {
//     const userId = req.params.id;
//     const cachedUser = await req.app.locals.redisClient.get(`user_${userId}`)
//     if(cachedUser){
//         await req.app.locals.redisClient.del(`user_${userId}`);
//         return res.json({ source: "cache", message:"deleted"})
//     } 
//     const user = await User.findByIdAndDelete(userId);
//     res.json({ source: "database",  message:"deleted" });
//    } catch (error) {
//     res.status(500).json({ error: error.message });
//    }
// })

router.delete("/:id",async (req,res) => {
   try {
    const userId = req.params.id;
    const cachedUser = await req.app.locals.redisClient.get("all_users")
    if(cachedUser){
        let users = JSON.parse(cachedUser);
        const user = users.find(item => item._id.toString() === userId);
        if(user){
        users = users.filter(item => item._id.toString() !== userId);
        // save updated list 
        await req.app.locals.redisClient.setEx("all_users", 12000, JSON.stringify(users))
     
    // await User.findByIdAndDelete(userId); 
    return res.json({ source: "database and cache", data: user });
    }
}
    // agar cache me nhi present
    await User.findByIdAndDelete(userId);
    // cache ko refresh after delete  
    const users = await User.find();
    await req.app.locals.redisClient.setEx("all_users",12000,JSON.stringify(users));
   } catch (error) {
    res.status(500).json({ error: error.message });
   }
})





router.put("/update/:id", async (req,res) => {
   try {
    const userId = req.params.id;
    const { field, value } = req.body;

    const cachedUser = await req.app.locals.redisClient.get("all_users");
    if(!cachedUser){
    return res.status(404).json({ message: "No users found in cache" });
    }
     let users = JSON.parse(cachedUser); // cachedUser json string h
      
     users = users.map((item) => {
      if(item._id === userId){
        return { ...item, [field]:value};
      }
      return item;
     })
     await req.app.locals.redisClient.set("all_users", JSON.stringify(users));  // save updated list to cache 
      res.json({message:"User data updated successfully."})
   } catch (error) {
    res.status(500).json({ error: error.message });
  }
})


module.exports = router;

