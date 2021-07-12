/* eslint-disable class-methods-use-this */
import axios from 'axios';
import { store } from '../utils/store';
import { getFormData, getURLSearchData } from '../utils/helpers';
import {
  loginMailPasswordFail,
  loginMailPasswordSuccess,
  productData,
  productData2,
  productDataFromCart,
  productDataFromCart2,
  voucherFail,
  voucherSuccess,
} from '../utils/serverResponses';

export default class {
  constructor() {
    this.instance = axios.create({ baseURL: store.context.rootURL });
  }

  getProduct(productID) {
    // https://www.delivery.gr/api/menu/3153/product/1411216
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(productData);
        }, 200),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/menu/${store.context.storeID}/product/${productID}`;
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
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(productDataFromCart);
        }, 200),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/menu/${store.context.storeID}/product/update/${productID}/${cartIndex}`;
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
    if (store.context.mode === 'development') {
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
      const url = `delivery/cart/${store.context.storeID}/remove-item/${cartIndex}`;
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
    if (store.context.mode === 'development') {
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
      const url = `delivery/cart/${store.context.storeID}/insert`;
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
    if (store.context.mode === 'development') {
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
      const url = `delivery/cart/${store.context.storeID}/pickup`;
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
    if (store.context.mode === 'development') {
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
      const url = `delivery/cart/${store.context.storeID}/delivery`;
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

  getCart() {
    // https://www.delivery.gr/delivery/cart/3153/show
    if (store.context.mode === 'development') {
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
      const url = `delivery/cart/${store.context.storeID}/show`;
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

  plusOneProductFromCart(cartIndex) {
    // https://www.delivery.gr/delivery/cart/{store id}/add-one-item/{cart index}
    if (store.context.mode === 'development') {
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
      const url = `delivery/cart/${store.context.storeID}/add-one-item/${cartIndex}`;
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
    if (store.context.mode === 'development') {
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
      const url = `delivery/cart/${store.context.storeID}/remove-one-item/${cartIndex}`;
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

  addStoreToFavorites() {
    // https://www.delivery.gr/user/favorite-shop
    // crfToken: 181383886460ba211e1f2c97.78353421
    // action: true/false
    // shop_id: 3153
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({});
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `user/favorite-shop`;
      const data = getFormData({
        csrfToken: store.context.csrfToken,
        action: true,
        shop_id: store.context.storeID,
      });
      this.instance
        .post(url, data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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

  removeStoreToFavorites() {
    // https://www.delivery.gr/user/favorite-shop
    // crfToken: 181383886460ba211e1f2c97.78353421
    // action: true/false
    // shop_id: 3153
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({});
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `user/favorite-shop`;
      const data = getFormData({
        csrfToken: store.context.csrfToken,
        action: false,
        shop_id: store.context.storeID,
      });
      this.instance
        .post(url, data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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

  addAndApplyVoucher(voucherID, shopID) {
    // https://www.delivery.gr/api/addVoucher
    // voucher_id: sadfsadf
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(voucherFail);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/addVoucher`;
      const data = {
        voucher_id: voucherID,
        shop_id: shopID,
      };
      this.instance
        .post(url, data)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  submitPhoneGuest(phoneNumber) {
    // https://www.delivery.gr/api/telephone-verification
    // post
    // order_phone: '6934782274'
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({ ok: 'ok' });
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/telephone-verification`;
      const data = {
        shop_id: phoneNumber,
      };
      this.instance
        .post(url, data)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  submitOTPGuest(otp) {
    // https://www.delivery.gr/api/telephone-verification
    // post
    // user_verification:"5675"
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({ ok: 'ok' });
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/telephone-verification`;
      const data = {
        user_verification: otp,
      };
      this.instance
        .post(url, data)
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
  // quickAddProduct(data) {
  //   // https://www.delivery.gr/delivery/cart/3153/insert
  //   const url = `${this.rootURL}/delivery/cart/${store.context.storeID}/insert`;
  //   axios
  //     .post(url, data, {})
  //     .then((response) => {
  //       console.log(response);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // }

  addAddress(data) {
    // https://www.delivery.gr/delivery/find/shops-by-location

    // PUT
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({ shops: 167 });
        }, 500),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `delivery/find/shops-by-location`;
      const dataToPost = getURLSearchData(data);
      this.instance
        .put(url, dataToPost, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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

  emailLogin(email) {
    // https://www.delivery.gr/check-login-type
    // { status: 'ok', type: 'show_password' }
    // {
    //   status: 'ok',
    //   type: 'show_otp',
    //   call_id: 'asdads',
    //   phone: '6985555555',
    // }
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            status: 'ok',
            type: 'show_otp',
            call_id: 'asdads',
            phone: '6985555555',
          });
        }, 500),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `check-login-type`;
      this.instance
        .post(url, { email })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  emailLoginWithPassword(email, password) {
    // https://www.delivery.gr/login/native
    // username: fdsfdsa@dffd.ff
    // password: sdfafdsa
    // __csrf_token__: 157023240460e7065db4d0e7.47199735

    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(loginMailPasswordSuccess);
        }, 500),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `login/native`;
      const data = getFormData({
        csrfToken: store.context.csrfToken,
        username: email,
        password,
      });
      this.instance
        .post(url, data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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

  emailLoginWithOTP(email, otp, callID, phone) {
    // https://www.delivery.gr/verify-otp-login

    console.log({
      csrfToken: store.context.csrfToken,
      username: email,
      sms_verification: otp,
      call_id: callID,
      telephone: phone,
    });

    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(loginMailPasswordSuccess);
        }, 500),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `verify-otp-login`;
      const data = getFormData({
        csrfToken: store.context.csrfToken,
        username: email,
        sms_verification: otp,
        call_id: callID,
        telephone: phone,
      });
      this.instance
        .post(url, data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
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
}
