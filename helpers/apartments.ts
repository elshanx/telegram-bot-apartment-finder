import axios from 'axios';
import { load } from 'cheerio';

import { Apartment } from '../models/apartment';
import { User } from '../models/user';

import { sendBotMessage } from '../features/telegram/telegram-bot';

const BASE_URL = process.env.BASE_URL;

const scrapeApartments = async () => {
  const links: any[] = [];
  const prices: any = [];
  const locations: any = [];
  const dates: any = [];
  const ids: any = [];

  const { data } = await axios.get(BASE_URL as string);
  const $ = load(data);

  const itemsList = $('.items_list');

  itemsList.each((_, item) => {
    $(item)
      .find('.items-i .item_link')
      .each((_, el) => void links.push(`https://bina.az${el.attribs.href}`));
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
          price: prices[i],
          location: locations[i],
          apartmentId: ids[i],
        }).save();
    } catch (error) {
      console.error(error);
    }
  }
};

const bulkSendApartments = async (chatId: ChatId, apartments) => {
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

const getUnsentApartments = async (id: ChatId): Promise<ApartmentT[]> => {
  const allApartments: ApartmentT[] = await Apartment.find().select('-__v -_id -updatedAt').lean();
  const { viewedApartments }: any = await User.findOne({ id }).select('viewedApartments');
  const apartmentsToSend = allApartments.filter(
    (a: ApartmentT) => !viewedApartments?.includes(a.apartmentId),
  );
  return apartmentsToSend;
};

const getTodaysApartments = async (id: ChatId): Promise<ApartmentT[]> => {
  const [start, end] = [new Date(), new Date()];
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const allApartments: ApartmentT[] = await Apartment.find({
    createdAt: { $gte: start, $lte: end },
  })
    .select('-__v -_id -updatedAt')
    .lean();

  const { viewedApartments }: any = await User.findOne({ id }).select('viewedApartments');
  const apartmentsToSend = allApartments.filter(
    (a: ApartmentT) => !viewedApartments?.includes(a.apartmentId),
  );
  return apartmentsToSend;
};

export { scrapeApartments, bulkSendApartments, getUnsentApartments, getTodaysApartments };
