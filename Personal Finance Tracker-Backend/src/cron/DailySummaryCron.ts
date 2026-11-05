import cron from "node-cron";
import { AppDataSource } from "../utils/database";
import { Entries, EntryType } from "../entity/Entries";
import { User } from "../entity/User";
import { DailySummary } from "../entity/DailySummary";
import logger from "../utils/logger";

export const DailySummaryCron = () => {
  cron.schedule("0 0 * * *",async () => {
    try {
      logger.info("Running Daily Summary Cron Job...");

      const userRepository=AppDataSource.getRepository(User);
      const entriesRepository=AppDataSource.getRepository(Entries);
      const summaryRepository=AppDataSource.getRepository(DailySummary);

      const users=await userRepository.find();

      // Runs at midnight, so the day that just finished is yesterday
      const date=new Date(Date.now()-24*60*60*1000).toISOString().split("T")[0];

      for(const user of users){

        const totalIncome=(await entriesRepository.sum("amount",
            {type:EntryType.INCOME,userId:user.id,date}))||0;

        const totalExpense=(await entriesRepository.sum("amount",
            {type:EntryType.EXPENSE,userId:user.id,date})) || 0;

        const balance=Number((totalIncome-totalExpense).toFixed(2));

        await summaryRepository.upsert(
            {date,userId:user.id,totalIncome,totalExpense,balance},
            ["userId","date"]);
      }

      logger.info("Daily Summary Cron Completed", new Date());
    } catch (error) {
      logger.error("Daily Summary Cron Failed",{error});
    }
  },{timezone:"UTC"});
};