import BoardPresenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filters-presenter.js';
import PointsModel from './model/points-model.js';
import DestinationsModel from './model/destinations-model.js';
import OffersModel from './model/offers-model.js';
import FiltersModel from './model/filters-model.js';
import BigTripApiService from './api/big-trip-api-service.js';
import { API_AUTHORIZATION, API_ENDPOINT } from './const.js';

const siteFilters = document.querySelector('.trip-controls__filters');
const siteMainElement = document.querySelector('.trip-events');
const siteHeaderElement = document.querySelector('.trip-main');

const apiService = new BigTripApiService(API_ENDPOINT, API_AUTHORIZATION);
const pointsModel = new PointsModel(apiService);
const destinationsModel = new DestinationsModel(apiService);
const offersModel = new OffersModel(apiService);
const filtersModel = new FiltersModel();

const filterPresenter = new FilterPresenter({
  filterContainer: siteFilters,
  filterModel: filtersModel,
  pointsModel: pointsModel
});

const boardPresenter = new BoardPresenter({
  boardHeader: siteHeaderElement,
  boardContainer: siteMainElement,
  pointsModel: pointsModel,
  destinationsModel: destinationsModel,
  offersModel: offersModel,
  filterModel: filtersModel
});

filterPresenter.init();
boardPresenter.init();

Promise.all([
  destinationsModel.init(),
  offersModel.init()
])
  .then(() => pointsModel.init());
