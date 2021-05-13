import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';

export default class {
  constructor() {
    console.log('cart init');
    autoBind(this);
    this.DOM = {};
    this.DOM.toggler = document.querySelector('.cart__toggler');
    this.DOM.togglerBtn = document.querySelector('.cart__toggler-btn');

    this.isOpen = false;
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
  }

  showCart() {
    console.log('showing cart');
    this.DOM.cart.classList.toggle('cart--active');
    document.body.classList.toggle('hide-overflow');
  }

  hideCart() {
    console.log('hiding cart');
    this.DOM.cart.classList.toggle('cart--active');
    document.body.classList.toggle('hide-overflow');
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
