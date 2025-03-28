import { Router } from "express";
import { registerTeacher,createEvent,loginTeacher,logoutTeacher} from "../controllers/teacher.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router() ;

router.route("/register").post(registerTeacher);
router.route("/login").post(loginTeacher);

//secured routes
router.route("/logout").post(verifyJWT,logoutTeacher);
router.route("/createEvent").post(upload.fields([
  {
    name:"poster",
    maxCount:1
  }
]),createEvent);

export default router;