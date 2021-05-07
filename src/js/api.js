/* eslint-disable class-methods-use-this */
import axios from 'axios';
import product from './productData';
import { context } from './context';

export default class {
  getProduct(productID) {
    // https://www.delivery.gr/api/menu/3153/product/1411216
    if (context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(product);
        }, 200),
      );
    }
    return new Promise((resolve) => {
      const url = `${context.rootURL}/api/menu/${context.storeID}/product/${productID}`;
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }

  addProductToCart(data) {
    // https://www.delivery.gr/delivery/cart/3153/insert
    if (context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({ tbd: 'ok' });
        }, 500),
      );
    }
    return new Promise((resolve) => {
      const url = `${context.rootURL}/delivery/cart/${context.storeID}/insert`;
      axios
        .post(url, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
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

  getProductFromCart(url) {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(product);
      }, 200),
    );
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

  addStoreToFavorites() {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(product);
      }, 500),
    );
  }

  removeStoreToFavorites() {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(product);
      }, 500),
    );
  }
}
