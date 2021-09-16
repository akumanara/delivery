import autoBind from 'auto-bind';
import API from './api';
import UserCard from './userCard';

// This class manages all the user cards.
export default class {
  constructor(element) {
    autoBind(this);
    this.api = new API();
    this.DOM = {};
    this.DOM.element = element;
    this.userCards = [];
    this.init();
  }

  init() {
    this.DOM.cards = this.DOM.element.querySelectorAll('.user-cards__item');
    this.DOM.cards.forEach((card) => {
      const tempUserCard = new UserCard(card);
      this.userCards.push(tempUserCard);
    });
  }
}
