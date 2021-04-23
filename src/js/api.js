// import
import product from './productData';

export default class {
  constructor() {
    this.rootURL = '';
  }

  // eslint-disable-next-line class-methods-use-this
  getProduct(url) {
    // placeholder
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(product);
      }, 200),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  addProductToCart(data) {
    // placeholder
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({ tbd: 'ok' });
      }, 500),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  getProductFromCart(url) {
    // placeholder
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(product);
      }, 200),
    );
  }
}
