require('./helpers/env');
require('./db');

const User = require('./models/user');
const {
  scrapeApartments,
  bulkSendMessage,
  getUnsentApartments,
  getTodaysApartments,
} = require('./helpers/apartments');
const { telegramBot } = require('./features/telegram/telegram-bot');
const { logDate } = require('./utils');

const getUserInfo = (ctx, key) => ctx.chat[key];

const MINUTES = 5;
const INTERVAL = MINUTES * 60 * 1000;

telegramBot.command('start', async ctx => {
  const name = getUserInfo(ctx, 'first_name') || getUserInfo(ctx, 'username');
  const chatId = getUserInfo(ctx, 'id');

  let user = await User.findOne({ id: chatId }).select('-_id');

  if (!user) {
    user = await new User({ id: chatId, name }).save();
    ctx.reply(
      `Hope you find your dream apartment, ${name}✨`,
      //  FYI, you can set /min and /max rent cost. Good luck! 🥰
    );
  } else {
    ctx.reply(`Good to see you back, ${name}✨.`);
  }

  (() => {
    main(chatId, user.criterias);
    setInterval(() => main(chatId, user.criterias), INTERVAL);
  })();
});

// telegramBot.command('min', async ctx => {
//   ctx.reply('Please enter an amount');
//   const userId = getUserInfo(ctx, 'id');

//   telegramBot.on('text', async ctx => {
//     const amount = ctx.update.message.text;

//     if (Number.isInteger(Number(amount))) {
//       ctx.telegram
//         .sendMessage(ctx.message.chat.id, `min amount set to ${ctx.update.message.text}.✨`)
//         .then(async _ => {
//           await User.findOneAndUpdate({ id: userId }, { $set: { 'criterias.cost.min': amount } });
//         });
//     } else {
//       ctx.telegram.sendMessage(ctx.message.chat.id, `Please enter a number`);
//     }
//   });
// });

// telegramBot.command('max', async ctx => {
//   ctx.reply('Please enter an amount');
//   const userId = getUserInfo(ctx, 'id');

//   telegramBot.on('text', async ctx => {
//     const amount = ctx.update.message.text;

//     if (Number.isInteger(Number(amount))) {
//       ctx.telegram
//         .sendMessage(ctx.message.chat.id, `max amount set to ${ctx.update.message.text}.✨`)
//         .then(async _ => {
//           await User.findOneAndUpdate({ id: userId }, { $set: { 'criterias.cost.max': amount } });
//         });
//     } else {
//       ctx.telegram.sendMessage(ctx.message.chat.id, `Please enter a number`);
//     }
//   });
// });

telegramBot.command('check', async ctx => {
  const chatId = getUserInfo(ctx, 'id');
  ctx.reply('Checking for new apartments✨🥰');

  const apartments = getUnsentApartments(chatId);

  if (!!apartments.length) {
    await bulkSendMessage(chatId, apartments);
  } else {
    telegramBot.telegram.sendMessage(
      chatId,
      'There are no new apartments since we last checked. We will notify you once there is a new apartment. 🥰',
    );
  }
});

telegramBot.command('today', async ctx => {
  const chatId = getUserInfo(ctx, 'id');

  const [start, end] = [new Date(), new Date()];
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const apartments = await getTodaysApartments();

  if (!!apartments.length) {
    ctx.reply("Getting today's apartments✨🥰");
    await bulkSendMessage(chatId, apartments);
  } else {
    ctx.reply(
      'There are no new apartments yet. We will notify you once there is a new apartment. 🥰',
    );
  }
});

telegramBot.command('stop', ctx => {
  ctx.reply('Bye!😭😭');
  telegramBot.stop();
});

telegramBot.launch();

process.once('SIGINT', () => telegramBot.stop('SIGINT'));
process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));

const main = async (chatId, params) => {
  logDate();
  await scrapeApartments({ ...params.cost, ...params.area });
  const apartmentsToSend = await getUnsentApartments(chatId);
  await bulkSendMessage(chatId, apartmentsToSend);
};
