import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import { store } from '../utils/store';
import API from './api';
import { OfferHandlebarsTemplate } from '../utils/handlebarTemplate';
import Product from './product';

// 1. Click sto offer
// 2. API call on response
// 3. kanw prepare data gia to handlebars template, ftiaxnw to modal kai to kanw append sto DOM
// 4. kanw init accordeons kai product objects mesa sta offer categories

export default class {
  constructor(offerElement) {
    autoBind(this);
    this.DOM = {};
    this.api = new API();
    this.DOM.triggerElement = offerElement;
    this.offerID = this.DOM.triggerElement.dataset.offerId;
    // this.DOM.modal = document.querySelector('.tmp');
    this.DOM.triggerElement.addEventListener('click', this.raiseModal);
    // this.isModalOpen = false;
  }

  async raiseModal() {
    // An den yparxei selected address. na deiksoume to notify modal kai oxi to product modal.
    if (!store.app.addressComponent.selectedAddress) {
      store.app.addressComponent.showNotifyModal();
    }
    PubSub.publish('show_loader');

    this.offerJSON = await this.api.getOffer(this.offerID);
    // Create the modal (template) from the data and init it
    this.createModal();
    // Init the modal
    this.initModal();

    PubSub.publish('hide_loader');
  }

  createModal() {
    this.templateData = {
      modalClass: `js-offer-modal-${this.offerID}`,
      name: this.offerJSON.name,
      images: this.offerJSON.images,
      comments: this.offerJSON.comments,
      categories: this.offerJSON.categories,
    };
    // create the template
    const html = OfferHandlebarsTemplate(this.templateData);
    document.body.insertAdjacentHTML('beforeend', html);
    this.DOM.modal = document.querySelector(`.js-offer-modal-${this.offerID}`);
  }

  initModal() {
    const self = this;

    // Setup event listeners
    this.DOM.modal
      .querySelector('.js-close')
      .addEventListener('click', this.removeModal);

    // setup data and objects
    this.categories = this.offerJSON.categories;
    this.categories.forEach((category) => {
      // query the element to the category
      category.element = this.DOM.modal.querySelector(
        `.product-modal__option[data-offer-category-id="${category.id}"]`,
      );
      category.products.forEach((product) => {
        product.element = category.element.querySelector(
          `.offer-modal__product[data-product-id="${product.id}"]`,
        );
        product.productObject = new Product(product.element, true);
        product.productObject.on('added', (addedProductData) => {
          this.addedProduct(category, addedProductData);
        });
        product.productObject.on('closed', this.openModal);
        product.element.addEventListener('click', this.closeModal);
      });
    });

    // Accordions
    this.accordions = [];
    this.DOM.modal.querySelectorAll('.accordion__container').forEach((el) => {
      const tmpAccordionContainer = new Accordion(el, {
        duration: 600,
        elementClass: 'accordion__item',
        triggerClass: 'accordion__header',
        panelClass: 'accordion__panel',
        ariaEnabled: false,
        beforeOpen() {
          // close other accordions if opened
          self.closeGroupOptions(tmpAccordionContainer);
        },
      });
      this.accordions.push(tmpAccordionContainer);
    });

    this.openModal();
  }

  addedProduct(category, addedProductData) {
    console.log(category);
    console.log(addedProductData);
  }

  openModal() {
    console.log('openModal');
    this.DOM.modal.classList.add('active');
    document.body.classList.add('hide-overflow');
  }

  closeModal() {
    this.DOM.modal.classList.remove('active');
    document.body.classList.remove('hide-overflow');
  }

  removeModal() {
    this.closeModal();
    this.DOM.modal.remove();
  }

  // Closes all the accordions except the one to be opened
  closeGroupOptions(accordionToBeOpened) {
    this.accordions.forEach((accordion) => {
      if (accordionToBeOpened !== accordion) {
        accordion.close(0);
      }
    });
  }
}
