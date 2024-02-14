import { session, Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { code } from 'telegraf/format'
import config from 'config'
import { ogg } from './ogg.js'
import { openai } from './openai.js'

const INITIAL_SESSION = {
  messages: [],
}

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new', async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply(code('hello'))
})

bot.command('start', async (ctx) => {
  ctx.session = INITIAL_SESSION
  await ctx.reply(code('hello'))
})

bot.on(message('voice'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply(code('request accepted'))
    //await ctx.reply(JSON.stringify(ctx.message.voice, null, 2))
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)
    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)
    
    const text = await openai.transcription(mp3Path)
    await ctx.reply(code(`your question is:`)) 
    await ctx.reply(code(`${text}`)) 

    ctx.session.messages.push({ role: openai.roles.USER, content: text })
    
    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT, 
      content: response.content,
    })

    await ctx.reply(response.content)
  } catch (e) {
    console.log('ERROR VOICE MESSAGE', e.message)
  }
})

/*bot.command('start', async (ctx) => {
  await ctx.reply(JSON.stringify(ctx.message, null, 2))
})*/

bot.on(message('text'), async (ctx) => {
  ctx.session ??= INITIAL_SESSION
  try {
    await ctx.reply(code('request accepted'))
    
    //const text = await openai.transcription(ctx.message.text)

    ctx.session.messages.push({ role: openai.roles.USER, content: ctx.message.text })
    
    const response = await openai.chat(ctx.session.messages)

    ctx.session.messages.push({
      role: openai.roles.ASSISTANT, 
      content: response.content,
    })

    await ctx.reply(response.content)
  } catch (e) {
    console.log('ERROR TEXT MESSAGE', e.message)
  }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))