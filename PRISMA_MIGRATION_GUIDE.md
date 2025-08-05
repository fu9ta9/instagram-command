# Prisma Migration Guide

このガイドは、Prismaを使用したデータベーススキーマ変更の安全な手順を説明します。

## ⚠️ 重要: `prisma db push` の使用禁止

**`npx prisma db push` は本番環境では絶対に使用しないでください。**

### 禁止理由
- データ損失のリスクが高い
- マイグレーション履歴が残らない
- ロールバックが困難
- チーム間でのスキーマ変更が追跡できない

## ✅ 推奨: Migration を使用した安全な手順

### 1. 開発環境でのスキーマ変更

```bash
# 1. スキーマファイルを編集
# prisma/schema.prisma を変更

# 2. マイグレーションを作成・適用
npx prisma migrate dev --name [変更内容を表す名前]
# 例: npx prisma migrate dev --name add-user-profile-fields

# 3. 生成されたマイグレーションファイルを確認
# prisma/migrations/[timestamp]_[name]/migration.sql をレビュー
```

### 2. 本番環境への適用

```bash
# 1. マイグレーションを本番環境に適用
npx prisma migrate deploy

# 2. Prismaクライアントを再生成（必要に応じて）
npx prisma generate
```

## 🔒 データ損失を防ぐベストプラクティス

### 1. バックアップの取得（本番環境）

```bash
# PostgreSQLの場合
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# またはSupabaseダッシュボードからバックアップを作成
```

### 2. 危険な変更の事前確認

以下の変更は特に注意が必要です：

**高リスク変更:**
- カラムの削除
- テーブルの削除
- データ型の変更（互換性なし）
- NOT NULL制約の追加（既存データがNULLの場合）
- UNIQUE制約の追加（重複データがある場合）

**対処法:**
```bash
# 変更内容を事前確認（実際には適用されない）
npx prisma migrate diff --from-migrations ./prisma/migrations --to-schema-datamodel ./prisma/schema.prisma
```

### 3. 段階的な変更

**例: カラム削除の安全な手順**

```sql
-- Step 1: カラムをオプショナルにする
ALTER TABLE "User" ALTER COLUMN "oldField" DROP NOT NULL;

-- Step 2: アプリケーションコードからカラム使用を削除してデプロイ

-- Step 3: カラムを削除
ALTER TABLE "User" DROP COLUMN "oldField";
```

## 📋 マイグレーション実行チェックリスト

### 開発環境
- [ ] スキーマ変更を実装
- [ ] `prisma migrate dev` でマイグレーション作成
- [ ] 生成されたSQLファイルをレビュー
- [ ] ローカルでの動作確認
- [ ] テストの実行・パス確認

### 本番環境
- [ ] データベースバックアップ取得
- [ ] マイグレーションファイルの最終確認
- [ ] メンテナンス時間の設定（大きな変更の場合）
- [ ] `prisma migrate deploy` 実行
- [ ] アプリケーションの動作確認
- [ ] ロールバック準備（必要に応じて）

## 🚨 トラブルシューティング

### マイグレーション失敗時の対処

```bash
# 1. マイグレーション状態の確認
npx prisma migrate status

# 2. 失敗したマイグレーションのマーク（解決後）
npx prisma migrate resolve --applied [migration_name]

# 3. 強制リセット（開発環境のみ）
npx prisma migrate reset
```

### よくあるエラーと解決策

**Error: Migration failed**
- マイグレーションSQLを手動確認
- データ整合性の問題を特定・修正
- 必要に応じて手動でSQLを実行

**Error: Schema drift detected**
```bash
# データベースとスキーマの差分を確認
npx prisma db pull
# または
npx prisma migrate diff
```

## 📝 マイグレーション命名規則

分かりやすく一貫した命名を使用してください：

```bash
# 良い例
npx prisma migrate dev --name add-user-email-verification
npx prisma migrate dev --name update-order-status-enum
npx prisma migrate dev --name remove-deprecated-fields

# 悪い例
npx prisma migrate dev --name fix
npx prisma migrate dev --name update
npx prisma migrate dev --name changes
```

## 🔄 ロールバック戦略

### 1. マイグレーションのロールバック

```bash
# 特定のマイグレーションまで戻す
npx prisma migrate reset
# その後、必要なマイグレーションを再適用
```

### 2. データベースからの復旧

```bash
# バックアップからの復元
psql $DATABASE_URL < backup_20240804_120000.sql
```

## 🏗️ 環境別設定

### 開発環境 (.env.local)
```bash
DATABASE_URL="postgresql://localhost:5432/myapp_dev"
```

### 本番環境 (.env.production)
```bash
DATABASE_URL="postgresql://prod-server:5432/myapp"
```

## 📚 参考リンク

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Migration Best Practices](https://www.prisma.io/docs/guides/database/production-troubleshooting)
- [Schema Evolution Strategies](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)

---

**重要: このガイドを必ず遵守し、安全なデータベース運用を心がけてください。**