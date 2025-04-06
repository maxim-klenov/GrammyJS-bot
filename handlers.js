const db = require('./db');
const { InlineKeyboard } = require('grammy');
let userAnswers = [];

async function deleteMessages(ctx) {
  try {
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;
    for (let i = messageId - 1; i >= messageId - 2; i--) {
      try {
        let res = await ctx.api.deleteMessage(chatId, i);
      } catch (e) {
        if (e.description === 'Bad Request: message to delete not found') {
          true
        } else {
          console.error(e);
        }
      }
    }
  } catch (error) {
    console.error('Ошибка удаления сообщений:', error);
  }
}

async function start(ctx) {
  
  // delete last session 
  deleteMessages(ctx);
  // Continue executing code here

  if (await db.checkUser(ctx)) {
    return;
  }
  userAnswers.length = 0;
  const gradeInlineKeyboard = new InlineKeyboard()
  .text('6', '0-6')
  .text('7', '0-7')
  .text('8', '0-8')
  .text('9', '0-9')
  .text('10', '0-10')
  .text('11', '0-11');
  await ctx.react("🍾")
  await ctx.reply('Привет!') 
  await ctx.reply(`Выбери свой класс:`, {
    reply_markup: gradeInlineKeyboard // probably here is the mistake
  })
}

async function restart(ctx) {
  if (await db.checkUser(ctx)) {
    return;
  }
  else {
    if (userAnswers.length === 0) {
      deleteMessages(ctx);
      ctx.reply('/start');
    }
    else {
      // clear array before start
      const startInlineKeyboard = new InlineKeyboard().text('Начать', 'Start');
      const grade = userAnswers[0];
      userAnswers.length = 0;
      userAnswers.push(grade);
      // ask to start again 
      await ctx.reply('Жми чтобы начать опрос заново:', {
        reply_markup: startInlineKeyboard
      });
      // delete last session 
      deleteMessages(ctx);  
    }
  }
}

async function callBackQuery(ctx) {
  if (await db.checkUser(ctx)) {
    return;
  }
  const startInlineKeyboard = new InlineKeyboard().text('Начать', 'Start');
  userAnswers.push(ctx.callbackQuery.data);
  await ctx.answerCallbackQuery();
  await ctx.callbackQuery.message.editText('Все готово. Жми чтобы начать опрос:', {
    reply_markup: startInlineKeyboard
  });
}

async function onStart(ctx) {
  const questionInlineKeyboard = new InlineKeyboard().text('Регулярно', '1-1').text('Иногда', '1-2').text('Никогда', '1-3').row().text('Не знаю что это такое', '1-4');
  await ctx.answerCallbackQuery();
  await ctx.callbackQuery.message.editText(`(1/4)

Используете ли вы ИИ-инструменты для учебы?`, {
    reply_markup: questionInlineKeyboard
  });
}

async function onFirstQuestion(ctx) {
  userAnswers.push(ctx.callbackQuery.data);
  const questionInlineKeyboard = new InlineKeyboard().text('Гуманитарные', '2-1').text('Точные науки', '2-2').row().text('Языки', '2-3').text('Все предметы', '2-4');
  await ctx.answerCallbackQuery();
  await ctx.callbackQuery.message.editText(`(2/4) 
    
Для каких предметов вы чаще всего используете ИИ?`, {
    reply_markup: questionInlineKeyboard
  });
}

async function onSecondQuestion(ctx) {
  userAnswers.push(ctx.callbackQuery.data);
  const questionInlineKeyboard = new InlineKeyboard().text('Положительно', '3-1').row().text('Отрицательно', '3-2').row().text('Нейтрально', '3-3').row();
  await ctx.answerCallbackQuery();
  await ctx.callbackQuery.message.editText(`(3/4) 
    
Как вы оцениваете влияние ИИ на качество вашего обучения?`, {
    reply_markup: questionInlineKeyboard
  });
}

async function onThirdQuestion(ctx) {
  userAnswers.push(ctx.callbackQuery.data);
  const questionInlineKeyboard = new InlineKeyboard().text('Огромный. За ИИ - будущее', '4-1').row().text('ОНО ПОРОБОТИТ ЧЕЛОВЕЧЕСТВО!!!!', '4-2').row().text('Думаю ничего не изменится', '4-3').row().text('Затрудняюсь ответить', '4-4');
  await ctx.answerCallbackQuery();
  await ctx.callbackQuery.message.editText(`(4/4) Последний
    
Как вы оцениваете потенциал этих технологий в будущем?`, {
    reply_markup: questionInlineKeyboard
  });
}

async function onLastQuestion(ctx) {
  userAnswers.push(ctx.callbackQuery.data);
  await ctx.answerCallbackQuery();
  await ctx.callbackQuery.message.editText(
    `Спасибо за ваше участие в опросе.😁`);
  return ctx.from.id;
}
module.exports = { 
  start, 
  restart, 
  callBackQuery, 
  onStart, 
  onFirstQuestion, 
  onSecondQuestion,
  onThirdQuestion,
  onLastQuestion,
  userAnswers 
};