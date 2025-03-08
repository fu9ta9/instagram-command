import { PrismaClient, MembershipType } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // テストユーザーの作成
  const user = await prisma.user.create({
    data: {
      email: 'sakainoblig@gmail.com',
      name: 'Test User',
      membershipType: MembershipType.FREE,  
      password: '$2a$10$2WIX0G1yPOKE4OMxFKvazOXZUQwxzxnGDSVwk0OHHVHfthsa4.ro2',
    },
  })

  // テストIGAccountの作成
  const igAccount = await prisma.iGAccount.create({
    data: {
      userId: user.id,
      instagramId: '17841447969868460',
      username: 'sakaiblog',
      accessToken: 'EAAQZBfxgF2PsBO4nMoqpchURWf4ULZAH0BJxygbZA6eZA8us0d8ZAZBXi9ZBtZCFLSsmsWu6EnQEais0WxgqtfoMxio4jEyllYtZANozVkgJcJBJg1GGSGUW8TLXnr5BFzNTDQWp5LcNLuVDjPIsWWe1sDdYgkDrg4IBMajHucPiUJ7KWZC5IZCjQiedPcVV7R0wc7ZC7AZDZD',
      profilePictureUrl: 'https://scontent-nrt1-2.xx.fbcdn.net/v/t51.2885-15/274875656_372909411344749_4823192851188631320_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=7d201b&_nc_ohc=FyEgTnMTayYQ7kNvgHfqEZr&_nc_oc=Adi2tzWdnvFge_GOQ6WXuGtGzDeHKs7er3lk3trdTREsEOP91mRM-wjsYVIXxDAKsW0&_nc_zt=23&_nc_ht=scontent-nrt1-2.xx&edm=AL-3X8kEAAAA&oh=00_AYBPGYDIV0cf_Le8kdhRHpW2VvEF-7477JJ8zIw8gAKl1A&oe=67B19F2F',
    },
  })

  // テスト返信の作成
  await prisma.reply.create({
    data: {
      keyword: 'こんにちは',
      reply: 'ありがとうございます！',
      igAccountId: igAccount.id,
      replyType: 1,
      matchType: 1,
      buttons: {
        create: [
          {
            title: 'ウェブサイトへ',
            url: 'https://example.com',
            order: 0
          }
        ]
      }
    }
  })

  console.log('シードデータを作成しました')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 