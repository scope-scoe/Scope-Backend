import { Router } from "express";
import { registerTpo} from "../controllers/tpo.controller.js";

const router=Router() ;

router.route("/register").post(registerTpo);
export default router;