import { AppDataSource } from "../utils/database";
import type {Request,Response} from 'express'
import logger from "../utils/logger";
import { DailySummary } from "../entity/DailySummary";
import { Entries, EntryType } from "../entity/Entries";

export class SummariesController{
    static async getSummary(req:Request,res:Response){
  try {
    const userId=(req as any).user.userId;
    const summaryRepository=AppDataSource.getRepository(DailySummary);

    const summary=await summaryRepository.findOne({
      where:{user:{id:userId }
      },
      order:{date:"DESC"},
    });

    if(!summary){
      return res.status(404).json({message: "Summary not found yet"});
    }

    logger.info("Fetched summary from DailySummary table",{userId});

    return res.status(200).json({userId:userId,Date:summary.date,Total_Imcome:summary.totalIncome,
        Total_Expense:summary.totalExpense,
        Balance:summary.balance});

  } catch(error){
    logger.error("Failed to fetch summary",{error});
    return res.status(500).json({ message: "Failed to fetch summary" });
  }
}

    // Live all-time totals, computed from entries rather than the daily cron snapshot
    static async getTotals(req:Request,res:Response){
  try {
    const userId=(req as any).user.userId;
    const entriesRepository=AppDataSource.getRepository(Entries);

    const totalIncome=(await entriesRepository.sum("amount",{type:EntryType.INCOME,userId}))||0;
    const totalExpense=(await entriesRepository.sum("amount",{type:EntryType.EXPENSE,userId}))||0;
    const balance=Number((totalIncome-totalExpense).toFixed(2));

    logger.info("Fetched live totals",{userId});
    return res.status(200).json({totalIncome,totalExpense,balance});

  } catch(error){
    logger.error("Failed to fetch totals",{error});
    return res.status(500).json({ message: "Failed to fetch totals" });
  }
}

    // Monthly income/expense for the last 12 months, plus all-time spending by category
    static async getInsights(req:Request,res:Response){
  try {
    const userId=(req as any).user.userId;
    const entriesRepository=AppDataSource.getRepository(Entries);

    const now=new Date();
    const months:string[]=[];
    for(let i=11;i>=0;i--){
      const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-i,1));
      months.push(d.toISOString().slice(0,7));
    }

    const monthlyRows=await entriesRepository.createQueryBuilder("entries")
      .select("to_char(entries.date,'YYYY-MM')","month")
      .addSelect("entries.type","type")
      .addSelect("SUM(entries.amount)","total")
      .where("entries.userId=:userId",{userId})
      .andWhere("entries.date >= :from",{from:`${months[0]}-01`})
      .groupBy("month")
      .addGroupBy("entries.type")
      .getRawMany();

    const monthly=months.map((month)=>{
      const find=(type:EntryType)=>Number(monthlyRows.find((r)=>r.month===month && r.type===type)?.total ?? 0);
      return {month,income:find(EntryType.INCOME),expense:find(EntryType.EXPENSE)};
    });

    const categoryRows=await entriesRepository.createQueryBuilder("entries")
      .select("entries.category","category")
      .addSelect("SUM(entries.amount)","total")
      .where("entries.userId=:userId",{userId})
      .andWhere("entries.type=:type",{type:EntryType.EXPENSE})
      .groupBy("entries.category")
      .orderBy("total","DESC")
      .getRawMany();

    const categories=categoryRows.map((r)=>({category:r.category as string,total:Number(r.total)}));

    logger.info("Fetched insights",{userId});
    return res.status(200).json({monthly,categories});

  } catch(error){
    logger.error("Failed to fetch insights",{error});
    return res.status(500).json({ message: "Failed to fetch insights" });
  }
}
}