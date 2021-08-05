import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import currency from 'currency.js';
import { store } from '../utils/store';
import API from './api';
import { OfferHandlebarsTemplate } from '../utils/handlebarTemplate';
import Product from './product';
import { offerTypes } from '../utils/enum';
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

    // Setup DOM and event listeners
    this.DOM.addToCartBtn = this.DOM.modal.querySelector(
      '.product-modal__add-to-cart-btn',
    );
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
      category.hasSelectedProduct = false;

      category.products.forEach((product) => {
        product.element = category.element.querySelector(
          `.offer-modal__product[data-product-id="${product.id}"]`,
        );
        product.productObject = new Product({
          productElement: product.element,
          isInsideOffer: true,
        });
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
    // Remove selected class from all products in the offer category
    [...category.element.querySelectorAll('.offer-modal__product')].forEach(
      (el) => {
        el.classList.remove('offer-modal__product--selected');
      },
    );

    // Find the added product element inside the offer category
    const element = category.element.querySelector(
      `.offer-modal__product[data-product-id="${addedProductData.productID}"]`,
    );
    // Add a selected class
    element.classList.add('offer-modal__product--selected');

    // Add selected product name to the accordion top and opened copy
    category.element.querySelector(
      '.product-modal__option-header-top',
    ).innerHTML = addedProductData.productJSON.name;
    category.element.querySelector(
      '.product-modal__option-header-opened-copy',
    ).innerHTML = addedProductData.productJSON.name;

    this.closeGroupOptions(null);

    category.hasSelectedProduct = true;
    category.selectedProductID = addedProductData.productID;

    this.calculatePrice();
    this.checkAddToCartFeasibility();
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

  disableAddToCart() {
    this.isAddToCartEnabled = false;
    this.DOM.addToCartBtn.classList.add(
      'product-modal__add-to-cart-btn--disabled',
    );
  }

  enableAddToCart() {
    this.isAddToCartEnabled = true;
    this.DOM.addToCartBtn.classList.remove(
      'product-modal__add-to-cart-btn--disabled',
    );
  }

  areAllProductsSelected() {
    return this.categories.every((category) => category.hasSelectedProduct);
  }

  checkAddToCartFeasibility() {
    let feasibility = this.areAllProductsSelected();

    // An to address einai unsupported. to koupmi add to basket prepei na einai fake disabled kai onclick na sou vgazei B level alert.
    if (!store.app.addressComponent.isSelectedAddressSupported) {
      console.log('unsupported address');
      feasibility = false;
    }

    if (feasibility) {
      this.enableAddToCart();
    } else {
      this.disableAddToCart();
    }
  }

  /* eslint-disable no-case-declarations */
  calculatePrice() {
    if (!this.areAllProductsSelected()) return;

    switch (this.offerJSON.offerType) {
      case offerTypes.discountAmountOnOffer:
        console.log('discountAmountOnOffer Type');
        this.price = this.calculateSumOfProductsPrice().calculatedPrice;
        this.price = this.price.subtract(this.offerJSON.discountAmount);
        break;

      case offerTypes.discountPercentageOnOffer:
        console.log('discountPercentageOnOffer Type');
        this.price = this.calculateSumOfProductsPrice().calculatedPrice;
        const percentageMultiplier = currency(100)
          .subtract(this.offerJSON.discountPercentage)
          .divide(100);
        this.price = this.price.multiply(percentageMultiplier);
        break;

      case offerTypes.fixedPriceOnOffer:
        console.log('fixedPriceOnOffer Type');
        this.price = currency(this.offerJSON.fixedPrice);
        break;

      default:
        console.log('default Type');
        this.price = this.calculateSumOfProductsPrice().calculatedPrice;
    }

    console.log(`final offer price ${this.price}`);
  }

  calculateSumOfProductsPrice() {
    const data = {};
    data.selectedProducts = [];
    let calculatedPrice = currency(0);
    this.categories.forEach((category) => {
      if (category.hasSelectedProduct && category.selectedProductID) {
        const selectedProduct = category.products.find(
          (product) => product.id === category.selectedProductID,
        );
        data.selectedProducts.push(selectedProduct);
        calculatedPrice = calculatedPrice.add(
          selectedProduct.productObject.price,
        );
      }
    });
    data.calculatedPrice = calculatedPrice;
    return data;
  }
}
