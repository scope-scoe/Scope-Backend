import { Router } from "express";
import { registerTPC,loginTPC,logoutTPC} from "../controllers/tpc.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router=Router() ;

router.route("/register").post(registerTPC);
router.route("/login").post(loginTPC);

//secured routes
router.route("/logout").post(verifyJWT,logoutTPC);
export default router;