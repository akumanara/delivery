import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autosize from 'autosize';
import texts from '../utils/texts';
import API from './api';
import {
  UserOrderTemplate,
  RateOrderTemplate,
} from '../utils/handlebarTemplate';

export default class {
  constructor(element) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.element = element;
    this.cardId = this.DOM.element.dataset.cardId;
    this.cardNumber = this.DOM.element.querySelector(
      '.user-cards__item-number',
    ).innerText;
    this.cardHolder = this.DOM.element.querySelector(
      '.user-cards__item-footer-name',
    ).innerText;
    this.cardExpiration = this.DOM.element.querySelector(
      '.user-cards__item-footer-expiration',
    ).innerText;
    this.init();
  }

  init() {
    this.DOM.element.addEventListener('click', this.showCard);
  }

  async showCard() {
    PubSub.publish('show_loader');
    console.log('clicked');
    const templateData = {
      cardNumber: this.cardNumber,
      cardHolder: this.cardHolder,
      cardExpiration: this.cardExpiration,
      isExpired: this.DOM.element.classList.contains(
        'user-cards__item--expired',
      ),
    };
    const html = UserOrderTemplate(templateData);
    document.body.insertAdjacentHTML('beforeend', html);
    this.initModal();
    PubSub.publish('hide_loader');
  }

  initModal() {
    // this.DOM.modal = document.querySelector(`.user-order-${this.orderId}`);
    // this.DOM = {
    //   modal: this.DOM.modal,
    //   closeBtn: this.DOM.modal.querySelector('.js-close'),
    //   accordion: this.DOM.modal.querySelector('.accordion__container'),
    //   textarea: this.DOM.modal.querySelector('textarea'),
    //   actionBtn: this.DOM.modal.querySelector('.js-action-btn'),
    //   rateBtn: this.DOM.modal.querySelector('.previous-order__rate'),
    // };
    // this.DOM.closeBtn.addEventListener('click', this.closeModal);
    // this.DOM.actionBtn.addEventListener('click', this.reoder);
    // this.DOM.rateBtn.addEventListener('click', this.rateModal);
    // const tmpAccordionContainer = new Accordion(this.DOM.accordion, {
    //   duration: 600,
    //   elementClass: 'accordion__item',
    //   triggerClass: 'accordion__header',
    //   panelClass: 'accordion__panel',
    //   ariaEnabled: false,
    // });
    // document.body.classList.add('hide-overflow');
    // this.DOM.modal.classList.add('active');
    // // must be after the active class
    // autosize(this.DOM.textarea);
  }

  // Closed the modal and removes it from the body
  closeModal() {
    // this.DOM.modal.remove();
    // document.body.classList.remove('hide-overflow');
  }

  async delete() {
    // TODO
  }
}
