// import
import product from './productData';

export default class {
  constructor() {
    this.rootURL = '';
  }

  // eslint-disable-next-line class-methods-use-this
  getProductModal(url) {
    // placeholder
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(product);
      }, 200),
    );
  }
}
