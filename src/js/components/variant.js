import EventEmitter from 'events';
import texts from '../utils/texts';
import { has } from '../utils/helpers';

export default class extends EventEmitter {
  constructor(variants) {
    super();
    this.variants = variants;
    this.name = texts.variantName;
    this.mandatoryOrOptionalText = texts.mandatory;
    this.maxLimitText = texts.maxLimit('1');
  }

  init(element) {
    // Get the element of the variants (accordion)
    this.element = element;
    // Get the elements variant options
    this.optionsElements = this.element.querySelectorAll(
      '.product-modal__option-item',
    );
    // Map the elements to the variants array
    this.variants.forEach((variant, index) => {
      variant.element = this.optionsElements[index];
    });

    // Add event listeners on the dom elements
    this.variants.forEach((option) => {
      option.element.addEventListener('click', () => {
        this.selectOption(option);
      });
    });
  }

  preselectDefaultVariant() {
    // Preselect the first option
    this.selectOption(this.variants[0]);
  }

  selectOption(option) {
    if (this.selectedOption === option) {
      // user clicked on the selected option. Do nothing
      return;
    }
    // If we have previously selected and option remove the active class from it
    if (this.selectedOption) {
      this.selectedOption.element.classList.remove(
        'product-modal__option-item--active',
      );
    }

    this.selectedOption = option;
    // Add class to the selected option
    this.selectedOption.element.classList.add(
      'product-modal__option-item--active',
    );

    // Change the upper text with the selected option
    this.element.querySelector('.product-modal__option-header-top').innerText =
      this.selectedOption.name;

    // Emit to the product class
    this.emit('selection', this.selectedOption);
  }

  preselectCartValue() {
    this.variants.forEach((element) => {
      if (has(element, 'selected') && element.selected === true) {
        this.selectOption(element);
      }
    });
  }
}
