import { gsap, ScrollToPlugin, ScrollTrigger } from 'gsap/all';
import Swiper from 'swiper';

export default class {
  constructor() {
    // Scroll with categories swiper
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    this.DOM = {
      slider: document.querySelector('.store-menu__slider'),
      sections: document.querySelectorAll('.store-menu__catalog-section'),
      swiperItems: document.querySelectorAll('.store-menu__slider-item'),
    };

    this.triggeringScrollEvents = true;
    this.swiper = new Swiper(this.DOM.slider, {
      slidesPerView: 'auto',
      spaceBetween: 16,
      loop: false,
      // Those two create a bug with  the offset
      // centeredSlides: true,
      // centeredSlidesBounds: true,
      freeMode: true,
      freeModeMomentumBounce: false,
      resistanceRatio: 0,
      // slidesOffsetAfter: 16,
      // slidesOffsetBefore: 16,
    });
    this.calculateVars();
    this.init();
  }

  calculateVars() {
    this.options = {};
    this.options.offsetY = this.DOM.slider.offsetHeight;
    const thresholdChangeSection = 10;
    this.options.scrolltrigger = {
      triggerStart: `top-=0`,
      viewportStart: `top+=${this.options.offsetY + thresholdChangeSection}px`,
      triggerEnd: `bottom-=${this.options.offsetY}px`,
      viewportEnd: `top+=${this.options.offsetY + thresholdChangeSection}px`,
    };
  }

  init() {
    // set scrolltrigger for each section
    this.DOM.sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: `${this.options.scrolltrigger.triggerStart} ${this.options.scrolltrigger.viewportStart}`, // when the top of the trigger hits the top of the viewport
        end: `${this.options.scrolltrigger.triggerEnd} ${this.options.scrolltrigger.viewportEnd}`, // when the top of the trigger hits the top of the viewport
        markers: true,
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
      item.addEventListener('click', () => {
        this.triggeringScrollEvents = false;
        this.setItem(index);

        gsap.to(window, {
          onComplete: () => {
            this.triggeringScrollEvents = true;
          },
          duration: 0.3,
          scrollTo: {
            y: this.DOM.sections[index],
            offsetY: this.options.offsetY,
          },
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
    if (index === 0) {
      // the user scrolled before the first item. deselect all
      this.removeActiveFromAll();
    }
  }

  setItem(index) {
    if (this.swiper) {
      this.swiper.slideTo(index, 300, true);
    }
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

  refreshScrollTrigger() {
    ScrollTrigger.refresh(true);
  }
}
