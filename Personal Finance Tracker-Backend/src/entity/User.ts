import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Entries } from "./Entries";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; 

  @OneToMany(() => Entries, (entries) => entries.user)
  entries!: Entries[];

  @Column({ nullable: true })
  refreshToken!: string;

  // ISO 4217 code used only for display formatting; amounts are never converted
  @Column({ length: 3, default: "INR" })
  currency!: string;

}