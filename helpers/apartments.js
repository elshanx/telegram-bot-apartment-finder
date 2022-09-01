const axios = require('axios');
const cheerio = require('cheerio');

const Apartment = require('../models/apartment');
const User = require('../models/user');

const { sendBotMessage } = require('../features/telegram/telegram-bot');

let BASE_URL = process.env.BASE_URL;

const scrapeApartments = async ({ min = '', max = '', from = '', to = '' }) => {
  // console.log({ min, max, from, to });
  // const url = `${BASE_URL}?area_from=${from}&area_to=${to}&price_from=${min}&price_to=${max}`;

  const links = [];
  const prices = [];
  const locations = [];
  const dates = [];
  const ids = [];

  const { data } = await axios.get(BASE_URL);
  const $ = cheerio.load(data);

  const itemsList = $('.items_list');

  itemsList.each((_, item) => {
    $(item)
      .find('.items-i .item_link')
      .each((_, el) => links.push(`https://bina.az${el.attribs.href}`));
    $(item)
      .find('.items-i .price-val')
      .each((_, el) => prices.push($(el).text()));
    $(item)
      .find('.location')
      .each((_, el) => locations.push($(el).text().replace('.', '').replace('-', ' ')));
    $(item)
      .find('.city_when')
      .each((_, el) => dates.push($(el).text().split(', ')[1]));
    $(item)
      .find('.items-i .item_link')
      .each((_, el) => ids.push(el.attribs.href.replace('/items/', '')));
  });

  for (let i = 0; i < links.length; i++) {
    try {
      if (!!(await Apartment.findOne({ apartmentId: ids[i] }))) {
      } else
        await new Apartment({
          date: dates[i],
          link: links[i],
          price: String(prices[i]),
          location: locations[i],
          apartmentId: ids[i],
        }).save();
    } catch (error) {
      console.error(error);
    }
  }
};

const bulkSendMessage = async (chatId, apartments) => {
  let i = 0;

  const id = setInterval(() => {
    if (i < apartments.length) {
      const apartment = apartments[i];
      sendBotMessage({ receiver: chatId, apartment }).then(async () => {
        await User.findOneAndUpdate(
          { id: chatId },
          { $addToSet: { viewedApartments: apartment.apartmentId } },
        );
      });
      i++;
    } else clearInterval(id);
  }, 1000);
};

const getTodaysApartments = async () => {
  const [start, end] = [new Date(), new Date()];
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const apartments = await Apartment.find({ createdAt: { $gte: start, $lte: end } }).lean();

  return apartments;
};

const getUnsentApartments = async id => {
  const allApartments = await Apartment.find().select('-__v -_id -updatedAt').lean();
  const { viewedApartments } = await User.findOne({ id }).select('viewedApartments');
  const apartments = allApartments.filter(a => !viewedApartments.includes(a.apartmentId));
  return apartments;
};

module.exports = { scrapeApartments, bulkSendMessage, getTodaysApartments, getUnsentApartments };
