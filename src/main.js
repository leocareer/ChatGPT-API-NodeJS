import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

const bot = new Telegraf(config.get('telegram_token'))

bot.on(message('voice'), async (ctx) => {
  try {
    //await ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)
    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)
    
    const text = await openai.transcription(mp3Path)
    const response = await openai.chat(text)

    await ctx.reply(mp3Path)
  } catch (e) {
    console.log('ERROR VOICE MESSAGE', e.message)
  }
})

bot.command('start', async (ctx) => {
  await ctx.reply(JSON.stringify(ctx.message, null, 2))
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))