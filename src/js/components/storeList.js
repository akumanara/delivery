import List from 'list.js';
import autoBind from 'auto-bind';
import arrayMove from 'array-move';
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
    this.DOM.stores = document.querySelector('.stores');
    this.DOM.storesList = document.querySelector('.stores__list');
    this.DOM.filtersBox = document.querySelector(
      '.search-and-filters__filters-box',
    );
    this.DOM.searchClear = document.querySelector(
      '.search-and-filters__search-box-close-img',
    );

    // Modal
    this.DOM.modal = document.querySelector('.search-and-filters__modal');
    this.DOM.modal = {
      modal: this.DOM.modal,
      close: this.DOM.modal.querySelector('.js-close'),
      sortItems: this.DOM.modal.querySelectorAll(
        '.search-and-filters__sort-section-cards-item',
      ),
      filterItems: this.DOM.modal.querySelectorAll(
        '.search-and-filters__filter-section-cards-item',
      ),
      actionBtn: this.DOM.modal.querySelector('.js-action-btn'),
    };
    this.isModalOpen = false;

    // Init List.js for sorting and searching on stores
    // always visible items. https://github.com/javve/list.js/issues/421
    const options = {
      listClass: 'stores__list',
      valueNames: [
        'card__title',
        'card__description',
        { data: ['native', 'name', 'distance', 'rating', 'promo1', 'promo2'] },
      ],
    };
    this.storeList = new List(this.DOM.stores, options);

    // TODO remove this
    // reference on window object
    window.list = this.storeList;
    window.listObj = this;

    // populate demo stores
    for (let index = 0; index < 10; index += 1) {
      const native = Math.floor(Math.random() * 100);
      const name = makeid(5).toUpperCase();
      const rating = Math.floor(Math.random() * 10);
      const distance = Math.floor(Math.random() * 1000);
      const promo1 = false;
      const promo2 = Math.random() > 0.5;
      this.storeList.add({
        card__title: `${name}`,
        card__description: `Native: ${native}, Rate: ${rating}, Distance: ${distance}, promo1: ${promo1}, promo2: ${promo2}`,
        native,
        name,
        rating,
        distance,
        promo1,
        promo2,
      });
    }

    // Find active sort item and remove its active class. Add active class to clicked sort item.
    this.activeSortElement = [...this.DOM.modal.sortItems].find((element) =>
      element.classList.contains(
        'search-and-filters__sort-section-cards-item--active',
      ),
    );
    //   // search and filter

    // SLIDER BETWEEN ITEMS
    // used to subtract them when calculating matched / filtered results
    this.sliderItemsInList =
      this.DOM.stores.querySelectorAll('.js-slider').length;
    this.saveSliderPositions();

    this.setupEvents();

    this.setFilterCount();
  }

  // TODO if no card have filter promos remove the area
  setFilterCount() {
    this.DOM.modal.filterItems.forEach((item) => {
      const { filter } = item.dataset;
      const count = this.DOM.stores.querySelectorAll(
        `[data-${filter}="true"]`,
      ).length;
      item.querySelector(
        '.search-and-filters__filter-section-cards-item-top-count',
      ).innerHTML = count;
      // if (count === 0) {
      //   item.parentNode.classList.add('d-none');
      // }
    });
  }

  restoreSliders() {
    // for each saved item
    this.savedSliders.forEach((sliderItem) => {
      // find the current index
      const currentIndex = this.storeList.items.findIndex(
        (item) => item.elm === sliderItem.elm,
      );
      arrayMove.mutate(this.storeList.items, currentIndex, sliderItem.index);
    });
    this.storeList.update();
  }

  sortItemClicked(item) {
    this.activeSortElement.classList.remove(
      'search-and-filters__sort-section-cards-item--active',
    );
    this.activeSortElement = item;
    this.activeSortElement.classList.add(
      'search-and-filters__sort-section-cards-item--active',
    );

    // Find sort by name
    const sortBy = item.dataset.sort;
    const orderBy = item.dataset.order;
    this.sortList(sortBy, orderBy);

    // show the slider only in the native sort
    if (sortBy === 'native') {
      this.restoreSliders();
      this.showAllSliders();
    } else {
      this.hideAllSliders();
    }
  }

  filterItemClicked(item) {
    if (this.activeFilterElement) {
      // remove active class from active filter item
      this.activeFilterElement.classList.remove(
        'search-and-filters__filter-section-cards-item--active',
      );
    }

    // user clicked on the active filter
    if (this.activeFilterElement === item) {
      this.activeFilterElement = null;
      this.storeList.filter();
      return;
    }

    this.activeFilterElement = item;
    this.activeFilterElement.classList.add(
      'search-and-filters__filter-section-cards-item--active',
    );

    // Find filter by name
    const { filter } = item.dataset;
    this.filterList(filter);
  }

  filterList(promoName) {
    this.storeList.filter((item) => {
      if (item.values()[promoName]) {
        return true;
      }
      return false;
    }); // Only items with promoName === true are shown in list
  }

  sortList(sortBy, order) {
    this.storeList.sort(sortBy, { order });
  }

  setupEvents() {
    // this.storeList.on('searchStart', this.searchStart);
    this.storeList.on('searchComplete', this.searchComplete);
    this.storeList.on('sortComplete', this.sortComplete);
    this.DOM.searchInput.addEventListener('input', this.searchInputChanged);
    this.DOM.searchClear.addEventListener('click', () => {
      this.DOM.searchInput.value = '';
      this.searchInputChanged();
    });
    this.DOM.modal.sortItems.forEach((item) => {
      item.addEventListener('click', () => {
        this.sortItemClicked(item);
      });
    });
    this.DOM.modal.close.addEventListener('click', this.toggleModal);
    this.DOM.filtersBox.addEventListener('click', this.toggleModal);
    this.DOM.modal.actionBtn.addEventListener('click', this.toggleModal);
    this.DOM.modal.filterItems.forEach((item) => {
      item.addEventListener('click', () => {
        this.filterItemClicked(item);
      });
    });
  }

  searchInputChanged() {
    if (this.DOM.searchInput.value.length === 0) {
      this.storeList.search();
      this.DOM.searchClear.classList.add('d-none');
    } else {
      this.storeList.search(this.DOM.searchInput.value);
      this.DOM.searchClear.classList.remove('d-none');
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
    // console.log('searchComplete');
    // this.hideAllSliders();
  }

  sortComplete() {
    // console.log('searchComplete');
    // this.hideAllSliders();
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

  toggleModal() {
    if (this.isModalOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
    this.isModalOpen = !this.isModalOpen;
  }

  closeModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.modal.modal.classList.remove('active');
  }

  openModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.modal.modal.classList.add('active');
  }

  saveSliderPositions() {
    this.savedSliders = this.findSliderPositions();
  }

  findSliderPositions() {
    const indices = [];
    this.storeList.items.forEach((item, index) => {
      if (item.elm.classList.contains('js-slider')) {
        const obj = {
          elm: item.elm,
          index,
        };
        indices.push(obj);
      }
    });
    return indices;
  }
}
