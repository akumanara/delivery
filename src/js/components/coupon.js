import PubSub from 'pubsub-js';
import autoBind from 'auto-bind';
import API from './api';

export default class {
  constructor(couponModalElement) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.modal = couponModalElement;
    this.DOM = {
      modal: this.DOM.modal,
      closeBtn: this.DOM.modal.querySelector('.js-close-coupon-modal'),
      input: this.DOM.modal.querySelector('.js-coupon-input'),
      actionBtn: this.DOM.modal.querySelector('.js-action-btn'),
      error: this.DOM.modal.querySelector('.js-coupon-error'),
      errorMsg: this.DOM.modal.querySelector('.js-coupon-error-msg'),
    };

    // Setup event listeners
    document.querySelectorAll('.js-open-coupon-modal').forEach((el) => {
      el.addEventListener('click', this.showModal);
    });
    this.DOM.closeBtn.addEventListener('click', this.hideModal);
    this.DOM.actionBtn.addEventListener('click', this.submitCoupon);
    this.DOM.input.addEventListener('input', this.updateValue);
  }

  updateValue(e) {
    if (e && e.target.value.length > 0) {
      this.DOM.actionBtn.classList.remove('primary-btn--disabled');
    } else {
      this.DOM.actionBtn.classList.add('primary-btn--disabled');
    }
  }

  showModal() {
    this.clearPreviousErrorState();
    this.DOM.input.value = '';
    this.DOM.actionBtn.classList.add('primary-btn--disabled');

    this.DOM.modal.classList.toggle('active');
    document.body.classList.toggle('hide-overflow');
  }

  hideModal() {
    this.DOM.modal.classList.toggle('active');
    document.body.classList.toggle('hide-overflow');
  }

  clearPreviousErrorState() {
    // Remove if previous error msg
    this.DOM.error.classList.remove('coupon__error--active');
    this.DOM.input.classList.remove('form-control--has-error');
  }

  async submitCoupon() {
    PubSub.publish('show_loader');
    this.clearPreviousErrorState();

    const voucherID = this.DOM.input.value;
    await this.api.addAndApplyVoucher(voucherID).then((result) => {
      console.log(result);
      if (result.status === 'error') {
        // errror
        // Show the error msg
        this.DOM.errorMsg.innerText = result.message;
        this.DOM.error.classList.add('coupon__error--active');
        // Toggle the error input
        this.DOM.input.classList.add('form-control--has-error');
      } else if (result.status === 'ok') {
        // ok
        window.location.reload();
      }
    });
    PubSub.publish('hide_loader');
  }
}
