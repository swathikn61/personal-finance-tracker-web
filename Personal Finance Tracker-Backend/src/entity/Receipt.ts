import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Entries } from "./Entries";

// Receipt images live in the database rather than on disk, since hosted servers have ephemeral filesystems
@Entity()
export class Receipt {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => Entries, { onDelete: "CASCADE" })
  @JoinColumn({ name: "entryId" })
  entry!: Entries;

  @Column({ unique: true })
  entryId!: number;

  @Column()
  userId!: number;

  @Column()
  mimeType!: string;

  @Column()
  size!: number;

  @Column({ type: "bytea" })
  data!: Buffer;

  @CreateDateColumn()
  createdAt!: Date;
}
