import mongoose from "mongoose"
new tpoSchema = new mongoose.Schema({
  email : {
    type : String,
    required : true,
    unique : true
  },
  password : {
    type : String,
    required : true,
    unique : true
  }
},{timestamps:true})

export const TPO = mongoose.model('TPO',tpoSchema)