import autoBind from 'auto-bind';
import Accordion from 'accordion-js';

export default class {
  constructor(element) {
    autoBind(this);

    this.DOM = {};
    this.DOM.element = element;

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
    this.DOM.serachButton = this.DOM.element.querySelector(
      '.search-and-filters__search',
    );
    this.DOM.searchModal = document.querySelector('.js-autocomplete-search');
    this.DOM.searchModal = {
      modal: this.DOM.searchModal,
      closeButton: this.DOM.searchModal.querySelector('.js-close'),
    };
    this.isSearchModalOpen = false;

    this.DOM.searchModal.closeButton.addEventListener(
      'click',
      this.toggleSearchModal,
    );
    this.DOM.serachButton.addEventListener('click', this.toggleSearchModal);

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
  }

  // Closes all the accordions except the one to be opened
  closeGroupOptions(accordionToBeOpened) {
    this.accordions.forEach((accordion) => {
      if (accordionToBeOpened !== accordion) {
        accordion.close(0);
      }
    });
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
