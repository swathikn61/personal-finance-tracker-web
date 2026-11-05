import { Router } from "express";
import { EntriesController } from "../controller/EntriesController";
import { authMiddleware } from "../middleware/AuthMiddleware";
import rateLimit from "express-rate-limit";

const router = Router();

const createEntryLimiter=rateLimit({
    windowMs:15*60*1000,
    max:30,
    message:{message:"Too many entries created,please try again later"},
    standardHeaders:true,
    legacyHeaders:false,
})

const getEntriesLimiter=rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:{message:"Too many requests, please try again later"},
    standardHeaders:true,
    legacyHeaders:false,
})

const putEntryLimiter=rateLimit({
    windowMs:30*60*1000,
    max:40,
    message:{message:"Too many updates,please try again later"},
    standardHeaders:true,
    legacyHeaders:false,
})

const deleteEntryLimiter=rateLimit({
    windowMs:30*60*1000,
    max:20,
    message:{message:"Too many deletions,please try again later"},
    standardHeaders:true,
    legacyHeaders:false,
})



router.use(authMiddleware);

router.post("/", createEntryLimiter, EntriesController.createEntries);
router.get("/",getEntriesLimiter, EntriesController.getEntries);
router.get("/:id", getEntriesLimiter,EntriesController.getEntryById);
router.put("/:id", putEntryLimiter,EntriesController.updateEntry);
router.delete("/:id",deleteEntryLimiter,EntriesController.deleteEntry);

export default router;