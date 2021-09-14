import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autosize from 'autosize';
import texts from '../utils/texts';
import Alert from './alert';
import API from './api';
import { store } from '../utils/store';
import { UserOrderTemplate } from '../utils/handlebarTemplate';

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
    console.log(templateData);
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
    };

    const tmpAccordionContainer = new Accordion(this.DOM.accordion, {
      duration: 600,
      elementClass: 'accordion__item',
      triggerClass: 'accordion__header',
      panelClass: 'accordion__panel',
      ariaEnabled: false,
    });

    this.DOM.modal.classList.add('active');

    // must be after the active class
    autosize(this.DOM.textarea);
  }
}
