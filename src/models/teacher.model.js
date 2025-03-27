import mongoose from "mongoose"
new teacherSchema = new mongoose.Schema({
  TeacherID : {
    type : String,
    required : true,
    unique : true
  },
  Name : {
    type : String,
    required : true,
    trim : true
  },
  email : {
    type : String,
    required : true,
    unique : true,
    lowercase : true
  },
  password : {
    type : String,
    required : true,
  },
  Department : {
    type : String,
    required : true
  }

},{timestamps : true})

export const Teacher = mongoose.model('Teacher',teacherSchema)