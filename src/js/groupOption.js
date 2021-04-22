import EventEmitter from 'events';
import currency from 'currency.js';
import texts from './texts';

export default class extends EventEmitter {
  constructor(groupOption) {
    super();
    // Save the initial data from the JSON
    this.groupOption = groupOption;

    // Used for templating
    this.name = this.groupOption.name;
    this.ingredients = this.groupOption.ingredients;
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
  }

  init(element) {
    // Get the element of the variants (accordion)
    this.element = element;

    // Get the elements variant options
    this.optionsElements = this.element.querySelectorAll(
      '.product-modal__option-item',
    );

    // Map the elements to the ingredients array
    this.groupOption.ingredients.forEach((ingredient, index) => {
      ingredient.element = this.optionsElements[index];
      ingredient.priceElement = ingredient.element.querySelector(
        '.js-price-value',
      );
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

    // UpdateTopText in case preselected added stuff
    this.updateTopText();

    // Check if minimum is satisfied
    this.checkMinimumIngredientsSatisfied();
  }

  optionClicked(option) {
    if (!this.selectedOptions.includes(option)) {
      // the option is NOT selected.
      if (this.selectedOptions.length < this.max) {
        // we havent reached max. Select the option
        this.selectOption(option);
      } else {
        // we have reached max. Deselect if max = 1 else do nothing
        if (this.max === 1) {
          // Deselect the previous one and select the one clicked.
          this.deselectOption(this.selectedOptions[0]);
          this.selectOption(option);
        }
        return;
      }
    } else {
      // The user clicked on an item that is already selected. Deselect it
      this.deselectOption(option);
    }

    this.updateTopText();

    // Check if minimum is satisfied and add/remove has error class
    this.checkMinimumIngredientsSatisfied();
    if (!this.minimumIngredientsSatisfied) {
      this.DOM.topText.classList.add('has-error');
    } else {
      this.DOM.topText.classList.remove('has-error');
    }

    // Calculate group option price
    this.calculateGroupOptionPrice();

    // Emit to the product class
    this.emit('selection', this.selectedOptions);
  }

  updateTopText() {
    // Change the upper text with the selected options or if empty show the optional/mandatory text
    let textToDisplay;
    if (this.selectedOptions.length > 0) {
      textToDisplay = this.selectedOptions.map((item) => item.name).join(', ');
    } else {
      textToDisplay = this.mandatoryOrOptionalText;
    }
    this.element.querySelector(
      '.product-modal__option-header-top',
    ).innerText = textToDisplay;
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

  checkMinimumIngredientsSatisfied() {
    if (this.selectedOptions.length < this.min) {
      this.minimumIngredientsSatisfied = false;
    } else {
      this.minimumIngredientsSatisfied = true;
    }
  }

  preselectDefaultIngredients() {
    this.groupOption.ingredients.forEach((ingredient) => {
      // TODO numeric ingredients and maybe remove cast
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
      element.priceElement.innerText = element.price[this.selectedVariantID];
    });
  }
}
