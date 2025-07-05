import { Router } from "express";
import { registerTPC,loginTPC,logoutTPC,getAllQueries,escalateQuery,resolveQuery} from "../controllers/tpc.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";
const router=Router() ;

router.route("/register").post(registerTPC);
router.route("/login").post(loginTPC);

//secured routes
router.route("/logout").post(verifyJWT,logoutTPC);
router.route("/getAllQueries").get(verifyJWT,getAllQueries);
router.route("/escalateQuery").post(verifyJWT,escalateQuery);
router.route("/resolveQuery").post(verifyJWT,resolveQuery);
export default router;