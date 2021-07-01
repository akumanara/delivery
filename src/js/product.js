import PubSub from 'pubsub-js';
import currency from 'currency.js';
import Accordion from 'accordion-js';
import Swiper from 'swiper/bundle';
import randomstring from 'randomstring';
import autoBind from 'auto-bind';
// import Panzoom from 'panzoom';
import autosize from 'autosize';
import Alert from './alert';
import API from './api';
import Variant from './variant';
import GroupOption from './groupOption';
import { animateCSS, currencyFormat, has, getFormData } from './utils/utils';
import { HandlebarsTemplate } from './utils/handlebarTemplate';
import { store } from './utils/store';
import texts from './utils/texts';

// Rules and Notes
// ===========================================
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

export default class {
  constructor(productElement) {
    autoBind(this);
    this.template = HandlebarsTemplate;
    this.element = productElement;
    this.api = new API();
    this.init();
  }

  init() {
    // Get product id
    this.productID = this.element.dataset.productId;

    // Setup based on store menu or cart product
    if (this.element.classList.contains('cart__product')) {
      // CART PRODUCT
      console.log('product is cart product');
      this.setupCartProduct();
    } else {
      // STORE MENU PRODUCT
      console.log('product is store menu product');
      this.setupStoreMenuProduct();
    }
  }

  setupStoreMenuProduct() {
    this.element.addEventListener('click', this.raiseModal);
  }

  setupCartProduct() {
    // Get the cart index
    this.cartIndex = this.element.dataset.cartIndex;

    // Edit
    this.element
      .querySelector('.cart__product-actions-edit')
      .addEventListener('click', this.cartRaiseModal);
    // Delete
    this.element
      .querySelector('.cart__product-actions-delete')
      .addEventListener('click', this.cartDeleteProduct);
    // Plus one
    this.element
      .querySelector('.cart__product-actions-quantity-plus-trigger')
      .addEventListener('click', this.cartPlusOneProduct);
    // Minus one
    this.element
      .querySelector('.cart__product-actions-quantity-minus-trigger')
      .addEventListener('click', this.cartMinusOneProduct);
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
    this.isAddToCartEnabled = true;

    // Create the variant if exists
    // ===========================================================
    if (has(this.productJSON, 'variants') && this.productJSON.variants.length) {
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
        tmpGroupOption.on(
          'checkAddToCartFeasibility',
          this.checkAddToCartFeasibility,
        );
        this.groupOptions.push(tmpGroupOption);
      });
    }

    // Create a random string for the popup id
    // ===========================================================
    const randomString = randomstring.generate({
      length: 7,
      charset: 'alphabetic',
    });

    // Check variable to see if we need to show options div
    // We show the options div if we have variant or at least one group option
    // ===========================================================
    let showOptionsDiv = false;
    if (this.groupOptions.length > 0) {
      showOptionsDiv = true;
    }
    if (this.variant) {
      showOptionsDiv = true;
    }

    // Create object used for templating
    // ===========================================================
    this.templateData = {
      randomString,
      name: this.productJSON.name,
      images: this.productJSON.images,
      comments: this.productJSON.comments,
      large_description: this.productJSON.large_description,
      variant: this.variant,
      groupOptions: this.groupOptions,
      basePrice: this.basePrice,
      storeName: store.context.storeName,
      showOptionsDiv,
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

    // Save the DOM elements for later use
    this.DOM = {
      price: this.modalElement.querySelector('.js-product-modal-final-price'),
      priceContainer: this.modalElement.querySelector(
        '.product-modal__add-to-cart-btn-price',
      ),
      qty: this.modalElement.querySelector('.js-product-modal-qty'),
      plusBtn: this.modalElement.querySelector(
        '.product-modal__add-to-cart-qty-plus-trigger',
      ),
      minusBtn: this.modalElement.querySelector(
        '.product-modal__add-to-cart-qty-minus-trigger',
      ),
      addToCartBtn: this.modalElement.querySelector(
        '.product-modal__add-to-cart-btn',
      ),
      comments: this.modalElement.querySelector(
        '.product-modal__comments-textarea',
      ),
    };

    // Add event listeners
    this.DOM.plusBtn.addEventListener('click', this.addOneQty);
    this.DOM.minusBtn.addEventListener('click', this.removeOneQty);
    this.DOM.addToCartBtn.addEventListener('click', this.addToCart);

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

    // hide nav bullets if one slide
    if (this.slider.slides.length === 1) {
      sliderElement
        .querySelector('.swiper-pagination-bullets')
        .classList.add('hide-nav-bullets');
    }

    // Zoom
    // this.modalElement
    //   .querySelectorAll('.product-modal__slide-img')
    //   .forEach((img) => {
    //     img.addEventListener('click', () => {
    //       this.zoomMode(img);
    //     });
    //   });

    // Bind close btn
    this.modalElement
      .querySelector('.product-modal__close-btn')
      .addEventListener('click', this.closeModal);

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

    autosize(this.modalElement.querySelectorAll('textarea'));

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
    if (
      this.quantity >= this.productJSON.maxQuantity &&
      this.productJSON.maxQuantity !== 0
    )
      return;
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
  }

  // Executes when we select a group option
  selectedGroupOption(options) {
    this.calculatePrice();
  }

  // Calculates the final price
  calculatePrice() {
    // Before we initalize the modal we dont need those checks.
    if (!this.modalInitialized) return;
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
    // calculatedPrice = currency(calculatedPrice, currencyFormat);

    console.log(`----------`);
    console.log(`finalPrice: ${currencyFormat(calculatedPrice)}`);
    console.log('');
    this.DOM.price.innerText = currencyFormat(calculatedPrice);

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

  disableAddToCart() {
    console.log('disableAddToCart');
    this.isAddToCartEnabled = false;
    this.DOM.addToCartBtn.classList.add(
      'product-modal__add-to-cart-btn--disabled',
    );
  }

  enableAddToCart() {
    console.log('enableAddToCart');
    this.isAddToCartEnabled = true;
    this.DOM.addToCartBtn.classList.remove(
      'product-modal__add-to-cart-btn--disabled',
    );
  }

  checkAddToCartFeasibility() {
    // Before we initalize the modal we dont need those checks.
    if (!this.modalInitialized) return;
    console.log('checking add to cart feasibility');
    const feasibility = !this.groupOptions.some((el) => !el.cartFeasibility);

    // this.groupOptions.forEach((el) => {
    //   console.log(el.cartFeasibility);
    // });

    if (feasibility) {
      this.enableAddToCart();
    } else {
      this.disableAddToCart();
    }
  }

  // zoomMode(img) {
  //   console.log(img);
  //   // get

  //   // Panzoom(img);
  // }

  preselectDefaultIngredients() {
    // group options
    this.groupOptions.forEach((groupOption) => {
      groupOption.preselectDefaultIngredients();
    });
  }

  preselectCartValues() {
    // debugger;
    console.log('preselecting values');
    // Qty
    this.quantity = this.productJSON.quantity;
    this.DOM.qty.innerText = this.quantity;
    // variant if exists
    if (this.variant) {
      this.variant.preselectCartValue();
    }
    // group options
    this.groupOptions.forEach((groupOption) => {
      groupOption.preselectCartValue();
    });

    // this.calculatePrice();
  }

  // STORE MENU API FUNCTIONS
  // ==============================================================================================
  // ==============================================================================================

  // Executes when we click on an product from the product list
  async raiseModal() {
    PubSub.publish('show_loader');
    this.modalInitialized = false;
    // fetch the html for the modal
    await this.api
      .getProduct(this.productID)
      .then((result) => {
        this.productJSON = result;
        // Create all the objects belonging to the product
        this.createProduct();
        // Create the modal (template) from the data and init it
        this.createModal();
        // Init the modal
        this.initModal();
        // Preselect default ingredients
        this.preselectDefaultIngredients();
        // Set the modal initialized to true
        this.modalInitialized = true;
        // Check group options to see if we are ok with add to cart btn
        this.checkAddToCartFeasibility();
        // Calculate the final price
        this.calculatePrice();
      })
      .catch((error) => {
        console.log(error);
        const a = new Alert({
          text: texts.genericErrorMessage,
          timeToKill: 5, // time until it closes
          type: 'error', // or 'error'
          showTimer: false, // show the timer or not
        });
      });

    PubSub.publish('hide_loader');
  }

  // Executes when we click add to cart button
  async addToCart() {
    if (!this.isAddToCartEnabled) return;
    console.log('adding to cart');
    PubSub.publish('show_loader');

    // Prepare data for API
    const data = {
      itemGroupId: this.productID,
      order_product_comments: this.DOM.comments.value,
      itemQuantity: this.quantity,
    };

    // If it has variant
    if (this.variant) {
      data.itemId = this.variant.selectedOption.id;
    }

    // if the product is cart product then also send the cart index
    if (this.cartIndex) {
      data.cartId = this.cartIndex;
    }

    // Create form data from json
    const bodyFormData = getFormData(data);

    // Create form data array with keys
    this.groupOptions.forEach((groupOption) => {
      groupOption.groupOption.ingredients.forEach((ingredient) => {
        const key = ingredient.id;
        let value = 0;
        if (groupOption.selectedOptions.includes(ingredient)) {
          value = 1;
        }
        bodyFormData.append(`ingredient[${key}]`, value);
      });
    });

    // Submit product and get the new cart
    const cart = await this.api.addProductToCart(bodyFormData);

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);

    this.closeModal();
    PubSub.publish('hide_loader');
  }

  // async quickAdd() {
  //   PubSub.publish('show_loader');
  //   const data = {
  //     itemGroupId: this.productID,
  //     itemQuantity: 1,
  //   };

  //   // after we call the api we get the updated cart
  //   const cart = await this.api.quickAddProduct(this.data);

  //   // TODO update the cart
  //   PubSub.publish('hide_loader');
  // }

  // CART API FUNCTIONS
  // ==============================================================================================
  // ==============================================================================================
  async cartRaiseModal() {
    console.log('cartRaiseModal');
    PubSub.publish('show_loader');
    this.modalInitialized = false;
    // fetch the product in json
    await this.api
      .getProductFromCart(this.productID, this.cartIndex)
      .then((result) => {
        this.productJSON = result;
        // Create all the objects belonging to the product
        this.createProduct();
        // Create the modal (template) from the data and init it
        this.createModal();
        // Init the modal
        this.initModal();
        // Preselect values
        this.preselectCartValues();
        // Set the modal initialized to true
        this.modalInitialized = true;
        // Check group options to see if we are ok with add to cart btn
        this.checkAddToCartFeasibility();
        // Calculate the final price
        this.calculatePrice();
      })
      .catch((error) => {
        console.log(error);
        const a = new Alert({
          text: texts.genericErrorMessage,
          timeToKill: 5, // time until it closes
          type: 'error', // or 'error'
          showTimer: false, // show the timer or not
        });
      });

    PubSub.publish('hide_loader');
  }

  async cartDeleteProduct() {
    PubSub.publish('show_loader');
    // fetch the html for the modal
    const cart = await this.api.deleteProductFromCart(this.cartIndex);

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);

    PubSub.publish('hide_loader');
  }

  async cartPlusOneProduct() {
    PubSub.publish('show_loader');
    // fetch the html for the modal
    const cart = await this.api.plusOneProductFromCart(this.cartIndex);

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);

    PubSub.publish('hide_loader');
  }

  async cartMinusOneProduct() {
    PubSub.publish('show_loader');
    // fetch the html for the modal
    const cart = await this.api.minusOneProductFromCart(this.cartIndex);

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);

    PubSub.publish('hide_loader');
  }
}
