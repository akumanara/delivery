import Swiper from 'swiper';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { throttle } from 'lodash';

import FastAverageColor from 'fast-average-color';

class App {
  constructor() {
    const fac = new FastAverageColor();
    document.querySelectorAll('.card').forEach((card) => {
      fac
        .getColorAsync(card.querySelector('.card__img'))
        .then((color) => {
          if (color.isLight) {
            card.classList.add('card--dark');
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });

    // console.log(throttle);
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    this.triggeringScrollEvents = true;

    this.swiper = new Swiper('.swiper-container', {
      slidesPerView: 'auto',
      spaceBetween: 0,
      loop: false,
      // centeredSlides: true,
      // centeredSlidesBounds: true,
      freeMode: true,
      freeModeMomentumBounce: false,
      resistanceRatio: 0,
    });

    this.DOM = {
      sections: document.querySelectorAll('.menu__category'),
      swiperItems: document.querySelectorAll('.categories__item'),
    };

    this.init();
  }

  init() {
    // set scrolltrigger for each section
    this.DOM.sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top-=20px top+=108px', // when the top of the trigger hits the top of the viewport
        end: 'bottom-=100px top+=108px', // when the bottom of the trigger hits the top of the viewport
        markers: false,
        onEnter: () => {
          this.enterCategory(index);
        },
        onEnterBack: () => {
          this.enterBackCategory(index);
        },
        onLeave: () => {
          this.leaveCategory(index);
        },
        onLeaveBack: () => {
          this.leaveBackCategory(index);
        },
      });
    });

    // set click events for swiper items
    this.DOM.swiperItems.forEach((item, index) => {
      item.addEventListener('click', (e) => {
        this.triggeringScrollEvents = false;
        this.setItem(index);
        gsap.to(window, {
          onComplete: () => {
            this.triggeringScrollEvents = true;
          },
          duration: 0.6,
          scrollTo: { y: this.DOM.sections[index], offsetY: 120 },
        });
      });
    });
  }

  enterCategory(index) {
    if (!this.triggeringScrollEvents) return;
    // console.log(`entered ${index}`);
    this.setItem(index);
  }

  enterBackCategory(index) {
    if (!this.triggeringScrollEvents) return;
    // console.log(`entered back ${index}`);
    this.setItem(index);
  }

  leaveCategory(index) {
    // console.log(`leave ${index}`);
  }

  leaveBackCategory(index) {
    // console.log(`leave back ${index}`);
  }

  setItem(index) {
    this.swiper.slideTo(index, 300, true);
    this.removeActiveFromAll();
    this.makeActive(index);
  }

  removeActiveFromAll() {
    this.DOM.swiperItems.forEach((item) => {
      item.classList.remove('active');
    });
  }

  makeActive(index) {
    this.DOM.swiperItems[index].classList.add('active');
  }
}
const app = new App();
