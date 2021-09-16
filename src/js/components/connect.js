import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import API from './api';
import { validatePhone, validateEmail } from '../utils/helpers';
import { loginWithEmailResponses } from '../utils/enum';
import texts from '../utils/texts';
import Alert from './alert';
import { store } from '../utils/store';

export default class {
  constructor() {
    autoBind(this);
    this.api = new API();

    // Init the modals. We only init them if they exist in the DOM
    this.initModals();

    // Do we need to show the Reset password modal?
    const url = new URL(window.location.href);
    const resetHash = url.searchParams.get('reset_hash');
    const resetEmail = url.searchParams.get('reset_email');
    if (resetHash && resetEmail) {
      this.resetHash = resetHash;
      this.resetEmail = resetEmail;
      this.toggleResetPasswordModal();
    }

    // Do we need to show the Missing data modal?
    if (store.context.showMissingData) {
      this.checkMissingDataForm();
      this.toggleMissingDataModal();
    }
  }

  initModals() {
    this.DOM = {};

    this.initLoginModal();
    this.initPasswordModal();
    this.initOtpModal();
    this.initRegisterModal();
    this.initForgotPasswordModal();
    this.initMergeAccountModal();
    this.initMergeAccountWithCodeModal();
    this.initResetPasswordModal();
    this.initMissingDataModal();
  }

  // #region Init Modals
  initLoginModal() {
    // login modal
    this.DOM.loginModal = document.querySelector('.login');
    // modal is non existant in DOM. return
    if (!this.DOM.loginModal) return;

    // QUERY DOM
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

    // EVENT LISTENERS
    this.DOM.loginModal.trigger.addEventListener('click', this.triggerClicked);
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

  initPasswordModal() {
    // password modal
    this.DOM.passwordModal = document.querySelector('.js-password-modal');
    // modal is non existant in DOM. return
    if (!this.DOM.passwordModal) return;

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

    // EVENT LISTENERS
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
  }

  initOtpModal() {
    // otp modal
    this.DOM.otpModal = document.querySelector('.js-otp-modal');
    // modal is non existant in DOM. return
    if (!this.DOM.otpModal) return;
    this.DOM.otpModal = {
      modal: this.DOM.otpModal,
      closeBtn: this.DOM.otpModal.querySelector('.js-close'),
      input: this.DOM.otpModal.querySelector('.js-input'),
      actionBtn: this.DOM.otpModal.querySelector('.js-action-btn'),
    };
    this.isOtpOpen = false;

    // EVENT LISTENERS
    this.DOM.otpModal.closeBtn.addEventListener('click', this.toggleOtpModal);
    this.DOM.otpModal.actionBtn.addEventListener(
      'click',
      this.loginWithPhoneAndOtp,
    );
  }

  initRegisterModal() {
    // register modal
    this.DOM.registerModal = document.querySelector('.js-register-modal');
    // modal is non existant in DOM. return
    if (!this.DOM.registerModal) return;
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

    // EVENT LISTENERS
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
      this.checkRegisterForm();
    });

    this.DOM.registerModal.actionBtn.addEventListener(
      'click',
      this.registerUser,
    );
  }

  initForgotPasswordModal() {
    // forgot password modal
    this.DOM.forgotPasswordModal = document.querySelector(
      '.js-forgot-password-modal',
    );
    // modal is non existant in DOM. return
    if (!this.DOM.forgotPasswordModal) return;
    this.DOM.forgotPasswordModal = {
      modal: this.DOM.forgotPasswordModal,
      closeBtn: this.DOM.forgotPasswordModal.querySelector('.js-close'),
      actionBtn: this.DOM.forgotPasswordModal.querySelector('.js-action-btn'),
      input: this.DOM.forgotPasswordModal.querySelector('.js-input'),
    };
    this.isForgotPasswordOpen = false;

    // EVENT LISTENERS
    this.DOM.forgotPasswordModal.closeBtn.addEventListener(
      'click',
      this.toggleForgotPasswordModal,
    );
    this.DOM.forgotPasswordModal.actionBtn.addEventListener(
      'click',
      this.forgotPassword,
    );
  }

  initMergeAccountModal() {
    // merge acount modal
    this.DOM.mergeAccountModal = document.querySelector('.js-merge-modal');
    // modal is non existant in DOM. return
    if (!this.DOM.mergeAccountModal) return;
    this.DOM.mergeAccountModal = {
      modal: this.DOM.mergeAccountModal,
      closeBtn: this.DOM.mergeAccountModal.querySelector('.js-close'),
      actionBtn: this.DOM.mergeAccountModal.querySelector('.js-action-btn'),
    };
    this.isMergeAccountOpen = false;

    // EVENT LISTENERS
    this.DOM.mergeAccountModal.closeBtn.addEventListener(
      'click',
      this.toggleMergeModal,
    );
    this.DOM.mergeAccountModal.actionBtn.addEventListener(
      'click',
      this.registerWithMergeConsent,
    );
  }

  initMergeAccountWithCodeModal() {
    // merge account with code modal
    this.DOM.mergeAccountWithCodeModal = document.querySelector(
      '.js-merge-with-code-modal',
    );
    // modal is non existant in DOM. return
    if (!this.DOM.mergeAccountWithCodeModal) return;
    this.DOM.mergeAccountWithCodeModal = {
      modal: this.DOM.mergeAccountWithCodeModal,
      closeBtn: this.DOM.mergeAccountWithCodeModal.querySelector('.js-close'),
      actionBtn:
        this.DOM.mergeAccountWithCodeModal.querySelector('.js-action-btn'),
      input: this.DOM.mergeAccountWithCodeModal.querySelector('.js-input'),
    };
    this.isMergeAccountWithCodeOpen = false;

    // EVENT LISTENERS
    this.DOM.mergeAccountWithCodeModal.closeBtn.addEventListener(
      'click',
      this.toggleMergeAccountWithCodeModal,
    );
    this.DOM.mergeAccountWithCodeModal.actionBtn.addEventListener(
      'click',
      this.registerWithMergeConsentAndCode,
    );
  }

  initResetPasswordModal() {
    // reset password modal
    this.DOM.resetPasswordModal = document.querySelector(
      '.js-reset-password-modal',
    );
    // modal is non existant in DOM. return
    if (!this.DOM.resetPasswordModal) return;
    this.DOM.resetPasswordModal = {
      modal: this.DOM.resetPasswordModal,
      closeBtn: this.DOM.resetPasswordModal.querySelector('.js-close'),
      actionBtn: this.DOM.resetPasswordModal.querySelector('.js-action-btn'),
      inputPassword: this.DOM.resetPasswordModal.querySelector('.js-password'),
      inputConfirmPassword: this.DOM.resetPasswordModal.querySelector(
        '.js-confirm-password',
      ),
    };
    this.isResetPasswordOpen = false;

    // EVENT LISTENERS
    this.DOM.resetPasswordModal.closeBtn.addEventListener(
      'click',
      this.toggleResetPasswordModal,
    );
    this.DOM.resetPasswordModal.actionBtn.addEventListener(
      'click',
      this.resetPassword,
    );
  }

  initMissingDataModal() {
    // missing modal
    this.DOM.missingDataModal = document.querySelector(
      '.js-missing-data-modal',
    );
    // modal is non existant in DOM. return
    if (!this.DOM.missingDataModal) return;
    this.DOM.missingDataModal = {
      modal: this.DOM.missingDataModal,
      closeBtn: this.DOM.missingDataModal.querySelector('.js-close'),
      actionBtn: this.DOM.missingDataModal.querySelector('.js-action-btn'),
      formName: this.DOM.missingDataModal.querySelector('.js-name'),
      formSurname: this.DOM.missingDataModal.querySelector('.js-surname'),
      formEmail: this.DOM.missingDataModal.querySelector('.js-email'),
      formPassword: this.DOM.missingDataModal.querySelector('.js-password'),
      formPhone: this.DOM.missingDataModal.querySelector(
        '.js-verify-number-input',
      ),
      formTos: this.DOM.missingDataModal.querySelector('.js-tos'),
      formTosTrigger:
        this.DOM.missingDataModal.querySelector('.login__tos-accept'),
    };
    this.isMissingDataOpen = false;

    // EVENT LISTENERS
    this.DOM.missingDataModal.closeBtn.addEventListener(
      'click',
      this.logoutUser,
    );

    this.DOM.missingDataModal.formName.addEventListener(
      'input',
      this.checkMissingDataForm,
    );
    this.DOM.missingDataModal.formSurname.addEventListener(
      'input',
      this.checkMissingDataForm,
    );
    this.DOM.missingDataModal.formEmail.addEventListener(
      'input',
      this.checkMissingDataForm,
    );
    this.DOM.missingDataModal.formPassword.addEventListener(
      'input',
      this.checkMissingDataForm,
    );
    this.DOM.missingDataModal.formPhone.addEventListener(
      'input',
      this.checkMissingDataForm,
    );

    this.DOM.missingDataModal.formTosTrigger.addEventListener('click', () => {
      this.DOM.missingDataModal.formTos.checked =
        !this.DOM.missingDataModal.formTos.checked;
      this.DOM.missingDataModal.formTosTrigger.classList.toggle('checked');
      this.checkMissingDataForm();
    });

    this.DOM.missingDataModal.actionBtn.addEventListener(
      'click',
      this.submitMissingDataUser,
    );
  }

  // #endregion

  // #region Async (API Calls)

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
        this.callID = response.call_id;
        this.toggleLoginModal();
        this.toggleOtpModal();
      } else {
        // USER DOESNT EXIST. REGISTER
        // ==========================
        this.DOM.registerModal.formPhone.value = this.phone;
        this.DOM.registerModal.formPhone.disabled = true;
        this.checkRegisterForm();
        this.toggleLoginModal();
        this.toggleRegisterModal();
      }
    } else {
      console.log('invalid email or invalid phone');
      // USER DIDNT ENTERED VALID EMAIL OR VALID PHONE
      // ==========================
      this.loginModalShowError(texts.login.invalidPhoneOrEmail);
    }

    PubSub.publish('hide_loader');
  }

  async forgotPassword() {
    PubSub.publish('show_loader');
    const email = this.DOM.forgotPasswordModal.input.value;
    const response = await this.api.resetPassword(email);

    if (response.status === 'success') {
      this.toggleForgotPasswordModal();
      const alert = new Alert({
        text: texts.resetPasswordRequestSuccess,
        timeToKill: 10,
        type: 'info',
        showTimer: false,
      });
    } else {
      const alert = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5,
        type: 'error',
        showTimer: false,
      });
    }
    PubSub.publish('hide_loader');
  }

  async resetPassword() {
    // See if passwords match.
    const password = this.DOM.resetPasswordModal.inputPassword.value;
    const confirmPassword =
      this.DOM.resetPasswordModal.inputConfirmPassword.value;
    if (password !== confirmPassword) {
      this.resetPasswordModalShowError(
        texts.resetPasswordDifferentPasswords,
        this.DOM.resetPasswordModal.inputConfirmPassword,
      );
      return;
    }

    PubSub.publish('show_loader');
    const response = await this.api.changePassword(
      this.resetEmail,
      this.resetHash,
      password,
    );

    if (response.status === 'success') {
      this.toggleResetPasswordModal();
      const alert = new Alert({
        text: texts.resetPasswordSuccess,
        timeToKill: 5,
        type: 'info',
        showTimer: false,
      });
      // show the modal login
      this.toggleLoginModal();
    } else {
      const alert = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5,
        type: 'error',
        showTimer: false,
      });
    }
    PubSub.publish('hide_loader');
  }

  async registerWithMergeConsentAndCode() {
    PubSub.publish('show_loader');
    this.formData.merge_accounts = true;
    const verificationCode = this.DOM.mergeAccountWithCodeModal.input.value;
    this.formData.verification_code = verificationCode;
    const response = await this.api.signupUser(this.formData);

    if (response.status === 'success') {
      window.location.reload();
    } else {
      const alert = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5,
        type: 'error',
        showTimer: false,
      });
    }
    PubSub.publish('hide_loader');
  }

  async registerWithMergeConsent() {
    PubSub.publish('show_loader');
    this.formData.merge_accounts = true;
    const response = await this.api.signupUser(this.formData);

    if (response.status === 'success') {
      window.location.reload();
    } else {
      const alert = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5,
        type: 'error',
        showTimer: false,
      });
    }
    PubSub.publish('hide_loader');
  }

  async submitMissingDataUser() {
    PubSub.publish('show_loader');
    this.clearRegisterModalError();
    // get the form data
  }

  async registerUser() {
    PubSub.publish('show_loader');
    this.clearRegisterModalError();
    // get the form data

    const formData = {
      name: this.DOM.registerModal.formName.value,
      lastname: this.DOM.registerModal.formSurname.value,
      email: this.DOM.registerModal.formEmail.value,
      pass: this.DOM.registerModal.formPassword.value,
      telephone: this.DOM.registerModal.formPhone.value,
      agreement: this.DOM.registerModal.formTos.checked,
    };

    const response = await this.api.signupUser(formData);
    if (response.status === 'success') {
      window.location.reload();
    } else if (response.status === 'error') {
      const form = this.getRegisterForm();
      response.error_messages.forEach((element) => {
        const fieldName = Object.keys(element)[0];
        const formField = form[fieldName];
        if (formField) {
          this.registerModalShowError(element[fieldName], formField);
        }
        if (fieldName === 'generic') {
          this.registerModalShowError(element[fieldName], form.name.parentNode);
        }
      });
    } else if (
      response.status === 'merge' &&
      response.type === 'no_verification'
    ) {
      // MERGE WITHOUT VERIFICATION CODE
      // ==========================
      this.formData = formData;
      this.toggleRegisterModal();
      this.toggleMergeModal();
    } else if (
      response.status === 'merge' &&
      response.type === 'mail_verification'
    ) {
      // MERGE WITH VERIFICATION CODE
      // ==========================
      this.formData = formData;
      this.toggleRegisterModal();
      this.toggleMergeAccountWithCodeModal();
    }

    PubSub.publish('hide_loader');
  }

  async loginWithPhoneAndOtp() {
    PubSub.publish('show_loader');

    const { value } = this.DOM.otpModal.input;

    const response = await this.api.phoneLoginWithOTP(
      value,
      this.callID,
      this.phone,
    );

    console.log(response);
    if (response.status === 'error') {
      // TODO otp login fail error
      console.log('fail login');
      // this.passwordModalShowError(texts.login.wrongPassword);
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
      this.passwordModalShowError(texts.login.wrongPassword);
    } else if (response.status === 'ok') {
      window.location.reload();
    }

    PubSub.publish('hide_loader');
  }

  async logoutUser() {
    PubSub.publish('show_loader');
    await this.api.logout();
    window.location.reload();
    PubSub.publish('hide_loader');
  }

  // #endregion

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
    // remove the checkmark icon
    this.DOM.registerModal.modal
      .querySelector('.personal-details__phone-checkbox')
      .classList.remove('personal-details__phone-checkbox--active');

    this.DOM.registerModal.formTos.checked = false;
    this.DOM.registerModal.formTosTrigger.classList.remove('checked');
    this.clearRegisterModalError();
    this.formData = null;
  }

  clearResetPasswordModalErrors() {
    this.DOM.resetPasswordModal.inputPassword.classList.remove(
      'form-control--has-error',
    );
    this.DOM.resetPasswordModal.inputConfirmPassword.classList.remove(
      'form-control--has-error',
    );
    this.DOM.resetPasswordModal.modal
      .querySelectorAll('.js-error')
      .forEach((error) => {
        error.remove();
      });
  }

  resetPasswordModalShowError(error, input) {
    this.clearResetPasswordModalErrors();
    input.classList.add('form-control--has-error');
    if (error !== '') {
      const htmlError = this.errorTemplate(error);
      input.parentNode.insertAdjacentHTML('beforebegin', htmlError);
    }
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

  getRegisterForm() {
    return {
      name: this.DOM.registerModal.formName,
      lastname: this.DOM.registerModal.formSurname,
      email: this.DOM.registerModal.formEmail,
      pass: this.DOM.registerModal.formPassword,
      telephone: this.DOM.registerModal.formPhone,
      agreement: this.DOM.registerModal.formTos,
    };
  }

  clearRegisterModalError() {
    // Remove error messages
    this.DOM.registerModal.formName.classList.remove('form-control--has-error');
    this.DOM.registerModal.formSurname.classList.remove(
      'form-control--has-error',
    );
    this.DOM.registerModal.formEmail.classList.remove(
      'form-control--has-error',
    );
    this.DOM.registerModal.formPhone.classList.remove(
      'form-control--has-error',
    );
    this.DOM.registerModal.formPassword.classList.remove(
      'form-control--has-error',
    );

    this.DOM.registerModal.modal
      .querySelectorAll('.js-error')
      .forEach((element) => {
        element.remove();
      });
  }

  registerModalShowError(error, input) {
    console.log(error);
    console.log(input);
    input.classList.add('form-control--has-error');
    if (error !== '') {
      const htmlError = this.errorTemplate(error);
      input.parentNode.insertAdjacentHTML('beforebegin', htmlError);
    }
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

  checkMissingDataForm() {
    console.log('checkMissingDataForm');
    // check if all form inputs are filled
    if (
      this.DOM.missingDataModal.formName.value.length > 0 &&
      this.DOM.missingDataModal.formSurname.value.length > 0 &&
      this.DOM.missingDataModal.formEmail.value.length > 0 &&
      this.DOM.missingDataModal.formPhone.value.length > 0
    ) {
      this.DOM.missingDataModal.actionBtn.classList.remove(
        'primary-btn--disabled',
      );
    } else {
      this.DOM.missingDataModal.actionBtn.classList.add(
        'primary-btn--disabled',
      );
    }
  }

  clearMissingDataModalError() {
    // Remove error messages
    this.DOM.missingDataModal.formName.classList.remove(
      'form-control--has-error',
    );
    this.DOM.missingDataModal.formSurname.classList.remove(
      'form-control--has-error',
    );
    this.DOM.missingDataModal.formEmail.classList.remove(
      'form-control--has-error',
    );
    this.DOM.missingDataModal.formPhone.classList.remove(
      'form-control--has-error',
    );
    this.DOM.missingDataModal.formPassword.classList.remove(
      'form-control--has-error',
    );

    this.DOM.missingDataModal.modal
      .querySelectorAll('.js-error')
      .forEach((element) => {
        element.remove();
      });
  }

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

  // #region Toggling, Closing and Opening Modals
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

  toggleMergeModal() {
    if (this.isMergeAccountOpen) {
      this.closeMerge();
    } else {
      this.openMerge();
    }
    this.isMergeAccountOpen = !this.isMergeAccountOpen;
  }

  closeMerge() {
    document.body.classList.remove('hide-overflow');
    this.DOM.mergeAccountModal.modal.classList.remove('active');
  }

  openMerge() {
    document.body.classList.add('hide-overflow');
    this.DOM.mergeAccountModal.modal.classList.add('active');
  }

  toggleMergeAccountWithCodeModal() {
    if (this.isMergeAccountWithCodeOpen) {
      this.closeMergeAccountWithCode();
    } else {
      this.openMergeAccountWithCode();
    }
    this.isMergeAccountWithCodeOpen = !this.isMergeAccountWithCodeOpen;
  }

  closeMergeAccountWithCode() {
    document.body.classList.remove('hide-overflow');
    this.DOM.mergeAccountWithCodeModal.modal.classList.remove('active');
  }

  openMergeAccountWithCode() {
    document.body.classList.add('hide-overflow');
    this.DOM.mergeAccountWithCodeModal.modal.classList.add('active');
  }

  toggleResetPasswordModal() {
    if (this.isResetPasswordOpen) {
      this.closeResetPassword();
    } else {
      this.openResetPassword();
    }
    this.isResetPasswordOpen = !this.isResetPasswordOpen;
  }

  closeResetPassword() {
    document.body.classList.remove('hide-overflow');
    this.DOM.resetPasswordModal.modal.classList.remove('active');
  }

  openResetPassword() {
    document.body.classList.add('hide-overflow');
    this.DOM.resetPasswordModal.modal.classList.add('active');
  }

  toggleMissingDataModal() {
    console.log('toggleMissingDataModal');
    if (this.isMissingDataOpen) {
      this.closeMissingDataModal();
    } else {
      this.openMissingDataModal();
    }
    this.isMissingDataOpen = !this.isMissingDataOpen;
  }

  closeMissingDataModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.missingDataModal.modal.classList.remove('active');
  }

  openMissingDataModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.missingDataModal.modal.classList.add('active');
  }

  // #endregion
}
