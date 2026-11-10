import { Router } from "express";
import { AuthContoller} from "../controller/AuthController";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../middleware/AuthMiddleware";

const router = Router();

const registerLimiter=rateLimit({
    windowMs:60*60*1000,
    max:20,
    message:{message:"Too many registration attempts, please try again later"}
})

const loginlimiter=rateLimit({
    windowMs:15*60*1000,
    max:3,
    message:{message:"Too many login attempts, please try again later",
    },
    standardHeaders:true,
    legacyHeaders:false,

})

router.post("/register", registerLimiter,AuthContoller.register);
router.post("/login",loginlimiter,AuthContoller.login);
router.post("/refresh",AuthContoller.refreshToken)
router.get("/me",authMiddleware,AuthContoller.me)
router.patch("/me",authMiddleware,AuthContoller.updateMe)

export default router;