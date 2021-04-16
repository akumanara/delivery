import Swiper from 'swiper/bundle';
// import { throttle } from 'lodash';
import lozad from 'lozad';
import FastAverageColor from 'fast-average-color';

import Accordion from 'accordion-js';
import List from 'list.js';
import arrayMove from 'array-move';
import { showFPS, makeid, deliveryConsole } from './utils';
import StoreCatalog from './storeCatalog';

class App {
  constructor() {
    const app = this;
    showFPS();

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
    const storesListElement = document.querySelector('.stores');
    if (storesListElement) {
      const options = {
        listClass: 'stores__list',
        valueNames: [
          'card__title',
          { data: ['native', 'name', 'distance', 'rating'] },
        ],
      };

      const storeList = new List(storesListElement, options);
      window.list = storeList;

      // populate demo stores
      for (let index = 0; index < 100; index += 1) {
        const native = Math.floor(Math.random() * 100);
        const name = makeid(5);
        const rating = Math.floor(Math.random() * 10);
        const distance = Math.floor(Math.random() * 1000);
        storeList.add({
          card__title: `${name}.${native}.${rating}.${distance}`,
          native,
          name,
          rating,
          distance,
        });
      }
      // search and filter
      document.querySelector('#search-field').addEventListener('keyup', (e) => {
        const searchString = document.querySelector('#search-field').value;
        storeList.search(searchString);
      });

      storeList.on('updated', (list) => {
        console.log('updated');
      });
      storeList.on('searchStart', (list) => {
        console.log('searchStart');
      });
      storeList.on('searchComplete', (list) => {
        console.log('searchComplete');
      });

      // how to change order manually.
      window.doThat = function () {
        arrayMove.mutate(storeList.items, 0, 10);
        storeList.update();
      };
    }

    // Accordions
    this.accordions = [];
    document.querySelectorAll('.accordion__container').forEach((el) => {
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
        slidesOffsetAfter: 16,
        slidesOffsetBefore: 16,
      });
      this.sliders.push(tmpSlider);
    });

    // Lazy load card images with average color afterwards
    // TODO module
    const fac = new FastAverageColor();
    const elements = document.querySelectorAll('.card__img');
    const observer = lozad(elements, {
      loaded(el) {
        // console.log('loaded element');
        fac
          .getColorAsync(el, {
            algorithm: 'dominant',
          })
          .then((color) => {
            // console.log(color);
            // console.log(`average color run`);
            // console.log(el);
            // console.log(color);
            if (color.isDark) {
              if (!el.closest('.card').classList.contains('card--closed')) {
                el.closest('.card').classList.add('card--dark');
              }
            }
          })
          .catch((e) => {
            console.log(e);
          });
      },
    });
    observer.observe();
    deliveryConsole();
  }

  // must be called when a reflow occurs
  reflow() {
    console.log('DOM reflow');
    if (this.storeCatalog) {
      this.storeCatalog.refreshScrollTrigger();
    }
  }
}

window.globalApp = new App();
