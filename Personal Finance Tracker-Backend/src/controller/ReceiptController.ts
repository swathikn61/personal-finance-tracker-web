import type { Request, Response } from "express";
import { AppDataSource } from "../utils/database";
import { Entries } from "../entity/Entries";
import { Receipt } from "../entity/Receipt";
import { redisClient } from "../config/redis";
import { entriesVersionKey } from "./EntriesController";
import logger from "../utils/logger";

export const RECEIPT_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;

// Entry lists and single entries are cached with hasReceipt, so drop both after a receipt change
const invalidateEntryCache = async (userId: number, entryId: number) => {
  await redisClient.del(`entry:${userId}:${entryId}`);
  await redisClient.incr(entriesVersionKey(userId));
};

const findOwnedEntry = (userId: number, id: number) =>
  AppDataSource.getRepository(Entries).findOne({ where: { id, userId } });

export class ReceiptController {
  static async uploadReceipt(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const entryId = Number(req.params.id);
      const mimeType = req.headers["content-type"] ?? "";

      if (!RECEIPT_MIME_TYPES.includes(mimeType)) {
        return res.status(415).json({ message: "Receipt must be a JPEG, PNG or WebP image" });
      }
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({ message: "Receipt image is empty" });
      }

      const entry = await findOwnedEntry(userId, entryId);
      if (!entry) return res.status(404).json({ message: "Entry not found" });

      const receiptRepository = AppDataSource.getRepository(Receipt);
      const receipt = (await receiptRepository.findOneBy({ entryId })) ?? new Receipt();
      receipt.entryId = entryId;
      receipt.userId = userId;
      receipt.mimeType = mimeType;
      receipt.size = req.body.length;
      receipt.data = req.body;
      await receiptRepository.save(receipt);

      entry.hasReceipt = true;
      await AppDataSource.getRepository(Entries).save(entry);
      await invalidateEntryCache(userId, entryId);

      logger.info("Receipt uploaded", { userId, entryId, size: receipt.size });
      return res.status(200).json({ message: "Receipt uploaded", size: receipt.size });
    } catch (error) {
      logger.error("Failed to upload receipt", { error });
      return res.status(500).json({ message: "Failed to upload receipt" });
    }
  }

  static async getReceipt(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const entryId = Number(req.params.id);

      const receipt = await AppDataSource.getRepository(Receipt).findOneBy({ entryId, userId });
      if (!receipt) return res.status(404).json({ message: "Receipt not found" });

      res.setHeader("Content-Type", receipt.mimeType);
      res.setHeader("Cache-Control", "private, max-age=300");
      return res.send(receipt.data);
    } catch (error) {
      logger.error("Failed to fetch receipt", { error });
      return res.status(500).json({ message: "Failed to fetch receipt" });
    }
  }

  static async deleteReceipt(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const entryId = Number(req.params.id);

      const entry = await findOwnedEntry(userId, entryId);
      if (!entry) return res.status(404).json({ message: "Entry not found" });

      await AppDataSource.getRepository(Receipt).delete({ entryId, userId });
      entry.hasReceipt = false;
      await AppDataSource.getRepository(Entries).save(entry);
      await invalidateEntryCache(userId, entryId);

      logger.info("Receipt deleted", { userId, entryId });
      return res.status(200).json({ message: "Receipt deleted" });
    } catch (error) {
      logger.error("Failed to delete receipt", { error });
      return res.status(500).json({ message: "Failed to delete receipt" });
    }
  }
}
