import AbstractView from '../framework/view/abstract-view';
import { sortPointsByDay } from '../utils.js';
import dayjs from 'dayjs';

function createElementTemplate(points, destinations, offers) {
  if (destinations.length === 0) {
    return '';
  }
  const sortedPointsByDay = [...points].sort(sortPointsByDay);
  const firstPointsDestination = destinations.find((dest) => dest.id === sortedPointsByDay[0].destination) || '';
  const lastPointsDestination = destinations.find((dest) => dest.id === sortedPointsByDay[sortedPointsByDay.length - 1].destination) || '';
  const routeStartDate = dayjs(sortedPointsByDay[0].dateFrom).format('MMM DD');
  const routeEndDate = dayjs(sortedPointsByDay[sortedPointsByDay.length - 1].dateFrom).format('MMM DD');

  let route = points.length <= 3 && points.length >= 2
    ? destinations.join(' &mdash; ')
    : `${firstPointsDestination.name} &mdash; ... &mdash; ${lastPointsDestination.name}`;
  if (points.length === 1) {
    route = destinations[0].name;
  }
  const totalCost = points.reduce((sum, point) => {
    const offerByType = offers.find((offer) => offer.type === point.type);
    const availableOffers = offerByType ? offerByType.offers : [];
    const offersCost = point.offers.reduce((offSum, currentOfferId) => {
      const foundOffer = availableOffers.find((offer) => offer.id === currentOfferId);
      return offSum + (foundOffer ? foundOffer.price : 0);
    }, 0);

    return sum + point.basePrice + offersCost;
  }, 0);

  return (
    `<section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${route}</h1>
        <p class="trip-info__dates">${routeStartDate}&nbsp;&mdash;&nbsp;${routeStartDate.split(' ')[0] === routeEndDate.split(' ')[0] ? routeEndDate.split(' ')[1] : routeEndDate}</p>
      </div>
      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView extends AbstractView {
  #points = null;
  #destinations = null;
  #offers = null;

  constructor(points, destinations, offers) {
    super();
    this.#points = points;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    return createElementTemplate(this.#points, this.#destinations, this.#offers);
  }
}
