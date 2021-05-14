/* eslint-disable class-methods-use-this */
import axios from 'axios';
import product from './productData';
import { context } from './context';

export default class {
  constructor() {
    this.instance = axios.create({ baseURL: context.rootURL });
  }

  getProduct(productID) {
    // https://www.delivery.gr/api/menu/3153/product/1411216
    if (context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(product);
        }, 200),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/menu/${context.storeID}/product/${productID}`;
      this.instance
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getProductFromCart(productID, cartIndex) {
    // https://www.delivery.gr/api/menu/11658/product/update/1277099/0
    if (context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(product);
        }, 200),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/menu/${context.storeID}/product/update/${productID}/${cartIndex}`;
      this.instance
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteProductFromCart(cartIndex) {
    // https://www.delivery.gr/delivery/cart/{store id}/remove-item/{cart index}
    if (context.mode === 'development') {
      return new Promise((resolve, reject) => {
        const url = '/partials/cart-body.html';
        axios
          .get(url)
          .then((response) => {
            setTimeout(() => resolve(response.data), 500);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
    return new Promise((resolve, reject) => {
      const url = `delivery/cart/${context.storeID}/remove-item/${cartIndex}`;
      this.instance
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  addProductToCart(data) {
    // https://www.delivery.gr/delivery/cart/3153/insert
    if (context.mode === 'development') {
      return new Promise((resolve, reject) => {
        const url = '/partials/cart-body.html';
        axios
          .get(url)
          .then((response) => {
            setTimeout(() => resolve(response.data), 500);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
    return new Promise((resolve, reject) => {
      const url = `delivery/cart/${context.storeID}/insert`;
      this.instance
        .post(url, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  changeCartTypeToPickup() {
    // https://www.delivery.gr/delivery/cart/3783/pickup
    if (context.mode === 'development') {
      return new Promise((resolve, reject) => {
        const url = '/partials/cart-body.html';
        axios
          .get(url)
          .then((response) => {
            setTimeout(() => resolve(response.data), 500);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
    return new Promise((resolve, reject) => {
      const url = `delivery/cart/${context.storeID}/pickup`;
      this.instance
        .put(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  changeCartTypeToDelivery() {
    // https://www.delivery.gr/delivery/cart/3783/delivery
    if (context.mode === 'development') {
      return new Promise((resolve, reject) => {
        const url = '/partials/cart-body.html';
        axios
          .get(url)
          .then((response) => {
            setTimeout(() => resolve(response.data), 500);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
    return new Promise((resolve, reject) => {
      const url = `delivery/cart/${context.storeID}/delivery`;
      this.instance
        .put(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  plusOneProductFromCart(cartIndex) {
    // https://www.delivery.gr/delivery/cart/{store id}/add-one-item/{cart index}
    if (context.mode === 'development') {
      return new Promise((resolve, reject) => {
        const url = '/partials/cart-body.html';
        axios
          .get(url)
          .then((response) => {
            setTimeout(() => resolve(response.data), 500);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
    return new Promise((resolve, reject) => {
      const url = `delivery/cart/${context.storeID}/add-one-item/${cartIndex}`;
      this.instance
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  minusOneProductFromCart(cartIndex) {
    // https://www.delivery.gr/delivery/cart/{store id}/remove-one-item/{cart index}
    if (context.mode === 'development') {
      return new Promise((resolve, reject) => {
        const url = '/partials/cart-body.html';
        axios
          .get(url)
          .then((response) => {
            setTimeout(() => resolve(response.data), 500);
          })
          .catch((error) => {
            reject(error);
          });
      });
    }
    return new Promise((resolve, reject) => {
      const url = `delivery/cart/${context.storeID}/remove-one-item/${cartIndex}`;
      this.instance
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // TODO
  // =====================
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

  // TODO
  addStoreToFavorites() {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(product);
      }, 500),
    );
  }

  // TODO
  removeStoreToFavorites() {
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve(product);
      }, 500),
    );
  }
}
