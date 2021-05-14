import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import Product from './product';

export default class {
  constructor() {
    autoBind(this);
    this.DOM = {};
    this.DOM.cart = document.querySelector('.cart');
    this.DOM.toggler = document.querySelector('.cart__toggler');
    this.DOM.togglerBtn = document.querySelector('.cart__toggler-btn');
    this.DOM.togglerPrice = document.querySelector('.cart__checkout-btn-price');

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
    console.log('init cart');
    // Query the DOM elements
    this.DOM.cartBody = document.querySelector('.cart__body');
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
}
