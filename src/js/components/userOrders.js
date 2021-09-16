import autoBind from 'auto-bind';
import API from './api';
import UserOrder from './userOrder';

// This class manages all the user orders. maybe we can have an instance for each order?
export default class {
  constructor(element) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.element = element;
    this.userOrders = [];
    this.init();
  }

  init() {
    this.DOM.orders = this.DOM.element.querySelectorAll('.user-orders__item');
    this.DOM.orders.forEach((order) => {
      const tempUserOrder = new UserOrder(order);
      this.userOrders.push(tempUserOrder);
    });
  }
}
