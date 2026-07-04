import AbstractView from '../../framework/view/abstract-view';

function createElementTemplate(isDeleting) {
  return `<button class="event__reset-btn"
   type="reset">${isDeleting ? 'Deleting...' : 'Delete'}</button>`;
}

export default class DeleteButtonView extends AbstractView {
  #isDeleting = null;

  constructor(isDeleting) {
    super();
    this.#isDeleting = isDeleting;
  }

  get template() {
    return createElementTemplate(this.#isDeleting);
  }
}
