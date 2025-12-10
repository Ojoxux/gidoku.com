import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const MIGRATIONS_DIR = join(process.cwd(), "migrations");

interface MigrationFile {
  name: string;
  sql: string;
}

/**
 * マイグレーションファイルを読み込み
 */
function loadMigrations(): MigrationFile[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f: string) => f.endsWith(".sql"))
    .sort();

  return files.map((file: string) => ({
    name: file,
    sql: readFileSync(join(MIGRATIONS_DIR, file), "utf-8"),
  }));
}

/**
 * マイグレーション実行コマンドを生成
 */
function generateMigrationCommands(): string[] {
  const migrations = loadMigrations();
  const commands: string[] = [];

  migrations.forEach((migration) => {
    console.log(`📄 Migration: ${migration.name}`);
    commands.push(
      `wrangler d1 execute gidoku-db --local --file=migrations/${migration.name}`
    );
  });

  return commands;
}

/**
 * セットアップ手順を表示
 */
function printSetupInstructions() {
  console.log("🚀 Gidoku Database Setup\n");

  console.log("Step 1: D1データベースを作成");
  console.log("----------------------------------------");
  console.log("# ローカル開発用");
  console.log("wrangler d1 create gidoku-db --local\n");
  console.log("# 本番用");
  console.log("wrangler d1 create gidoku-db\n");

  console.log("Step 2: wrangler.jsonc に設定を追加");
  console.log("----------------------------------------");
  console.log(`{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "gidoku-db",
      "database_id": "<本番用のID>"
    }
  ]
}\n`);

  console.log("Step 3: マイグレーションを実行");
  console.log("----------------------------------------");
  const commands = generateMigrationCommands();
  commands.forEach((cmd) => console.log(cmd));
  console.log();

  console.log("Step 4: (オプション) サンプルデータを投入");
  console.log("----------------------------------------");
  console.log("pnpm run db:seed\n");

  console.log("✨ セットアップ完了後、以下のコマンドで開発サーバーを起動:");
  console.log("pnpm run dev\n");
}

// スクリプト実行
printSetupInstructions();
