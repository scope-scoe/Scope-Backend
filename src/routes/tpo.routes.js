import { Router } from "express";
import { registerTPO,loginTPO,logoutTPO,resolveQuery} from "../controllers/tpo.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router=Router() ;

router.route("/register").post(registerTPO);
router.route("/login").post(loginTPO);

//secured routes
router.route("/logout").post(verifyJWT,logoutTPO);
router.route("/resolveQuery").post(verifyJWT,resolveQuery);
export default router;