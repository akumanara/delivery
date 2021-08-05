/* eslint-disable class-methods-use-this */
import Product from './product';
import Offer from './offer';

export default class {
  constructor() {
    // Products from catalog
    this.products = [];
    this.offers = [];
    this.DOM = {
      products: document.querySelectorAll('.js-product'),
      offers: document.querySelectorAll('.js-offer'),
    };
    this.init();
  }

  init() {
    // On init we create the products from the catalogue because they already exist in html
    this.createProductsFromStoreCatalog();

    // On init we create the offers from the catalogue because they already exist in html
    this.createOffersFromStoreCatalog();

    // TODO remove this. after develoment
    // this.products[0].raiseModal();
  }

  createOffersFromStoreCatalog() {
    this.DOM.offers.forEach((offerElement) => {
      const tmpOffer = new Offer(offerElement);
      this.offers.push(tmpOffer);
    });
  }

  createProductsFromStoreCatalog() {
    this.DOM.products.forEach((productElement) => {
      const tmpProduct = new Product({
        productElement,
      });

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
