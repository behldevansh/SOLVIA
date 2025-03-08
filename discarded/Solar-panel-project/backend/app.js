const express = require("express")
const app= express()
const cors = require("cors")
require("dotenv").config()
require("./conn/conn")
const User = require("./routes/user")
const Form = require("./routes/form")
app.use(cors())
app.use(express.json())
//routes
app.use("/api/v1", User)
app.use("/api/v1", Form)
// app.use("/", (req,res)=>{
//   res.send("hey")
// })

app.listen(process.env.PORT , ()=>{
  console.log(`Server Started at port ${process.env.PORT}`)
})