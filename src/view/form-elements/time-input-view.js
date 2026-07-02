import AbstractView from '../../framework/view/abstract-view';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function createElementTemplate(dateFrom, dateTo) {
  return `<div class="event__field-group  event__field-group--time" bis_skin_checked="1">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFrom}">
            —
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateTo}">
          </div>`;
}

export default class TimeInputView extends AbstractView {
  #dateFrom = null;
  #dateTo = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #handleDateChange = null;

  constructor(dateFrom, dateTo, { dateChangeHandler }) {
    super();
    this.#dateFrom = dateFrom;
    this.#dateTo = dateTo;
    this.#handleDateChange = dateChangeHandler;

    this.#setDatepickers();
  }

  get template() {
    return createElementTemplate(this.#dateFrom, this.#dateTo);
  }

  removeTimeInput() {
    super.removeElement();
    this.#destroyDatepickers();
  }

  #destroyDatepickers() {
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  #setDatepickers() {
    const commonConfigs = {
      enableTime: true,
      dateFormat: 'd/m/y H:i',
      'time_24hr': true,
    };

    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        ...commonConfigs,
        defaultDate: this.#dateFrom,
        maxDate: this.#dateTo,
        onChange: ([userDate]) => {
          this.#dateFrom = userDate;
          this.#handleDateChange(userDate, 'dateFrom');
          this.#datepickerTo.set('minDate', userDate);
        },
      },
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        ...commonConfigs,
        defaultDate: this.#dateTo,
        minDate: this.#dateFrom,
        onChange: ([userDate]) => {
          this.#dateTo = userDate;
          this.#handleDateChange(userDate, 'dateTo');
          this.#datepickerFrom.set('maxDate', new Date('December 31, 2027'));
        },
      },
    );
  }
}
