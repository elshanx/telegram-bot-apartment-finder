const { Telegraf } = require('telegraf');
const { botEvents } = require('../../events/bot-events');

const BOT_KEY = process.env.BOT_TOKEN;

const bot = new Telegraf(BOT_KEY);

bot.command('start', ctx => {
  ctx.reply(
    `To list all the commands type /help. Hope you find your dream apartment ${
      ctx.chat.first_name || ctx.chat?.username
    }✨🥰`,
  );
  ctx.chat;
});

bot.command('help', async ctx => {
  ctx.reply('all the commands are:\n /start\n /check\n /all\n /stop\n /help 🥰');
});

bot.command('check', ctx => {
  botEvents.emit('check');
  ctx.reply('checking for new apartments✨🥰');
});

bot.command('all', ctx => {
  const chatId = ctx.update.message.chat.id;
  botEvents.emit('all', chatId);
  ctx.reply('getting todays apartments✨🥰');
});

bot.command('stop', ctx => {
  ctx.reply('bye!😭😭');
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const sendBotMessage = async (
  { receiver = process.env.messageIdUser1, apartment },
  options = { parse_mode: 'MarkdownV2' },
) => {
  bot.telegram.sendMessage(
    receiver,
    `
*${apartment.location} \\- ${apartment.date}*
*${apartment.price} AZN*
[link to apartment](${apartment.link})
  `,
    options,
  );
};

module.exports = { sendBotMessage };
