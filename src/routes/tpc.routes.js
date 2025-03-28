import { Router } from "express";
import { registerTpc} from "../controllers/tpc.controller.js";

const router=Router() ;

router.route("/register").post(registerTpc);
export default router;