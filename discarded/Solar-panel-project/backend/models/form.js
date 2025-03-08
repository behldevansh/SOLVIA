const mongoose = require("mongoose")
const form = new mongoose.Schema({
  lastCleaned : {
    type : Date,
    required:true,
  },
  panelArea : {
    type : Number,
    required:true,
  },
  labourCost : {
    type : Number,
    required:true,
  },
  
},
{timestamps: true}
)

module.exports = mongoose.model("form", form)