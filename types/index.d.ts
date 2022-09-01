type ChatId = number;

type UserT = {
  id: number;
  name: string;
  viewedApartments: ApartmentT['apartmentId'][];
};

type ApartmentT = {
  apartmentId: number;
  date: string;
  link: string;
  price: number;
  location: string;
};
