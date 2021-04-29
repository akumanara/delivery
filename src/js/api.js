import axios from 'axios';
import product from './productData';
import { context } from './context';

export default class {
  constructor() {
    this.rootURL = context.rootURL;
  }

  // eslint-disable-next-line class-methods-use-this
  getProduct(productID) {
    if (context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(product);
        }, 200),
      );
    }
    return new Promise((resolve) => {
      axios
        .get('https://jsonplaceholder.typicode.com/todos/1', {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Hi-ads': 'Sup',
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    });
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
    if (context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(product);
        }, 200),
      );
    }
  }

  quickAddProduct(data) {
    // https://www.delivery.gr/delivery/cart/3153/insert
    const url = `${this.rootURL}/delivery/cart/${context.storeID}/insert`;
    axios
      .post(url, data, {})
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  dummy(data) {
    // https://www.delivery.gr/delivery/cart/3153/insert
    const url = `${this.rootURL}/delivery/cart/${context.storeID}/insert`;
    console.log(url);
    const request = axios
      .post('https://jsonplaceholder.typicode.com/posts/1', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Hi-ads': 'Sup',
        },
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    return request;
  }
}
