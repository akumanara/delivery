import Product from './product';

export default class {
  constructor() {
    // Products from catalog
    this.products = [];

    this.init();
  }

  init() {
    // On init we create the product from the catalogue because they already exist in html
    this.createProductsFromStoreCatalog();

    // TODO remove this. after develoment
    // this.products[0].raiseModal();
  }

  createProductsFromStoreCatalog() {
    document
      .querySelectorAll('.store-menu__product')
      .forEach((productElement) => {
        const tmpProduct = new Product(productElement);
        this.products.push(tmpProduct);
      });
  }
}
