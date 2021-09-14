import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import { store } from '../utils/store';
import texts from '../utils/texts';
import { paymentTypes } from '../utils/enum';

export default class {
  constructor() {
    autoBind(this);
    // this.api = new API();
    this.element = document.querySelector('.payment-type');
    this.DOM = {
      accordionElement: this.element.querySelector('.accordion__container'),
      topCopy: this.element.querySelector('.payment-type__option-header-top'),
      bottomCopy: this.element.querySelector(
        '.payment-type__option-header-bottom-inner',
      ),
      openedCopy: this.element.querySelector(
        '.payment-type__option-header-opened-copy',
      ),
      validTypes: this.element.querySelectorAll('.js-valid-payment-type'),
      swiper: this.element.querySelector('.snippet__swiper'),
    };

    // Set active method from page load
    const el = this.element.querySelector('.payment-type__button--active');
    if (el) {
      this.activePaymentMethod = el;
    } else {
      this.activePaymentMethod = null;
    }

    this.DOM.validTypes.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setPaymentType(btn);
      });
    });

    this.setCopies();
    this.init();
  }

  setPaymentType(clickedBtn) {
    if (this.activePaymentMethod === null) {
      console.log('null');
      // there isnt an active method
      // we set the active method to the one clicked
      this.activePaymentMethod = clickedBtn;
      this.activePaymentMethod.classList.add('payment-type__button--active');
    } else if (this.activePaymentMethod === clickedBtn) {
      console.log('same');
      // active method is the same as the one clicked
      // we remove active method
      this.activePaymentMethod.classList.remove('payment-type__button--active');
      this.activePaymentMethod = null;
    } else {
      // active method is not the same as the one clicked
      // we change the active method to the one clicked
      console.log('new');
      this.activePaymentMethod.classList.remove('payment-type__button--active');
      this.activePaymentMethod = clickedBtn;
      this.activePaymentMethod.classList.add('payment-type__button--active');
    }
    this.setCopies();
  }

  // coming from add to card modal
  forceSetPaymentType(btn) {
    if (this.activePaymentMethod) {
      this.activePaymentMethod.classList.remove('payment-type__button--active');
    }
    this.activePaymentMethod = btn;
    this.activePaymentMethod.classList.add('payment-type__button--active');
    this.setCopies();
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


  }


  setCopies() {
    if (this.activePaymentMethod === null) {
      // NOT SELECTED
      this.DOM.topCopy.innerHTML = texts.paymentType.notSelected.top;
      this.DOM.bottomCopy.innerHTML = texts.paymentType.notSelected.bottom;
      this.DOM.openedCopy.innerHTML = texts.paymentType.notSelected.opened;
    } else if (this.activePaymentMethod.dataset.type === paymentTypes.CASH) {
      // CASH
      this.DOM.topCopy.innerHTML = texts.paymentType.cash.top;
      this.DOM.bottomCopy.innerHTML = texts.paymentType.cash.bottom;
      this.DOM.openedCopy.innerHTML = texts.paymentType.cash.opened;
    } else if (this.activePaymentMethod.dataset.type === paymentTypes.POS) {
      // POS
      this.DOM.topCopy.innerHTML = texts.paymentType.pos.top;
      this.DOM.bottomCopy.innerHTML = texts.paymentType.pos.bottom;
      this.DOM.openedCopy.innerHTML = texts.paymentType.pos.opened;
    } else if (
      this.activePaymentMethod.dataset.type === paymentTypes.SAVED_CARD
    ) {
      // SAVED CARD
      this.DOM.topCopy.innerHTML = texts.paymentType.saved.top(
        this.activePaymentMethod.dataset.tag,
      );
      this.DOM.bottomCopy.innerHTML = texts.paymentType.saved.bottom(
        this.activePaymentMethod.dataset.lastDigits,
      );
      this.DOM.openedCopy.innerHTML = texts.paymentType.saved.opened(
        this.activePaymentMethod.dataset.tag,
      );
    } else if (
      this.activePaymentMethod.dataset.type === paymentTypes.EXPIRED_CARD
    ) {
      // EXPIRED CARD
      this.DOM.topCopy.innerHTML = texts.paymentType.expired.top;
      this.DOM.bottomCopy.innerHTML = texts.paymentType.expired.bottom(
        this.activePaymentMethod.dataset.lastDigits,
      );
      this.DOM.openedCopy.innerHTML = texts.paymentType.expired.opened;
    } else if (
      this.activePaymentMethod.dataset.type === paymentTypes.NEW_CARD
    ) {
      // NEW CARD
      this.DOM.topCopy.innerHTML = texts.paymentType.new.top(
        store.app.addCard.card.tag,
      );
      this.DOM.bottomCopy.innerHTML = texts.paymentType.new.bottom;
      this.DOM.openedCopy.innerHTML = texts.paymentType.new.opened(
        store.app.addCard.card.tag,
      );
    }
  }
}
