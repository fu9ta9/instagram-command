# Feature構成移行ルール

## 移行の目的

現在のレイヤー別構成からfeature別構成への移行により、以下のメリットを実現します：

1. **認知負荷の軽減**: 機能修正時に関連ファイルがすべて同じフォルダに配置
2. **変更影響範囲の局所化**: 機能変更時の影響範囲が明確
3. **スケーラビリティ**: 新機能追加時に既存コードへの影響を最小化

## 移行前後の構成比較

### 移行前（現在）: レイヤー別構成
```
src/
├── app/              # ページとAPIルート
├── components/       # UIコンポーネント
├── hooks/           # カスタムフック
├── lib/             # 外部サービス統合
├── store/           # グローバル状態管理
└── types/           # 型定義
```

### 移行後: Feature別構成
```
src/
├── features/        # 機能ごとの完全分離
├── shared/          # 共通リソース
├── lib/             # 外部サービス統合（維持）
├── app/             # Next.js App Router（維持、componentsは参照のみ）
└── store/           # グローバル状態管理（維持）
```

## Feature分類

現在のコードベースから以下の機能を特定し、対応するfeatureフォルダを作成します：

### 1. auth (認証機能)
**対象ファイル:**
- `app/login/` → `features/auth/pages/login/`
- `app/register/` → `features/auth/pages/register/`
- `app/auth/` → `features/auth/pages/error/`
- `components/LoginForm.tsx` → `features/auth/components/LoginForm.tsx`
- `components/LogoutButton.tsx` → `features/auth/components/LogoutButton.tsx`
- `components/AuthProvider.tsx` → `features/auth/components/AuthProvider.tsx`
- `app/api/auth/` → `features/auth/api/`

### 2. instagram (Instagram連携機能)
**対象ファイル:**
- `app/connect/` → `features/instagram/pages/connect/`
- `app/instagram-callback/` → `features/instagram/pages/callback/`
- `app/facebook-callback/` → `features/instagram/pages/facebook-callback/`
- `app/facebook-connect/` → `features/instagram/pages/facebook-connect/`
- `components/FacebookConnect.tsx` → `features/instagram/components/FacebookConnect.tsx`
- `components/InstagramPostList.tsx` → `features/instagram/components/PostList.tsx`
- `components/InstagramThumbnails.tsx` → `features/instagram/components/Thumbnails.tsx`
- `components/instagram-post-analyzer.tsx` → `features/instagram/components/PostAnalyzer.tsx`
- `lib/instagram.ts` → `features/instagram/services/instagram.ts`
- `lib/instagramApi.ts` → `features/instagram/services/api.ts`
- `app/api/instagram/` → `features/instagram/api/`

### 3. replies (自動返信機能)
**対象ファイル:**
- `app/reply/` → `features/replies/pages/`
- `components/ReplyForm.tsx` → `features/replies/components/ReplyForm.tsx`
- `components/ReplyList.tsx` → `features/replies/components/ReplyList.tsx`
- `components/ReplyEditModal.tsx` → `features/replies/components/ReplyEditModal.tsx`
- `components/ReplyRegistrationModal.tsx` → `features/replies/components/ReplyRegistrationModal.tsx`
- `components/KeywordEditForm.tsx` → `features/replies/components/KeywordEditForm.tsx`
- `store/replyStore.ts` → `features/replies/store/replyStore.ts`
- `types/reply.ts` → `features/replies/types/reply.ts`
- `constants/replyTemplates.ts` → `features/replies/constants/templates.ts`
- `app/api/replies/` → `features/replies/api/`

### 4. search (検索機能)
**対象ファイル:**
- `app/search/` → `features/search/pages/`
- `store/searchStore.ts` → `features/search/store/searchStore.ts`
- `app/api/instagram/search/` → `features/search/api/`

### 5. dashboard (ダッシュボード)
**対象ファイル:**
- `app/dashboard/` → `features/dashboard/pages/`

### 6. subscription (サブスクリプション管理)
**対象ファイル:**
- `app/plan/` → `features/subscription/pages/plan/`
- `hooks/useMembership.ts` → `features/subscription/hooks/useMembership.ts`
- `lib/stripe.ts` → `features/subscription/services/stripe.ts`
- `app/api/create-checkout-session/` → `features/subscription/api/create-checkout-session/`
- `app/api/cancel-subscription/` → `features/subscription/api/cancel-subscription/`
- `app/api/subscription/` → `features/subscription/api/subscription/`
- `app/api/membership/` → `features/subscription/api/membership/`
- `app/api/upgrade/` → `features/subscription/api/upgrade/`

### 7. manual (マニュアル機能)
**対象ファイル:**
- `app/manual/` → `features/manual/pages/`

### 8. shared (共通リソース)
**対象ファイル:**
- `components/ui/` → `shared/components/ui/` (shadcn/ui)
- `components/layouts/` → `shared/components/layout/`
- `components/Header.tsx` → `shared/components/layout/Header.tsx`
- `components/Footer.tsx` → `shared/components/layout/Footer.tsx`
- `components/Sidebar.tsx` → `shared/components/layout/Sidebar.tsx`
- `components/Modal.tsx` → `shared/components/common/Modal.tsx`
- `components/ErrorMessage.tsx` → `shared/components/common/ErrorMessage.tsx`
- `hooks/use-mobile.tsx` → `shared/hooks/use-mobile.tsx`
- `contexts/` → `shared/contexts/`
- `lib/utils.ts` → `shared/utils/`

## 移行ルール

### 1. インポートパス変更ルール

**Before:**
```typescript
import { LoginForm } from '@/components/LoginForm'
import { useReplies } from '@/hooks/useReplies'
```

**After:**
```typescript
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useReplies } from '@/features/replies/hooks/useReplies'
```

### 2. 型定義移行ルール

- 機能固有の型 → `features/{feature}/types/`
- 共通の型 → `shared/types/`
- API関連の型 → 各featureの`types/api.types.ts`

### 3. APIルート移行ルール

- APIルートは物理的には`app/api/`に残す
- ロジックは`features/{feature}/api/`に移動
- `app/api/`のルートファイルは薄いラッパーとして機能

### 4. ページコンポーネント移行ルール

- ページコンポーネントは`features/{feature}/pages/`に移動
- `app/`ディレクトリのページファイルは薄いラッパーとして機能
- Clientコンポーネントは対応するfeatureフォルダに移動

### 5. ストア移行ルール

- 機能固有のストア → `features/{feature}/store/`
- グローバルストア → `store/`（そのまま維持）

## 移行時の注意事項

### 1. 循環参照の回避

- feature間の直接的な依存関係は禁止
- 共通機能は`shared/`を経由
- 必要に応じて`shared/services/`にファサードパターンを実装

### 2. テストファイルの配置

- 各featureフォルダ内に`tests/`または`__tests__/`フォルダを作成
- コンポーネントと同じディレクトリに`.test.tsx`ファイルを配置

### 3. バレルエクスポートの活用

各featureフォルダに`index.ts`を作成し、外部へのAPIを明確化：

```typescript
// features/auth/index.ts
export { LoginForm } from './components/LoginForm'
export { useAuth } from './hooks/useAuth'
export type { AuthUser } from './types/auth.types'
```

### 4. 共通コンポーネントの判断基準

以下の条件を満たすコンポーネントは`shared/`に配置：
- 3つ以上のfeatureで使用される
- 機能に依存しない汎用的な機能
- UIライブラリ（shadcn/ui）のコンポーネント

## 移行手順

### Phase 1: 基盤整備
1. E2Eテストの実行と結果記録
2. `features/`ディレクトリ構造の作成
3. `shared/`ディレクトリ構造の作成

### Phase 2: 機能別移行（小規模から開始）
1. `manual` feature（最小影響）
2. `search` feature
3. `dashboard` feature
4. `subscription` feature
5. `replies` feature
6. `instagram` feature
7. `auth` feature（最大影響）

### Phase 3: 検証とクリーンアップ
1. 各Phase後のE2Eテスト実行
2. 不要なファイルの削除
3. インポートパスの最適化
4. ドキュメント更新

## 回復計画

### 問題発生時の対処

1. **テスト失敗時**
   - 即座に前のコミットにロールバック
   - 問題箇所を特定し、小さな単位で再実行

2. **ビルドエラー時**
   - TypeScriptエラーを優先して解決
   - インポートパスの確認
   - 循環参照の検出

3. **機能不正動作時**
   - E2Eテストで問題箇所を特定
   - feature単位での動作確認
   - 段階的なロールバック

## 完了基準

1. すべてのE2Eテストがpass
2. TypeScriptビルドエラーゼロ
3. 各featureが独立して動作
4. インポートパスが新しい構成に対応
5. 循環参照がゼロ

## Services と Hooks の役割分担

### Services の役割
- **データ取得・送信**: API呼び出し、外部サービスとの通信
- **ビジネスロジック**: データ変換、計算処理、バリデーション
- **純粋関数**: 副作用のない処理、テストしやすい関数
- **再利用可能な処理**: 複数のhooksで共通して使用される処理

### Hooks の役割
- **React固有の状態管理**: useState, useEffect等のReactフック
- **コンポーネントとの結合**: UIの状態とビジネスロジックの橋渡し
- **副作用の管理**: API呼び出しのタイミング制御、イベントハンドラ
- **状態の同期**: Zustandストアとローカル状態の同期

### 分離の指針
- 100行を超えるhooksは責務を見直し、services層への分離を検討
- API呼び出しロジックは必ずservices層に配置
- 純粋関数（入力に対して常に同じ出力）はservices層に配置
- React固有の状態管理のみhooks層に残す

## Server/Client Components 設計方針

### サーバーコンポーネント適用場面
- 初期データ取得（URL params、DB検索など）
- 重い計算処理
- 機密API呼び出し
- SEOが重要なページ

### クライアントコンポーネント適用場面  
- インタラクティブUI（検索、ソート、フィルタ）
- リアルタイム更新
- ローカル状態管理
- ユーザー操作への即座の反応

### ハイブリッド構成パターン
- サーバーコンポーネントで初期データ取得
- クライアントコンポーネントでインタラクティブ操作
- サーバーアクションで重い処理

## Services層の "use client" ディレクティブ使用ルール

### **"use client" を必須とする場合**
- **ブラウザAPI使用**: localStorage、sessionStorage、window、document等
- **クライアント専用ライブラリ**: React hooks、DOM操作ライブラリ等
- **リアルタイム処理**: WebSocket、EventSource等

```typescript
// ❌ サーバーでは実行不可
"use client"
export class StorageService {
  static save() {
    localStorage.setItem(key, value) // ブラウザAPI
  }
}
```

### **"use client" を付けない場合**
- **純粋関数**: 入力に対して常に同じ出力を返す関数
- **データ変換処理**: ソート、フィルタリング、計算等
- **バリデーション**: 入力値検証、フォーマット確認等
- **サーバー・クライアント共通処理**: ユーティリティ関数等

```typescript
// ✅ サーバー・クライアント両方で実行可能
export class PostService {
  static sortPosts(posts: Post[], sortType: string) {
    return posts.sort((a, b) => a[sortType] - b[sortType]) // 純粋関数
  }
}
```

### **API呼び出し処理の特別ルール**
- **クライアントサイドAPI呼び出し**: `"use client"` 必須
- **サーバーサイドAPI呼び出し**: `"use client"` 不要（サーバーアクション推奨）

```typescript
// クライアントサイド（現在の実装）
"use client"
export class InstagramApiService {
  static async fetchPosts() {
    return fetch('/api/instagram/posts') // クライアントからInternal API
  }
}

// サーバーサイド（推奨）
export async function fetchInstagramPosts() {
  'use server'
  return await externalInstagramAPI.getPosts() // サーバーから外部API直接
}
```

### 判断フローチャート
```
Service層の関数を作成する場合：

1. ブラウザAPIを使用する？
   → Yes: "use client" 必須

2. 外部APIを呼び出す？
   → Yes: 用途によって判断
     - クライアントサイド操作なら "use client"
     - 初期データ取得ならサーバーアクション

3. 純粋関数（副作用なし）？
   → Yes: "use client" 不要（共通関数として利用可能）

4. React hooks や DOM操作を含む？
   → Yes: "use client" 必須
```

## メンテナンス指針

### 新機能追加時

1. 新しいfeatureフォルダを作成
2. 必要な内部構造（components, hooks, services等）を整備
3. `index.ts`でエクスポートAPIを定義
4. 他のfeatureへの影響を最小化

### 既存機能修正時

1. 関連するfeatureフォルダ内で完結
2. `shared/`の変更は影響範囲を慎重に検討
3. feature間の新しい依存関係の追加は避ける

この移行により、コードベースの保守性と開発効率が大幅に向上し、AI駆動開発における認知負荷が軽減されることが期待されます。