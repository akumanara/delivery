import Accordion from 'accordion-js';

export default class {
  constructor() {
    console.log('cart init');
    // Cart accordions
    this.accordions = [];
    document.querySelectorAll('.cart .accordion__container').forEach((el) => {
      const tmpAccordionContainer = new Accordion(el, {
        duration: 600,
        elementClass: 'accordion__item',
        triggerClass: 'accordion__header',
        panelClass: 'accordion__panel',
        ariaEnabled: false,
      });
      this.accordions.push(tmpAccordionContainer);
    });

    document
      .querySelector('.cart__header-close')
      .addEventListener('click', () => {
        document.querySelector('.cart').classList.toggle('cart--active');
        document.body.classList.toggle('hide-overflow');
      });
  }
}
