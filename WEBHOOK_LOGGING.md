# Webhook自動送信APIのログ機能

Webhookの自動送信処理において、詳細なパラメータ取得とログ出力を実装しました。

## ログの種類

### 1. 📥 Webhook受信データ
```javascript
console.log('📥 Webhook受信データ:', JSON.stringify(webhookData, null, 2));
```
- Instagram Webhookから受信した生データ全体
- メッセージタイプの判定前に出力
- デバッグ時の最初の確認ポイント

### 2. 🔄 エコーメッセージ検出
```javascript
console.log('🔄 エコーメッセージを検出 - スキップします');
```
- 自分からの送信メッセージの検出
- 無限ループ防止の確認

### 3. 💬💭🔴 メッセージタイプ検出
```javascript
console.log('💬 DMメッセージを検出');
console.log('💭 コメントメッセージを検出');
console.log('🔴 LIVEコメントを検出');
```
- 受信したメッセージの種類を識別
- 処理フローの分岐点

## 返信検索フェーズのログ

### 4. 🔍 検索パラメータ

#### DM検索パラメータ
```javascript
console.log('🔍 DM返信検索パラメータ:', {
  messageText,        // 受信したメッセージテキスト
  recipientId,        // 受信者ID (自分のアカウント)
  senderId,          // 送信者ID (相手のアカウント)
  timestamp          // 検索実行時刻
});
```

#### コメント検索パラメータ
```javascript
console.log('🔍 コメント返信検索パラメータ:', {
  commentText,        // コメントテキスト
  mediaId,           // 投稿ID
  commenterId,       // コメント投稿者ID
  commenterUsername, // コメント投稿者名
  timestamp          // 検索実行時刻
});
```

#### LIVE検索パラメータ
```javascript
console.log('🔍 LIVE返信検索パラメータ:', {
  commentText,        // LIVEコメントテキスト
  commenterId,        // コメント投稿者ID
  commenterUsername, // コメント投稿者名
  timestamp          // 検索実行時刻
});
```

### 5. 📋 検索結果
```javascript
console.log('📋 検索結果:', {
  repliesCount,      // 見つかった返信設定数
  replyTypes        // 各返信設定の詳細
});
```
- データベースから取得した返信設定の一覧
- デバッグ時の設定確認に使用

### 6. 🔍 キーワード判定
```javascript
console.log('🔍 キーワード判定:', {
  replyId,          // 返信設定ID
  keyword,          // 設定されたキーワード
  matchType,        // 一致タイプ (完全一致/部分一致)
  messageText,      // 受信メッセージ
  result           // 判定結果 (true/false)
});
```
- 個別の返信設定ごとの判定過程
- キーワードマッチングの詳細確認

### 7. ✅❌ 判定結果
```javascript
console.log('✅ 完全一致で返信設定を発見:', reply.id);
console.log('✅ 部分一致で返信設定を発見:', reply.id);
console.log('❌ 一致するキーワードが見つかりませんでした');
```
- 最終的な判定結果
- 使用される返信設定の特定

## 送信処理フェーズのログ

### 8. 📤 送信パラメータ
```javascript
console.log('📤 DM返信送信パラメータ:', {
  senderId,          // 送信先ID
  replyId,          // 使用する返信設定ID
  replyText,        // 送信メッセージテキスト
  hasButtons,       // ボタンの有無
  buttonCount,      // ボタン数
  igAccountId,      // 送信元InstagramアカウントID
  timestamp         // 送信実行時刻
});
```
- 送信前の最終パラメータ確認
- 送信内容の詳細情報

### 9. 📨 Instagram API送信データ
```javascript
console.log('📨 Instagram API送信データ:', {
  url,              // APIエンドポイントURL
  messageData,      // 送信するペイロード
  timestamp         // 送信時刻
});
```
- Instagram APIに送信する実際のデータ
- API仕様の確認とデバッグに使用

### 10. 📨 Instagram APIレスポンス
```javascript
console.log('📨 Instagram APIレスポンス:', {
  status,           // HTTPステータスコード
  ok,               // 成功/失敗フラグ
  responseData,     // APIからのレスポンス
  timestamp         // 受信時刻
});
```
- Instagram APIからの完全なレスポンス
- エラー診断の重要な情報源

### 11. ✅ 送信成功
```javascript
console.log('✅ DM返信送信成功:', responseData.message_id || responseData.id);
```
- 送信成功時のメッセージID
- 送信完了の確認

## ログの活用方法

### デバッグ時の確認順序
1. **📥 Webhook受信データ** - 受信した生データの確認
2. **🔍 検索パラメータ** - 抽出されたパラメータの確認
3. **📋 検索結果** - データベースの返信設定確認
4. **🔍 キーワード判定** - マッチング処理の詳細確認
5. **📤 送信パラメータ** - 送信内容の最終確認
6. **📨 API送信/レスポンス** - Instagram APIとの通信確認

### トラブルシューティング

#### 返信が送信されない場合
1. **📥 Webhook受信データ** - データが正しく受信されているか
2. **🔍 検索パラメータ** - パラメータが正確に抽出されているか
3. **📋 検索結果** - 対象の返信設定が存在するか
4. **🔍 キーワード判定** - キーワードマッチングが機能しているか

#### API送信エラーの場合
1. **📤 送信パラメータ** - 送信パラメータが正しいか
2. **📨 API送信データ** - APIペイロード形式が正しいか
3. **📨 APIレスポンス** - エラーの詳細内容を確認

### 本番環境での注意事項
- ログ出力によりパフォーマンスに影響する可能性があります
- 必要に応じてログレベルを調整してください
- アクセストークンなどの機密情報は自動的にマスクされません

### ログレベル設定例
```javascript
const LOG_LEVEL = process.env.WEBHOOK_LOG_LEVEL || 'INFO';

if (LOG_LEVEL === 'DEBUG') {
  console.log('🔍 詳細デバッグ情報');
}
```

## エラーログ
通常のコンソールログとは別に、データベースにもエラーログが記録されます：
```javascript
await safeLogError(`処理エラー: ${error.message}`);
```
- `executionLog`テーブルに保存
- データベース接続エラー時はコンソールのみ出力