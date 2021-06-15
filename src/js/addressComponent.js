import autoBind from 'auto-bind';
import { store } from './store';

export default class {
  constructor() {
    autoBind(this);
    // Query the DOM
    this.DOM = {};
    this.DOM.trigger = document.querySelector('.address-trigger');
    this.DOM.chooseAddress = document.querySelector('.choose-address');
    this.DOM.closeModal = document.querySelector('.choose-address__close-btn');
    // this.DOM.chooseAddress.querySelector('')
    this.init();
  }

  init() {
    if (this.DOM.trigger) {
      this.DOM.trigger.addEventListener('click', this.triggerClicked);
      this.DOM.closeModal.addEventListener(
        'click',
        this.hideChooseAddressModal,
      );
    }

    window.googleMapsCallback = this.googleMapsCallback;
  }

  triggerClicked() {
    console.log('clicked');
    // TODO check if the user has at least one address
    if (store.context.isUserLoggedIn) {
      console.log('user is logged in');
      this.showChooseAddressModal();
    } else {
      console.log('user is guest');
    }
  }

  showChooseAddressModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.chooseAddress.classList.add('choose-address--active');
  }

  hideChooseAddressModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.chooseAddress.classList.remove('choose-address--active');
  }

  googleMapsCallback() {
    console.log('hi');
  }
}
