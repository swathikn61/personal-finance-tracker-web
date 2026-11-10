import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { decimalTransformer } from "../utils/decimalTransformer";

export enum EntryType {
  INCOME = "income",
  EXPENSE = "expense",
}

@Entity()
export class Entries {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, transformer: decimalTransformer })
  amount!: number;

  @Column({ type: "enum", enum: EntryType })
  type!: EntryType;

  @Column()
  category!: string;

  @Column()
  description!: string;

  @Column({ type: "date" })
  date!: string;

  @Column({ default: false })
  hasReceipt!: boolean;

  @ManyToOne(() => User, (user) => user.entries, { eager: false })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: number; 
}