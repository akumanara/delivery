import PubSub from 'pubsub-js';
import autoBind from 'auto-bind';
import API from './api';
import { validation, timeout } from '../utils/helpers';
import { store } from '../utils/store';
import texts from '../utils/texts';

export default class {
  constructor() {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.phoneNumber = '';

    const modalStep1 = document.querySelector('.js-verify-number-modal');
    const modalStep2 = document.querySelector('.js-verify-number-modal-otp');

    this.DOM.trigger = document.querySelector('.js-verify-number-trigger');
    this.DOM.personalDetailsPhoneInput = document.querySelector(
      '.js-verify-number-input',
    );
    this.DOM.personalDetailsCheckbox = document.querySelector(
      '.personal-details__phone-checkbox',
    );

    this.DOM.modalStep1 = {
      modal: modalStep1,
      closeBtn: modalStep1.querySelector('.js-close-verify-number-modal'),
      input: modalStep1.querySelector('.js-verify-number-modal-input'),
      actionBtn: modalStep1.querySelector('.js-action-btn'),
      // error: this.DOM.modal.querySelector('.js-coupon-error'),
      // errorMsg: this.DOM.modal.querySelector('.js-coupon-error-msg'),
    };

    this.DOM.modalStep2 = {
      modal: modalStep2,
      closeBtn: modalStep2.querySelector('.js-close-verify-number-modal'),
      input: modalStep2.querySelector('.js-verify-number-modal-input'),
      actionBtn: modalStep2.querySelector('.js-action-btn'),
      previousStep: modalStep2.querySelector('.js-previous-step'),
      number: modalStep2.querySelector('.js-number'),
      // error: this.DOM.modal.querySelector('.js-coupon-error'),
      // errorMsg: this.DOM.modal.querySelector('.js-coupon-error-msg'),
    };

    this.DOM.trigger.addEventListener('click', this.showModal);
    // MODAL 1
    this.DOM.modalStep1.closeBtn.addEventListener('click', this.hideModal);
    this.DOM.modalStep1.input.addEventListener('input', this.step1UpdateValue);
    this.DOM.modalStep1.actionBtn.addEventListener('click', this.submitNumber);
    // MODAL 2
    this.DOM.modalStep2.closeBtn.addEventListener('click', this.hideStep2Modal);
    this.DOM.modalStep2.input.addEventListener('input', this.step2UpdateValue);
    this.DOM.modalStep2.actionBtn.addEventListener('click', this.submitOtp);
    this.DOM.modalStep2.previousStep.addEventListener(
      'click',
      this.moveToPreviousStep,
    );
  }

  prepareModal() {
    this.phoneNumber = '';
    this.callId = '';
    this.DOM.modalStep1.actionBtn.classList.add('primary-btn--disabled');
    this.DOM.modalStep1.input.value = '';
  }

  showModal() {
    this.prepareModal();

    this.DOM.modalStep1.modal.classList.add('active');
    document.body.classList.toggle('hide-overflow');
  }

  hideModal() {
    this.DOM.modalStep1.modal.classList.remove('active');
    document.body.classList.toggle('hide-overflow');
  }

  async submitNumber() {
    PubSub.publish('show_loader');

    this.phoneNumber = this.DOM.modalStep1.input.value;
    // await timeout(1000);
    const response = await this.api.verifyPhone(this.phoneNumber);
    // console.log(response);
    if ('verified' in response) {
      // Phone is already verified
      this.hideModal();
      this.addPhoneToInputField();
    } else {
      // Phone needs verification
      this.callId = response.call_id;
      this.moveToVerificationStep();
    }

    PubSub.publish('hide_loader');
  }

  step1UpdateValue(e) {
    if (
      e &&
      e.target.value.length === 10 &&
      validation.isNumber(e.target.value)
    ) {
      this.DOM.modalStep1.actionBtn.classList.remove('primary-btn--disabled');
    } else {
      this.DOM.modalStep1.actionBtn.classList.add('primary-btn--disabled');
    }
  }

  step2UpdateValue(e) {
    if (e && e.target.value.length > 0) {
      this.DOM.modalStep2.actionBtn.classList.remove('primary-btn--disabled');
    } else {
      this.DOM.modalStep2.actionBtn.classList.add('primary-btn--disabled');
    }
  }

  moveToVerificationStep() {
    this.hideModal();
    this.DOM.modalStep2.number.innerText = this.phoneNumber;
    this.showStep2Modal();
  }

  moveToPreviousStep() {
    this.showModal();
    this.hideStep2Modal();
  }

  showStep2Modal() {
    this.prepareStep2Modal();
    this.DOM.modalStep2.modal.classList.add('active');
    document.body.classList.toggle('hide-overflow');
  }

  hideStep2Modal() {
    this.DOM.modalStep2.modal.classList.remove('active');
    document.body.classList.toggle('hide-overflow');
  }

  prepareStep2Modal() {
    this.DOM.modalStep2.actionBtn.classList.add('primary-btn--disabled');
    this.DOM.modalStep2.input.value = '';
  }

  async submitOtp() {
    PubSub.publish('show_loader');
    this.otp = this.DOM.modalStep2.input.value;

    const response = await this.api.submitOTP(
      this.phoneNumber,
      this.callId,
      this.otp,
    );

    if (response.status === 'success') {
      this.hideStep2Modal();
      this.addPhoneToInputField();
    } else {
      this.Step2ModalShowError(texts.verify.wrongOTP);
    }

    PubSub.publish('hide_loader');
  }

  addPhoneToInputField() {
    this.DOM.personalDetailsPhoneInput.value = this.phoneNumber;
    this.DOM.personalDetailsCheckbox.classList.add(
      'personal-details__phone-checkbox--active',
    );
  }

  // eslint-disable-next-line class-methods-use-this
  errorTemplate(error) {
    return `
      <div class="p-16 d-flex js-error">
        <img
          src="${store.context.imagesURL}icons/error.svg"
          alt=""
          class="img-fluid mw-22 flex-shrink-0 align-self-center mr-10"
        />
        <div class="message">
          ${error}
        </div>
      </div>`;
  }

  clearStep2ModalError() {
    this.DOM.modalStep2.input.classList.remove('form-control--has-error');
    const error = this.DOM.modalStep2.modal.querySelector('.js-error');
    if (error) {
      error.remove();
    }
  }

  Step2ModalShowError(error) {
    console.log(error);
    this.clearStep2ModalError();
    this.DOM.modalStep2.input.classList.add('form-control--has-error');
    const htmlError = this.errorTemplate(error);
    this.DOM.modalStep2.input.parentNode.insertAdjacentHTML(
      'beforebegin',
      htmlError,
    );
  }
}
