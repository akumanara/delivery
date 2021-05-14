import EventEmitter from 'events';
import currency from 'currency.js';
import texts from './texts';
import { currencyFormat } from './utils';

export default class extends EventEmitter {
  constructor(groupOption) {
    super();
    // Save the initial data from the JSON
    this.groupOption = groupOption;

    // Used for templating
    this.name = this.groupOption.name;

    if (this.groupOption.min >= 1) {
      this.mandatoryOrOptionalText = texts.mandatory;
    } else {
      this.mandatoryOrOptionalText = texts.optional;
    }
    this.maxLimitText = `${texts.maxLimit} ${this.groupOption.max}`;
    this.selectedOptions = [];
    this.max = this.groupOption.max;
    this.min = this.groupOption.min;
    this.price = 0;
    // The json data has 0 key when you dont have a selected variant
    this.selectedVariantID = '0';

    this.cartFeasibility = false;
  }

  init(element) {
    // Get the element (accordion)
    this.element = element;
    // Get the elements options
    const optionsElements = this.element.querySelectorAll(
      '.product-modal__option-item',
    );

    // Map the elements to the ingredients array
    this.groupOption.ingredients.forEach((ingredient, index) => {
      ingredient.element = optionsElements[index];
      ingredient.priceElement =
        ingredient.element.querySelector('.js-price-value');
    });

    // Add event listeners on the dom elements
    this.groupOption.ingredients.forEach((option) => {
      option.element.addEventListener('click', () => {
        this.optionClicked(option);
      });
    });

    // Get DOM so we dont query all the time
    this.DOM = {
      topText: this.element.querySelector('.product-modal__option-header-top'),
    };

    // Preselect
    this.preselectDefaultIngredients();

    // Check for text
    this.checkAddToCartFeasibility();
  }

  optionClicked(option) {
    // We handle the logic of what happens when we click on an item.
    // After the function we will have selected or deselected or done nothing.
    this.handleOptionClickedLogic(option);

    // Check add to cart feasibility
    this.checkAddToCartFeasibility();

    // Calculate group option price
    this.calculateGroupOptionPrice();

    // Emit to the product class
    this.emit('selection', this.selectedOptions);
  }

  handleOptionClickedLogic(option) {
    if (this.selectedOptions.includes(option)) {
      // The user clicked on an item that is selected, so we deselect it and return.
      this.deselectOption(option);
      return;
    }

    if (this.selectedOptions.length < this.max) {
      // We havent reached max. Select the option
      this.selectOption(option);
    } else if (this.selectedOptions.length === this.max && this.max === 1) {
      // We have reached max and max is 1.
      // Deselect the previous one and select the one clicked.
      this.deselectOption(this.selectedOptions[0]);
      this.selectOption(option);
    } else {
      // We have reached max and max is greater than 1.
      // Maybe alert the user?
    }
  }

  updateTopText() {
    // Change the upper text with the selected options or if empty show the optional/mandatory text
    let textToDisplay;
    if (this.selectedOptions.length > 0) {
      textToDisplay = this.selectedOptions.map((item) => item.name).join(', ');
    } else {
      textToDisplay = this.mandatoryOrOptionalText;
    }
    this.element.querySelector('.product-modal__option-header-top').innerText =
      textToDisplay;
  }

  selectOption(option) {
    // add from selected options array
    this.selectedOptions.push(option);
    option.element.classList.add('product-modal__option-item--active');
  }

  deselectOption(option) {
    // remove from selected options array
    this.selectedOptions.splice(this.selectedOptions.indexOf(option), 1);
    option.element.classList.remove('product-modal__option-item--active');
  }

  preselectDefaultIngredients() {
    this.groupOption.ingredients.forEach((ingredient) => {
      if (Number(ingredient.default) === 1) {
        this.selectOption(ingredient);
      }
    });
  }

  calculateGroupOptionPrice() {
    let calculatedPrice = currency(0);
    this.selectedOptions.forEach((ingredient) => {
      if (Number(ingredient.default) === 1) {
        // TODO numeric ingredients
        // It is default ingredient. We dont add to the price
        return;
      }
      calculatedPrice = calculatedPrice.add(
        currency(ingredient.price[this.selectedVariantID]),
      );
    });
    this.price = calculatedPrice;
  }

  changeVariant(variantID) {
    this.selectedVariantID = variantID;

    // update texts on ui
    this.updatePricesOnUI();

    // Recalculate price based on the new variant
    this.calculateGroupOptionPrice();
  }

  updatePricesOnUI() {
    this.groupOption.ingredients.forEach((element) => {
      element.priceElement.innerText = currencyFormat(
        element.price[this.selectedVariantID],
      );
    });
  }

  checkAddToCartFeasibility() {
    // do we satisfy min number?
    if (this.selectedOptions.length < this.min) {
      this.cartFeasibility = false;
      this.DOM.topText.classList.add('has-error');
      this.emit('disableAddToCart');
    } else {
      this.cartFeasibility = true;
      this.DOM.topText.classList.remove('has-error');
      this.emit('enableAddToCart');
    }

    this.updateTopText();
  }
}
