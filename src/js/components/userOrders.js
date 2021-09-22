import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import API from './api';
import UserOrder from './userOrder';
import { UserOrdersTemplate } from '../utils/handlebarTemplate';

// This class manages all the user orders. maybe we can have an instance for each order?
export default class {
  constructor(element) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.element = element;
    this.userOrders = [];
    this.DOM.loadMore = document.querySelector('.js-load-more-orders');
    this.DOM.listParent = document.querySelector('.user-orders');
    this.DOM.list = document.querySelector('.user-orders__list');

    this.offset = 0;
    this.limit = 10;

    this.init();
  }

  init() {
    this.DOM.loadMore.addEventListener('click', this.loadMore);
    this.loadMore();
  }

  async loadMore() {
    PubSub.publish('show_loader');
    let result;
    try {
      result = await this.api.getOrders(this.offset, this.limit);
    } catch (error) {
      console.log(error);
      PubSub.publish('hide_loader');
      return;
    }

    const container = document.createElement('div');
    this.DOM.listParent.appendChild(container);

    const html = UserOrdersTemplate(result);
    container.insertAdjacentHTML('beforeend', html);

    const orders = container.querySelectorAll('.user-orders__item');
    orders.forEach((order) => {
      const tempUserOrder = new UserOrder(order);
      this.userOrders.push(tempUserOrder);
    });

    this.offset += this.limit;

    // if we have less than 10 orders, hide the load more button
    if (result.orders.length < this.limit) {
      this.DOM.loadMore.classList.add('d-none');
    }
    PubSub.publish('hide_loader');
  }
}
