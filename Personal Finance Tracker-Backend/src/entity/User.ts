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
  
}