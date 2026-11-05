// import { Request, Response } from "express";
// import { AppDataSource } from "../utils/database";
// import { DailySummary } from "../entity/DailySummary";
// import { User } from "../entity/User";
// import { generateDailySummaryImage } from "../utils/generateImage";
// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { s3 } from "../config/s3";
// import { v4 as uuidv4 } from "uuid";

// export const ImageController=async(req: any,res: Response) => {
//   try {
//     const userId=req.user.userId; 
//     const summaryRepository=AppDataSource.getRepository(DailySummary);
//     const userRepository=AppDataSource.getRepository(User);

//     const summary=await summaryRepository.findOneBy({userId});

//     if (!summary){
//       return res.status(404).json({message:"No summary found for this user"});
//     }

//     const user=await userRepository.findOneBy({ id: userId });
//     if (!user){
//       return res.status(404).json({message:"User not found"});
//     }

//     const svgImage=generateDailySummaryImage(user.name,summary.date,summary.totalIncome,summary.totalExpense,summary.balance);

//     const fileName=`daily-summary/${userId}/${uuidv4()}.svg`;

//     console.log(await s3.send(
//       new PutObjectCommand({
//         Bucket:process.env.AWS_BUCKET_NAME,
//         Key:fileName,
//         Body:Buffer.from(svgImage),
//         ContentType:"image/svg+xml",
//       })
//     ));

//     const imageUrl=`https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
//     summary.imageUrl = imageUrl;
//     await summaryRepository.save(summary);
//     return res.status(200).json({message: "Image generated successfully",imageUrl,});
//   }catch(error){
//     console.error(error);
//     return res.status(500).json({message:"Failed to generate image"});
//   }
// };