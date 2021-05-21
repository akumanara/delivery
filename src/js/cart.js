import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import Product from './product';
import API from './api';
import { store } from './store';
import { deliveryTypes } from './enum';

export default class {
  constructor() {
    autoBind(this);

    this.api = new API();
    this.DOM = {};
    this.DOM.cart = document.querySelector('.cart');
    this.DOM.toggler = document.querySelector('.cart__toggler');
    this.DOM.togglerBtn = document.querySelector('.cart__toggler-btn');
    this.DOM.togglerPrice = document.querySelector('.cart__checkout-btn-price');
    this.DOM.cartBody = document.querySelector('.cart__body');

    this.isOpen = false;
    // The products from cart
    this.products = [];

    this.DOM.togglerBtn.addEventListener('click', this.toggleCart);

    // Subscribe to cart update event
    PubSub.subscribe('cart_update', this.cartUpdate);

    // this.cartIndexToStayOpen = false;
    // Hook the load event to get the cart dynamically
    // document.addEventListener('DOMContentLoaded', this.getCart);
    window.addEventListener('load', this.getCart);
    // this.init();
  }

  // this function must run everytime the cart is being updated
  init() {
    console.log('init cart');
    const self = this;

    // Query the DOM elements
    this.DOM.cartBody = document.querySelector('.cart__body');
    this.DOM.closeBtn = document.querySelector('.cart__header-close');

    // Setup event listeners
    this.DOM.closeBtn.addEventListener('click', this.toggleCart);

    // Create product accordions
    this.accordions = [];
    document
      .querySelectorAll('.cart .accordion__container')
      .forEach((el, index) => {
        let tmpAccordionContainer;
        const accordionOptions = {
          duration: 600,
          elementClass: 'accordion__item',
          triggerClass: 'accordion__header',
          panelClass: 'accordion__panel',
          ariaEnabled: false,
          beforeOpen() {
            // close other accordions if opened
            self.closeGroupOptions(tmpAccordionContainer);
          },
        };
        if (el.dataset.open) {
          accordionOptions.openOnInit = [0];
        }
        tmpAccordionContainer = new Accordion(el, accordionOptions);
        this.accordions.push(tmpAccordionContainer);
      });

    // Remove the in cart class for all the products
    store.app.productList.removeInCartStatusFromAllProducts();

    // Create products
    this.DOM.cart
      .querySelectorAll('.cart__product')
      .forEach((productElement) => {
        // Create the product object
        const tmpProduct = new Product(productElement);
        this.products.push(tmpProduct);

        // Tag the product in the store menu with (in cart class)
        store.app.productList.addInCartStatusToProduct(tmpProduct.productID);
      });

    // Update the show cart button with the summary
    const sumPriceElement = this.DOM.cartBody.querySelector(
      '.cart__pricing-summary-price',
    );
    if (sumPriceElement) {
      this.DOM.togglerPrice.innerText = sumPriceElement.innerText;
    }

    // Check if we need to show the toggle-cart button or not
    this.showCartButtonLogic();
  }

  showCartButtonLogic() {
    // Show the toggle-cart button if we have at least one product
    if (this.products.length > 0) {
      this.DOM.toggler.classList.add('cart__toggler--active');
    } else {
      this.DOM.toggler.classList.remove('cart__toggler--active');
    }
  }

  // Closes all the accordions except the one to be opened
  closeGroupOptions(accordionToBeOpened) {
    this.accordions.forEach((accordion) => {
      if (accordionToBeOpened !== accordion) {
        accordion.close(0);
      }
    });
  }

  destroy() {
    this.accordions.forEach((accordion) => {
      accordion.destroy();
    });
    this.accordions = [];
    this.products = [];
  }

  showCart() {
    console.log('showing cart');
    this.DOM.cart.classList.add('cart--active');
    document.body.classList.add('hide-overflow');
  }

  hideCart() {
    console.log('hiding cart');
    this.DOM.cart.classList.remove('cart--active');
    document.body.classList.remove('hide-overflow');
  }

  toggleCart() {
    if (this.isOpen) {
      this.hideCart();
    } else {
      this.showCart();
    }
    this.isOpen = !this.isOpen;
  }

  cartUpdate(msg, data) {
    console.log('cart is updated');

    // Destroy everything that is old
    this.destroy();
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
    const cart = await this.api.getCart();

    // Insert the new body
    this.DOM.cart.insertAdjacentHTML('beforeend', cart);

    // Re init
    this.init();

    // Set delivery type
    if (this.DOM.cartBody.dataset.deliveryType === deliveryTypes.DELIVERY) {
      store.app.deliveryType.setMethodDeliveryWithoutAPICall();
    } else if (
      this.DOM.cartBody.dataset.deliveryType === deliveryTypes.TAKEAWAY
    ) {
      store.app.deliveryType.setMethodTakeAwayWithoutAPICall();
    }

    PubSub.publish('hide_loader');
  }
}
