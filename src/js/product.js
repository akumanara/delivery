import EventEmitter from 'events';
import Accordion from 'accordion-js';
import Swiper from 'swiper/bundle';
import randomstring from 'randomstring';
import autoBind from 'auto-bind';
import API from './api';
import Variant from './variant';
import GroupOption from './groupOption';

export default class extends EventEmitter {
  constructor(productElement, template) {
    super();
    autoBind(this);
    // Data the product might need
    // TODO: add combo / offers

    this.template = template;
    this.element = productElement;
    this.api = new API();

    this.init();
  }

  init() {
    // setup event listeners
    this.element.addEventListener('click', this.onClick);
  }

  async onClick() {
    this.emit('showPreloader');
    // fetch the html for the modal
    this.productJSON = await this.api.getProductModal(this.modalURL);

    // Create all the objects belonging to the product
    this.createProduct();
    // Create the modal (template) from the data and init it
    this.createModal();
    // Init the modal
    this.initModal();

    this.emit('hidePreloader');
  }

  // used for variants and group options
  createProduct() {
    // Create the variant if exists
    // ===========================================================
    if (Object.prototype.hasOwnProperty.call(this.productJSON, 'variants')) {
      console.log('product has variants');
      this.variant = new Variant(this.productJSON.variants);
      this.variant.on('selection', this.selectedVariant);
    }

    // Create the group options objects
    // ===========================================================
    this.groupOptions = [];
    if (
      Object.prototype.hasOwnProperty.call(
        this.productJSON,
        'ingredient_categories',
      )
    ) {
      console.log('product has at least one group option');
      // for every group option
      this.productJSON.ingredient_categories.forEach((groupOption) => {
        const tmpGroupOption = new GroupOption(groupOption);
        this.groupOptions.push(tmpGroupOption);
      });
    }

    // Create a random string for the popup id
    // ===========================================================
    const randomString = randomstring.generate({
      length: 7,
      charset: 'alphabetic',
    });

    // Append stuff on the json for the templating
    // ===========================================================
    this.productJSON.productInformation = {};
    this.productJSON.productInformation.randomString = randomString;
    this.productJSON.productInformation.variant = this.variant;
    this.productJSON.productInformation.groupOptions = this.groupOptions;
  }

  createModal() {
    // create the template
    const html = this.template(this.productJSON);
    document.body.insertAdjacentHTML('beforeend', html);
    this.modalElement = document.querySelector(
      `.${this.productJSON.productInformation.randomString}`,
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

    // setup Variant
    if (this.variant) {
      const variantElement = this.modalElement.querySelector(
        '.js-product-modal__option-variant',
      );
      this.variant.init(variantElement);
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

    // hide overflow
    document.body.classList.add('hide-overflow');
  }

  closeModal() {
    this.modalElement.remove();
    // show overflow
    document.body.classList.remove('hide-overflow');
  }

  closeGroupOptions(accordionToBeOpened) {
    this.accordions.forEach((accordion) => {
      if (accordionToBeOpened !== accordion) {
        accordion.close(0);
      }
    });
  }

  selectedVariant(variant) {
    // TODO change prices on group options
    // recalculate price
    this.calculatePrice();
  }

  calculatePrice() {
    // TODO add a math library (https://mathjs.org/)
    let calculatedPrice;
    // First set the base price. If we use a variant and a selected variant is set, use the price from the selected variant.
    // Else get the price from the initial JSON.
    // ===========================================================
    if (this.variant && this.variant.selectedOption) {
      calculatedPrice = this.variant.selectedOption.price;
    } else {
      calculatedPrice = this.productJSON.price;
    }

    console.log(calculatedPrice);
  }
}
