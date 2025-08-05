# Instagram自動返信システム - Genericテンプレート追加計画

## 現在のシステム構造

### データベーススキーマ（Prisma）

```sql
model Reply {
  id                   Int      @id @default(autoincrement())
  keyword              String
  reply                String   // 現在はテキストのみ
  igAccountId          String
  postId               String?
  replyType            Int      // 1: SPECIFIC_POST, 2: ALL_POSTS, 3: STORY, 4: LIVE
  matchType            Int      // 1: EXACT, 2: PARTIAL
  commentReplyEnabled  Boolean
  buttons              Button[] // 既存のボタン機能
  // ...
}

model Button {
  id      Int    @id @default(autoincrement())
  replyId Int
  title   String
  url     String
  order   Int
}
```

### 現在の返信形式
- **テキスト返信**: `reply`フィールドに文字列
- **ボタン付き**: Buttonテーブルでweb_urlボタンを管理

## 修正計画

### 1. データベース拡張

#### Replyテーブルの拡張
```sql
model Reply {
  // 既存フィールド...
  messageType          String   @default("text")     // "text", "template"
  templateType         String?                       // "button", "generic", "media_share"
  templatePayload      Json?                         // Generic用のJSON構造
  // ...
}
```

#### 既存Buttonテーブルの拡張
```sql
model Button {
  id        Int     @id @default(autoincrement())
  reply     Reply   @relation(fields: [replyId], references: [id])
  replyId   Int
  title     String
  url       String?    // web_urlの場合のみ使用
  payload   String?    // postbackの場合のみ使用  
  type      String @default("web_url")  // "web_url", "postback"
  order     Int
}
```

#### 投稿選択用の新テーブル（Postテーブル）
```sql
model Post {
  id               Int       @id @default(autoincrement())
  reply            Reply     @relation(fields: [replyId], references: [id])
  replyId          Int
  title            String    // カルーセルのタイトル
  postId           String    // Instagram投稿ID（必須）
  order            Int       // 表示順序
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

#### Replyテーブルの関係更新
```sql
model Reply {
  // 既存フィールド...
  messageType          String   @default("text")     // "text", "template"
  templateType         String?                       // "button", "generic", "media_share"
  
  // リレーション
  buttons              Button[] // 既存のボタン（text用）
  posts                Post[]   // 新しいGeneric要素（template用）
}
```

### 2. TypeScript型定義の拡張

#### `src/types/reply.ts`
```typescript
// 既存のButton型の拡張
export interface Button {
  id?: number;
  title: string;
  url?: string;        // web_urlの場合のみ
  payload?: string;    // postbackの場合のみ
  type: 'web_url' | 'postback';
  order?: number;
  replyId?: number;
}

// 投稿選択用のPost型
export interface Post {
  id?: number;
  title: string;       // カルーセルのタイトル
  postId: string;      // Instagram投稿ID
  order: number;
  replyId?: number;
}

export interface Reply {
  // 既存フィールド...
  messageType: 'text' | 'template';
  templateType?: 'button' | 'generic' | 'media_share';
  
  // リレーション
  buttons?: Button[];  // テキスト用ボタン
  posts?: Post[];      // Generic要素
}

```

### 3. API修正

#### Instagram API送信ロジック（`src/lib/instagramApi.ts`）
```typescript
// 投稿選択Generic Template送信関数
export async function sendGenericTemplate(
  instagramId: string,
  recipientId: string,
  posts: Post[],
  accessToken: string
) {
  const payload = {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: posts.map(post => ({
            title: post.title,
            default_action: {
              type: "web_url",
              url: `https://instagram.com/p/${post.postId}/`
            }
          }))
        }
      }
    }
  };
  
  // Instagram API呼び出し
  return await sendInstagramMessage(instagramId, payload, accessToken);
}

// 返信送信の統合関数
export async function sendReply(reply: Reply, recipientId: string, accessToken: string) {
  const instagramId = reply.igAccountId;
  
  if (reply.messageType === 'template' && reply.templateType === 'generic' && reply.posts) {
    // Generic Template送信
    return await sendGenericTemplate(instagramId, recipientId, reply.posts, accessToken);
  } else {
    // 既存のテキスト/ボタン送信
    return await sendTextWithButtons(instagramId, recipientId, reply.reply, reply.buttons, accessToken);
  }
}
```

### 4. UI/UX修正

#### フォームコンポーネント拡張
```typescript
// ReplyForm.tsx に追加
const [messageType, setMessageType] = useState<'text' | 'template'>('text');
const [templateType, setTemplateType] = useState<'button' | 'generic'>('button');
const [posts, setPosts] = useState<Post[]>([]);

// 投稿選択管理
const addPost = () => {
  if (posts.length < 10) {
    setPosts([...posts, {
      title: '',
      postId: '',
      order: posts.length
    }]);
  }
};

const removePost = (index: number) => {
  setPosts(posts.filter((_, i) => i !== index));
};

const updatePost = (index: number, field: 'title' | 'postId', value: string) => {
  const updatedPosts = [...posts];
  updatedPosts[index][field] = value;
  setPosts(updatedPosts);
};
```

### 5. バリデーション

#### Zodスキーマ拡張
```typescript
const postSchema = z.object({
  title: z.string().min(1, 'タイトルは必須').max(80, 'タイトルは80文字以内'),
  postId: z.string().min(1, '投稿IDは必須'),
  order: z.number()
});

const buttonSchema = z.object({
  type: z.enum(['web_url', 'postback']),
  title: z.string().min(1, 'タイトルは必須'),
  url: z.string().url().optional(),
  payload: z.string().optional(),
  order: z.number()
}).refine(data => {
  if (data.type === 'web_url') return !!data.url;
  if (data.type === 'postback') return !!data.payload;
  return true;
}, { message: 'web_urlにはURL、postbackにはpayloadが必要です' });

const replySchema = z.object({
  // 既存フィールド...
  messageType: z.enum(['text', 'template']),
  templateType: z.enum(['button', 'generic', 'media_share']).optional(),
  buttons: z.array(buttonSchema).optional(),     // テキスト用ボタン
  posts: z.array(postSchema).max(10, '投稿選択は最大10個').optional()  // 投稿選択
});
```

## 実装ルール

### 制約事項
1. **投稿選択数**: 最大10投稿
2. **文字数制限**: タイトル80文字以内
3. **投稿ID**: Instagram投稿ID形式で必須入力

### 後方互換性
- 既存の`Button`テーブルは`messageType="text"`で引き続き使用
- 新しい`Post`テーブルは`messageType="template"`かつ`templateType="generic"`で使用
- 既存のReplyデータに影響なし（デフォルト値で対応）
- 簡素化されたユーザーインターフェース

### エラーハンドリング
- Instagram API制限（デスクトップ非対応）のエラー処理
- 画像URL検証
- テンプレート構造検証

## 実装順序

1. **データベースマイグレーション**
   - Buttonテーブルに`type`、`payload`フィールド追加
   - Post、PostButtonテーブル作成
   - Replyテーブルに`messageType`、`templateType`追加

2. **型定義とスキーマ更新**
   - `src/types/reply.ts`更新
   - PostbackPayload型追加

3. **API送信ロジック実装**
   - `sendGenericTemplate`関数実装
   - `sendReply`統合関数実装
   - postback処理のWebhook拡張

4. **UI/フォーム拡張**
   - メッセージタイプ選択フォーム
   - Generic要素管理UI
   - ボタン管理UI

5. **バリデーション実装**
   - Zodスキーマ更新
   - フォーム検証実装

6. **テスト実装**
   - Genericテンプレート送信テスト
   - postback処理テスト
   - UIコンポーネントテスト

## Instagram Generic Template仕様

### Facebook Messenger Platform準拠
- **公式ドキュメント**: https://developers.facebook.com/docs/messenger-platform/instagram/features/generic-template
- **テンプレートタイプ**: `"template_type": "generic"`
- **カルーセル表示**: 水平スクロール可能なパネル形式

### JSON構造例
```json
{
  "recipient": {
    "id": "621065597076093"
  },
  "message": {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [
          {
            "title": "商品1",
            "subtitle": "この商品の詳細説明です",
            "image_url": "https://example.com/image1.jpg",
            "default_action": {
              "type": "web_url",
              "url": "https://example.com/product1"
            },
            "buttons": [
              {
                "type": "web_url",
                "url": "https://example.com/product1",
                "title": "詳細を見る"
              },
              {
                "type": "postback",
                "title": "購入する",
                "payload": "BUY_PRODUCT_1"
              }
            ]
          }
        ]
      }
    }
  }
}
```

## 技術要件

### 依存関係
- 既存のPrisma/PostgreSQL構成を継続使用
- NextAuth.js認証システムとの統合
- Instagram Graph APIとの互換性確保

### パフォーマンス考慮事項
- Generic要素の画像は外部URL参照（サーバー負荷軽減）
- 正規化されたテーブル構造でクエリパフォーマンス確保
- 既存APIエンドポイントとの統合

### セキュリティ
- 画像URL検証（HTTPSのみ許可）
- XSS対策（ユーザー入力のサニタイズ）
- Instagram API利用制限の遵守

## データベースクエリ例

### 返信リスト取得
```typescript
const replies = await prisma.reply.findMany({
  include: {
    buttons: true,    // テキスト用ボタン
    posts: {          // 投稿選択
      orderBy: { order: 'asc' }
    }
  }
});
```


### 投稿選択Genericテンプレート作成
```typescript
const reply = await prisma.reply.create({
  data: {
    keyword: 'test',
    reply: '',
    messageType: 'template',
    templateType: 'generic',
    igAccountId: 'account_id',
    replyType: 1,
    matchType: 1,
    commentReplyEnabled: false,
    posts: {
      create: [
        {
          title: 'おすすめ投稿1',
          postId: 'C9abc123def',
          order: 0
        },
        {
          title: 'おすすめ投稿2',
          postId: 'C9xyz789ghi',
          order: 1
        }
      ]
    }
  }
});
```