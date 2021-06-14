import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import API from './api';
import { store } from './store';
import { deliveryTypes } from './enum';

export default class {
  constructor() {
    autoBind(this);

    this.api = new API();
    this.DOM = {};
    this.DOM.cart = document.querySelector('.checkout-cart');
    this.DOM.cartBody = document.querySelector('.checkout-cart__body');

    // Subscribe to cart update event
    PubSub.subscribe('cart_update', this.cartUpdate);

    window.addEventListener('load', this.getCart);
  }

  // this function must run everytime the cart is being updated
  init() {
    console.log('init cart');
    const self = this;

    // Query the DOM elements
    this.DOM.cartBody = document.querySelector('.checkout-cart__body');

    // Update the show cart button with the summary
    // const sumPriceElement = this.DOM.cartBody.querySelector(
    //   '.cart__pricing-summary-price',
    // );
    // if (sumPriceElement) {
    //   this.DOM.togglerPrice.innerText = sumPriceElement.innerText;
    // }
  }

  cartUpdate(msg, data) {
    console.log('cart is updated');

    // Remove the cart body
    this.DOM.cartBody.remove();
    // Insert the new body
    this.DOM.cart.insertAdjacentHTML('beforeend', data);
    // Re init
    this.init();
  }

  // First time we get the cart on page load
  async getCart() {
    PubSub.publish('show_loader');
    // fetch the html for the modal
    const cart = await this.api.getCheckoutCart();

    // Insert the new body
    this.DOM.cart.insertAdjacentHTML('beforeend', cart);

    // Re init
    this.init();

    // Set delivery type
    if (this.DOM.cartBody.dataset.deliveryType === deliveryTypes.DELIVERY) {
      store.app.deliveryType.updateMethodToDelivery();
    } else if (
      this.DOM.cartBody.dataset.deliveryType === deliveryTypes.TAKEAWAY
    ) {
      store.app.deliveryType.updateMethodToTakeAway();
    }

    PubSub.publish('hide_loader');
  }
}
