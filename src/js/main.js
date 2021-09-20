/* eslint-disable class-methods-use-this */
/* global MODE */
import autoBind from 'auto-bind';
import { debounce } from 'lodash';
import Swiper from 'swiper/bundle';
import lozad from 'lozad';
import FastAverageColor from 'fast-average-color';
import Accordion from 'accordion-js';
import PubSub from 'pubsub-js';
import autosize from 'autosize';
import { gsap, ScrollToPlugin, ScrollTrigger } from 'gsap/all';
import * as Sentry from '@sentry/browser';
import { showFPS, makeid, deliveryConsole, initSentry } from './utils/helpers';
import StoreCatalog from './components/storeCatalog';
import StoreList from './components/storeList';
import ProductsAndOffersList from './components/productsAndOffersList';
import AddCard from './components/add-card';
import Cart from './components/cart';
import VerifyNumber from './components/verify-number';
import Coupon from './components/coupon';
import DeliveryType from './components/deliveryType';
import API from './components/api';
import { store } from './utils/store';
import Address from './components/address';
import PaymentType from './components/paymentType';
import Alert from './components/alert';
import Navigation from './components/navigation';
import Connect from './components/connect';
import Noticeboard from './components/noticeboard';
import Timeslot from './components/timeslot';
import AdultConsentModals from './components/adultConsentModals';
import SearchAndCategories from './components/searchAndCategories';
import ThankYou from './components/thankYou';
import UserOrders from './components/userOrders';
import UserCards from './components/userCards';
import InsertOrder from './components/insertOrder';


class App {
  constructor() {
    autoBind(this);
    // if (MODE !== 'development') {
    initSentry();
    // }
    deliveryConsole();

    window.Alert = Alert;
    window.addEventListener('load', this.windowLoaded);
    autosize(document.querySelectorAll('textarea'));
    // Scroll with categories swiper
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    this.api = new API();

    // save the main app object for later use
    store.app = this;

    // kill console logs in production
    if (MODE === 'production') {
      // console.log = this.consoleLog;
    } else if (MODE === 'development') {
      // showFPS();
      // document.querySelector('.header').addEventListener('click', () => {
      //   document.querySelector('.stats').classList.toggle('display-none');
      // });
    }

    this.DOM = {};
    this.DOM.loader = document.querySelector('.delivery-loader');

    // Subscribe to topics
    PubSub.subscribe('hide_loader', this.hideLoader);
    PubSub.subscribe('show_loader', this.showLoader);

    // Connect / Login
    this.connect = new Connect();

    // Main navigation
    this.navigation = new Navigation();

    // Tobacco and Alcohol modals
    this.adultConsentModals = new AdultConsentModals();

    // Search and Categories (MARKETS)
    const searchAndCategoriesElement = document.querySelector(
      '.search-and-filters--markets',
    );
    if (searchAndCategoriesElement) {
      this.searchAndCategories = new SearchAndCategories(
        searchAndCategoriesElement,
      );
    }

    // User orders page
    const userOrdersElement = document.querySelector('.user-orders');
    if (userOrdersElement) {
      this.userOrders = new UserOrders(userOrdersElement);
    }
    // User cards page
    const userCardsElement = document.querySelector('.user-cards');
    if (userCardsElement) {
      this.userCards = new UserCards(userCardsElement);
    }

    // checkout page - insert order
    const insertOrderElement = document.querySelector('.pay-now');
    if (insertOrderElement) {
      this.insertOrder = new InsertOrder();
    }

    // Timeslots
    // timeslots are complicated. better wrap this on a try catch?
    const timeslotElement = document.querySelector('.timeslot__trigger');
    if (timeslotElement) {
      this.timeslot = new Timeslot(timeslotElement);
    }

    // Noticeboard
    const noticeboardElement = document.querySelector('.noticeboard');
    if (noticeboardElement) {
      this.noticeboard = new Noticeboard(noticeboardElement);
    }
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

    // Payment type
    const paymentTypeElement = document.querySelector('.payment-type');
    if (paymentTypeElement) {
      this.paymentType = new PaymentType();
    }

    // Product modal (add product to basket) (must be before cart)
    const storeMenuCatalog = document.querySelector('.store-menu__catalog');
    if (storeMenuCatalog) {
      this.productsAndOffersList = new ProductsAndOffersList();
    }
    // Delivery type (must be before cart)
    const deliveryTypeElement = document.querySelector('.delivery-type');
    if (deliveryTypeElement) {
      this.deliveryType = new DeliveryType();
    }

    // Cart (store page)
    const cartElement = document.querySelector('.cart');
    if (cartElement) {
      this.cart = new Cart();
    }

    // Verify number modal
    const verifyNumberModalElement = document.querySelector(
      '.js-verify-number-modal',
    );
    if (verifyNumberModalElement) {
      this.verifyNumber = new VerifyNumber();
    }

    // Address Component
    this.addressComponent = new Address();

    // Thank you page
    const thankYouElement = document.querySelector('.js-thankyou');
    if (thankYouElement) {
      this.thankYou = new ThankYou(thankYouElement);
    }

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
        if (store.context.isUserLoggedIn) {
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
        } else {
          this.connect.triggerClicked();
        }
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

    // The store list with filter modal and search
    if (document.body.classList.contains('catalog-page')) {
      this.storeList = new StoreList();
    }

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
              store.app.reflow();
            }
          },
          onClose() {
            // see above onOpen comment
            if (!el.classList.contains('accordion__container--nested')) {
              store.app.reflow();
            }
          },
        });
        this.accordions.push(tmpAccordionContainer);
      });

    // Featured slider
    this.sliders = [];
    document.querySelectorAll('.snippet__swiper').forEach((el) => {
      const options = {
        slidesPerView: 'auto',
        loop: false,
        freeMode: true,
        freeModeMomentumBounce: false,
        resistanceRatio: 0,
        spaceBetween: el.classList.contains('small-gap') ? 10 : 16,
        // slidesOffsetAfter: 16,
        // slidesOffsetBefore: 16,
        observer: true,
        observeParents: true,
      };

      const tmpSlider = new Swiper(el, options);
      this.sliders.push(tmpSlider);
    });

    // Lazy load card images with average color afterwards
    // TODO avg color on images in order to change theme of parent card
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

  // window load event.
  // The load event is fired when the whole page has loaded,
  // including all dependent resources such as stylesheets and images.
  windowLoaded() {
    document.body.classList.add('page-loaded');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.globalApp = new App();
});
