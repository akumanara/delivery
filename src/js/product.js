// import resolveToString from 'es6-template-strings/resolve-to-string';
import Swiper from 'swiper/bundle';
import randomstring from 'randomstring';
import API from './api';

// const template = require('es6-template-strings');

export default class {
  constructor(productElement, template, app) {
    // Data the product might need
    // TODO: add combo / offers
    // - item element, title, description, price,
    // - how many group options, group option settings.
    this.template = template;
    this.element = productElement;
    this.modalURL = this.element.dataset.url;
    this.app = app;
    this.api = new API();
    this.onClick = this.onClick.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.images = ['./images/b2.jpg', './images/b1.jpg'];

    this.init();
  }

  init() {
    // setup event listeners
    this.element.addEventListener('click', this.onClick);
  }

  async onClick() {
    this.app.showLoader();
    // document.body.classList('hide-overflow');
    // fetch the html for the modal
    await this.api.getProductModal(this.modalURL);

    // Create the modal from the data and init it
    this.createModal();
    this.initModal();
    this.app.hideLoader();
  }

  // eslint-disable-next-line class-methods-use-this
  createModal() {
    const randomString = randomstring.generate({
      length: 7,
      charset: 'alphabetic',
    });
    const context = {
      id: randomString,
      title: 'Φτερούγες κοτόπουλου με μέλι & γλυκιά σάλτσα τσίλι',
      description:
        'Με τυρί, φρέσκια ντοµάτα, φρέσκα μανιτάρια, ελιές, φέτα, πιπεριά, κρεµµύδι και ρίγανη.',
      images: [
        './images/b2.jpg',
        './images/b1.jpg',
        './images/b2.jpg',
        './images/b1.jpg',
      ],
    };

    // create the template
    const html = this.template(context);
    document.body.insertAdjacentHTML('beforeend', html);
    this.modalElement = document.querySelector(`.${randomString}`);
  }

  // Executes after we have created the modal
  initModal() {
    // Photos gallery
    const sliderElement = this.modalElement.querySelector(
      '.product-modal__slider',
    );
    this.slider = new Swiper(sliderElement, {
      pagination: {
        el: '.swiper-pagination',
      },
      resistance: true,
      resistanceRatio: 0,
    });
    // Bind close btn
    this.modalElement
      .querySelector('.product-modal__close-btn')
      .addEventListener('click', this.closeModal);

    // hide overflow
    document.body.classList.add('hide-overflow');
  }

  closeModal() {
    this.modalElement.remove();
    // show overflow
    document.body.classList.remove('hide-overflow');
  }
}
