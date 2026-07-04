import AbstractView from '../../framework/view/abstract-view';

function createElementTemplate(isSaving) {
  return `<button class="event__save-btn  btn  btn--blue"
   type="submit">${isSaving ? 'Saving...' : 'Save'}</button>`;
}

export default class SaveButtonView extends AbstractView {
  #isSaving = false;

  constructor(isSaving) {
    super();
    this.#isSaving = isSaving;
  }

  get template() {
    return createElementTemplate(this.#isSaving);
  }
}
