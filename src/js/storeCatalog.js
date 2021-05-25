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
      slidesOffsetAfter: 16,
      slidesOffsetBefore: 16,
      loop: false,
      centeredSlides: true,
      centeredSlidesBounds: true,
      freeMode: true,
      freeModeMomentumBounce: false,
      resistanceRatio: 0,
    });

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
      item.addEventListener('click', () => {
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
