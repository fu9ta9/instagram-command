const REPLY_TEMPLATES = [
  "ありがとうございます！",
  "コメントありがとうございます！",
  "お疲れ様です！",
  "素敵なコメントありがとうございます！",
  "いつもありがとうございます！"
];

export function getRandomReplyTemplate(): string {
  const randomIndex = Math.floor(Math.random() * REPLY_TEMPLATES.length);
  return REPLY_TEMPLATES[randomIndex];
}

export default REPLY_TEMPLATES;