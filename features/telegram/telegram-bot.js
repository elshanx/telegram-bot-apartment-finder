const { Telegraf } = require('telegraf');

const BOT_KEY = process.env.BOT_TOKEN;

const telegramBot = new Telegraf(BOT_KEY);

const sendBotMessage = async ({ receiver, apartment }) => {
  telegramBot.telegram.sendMessage(
    receiver,
    `
*${apartment.location} \\- ${apartment.date}*
*${apartment.price} AZN*
[link to apartment](${apartment.link})
  `,
    { parse_mode: 'MarkdownV2' },
  );
};

module.exports = { telegramBot, sendBotMessage };
