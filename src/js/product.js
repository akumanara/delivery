import PubSub from 'pubsub-js';
import currency from 'currency.js';
import EventEmitter from 'events';
import Accordion from 'accordion-js';
import Swiper from 'swiper/bundle';
import randomstring from 'randomstring';
import autoBind from 'auto-bind';
import API from './api';
import Variant from './variant';
import GroupOption from './groupOption';
import { animateCSS, currencyFormat, has } from './utils';

// Product may have a variant
// Variant is single option and uses a different class.
// Variant changes the base price for the product.
// Variant changes the prices of ingredients.
// Product has a maxQuantity number. User cannot add more quantity than the maxQuantity number.
// Product has a minQuantity number. User cannot have less qty than the minQuantity number. The first click adds this qty.

// Product may have group option(s) - group options items are ingredients.
// Group option(s) are multiple select.
// Group option(s) have a max number. User cannot select more options than the max number.
// Group option(s) have a min number. User cannot add the item to its cart without having selected the min number of options.
// If min number is greater than 0, the group option is tagged as required.*
// Clicking on an option when the max is already reached does the following:
// - When max number is equal to 1. Deselect the previous item, and select the clicked option.
// - When max number is greater than 1. Do nothing

// Ingredient has a quantity.
// Ingredient has a max number.
// - If max is 1, then the option element is like a checkbox. Because you can only add one.
// - If max is greater than 1, then the option element is like a number input with plus/minus buttons. Because you can add more than one.
// Ingredient has an object of prices. The keys of this object are IDs for their corresponding variants. Key '0' is the default price.
// Ingredient has a default number. It predefines the quantity on that ingredient.
// Default number also excludes from price calculation.
// - If you add more than the default quantity, it only add the extra quantity to the price calculation.**
// - If you remove more than the default quantity, it does not remove from the price calculation.**

// * UI does not communicate when there is more than 1 min.
// ** UI does not communicate how this works.

// an mia katigoria ilikou exei max 2, kai sto iliko mporeis na valeis panw apo 1. tote prepei na sinipologistei sto max tis katigorias.
// an exeis default ingredient 1, kai max einai kai afto 1 (einai checkbox option) tote i timi sto UI deixni 0euro.
// an exeis default ingredient 1, kai max einai panw apo 1 (to option einai number input) tote i timi sto UI ti deixni?
// Τι σημαίνει done στα group options

export default class extends EventEmitter {
  constructor(productElement, template) {
    super();
    autoBind(this);
    this.template = template;
    this.element = productElement;
    this.api = new API();

    this.init();
  }

  init() {
    // setup event listeners
    this.element.addEventListener('click', this.onClick);
  }

  // Executes when we click on an product from the product list
  async onClick() {
    this.emit('showPreloader');
    // fetch the html for the modal
    this.productJSON = await this.api.getProduct(this.modalURL);

    // Create all the objects belonging to the product
    this.createProduct();
    // Create the modal (template) from the data and init it
    this.createModal();
    // Init the modal
    this.initModal();

    this.emit('hidePreloader');
  }

  // Creates the product after we get the JSON from the API
  createProduct() {
    // Create Initial Values
    // ===========================================================
    if (Number(this.productJSON.minQuantity) === 0) {
      this.quantity = 1;
    } else {
      this.quantity = this.productJSON.minQuantity;
    }

    this.basePrice = this.productJSON.price;

    // Create the variant if exists
    // ===========================================================
    if (has(this.productJSON, 'variants')) {
      console.log('product has variants');
      this.variant = new Variant(this.productJSON.variants);
      this.variant.on('selection', this.selectedVariant);
    }

    // Create the group options objects
    // ===========================================================
    this.groupOptions = [];
    if (has(this.productJSON, 'ingredient_categories')) {
      console.log('product has at least one group option');
      // for every group option
      this.productJSON.ingredient_categories.forEach((groupOption) => {
        const tmpGroupOption = new GroupOption(groupOption);
        tmpGroupOption.on('selection', this.selectedGroupOption);
        this.groupOptions.push(tmpGroupOption);
      });
    }

    // Create a random string for the popup id
    // ===========================================================
    const randomString = randomstring.generate({
      length: 7,
      charset: 'alphabetic',
    });

    // Create object used for templating
    // ===========================================================
    this.templateData = {
      randomString,
      name: this.productJSON.name,
      images: this.productJSON.images,
      comments: this.productJSON.comments,
      variant: this.variant,
      groupOptions: this.groupOptions,
      basePrice: this.basePrice,
    };
  }

  // Creates the modal from the template object
  createModal() {
    // create the template
    const html = this.template(this.templateData);
    document.body.insertAdjacentHTML('beforeend', html);
    this.modalElement = document.querySelector(
      `.${this.templateData.randomString}`,
    );
  }

  // Executes after we have created the modal
  initModal() {
    const self = this;

    // Photos gallery
    const sliderElement = this.modalElement.querySelector(
      '.product-modal__slider',
    );
    this.slider = new Swiper(sliderElement, {
      pagination: {
        el: '.swiper-pagination',
      },
      resistance: true,
      resistanceRatio: 0,
    });
    // Bind close btn
    this.modalElement
      .querySelector('.product-modal__close-btn')
      .addEventListener('click', this.closeModal);

    // I setup all the accordions here and not inside variant and groupoptions
    this.accordions = [];
    this.modalElement
      .querySelectorAll('.accordion__container')
      .forEach((el) => {
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

    // setup Variant
    if (this.variant) {
      const variantElement = this.modalElement.querySelector(
        '.js-product-modal__option-variant',
      );
      this.variant.init(variantElement);
    }

    // setup group options
    if (this.groupOptions.length > 0) {
      const groupOptionsElements = this.modalElement.querySelectorAll(
        '.js-product-modal__option-group-option',
      );
      this.groupOptions.forEach((groupOption, index) => {
        groupOption.init(groupOptionsElements[index]);
      });
    }

    // Save the DOM elements for later use
    this.DOM = {
      price: this.modalElement.querySelector('.js-product-modal-final-price'),
      priceContainer: this.modalElement.querySelector(
        '.product-modal__add-to-cart-btn-price',
      ),
      qty: this.modalElement.querySelector('.js-product-modal-qty'),
      plusBtn: this.modalElement.querySelector(
        '.product-modal__add-to-cart-qty-plus',
      ),
      minusBtn: this.modalElement.querySelector(
        '.product-modal__add-to-cart-qty-minus',
      ),
      addToCartBtn: this.modalElement.querySelector(
        '.product-modal__add-to-cart-btn',
      ),
    };

    // Add event listeners
    this.DOM.plusBtn.addEventListener('click', this.addOneQty);
    this.DOM.minusBtn.addEventListener('click', this.removeOneQty);
    this.DOM.addToCartBtn.addEventListener('click', this.addToCart);

    // Preselect the default variant
    if (this.variant) {
      this.variant.preselectDefaultVariant();
    }

    // hide overflow
    document.body.classList.add('hide-overflow');
  }

  // Executes when we click the plus button
  addOneQty() {
    // User cant go to more than maxQty
    if (this.quantity >= this.productJSON.maxQuantity) return;
    // TODO min qty
    this.quantity += 1;
    this.DOM.qty.innerText = this.quantity;
    this.calculatePrice();
  }

  // Executes when we click the minus button
  removeOneQty() {
    // User cant go to 0 qty
    if (this.quantity === 1) return;
    this.quantity -= 1;
    this.DOM.qty.innerText = this.quantity;
    this.calculatePrice();
  }

  // Executes when we click add to cart button
  async addToCart() {
    console.log('adding to cart');
    this.emit('showPreloader');
    // TODO: Prepare data for API
    const data = {};

    // submit product and get the new cart
    this.cart = await this.api.addProductToCart('XXX');

    this.emit('cartUpdate', this.cart);
    this.emit('hidePreloader');
    this.closeModal();
  }

  // Closed the modal and removes it from the body
  closeModal() {
    this.modalElement.remove();
    // show overflow
    document.body.classList.remove('hide-overflow');
  }

  // Closes all the accordions except the one to be opened
  closeGroupOptions(accordionToBeOpened) {
    this.accordions.forEach((accordion) => {
      if (accordionToBeOpened !== accordion) {
        accordion.close(0);
      }
    });
  }

  // Executes when we select a variant
  selectedVariant(variant) {
    // Close the first accordion (the first one is the variant)
    // this.accordions[0].close(0);
    // Update the selected variant on group options
    this.groupOptions.forEach((element) => {
      element.changeVariant(variant.id);
    });

    // recalculate price
    this.calculatePrice();
    PubSub.publish('MY TOPIC', 'hello world!');
  }

  // Executes when we select a group option
  selectedGroupOption(options) {
    this.calculatePrice();
  }

  // Calculates the final price
  calculatePrice() {
    let calculatedPrice = currency(0);
    // First set the base price. If we use a variant and a selected variant is set, use the price from the selected variant.
    // Else get the price from the initial JSON.
    // ===========================================================
    if (this.variant && this.variant.selectedOption) {
      calculatedPrice = currency(this.variant.selectedOption.price);
    } else {
      calculatedPrice = currency(this.basePrice);
    }
    console.log(`Base Price (variant): ${calculatedPrice}`);

    // For every group option we get its calculated price.
    // ===========================================================
    this.groupOptions.forEach((element) => {
      console.log(`Group option: ${element.name} Price: ${element.price}`);
      calculatedPrice = calculatedPrice.add(element.price);
    });
    console.log(`Price per item: ${calculatedPrice}`);

    // Multiply per quantity
    // ===========================================================
    calculatedPrice = calculatedPrice.multiply(this.quantity);

    // Final price
    calculatedPrice = currency(calculatedPrice, currencyFormat);

    console.log(`----------`);
    console.log(`finalPrice: ${calculatedPrice.format()}`);
    console.log('');
    this.DOM.price.innerText = calculatedPrice.format();

    // If we calculate a different price. animate the element
    if (this.price && this.price.value !== calculatedPrice.value) {
      this.animatePrice();
    }
    this.price = calculatedPrice;
  }

  animatePrice() {
    // Animate the price (clone the element, remove it, and add it again with the animating class)
    const cln = this.DOM.price.cloneNode(true);
    this.DOM.price.remove();
    this.DOM.price = this.DOM.priceContainer.appendChild(cln);

    animateCSS(this.DOM.price, 'pulse');
  }
}
