/* eslint-disable class-methods-use-this */
import autoBind from 'auto-bind';
import { throttle } from 'lodash';
import Product from './product';
import Offer from './offer';
import { store } from '../utils/store';
import API from './api';
import { MarketProductTemplate } from '../utils/handlebarTemplate';

export default class {
  constructor() {
    autoBind(this);
    this.api = new API();
    // Products from catalog
    this.products = [];
    this.offers = [];
    this.DOM = {
      products: document.querySelectorAll('.js-product'),
      offers: document.querySelectorAll('.js-offer'),
    };

    this.init();
    // AB load more products
    if (store.context.isLoadMoreOffers === true) {
      this.initLoadMoreOffers();
    }
  }

  init() {
    // On init we create the products from the catalogue because they already exist in html
    this.createProductsFromStoreCatalog();

    // On init we create the offers from the catalogue because they already exist in html
    this.createOffersFromStoreCatalog();
  }

  initLoadMoreOffers() {
    this.isRequesting = false;
    this.isCheckingActive = true;
    this.productsOffest = 20;
    this.productsOffestStep = 20;
    this.checkScroll = throttle(this.checkScroll, 300);
    this.DOM.loadMoreContainer = document.querySelector(
      '.market-menu__products',
    );

    document.addEventListener('scroll', this.checkScroll);
  }

  checkScroll() {
    // Call in progress. dont check scroll
    if (this.isRequesting) return;

    // Last call results was empty. do not check scroll
    if (!this.isCheckingActive) return;

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      // you're at the bottom of the page
      // console.log('youre at the bottom of the page');
      this.loadMoreOffers();
    }
  }

  async loadMoreOffers() {
    this.isRequesting = true;
    const result = await this.api.getMoreOffers(
      store.context.storeID,
      this.productsOffest,
    );

    console.log(result);

    // There are no more products.
    if (result.products.length === 0) {
      this.isRequesting = false;
      this.isCheckingActive = false;
      document.removeEventListener('scroll', this.checkScroll);
      return;
    }

    // Create the row container
    const container = document.createElement('div');
    container.classList.add('market-menu__product-row');
    container.classList.add(
      `market-menu__product-row--offset-${this.productsOffest}`,
    );
    this.DOM.loadMoreContainer.appendChild(container);
    result.products.forEach((result) => {
      const templateData = {
        id: result.id,
        name: result.name,
        price: result.price,
        badgeCopy: result.badgeCopy,
        image: result.image,
        smallText: result.smallText,
        startingPrice:
          result.startingPrice > 0 && result.startingPrice !== result.price
            ? result.startingPrice
            : null,
      };

      const html = MarketProductTemplate(templateData);
      container.insertAdjacentHTML('beforeend', html);
    });

    container.querySelectorAll('.js-product').forEach((productElement) => {
      const tmpProduct = new Product({
        productElement,
      });
      this.products.push(tmpProduct);
    });

    this.productsOffest += this.productsOffestStep;
    this.isRequesting = false;

    store.app.cart.updateStoreListProductsFromCartProducts();
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
      productElement.deliveryProduct.removeInCart();
    });
  }

  addCartDataToProduct(productID, cartIndex, quantity, uom, uomstep) {
    const element = document.querySelector(
      `.js-product[data-product-id='${productID}']`,
    );
    if (element) {
      const data = { quantity, cartIndex, uom, uomstep };
      element.deliveryProduct.setInCart(data);
    }
  }
}
