import type { Request,Response } from "express";
import { AppDataSource} from "../utils/database";
import { Entries } from "../entity/Entries";
import { Parser } from 'json2csv';
import logger from "../utils/logger";

export class ExportController{
    static async exportEntriesToCSV(req:Request,res:Response){
        try{
            const entriesRepository=AppDataSource.getRepository(Entries)
             const userId=(req as any).user.userId;
            const entries=await entriesRepository.find({
                where:{userId}
            })

             if (!entries.length) {
                return res.status(404).json({message:"No entries found for this user"});
            }

            const fields=["id","amount","type","category","description","date"];
            const json2csv=new Parser({fields});
            const csv=json2csv.parse(entries)

            res.header("Content-Type", "text/csv");
            res.attachment("entries.csv");
            logger.info("Exported to CSV Successfully",{userId});
            return res.send(csv);
        } catch(error) {
            logger.error("Failed to export entry",{error});
            return res.status(500).json({ message:"Error exporting data"});
  }
};
}