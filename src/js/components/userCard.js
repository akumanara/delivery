import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autosize from 'autosize';
import texts from '../utils/texts';
import API from './api';
import { UserCardTemplate } from '../utils/handlebarTemplate';
import Alert from './alert';

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
      id: this.cardId,
      cardNumber: this.cardNumber,
      cardHolder: this.cardHolder,
      cardExpiration: this.cardExpiration,
      isExpired: this.DOM.element.classList.contains(
        'user-cards__item--expired',
      ),
    };
    const html = UserCardTemplate(templateData);
    document.body.insertAdjacentHTML('beforeend', html);
    this.initModal();
    PubSub.publish('hide_loader');
  }

  initModal() {
    this.DOM.modal = document.querySelector(`.user-card-${this.cardId}`);
    this.DOM = {
      element: this.DOM.element,
      modal: this.DOM.modal,
      closeBtn: this.DOM.modal.querySelector('.js-close'),
      actionBtn: this.DOM.modal.querySelector('.js-action-btn'),
    };
    this.DOM.closeBtn.addEventListener('click', this.closeModal);
    this.DOM.actionBtn.addEventListener('click', this.deleteCard);
    document.body.classList.add('hide-overflow');
    this.DOM.modal.classList.add('active');
  }

  // Closed the modal and removes it from the body
  closeModal() {
    this.DOM.modal.remove();
    document.body.classList.remove('hide-overflow');
  }

  async deleteCard() {
    PubSub.publish('show_loader');
    const response = await this.api.deleteCard(this.cardId);

    if (response.status === 'ok') {
      this.closeModal();
      this.DOM.element.remove();
      const alert = new Alert({
        text: texts.deleteCardSuccess, // the text to show in the alert
        timeToKill: 5, // time until it closes
        type: 'success', // or 'error'
        showTimer: false, // show the timer or not
      });
    } else {
      const alert = new Alert({
        text: texts.genericErrorMessage, // the text to show in the alert
        timeToKill: 5, // time until it closes
        type: 'error', // or 'error'
        showTimer: false, // show the timer or not
      });
    }
    PubSub.publish('hide_loader');
  }
}
