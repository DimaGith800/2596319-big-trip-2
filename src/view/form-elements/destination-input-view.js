import AbstractView from '../../framework/view/abstract-view.js';

function createElementTemplate(type, destination, allDestinations, isSaving) {
  const name = destination ? destination.name : '';

  const datalistTemplate = allDestinations
    .map((dest) => `<option value="${dest.name}"></option>`)
    .join('');

  return `<div class="event__field-group  event__field-group--destination" bis_skin_checked="1">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${type}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${name}" list="destination-list-1" ${isSaving ? 'disabled' : ''}>
            <datalist id="destination-list-1">
              ${datalistTemplate}
            </datalist>
          </div>`;
}

export default class DestinationInputView extends AbstractView {
  #type = null;
  #destination = null;
  #allDestinations = null;
  #isSaving = false;

  constructor(type, destination, allDestinations, isSaving) {
    super();
    this.#type = type;
    this.#destination = destination;
    this.#allDestinations = allDestinations;
    this.#isSaving = isSaving;
  }

  get template() {
    return createElementTemplate(this.#type, this.#destination, this.#allDestinations, this.#isSaving);
  }
}
