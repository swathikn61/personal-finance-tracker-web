import type { MigrationInterface, QueryRunner } from "typeorm";

// synchronize drops and re-adds a column when its type changes, which would lose every amount.
// Migrations run first, so altering the types here leaves synchronize with nothing to change.
// The duplicate rows must also go first, or synchronize can't add the unique constraint.
export class DecimalAmountsAndUniqueDailySummary1793404800000 implements MigrationInterface {
  name = "DecimalAmountsAndUniqueDailySummary1793404800000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable("entries")) {
      await queryRunner.query(`ALTER TABLE "entries" ALTER COLUMN "amount" TYPE decimal(12,2)`);
    }

    if (await queryRunner.hasTable("daily_summary")) {
      await queryRunner.query(`ALTER TABLE "daily_summary"
        ALTER COLUMN "totalIncome" TYPE decimal(12,2),
        ALTER COLUMN "totalExpense" TYPE decimal(12,2),
        ALTER COLUMN "balance" TYPE decimal(12,2)`);

      // Keep only the newest row for each user and day
      await queryRunner.query(`DELETE FROM "daily_summary" older
        USING "daily_summary" newer
        WHERE older."userId" = newer."userId"
          AND older."date" = newer."date"
          AND older."id" < newer."id"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "entries" ALTER COLUMN "amount" TYPE integer`);
    await queryRunner.query(`ALTER TABLE "daily_summary"
      ALTER COLUMN "totalIncome" TYPE integer,
      ALTER COLUMN "totalExpense" TYPE integer,
      ALTER COLUMN "balance" TYPE integer`);
  }
}
