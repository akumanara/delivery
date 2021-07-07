import autoBind from 'auto-bind';

export default class {
  constructor() {
    autoBind(this);
    this.DOM = {};
    // login modal
    this.DOM.loginModal = document.querySelector('.login');
    this.DOM.loginModal = {
      modal: this.DOM.loginModal,
      closeBtn: this.DOM.loginModal.querySelector('.login__close'),
      background: this.DOM.loginModal.querySelector('.login__bg'),
      trigger: document.querySelector('.header__login-btn'),
    };

    this.isLoginOpen = false;

    if (this.DOM.loginModal.trigger) {
      this.DOM.loginModal.trigger.addEventListener(
        'click',
        this.toggleLoginModal,
      );
      this.DOM.loginModal.background.addEventListener(
        'click',
        this.toggleLoginModal,
      );
      this.DOM.loginModal.closeBtn.addEventListener(
        'click',
        this.toggleLoginModal,
      );
    }
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
}
