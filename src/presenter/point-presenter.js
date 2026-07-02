import PointView from '../view/point-view.js';
import AddFormView from '../view/add-form-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { UserAction, UpdateType } from '../const.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
  ADD: 'ADD'
};

export default class PointPresenter {
  #container = null;
  #changeData = null;
  #changeMode = null;

  #point = null;
  #destinations = [];
  #offers = [];

  #pointComponent = null;
  #pointEditComponent = null;
  #pointAddComponent = null;
  #mode = Mode.DEFAULT;
  #destroyAddFormCallback = null;

  constructor(container, changeData, changeMode) {
    this.#container = container;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  init(point, destinations, offers) {
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;

    const prevPointComponent = this.#pointComponent;
    const prevPointEditComponent = this.#pointEditComponent;

    const destination = this.#destinations.find((dest) => dest.id === point.destination);

    const offersByType = this.#offers.find((opt) => opt.type === point.type)?.offers || [];
    const selectedOffers = offersByType.filter((opt) => point.offers.includes(opt.id));

    this.#pointComponent = new PointView(point, destination, selectedOffers, {
      onRollupClick: this.#handleRollupClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    if (prevPointComponent === null) {
      render(this.#pointComponent, this.#container);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      prevPointEditComponent.reset(point);
      this.#pointEditComponent = prevPointEditComponent;
    }

    remove(prevPointComponent);
    if (this.#mode === Mode.DEFAULT) {
      remove(prevPointEditComponent);
    }
  }

  resetPoint() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#replaceFormToPoint();
    }
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
  }

  initAddForm(destinations, offers, onAddFormClose) {
    this.#mode = Mode.ADD;
    if(this.#pointEditComponent) {
      remove(this.#pointEditComponent);
    }
    this.#destinations = destinations;
    this.#offers = offers;
    this.#destroyAddFormCallback = onAddFormClose;

    const defaultPoint = {
      type: 'taxi',
      destination: destinations[0].id,
      basePrice: 110,
      dateFrom: '2026-04-10T22:55:56.845Z',
      dateTo: '2026-04-11T11:22:13.375Z',
      offers: [],
      isFavorite: false
    };

    this.#pointAddComponent = new AddFormView(
      defaultPoint,
      this.#destinations,
      this.#offers,
      {
        onFormSubmit: (newPoint) => {
          this.#changeData(UserAction.ADD_POINT, UpdateType.MINOR, { ...newPoint, id: crypto.randomUUID() });
          this.#replaceAddFormToPoint();
        },
        onRollupClick: () => {
          this.#replaceAddFormToPoint();
        },
        onCancelButtonClick: () => {
          this.#replaceAddFormToPoint();
        }
      }
    );

    render(this.#pointAddComponent, this.#container, 'afterbegin');
  }

  #replacePointToForm() {
    if (this.#pointAddComponent !== null) {
      this.#replaceAddFormToPoint();
    }
    this.#pointEditComponent = new EditFormView(this.#point, this.#destinations, this.#offers, {
      onFormSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleFormRollupClick,
      onEditModeEnter: this.#handleRollupClick,
      onDeleteButtonClick: this.#handleFormDeleteButtonClick
    });
    this.#changeMode();
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.EDITING;
  }

  #replaceFormToPoint() {
    replace(this.#pointComponent, this.#pointEditComponent);
    this.#pointEditComponent.destroy();
    this.#pointEditComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #replaceAddFormToPoint = () => {
    if (this.#pointAddComponent === null) {
      return;
    }

    remove(this.#pointAddComponent);
    this.#pointAddComponent.destroy();
    this.#pointAddComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;

    if (this.#destroyAddFormCallback) {
      this.#destroyAddFormCallback();
    }
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();

      if (this.#mode === Mode.EDITING) {
        this.#replaceFormToPoint();
      } else if (this.#pointAddComponent !== null) {
        this.#replaceAddFormToPoint();
      }
    }
  };

  #handleRollupClick = () => {
    this.#replacePointToForm();
  };

  #handleFormSubmit = (updatedPoint) => {
    this.#changeData(UserAction.UPDATE_POINT, UpdateType.MINOR, updatedPoint);
  };

  #handleFormRollupClick = () => {
    this.#replaceFormToPoint();
  };

  #handleFormDeleteButtonClick = (pointData) => {
    this.#changeData(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      pointData
    );
  };

  #handleFavoriteClick = () => {
    this.#changeData(UserAction.UPDATE_POINT, UpdateType.PATCH, {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    });
  };
}
