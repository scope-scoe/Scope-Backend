import { Router } from "express";
import { registerStudent,loginStudent,logoutStudent,createQuery} from "../controllers/student.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createEvent } from "../controllers/teacher.controller.js";

const router=Router() ;

router.route("/register").post(registerStudent);
router.route("/login").post(loginStudent);

//secured routes
router.route("/logout").post(verifyJWT,logoutStudent);
router.route("/createQuery").post(verifyJWT,createQuery);

export default router;