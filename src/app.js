import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin:process.env.CORS_ORIGIN,
  credentials:true
}));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


//routes import
import studentRouter from './routes/student.routes.js'
import teacherRouter from './routes/teacher.routes.js'
import tpcRouter from './routes/tpc.routes.js'
import tpoRouter from './routes/tpo.routes.js'

//routes declaration
app.use("/api/v1/student",studentRouter)
app.use("/api/v1/teacher",teacherRouter)
app.use("/api/v1/tpc",tpcRouter)
app.use("/api/v1/tpo",tpoRouter)



export {app};