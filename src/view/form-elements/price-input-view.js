import AbstractView from '../../framework/view/abstract-view';

function createElementTemplate(isSaving, price) {
  return `<div class="event__field-group  event__field-group--price" bis_skin_checked="1">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              € 
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${price}" ${isSaving ? 'disabled' : ''}>
          </div>`;
}

export default class PriceInputView extends AbstractView {
  #price = null;
  #isSaving = false;

  constructor(price, isSaving = false) {
    super();
    this.#price = price;
    this.#isSaving = isSaving;
  }

  get template() {
    return createElementTemplate(this.#isSaving, this.#price);
  }
}
