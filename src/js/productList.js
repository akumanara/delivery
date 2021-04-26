import Handlebars from 'handlebars';
import Product from './product';

export default class {
  constructor() {
    // Products from catalog
    this.products = [];
    // Products from cart
    this.cartProducts = [];

    this.init();
  }

  init() {
    // create the handlebar template
    const source = document.getElementById('entry-template').innerHTML;
    const HandlebarsTemplate = Handlebars.compile(source);

    document
      .querySelectorAll('.store-menu__product')
      .forEach((productElement) => {
        const tmpProduct = new Product(productElement, HandlebarsTemplate);
        this.products.push(tmpProduct);
      });
    this.products[0].onClick();
  }
}
