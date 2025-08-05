# Instagram自動返信システム API ドキュメント

## 概要

このシステムはInstagram Webhookを利用して、コメントやDMに対する自動返信機能を提供します。

## システム構成

### データベーススキーマ

#### Reply テーブル
```sql
model Reply {
  id                   Int      @id @default(autoincrement())
  keyword              String   -- 反応するキーワード
  reply                String   -- 返信内容（テキスト形式の場合）
  igAccountId          String   -- IGAccount.idを参照
  postId               String?  -- 特定投稿ID（replyType=1の場合）
  replyType            Int      -- 1:特定投稿, 2:全投稿, 3:ストーリー, 4:ライブ
  matchType            Int      -- 1:完全一致, 2:部分一致
  commentReplyEnabled  Boolean  -- コメント返信有効フラグ
  messageType          String   -- "text" | "template"
  buttons              Button[] -- テキスト用ボタン
  posts                Post[]   -- テンプレート用投稿選択
}
```

#### Post テーブル（投稿選択用）
```sql
model Post {
  id               Int       @id @default(autoincrement())
  replyId          Int       -- Reply.idを参照
  title            String    -- カルーセルのタイトル
  postId           String    -- Instagram投稿ID
  order            Int       -- 表示順序
}
```

#### Button テーブル（テキスト用）
```sql
model Button {
  id        Int     @id @default(autoincrement())
  replyId   Int     -- Reply.idを参照
  title     String  -- ボタンタイトル
  url       String  -- リンクURL
  order     Int     -- 表示順序
}
```

## API エンドポイント

### POST /api/webhooks

Instagram Webhookの受信エンドポイント

#### 処理フロー

1. **Webhook検証** (GET)
   - `hub.verify_token`の確認
   - `hub.challenge`の返却

2. **メッセージ処理** (POST)
   - コメント/DM受信の判定
   - エコーメッセージの除外
   - キーワードマッチング
   - 自動返信送信

## 返信タイプ

### 1. テキスト返信 (`messageType: "text"`)

**データ構造:**
```typescript
{
  messageType: "text",
  reply: "返信テキスト",
  buttons: [
    { title: "ボタン1", url: "https://example.com" }
  ]
}
```

**送信形式:**
- テキストのみ: プレーンテキスト
- ボタン付き: Instagram Button Template

### 2. 投稿選択返信 (`messageType: "template"`)

**データ構造:**
```typescript
{
  messageType: "template",
  posts: [
    { title: "投稿1", postId: "C9abc123def", order: 0 },
    { title: "投稿2", postId: "C9xyz789ghi", order: 1 }
  ]
}
```

**送信形式:**
Instagram Generic Template（カルーセル形式）

```json
{
  "recipient": { "id": "recipient_id" },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "title": "投稿1",
            "default_action": {
              "type": "web_url",
              "url": "https://instagram.com/p/C9abc123def/"
            }
          }
        ]
      }
    }
  }
}
```

## 判定ロジック

### キーワードマッチング

```typescript
// 完全一致 (matchType: 1)
if (reply.matchType === 1 && reply.keyword === messageText) {
  return reply;
}

// 部分一致 (matchType: 2)  
if (reply.matchType === 2 && messageText.includes(reply.keyword)) {
  return reply;
}
```

### 返信タイプ優先順位

1. **特定投稿** (`replyType: 1`) - 投稿IDが一致する場合
2. **全投稿共通** (`replyType: 2`) - すべての投稿に適用
3. **ストーリー** (`replyType: 3`) - ストーリーへの返信
4. **ライブ** (`replyType: 4`) - ライブ配信への返信

## 送信処理

### DM送信 (`sendDMReply`)

```typescript
if (reply.messageType === 'template' && reply.posts?.length > 0) {
  // 投稿選択Template送信
  await sendPostTemplate(instagramId, senderId, reply.posts, accessToken);
} else {
  // テキスト/ボタン送信
  const messageData = createMessageData(senderId, reply.reply, reply.buttons);
  // Instagram Messages API呼び出し
}
```

### コメント返信

Instagram Graph API `/comments/{comment-id}/replies` エンドポイントを使用

## エラーハンドリング

### 安全なログ記録

```typescript
async function safeLogError(message: string) {
  try {
    await prisma.executionLog.create({
      data: { errorMessage: message }
    });
  } catch (dbError) {
    console.error('DB接続エラー:', dbError);
    console.error('元のエラー:', message);
  }
}
```

### 主要なエラータイプ

1. **データベース接続エラー** - ExecutionLogに記録
2. **Instagram API エラー** - レスポンス詳細をログ出力
3. **Webhook検証失敗** - 403 Forbiddenを返却
4. **キーワード不一致** - 処理をスキップ

## 制限事項

### Instagram API制限

- **Generic Template**: 最大10要素
- **Button Template**: 最大3ボタン
- **タイトル長**: 最大80文字
- **デスクトップ非対応**: モバイルのみ表示

### システム制限

- **投稿選択**: 最大10投稿まで
- **ボタン数**: 最大3個まで
- **キーワード長**: データベース制限に依存

## エラー処理・ログ

### エラーログ記録

システムエラーは`ExecutionLog`テーブルに記録されます：

```typescript
async function safeLogError(message: string) {
  try {
    await prisma.executionLog.create({
      data: { errorMessage: message }
    });
  } catch (dbError) {
    // DB接続エラーの場合のみコンソール出力
    console.error('DB接続エラー:', dbError);
  }
}
```

## 今後の拡張予定

### 対応済み機能

- [x] テキスト返信
- [x] ボタン付きテキスト返信
- [x] 投稿選択返信（Generic Template）
- [x] キーワードマッチング（完全/部分一致）
- [x] 投稿タイプ別設定

### 拡張可能機能

- [ ] Postbackボタン対応
- [ ] Media Share Template
- [ ] 条件分岐ロジック
- [ ] スケジュール配信
- [ ] A/Bテスト機能

## 関連ファイル

- **Webhook処理**: `src/app/api/webhooks/route.ts`
- **Instagram API**: `src/lib/instagramApi.ts`
- **型定義**: `src/types/reply.ts`
- **データベーススキーマ**: `prisma/schema.prisma`
- **テンプレート定数**: `src/constants/replyTemplates.ts`

## 参考資料

- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Messenger Platform - Instagram](https://developers.facebook.com/docs/messenger-platform/instagram)
- [Generic Template Documentation](https://developers.facebook.com/docs/messenger-platform/instagram/features/generic-template)