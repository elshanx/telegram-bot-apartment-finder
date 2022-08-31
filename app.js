require('./helpers/env');
require('./db');

const User = require('./models/user');
const {
  scrapeApartments,
  bulkSendApartments,
  getUnsentApartments,
} = require('./helpers/apartments');
const { telegramBot } = require('./features/telegram/telegram-bot');
const { logDate } = require('./utils');

const getUserInfo = (ctx, key) => ctx.chat[key];

const MINUTES = 5;
const INTERVAL = MINUTES * 60 * 1000;

telegramBot.command('start', async ctx => {
  const name = getUserInfo(ctx, 'first_name') || getUserInfo(ctx, 'username');
  const chatId = getUserInfo(ctx, 'id');

  const doesUserExist = await User.exists({ id: chatId });
  if (!doesUserExist) await new User({ id: chatId, name }).save();

  ctx.reply(`Hope you find your dream apartment ${name}✨🥰`);

  (() => {
    main(chatId);
    setInterval(() => main(chatId), INTERVAL);
  })();
});

telegramBot.command('check', async ctx => {
  const chatId = getUserInfo(ctx, 'id');
  ctx.reply('Checking for new apartments✨🥰');

  const apartments = getUnsentApartments(chatId);

  if (!!apartments.length) {
    bulkSendApartments(chatId, apartments);
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

  const filter = { createdAt: { $gte: start, $lte: end } };

  const apartments = getUnsentApartments(chatId, filter);

  if (!!apartments.length) {
    ctx.reply("Getting today's apartments✨🥰");
    bulkSendApartments(chatId, apartments);
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

const main = async chatId => {
  logDate();
  await scrapeApartments();
  const apartmentsToSend = await getUnsentApartments(chatId);
  bulkSendApartments(chatId, apartmentsToSend);
};
