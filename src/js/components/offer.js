import PubSub from 'pubsub-js';
import Accordion from 'accordion-js';
import autoBind from 'auto-bind';
import currency from 'currency.js';
import { store } from '../utils/store';
import API from './api';
import { OfferHandlebarsTemplate } from '../utils/handlebarTemplate';
import Product from './product';
import { offerTypes } from '../utils/enum';
import { currencyFormat } from '../utils/helpers';
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
    await this.initModal();

    PubSub.publish('hide_loader');
  }

  createModal() {
    this.templateData = {
      modalClass: `js-offer-modal-${this.offerID}`,
      name: this.offerJSON.name,
      images: this.offerJSON.images,
      comments: this.offerJSON.comments,
      categories: this.offerJSON.categories,
      offerValidFrom: this.offerJSON.offerValidFrom,
      offerValidTo: this.offerJSON.offerValidTo,
    };
    // create the template
    const html = OfferHandlebarsTemplate(this.templateData);
    document.body.insertAdjacentHTML('beforeend', html);
    this.DOM.modal = document.querySelector(`.js-offer-modal-${this.offerID}`);
  }

  async initModal() {
    const self = this;

    // Setup DOM and event listeners
    this.DOM.addToCartBtn = this.DOM.modal.querySelector(
      '.product-modal__add-to-cart-btn',
    );
    this.DOM.price = this.DOM.modal.querySelector('.js-offer-final-price');
    this.DOM.startingPrice = this.DOM.modal.querySelector('.js-starting-price');
    this.DOM.startingPriceContainer = this.DOM.modal.querySelector(
      '.offer-modal__starting-price',
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
          offerID: this.offerJSON.id,
          offerCategoryID: category.id,
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

    // We await this because if there is a single product it will make an API call
    await this.preselectSingleProductCategory();

    this.openModal();
  }

  async preselectSingleProductCategory() {
    await Promise.all(
      this.categories.map(async (category) => {
        if (category.products.length === 1) {
          await category.products[0].productObject.raiseModal();
          category.products[0].productObject.closeModal();
          this.addedProduct(category, category.products[0].productObject);
        }
      }),
    );
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

    // Get the starting price object with the selected products
    const startingPriceObject = this.calculateSumOfProductsPrice();
    console.log(startingPriceObject);

    // Calculate the final price depending on offer type
    switch (this.offerJSON.offerType) {
      case offerTypes.discountAmountOnOffer:
        // Έκπτωση χρηματική στο σύνολο της προσφοράς
        // ==========================
        this.price = this.discountAmountOnOffer(startingPriceObject);
        break;
      case offerTypes.discountPercentageOnOffer:
        // Έκπτωση με ποσοστό στο σύνολο της προσφοράς
        // ==========================
        this.price = this.discountPercentageOnOffer(startingPriceObject);
        break;
      case offerTypes.fixedPriceOnOffer:
        // Σταθέρη χρέωση προσφοράς
        // ==========================
        this.price = this.fixedPriceOnOffer(startingPriceObject);
        break;
      case offerTypes.discountPercentageOnCheapestProduct:
        // Έκπτωση με ποσοστό στο Φθηνότερο προϊόν
        // ==========================
        this.price =
          this.discountPercentageOnCheapestProduct(startingPriceObject);
        break;
      case offerTypes.discountPercentageOnSpecificOfferCategory:
        // Έκπτωση με ποσοστό σε συγκεκριμένο προϊόν (sigekrimeni katigoria prosforas)
        // ==========================
        this.price =
          this.discountPercentageOnSpecificOfferCategory(startingPriceObject);
        break;
      case offerTypes.fixedPriceOnSpecificOfferCategory:
        // Σταθερή τιμή σε συγκεκριμένο προϊόν (sigekrimeni katigoria prosforas)
        // ==========================
        this.price =
          this.fixedPriceOnSpecificOfferCategory(startingPriceObject);
        break;
      default:
        // Default
        // ==========================
        this.price = startingPriceObject.calculatedPrice;
        break;
    }

    // Show the initial price without the discount
    this.DOM.startingPrice.innerHTML = currencyFormat(
      startingPriceObject.calculatedPrice,
    );
    this.DOM.startingPriceContainer.classList.remove('d-none');

    // Show the final price with the discount in the button
    this.DOM.price.innerHTML = currencyFormat(this.price);

    console.log(`final offer price ${this.price}`);
  }

  calculateSumOfProductsPrice() {
    const data = {};
    data.selectedProducts = [];

    let calculatedPrice = currency(0);
    let ingredientsPrice = currency(0);
    let priceWithoutIngredients = currency(0);
    this.categories.forEach((category) => {
      if (category.hasSelectedProduct && category.selectedProductID) {
        const selectedProduct = category.products.find(
          (product) => product.id === category.selectedProductID,
        );
        data.selectedProducts.push(selectedProduct);
        calculatedPrice = calculatedPrice.add(
          selectedProduct.productObject.price,
        );
        ingredientsPrice = ingredientsPrice.add(
          selectedProduct.productObject.ingredientsPrice,
        );
        priceWithoutIngredients = priceWithoutIngredients.add(
          selectedProduct.productObject.priceWithoutIngredients,
        );
      }
    });
    data.calculatedPrice = calculatedPrice;
    data.ingredientsPrice = ingredientsPrice;
    data.priceWithoutIngredients = priceWithoutIngredients;
    return data;
  }

  // OFFER DISCOUNTS CALCULATIONS
  discountAmountOnOffer(startingPriceObject) {
    console.log('discountAmountOnOffer Type');
    let startingPrice = startingPriceObject.calculatedPrice;

    if (this.offerJSON.chargeIngredients) {
      startingPrice = startingPriceObject.priceWithoutIngredients;
    }

    this.price = startingPrice;
    this.price = this.price.subtract(this.offerJSON.discountAmount);

    if (this.offerJSON.chargeIngredients) {
      this.price = this.price.add(startingPriceObject.ingredientsPrice);
    }

    return this.price;
  }

  discountPercentageOnOffer(startingPriceObject) {
    console.log('discountPercentageOnOffer Type');
    let startingPrice = startingPriceObject.calculatedPrice;

    if (this.offerJSON.chargeIngredients) {
      startingPrice = startingPriceObject.priceWithoutIngredients;
    }

    this.price = startingPrice;
    const percentageMultiplier = currency(100)
      .subtract(this.offerJSON.discountPercentage)
      .divide(100);
    this.price = this.price.multiply(percentageMultiplier);

    if (this.offerJSON.chargeIngredients) {
      this.price = this.price.add(startingPriceObject.ingredientsPrice);
    }
    return this.price;
  }

  fixedPriceOnOffer(startingPriceObject) {
    console.log('fixedPriceOnOffer Type');
    this.price = currency(this.offerJSON.fixedPrice);

    if (this.offerJSON.chargeIngredients) {
      this.price = this.price.add(startingPriceObject.ingredientsPrice);
    }
    return this.price;
  }

  discountPercentageOnCheapestProduct(startingPriceObject) {
    console.log('discountPercentageOnCheapestProduct Type');
    let startingPrice = startingPriceObject.calculatedPrice;

    if (this.offerJSON.chargeIngredients) {
      startingPrice = startingPriceObject.priceWithoutIngredients;
    }

    // Find the cheapest product
    const cheapestSelectedProduct = startingPriceObject.selectedProducts.reduce(
      (prev, curr) =>
        prev.productObject.price < curr.productObject.price ? prev : curr,
    );
    // Calculate the price of the cheapest product with the discount
    const percentageMultiplier = currency(100)
      .subtract(this.offerJSON.discountPercentage)
      .divide(100);
    const cheapestProductPriceWithDiscount =
      cheapestSelectedProduct.productObject.price.multiply(
        percentageMultiplier,
      );
    // Subtract the price of the cheapest product from the sum of all products and add the discounted price
    this.price = startingPrice
      .subtract(cheapestSelectedProduct.productObject.price)
      .add(cheapestProductPriceWithDiscount);

    if (this.offerJSON.chargeIngredients) {
      this.price = this.price.add(startingPriceObject.ingredientsPrice);
    }
    return this.price;
  }

  discountPercentageOnSpecificOfferCategory(startingPriceObject) {
    console.log('discountPercentageOnSpecificOfferCategory Type');
    let startingPrice = startingPriceObject.calculatedPrice;

    if (this.offerJSON.chargeIngredients) {
      startingPrice = startingPriceObject.priceWithoutIngredients;
    }

    // Find the discount category
    const discountCategory = this.categories.find(
      (category) => category.id === this.offerJSON.discountCategoryID,
    );
    // Find the product in the discount category
    const discountProduct = discountCategory.products.find(
      (product) =>
        product.productObject.productID === discountCategory.selectedProductID,
    );
    // Calculate the price of the discount product with the discount percentage
    const percentageMultiplier = currency(100)
      .subtract(this.offerJSON.discountPercentage)
      .divide(100);
    const discountProductPriceWithDiscount =
      discountProduct.productObject.price.multiply(percentageMultiplier);
    // Subtract the price of the discount product from the sum of all products and add the discounted price
    this.price = startingPrice
      .subtract(discountProduct.productObject.price)
      .add(discountProductPriceWithDiscount);

    if (this.offerJSON.chargeIngredients) {
      startingPrice = startingPriceObject.priceWithoutIngredients;
    }

    return this.price;
  }

  fixedPriceOnSpecificOfferCategory(startingPriceObject) {
    console.log('fixedPriceOnSpecificOfferCategory Type');
    let startingPrice = startingPriceObject.calculatedPrice;

    if (this.offerJSON.chargeIngredients) {
      startingPrice = startingPriceObject.priceWithoutIngredients;
    }
    // Find the discount category
    const discountCategory = this.categories.find(
      (category) => category.id === this.offerJSON.discountCategoryID,
    );
    // Find the product in the discount category
    const discountProduct = discountCategory.products.find(
      (product) =>
        product.productObject.productID === discountCategory.selectedProductID,
    );
    // Subtract the price of the discount product from the sum of all products and add the fixed price
    this.price = startingPrice
      .subtract(discountProduct.productObject.price)
      .add(this.offerJSON.fixedPriceForDiscountCategory);

    if (this.offerJSON.chargeIngredients) {
      startingPrice = startingPriceObject.priceWithoutIngredients;
    }

    return this.price;
  }
}
