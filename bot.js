require('dotenv').config();
const { Bot, GrammyError, HttpError } = require('grammy');
const { hydrate } = require('@grammyjs/hydrate');
const db = require('./db');
const handlers = require('./handlers');
const { userAnswers } = require('./handlers');

const bot = new Bot(process.env.BOT_API_KEY);
bot.use(hydrate());

// базовые команды
bot.api.setMyCommands([
  {command: 'start',  description: 'Запуск бота'},
  {command: 'restart', description: 'Начать опрос заново'},
])
bot.command('start', handlers.start);
bot.command('restart', handlers.restart);
bot.callbackQuery(/0-(6|7|8|9|10|11)/, handlers.callBackQuery);

// начало опросв
bot.callbackQuery('Start', handlers.onStart);
bot.callbackQuery(['1-1', '1-2'], handlers.onFirstQuestion); 
bot.callbackQuery(['2-1', '2-2', '2-3', '2-4'], handlers.onSecondQuestion);
bot.callbackQuery(['3-1', '3-2', '3-3', '1-3'],  handlers.onThirdQuestion);
bot.callbackQuery(['4-1', '4-2', '4-3', '4-4','1-4'], async ctx => {
  const telegram_id = await handlers.onLastQuestion(ctx);
  const grade = parseInt(userAnswers[0].split('-')[1]);
  userAnswers.shift();

  const participant = await db.insertParticipant(telegram_id, grade);
  const participant_id = await db.getParticipantId(telegram_id);
  const splittedArr = userAnswers.map(num => num.split('-'));

  splittedArr.forEach(async arr => {
    await db.insertParticipantAnswers(participant_id.rows[0].id, arr);
  });
});

// default answer
bot.on('message', async (ctx) => {
  await ctx.reply('X_X')
})

// error handler
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
})

module.exports = bot;