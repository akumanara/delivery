import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import texts from '../utils/texts';
import Alert from './alert';
import API from './api';
import { store } from '../utils/store';

export default class {
  constructor(element) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.element = element;
    this.status = this.DOM.element.dataset.status;

    this.intervalInSeconds = 5;
    this.isPollingActive = true;
    window.setTimeout(this.loadThankYou, this.intervalInSeconds * 1000);
    this.clickToCallIsInitialized = false;
    this.canUserClickToCall = true;
    this.checkForClickToCall();
  }

  async loadThankYou() {
    const response = await this.api.getThankYou();

    // Parse the response as HTML DOC
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(response, 'text/html');
    const newThankYou = htmlDoc.querySelector('.js-thankyou');
    const newStatus = newThankYou.dataset.status;

    // Replace
    this.DOM.element = document.querySelector('.js-thankyou');
    this.DOM.element.replaceWith(newThankYou);
    this.DOM.element.dataset.status = newStatus;
    this.status = this.DOM.element.dataset.status;

    if (this.status === 'accepted' || this.status === 'rejected') {
      // status is accepted or rejected. Stop polling
      this.isPollingActive = false;
    }

    if (this.isPollingActive) {
      window.setTimeout(this.loadThankYou, this.intervalInSeconds * 1000);
    }

    this.checkForClickToCall();
  }

  checkForClickToCall() {
    this.clickToCallElement = document.querySelector('.js-click-to-call');
    if (this.clickToCallElement) {
      this.clickToCallElement
        .querySelector('.secondary-btn')
        .addEventListener('click', this.clickToCall);
      this.clickToCallIsInitialized = true;
    }
  }

  async clickToCall() {
    if (!this.canUserClickToCall) {
      return;
    }
    PubSub.publish('show_loader');
    try {
      const result = await this.api.clickToCall();
      if (result.status === 'success') {
        const copy = this.clickToCallElement.querySelector('.js-copy');
        copy.innerHTML = texts.clickToCallSuccess;
        copy.classList.add('color-blue');
        const btnCopy = this.clickToCallElement.querySelector(
          '.secondary-btn__copy',
        );
        btnCopy.classList.add('color-blue');
        btnCopy.innerHTML = store.context.userPhone;
        const checkmark = this.clickToCallElement.querySelector(
          '.thankyou__clicktocall-img',
        );
        checkmark.classList.add('active');
        this.canUserClickToCall = false;
      } else {
        throw new Error('status not success');
      }
    } catch (error) {
      const a = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 2, // time until it closes
        type: 'error', // or 'error'
        showTimer: false, // show the timer or not
      });
    }

    PubSub.publish('hide_loader');
  }
}
