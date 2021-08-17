import autoBind from 'auto-bind';
import Accordion from 'accordion-js';
import { debounce } from 'lodash';
import { store } from '../utils/store';
import API from './api';
import { AutocompleteItemTemplate } from '../utils/handlebarTemplate';
import { getFriendlyUOM } from '../utils/helpers';
import Product from './product';

export default class {
  constructor(element) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.element = element;
    this.autocompleteProducts = [];

    this.DOM.categoriesButton = this.DOM.element.querySelector(
      '.search-and-filters__filters',
    );

    // CATEGORIES MODAL
    this.DOM.categoriesModal = document.querySelector('.js-market-categories');
    this.DOM.categoriesModal = {
      modal: this.DOM.categoriesModal,
      closeButton: this.DOM.categoriesModal.querySelector('.js-close'),
    };
    this.isCategoriesModalOpen = false;

    this.DOM.categoriesModal.closeButton.addEventListener(
      'click',
      this.toggleCategoriesModal,
    );
    this.DOM.categoriesButton.addEventListener(
      'click',
      this.toggleCategoriesModal,
    );

    // SEARCH MODAL
    this.DOM.searchButton = this.DOM.element.querySelector(
      '.search-and-filters__search',
    );
    this.DOM.searchModal = document.querySelector('.js-autocomplete-search');
    this.DOM.searchModal = {
      modal: this.DOM.searchModal,
      closeButton: this.DOM.searchModal.querySelector('.js-close'),
      input: this.DOM.searchModal.querySelector('.autocomplete-search__input'),
      micContainer: this.DOM.searchModal.querySelector(
        '.autocomplete-search__mic-img-container',
      ),
      loaderIcon: this.DOM.searchModal.querySelector(
        '.autocomplete-search__loader-icon',
      ),
      voiceIcon: this.DOM.searchModal.querySelector(
        '.autocomplete-search__mic-img',
      ),
      clearInput: this.DOM.searchModal.querySelector(
        '.autocomplete-search__clear-img',
      ),
      emptyResults: this.DOM.searchModal.querySelector(
        '.autocomplete-search__results-empty',
      ),
      resultsContainer: this.DOM.searchModal.querySelector(
        '.autocomplete-search__results',
      ),
    };
    this.isSearchModalOpen = false;

    this.DOM.searchModal.closeButton.addEventListener(
      'click',
      this.toggleSearchModal,
    );
    this.DOM.searchButton.addEventListener('click', this.toggleSearchModal);

    this.DOM.searchModal.clearInput.addEventListener('click', this.clearInput);

    this.DOM.searchModal.input.addEventListener(
      'input',
      this.searchInputChanged,
    );
    this.requestSearchResults = debounce(this.requestSearchResults, 200);

    // Accordions for store info
    this.accordions = [];
    document
      .querySelectorAll('.js-market-categories .accordion__container')
      .forEach((el) => {
        let tmpAccordionContainer;
        const accordionOptions = {
          duration: 600,
          elementClass: 'accordion__item',
          triggerClass: 'accordion__header',
          panelClass: 'accordion__panel',
          ariaEnabled: false,
          beforeOpen: () => {
            // close other accordions if opened
            this.closeGroupOptions(tmpAccordionContainer);
          },
        };
        if (el.dataset.open) {
          accordionOptions.openOnInit = [0];
        }
        tmpAccordionContainer = new Accordion(el, accordionOptions);
        this.accordions.push(tmpAccordionContainer);
      });

    this.setupVoiceRecognition();
  }

  // Speech recognition
  setupVoiceRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'el-GR';

    this.recognition.addEventListener('start', () => {
      console.log('start');
      this.DOM.searchModal.micContainer.classList.add('is-active');
    });
    this.recognition.addEventListener('end', () => {
      this.stopVoiceRecognition();
    });
    this.recognition.addEventListener('error', () => {
      console.log('error');
    });
    this.recognition.addEventListener('result', this.voiceResult);
    this.DOM.searchModal.micContainer.addEventListener(
      'click',
      this.startVoiceRecognition,
    );
    //   recognition.onstart = function () {
    // recognition.onerror = function (event) {
    // recognition.onend = function () {
    // recognition.onresult = function (event) {
  }

  // Closes all the accordions except the one to be opened
  closeGroupOptions(accordionToBeOpened) {
    this.accordions.forEach((accordion) => {
      if (accordionToBeOpened !== accordion) {
        accordion.close(0);
      }
    });
  }

  startVoiceRecognition() {
    console.log('starting voice rec');
    this.recognition.start();
    // String for the Final Transcript
    this.final_transcript = '';
  }

  stopVoiceRecognition() {
    console.log('end');
    this.recognition.stop();
    this.DOM.searchModal.micContainer.classList.remove('is-active');
    this.DOM.searchModal.input.value = this.final_transcript;
    this.searchInputChanged();
  }

  voiceResult(event) {
    // Create the interim transcript string locally because we don't want it to persist like final transcript
    let interimTranscript = '';

    // Loop through the results from the speech recognition object.
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      // If the result item is Final, add it to Final Transcript, Else add it to Interim transcript
      if (event.results[i].isFinal) {
        this.final_transcript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    // Set the Final transcript and Interim transcript.
    // console.log(interim_transcript);
    // console.log(`final ${this.final_transcript}`);
  }

  clearInput() {
    this.DOM.searchModal.input.value = '';
    this.DOM.searchModal.resultsContainer.innerHTML = '';
    this.autocompleteProducts = [];
    this.DOM.searchModal.clearInput.classList.add('d-none');
    this.searchInputChanged();
  }

  searchInputChanged() {
    this.input = this.DOM.searchModal.input.value;

    // dont requst for no input
    if (this.input === '') {
      this.DOM.searchModal.emptyResults.classList.add('d-none');
      return;
    }
    // todo? change input lengh in order to avoid api calls for less than X chars
    // if (this.input.length < 3) return;

    if (this.input.length > 0) {
      this.DOM.searchModal.clearInput.classList.remove('d-none');
    } else {
      this.DOM.searchModal.clearInput.classList.add('d-none');
    }

    this.DOM.searchModal.loaderIcon.classList.add('active');

    console.log('user is typing. wait');
    // this.DOM.autosuggestModal.inputLoading.classList.add('active');
    this.requestSearchResults();
  }

  async requestSearchResults() {
    console.log('requesting');

    // extra check for input
    if (!this.input) return;

    const results = await this.api.getMarketsAutocompleteResults(
      store.context.storeID,
      this.input,
    );
    this.DOM.searchModal.resultsContainer.innerHTML = '';
    this.autocompleteProducts = [];
    if (results.length === 0) {
      this.DOM.searchModal.emptyResults.classList.remove('d-none');
    } else {
      this.DOM.searchModal.emptyResults.classList.add('d-none');
    }

    results.forEach((result) => {
      // Check if starting price is different than price
      const tepmlateData = {
        title: result.name,
        productID: result.id,
        imgSource: result.image,
        startingPrice:
          result.start_price > 0 && result.start_price !== result.price
            ? result.start_price
            : null,
        percentageDiscount:
          result.percentage_discount > 0 ? result.percentage_discount : null,
        friendlyUOM: getFriendlyUOM(result.uom),
        price: result.price,
      };

      const html = AutocompleteItemTemplate(tepmlateData);
      this.DOM.searchModal.resultsContainer.insertAdjacentHTML(
        'beforeend',
        html,
      );
    });

    this.DOM.searchModal.resultsContainer
      .querySelectorAll('.js-product')
      .forEach((productElement) => {
        const tmpProduct = new Product({
          productElement,
        });

        this.autocompleteProducts.push(tmpProduct);
      });

    this.DOM.searchModal.loaderIcon.classList.remove('active');
  }

  // toogle modal
  toggleCategoriesModal() {
    if (this.isCategoriesModalOpen) {
      this.closeCategoriesModal();
    } else {
      this.openCategoriesModal();
    }
    this.isCategoriesModalOpen = !this.isCategoriesModalOpen;
  }

  closeCategoriesModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.categoriesModal.modal.classList.remove('active');
  }

  openCategoriesModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.categoriesModal.modal.classList.add('active');
  }

  // toogle modal
  toggleSearchModal() {
    if (this.isSearchModalOpen) {
      this.closeSearchModal();
    } else {
      this.openSearchModal();
    }
    this.isSearchModalOpen = !this.isSearchModalOpen;
  }

  closeSearchModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.searchModal.modal.classList.remove('active');
  }

  openSearchModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.searchModal.modal.classList.add('active');
  }
}
