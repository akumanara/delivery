import autoBind from 'auto-bind';
import Cookies from 'js-cookie';
import { store } from '../utils/store';

export default class {
  constructor() {
    autoBind(this);

    this.DOM = {};

    // ALCOHOL
    this.DOM.alcoholModal = document.querySelector('.js-alcohol-modal');
    this.DOM.alcoholModal = {
      modal: this.DOM.alcoholModal,
      okButton: this.DOM.alcoholModal.querySelector('.js-action-btn'),
    };
    this.DOM.alcoholModal.okButton.addEventListener(
      'click',
      this.consentAlcohol,
    );
    this.isAlcoholModalOpen = false;
    this.alcoholConsentLinks = document.querySelectorAll(
      '.raiseAlcoholConsent',
    );
    this.alcoholConsentLinks.forEach((link) => {
      link.addEventListener('click', this.alcoholConsentLinkClicked);
    });

    // TOBACCO
    this.DOM.tobaccoModal = document.querySelector('.js-tobacco-modal');
    this.DOM.tobaccoModal = {
      modal: this.DOM.tobaccoModal,
      yesButton: this.DOM.tobaccoModal.querySelector('.js-accept'),
      noButton: this.DOM.tobaccoModal.querySelector('.js-cancel'),
    };
    this.DOM.tobaccoModal.yesButton.addEventListener(
      'click',
      this.consentTobacco,
    );
    this.DOM.tobaccoModal.noButton.addEventListener(
      'click',
      this.declineTobacco,
    );
    this.isTobaccoModalOpen = false;
    this.tobaccoConsentLinks = document.querySelectorAll(
      '.raiseTobaccoConsent',
    );
    this.tobaccoConsentLinks.forEach((link) => {
      link.addEventListener('click', this.tobaccoConsentLinkClicked);
    });

    this.checkForConsents();
  }

  checkForConsents() {
    const alcoholConsent = store.context.needsAlcoholConsent;
    if (alcoholConsent) {
      const alcoholConsentCookie = Cookies.get('alcohol_consent');
      if (!alcoholConsentCookie) {
        this.toggleAlcoholModal();
      }
    }

    const tobaccoConsent = store.context.needsTobaccoConsent;
    if (tobaccoConsent) {
      console.log('needs tobacco consent');
      const tobaccoConsentCookie = Cookies.get('tobacco_consent');
      if (!tobaccoConsentCookie) {
        this.toggleTobaccoModal();
      }
    }
  }

  alcoholConsentLinkClicked(e) {
    const alcoholConsentCookie = Cookies.get('alcohol_consent');
    if (!alcoholConsentCookie) {
      e.preventDefault();
      const target = e.target || e.srcElement;
      this.alcoholLinkSrc = target.getAttribute('href');
      this.toggleAlcoholModal();
    }
  }

  tobaccoConsentLinkClicked(e) {
    const tobaccoConsentCookie = Cookies.get('tobacco_consent');
    if (!tobaccoConsentCookie) {
      e.preventDefault();
      const target = e.target || e.srcElement;
      this.tobaccoLinkSrc = target.getAttribute('href');
      this.toggleTobaccoModal();
    }
  }

  consentAlcohol() {
    // Create a cookie that expires 7 days from now, valid across the entire site:
    Cookies.set('alcohol_consent', 'true', { expires: 7 });

    // Toggle modal
    this.toggleAlcoholModal();

    // if we have a link to redirect to, redirect to it after consent
    if (this.alcoholLinkSrc) {
      window.location.href = this.alcoholLinkSrc;
    }
  }

  consentTobacco() {
    // Create a cookie that expires 7 days from now, valid across the entire site:
    Cookies.set('tobacco_consent', 'true', { expires: 7 });

    // Toggle modal
    this.toggleTobaccoModal();

    // if we have a link to redirect to, redirect to it after consent
    if (this.tobaccoLinkSrc) {
      window.location.href = this.tobaccoLinkSrc;
    } else {
      window.location.reload();
    }
  }

  declineTobacco() {
    // if the user clicked on link we just close the modal.
    // if the modal was raised from page load  we redirect the user to the page from context.
    if (this.tobaccoLinkSrc) {
      this.toggleTobaccoModal();
    } else {
      window.location.href = store.context.redirectOnNegativeTobaccoConsent;
    }
  }

  toggleAlcoholModal() {
    if (this.isAlcoholModalOpen) {
      this.closeAlcoholModal();
    } else {
      this.openAlcoholModal();
    }
    this.isAlcoholModalOpen = !this.isAlcoholModalOpen;
  }

  closeAlcoholModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.alcoholModal.modal.classList.remove('active');
  }

  openAlcoholModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.alcoholModal.modal.classList.add('active');
  }

  toggleTobaccoModal() {
    if (this.isTobaccoModalOpen) {
      this.closeTobaccoModal();
    } else {
      this.openTobaccoModal();
    }
    this.isTobaccoModalOpen = !this.isTobaccoModalOpen;
  }

  closeTobaccoModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.tobaccoModal.modal.classList.remove('active');
  }

  openTobaccoModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.tobaccoModal.modal.classList.add('active');
  }
}
