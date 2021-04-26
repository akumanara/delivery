import axios from 'axios';
import product from './productData';
import { context } from './context';

export default class {
  constructor() {
    this.rootURL = context.rootURL;
  }

  // eslint-disable-next-line class-methods-use-this
  getProduct(url) {
    // axios.get(`https://jsonplaceholder.typicode.com/users`).then((res) => {
    //   const persons = res.data;
    //   console.log(persons);
    // });
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

  dummy(data) {
    // https://www.delivery.gr/delivery/cart/3153/insert
    const url = `${this.rootURL}/delivery/cart/${context.storeID}/insert`;
    console.log(url);
    axios
      .post(url, data, {
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
  }
}
