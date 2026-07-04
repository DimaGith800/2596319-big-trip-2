import AbstractView from '../../framework/view/abstract-view';

function createElementTemplate(isDisabled) {
  return `<button class="event__rollup-btn" type="button" ${isDisabled ? 'disabled' : ''}>
            <span class="visually-hidden">Open event</span>
          </button>`;
}

export default class RollupButtonView extends AbstractView {
  #isDisabled = false;

  constructor(isDisabled) {
    super();
    this.#isDisabled = isDisabled;
  }

  get template() {
    return createElementTemplate(this.#isDisabled);
  }
}
