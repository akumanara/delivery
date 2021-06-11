/* global MODE */
import autoBind from 'auto-bind';
import Swiper from 'swiper/bundle';
import lozad from 'lozad';
import FastAverageColor from 'fast-average-color';
import Accordion from 'accordion-js';
import List from 'list.js';
import arrayMove from 'array-move';
import PubSub from 'pubsub-js';
import autosize from 'autosize';
import { showFPS, makeid, deliveryConsole, initSentry } from './utils';
import StoreCatalog from './storeCatalog';
import ProductList from './productList';
import Cart from './cart';
import Coupon from './coupon';
import AddCard from './add-card';
import DeliveryType from './deliveryType';
import API from './api';
import { store } from './store';
import AddressComponent from './addressComponent';
import PaymentType from './paymentType';

// import Layout from './layout';

class App {
  constructor() {
    window.addEventListener('load', this.windowLoaded);
    // save the main object for later use
    store.app = this;

    initSentry();
    deliveryConsole();

    // kill console logs in production
    if (MODE === 'production') {
      // console.log = () => {};
    }

    const app = this;
    autoBind(this);

    // FPS
    if (MODE === 'development') {
      // showFPS();
      // document.querySelector('.header').addEventListener('click', () => {
      //   document.querySelector('.stats').classList.toggle('display-none');
      // });
    }

    // Autosize all textareas
    autosize(document.querySelectorAll('textarea'));

    // Coupon Modal
    const couponModalElement = document.querySelector('.js-coupon-modal');
    if (couponModalElement) {
      this.coupon = new Coupon(couponModalElement);
    }

    // Add Card Modal
    const addCardModalElement = document.querySelector('.js-add-card-modal');
    if (addCardModalElement) {
      this.addCard = new AddCard(addCardModalElement);
    }

    // payment type
    const paymentTypeElement = document.querySelector('.payment-type');
    if (paymentTypeElement) {
      this.paymentType = new PaymentType();
    }

    this.api = new API();

    // Subscribe to topics
    PubSub.subscribe('hide_loader', this.hideLoader);
    PubSub.subscribe('show_loader', this.showLoader);

    this.DOM = {
      loader: document.querySelector('.delivery-loader'),
    };

    // // dummy todo delete later
    // document.querySelectorAll('.payment-type__button').forEach((btn) => {
    //   btn.addEventListener('click', () => {
    //     btn.classList.toggle('payment-type__button--active');
    //   });
    // });

    // Product modal (add product to basket) (must be before cart)
    const storeMenuCatalog = document.querySelector('.store-menu__catalog');
    if (storeMenuCatalog) {
      this.productList = new ProductList(app);
    }
    // Delivery type (must be before cart)
    const deliveryTypeElement = document.querySelector('.delivery-type');
    if (deliveryTypeElement) {
      this.deliveryType = new DeliveryType();
    }

    // Cart element
    const cartElement = document.querySelector('.cart');
    if (cartElement) {
      this.cart = new Cart();
    }

    // Address Component
    this.addressComponent = new AddressComponent();

    // Store carousel
    const storeCarouselElement = document.querySelector('.store-carousel');
    if (storeCarouselElement) {
      this.StoreCarouselSwiper = new Swiper('.store-carousel__slider', {
        pagination: {
          el: '.swiper-pagination',
        },
        resistance: true,
        resistanceRatio: 0,
      });

      // hide nav bullets if one slide
      if (this.StoreCarouselSwiper.slides.length === 1) {
        storeCarouselElement
          .querySelector('.swiper-pagination-bullets')
          .classList.add('hide-nav-bullets');
      }

      //  favorites button
      const favoriteButton = document.querySelector(
        '.store-carousel__badge--favorite',
      );
      let favoriteWaitingResponse = false;
      favoriteButton.addEventListener('click', async () => {
        if (favoriteWaitingResponse) return;
        PubSub.publish('show_loader');
        favoriteWaitingResponse = true;
        if (!favoriteButton.classList.contains('active')) {
          await this.api.addStoreToFavorites();
          favoriteButton.classList.add('active');
        } else {
          await this.api.removeStoreToFavorites();
          favoriteButton.classList.remove('active');
        }
        favoriteWaitingResponse = false;
        PubSub.publish('hide_loader');
      });
    }

    // Food Categories slider
    const foodCategoriesElement = document.querySelector(
      '.food-categories__swiper',
    );
    if (foodCategoriesElement) {
      this.foodCategoriesSlider = new Swiper('.food-categories__swiper', {
        slidesPerView: 'auto',
        spaceBetween: 0,
        loop: false,
        freeMode: true,
        freeModeMomentumBounce: false,
        resistanceRatio: 0,
      });
    }
    // The store catalog slider with scrolling listeners
    const storeMenuElement = document.querySelector('.store-menu');
    if (storeMenuElement) {
      this.storeCatalog = new StoreCatalog();
    }

    // List.js for sorting and searching on stores
    // always visible items. https://github.com/javve/list.js/issues/421
    // const storesListElement = document.querySelector('.stores');
    // if (storesListElement) {
    //   const options = {
    //     listClass: 'stores__list',
    //     valueNames: [
    //       'card__title',
    //       { data: ['native', 'name', 'distance', 'rating'] },
    //     ],
    //   };

    //   const storeList = new List(storesListElement, options);
    //   // TODO remove this
    //   window.list = storeList;

    //   // TODO remove this
    //   // populate demo stores
    //   for (let index = 0; index < 100; index += 1) {
    //     const native = Math.floor(Math.random() * 100);
    //     const name = makeid(5);
    //     const rating = Math.floor(Math.random() * 10);
    //     const distance = Math.floor(Math.random() * 1000);
    //     storeList.add({
    //       card__title: `${name}.${native}.${rating}.${distance}`,
    //       native,
    //       name,
    //       rating,
    //       distance,
    //     });
    //   }
    //   // search and filter
    //   document.querySelector('#search-field').addEventListener('keyup', (e) => {
    //     const searchString = document.querySelector('#search-field').value;
    //     storeList.search(searchString);
    //   });

    //   storeList.on('updated', (list) => {
    //     console.log('updated');
    //   });
    //   storeList.on('searchStart', (list) => {
    //     console.log('searchStart');
    //   });
    //   storeList.on('searchComplete', (list) => {
    //     console.log('searchComplete');
    //   });

    //   // how to change order manually.
    //   window.doThat = function () {
    //     arrayMove.mutate(storeList.items, 0, 10);
    //     storeList.update();
    //   };
    // }

    // Accordions for store info
    this.accordions = [];
    document
      .querySelectorAll('.store-info .accordion__container')
      .forEach((el) => {
        const tmpAccordionContainer = new Accordion(el, {
          duration: 600,
          elementClass: 'accordion__item',
          triggerClass: 'accordion__header',
          panelClass: 'accordion__panel',
          ariaEnabled: false,

          // when we open/close the accordion we change its height thus performing a DOM reflow.
          // Scrolltrigger need to be refreshed to re-calculate the scroll trigger positions.
          onOpen() {
            // dont reflow on the nested accordions because it already triggers once on the parent accordion.
            // onOpen and onClose is triggered via transitionend event which is fired when a CSS transition has completed.
            if (!el.classList.contains('accordion__container--nested')) {
              app.reflow();
            }
          },
          onClose() {
            // see above onOpen comment
            if (!el.classList.contains('accordion__container--nested')) {
              app.reflow();
            }
          },
        });
        this.accordions.push(tmpAccordionContainer);
      });

    // Featured slider
    this.sliders = [];
    document.querySelectorAll('.snippet__swiper').forEach((el) => {
      const tmpSlider = new Swiper(el, {
        slidesPerView: 'auto',
        loop: false,
        freeMode: true,
        freeModeMomentumBounce: false,
        resistanceRatio: 0,
        spaceBetween: 16,
        // slidesOffsetAfter: 16,
        // slidesOffsetBefore: 16,
      });
      this.sliders.push(tmpSlider);
    });

    // Lazy load card images with average color afterwards
    // TODO module
    const fac = new FastAverageColor();
    const elements = document.querySelectorAll('.lozad');
    const observer = lozad(elements, {
      loaded(el) {
        // console.log('loaded element');
        // fac
        //   .getColorAsync(el, {
        //     algorithm: 'dominant',
        //   })
        //   .then((color) => {
        //     // console.log(color);
        //     // console.log(`average color run`);
        //     // console.log(el);
        //     // console.log(color);
        //     if (color.isDark) {
        //       if (!el.closest('.card').classList.contains('card--closed')) {
        //         el.closest('.card').classList.add('card--dark');
        //       }
        //     }
        //   })
        //   .catch((e) => {
        //     console.log(e);
        //   });
      },
    });
    observer.observe();
  }

  // must be called when a reflow occurs
  reflow() {
    // console.log('DOM reflow');
    if (this.storeCatalog) {
      this.storeCatalog.refreshScrollTrigger();
    }
  }

  showLoader() {
    console.log('showLoader');
    this.DOM.loader.classList.add('active');
  }

  hideLoader() {
    console.log('hideLoader');
    this.DOM.loader.classList.remove('active');
  }

  windowLoaded() {
    document.body.classList.add('page-loaded');
  }
}

window.globalApp = new App();

// const a = new Layout();
