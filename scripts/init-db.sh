#!/bin/bash
set -e

# マイグレーションを実行
npm run prisma:migrate

# シードデータを投入
npm run prisma:seed 