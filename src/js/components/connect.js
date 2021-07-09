import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import API from './api';
import { validatePhone, validateEmail } from '../utils/helpers';
import { loginWithEmailResponses } from '../utils/enum';

export default class {
  constructor() {
    autoBind(this);
    this.api = new API();
    this.queryTheDOM();
    this.setupEventListeners();
  }

  clearConnectComponent() {
    this.email = '';
    this.phone = '';
    this.DOM.loginModal.input.value = '';
    this.DOM.passwordModal.input.value = '';
  }

  queryTheDOM() {
    this.DOM = {};
    // login modal
    this.DOM.loginModal = document.querySelector('.login');
    this.DOM.loginModal = {
      modal: this.DOM.loginModal,
      closeBtn: this.DOM.loginModal.querySelector('.login__close'),
      background: this.DOM.loginModal.querySelector('.login__bg'),
      trigger: document.querySelector('.header__login-btn'),
      input: this.DOM.loginModal.querySelector('.js-email-phone'),
      actionBtn: this.DOM.loginModal.querySelector('.js-action-btn'),
    };
    this.isLoginOpen = false;

    // password modal
    this.DOM.passwordModal = document.querySelector('.password-modal');
    this.DOM.passwordModal = {
      modal: this.DOM.passwordModal,
      closeBtn: this.DOM.passwordModal.querySelector('.password-modal__close'),
      background: this.DOM.passwordModal.querySelector('.password-modal__bg'),
      input: this.DOM.passwordModal.querySelector('.js-password'),
      phoneConnect: this.DOM.passwordModal.querySelector(
        '.js-connect-with-phone',
      ),
      actionBtn: this.DOM.passwordModal.querySelector('.js-action-btn'),
    };
    this.isPasswordOpen = false;
  }

  setupEventListeners() {
    // login modal
    if (this.DOM.loginModal.trigger) {
      this.DOM.loginModal.trigger.addEventListener(
        'click',
        this.triggerClicked,
      );
      this.DOM.loginModal.background.addEventListener(
        'click',
        this.toggleLoginModal,
      );
      this.DOM.loginModal.closeBtn.addEventListener(
        'click',
        this.toggleLoginModal,
      );
      this.DOM.loginModal.actionBtn.addEventListener(
        'click',
        this.loginActionClicked,
      );
    }

    // password modal
    this.DOM.passwordModal.background.addEventListener(
      'click',
      this.togglePasswordModal,
    );
    this.DOM.passwordModal.closeBtn.addEventListener(
      'click',
      this.togglePasswordModal,
    );
    this.DOM.passwordModal.actionBtn.addEventListener(
      'click',
      this.loginWithMailAndPassword,
    );
    this.DOM.passwordModal.phoneConnect.addEventListener(
      'click',
      this.connectWithPhone,
    );
  }

  async loginWithMailAndPassword() {
    PubSub.publish('show_loader');
    const password = this.DOM.passwordModal.input.value;
    const response = await this.api.emailLoginWithPassword(
      this.email,
      password,
    );

    console.log(response);
    if (response.status === 'error') {
      console.log('fail login');
    } else if (response.status === 'ok') {
      window.location.reload();
    }

    PubSub.publish('hide_loader');
  }

  async loginActionClicked() {
    PubSub.publish('show_loader');
    const { value } = this.DOM.loginModal.input;
    // check to see if phone or mail.
    console.log(`mail: ${validateEmail(value)}`);
    if (validateEmail(value)) {
      console.log('it is mail');
      this.email = value;
      const response = await this.api.emailLogin(this.email);
      if (response.type === loginWithEmailResponses.SHOW_PASSWORD) {
        this.toggleLoginModal();
        this.togglePasswordModal();
      }
    } else if (validatePhone(value)) {
      console.log('it is phone');
      this.phone = value;
    }

    PubSub.publish('hide_loader');
  }

  // MODALS TOGGLING
  triggerClicked() {
    // The first thing the user clicks
    this.clearConnectComponent();
    this.toggleLoginModal();
  }

  toggleLoginModal() {
    if (this.isLoginOpen) {
      this.closeLogin();
    } else {
      this.openLogin();
    }
    this.isLoginOpen = !this.isLoginOpen;
  }

  closeLogin() {
    document.body.classList.remove('hide-overflow');
    this.DOM.loginModal.modal.classList.remove('active');
  }

  openLogin() {
    document.body.classList.add('hide-overflow');
    this.DOM.loginModal.modal.classList.add('active');
  }

  togglePasswordModal() {
    if (this.isPasswordOpen) {
      this.closePassword();
    } else {
      this.openPassword();
    }
    this.isPasswordOpen = !this.isPasswordOpen;
  }

  closePassword() {
    document.body.classList.remove('hide-overflow');
    this.DOM.passwordModal.modal.classList.remove('active');
  }

  openPassword() {
    document.body.classList.add('hide-overflow');
    this.DOM.passwordModal.modal.classList.add('active');
  }

  connectWithPhone() {
    this.clearConnectComponent();
    this.togglePasswordModal();
    this.toggleLoginModal();
  }
}
