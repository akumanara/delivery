/* eslint-disable class-methods-use-this */
import Product from './product';

export default class {
  constructor() {
    // Products from catalog
    this.products = [];
    this.DOM = {
      products: document.querySelectorAll('.store-menu__product'),
    };
    this.init();
  }

  init() {
    // On init we create the product from the catalogue because they already exist in html
    this.createProductsFromStoreCatalog();

    // TODO remove this. after develoment
    // this.products[0].raiseModal();
  }

  createProductsFromStoreCatalog() {
    this.DOM.products.forEach((productElement) => {
      const tmpProduct = new Product(productElement);
      this.products.push(tmpProduct);
    });
  }

  removeInCartStatusFromAllProducts() {
    this.DOM.products.forEach((productElement) => {
      productElement.classList.remove('store-menu__product--in-cart');
    });
  }

  addInCartStatusToProduct(productID) {
    const element = document.querySelector(
      `.store-menu__product[data-product-id='${productID}']`,
    );
    if (element) {
      element.classList.add('store-menu__product--in-cart');
    }
  }
}
