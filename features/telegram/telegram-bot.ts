import { Telegraf } from 'telegraf';

const BOT_KEY = process.env.BOT_TOKEN as string;

const telegramBot = new Telegraf(BOT_KEY);

type BotMessageProps = { receiver: ChatId; apartment: ApartmentT };

const sendBotMessage = async ({ receiver, apartment }: BotMessageProps) => {
  const { date, link, location, price } = apartment;
  telegramBot.telegram.sendMessage(
    receiver,
    `
*${location} \\- ${date}*
*${price} AZN*
[link to apartment](${link})
  `,
    { parse_mode: 'MarkdownV2' },
  );
};

export { telegramBot, sendBotMessage };
