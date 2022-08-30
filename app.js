try {
  require('./helpers/env');
  require('./db');

  const { format } = require('date-fns');
  const { botEvents } = require('./events/bot-events');

  const Apartment = require('./models/apartment');
  const { scrapeApartments } = require('./helpers/apartments');
  const { sendBotMessage } = require('./features/telegram/telegram-bot');

  const main = async (chatId, options) => {
    console.log('ran', new Date());
    await scrapeApartments();
    let apartments;

    if (options?.getAll) {
      apartments = await Apartment.find({ date: { $regex: /bugün/gi } });
    } else {
      apartments = await Apartment.find({ sent: false });
    }

    for await (const apartment of apartments) {
      if (chatId) {
        sendBotMessage({ receiver: chatId, apartment });
      } else {
        sendBotMessage({ apartment });
        // sendBotMessage({ receiver: process.env.messageIdUser2, apartment });
      }

      apartment.sent = true;
      await apartment.save();
    }
  };

  (() => {
    const MINUTES = 5;
    const INTERVAL = MINUTES * 60 * 1000;
    main();

    setInterval(() => {
      main();
    }, INTERVAL);
  })();

  botEvents.on('check', main);
  botEvents.on('all', chatId => {
    const options = { getAll: true };
    main(chatId, options);
  });
} catch (error) {
  console.log(error);
}
