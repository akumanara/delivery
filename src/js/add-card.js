/* eslint-disable class-methods-use-this */
import PubSub from 'pubsub-js';
import autoBind from 'auto-bind';
import API from './api';
import { store } from './store';

export default class {
  constructor(addCardModalElement) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.modal = addCardModalElement;

    this.DOM = {
      modal: this.DOM.modal,
      closeBtn: this.DOM.modal.querySelector('.js-close-add-card-modal'),
      error: this.DOM.modal.querySelector('.js-add-card-error'),
      errorMsg: this.DOM.modal.querySelector('.js-add-card-error-msg'),
      actionBtn: this.DOM.modal.querySelector('.js-action-btn'),
      tags: this.DOM.modal.querySelectorAll('.add-card__tag'),
      threeDSModal: document.querySelector('.js-threeds-modal'),
      formCardNumber: this.DOM.modal.querySelector('[data-vp="cardnumber"]'),
      formCardHolder: this.DOM.modal.querySelector('[data-vp="cardholder"]'),
      formCardMonth: this.DOM.modal.querySelector('[data-vp="month"]'),
      formCardYear: this.DOM.modal.querySelector('[data-vp="year"]'),
      formCardCVV: this.DOM.modal.querySelector('[data-vp="cvv"]'),
      formSave: this.DOM.modal.querySelector('#save-card'),
      formDefault: this.DOM.modal.querySelector('#default-card'),
    };
    // Selcted tag
    this.selectedTag = this.DOM.modal.querySelector(
      '.add-card__tag--active',
    ).innerText;

    // Setup event listeners
    document.querySelectorAll('.js-open-add-card-modal').forEach((el) => {
      el.addEventListener('click', this.showModal);
    });
    this.DOM.closeBtn.addEventListener('click', this.hideModal);
    this.DOM.actionBtn.addEventListener('click', this.submitCard);
    this.DOM.tags.forEach((tag) => {
      tag.addEventListener('click', () => {
        this.selectTag(tag);
      });
    });
    document.addEventListener('DOMContentLoaded', this.DOMLoaded);
  }

  selectTag(selectedTag) {
    this.DOM.tags.forEach((tag) => {
      tag.classList.remove('add-card__tag--active');
    });
    selectedTag.classList.add('add-card__tag--active');
    this.selectedTag = selectedTag.innerText;
  }

  showModal() {
    this.clearModal();
    this.DOM.modal.classList.toggle('active');
    document.body.classList.toggle('hide-overflow');
  }

  clearModal() {
    this.hideError();

    this.DOM.formCardNumber.value = '';
    this.DOM.formCardHolder.value = '';
    this.DOM.formCardMonth.value = '';
    this.DOM.formCardYear.value = '';
    this.DOM.formCardCVV.value = '';
    this.DOM.formSave.checked = false;
    this.DOM.formDefault.checked = false;
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

  submitCard() {
    PubSub.publish('show_loader');
    this.hideError();
    // TODO get amount from cart
    // eslint-disable-next-line no-undef
    VivaPayments.cards
      .requestToken({ amount: 5510 })
      .done((data) => {
        console.log('done token');

        this.saveCard(data);
        PubSub.publish('hide_loader');
      })
      .fail((responseData) => {
        console.log('fail token');
        console.log(responseData);
        this.showError();
        PubSub.publish('hide_loader');
      });
  }

  saveCard(data) {
    console.log('saving card');

    this.card = {
      chargeToken: data.chargeToken,
      tag: this.selectedTag,
      saveCard: this.DOM.formSave.checked,
      defaultCard: this.DOM.formDefault.checked,
    };
    console.log(this.card);
    this.hideModal();
  }

  showError() {
    this.DOM.error.classList.add('add-card__error--active');
  }

  hideError() {
    this.DOM.error.classList.remove('add-card__error--active');
  }

  DOMLoaded() {
    const that = this;
    console.log('loaded');
    // eslint-disable-next-line no-undef
    VivaPayments.cards.setup({
      baseURL: store.context.vivaBaseURL,
      authToken: store.context.vivaAuthToken,
      cardHolderAuthOptions: {
        cardHolderAuthPlaceholderId: 'threed-pane',
        cardHolderAuthInitiated() {
          console.log('cardHolderAuthInitiated (3ds)');
          // showThreeDSModal();
          // n3.loader().hide();
          that.hideModal();
          that.showThreeDS();
          PubSub.publish('hide_loader');
        },
        cardHolderAuthFinished() {
          console.log('cardHolderAuthFinished');
          that.hideThreeDS();
        },
      },
    });
  }

  showThreeDS() {
    this.DOM.threeDSModal.classList.toggle('active');
    document.body.classList.toggle('hide-overflow');
  }

  hideThreeDS() {
    this.DOM.threeDSModal.classList.toggle('active');
    document.body.classList.toggle('hide-overflow');
  }
}
