const axios = require('axios');
const cheerio = require('cheerio');

const Apartment = require('../models/apartment');
const User = require('../models/user');

const { sendBotMessage } = require('../features/telegram/telegram-bot');

const BASE_URL = process.env.BASE_URL;

const scrapeApartments = async () => {
  const links = [];
  const prices = [];
  const locations = [];
  const dates = [];
  const ids = [];

  const { data } = await axios.get(BASE_URL);
  const $ = cheerio.load(data);

  const itemsList = $('.items_list');

  itemsList.each((_, item) => ({
    links: $(item)
      .find('.items-i .item_link')
      .each((_, el) => links.push(`https://bina.az${el.attribs.href}`)),
    prices: $(item)
      .find('.items-i .price-val')
      .each((_, el) => prices.push($(el).text())),
    locations: $(item)
      .find('.location')
      .each((_, el) => locations.push($(el).text().replace('.', '').replace('-', ' '))),
    dates: $(item)
      .find('.city_when')
      .each((_, el) => dates.push($(el).text().split(', ')[1])),
    id: $(item)
      .find('.items-i .item_link')
      .each((_, el) => ids.push(el.attribs.href.replace('/items/', ''))),
  }));

  for (let i = 0; i < links.length; i++) {
    try {
      if (!!(await Apartment.findOne({ apartmentId: ids[i] }))) {
      } else
        await new Apartment({
          date: dates[i],
          link: links[i],
          price: prices[i],
          location: locations[i],
          apartmentId: ids[i],
        }).save();
    } catch (error) {
      console.error(error);
    }
  }
};

const bulkSendApartments = async (chatId, apartments) => {
  for await (const apartment of apartments) {
    sendBotMessage({ receiver: chatId, apartment });
    try {
      await User.findOneAndUpdate(
        { id: chatId },
        { $addToSet: { viewedApartments: apartment.apartmentId } },
      );
    } catch (error) {
      console.error(error);
    }
  }
};

const getUnsentApartments = async (id, apartmentFilter) => {
  let allApartments;
  if (apartmentFilter) {
    allApartments = await Apartment.find(apartmentFilter).select('-__v -_id -updatedAt').lean();
  } else allApartments = await Apartment.find().select('-__v -_id -updatedAt').lean();
  const { viewedApartments } = await User.findOne({ id }).select('viewedApartments');
  const apartmentsToSend = allApartments.filter(a => !viewedApartments.includes(a.apartmentId));
  return apartmentsToSend;
};

module.exports = { scrapeApartments, bulkSendApartments, getUnsentApartments };
