const axios = require('axios');
const cheerio = require('cheerio');
const Apartment = require('../models/apartment');

const BASE_URL = process.env.BASE_URL;

const scrapeApartments = async () => {
  const links = [];
  const prices = [];
  const locations = [];
  const dates = [];
  const ids = [];

  const { data } = await axios.get(BASE_URL);
  const $ = cheerio.load(data);

  $('.items_list').each((_, item) => ({
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

  for (let i = 0; i < 24; i++) {
    const [date, link, price, location, id] = [dates[i], links[i], prices[i], locations[i], ids[i]];

    try {
      if (!!(await Apartment.findOne({ apartmentId: id }))) {
      } else new Apartment({ date, link, price, location, apartmentId: id }).save();
    } catch (error) {
      console.error(error);
    }
  }
};

module.exports = { scrapeApartments };
