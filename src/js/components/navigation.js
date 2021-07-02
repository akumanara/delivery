import autoBind from 'auto-bind';

export default class {
  constructor() {
    autoBind(this);
    this.DOM = {
      header: document.querySelector('.header'),
      toggleButton: document.querySelector('.header__burger'),
      mainNav: document.querySelector('.main-nav'),
      mainNavToggleButton: document.querySelector('.main-nav__top-burger-icon'),
      userProfileModal: document.querySelector('.header__user-modal'),
      userProfilePhoto: document.querySelector('.header__user-photo'),
      userProfileBackground: document.querySelector('.header__user-modal-mask'),
    };
    this.isNavOpen = false;
    this.DOM.toggleButton.addEventListener('click', this.toggleMainNav);
    this.DOM.mainNavToggleButton.addEventListener('click', this.toggleMainNav);

    this.isUserProfileOpen = false;
    this.DOM.userProfilePhoto.addEventListener(
      'click',
      this.toggleProfileModal,
    );
    this.DOM.userProfileBackground.addEventListener(
      'click',
      this.toggleProfileModal,
    );
  }

  toggleMainNav() {
    if (this.isNavOpen) {
      this.closeMainNav();
    } else {
      this.openMainNav();
    }
    this.isNavOpen = !this.isNavOpen;
  }

  closeMainNav() {
    document.body.classList.remove('hide-overflow');
    this.DOM.mainNav.classList.remove('active');
  }

  openMainNav() {
    document.body.classList.add('hide-overflow');
    this.DOM.mainNav.classList.add('active');
  }

  toggleProfileModal() {
    if (this.isUserProfileOpen) {
      this.closeProfileModal();
    } else {
      this.openProfileModal();
    }
    this.isUserProfileOpen = !this.isUserProfileOpen;
  }

  closeProfileModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.userProfileModal.classList.remove('active');
  }

  openProfileModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.userProfileModal.classList.add('active');
  }
}
