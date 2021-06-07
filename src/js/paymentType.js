import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import { store } from './store';
import API from './api';
import texts from './texts';
import { currencyFormat } from './utils';
import { deliveryTypes } from './enum';

export default class {
  constructor() {
    autoBind(this);
    // this.api = new API();
    this.element = document.querySelector('.payment-type');
    this.DOM = {
      accordionElement: this.element.querySelector('.accordion__container'),
      topCopy: this.element.querySelector('.delivery-type__option-header-top'),
      bottomCopy: this.element.querySelector(
        '.delivery-type__option-header-bottom',
      ),
      openedCopy: this.element.querySelector(
        '.delivery-type__option-header-opened-copy',
      ),
    };

    this.setCopies();
    this.init();
  }

  init() {
    this.accordion = new Accordion(this.DOM.accordionElement, {
      duration: 600,
      elementClass: 'accordion__item',
      triggerClass: 'accordion__header',
      panelClass: 'accordion__panel',
      ariaEnabled: false,
    });
    this.accordion.openAll();

    // // event listeners
    // if (this.DOM.deliveryButton) {
    //   this.DOM.deliveryButton.addEventListener('click', this.setMethodDelivery);
    // }
    // if (this.DOM.takeawayButton) {
    //   this.DOM.takeawayButton.addEventListener('click', this.setMethodTakeAway);
    // }
  }

  setCopies() {
    // if (this.deliveryMethod === deliveryTypes.DELIVERY) {
    //   const deliveryFee = currencyFormat(store.context.deliveryFee);
    //   this.DOM.topCopy.innerText = texts.deliveryFee(deliveryFee);
    //   this.DOM.openedCopy.innerText = texts.deliveryFee(deliveryFee);
    //   this.DOM.bottomCopy.innerText = texts.delivery;
    // } else {
    //   this.DOM.topCopy.innerText = texts.takeawayLocation(
    //     store.context.storeAddress,
    //   );
    //   this.DOM.openedCopy.innerText = texts.takeawayLocation(
    //     store.context.storeAddress,
    //   );
    //   this.DOM.bottomCopy.innerText = texts.takeaway;
    // }
  }
}
