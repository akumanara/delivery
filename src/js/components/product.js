import EventEmitter from 'events';
import PubSub from 'pubsub-js';
import currency from 'currency.js';
import Accordion from 'accordion-js';
import Swiper from 'swiper/bundle';
import randomstring from 'randomstring';
import autoBind from 'auto-bind';
// import Panzoom from 'panzoom';
import Panzoom from '@panzoom/panzoom';
import Hammer from 'hammerjs';
import autosize from 'autosize';
import Alert from './alert';
import API from './api';
import Variant from './productVariant';
import GroupOption from './productGroupOption';
import {
  getUOMText,
  animateCSS,
  currencyFormat,
  has,
  getFormData,
} from '../utils/helpers';
import { HandlebarsTemplate } from '../utils/handlebarTemplate';
import { store } from '../utils/store';
import texts from '../utils/texts';
import { deliveryTypes } from '../utils/enum';

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
// constructor options
// product element
// isInsideOffer
// show price
export default class extends EventEmitter {
  constructor(
    constructorData = {
      productElement: null,
      isInsideOffer: false,
      offerID: null,
      offerCategoryID: null,
    },
  ) {
    super();
    autoBind(this);

    this.element = constructorData.productElement;
    this.isInsideOffer = constructorData.isInsideOffer;
    this.offerID = constructorData.offerID;
    this.offerCategoryID = constructorData.offerCategoryID;

    // Keep a reference to this object inside the product element
    this.element.deliveryProduct = this;

    this.api = new API();
    this.init();
  }

  init() {
    // Get product id
    this.productID = this.element.dataset.productId;

    // Setup based on store menu or cart product
    if (this.element.classList.contains('cart__product')) {
      // CART PRODUCT
      // console.log('product is cart product');
      this.setupCartProduct();
    } else {
      // STORE MENU PRODUCT
      // console.log('product is store menu product');
      this.setupStoreMenuProduct();
    }
  }

  setupStoreMenuProduct() {
    this.element.addEventListener('click', this.raiseModal);

    // check if it is a market product and has quick actions
    // ==============

    const quickAddElement = this.element.querySelector(
      '.market-menu__product-quick-add-btn',
    );
    if (quickAddElement) {
      this.isMarketProduct = true;
    } else {
      this.isMarketProduct = false;
    }

    if (this.isMarketProduct) {
      if (this.element.hasAttribute('data-disable-quickadd')) {
        this.disableQuickAdd = true;
      } else {
        this.disableQuickAdd = false;
      }

      const quickPlusElement = this.element.querySelector(
        '.market-menu__product-plus-trigger',
      );
      const quickRemoveElement = this.element.querySelector(
        '.market-menu__product-minus-trigger',
      );

      if (!this.disableQuickAdd) {
        console.log('quick add is enabled');
        quickAddElement.addEventListener('click', this.quickAdd);
      }
      quickPlusElement.addEventListener('click', this.quickAdd);
      quickRemoveElement.addEventListener('click', this.quickRemove);
      this.marketQuantity = this.element.querySelector('.js-qty');
    }
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

    if (this.cartQuantity && this.isMarketProduct) {
      this.quantity = this.cartQuantity;
    }

    this.basePrice = this.productJSON.price;
    this.isAddToCartEnabled = true;

    this.uom = this.productJSON.uom;
    this.uomstep = this.productJSON.uomstep;

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
      isMarketProduct: this.isMarketProduct,
    };

    if (this.isInsideOffer) this.templateData.isInsideOffer = true;
  }

  // Creates the modal from the template object
  createModal() {
    // create the template
    const html = HandlebarsTemplate(this.templateData);
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
      backToOffer: this.modalElement.querySelector(
        '.product-modal__back-to-offer',
      ),
      closeBtn: this.modalElement.querySelector('.product-modal__close-btn'),
      zoomImagesContainer: document.querySelector(
        '.product-modal__zoom-images',
      ),
      mask: this.modalElement.querySelector('.product-modal__window-mask'),
    };

    // Add event listeners
    if (!this.isInsideOffer) {
      this.DOM.plusBtn.addEventListener('click', this.addOneQty);
      this.DOM.minusBtn.addEventListener('click', this.removeOneQty);
    } else {
      this.DOM.backToOffer.addEventListener('click', this.closeModal);
    }

    this.DOM.closeBtn.addEventListener('click', this.closeModal);
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
    this.modalElement
      .querySelectorAll('.product-modal__slide-img')
      .forEach((img) => {
        this.zoomImage(img.parentElement);
      });

    // Bind close btn

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

    // show quantity with regards to uom and uom step
    this.displayQuantity();

    // hide overflow
    document.body.classList.add('hide-overflow');
  }

  zoomImage(imgContainer) {
    // 1. setup event listener on tap and on pinch (with hammerjs).
    // 2. on tap, create a clone image but with fixed viewport and on same position
    // 3. setup Panzoom on cloned image and zoom a bit for effect
    // 4. setup an event listener for zoom end or click and if the scale is smaller than 1, remove the cloned image and kill panzoom?

    // 1. setup event listener on tap.

    const init = () => {
      // 2. on tap, create a clone image but with fixed viewport and on same position
      const clone = imgContainer.cloneNode(true);
      clone.classList.add('product-modal__zoom-image');
      const viewportOffset = imgContainer.getBoundingClientRect();
      const { top } = viewportOffset;
      const { left } = viewportOffset;
      clone.style.top = `${top}px`;
      clone.style.left = `${left}px`;
      this.DOM.zoomImagesContainer.appendChild(clone);
      this.DOM.mask.classList.add('active');

      // 3. setup Panzoom on cloned image and zoom a bit for effect
      const cloneImg = clone.querySelector('img');
      const panzoom = Panzoom(cloneImg, {
        animate: true,
        maxScale: 3,
        step: 0.6,
        overflow: 'visible',
      });
      setTimeout(() => {
        panzoom.zoom(1.5, { animate: true });
      }, 100);

      // 4. setup event listeners for destroy
      //  a. zoom end < 1
      //  b. click on img
      //  c. pan more than 200 on any direction
      //  d. click on mask
      const destroy = () => {
        panzoom.reset({ animate: true });
        this.DOM.mask.classList.remove('active');
        panzoom.destroy();
        clone.remove();
        this.DOM.mask.removeEventListener('click', destroy);
      };

      this.DOM.mask.addEventListener('click', destroy);
      cloneImg.addEventListener('click', destroy);
      cloneImg.addEventListener('panzoomend', (event) => {
        if (event.detail.scale < 1) {
          destroy();
        }
      });

      cloneImg.addEventListener('panzoompan', (event) => {
        if (
          event.detail.x < -200 ||
          event.detail.x > 200 ||
          event.detail.y < -200 ||
          event.detail.y > 200
        ) {
          destroy();
        }
      });
    };
    imgContainer.addEventListener('click', init);
    const hammertime = new Hammer(imgContainer);
    hammertime.get('pinch').set({ enable: true });
    hammertime.on('pinchend', init);
  }

  // Executes when we click the plus button
  addOneQty() {
    // User cant go to more than maxQty
    if (
      this.quantity >= this.productJSON.maxQuantity &&
      this.productJSON.maxQuantity !== 0
    )
      return;
    this.quantity += 1;
    this.displayQuantity();
    this.calculatePrice();
  }

  // Executes when we click the minus button
  removeOneQty() {
    // User cant go to 0 qty
    if (this.quantity === 1) return;
    this.quantity -= 1;
    this.displayQuantity();
    this.calculatePrice();
  }

  setInCart(cartData) {
    this.element.classList.add('in-cart');

    if (this.isMarketProduct) {
      this.cartQuantity = Number.parseInt(cartData.quantity);
      this.uom = cartData.uom;
      this.uomstep = Number.parseFloat(cartData.uomstep);
      this.cartIndex = Number.parseInt(cartData.cartIndex);
      this.displayMarketQuantity();
    }
  }

  removeInCart() {
    this.element.classList.remove('in-cart');
    this.cartQuantity = null;
    this.uom = null;
    this.uomstep = null;
  }

  displayMarketQuantity() {
    const uomText = getUOMText(this.cartQuantity, this.uom, this.uomstep);
    if (this.marketQuantity) {
      this.marketQuantity.innerHTML = uomText;
    }
  }

  // Closed the modal and removes it from the body
  closeModal() {
    this.modalElement.remove();
    this.DOM.zoomImagesContainer.remove();
    // show overflow
    document.body.classList.remove('hide-overflow');
    // if inside an offer, emit an event
    if (this.isInsideOffer) {
      this.emit('closed');
    }
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
    let ingredientsPrice = currency(0);
    this.groupOptions.forEach((element) => {
      console.log(`Group option: ${element.name} Price: ${element.price}`);
      ingredientsPrice = ingredientsPrice.add(element.price);
    });
    calculatedPrice = calculatedPrice.add(ingredientsPrice);
    this.ingredientsPrice = ingredientsPrice;
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
    this.priceWithoutIngredients = this.price.subtract(this.ingredientsPrice);
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
    let feasibility = !this.groupOptions.some((el) => !el.cartFeasibility);

    // An to address einai unsupported. to koupmi add to basket prepei na einai fake disabled kai onclick na sou vgazei B level alert.
    if (
      !store.app.addressComponent.isSelectedAddressSupported &&
      store.app.deliveryType.deliveryMethod === deliveryTypes.DELIVERY
    ) {
      console.log('unsupported address');
      feasibility = false;
    }

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
    this.displayQuantity();
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

  displayQuantity() {
    const uomText = getUOMText(this.quantity, this.uom, this.uomstep);
    if (this.DOM.qty) {
      this.DOM.qty.innerHTML = uomText;
    }
  }

  // STORE MENU API FUNCTIONS
  // ==============================================================================================
  // ==============================================================================================

  // Executes when we click on an product from the product list
  async raiseModal() {
    // An den yparxei selected address. na deiksoume to notify modal kai oxi to product modal.
    if (
      !store.app.addressComponent.selectedAddress &&
      store.app.deliveryType.deliveryMethod === deliveryTypes.DELIVERY
    ) {
      store.app.addressComponent.showNotifyModal();
      return;
    }

    PubSub.publish('show_loader');
    this.modalInitialized = false;

    try {
      let result;
      if (!this.isInsideOffer) {
        result = await this.api.getProduct(this.productID);
      } else {
        result = await this.api.getProductInOffer(
          this.productID,
          this.offerID,
          this.offerCategoryID,
        );
      }

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
    } catch (error) {
      console.log(error);
      const a = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5, // time until it closes
        type: 'error', // or 'error'
        showTimer: false, // show the timer or not
      });
    }

    PubSub.publish('hide_loader');
  }

  getProductFormData() {
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
    return bodyFormData;
  }

  // Executes when we click add to cart button
  async addToCart() {
    // If we have unsupported address, show error alert
    if (
      !store.app.addressComponent.isSelectedAddressSupported &&
      store.app.deliveryType.deliveryMethod === deliveryTypes.DELIVERY
    ) {
      store.app.addressComponent.showUnsupportedAddressAlert();
    }
    if (!this.isAddToCartEnabled) return;
    console.log('adding to cart');
    PubSub.publish('show_loader');

    // Get the form data for this product
    const bodyFormData = this.getProductFormData();

    if (this.isInsideOffer) {
      this.emit('added', this);
    } else {
      // Submit product and get the new cart
      const cart = await this.api.addProductToCart(bodyFormData);

      // Publish the event to the cart with the data
      PubSub.publish('cart_update', cart);
    }
    this.closeModal();
    PubSub.publish('hide_loader');
  }

  async quickAdd(event) {
    event.stopPropagation();
    console.log('quick adding one');

    PubSub.publish('show_loader');
    const data = {
      itemGroupId: this.productID,
      itemQuantity: 1,
    };

    const bodyformData = getFormData(data);

    // after we call the api we get the updated cart
    const cart = await this.api.quickAddProduct(bodyformData);

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);
    PubSub.publish('hide_loader');
  }

  async quickRemove(event) {
    event.stopPropagation();
    console.log('quick removing one');

    PubSub.publish('show_loader');
    const data = {
      itemGroupId: this.productID,
      itemQuantity: 1,
    };

    // after we call the api we get the updated cart
    const cart = await this.api.quickRemoveProduct(data);

    // Publish the event to the cart with the data
    PubSub.publish('cart_update', cart);
    PubSub.publish('hide_loader');
  }

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
