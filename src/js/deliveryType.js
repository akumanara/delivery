import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import { store } from './store';
import API from './api';

const deliveryTypes = {
  DELIVERY: 'delivery',
  TAKEAWAY: 'takeaway',
};

export default class {
  constructor() {
    autoBind(this);
    this.api = new API();
    this.element = document.querySelector('.delivery-type');
    this.DOM = {
      accordionElement: this.element.querySelector('.accordion__container'),
      topCopy: this.element.querySelector('.delivery-type__option-header-top'),
      bottomCopy: this.element.querySelector(
        '.delivery-type__option-header-bottom',
      ),
      openedCopy: this.element.querySelector(
        '.delivery-type__option-header-opened-copy',
      ),
      deliveryButton: this.element.querySelector('.js-delivery-type__delivery'),
      takeawayButton: this.element.querySelector('.js-delivery-type__takeaway'),
    };
    this.deliveryMethod = deliveryTypes.DELIVERY;

    this.init();
  }

  init() {
    this.accordion = new Accordion(this.DOM.accordionElement, {
      duration: 600,
      elementClass: 'accordion__item',
      triggerClass: 'accordion__header',
      panelClass: 'accordion__panel',
      ariaEnabled: false,
      onOpen() {
        store.app.reflow();
      },
      onClose() {
        store.app.reflow();
      },
    });

    // event listeners
    this.DOM.deliveryButton.addEventListener('click', this.setMethodDelivery);
    this.DOM.takeawayButton.addEventListener('click', this.setMethodTakeAway);
  }

  async setMethodDelivery() {
    PubSub.publish('show_loader');
    // fetch the html for the modal
    const cart = await this.api.changeCartTypeToDelivery();

    this.deliveryMethod = deliveryTypes.DELIVERY;
    this.DOM.takeawayButton.classList.remove('active');
    this.DOM.deliveryButton.classList.add('active');

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);

    PubSub.publish('hide_loader');
  }

  async setMethodTakeAway() {
    PubSub.publish('show_loader');
    // fetch the html for the modal
    const cart = await this.api.changeCartTypeToPickup();

    this.deliveryMethod = deliveryTypes.TAKEAWAY;
    this.DOM.deliveryButton.classList.remove('active');
    this.DOM.takeawayButton.classList.add('active');

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);

    PubSub.publish('hide_loader');
  }
}
