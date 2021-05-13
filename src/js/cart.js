import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import Product from './product';

export default class {
  constructor() {
    autoBind(this);
    this.DOM = {};
    this.DOM.toggler = document.querySelector('.cart__toggler');
    this.DOM.togglerBtn = document.querySelector('.cart__toggler-btn');

    this.isOpen = false;
    // The products from cart
    this.products = [];

    this.DOM.togglerBtn.addEventListener('click', this.toggleCart);

    // Subscribe to cart update event
    PubSub.subscribe('cart_update', this.cartUpdate);

    this.init();
  }

  // this function must run everytime the cart is being updated
  init() {
    // Query the DOM elements
    this.DOM.cart = document.querySelector('.cart');
    this.DOM.closeBtn = document.querySelector('.cart__header-close');

    // Setup event listeners
    this.DOM.closeBtn.addEventListener('click', this.toggleCart);

    // Create product accordions
    this.accordions = [];
    document.querySelectorAll('.cart .accordion__container').forEach((el) => {
      const tmpAccordionContainer = new Accordion(el, {
        duration: 600,
        elementClass: 'accordion__item',
        triggerClass: 'accordion__header',
        panelClass: 'accordion__panel',
        ariaEnabled: false,
      });
      this.accordions.push(tmpAccordionContainer);
    });

    // Create products
    this.DOM.cart
      .querySelectorAll('.cart__product')
      .forEach((productElement) => {
        const tmpProduct = new Product(productElement);
        this.products.push(tmpProduct);
      });
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
    console.log(data);
    console.log(this);
    this.DOM.toggler.classList.add('cart__toggler--active');
  }
}
