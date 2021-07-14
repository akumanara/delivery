import List from 'list.js';
import autoBind from 'auto-bind';
import { makeid } from '../utils/helpers';

export default class {
  constructor() {
    autoBind(this);
    this.DOM = {};
    this.DOM.sliders = document.querySelectorAll('.js-slider');
    this.DOM.emptyList = document.querySelector('.stores__empty');
    this.DOM.searchInput = document.querySelector(
      '.search-and-filters__search-box-input',
    );
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

      this.storeList = new List(storesListElement, options);
      //   // TODO remove this
      window.list = this.storeList;

      //   // TODO remove this
      //   // populate demo stores
      for (let index = 0; index < 10; index += 1) {
        const native = Math.floor(Math.random() * 100);
        const name = makeid(5);
        const rating = Math.floor(Math.random() * 10);
        const distance = Math.floor(Math.random() * 1000);
        this.storeList.add({
          card__title: `${name}.${native}.${rating}.${distance}`,
          native,
          name,
          rating,
          distance,
        });
      }
      //   // search and filter
      this.setupEvents();

      // };

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
    }
  }

  setupEvents() {
    // this.storeList.on('searchStart', this.searchStart);
    this.storeList.on('searchComplete', this.searchComplete);
    this.DOM.searchInput.addEventListener('keyup', this.searchInputChanged);
  }

  searchInputChanged() {
    this.storeList.search(this.DOM.searchInput.value);

    if (this.DOM.searchInput.value.length === 0) {
      this.showAllSliders();
    } else {
      this.hideAllSliders();
    }

    if (this.storeList.matchingItems.length === 0) {
      this.DOM.emptyList.classList.remove('d-none');
    } else {
      this.DOM.emptyList.classList.add('d-none');
    }
  }

  // searchStart() {
  //   console.log('searchStart');
  // }

  searchComplete() {
    console.log('searchComplete');
    this.hideAllSliders();
  }

  hideAllSliders() {
    this.DOM.sliders.forEach((slider) => {
      slider.classList.add('d-none');
    });
  }

  showAllSliders() {
    this.DOM.sliders.forEach((slider) => {
      slider.classList.remove('d-none');
    });
  }
}
