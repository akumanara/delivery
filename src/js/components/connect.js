import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import API from './api';
import { validatePhone, validateEmail } from '../utils/helpers';
import { loginWithEmailResponses } from '../utils/enum';
import texts from '../utils/texts';
import { store } from '../utils/store';

export default class {
  constructor() {
    autoBind(this);
    this.api = new API();
    this.queryTheDOM();
    this.setupEventListeners();

    // TODO Remove
    // this.toggleForgotPasswordModal();
    // this.toggleRegisterModal();
  }

  clearConnectComponent() {
    // Class level stuff
    this.email = '';
    this.phone = '';
    this.callID = '';

    // login modal
    this.DOM.loginModal.input.value = '';
    this.clearLoginModalError();

    // password modal
    this.DOM.passwordModal.input.value = '';
    this.clearPasswordModalError();

    // register modal
    this.DOM.registerModal.formName.value = '';
    this.DOM.registerModal.formSurname.value = '';
    this.DOM.registerModal.formEmail.value = '';
    this.DOM.registerModal.formPassword.value = '';
    this.DOM.registerModal.formPhone.value = '';
    this.DOM.registerModal.formTos.checked = false;
    this.DOM.registerModal.formTosTrigger.classList.remove('checked');
    // this.clearRegisterModalError();
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
      forgotPasswordBtn: this.DOM.loginModal.querySelector(
        '.js-forgot-password',
      ),
    };
    this.isLoginOpen = false;

    // password modal
    this.DOM.passwordModal = document.querySelector('.js-password-modal');
    this.DOM.passwordModal = {
      modal: this.DOM.passwordModal,
      closeBtn: this.DOM.passwordModal.querySelector('.small-modal__close'),
      background: this.DOM.passwordModal.querySelector('.small-modal__bg'),
      input: this.DOM.passwordModal.querySelector('.js-password'),
      phoneConnect: this.DOM.passwordModal.querySelector(
        '.js-connect-with-phone',
      ),
      actionBtn: this.DOM.passwordModal.querySelector('.js-action-btn'),
      forgotPasswordBtn: this.DOM.passwordModal.querySelector(
        '.js-forgot-password',
      ),
    };
    this.isPasswordOpen = false;

    // otp modal
    this.DOM.otpModal = document.querySelector('.js-otp-modal');
    this.DOM.otpModal = {
      modal: this.DOM.otpModal,
      closeBtn: this.DOM.otpModal.querySelector('.js-close'),
      input: this.DOM.otpModal.querySelector('.js-input'),
      actionBtn: this.DOM.otpModal.querySelector('.js-action-btn'),
    };
    this.isOtpOpen = false;

    // register modal
    this.DOM.registerModal = document.querySelector('.js-register-modal');
    this.DOM.registerModal = {
      modal: this.DOM.registerModal,
      closeBtn: this.DOM.registerModal.querySelector('.js-close'),
      actionBtn: this.DOM.registerModal.querySelector('.js-action-btn'),
      formName: this.DOM.registerModal.querySelector('.js-name'),
      formSurname: this.DOM.registerModal.querySelector('.js-surname'),
      formEmail: this.DOM.registerModal.querySelector('.js-email'),
      formPassword: this.DOM.registerModal.querySelector('.js-password'),
      formPhone: this.DOM.registerModal.querySelector(
        '.js-verify-number-input',
      ),
      formTos: this.DOM.registerModal.querySelector('.js-tos'),
      formTosTrigger:
        this.DOM.registerModal.querySelector('.login__tos-accept'),
    };
    this.isRegisterOpen = false;

    // forgot password modal
    this.DOM.forgotPasswordModal = document.querySelector(
      '.js-forgot-password-modal',
    );
    this.DOM.forgotPasswordModal = {
      modal: this.DOM.forgotPasswordModal,
      closeBtn: this.DOM.forgotPasswordModal.querySelector('.js-close'),
      actionBtn: this.DOM.forgotPasswordModal.querySelector('.js-action-btn'),
    };
    this.isForgotPasswordOpen = false;
    console.log(this.DOM);
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
      this.DOM.loginModal.forgotPasswordBtn.addEventListener(
        'click',
        this.forgotPasswordBtnClickedFromLogin,
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
    this.DOM.passwordModal.forgotPasswordBtn.addEventListener(
      'click',
      this.forgotPasswordBtnClickedFromPassword,
    );

    // otp modal
    this.DOM.otpModal.closeBtn.addEventListener('click', this.toggleOtpModal);
    this.DOM.otpModal.actionBtn.addEventListener(
      'click',
      this.loginWithMailAndOtp,
    );

    // register modal
    this.DOM.registerModal.formName.addEventListener(
      'input',
      this.checkRegisterForm,
    );
    this.DOM.registerModal.formSurname.addEventListener(
      'input',
      this.checkRegisterForm,
    );
    this.DOM.registerModal.formEmail.addEventListener(
      'input',
      this.checkRegisterForm,
    );
    this.DOM.registerModal.formPassword.addEventListener(
      'input',
      this.checkRegisterForm,
    );
    this.DOM.registerModal.formPhone.addEventListener(
      'input',
      this.checkRegisterForm,
    );
    this.DOM.registerModal.formTos.addEventListener(
      'input',
      this.checkRegisterForm,
    );
    this.DOM.registerModal.closeBtn.addEventListener(
      'click',
      this.toggleRegisterModal,
    );
    this.DOM.registerModal.formTosTrigger.addEventListener('click', () => {
      this.DOM.registerModal.formTos.checked =
        !this.DOM.registerModal.formTos.checked;
      this.DOM.registerModal.formTosTrigger.classList.toggle('checked');
    });

    // TODO: add event listener for register button
    // this.DOM.registerModal.actionBtn.addEventListener(
    //   'click',
    //   this.loginWithMailAndOtp,
    // );

    // forgot password modal
    this.DOM.forgotPasswordModal.closeBtn.addEventListener(
      'click',
      this.toggleForgotPasswordModal,
    );
    // TODO: add event listener for forgot password button
  }

  // Clicked from login
  forgotPasswordBtnClickedFromLogin() {
    this.toggleLoginModal();
    this.toggleForgotPasswordModal();
  }

  // Clicked from enter password
  forgotPasswordBtnClickedFromPassword() {
    this.togglePasswordModal();
    this.toggleForgotPasswordModal();
  }

  checkRegisterForm() {
    // check if all form inputs are filled
    if (
      this.DOM.registerModal.formName.value.length > 0 &&
      this.DOM.registerModal.formSurname.value.length > 0 &&
      this.DOM.registerModal.formEmail.value.length > 0 &&
      this.DOM.registerModal.formPhone.value.length > 0 &&
      this.DOM.registerModal.formTos.checked
    ) {
      this.DOM.registerModal.actionBtn.classList.remove(
        'primary-btn--disabled',
      );
    } else {
      this.DOM.registerModal.actionBtn.classList.add('primary-btn--disabled');
    }
  }

  async loginWithMailAndOtp() {
    PubSub.publish('show_loader');
    const { value } = this.DOM.otpModal.input;

    const response = await this.api.emailLoginWithOTP(
      this.email,
      value,
      this.callID,
      this.phone,
    );

    console.log(response);
    if (response.status === 'error') {
      // TODO alert
      console.log('fail login');
    } else if (response.status === 'ok') {
      window.location.reload();
    }

    PubSub.publish('hide_loader');
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
      // TODO alert
      console.log('fail login');
      this.passwordModalShowError(texts.login.wrongPassword);
    } else if (response.status === 'ok') {
      window.location.reload();
    }

    PubSub.publish('hide_loader');
  }

  clearPasswordModalError() {
    this.DOM.passwordModal.input.classList.remove('form-control--has-error');
    const error = this.DOM.passwordModal.modal.querySelector('.js-error');
    if (error) {
      error.remove();
    }
  }

  passwordModalShowError(error) {
    this.clearPasswordModalError();
    this.DOM.passwordModal.input.classList.add('form-control--has-error');
    const htmlError = this.errorTemplate(error);
    this.DOM.passwordModal.input.parentNode.insertAdjacentHTML(
      'beforebegin',
      htmlError,
    );
  }

  async loginActionClicked() {
    PubSub.publish('show_loader');
    const { value } = this.DOM.loginModal.input;
    // console.log(`mail: ${validateEmail(value)}`);
    if (validateEmail(value)) {
      console.log('Valid email');
      // USER ENTERED VALID EMAIL
      // ==========================
      this.email = value;
      const response = await this.api.login(this.email);
      if (response.type === loginWithEmailResponses.SHOW_PASSWORD) {
        // USER MUST LOGIN WITH PASSWORD
        // ==========================
        this.toggleLoginModal();
        this.togglePasswordModal();
      } else if (response.type === loginWithEmailResponses.SHOW_OTP) {
        // USER MUST LOGIN WITH OTP
        // ==========================
        this.callID = response.call_id;
        this.phone = response.phone;
        this.toggleLoginModal();
        this.toggleOtpModal();
      } else if (response.type === loginWithEmailResponses.SHOW_INFOBOX) {
        // USER MUST LOGIN WITH SOCIAL
        // ==========================
        this.loginModalShowError(texts.login.userIsSocialLoginError);
      } else if (response.type === loginWithEmailResponses.SHOW_NEW_USER) {
        // USER DOESNT EXIST. REGISTER
        // ==========================
        this.DOM.registerModal.formEmail.value = this.email;
        this.DOM.registerModal.formEmail.disabled = true;
        this.checkRegisterForm();
        this.toggleLoginModal();
        this.toggleRegisterModal();
      }
    } else if (validatePhone(value)) {
      console.log('Valid phone');
      // USER ENTERED VALID PHONE
      // ==========================
      this.phone = value;
      const response = await this.api.login(this.phone);
      if (response.type === loginWithEmailResponses.SHOW_OTP) {
        // USER MUST LOGIN WITH OTP
        // ==========================
        this.toggleLoginModal();
        this.toggleOtpModal();
      } else {
        // USER DOESNT EXIST. REGISTER
        // ==========================
        // todo
      }
    } else {
      console.log('invalid email or invalid phone');
      // USER DIDNT ENTERED VALID EMAIL OR VALID PHONE
      // ==========================
      this.loginModalShowError(texts.login.invalidPhoneOrEmail);
    }

    PubSub.publish('hide_loader');
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

  clearLoginModalError() {
    this.DOM.loginModal.input.classList.remove('form-control--has-error');
    const error = this.DOM.loginModal.modal.querySelector('.js-error');
    if (error) {
      error.remove();
    }
  }

  loginModalShowError(error) {
    console.log(error);
    this.clearLoginModalError();
    this.DOM.loginModal.input.classList.add('form-control--has-error');
    const htmlError = this.errorTemplate(error);
    this.DOM.loginModal.input.parentNode.insertAdjacentHTML(
      'beforebegin',
      htmlError,
    );
  }

  // MODALS TOGGLING
  triggerClicked() {
    // The first thing the user clicks
    this.clearConnectComponent();
    this.toggleLoginModal();
  }

  connectWithPhone() {
    this.clearConnectComponent();
    this.togglePasswordModal();
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

  toggleOtpModal() {
    if (this.isOtpOpen) {
      this.closeOtp();
    } else {
      this.openOtp();
    }
    this.isOtpOpen = !this.isOtpOpen;
  }

  closeOtp() {
    document.body.classList.remove('hide-overflow');
    this.DOM.otpModal.modal.classList.remove('active');
  }

  openOtp() {
    document.body.classList.add('hide-overflow');
    this.DOM.otpModal.modal.classList.add('active');
  }

  toggleRegisterModal() {
    if (this.isRegisterOpen) {
      this.closeRegister();
    } else {
      this.openRegister();
    }
    this.isRegisterOpen = !this.isRegisterOpen;
  }

  closeRegister() {
    document.body.classList.remove('hide-overflow');
    this.DOM.registerModal.modal.classList.remove('active');
  }

  openRegister() {
    document.body.classList.add('hide-overflow');
    this.DOM.registerModal.modal.classList.add('active');
  }

  toggleForgotPasswordModal() {
    if (this.isForgotPasswordOpen) {
      this.closeForgotPassword();
    } else {
      this.openForgotPassword();
    }
    this.isForgotPasswordOpen = !this.isForgotPasswordOpen;
  }

  closeForgotPassword() {
    document.body.classList.remove('hide-overflow');
    this.DOM.forgotPasswordModal.modal.classList.remove('active');
  }

  openForgotPassword() {
    document.body.classList.add('hide-overflow');
    this.DOM.forgotPasswordModal.modal.classList.add('active');
  }
}
