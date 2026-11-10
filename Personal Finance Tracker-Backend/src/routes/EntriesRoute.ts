import express, { Router } from "express";
import { EntriesController } from "../controller/EntriesController";
import { ReceiptController, RECEIPT_MAX_BYTES, RECEIPT_MIME_TYPES } from "../controller/ReceiptController";
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



const receiptUploadLimiter=rateLimit({
    windowMs:30*60*1000,
    max:30,
    message:{message:"Too many receipt uploads, please try again later"},
    standardHeaders:true,
    legacyHeaders:false,
})

// Receipts are sent as the raw image body (Content-Type: image/jpeg|png|webp)
const receiptBody=express.raw({type:RECEIPT_MIME_TYPES,limit:RECEIPT_MAX_BYTES});

router.use(authMiddleware);

router.post("/", createEntryLimiter, EntriesController.createEntries);
router.get("/",getEntriesLimiter, EntriesController.getEntries);
router.get("/:id", getEntriesLimiter,EntriesController.getEntryById);
router.put("/:id", putEntryLimiter,EntriesController.updateEntry);
router.delete("/:id",deleteEntryLimiter,EntriesController.deleteEntry);

router.put("/:id/receipt",receiptUploadLimiter,receiptBody,ReceiptController.uploadReceipt);
router.get("/:id/receipt",getEntriesLimiter,ReceiptController.getReceipt);
router.delete("/:id/receipt",deleteEntryLimiter,ReceiptController.deleteReceipt);

export default router;