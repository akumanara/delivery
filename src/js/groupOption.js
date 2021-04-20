

export default class {
  constructor(groupOption, product) {
    console.log(groupOption);
    this.groupOption = groupOption;

    this.name = this.groupOption.name;
    this.ingredients = this.groupOption.ingredients;

    if (this.groupOption.min >= 1) {
      this.mandatoryOrOptionalText = product.texts.mandatory;
    } else {
      this.mandatoryOrOptionalText = product.texts.optional;
    }

    this.maxLimitText = `${product.texts.maxLimit} ${this.groupOption.max}`;
  }
}
