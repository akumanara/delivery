/* eslint-disable class-methods-use-this */
import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import { store } from '../utils/store';
import texts from '../utils/texts';
import API from './api';
import Alert from './alert';
import { deliveryTypes } from '../utils/enum';

export default class {
  constructor() {
    autoBind(this);
    this.api = new API();
    this.DOM = {
      payNowButton: document.querySelector('.pay-now__btn'),
      guestName: document.querySelector('.js-guest-order_recipient'),
      guestLastName: document.querySelector(
        '.js-guest-order_recipient_lastname',
      ),
      guestEmail: document.querySelector('.js-guest-email'),
      guestPhone: document.querySelector('.js-verify-number-input'),
    };
    this.init();
  }

  init() {
    this.DOM.payNowButton.addEventListener('click', this.insertOrderClicked);
  }

  async insertOrderClicked() {
    // check if the user can insert order
    if (!this.canUserInsertOrder()) {
      console.log('the user cant insert order');
      return;
    }

    this.insertOrder();
  }

  canUserInsertOrder() {
    // ADDRESS AND DELIVERY METHOD
    // ==============
    if (store.app.deliveryType.deliveryMethod === deliveryTypes.DELIVERY) {
      // DELIVERY METHOD
      // 1. Does the user has a selected address
      if (!store.app.addressComponent.selectedAddress) {
        // NO ADDRESS SELECTED
        return false;
      }
      // 2. Is the address supported by the store
      if (!store.app.addressComponent.isSelectedAddressSupported) {
        // ADDRESS NOT SUPPORTED BY THE STORE
        return false;
      }
    } else if (
      store.app.deliveryType.deliveryMethod === deliveryTypes.TAKEAWAY
    ) {
      // TAKEAWAY METHOD
    } else {
      // NO DELIVERY METHOD
      return false;
    }

    // PAYMENT METHOD
    // ==============
    if (!store.app.paymentType.activePaymentMethod) {
      // NO PAYMENT METHOD SELECTED
      return false;
    }
    if (
      store.app.paymentType.activePaymentMethod.dataset.type === 'expired_card'
    ) {
      // PAYMENT METHOD IS EXPIRED CARD
      return false;
    }

    // GUEST USER
    if (!store.context.isUserLoggedIn) {
      if (
        this.DOM.guestName.value === '' ||
        this.DOM.guestLastName.value === '' ||
        this.DOM.guestEmail.value === '' ||
        this.DOM.guestPhone.value === ''
      ) {
        // GUEST USER FORM IS MISSING DATA
        return false;
      }
    }

    // if nothing fails from the above, the user can insert order
    return true;
  }

  async insertOrder() {
    PubSub.publish('show_loader');
    const data = {
      shop_id: store.context.storeID,
      order_origin_code: store.context.orderOrigin,
    };

    // PAYMENT TYPE AND DETAILS
    if (store.app.paymentType.activePaymentMethod) {
      if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'cash' ||
        store.app.paymentType.activePaymentMethod.dataset.type === 'pos'
      ) {
        // CASH OR POS
        data.payment_type =
          store.app.paymentType.activePaymentMethod.dataset.type;
      } else if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'new_card'
      ) {
        // NEW CARD
        data.payment_type = 'card';
        data.token = store.app.addCard.card.chargeToken;
        data.tag = store.app.addCard.card.tag;
        data.save = store.app.addCard.card.saveCard;
        data.default = store.app.addCard.card.defaultCard;
      } else if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'saved_card'
      ) {
        // SAVED CARD
        data.payment_type = 'card';
        data.creditCardId =
          store.app.paymentType.activePaymentMethod.dataset.id;
        // TODO it might want 3ds
      }
    } else {
      data.payment_type = null;
    }

    if (!store.context.isUserLoggedIn) {
      // GUEST EXTRA DATA
      data.order_recipient = this.DOM.guestName.value;
      data.order_recipient_lastname = this.DOM.guestLastName.value;
      data.order_email = this.DOM.guestEmail.value;
      data.order_phone = this.DOM.guestPhone.value;
    }

    let response;
    try {
      response = await this.api.insertOrder(data);
    } catch (error) {
      // ERROR FROM SERVER (ex. status code 500)
      const a = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5, // time until it closes
        type: 'error', // or 'error'
        showTimer: false, // show the timer or not
      });
      PubSub.publish('hide_loader');
      return;
    }
    if (response.status === 'success') {
      window.location.href = response.redirect;
    } else {
      // handle guest error messages
      const form = this.getGuestForm();
      response.error_messages.forEach((element) => {
        const fieldName = Object.keys(element)[0];
        const formField = form[fieldName];
        if (formField) {
          this.guestFormShowError(element[fieldName], formField);
        }
        if (fieldName === 'generic') {
          this.guestFormShowError(
            element[fieldName],
            form.order_recipient.parentNode,
          );
        }
      });

      console.log(response);
      const a = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5, // time until it closes
        type: 'error', // or 'error'
        showTimer: false, // show the timer or not
      });
    }

    console.log(`insert order: ${data}`);
    PubSub.publish('hide_loader');
  }

  getGuestForm() {
    return {
      order_recipient: this.DOM.guestName,
      order_recipient_lastname: this.DOM.guestLastName,
      email: this.DOM.guestEmail,
      order_phone: this.DOM.guestPhone,
    };
  }

  guestFormShowError(error, input) {
    console.log(error);
    console.log(input);
    input.classList.add('form-control--has-error');
    if (error !== '') {
      const htmlError = this.errorTemplate(error);
      input.parentNode.insertAdjacentHTML('beforebegin', htmlError);
    }
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

  // TODO Flag for delete
  async insertOrderLoggedIn() {
    PubSub.publish('show_loader');
    const data = {
      shop_id: store.context.storeID,
      order_origin_code: store.context.orderOrigin,
    };

    if (store.app.paymentType.activePaymentMethod) {
      if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'cash' ||
        store.app.paymentType.activePaymentMethod.dataset.type === 'pos'
      ) {
        // CASH OR POS
        data.payment_type =
          store.app.paymentType.activePaymentMethod.dataset.type;
      } else if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'new_card'
      ) {
        // NEW CARD
        data.payment_type = 'card';
        data.token = store.app.addCard.card.chargeToken;
        data.tag = store.app.addCard.card.tag;
        data.save = store.app.addCard.card.saveCard;
        data.default = store.app.addCard.card.defaultCard;
      } else if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'saved_card'
      ) {
        // SAVED CARD
        data.payment_type = 'card';
        data.creditCardId =
          store.app.paymentType.activePaymentMethod.dataset.id;
        // TODO it might want 3ds
      }
    } else {
      data.payment_type = null;
    }

    const response = await this.api.insertOrder(data);
    if (response.status === 'success') {
      window.location.href = response.redirect;
    } else {
      console.log(response);
      const a = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5, // time until it closes
        type: 'error', // or 'error'
        showTimer: false, // show the timer or not
      });
    }

    console.log(data);
    PubSub.publish('hide_loader');
  }

  // TODO Flag for delete
  async insertOrderGuest() {
    PubSub.publish('show_loader');
    const data = {
      shop_id: store.context.storeID,
      order_origin_code: store.context.orderOrigin,
      // order_delivery_slot: '',
      order_recipient: this.DOM.guestName.value,
      order_recipient_lastname: this.DOM.guestLastName.value,
      email: this.DOM.guestEmail.value,
      order_phone: this.DOM.guestPhone.value,
      // payment_type: store.app.paymentType.activePaymentMethod, // 'cash' or 'pos' apo to payment type component
    };

    // Payment type
    // 'cash' or 'pos' or 'card'

    // if 'card'
    // - saved card
    // - new card
    if (store.app.paymentType.activePaymentMethod) {
      if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'cash' ||
        store.app.paymentType.activePaymentMethod.dataset.type === 'pos'
      ) {
        // CASH OR POS
        data.payment_type =
          store.app.paymentType.activePaymentMethod.dataset.type;
      } else if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'new_card'
      ) {
        // NEW CARD
        data.payment_type = 'card';
        data.token = store.app.addCard.card.chargeToken;
        data.tag = store.app.addCard.card.tag;
        data.save = store.app.addCard.card.saveCard;
        data.default = store.app.addCard.card.defaultCard;
      } else if (
        store.app.paymentType.activePaymentMethod.dataset.type === 'saved_card'
      ) {
        // SAVED CARD
        data.payment_type = 'card';
        data.creditCardId =
          store.app.paymentType.activePaymentMethod.dataset.id;
        // TODO it might want 3ds
      }
    } else {
      data.payment_type = null;
    }

    const response = await this.api.insertOrder(data);
    if (response.status === 'success') {
      window.location.href = response.redirect;
    } else {
      console.log(response);
      const a = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5, // time until it closes
        type: 'error', // or 'error'
        showTimer: false, // show the timer or not
      });
    }

    console.log(data);
    PubSub.publish('hide_loader');
  }
}
