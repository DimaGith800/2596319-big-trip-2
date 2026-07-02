const BlankPoint = {
  BASE_PRICE: 0,
  DATE_FROM: null,
  DATE_TO: null,
  DESTINATION: null,
  IS_FAVORITE: false,
  OFFERS: [],
  TYPE: 'taxi',
};

const Texts = {
  EVERYTHING: 'Click New Event to create your first point',
  PAST: 'There are no past events now',
  PRESENT: 'There are no present events now',
  FUTURE: 'There are no future events now'
};

const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFER: 'offer'
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT'
};

const FilterType = {
  EVERYTHING: 'EVERYTHING',
  FUTURE: 'FUTURE',
  PRESENT: 'PRESENT',
  PAST: 'PAST',
};

const DEFAULT_FILTER_TYPE = FilterType.EVERYTHING;

const UserAction = {
  UPDATE_POINT: 'UPDATE_POINT',
  ADD_POINT: 'ADD_POINT',
  DELETE_POINT: 'DELETE_POINT'
};

const API_ENDPOINT = 'https://22.objects.htmlacademy.pro/big-trip';
const API_AUTHORIZATION = 'Basic qefwy73ogjeppj9';

export { BlankPoint, Texts, SortType, UserAction, UpdateType, FilterType, DEFAULT_FILTER_TYPE, API_ENDPOINT, API_AUTHORIZATION };

