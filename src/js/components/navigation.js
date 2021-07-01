import autoBind from 'auto-bind';

export default class {
  constructor() {
    autoBind(this);
    this.DOM = {
      header: document.querySelector('.header'),
      toggleButton: document.querySelector('.header__burger'),
      mainNav: document.querySelector('.main-nav'),
      mainNavToggleButton: document.querySelector('.main-nav__top-burger-icon'),
    };
    this.isNavOpen = false;
    this.DOM.toggleButton.addEventListener('click', this.toggleMainNav);
    this.DOM.mainNavToggleButton.addEventListener('click', this.toggleMainNav);
  }

  toggleMainNav() {
    if (this.isNavOpen) {
      this.closeNav();
    } else {
      this.openNav();
    }
    this.isNavOpen = !this.isNavOpen;
  }

  closeNav() {
    document.body.classList.remove('hide-overflow');
    this.DOM.mainNav.classList.remove('active');
  }

  openNav() {
    document.body.classList.add('hide-overflow');
    this.DOM.mainNav.classList.add('active');
  }
}
