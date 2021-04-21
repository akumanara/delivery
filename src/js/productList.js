import EventEmitter from 'events';
import Handlebars from 'handlebars';
import Product from './product';

export default class extends EventEmitter {
  constructor() {
    super();
    this.products = [];
    this.init();
  }

  init() {
    // create the handlebar template
    const source = document.getElementById('entry-template').innerHTML;
    const HandlebarsTemplate = Handlebars.compile(source);

    document
      .querySelectorAll('.store-menu__product')
      .forEach((productElement) => {
        const tmpProduct = new Product(productElement, HandlebarsTemplate);
        tmpProduct.on('showPreloader', () => {
          this.emit('showPreloader');
        });
        tmpProduct.on('hidePreloader', () => {
          this.emit('hidePreloader');
        });

        this.products.push(tmpProduct);
      });
    this.products[0].onClick();
  }
}
