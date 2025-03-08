const jwt = require("jsonwebtoken")

const authenticateToken = (req, res, next)=>{
  const authHeaders = req.headers["authorization"]
  const token = authHeaders && authHeaders.split(" ")[1]

  if(token== null){
    return res.status(401).json({message:"Authentication token required"})
  }

  // Using bearer token in this project

  jwt.verify(token, "maintainance123", (err,user)=>{
    if(err){
      return res.status(403).json({message:"Token expired ! please signIn again"})
    } 
    req.user = user
    next()
  })
}

module.exports = {authenticateToken};