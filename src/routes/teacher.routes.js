import { Router } from "express";
import { registerTeacher,createEvent} from "../controllers/teacher.controller.js";
import {upload} from "../middlewares/multer.middleware.js"

const router=Router() ;

router.route("/register").post(registerTeacher);
router.route("/createEvent").post(upload.fields([
  {
    name:"poster",
    maxCount:1
  }
]),createEvent);

export default router;