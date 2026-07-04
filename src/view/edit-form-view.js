import { BlankPoint, State } from '../const.js';
import EventTypeView from './form-elements/event-type-view.js';
import DestinationInputView from './form-elements/destination-input-view.js';
import TimeInputView from './form-elements/time-input-view.js';
import PriceInputView from './form-elements/price-input-view.js';
import SaveButtonView from './form-elements/save-button-view.js';
import DeleteButtonView from './form-elements/delete-button-view.js';
import DestinationBlockView from './form-elements/destination-block-view.js';
import RollupButtonView from './form-elements/rollup-button-view.js';
import OffersCheckboxesContainerView from './form-elements/offers-checkboxes-container.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import { render } from '../framework/render.js';
import DestinationPhotosView from './form-elements/destination-photos-view.js';

function createElementTemplate() {
  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header"></header>
        <section class="event__details"></section>
      </form>
    </li>`
  );
}

export default class EditFormView extends AbstractStatefulView {
  #allDestinations = null;
  #allOffers = null;
  #handleFormSubmit = null;
  #handleRollupClick = null;
  #handleFormDeleteButtonClick = null;
  #onEditModeEnter = null;

  constructor(point = BlankPoint, allDestinations, allOffers, { onFormSubmit, onRollupClick, onEditModeEnter, onDeleteButtonClick }) {
    super();
    this.#allDestinations = allDestinations;
    this.#allOffers = allOffers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;
    this.#handleFormDeleteButtonClick = onDeleteButtonClick;
    this.#onEditModeEnter = onEditModeEnter;

    this._setState(EditFormView.parsePointToState(point));
    this._restoreHandlers();
  }

  get template() {
    return createElementTemplate();
  }

  _restoreHandlers() {
    this.#renderForm();

    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollupClickHandler);
    this.element.querySelector('.event__type-list').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteClickHandler);
    this.element.querySelectorAll('.event__offer-selector').forEach((checkbox) => checkbox.addEventListener('change', this.#offersChangeHandler));
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputChangeHandler);
  }

  #renderForm() {
    const header = this.element.querySelector('.event__header');
    const details = this.element.querySelector('.event__details');

    header.innerHTML = '';
    details.innerHTML = '';

    if (this.timeInputView) {
      this.timeInputView.removeTimeInput();
    }

    const currentDestination = this.#allDestinations.find((dest) => dest.id === this._state.destination);
    const offersByType = this.#allOffers.find((opt) => opt.type === this._state.type);
    const description = currentDestination ? currentDestination.description : '';

    this.timeInputView = new TimeInputView(this._state.dateFrom, this._state.dateTo, {
      dateChangeHandler: this.#dateChangeHandler
    });
    this.DestinationInputView = new DestinationInputView(this._state.type, currentDestination, this.#allDestinations);

    render(new EventTypeView(this._state.type), header);
    render(this.DestinationInputView, header);
    render(this.timeInputView, header);

    render(new PriceInputView(this._state.basePrice, this._state.isDisabled), header);

    this.saveButtonView = new SaveButtonView(this._state.isSaving);
    render(this.saveButtonView, header);
    this.DeleteButtonView = new DeleteButtonView(this._state.isDeleting);
    render(this.DeleteButtonView, header);
    render(new RollupButtonView(this._state.isDisabled), header);

    if (offersByType && offersByType.offers && offersByType.offers.length > 0) {
      render(new OffersCheckboxesContainerView(offersByType.offers, this._state.offers), details);
    }

    const currentPictures = currentDestination ? currentDestination.pictures : [];

    if (description || (currentPictures && currentPictures.length > 0)) {
      render(new DestinationBlockView(description), details);
    }

    if (currentPictures && currentPictures.length > 0) {
      this.destinationPhotosView = new DestinationPhotosView(currentPictures);
      render(this.destinationPhotosView, details);
    }
  }

  setViewActionState(state) {
    switch (state) {
      case State.SAVING:
        this.updateElement({
          isSaving: true,
          isDisabled: true
        });
        break;
      case State.DELETING:
        this.updateElement({
          isDeleting: true,
          isDisabled: true
        });
        break;
      case State.ABORTING: {
        const resetFormState = () => {
          this.updateElement({
            isDisabled: false,
            isDeleting: false,
            isSaving: false
          });
        };
        this.shake(resetFormState);
        break;
      }
    }
  }

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    if (evt.target.tagName !== 'INPUT') {
      return;
    }

    this.updateElement({
      type: evt.target.value,
      offers: []
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const currentDestination = this.#allDestinations.find((dest) => dest.name === evt.target.value);

    if (!currentDestination) {
      evt.target.value = '';
      return;
    }

    this.updateElement({
      destination: currentDestination.id
    });
  };

  #offersChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT' || !evt.target.classList.contains('event__offer-checkbox')) {
      return;
    }
    const clickedOfferId = isNaN(evt.target.value) ? evt.target.value : Number(evt.target.value);

    const currentOffers = [...this._state.offers];
    const offerIndex = currentOffers.indexOf(clickedOfferId);

    if (offerIndex === -1) {
      currentOffers.push(clickedOfferId);
    } else {
      currentOffers.splice(offerIndex, 1);
    }

    this.updateElement({
      offers: currentOffers,
    });
  };

  #priceInputChangeHandler = (evt) => {
    evt.preventDefault();

    let validatedValue = evt.target.value.replace(/\D/g, '');
    if (validatedValue === '') {
      validatedValue = '100';
    }

    let priceNumber = parseInt(validatedValue, 10);
    if (priceNumber === 0) {
      priceNumber = 100;
    }

    this.updateElement({
      basePrice: priceNumber
    });
  };

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormDeleteButtonClick(EditFormView.parseStateToPoint(this._state));
  };

  #dateChangeHandler = (userDate, type) => {
    this._setState({
      [type]: userDate,
    });
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit(EditFormView.parseStateToPoint(this._state));
  };

  destroy = () => {
    super.removeElement();
    if (this.timeInputView) {
      this.timeInputView.removeTimeInput();
    }
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  static parsePointToState(point) {
    return { ...point };
  }

  static parseStateToPoint(state) {
    return { ...state };
  }

  reset(point) {
    this.updateElement(
      EditFormView.parsePointToState(point)
    );
  }
}
