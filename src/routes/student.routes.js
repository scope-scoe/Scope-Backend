import { Router } from "express";
import { registerStudent,loginStudent,logoutStudent,createQuery,getCreatedQueries,getAllEvents,getAllRegisteredEvents} from "../controllers/student.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { registerForEvent } from "../controllers/student.controller.js";

const router=Router() ;

router.route("/register").post(registerStudent);
router.route("/login").post(loginStudent);

//secured routes
router.route("/logout").post(verifyJWT,logoutStudent);
router.route("/createQuery").post(verifyJWT,createQuery);
router.route('/registerForEvent').post(verifyJWT,registerForEvent);
router.route('/getCreatedQueries').get(verifyJWT,getCreatedQueries);
router.route('/getAllRegisteredEvents').get(verifyJWT,getAllRegisteredEvents);
router.route('/getAllEvents').get(verifyJWT,getAllEvents);

export default router;