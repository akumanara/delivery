import Product from './product';

export default class extends Product {
  constructor(productElement, HandlebarsTemplate) {
    super(productElement, HandlebarsTemplate);
    this.hi = 'l';
    console.log(this.hi);
  }
}
