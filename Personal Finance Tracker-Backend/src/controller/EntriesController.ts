import type { Request, Response } from "express";
import { Entries } from "../entity/Entries";
import { AppDataSource } from "../utils/database";
import { redisClient } from "../config/redis";
import logger from "../utils/logger";

// Part of every list cache key, so bumping it invalidates all of a user's cached lists at once
export const entriesVersionKey=(userId:number)=>`entries:version:${userId}`;

export class EntriesController {

  
  static async createEntries(req:Request, res:Response) {
    try {
      const {amount,type,category,description,date}=req.body;
      const userId=(req as any).user.userId;

      const entriesRepository=AppDataSource.getRepository(Entries);
      const entry=new Entries();
      entry.amount=amount;
      entry.type=type;
      entry.category=category;
      entry.description=description;
      entry.date=date;
      entry.userId=userId; 

      await entriesRepository.save(entry);

      await redisClient.incr(entriesVersionKey(userId));

      logger.info("Entry created successfully",{userId});
      return res.status(201).json({message: "Entry created successfully", entry });
    } catch (error) {
      logger.error("Failed to create entry",{error});
      return res.status(500).json({message: "Failed to create entry" });
    }
  }


  static async getEntries(req:Request, res:Response) {
    try {
      const userId=(req as any).user.userId;
      const {type,category,startDate,endDate}=req.query;

      const page=Number(req.query.page)||1;
      const limit=Number(req.query.limit)||10;
      const offset=(page-1)*limit;

      const sortBy=req.query.sortBy as string ||"date";
      const sortOrder=req.query.sortOrder as "ASC" | "DESC" ||"DESC";

    const allowedSortFields=["date","amount","category"];

    const safeSort=allowedSortFields.includes(sortBy)?sortBy:"date";

      const version=await redisClient.get(entriesVersionKey(userId))||"0";
      const cacheKey=`entries:${userId}:v${version}:${JSON.stringify(req.query)}`;
      const cached=await redisClient.get(cacheKey);

      if (cached) {
        logger.info("Cache hit for entries",{cacheKey});
        return res.status(200).json({message:"Entries (from cache)",entries:JSON.parse(cached) });
      }

      logger.info("Cache miss for entries",{cacheKey});
      const entriesRepository=AppDataSource.getRepository(Entries);
      const query=entriesRepository.createQueryBuilder("entries")
        .where("entries.userId=:userId",{userId});

      if (type) 
        query.andWhere("entries.type = :type",{type});
      if (category) 
        query.andWhere("entries.category = :category", {category});
      if (startDate && endDate) {
        query.andWhere("entries.date BETWEEN :startDate AND :endDate", {
          startDate: startDate as string,
          endDate: endDate as string,
        });
      }

      const totalCount=await query.getCount();

      const entries = await query
      .orderBy(`entries.${safeSort}`,sortOrder)
      .take(limit)
      .skip(offset)
      .getMany();

      const totalPages = Math.ceil(totalCount / limit);

    const responseData = {
      currentPage: page,
      totalPages,
      totalCount,
      pageSize: limit,
      entries,
    };

      await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 20 });
      logger.info("Fetched entries successfully", {userId});
      return res.status(200).json(responseData);
    } catch (error) {
      logger.error("Failed to fetch entries", {error});
      return res.status(500).json({message: "Failed to fetch entries" });
    }
  }

  
  static async getEntryById(req:Request,res:Response) {
    try {
      const userId=(req as any).user.userId;
      const id=Number(req.params.id);

      const cacheKey=`entry:${userId}:${id}`;
      const cached=await redisClient.get(cacheKey);
      if (cached) {
        logger.info("Cache hit for entry", {cacheKey});
        return res.status(200).json({ message: "Entry (from cache)", entry: JSON.parse(cached) });
      }

      const entriesRepository=AppDataSource.getRepository(Entries);
      const entry=await entriesRepository.findOne({ 
        where: { id,userId } 
    });

      if (!entry)
        return res.status(404).json({message: "Entry not found" });

      await redisClient.set(cacheKey,JSON.stringify(entry),{ EX: 20 });
      logger.info("Fetched entry successfully",{userId,id });

      return res.status(200).json({message: "Entry fetched successfully", entry });
    } catch (error) {
      logger.error("Failed to fetch entry",{error});
      return res.status(500).json({message: "Failed to fetch entry" });
    }
  }

  static async updateEntry(req:Request,res:Response) {
    try {
      const userId=(req as any).user.userId;
      const id=Number(req.params.id);
      const {amount,type,category,description,date}=req.body;

      const entriesRepository=AppDataSource.getRepository(Entries);
      const entry=await entriesRepository.findOne({ 
        where:{id,userId} 
    });

      if (!entry) 
        return res.status(404).json({message: "Entry not found"});

      entry.amount=amount;
      entry.type=type;
      entry.category=category;
      entry.description=description;
      entry.date=date;

      await entriesRepository.save(entry);

      await redisClient.del(`entry:${userId}:${id}`);
      await redisClient.incr(entriesVersionKey(userId));

      logger.info("Entry updated successfully",{userId,id});
      return res.status(200).json({message:"Entry updated successfully",entry });
    } catch(error) {
      logger.error("Failed to update entry",{error});
      return res.status(500).json({message:"Failed to update entry" });
    }
  }

  static async deleteEntry(req:Request,res:Response) {
    try {
      const userId=(req as any).user.userId;
      const id=Number(req.params.id);

      const entriesRepository=AppDataSource.getRepository(Entries);
      const entry=await entriesRepository.findOne({ 
        where: {id,userId} 
    });

      if(!entry)
        return res.status(404).json({message: "Entry not found" });

      await entriesRepository.remove(entry);
      await redisClient.del(`entry:${userId}:${id}`);
      await redisClient.incr(entriesVersionKey(userId));

      logger.info("Entry deleted successfully",{userId,id});
      return res.status(200).json({message: "Entry deleted successfully"});
    } catch(error) {
      logger.error("Failed to delete entry",{error});
      return res.status(500).json({message: "Failed to delete entry"});
    }
  }
}