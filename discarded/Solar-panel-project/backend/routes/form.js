const router = require("express").Router();
const User = require("../models/user")
const Form = require("../models/form")
const jwt = require('jsonwebtoken')
const {authenticateToken} = require("./userAuth")

// sign up
router.post("/form", async (req, res)=>{
  try{
    const {lastCleaned, panelArea, labourCost } = req.body

    const newData = new Form({
      lastCleaned : lastCleaned, 
      panelArea: panelArea, 
      labourCost: labourCost,
    })
    await newData.save()
    return res.status(200).json({ message:"Next Date is shown" })
  }
  catch(error){
    res.status(500).json({ message:"Internal server error"})
  }
})

// get all history
router.get("/get-all-data",  async (req, res)=>{
  try{

    const date = await Form.find().sort({createdAt : -1})
    
    return res.json({
      status: "success",
      data : date,
    })
  }
  catch(err){
    return res.status(500).json({message:"An error occured"})
  }
})

module.exports= router