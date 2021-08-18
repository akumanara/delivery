import autoBind from 'auto-bind';
import API from './api';

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
  }
}
