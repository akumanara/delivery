/* eslint-disable class-methods-use-this */
import axios from 'axios';
import { store } from '../utils/store';
import { getFormData, getURLSearchData } from '../utils/helpers';
import {
  deleteCardSuccess,
  rateSuccess,
  userOrder,
  insertOrderError,
  insertOrderSuccess,
  productData5,
  loadMoreProductsEmpty,
  genericSuccess,
  genericError,
  loginMailPasswordFail,
  loginMailPasswordSuccess,
  offer3,
  productData4,
  productData,
  productData2,
  productData3,
  productDataFromCart,
  productDataFromCart2,
  voucherFail,
  voucherSuccess,
  login,
  register,
  verifyNumber,
  passwordResetSuccess,
  passwordResetError,
  deliveryDates,
  offer,
  offer2,
  reorderSuccess,
  loadMoreProducts,
} from '../utils/serverResponses';

export default class {
  constructor() {
    this.instance = axios.create({ baseURL: store.context.rootURL });
    this.devThankyouIndex = 0;
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

  getProductInOffer(productID, offerID, offerCategoryID) {
    // https://www.delivery.gr/api/menu/11360/product/881614?offerId=41&offerCategoryId=75
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(productData);
        }, 200),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/menu/${store.context.storeID}/product/${productID}?offerId=${offerID}&offerCategoryId=${offerCategoryID}`;
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

  getOffer(offerID) {
    // https://www.delivery.gr/api/offer/{:shop_id}/{:offer_id}
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(offer);
        }, 200),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `api/offer/${store.context.storeID}/${offerID}`;
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

  getOrder(orderID) {
    // https://www.delivery.gr/api/online-order-details-json
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(userOrder);
        }, 200),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `api/online-order-details-json`;
      const data = {
        order_id: orderID,
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

  reOrder(orderID) {
    // https://www.delivery.gr/user/reorder
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(reorderSuccess);
        }, 200),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `user/reorder`;
      const data = {
        order_id: orderID,
        checkout: false,
      };
      const formData = getFormData(data);
      this.instance
        .post(url, formData)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  rateOrder(orderID, rate1, rate2, rate3) {
    // https://www.delivery.gr/user/order/{:order_id}/rate/submit
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(rateSuccess);
        }, 200),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `https://www.delivery.gr/user/order/${orderID}/rate/submit`;
      const data = {
        rate1,
        rate2,
        rate3,
      };
      const formData = getFormData(data);
      this.instance
        .post(url, formData)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteCard(cardId) {
    // https://www.delivery.gr/user/cards/delete-card
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(deleteCardSuccess);
        }, 200),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `/user/cards/delete-card`;
      const data = {
        id: cardId,
      };
      const formData = getFormData(data);
      this.instance
        .post(url, formData)
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

  deleteOfferFromCart(cartIndex) {
    // https://www.delivery.gr/delivery/cart/{store id}/remove-offer/{cart index}
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
      const url = `delivery/cart/${store.context.storeID}/remove-offer/${cartIndex}`;
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

  addOfferToCart(data) {
    // https://www.delivery.gr/delivery/cart/140/insert-offer-json
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
      const url = `delivery/cart/${store.context.storeID}/insert-offer-json`;
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
        action: 0,
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

  signupUser(data) {
    // https://www.delivery.gr/signup-user
    // post
    // email
    // pass
    // name
    // lastname
    // telephone
    // agreement = true
    // merge true
    data.csrfToken = store.context.csrfToken;
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(register.mergeConsentWithCode);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `signup-user`;
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

  verifyPhone(phoneNumber) {
    // https://www.delivery.gr/api/telephone-verification
    // post
    // telephone: '6934782274'
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(verifyNumber.step1PhoneNeedVerification);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/telephone-verification`;
      const data = {
        telephone: phoneNumber,
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

  submitOTP(phoneNumber, callId, otp) {
    // https://www.delivery.gr/api/telephone-verification
    // post
    // "telephone":"6934782274",
    // "call_id":"32748",
    // "sms_verification":"3308"
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(verifyNumber.step2phoneIsVerified);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/telephone-verification`;
      const data = {
        telephone: phoneNumber,
        call_id: callId,
        sms_verification: otp,
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

  quickAddProduct(data) {
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

  quickRemoveProduct(data, productID) {
    // https://www.delivery.gr/delivery/cart/{store id}/remove-one-product/{product id}
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
      const url = `delivery/cart/${store.context.storeID}/remove-one-product/${productID}`;
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

  addAddress(data) {
    // https://www.delivery.gr/delivery/find/shops-by-location

    // PUT
    if (store.context.mode === 'development') {
      return new Promise((resolve, reject) =>
        setTimeout(() => {
          resolve({ shops: 167 });
          // reject(new Error('Error'));
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

  // Email or phone
  login(emailOrPhone) {
    // https://www.delivery.gr/check-login-type
    // { username: email/phone }

    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(login.show_new_user);
        }, 500),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `check-login-type`;
      this.instance
        .post(url, { username: emailOrPhone })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  logout() {
    // https://www.delivery.gr/logout
    // Method get

    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(genericSuccess);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `logout`;
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

  emailLoginWithPassword(email, password) {
    // https://www.delivery.gr/login/native
    // username: fdsfdsa@dffd.ff
    // password: sdfafdsa
    // __csrf_token__: 157023240460e7065db4d0e7.47199735

    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(loginMailPasswordFail);
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

  phoneLoginWithOTP(otp, callID, phone) {
    // https://www.delivery.gr/verify-otp-login

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

  changePassword(email, nonce, password) {
    // https://www.delivery.gr/process-reset-password

    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(passwordResetSuccess);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `process-reset-password`;
      const data = getFormData({
        csrfToken: store.context.csrfToken,
        nonce,
        password,
        email,
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

  resetPassword(email) {
    // https://www.delivery.gr/forgot-password

    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(passwordResetSuccess);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `reset-password`;
      const data = {
        csrfToken: store.context.csrfToken,
        email,
      };
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

  submitTimeslots(data) {
    // https://www.delivery.gr/delivery/cart/{:shop}/delivery-slot
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(genericSuccess);
        }, 500),
      );
    }

    return new Promise((resolve, reject) => {
      const url = `delivery/cart/${store.context.storeID}/delivery-slot`;
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

  getDeliveryDates(storeID, date) {
    // https://www.delivery.gr/api/delivery-slots

    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(deliveryDates);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const data = {
        storeID,
        date,
      };
      const url = `api/delivery-slots`;
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

  // markets autocomplete (AB only)
  getMarketsAutocompleteResults(storeID, query, baseURL) {
    // https://api.ibutler.gr/search/market/${storeID}/${query}
    //   {
    //     "image": "https://static.delivery.gr//shops/13070/products/7090673_1_product.webp",
    //     "img": "https://static.delivery.gr//shops/13070/products/7090673_1_product.webp",
    //     "max_quantity": 0,
    //     "shop": 13138,
    //     "comments": 13138,
    //     "local_id": 7090673,
    //     "normalized_name": "7days στρουντελ μηλο κανελα 85g",
    //     "start_price": 0,
    //     "uom": "TMX",
    //     "min_quantity": 0,
    //     "uom_step": 1,
    //     "price": 0.73,
    //     "percentage_discount": 0,
    //     "name": "7DAYS  Στρούντελ Μήλο Κανέλα 85g",
    //     "id": 1298238
    // }
    return new Promise((resolve, reject) => {
      const url = `${store.context.productsSearchUrl}${query}`;
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // AB ONLY
  // https://www.delivery.gr/load-products/13138/0/40
  getMoreOffers(storeID, offset) {
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(loadMoreProducts);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `https://www.delivery.gr/load-products/${storeID}/0/${offset}`;
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getThankYou() {
    if (store.context.mode === 'development') {
      return new Promise((resolve, reject) => {
        const urls = ['/thankyou-sent.html', '/thankyou-success.html'];
        const url = urls[this.devThankyouIndex];
        this.devThankyouIndex += 1;
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
      const url = window.location.href;
      axios
        .get(url)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  insertOrder(data) {
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(insertOrderError);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = `api/order/insert`;
      const formData = getFormData(data);
      this.instance
        .post(url, formData, {
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

  clickToCall() {
    if (store.context.mode === 'development') {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(genericSuccess);
        }, 500),
      );
    }
    return new Promise((resolve, reject) => {
      const url = store.context.clickandcallURL;
      const data = {
        telephone: store.context.userPhone,
      };
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
