import { Router } from "express";
import { registerTPO,loginTPO,logoutTPO} from "../controllers/tpo.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router=Router() ;

router.route("/register").post(registerTPO);
router.route("/login").post(loginTPO);

//secured routes
router.route("/logout").post(verifyJWT,logoutTPO);

export default router;