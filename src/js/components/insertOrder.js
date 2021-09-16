import autoBind from 'auto-bind';
import PubSub from 'pubsub-js';
import { store } from '../utils/store';
import texts from '../utils/texts';
import API from './api';
import Alert from './alert';

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
    this.DOM.payNowButton.addEventListener('click', this.insertOrder);
  }

  async insertOrder() {
    // todo isws na exoume mia function kai gia tous 2?
    // todo check if user is logged in and can submit order (filled in details, etc, etc)
    if (store.context.isUserLoggedIn) {
      await this.insertOrderLoggedIn();
    } else {
      await this.insertOrderGuest();
    }
  }

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
