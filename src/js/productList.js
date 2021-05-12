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
    this.HandlebarsTemplate = Handlebars.compile(source);

    // On init we create the product from the catalogue because they already exist in html
    this.createProductsFromStoreCatalog();

    // TODO remove this. after develoment
    // this.products[0].raiseModal();
  }

  createProductsFromStoreCatalog() {
    document
      .querySelectorAll('.store-menu__product')
      .forEach((productElement) => {
        const tmpProduct = new Product(productElement, this.HandlebarsTemplate);
        this.products.push(tmpProduct);
      });
  }

  createProductsFromCart() {
    console.log(this);
    // TODO
    // document
    //   .querySelectorAll('.store-menu__product')
    //   .forEach((productElement) => {
    //     const tmpProduct = new Product(productElement, this.HandlebarsTemplate);
    //     this.products.push(tmpProduct);
    //   });
  }
}
