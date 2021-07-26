import autoBind from 'auto-bind';
import Handlebars from 'handlebars';

export default class {
  constructor(noticeboardElement) {
    autoBind(this);
    // query DOM
    this.DOM = {};
    this.DOM.noticeboard = noticeboardElement;
    this.DOM.items =
      this.DOM.noticeboard.querySelectorAll('.noticeboard__item');

    // event listeners for items
    this.DOM.items.forEach((item) => {
      item.addEventListener('click', () => {
        this.itemClick(item);
      });
    });
  }

  itemClick(item) {
    // prepare template data
    const data = {
      image: item.querySelector('.noticeboard__item-img').src,
      title: item.querySelector('.noticeboard__bottom-title').innerHTML,
      description: item.querySelector('.noticeboard__bottom-description')
        .innerHTML,
      className: `notice-${item.dataset.id} notice-modal`,
    };
    const html = this.template(data);
    document.body.insertAdjacentHTML('beforeend', html);

    // events
    document
      .querySelector('.notice-modal .js-close')
      .addEventListener('click', (e) => {
        document.querySelector('.notice-modal').remove();
      });
    document
      .querySelector('.notice-modal .js-action-btn')
      .addEventListener('click', (e) => {
        document.querySelector('.notice-modal').remove();
      });
  }

  // eslint-disable-next-line class-methods-use-this
  template(data) {
    // TODO dont compile the template every time
    const source = document.getElementById('noticeboard-template');
    let HandlebarsTemplate;
    if (source) {
      HandlebarsTemplate = Handlebars.compile(source.innerHTML);
    }

    return HandlebarsTemplate(data);
  }
}
