// require('dotenv').config();
const { Bot,  GrammyError, HttpError, Keyboard, InlineKeyboard } = require('grammy');
// const { hydrate } = require('@grammyjs/hydrate');
// const { Pool } = require('pg');

const bot = require('./bot');
// const db = require('./db');
// const handlers = require('./handlers');
// const utils = require('./utils');

// =============  postgresql  ===============
// const dbConfig = {
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT,
// };
// const pool = new Pool(dbConfig);
// ==========================================

// ========  general bot settings  ==========
// const bot = new Bot(process.env.BOT_API_KEY);
// bot.use(hydrate());

// bot.api.setMyCommands([
//   {command: 'start',  description: 'Запуск бота'},
//   {command: 'restart', description: 'Начать опрос заново'},
// ])
// ==========================================
// const userAnswers = [];
const userInfo = [];

// ==========  filter users  ============
// bot.on('message').filter((ctx) => {
//   return userInfo.includes(ctx.from.id)  
// }, async ctx => {  
//   await ctx.reply('Извините, но вы уже участвовали в опросе')  
// });
// ======================================

// ==========  logic of bot  ============
// bot.command('start', async (ctx) => {
//   userAnswers.length = 0;
//   const gradeInlineKeyboard = new InlineKeyboard()
//   .text('6', '0-6')
//   .text('7', '0-7')
//   .text('8', '0-8')
//   .text('9', '0-9')
//   .text('10', '0-10')
//   .text('11', '0-11');
//   await ctx.react("🍾")
//   await ctx.reply('Привет!') 
//   await ctx.reply(`Выбери свой класс:`, {
//     reply_markup: gradeInlineKeyboard
//   })
// });

// bot.callbackQuery(/0-(6|7|8|9|10|11)/, async ctx => {
//   const startInlineKeyboard = new InlineKeyboard().text('Начать', 'Start');
//   userAnswers.push(ctx.callbackQuery.data);
//   await ctx.answerCallbackQuery();
//   await ctx.callbackQuery.message.editText('Все готово. Жми чтобы начать опрос:', {
//     reply_markup: startInlineKeyboard
//   });
// })

// ==========  restart  ===========
// bot.command('restart', async ctx => {
//   if (userInfo.includes(ctx.user.id)) {
//     ctx.reply('Извините, но вы уже участвовали в опросе')
//   } 
//   else {
//     if (userAnswers.length === 0) {
//       ctx.reply('/start')
//     }
//     else {
//       // clear array before start
//       const startInlineKeyboard = new InlineKeyboard().text('Начать', 'Start');
//       const grade = userAnswers[0];
//       userAnswers.length = 0;
//       userAnswers.push(grade);
//       // ask to start again 
//       await ctx.reply('Жми чтобы начать опрос заново:', {
//         reply_markup: startInlineKeyboard
//       });
//       // delete last session 
//       await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id - 1);    
//     }
//   }
// })
// ==================================

// bot.callbackQuery('Start', async ctx => {
//   const questionInlineKeyboard = new InlineKeyboard().text('Регулярно', '1-1').text('Иногда', '1-2').text('Никогда', '1-3').row().text('Не знаю что это такое', '1-4');
//   await ctx.answerCallbackQuery();
//   await ctx.callbackQuery.message.editText(`(1/4)

// Используете ли вы ИИ-инструменты для учебы?`, {
//     reply_markup: questionInlineKeyboard
//   });
// })

// bot.callbackQuery(['1-1', '1-2'], async ctx => {
//   userAnswers.push(ctx.callbackQuery.data);
//   const questionInlineKeyboard = new InlineKeyboard().text('Гуманитарные', '2-1').text('Точные науки', '2-2').row().text('Языки', '2-3').text('Все предметы', '2-4');
//   await ctx.answerCallbackQuery();
//   await ctx.callbackQuery.message.editText(`(2/4) 
    
// Для каких предметов вы чаще всего используете ИИ?`, {
//     reply_markup: questionInlineKeyboard
//   });
// })

// bot.callbackQuery(['2-1', '2-2', '2-3', '2-4'], async ctx => {
//   userAnswers.push(ctx.callbackQuery.data);
//   const questionInlineKeyboard = new InlineKeyboard().text('Положительно', '3-1').row().text('Отрицательно', '3-2').row().text('Нейтрально', '3-3').row();
//   await ctx.answerCallbackQuery();
//   await ctx.callbackQuery.message.editText(`(3/4) 
    
// Как вы оцениваете влияние ИИ на качество вашего обучения?`, {
//     reply_markup: questionInlineKeyboard
//   });
// })

// bot.callbackQuery(['3-1', '3-2', '3-3', '1-3'], async ctx => {
//   userAnswers.push(ctx.callbackQuery.data);
//   const questionInlineKeyboard = new InlineKeyboard().text('Огромный. За ИИ - будущее', '4-1').row().text('ОНО ПОРОБОТИТ ЧЕЛОВЕЧЕСТВО!!!!', '4-2').row().text('Думаю ничего не изменится', '4-3').row().text('Затрудняюсь ответить', '4-4');
//   await ctx.answerCallbackQuery();
//   await ctx.callbackQuery.message.editText(`(4/4) Последний
    
// Как вы оцениваете потенциал этих технологий в будущем?`, {
//     reply_markup: questionInlineKeyboard
//   });
// })
// =====================================================

bot.callbackQuery(['4-1', '4-2', '4-3', '4-4','1-4'], async ctx => {
  userAnswers.push(ctx.callbackQuery.data);
  await ctx.answerCallbackQuery();
  await ctx.callbackQuery.message.editText(
    `Спасибо за ваше участие в опросе.😁`);
  userInfo.push(ctx.from.id); 
  // =============================================

  const telegram_id = ctx.from.id;
  const grade = parseInt(userAnswers[0].split('-')[1]);
  userAnswers.shift();
  
  

  pool.query(
    'INSERT INTO participants (telegram_id, grade) VALUES ($1, $2)', 
    [telegram_id, grade], 
    (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(res.rows);
  });

  const query = {
    text: `SELECT id FROM participants WHERE telegram_id = $1`,
    values: [telegram_id],
  };

  let participant_id = 0;  
  const splittedArr = userAnswers.map(num => num.split('-'));    
  pool.query(query, (err, res) => {
    if (err) {
      console.error(err);
    } else {
      participant_id = res.rows[0].id;
      // ======= send answers
      splittedArr.forEach(arr => {
        pool.query(
          'INSERT INTO participant_answers (participant_id, question_id, answer_id) VALUES ($1, $2, $3)',
          [participant_id, arr[0], arr[1]],
          (err) => {
            if (err) {
              console.error(err);
              return;
            }
          }
        )
      })
      // ======= /send answers
    }
  });

})


// // ==========  error handler  ===========
// bot.on('message', async (ctx) => {
//   await ctx.reply('X_X')
// })

// bot.catch((err) => {
//   const ctx = err.ctx;
//   console.error(`Error while handling update ${ctx.update.update_id}:`);
//   const e = err.error;

//   if (e instanceof GrammyError) {
//     console.error("Error in request:", e.description);
//   } else if (e instanceof HttpError) {
//     console.error("Could not contact Telegram:", e);
//   } else {
//     console.error("Unknown error:", e);
//   }
// })

bot.start();