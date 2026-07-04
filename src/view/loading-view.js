import AbstractView from '../framework/view/abstract-view.js';

function createElementTemplate(isLoadingFailed) {
  return `<p class="trip-events__msg">${isLoadingFailed ? 'Failed to load latest route information' : 'Loading...'}</p>`;
}

export default class LoadingView extends AbstractView {
  #isLoadingFailed = false;

  constructor(isLoadingFailed) {
    super();
    this.#isLoadingFailed = isLoadingFailed;
  }

  get template() {
    return createElementTemplate(this.#isLoadingFailed);
  }
}
