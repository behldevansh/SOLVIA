const router = require("express").Router();
const User = require("../models/user")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {authenticateToken} = require("./userAuth")

// sign up
router.post("/sign-up", async (req, res)=>{
  try{
    const {username, email, password} = req.body

    // check username should not be less than 4
    if(username.length < 4){
      return res.status(400).json({ message:"Username should be greater than 3" })
    }

    // check if username already exists
    const existingUsername = await User.findOne({username : username})
    if(existingUsername){
      return res.status(400).json({ message:"Username already exists" })
    }

    // check if email already exists
    const existingEmail = await User.findOne({email : email})
    if(existingEmail){
      return res.status(400).json({ message:"Email already exists" })
    }

    //check password's length 
    if(password.length <= 5){
      return res.status(400).json({ message:"password length should be greater than 5" })
    }

    const hashpass = await bcrypt.hash(password, 10)

    // user does not registered
    const newUser = new User({
      username: username,
      email: email,
      password: hashpass,
    })
    await newUser.save()
    return res.status(200).json({ message:"Signup Succesfully" })
  }
  catch(error){
    res.status(500).json({ message:"Internal server error" })
  }
})

// sign in
router.post("/sign-in", async (req, res)=>{
  try{
    const {username, password} = req.body
    const existingUser = await User.findOne({username})
    if(!existingUser){
      res.status(400).json({message:"Invalid Credentials"})
    }
    await bcrypt.compare(password , existingUser.password , (err, data)=>{
      
      const authClaims = [
        { name : existingUser.username},
      ]
      const token = jwt.sign({authClaims}, "maintainance123", {
        expiresIn:"30d",
      })
      if(data){
        res.status(200).json({
          id: existingUser.id,
          token: token,
        })
      }
      else{
        res.status(400).json({message:"Invalid Credentials"})
      }
    })
  }
  catch(error){
    res.status(500).json({ message:"Internal server error" })
  }
})

// get user information
router.get("/get-user-information", authenticateToken , async(req, res)=>{
  try{
    const {id} = req.headers;
    const data = await User.findById(id).select('-password')
    res.status(200).json(data)
  }
  catch(err){
    res.status(500).json({message:"Internal server error"})
  }
})

module.exports = router
