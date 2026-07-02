import SortView from '../view/sort-view.js';
import { render, remove } from '../framework/render.js';
import ListView from '../view/form-elements/list-view.js';
import NoEventView from '../view/no-event-view.js';
import LoadingView from '../view/loading-view.js';
import TripInfoView from '../view/trip-info-view.js';
import NewEventButtonView from '../view/new-event-button-view.js';
import { RenderPosition } from '../render.js';
import PointPresenter from './point-presenter.js';
import { sortPointsByDay, sortPointsByTime, sortPointsByPrice, filter } from '../utils.js';
import { SortType, UserAction, UpdateType, FilterType, DEFAULT_FILTER_TYPE } from '../const.js';

export default class BoardPresenter {
  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;
  #defaultFilter = DEFAULT_FILTER_TYPE;

  #noEventComponent = null;
  #sortComponent = null;
  #tripInfoComponent = null;
  #listComponent = new ListView();
  #filterModel = null;

  #newEventButtonComponent = null;
  #newPointPresenter = null;
  #isAddFormOpen = false;
  #loadingScreenComponent = new LoadingView();
  #isLoading = true;

  constructor({ boardHeader, boardContainer, pointsModel, destinationsModel, offersModel, filterModel }) {
    this.boardHeader = boardHeader;
    this.boardContainer = boardContainer;
    this.pointsModel = pointsModel;
    this.destinationsModel = destinationsModel;
    this.offersModel = offersModel;
    this.#filterModel = filterModel;

    this.pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    this.#newPointPresenter = new PointPresenter(
      this.#listComponent.element,
      this.#handleViewAction,
      this.#handleModeChange
    );
  }

  get points() {
    const filterType = this.#filterModel.filter;
    const points = this.pointsModel.points;
    const filteredPoints = filter[filterType](points);

    switch (this.#currentSortType) {
      case SortType.DAY:
        return [...filteredPoints].sort(sortPointsByDay);
      case SortType.TIME:
        return [...filteredPoints].sort(sortPointsByTime);
      case SortType.PRICE:
        return [...filteredPoints].sort(sortPointsByPrice);
    }

    return filteredPoints;
  }

  init() {
    render(this.#loadingScreenComponent, this.boardContainer);
    this.#renderNewEventButton();
  }

  #renderNewEventButton() {
    if (this.#newEventButtonComponent) {
      remove(this.#newEventButtonComponent);
    }

    this.#newEventButtonComponent = new NewEventButtonView({
      isAddFormOpen: this.#isAddFormOpen,
      onNewEventButtonClick: this.#handleNewEventButtonClick
    });

    render(this.#newEventButtonComponent, this.boardHeader);
  }

  #handleNewEventButtonClick = () => {
    if (this.#noEventComponent) {
      remove(this.#noEventComponent);
    }
    this.#isAddFormOpen = true;
    this.#renderNewEventButton();
    this.#handleModeChange();
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    this.#newPointPresenter.initAddForm(
      this.destinations,
      this.offers,
      () => {
        this.#isAddFormOpen = false;
        this.#renderNewEventButton();
      }
    );
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data, this.destinations, this.offers);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({ resetSortType: true });
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingScreenComponent);
        this.destinations = this.destinationsModel.destinations;
        this.offers = this.offersModel.offers;
        this.#renderBoard();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    this.#clearBoard();
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#renderBoard();
  };

  #clearBoard({ resetSortType = false } = {}) {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    remove(this.#tripInfoComponent);
    remove(this.#noEventComponent);

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderBoard() {
    if (this.#isLoading) {
      render(this.#loadingScreenComponent, this.boardContainer);
      return;
    }

    const points = this.points;
    const pointsCount = points.length;

    if (pointsCount === 0 && !this.#isAddFormOpen) {
      const currentFilter = this.#filterModel.filter;
      this.#renderNoEvents(currentFilter);
      return;
    }

    this.#tripInfoComponent = new TripInfoView(this.pointsModel.points, this.destinations, this.offers);
    render(this.#tripInfoComponent, this.boardHeader, RenderPosition.AFTERBEGIN);

    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortComponent, this.boardContainer);

    render(this.#listComponent, this.boardContainer);
    this.#renderPoints(points);
  }

  #renderPoints(points) {
    points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter(
      this.#listComponent.element,
      this.#handleViewAction,
      this.#handleModeChange
    );

    pointPresenter.init(point, this.destinations, this.offers);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderNoEvents(currentFilter) {
    this.#noEventComponent = new NoEventView({ filterType: currentFilter });
    render(this.#noEventComponent, this.boardContainer);
  }

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetPoint());
  };
}
