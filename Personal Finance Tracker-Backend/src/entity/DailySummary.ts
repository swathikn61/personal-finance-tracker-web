import { Entity, PrimaryGeneratedColumn,Column, ManyToOne,JoinColumn,Unique } from "typeorm";
import { User } from "./User";
import { decimalTransformer } from "../utils/decimalTransformer";

@Entity()
@Unique(["userId","date"])
export class DailySummary{
    @PrimaryGeneratedColumn()
    id!:number;

    @Column({type:"date"})
    date!:string;

    @Column({type:"decimal",precision:12,scale:2,transformer:decimalTransformer})
    totalIncome!:number;

    @Column({type:"decimal",precision:12,scale:2,transformer:decimalTransformer})
    totalExpense!:number;

    @Column({type:"decimal",precision:12,scale:2,transformer:decimalTransformer})
    balance!:number;

    @ManyToOne(()=>User,user=>user.entries,{eager:false})
    @JoinColumn({name:"userId"})
    user!:User;

    @Column()
    userId!: number;
}
