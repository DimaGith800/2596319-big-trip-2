import Observable from '../framework/observable.js';
import { UpdateType } from '../const.js';

export default class PointsModel extends Observable {
  #points = [];
  #apiService = null;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get points() {
    return [...this.#points];
  }

  async init() {
    try {
      const points = await this.#apiService.points;
      this.#points = points.map((point) => this.#apiService.adaptPointToClient(point));
      this._notify(UpdateType.INIT);
    } catch {
      this.#points = [];
    }
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#apiService.updatePoint(update);

      this.#points = [
        ...this.#points.slice(0, index),
        response,
        ...this.#points.slice(index + 1),
      ];

      this._notify(updateType, response);
    } catch (err) {
      throw new Error('Can\'t update point on server');
    }
  }

  addPoint(updateType, update) {
    this.#points = [
      update,
      ...this.#points,
    ];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, update);
  }
}
