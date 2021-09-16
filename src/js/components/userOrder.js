import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autosize from 'autosize';
import texts from '../utils/texts';
import Alert from './alert';
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
    this.orderId = this.DOM.element.dataset.orderId;
    this.init();
  }

  init() {
    this.DOM.element.addEventListener('click', this.showOrder);
  }

  async showOrder() {
    PubSub.publish('show_loader');
    const response = await this.api.getOrder(this.orderId);
    this.response = response;
    const templateData = { ...response };

    if (response.status === 'completed') {
      templateData.statusCopy = texts.order.statusCompleted;
      templateData.showCompleted = true;
    } else {
      templateData.statusCopy = texts.order.statusCancelled;
      templateData.showCancelled = true;
    }
    const html = UserOrderTemplate(templateData);
    document.body.insertAdjacentHTML('beforeend', html);
    this.initModal();
    PubSub.publish('hide_loader');
  }

  initModal() {
    this.DOM.modal = document.querySelector(`.user-order-${this.orderId}`);
    this.DOM = {
      modal: this.DOM.modal,
      closeBtn: this.DOM.modal.querySelector('.js-close'),
      accordion: this.DOM.modal.querySelector('.accordion__container'),
      textarea: this.DOM.modal.querySelector('textarea'),
      actionBtn: this.DOM.modal.querySelector('.js-action-btn'),
      rateBtn: this.DOM.modal.querySelector('.previous-order__rate'),
    };

    this.DOM.closeBtn.addEventListener('click', this.closeModal);
    this.DOM.actionBtn.addEventListener('click', this.reoder);
    if (this.DOM.rateBtn) {
      this.DOM.rateBtn.addEventListener('click', this.rateModal);
    }

    const tmpAccordionContainer = new Accordion(this.DOM.accordion, {
      duration: 600,
      elementClass: 'accordion__item',
      triggerClass: 'accordion__header',
      panelClass: 'accordion__panel',
      ariaEnabled: false,
    });
    document.body.classList.add('hide-overflow');
    this.DOM.modal.classList.add('active');

    // must be after the active class
    autosize(this.DOM.textarea);
  }

  // Closed the modal and removes it from the body
  closeModal() {
    this.DOM.modal.remove();
    document.body.classList.remove('hide-overflow');
  }

  async reoder() {
    PubSub.publish('show_loader');
    const response = await this.api.reOrder(this.orderId);
    window.location.href = response.redirect;
    PubSub.publish('hide_loader');
  }

  rateModal() {
    const html = RateOrderTemplate();
    document.body.insertAdjacentHTML('beforeend', html);
    this.initRateModal();
  }

  initRateModal() {
    this.DOM.rateModal = document.querySelector('.js-rate-modal');
    this.DOM.rateModal = {
      modal: this.DOM.rateModal,
      closeBtn: this.DOM.rateModal.querySelector('.js-close'),
      previousStepBtn: this.DOM.rateModal.querySelector('.js-previous-step'),
      actionBtn: this.DOM.rateModal.querySelector('.js-action-btn'),
      ratingItems: this.DOM.rateModal.querySelectorAll(
        '.previous-order__rate-options-item',
      ),
    };

    this.DOM.rateModal.actionBtn.addEventListener('click', this.submitRate);
    this.DOM.rateModal.closeBtn.addEventListener('click', this.closeRateModal);
    this.DOM.rateModal.previousStepBtn.addEventListener(
      'click',
      this.closeRateModal,
    );

    this.DOM.rateModal.ratingItems.forEach((item) => {
      const ratingEmojis = item.querySelectorAll(
        '.previous-order__rate-options-item-emoji-parent',
      );
      ratingEmojis.forEach((emoji) => {
        emoji.addEventListener('click', () => {
          this.selectRating(item, emoji);
        });
      });
    });
    this.checkRateSubmitButton();

    this.DOM.rateModal.modal.classList.add('active');
  }

  selectRating(item, emoji) {
    // add selected to item
    // add selected to emoji
    // set copy to item text
    item.classList.add('previous-order__rate-options-item--selected');

    item
      .querySelectorAll('.previous-order__rate-options-item-emoji-parent')
      .forEach((emojiItem) => {
        emojiItem.classList.remove(
          'previous-order__rate-options-item-emoji-parent--selected',
        );
      });

    emoji.classList.add(
      'previous-order__rate-options-item-emoji-parent--selected',
    );
    item.querySelector('.js-rate-text').innerText = emoji.dataset.rateName;

    this.checkRateSubmitButton();
  }

  checkRateSubmitButton() {
    const feasibility = ![...this.DOM.rateModal.ratingItems].some(
      (el) =>
        !el.classList.contains('previous-order__rate-options-item--selected'),
    );
    if (feasibility) {
      this.DOM.rateModal.actionBtn.classList.remove('primary-btn--disabled');
    } else {
      this.DOM.rateModal.actionBtn.classList.add('primary-btn--disabled');
    }
  }

  closeRateModal() {
    this.DOM.rateModal.modal.remove();
  }

  async submitRate() {
    PubSub.publish('show_loader');
    // rate1, rate2, rate3
    // rate1 = poiotita
    // rate2 = eksipiretisi
    // rate3 = xronos paradosis
    let rate1;
    let rate2;
    let rate3;
    const quality = this.DOM.rateModal.ratingItems.forEach((item) => {
      if (item.dataset.name === 'quality') {
        console.log('quality');
        rate1 = item.querySelector(
          '.previous-order__rate-options-item-emoji-parent--selected',
        ).dataset.rate;
      } else if (item.dataset.name === 'delivery') {
        console.log('delivery');
        rate2 = item.querySelector(
          '.previous-order__rate-options-item-emoji-parent--selected',
        ).dataset.rate;
      } else if (item.dataset.name === 'speed') {
        console.log('speed');
        rate3 = item.querySelector(
          '.previous-order__rate-options-item-emoji-parent--selected',
        ).dataset.rate;
      }
    });

    const response = await this.api.rateOrder(
      this.orderId,
      rate1,
      rate2,
      rate3,
    );

    if (response.status === 'ok') {
      const alert = new Alert({
        text: texts.ratingSuccess, // the text to show in the alert
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

    this.closeRateModal();
    this.closeModal();

    PubSub.publish('hide_loader');
  }
}
