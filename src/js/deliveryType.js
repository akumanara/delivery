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
      onOpen() {
        store.app.reflow();
      },
      onClose() {
        store.app.reflow();
      },
    });

    // event listeners
    if (this.DOM.deliveryButton) {
      this.DOM.deliveryButton.addEventListener('click', this.setMethodDelivery);
    }
    if (this.DOM.takeawayButton) {
      this.DOM.takeawayButton.addEventListener('click', this.setMethodTakeAway);
    }
  }

  async setMethodDelivery() {
    PubSub.publish('show_loader');
    // fetch the html for the modal
    const cart = await this.api.changeCartTypeToDelivery();

    // Active states and copies
    this.updateMethodToDelivery();

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);

    PubSub.publish('hide_loader');

    // Close the accordion
    this.accordion.close(0);
  }

  async setMethodTakeAway() {
    PubSub.publish('show_loader');
    // fetch the html for the modal
    const cart = await this.api.changeCartTypeToPickup();

    // Active states and copies
    this.updateMethodToTakeAway();

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);

    PubSub.publish('hide_loader');

    // Close the accordion
    this.accordion.close(0);
  }

  setCopies() {
    if (this.deliveryMethod === deliveryTypes.DELIVERY) {
      const deliveryFee = currencyFormat(store.context.deliveryFee);
      this.DOM.topCopy.innerText = texts.deliveryFee(deliveryFee);
      this.DOM.openedCopy.innerText = texts.deliveryFee(deliveryFee);
      this.DOM.bottomCopy.innerText = texts.delivery;
    } else {
      this.DOM.topCopy.innerText = texts.takeawayLocation(
        store.context.storeAddress,
      );
      this.DOM.openedCopy.innerText = texts.takeawayLocation(
        store.context.storeAddress,
      );
      this.DOM.bottomCopy.innerText = texts.takeaway;
    }
  }

  updateMethodToTakeAway() {
    this.deliveryMethod = deliveryTypes.TAKEAWAY;
    if (this.DOM.deliveryButton) {
      this.DOM.deliveryButton.classList.remove('active');
    }
    if (this.DOM.takeawayButton) {
      this.DOM.takeawayButton.classList.add('active');
    }

    // Change copies
    this.setCopies();
  }

  updateMethodToDelivery() {
    this.deliveryMethod = deliveryTypes.DELIVERY;

    if (this.DOM.takeawayButton) {
      this.DOM.takeawayButton.classList.remove('active');
    }
    if (this.DOM.deliveryButton) {
      this.DOM.deliveryButton.classList.add('active');
    }

    // Change copies
    this.setCopies();
  }
}
