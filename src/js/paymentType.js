import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import Swiper from 'swiper/bundle';
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
      validTypes: this.element.querySelectorAll('.js-valid-payment-type'),
      swiper: this.element.querySelector('.snippet__swiper'),
    };

    this.activePaymentMethod = null;

    this.DOM.validTypes.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setPaymentType(btn);
      });
    });

    this.setCopies();
    this.init();
  }

  setPaymentType(btn) {
    if (this.activePaymentMethod === null) {
      // there isnt an active method
      // we set the active method to the one clicked
      this.activePaymentMethod = btn;
      this.activePaymentMethod.classList.add('payment-type__button--active');
      return;
    }

    if (this.activePaymentMethod === btn) {
      // active method is the same as the one clicked
      // we remove active method
      this.activePaymentMethod.classList.remove('payment-type__button--active');
      this.activePaymentMethod = null;
      return;
    }

    // active method is not the same as the one clicked
    // we change the active method to the one clicked
    this.activePaymentMethod.classList.remove('payment-type__button--active');
    this.activePaymentMethod = btn;
    this.activePaymentMethod.classList.add('payment-type__button--active');
  }

  init() {
    this.accordion = new Accordion(this.DOM.accordionElement, {
      duration: 600,
      elementClass: 'accordion__item',
      triggerClass: 'accordion__header',
      panelClass: 'accordion__panel',
      ariaEnabled: false,
      // observer: true,
      // observeSlideChildren: true,
    });

    // this.swiper = new Swiper(this.DOM.swiper, {
    //   slidesPerView: 'auto',
    //   loop: false,
    //   freeMode: true,
    //   freeModeMomentumBounce: false,
    //   resistanceRatio: 0,
    //   spaceBetween: 16,
    // });

    // this.accordion.openAll();

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
