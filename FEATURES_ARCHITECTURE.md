# Features Architecture & 3回ルール開発ガイド

このドキュメントは、Claude Codeを使用した開発における、Features構成と3回ルールの実践ガイドです。

## Features構成の概要

### ディレクトリ構造
```
src/
├── features/                     # 機能ごとの完全分離
│   ├── auth/                     # 認証機能
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── __tests__/
│   ├── instagram/                # Instagram連携機能
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── __tests__/
│   ├── replies/                  # 自動返信機能
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── __tests__/
│   └── dashboard/                # ダッシュボード機能
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── __tests__/
├── shared/                       # 共通リソース
│   ├── components/
│   │   ├── ui/                   # shadcn/ui コンポーネント
│   │   ├── layout/               # レイアウト系
│   │   └── common/               # 汎用コンポーネント
│   ├── hooks/                    # 汎用フック
│   ├── services/                 # 汎用サービス
│   ├── utils/                    # ユーティリティ
│   └── types/                    # 共通型定義
├── lib/                          # 外部サービス統合
│   ├── prisma.ts
│   ├── stripe.ts
│   └── nextauth.ts
├── app/                          # Next.js App Router
└── store/                        # グローバル状態管理
```

## 3回ルールの実践

### 基本原則
1. **1回目**: そのまま実装（feature内で完結）
2. **2回目**: コピー&ペーストで実装（まだ共通化しない）
3. **3回目**: 共通化を検討（shared層への移動）

### 実践例

#### 1回目：feature内で実装
```typescript
// features/auth/utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
```

#### 2回目：別featureでコピー&ペースト
```typescript
// features/replies/utils/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// まだ共通化しない - 将来的に異なる要件が出る可能性
```

#### 3回目：共通化の実行
```typescript
// shared/utils/validation.ts
export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  password: (password: string): boolean => {
    return password.length >= 8;
  },
  
  required: (value: string): boolean => {
    return value.trim().length > 0;
  }
};

// features/auth/hooks/useAuth.ts
import { validators } from '@/shared/utils/validation';

export function useAuth() {
  const validateForm = (email: string, password: string) => {
    return validators.email(email) && validators.password(password);
  };
  // ...
}
```

## Claude Codeでの開発指示例

### 新機能開発時の指示
```
「features/analytics という新しい機能を作成してください。
以下の構成で実装してください：

- components/AnalyticsChart.tsx
- hooks/useAnalytics.ts
- services/analyticsService.ts
- types/analytics.types.ts

shared/components/ui のコンポーネントを活用してください。」
```

### 既存機能修正時の指示
```
「features/instagram/components/PostAnalyzer.tsx を修正して、
フィルター機能を追加してください。
関連するhooks、services、typesも併せて更新してください。」
```

### 共通化検討時の指示
```
「以下のコードが3箇所以上で使われています。
shared層への共通化を検討してください：

- features/auth/utils/dateFormatter.ts
- features/replies/utils/dateFormatter.ts
- features/instagram/utils/dateFormatter.ts」
```

## 依存関係のルール

### 許可される依存関係
```typescript
✅ features/auth → shared/
✅ features/instagram → shared/
✅ features/replies → shared/
✅ app/ → features/
✅ app/ → shared/
```

### 禁止される依存関係
```typescript
❌ features/auth → features/instagram
❌ features/instagram → features/replies
❌ shared/ → features/
❌ lib/ → features/
```

## 共通化の判断基準

### 共通化すべき場合
- [ ] 3つ以上のfeatureで同じコードを使用
- [ ] ビジネスロジックに依存しない汎用的な処理
- [ ] バグ修正時に複数箇所を修正する必要がある
- [ ] 将来的に仕様変更の可能性が低い

### 共通化しない場合
- [ ] 2つ以下のfeatureでのみ使用
- [ ] 将来的に異なる実装になる可能性が高い
- [ ] ビジネスロジックに強く依存している
- [ ] 各featureで微妙に異なる要件がある

## 実装パターン

### 1. Composition Pattern
```typescript
// shared/components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  // 汎用的なモーダル機能
}

// features/auth/components/LoginModal.tsx
import { Modal } from '@/shared/components/ui/Modal';

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ログイン">
      <LoginForm />
    </Modal>
  );
}
```

### 2. Custom Hooks Pattern
```typescript
// shared/hooks/useApi.ts
export function useApi<T>(url: string) {
  // 汎用的なAPI呼び出し処理
}

// features/instagram/hooks/useInstagramPosts.ts
import { useApi } from '@/shared/hooks/useApi';

export function useInstagramPosts() {
  const { data, loading, error } = useApi<InstagramPost[]>('/api/instagram/posts');
  
  // Instagram固有のロジック
  const filterPosts = (keyword: string) => {
    return data?.filter(post => post.caption.includes(keyword)) || [];
  };
  
  return { posts: data, loading, error, filterPosts };
}
```

### 3. Service Layer Pattern
```typescript
// shared/services/apiClient.ts
export class ApiClient {
  async get<T>(url: string): Promise<T> {
    // 汎用的なGET処理
  }
  
  async post<T>(url: string, data: any): Promise<T> {
    // 汎用的なPOST処理
  }
}

// features/instagram/services/instagramService.ts
import { ApiClient } from '@/shared/services/apiClient';

export class InstagramService {
  constructor(private apiClient: ApiClient) {}
  
  async getPosts(): Promise<InstagramPost[]> {
    return this.apiClient.get<InstagramPost[]>('/api/instagram/posts');
  }
  
  async analyzePost(postId: string): Promise<PostAnalysis> {
    return this.apiClient.post<PostAnalysis>('/api/instagram/analyze', { postId });
  }
}
```

## リファクタリングのタイミング

### 定期的なレビュー
- **週次**: 重複コードの確認
- **月次**: 共通化の検討
- **四半期**: アーキテクチャの見直し

### 共通化のチェックリスト
```typescript
// 共通化前のチェックリスト
const shouldExtractToShared = {
  usageCount: 3, // 3箇所以上で使用
  isGeneric: true, // 汎用的な処理
  isStable: true, // 仕様変更の可能性が低い
  hasNoDependencies: true // 特定のビジネスロジックに依存しない
};
```

## トラブルシューティング

### よくある問題と解決策

#### 1. 循環依存
```typescript
// 問題：features間での相互依存
❌ features/auth → features/instagram
❌ features/instagram → features/auth

// 解決：shared層を経由
✅ features/auth → shared/types/user.types.ts
✅ features/instagram → shared/types/user.types.ts
```

#### 2. 過度な共通化
```typescript
// 問題：早すぎる共通化
❌ 2回目の使用で即座に共通化

// 解決：3回ルールの厳守
✅ 3回目の使用で共通化を検討
```

#### 3. 不適切な抽象化
```typescript
// 問題：ビジネスロジックの共通化
❌ shared/services/authBusinessLogic.ts

// 解決：汎用的な処理のみ共通化
✅ shared/utils/validation.ts
✅ shared/hooks/useApi.ts
```

## 開発フロー

### 新機能開発
1. `features/[feature-name]/` フォルダを作成
2. 必要なサブフォルダ（components, hooks, services, types）を作成
3. 機能固有のコードを実装
4. `shared/` の既存コンポーネント・フックを活用
5. テストファイルを `__tests__/` に配置

### 既存機能修正
1. 該当の `features/[feature-name]/` フォルダを特定
2. 関連するファイル（components, hooks, services, types）を確認
3. 必要な修正を実施
4. 影響範囲を確認（基本的にはfeature内で完結）

### 共通化作業
1. 重複コードを3箇所以上で発見
2. 共通化の判断基準をチェック
3. `shared/` 配下の適切な場所に移動
4. 各featureから共通化されたコードを利用
5. 既存のテストを更新

## まとめ

この構成により、以下の利点が得られます：

- **明確な責務分離**: 各機能が独立して開発・テスト可能
- **効率的な開発**: 関連するファイルが近くに配置
- **適切な再利用**: 3回ルールによる過度な抽象化の回避
- **保守性の向上**: 変更影響範囲の局所化
- **スケーラビリティ**: 新機能追加時の既存コードへの影響最小化

Claude Codeでの開発時は、このガイドラインに従って指示を出すことで、一貫性のあるコードベースを維持できます。 