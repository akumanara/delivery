import { gsap, Linear } from 'gsap/all';
import autoBind from 'auto-bind';
import randomstring from 'randomstring';
import Handlebars from 'handlebars';
import RAFManager from 'raf-manager';
import { store } from './store';

const formatTimer = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(14, 5);

// const options = {
//   text: 'this is the text alert', // the text to show in the alert
//   timeToKill: 4, // time until it closes in seconds
//   type: 'info', // or 'error'
//   iconName: 'phone', // must exists in folder icons with svg extension.
//   showTimer: false, // displays or not the countdown
// };
export default class {
  constructor(options) {
    this.options = options;
    autoBind(this);
    this.isDone = false;
    this.randomString = randomstring.generate({
      length: 7,
      charset: 'alphabetic',
    });
    this.isAnimating = false;
    this.addDom();
    this.DOM.querySelector('.alert__close').addEventListener(
      'click',
      this.hide,
    );

    // progress
    this.progress = this.DOM.querySelector('.alert__progress');
    gsap.set(this.progress, {
      scaleX: 0,
    });

    // if timer
    if (this.options.showTimer) {
      this.timer = this.DOM.querySelector('.alert__timer');
      this.timer.innerHTML = formatTimer(this.options.timeToKill);
      RAFManager.add(this.updateTimer);
    }

    this.show();
  }

  updateTimer() {
    if (this.progressTimeline && !this.isAnimating) {
      // get time elapsed in seconds
      const remainingSeconds =
        this.options.timeToKill - this.progressTimeline.time() + 1;

      // update dom
      this.timer.innerHTML = formatTimer(remainingSeconds);
    }
  }

  show() {
    this.isAnimating = true;
    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        this.startCountdown();
      },
    });
    tl.to(this.DOM, { autoAlpha: 1, y: 0, duration: 0.3 });
  }

  hide() {
    this.isAnimating = true;
    gsap.killTweensOf(this.progress);

    const tl = gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        this.removeDom();
      },
    });
    // added a small delay for aesthetics
    tl.to(this.DOM, { autoAlpha: 0, y: -10, duration: 0.3 }, '+=.1');
  }

  removeDom() {
    this.DOM.remove();
    if (this.options.showTimer) {
      RAFManager.remove(this.updateTimer);
    }
    this.isDone = true;
  }

  addDom() {
    const html = this.template();
    document.body.insertAdjacentHTML('beforeend', html);
    this.DOM = document.querySelector(`.${this.randomString}`);
    gsap.set(this.DOM, { autoAlpha: 0, y: -10 });
  }

  startCountdown() {
    this.progressTimeline = gsap.timeline({
      onComplete: () => {
        this.hide();
      },
    });
    this.progressTimeline.to(this.progress, {
      scaleX: 1,
      duration: this.options.timeToKill,
      ease: Linear.easeNone,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  template() {
    const templateData = {
      randomString: this.randomString,
      text: this.options.text,
      typeClass: this.options.type === 'info' ? '' : 'alert--red',
      iconURL: `${store.context.imagesURL}/icons/${this.options.iconName}.svg`,
      showTimer: this.options.showTimer,
    };
    // TODO dont compile the template every time
    const source = document.getElementById('alert');
    let HandlebarsTemplate;
    if (source) {
      HandlebarsTemplate = Handlebars.compile(source.innerHTML);
    }

    return HandlebarsTemplate(templateData);
  }
}
