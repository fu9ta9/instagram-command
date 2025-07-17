export const COMMENT_REPLY_TEMPLATES = [
  '@{commenterName}さん\nコメントありがとうございます。メッセージを送信しました！',
  '@{commenterName}さん\nコメントいただきありがとうございます！DMをお送りしました。',
  '@{commenterName}さん\nありがとうございます！詳細をメッセージでお送りしました。'
]

export function getRandomReplyTemplate(commenterName: string): string {
  const template = COMMENT_REPLY_TEMPLATES[Math.floor(Math.random() * COMMENT_REPLY_TEMPLATES.length)]
  return template.replace('{commenterName}', commenterName)
}