export default class {
  constructor(variants, product) {
    console.log(variants);
    this.variants = variants;
    this.product = product;
    this.name = product.texts.variantName;
    this.mandatoryOrOptionalText = product.texts.mandatory;
    this.maxLimitText = `${product.texts.maxLimit} 1`;
  }

  init() {}
}
