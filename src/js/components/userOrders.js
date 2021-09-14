import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import texts from '../utils/texts';
import Alert from './alert';
import API from './api';
import { store } from '../utils/store';

export default class {
  constructor(element) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.element = element;
    this.init();
  }

  init() {
    this.DOM.orders = this.DOM.element.querySelectorAll('.user-orders__item');
    this.DOM.orders.forEach((order) => {
      const { orderId } = order.dataset;
      order.addEventListener('click', () => {
        this.showOrder(orderId);
      });
    });
  }

  async showOrder(orderId) {
    console.log(orderId);
  }
}
