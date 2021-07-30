import autoBind from 'auto-bind';
import Handlebars from 'handlebars';
import PubSub from 'pubsub-js';
import API from './api';
import { timeslotTypes } from '../utils/enum';
import { store } from '../utils/store';
import texts from '../utils/texts';
import Alert from './alert';

// init the timeslot component on page load

export default class {
  constructor(timeslotElement) {
    autoBind(this);
    this.api = new API();

    // query DOM
    // we know there is already a delivery at least section rendered
    this.DOM = {};
    this.DOM.timeslotTrigger = timeslotElement;
    this.DOM.timeslotModal = document.querySelector('.js-timeslot');
    this.DOM.modalClose = this.DOM.timeslotModal.querySelector('.js-close');
    this.DOM.actionBtn = this.DOM.timeslotModal.querySelector('.js-action-btn');
    this.DOM.accordionBottomContainer = document.querySelector(
      '.timeslot__accordion-container',
    );

    // event listeners
    this.DOM.timeslotTrigger.addEventListener('click', this.toogleModal);
    this.DOM.modalClose.addEventListener('click', this.toogleModal);
    this.isModalOpen = false;
    this.DOM.actionBtn.addEventListener('click', this.submitTimeslots);

    // set type and initial values
    this.type = store.context.timeslotType;
    // temp are use for current selection and the other 2 when we have submited them
    this.tempDeliveryTimeslot = null;
    this.tempPickupTimeslot = null;
    this.deliveryTimeslot = null;
    this.pickupTimeslot = null;

    // if we have this class we already have a delivery section rendered
    this.initDeliverySection();

    // save default accordion value to restore it later
    this.defaultAccordionValue = this.DOM.accordionBottomContainer.innerHTML;

    // select value if it is already set in the context
    this.preselectValues();
  }

  initModal() {
    if (
      this.type === timeslotTypes.deliveryOnly &&
      !this.tempDeliveryTimeslot
    ) {
      this.cleaModalFromSelections();
    } else if (
      this.type === timeslotTypes.deliveryAndPickup &&
      !this.tempDeliveryTimeslot &&
      !this.tempPickupTimeslot
    ) {
      this.cleaModalFromSelections();
    }
  }

  preselectValues() {
    if (this.type === timeslotTypes.deliveryOnly) {
      // todo we can use es11 and use optional chaining but jshint is not happy
      if (
        store.context.selectedTimeslots &&
        store.context.selectedTimeslots.delivery
      ) {
        console.log('preselecing');
        this.deliveryTimeslot = store.context.selectedTimeslots.delivery;
        this.preselectDeliveryTimeslot();
      }
    }
  }

  preselectDeliveryTimeslot() {
    // find and select day
    const dayElement = [...this.DOM.deliverySectionDays].find(
      (element) => element.dataset.date === this.deliveryTimeslot.date,
    );
    console.log(dayElement);
    // find and select hour
    const hourElement = [...this.DOM.deliveryHours].find(
      (element) => element.dataset.slotId === this.deliveryTimeslot.slotId,
    );

    // select only if we have both
    if (dayElement && hourElement) {
      this.selectDeliveryDay(dayElement);
      this.selectDeliveryHour(hourElement);
      this.updateAccordionValues();
    }
  }

  async submitTimeslots() {
    PubSub.publish('show_loader');
    const data = {
      storeID: store.context.storeID,
      delivery: {
        date: '2020-03-01',
        from: '10:00',
        to: '12:00',
        id: 1,
      },
    };

    // if we also have pickup add it to the data
    if (this.type === timeslotTypes.pickupAndDelivery) {
      data.pickup = {
        date: '2020-03-05',
        from: '12:00',
        to: '14:00',
        id: 12,
      };
    }
    const result = await this.api.submitTimeslots(data);
    if (result.status === 'success') {
      this.deliveryTimeslot = this.tempDeliveryTimeslot;
      if (this.type === timeslotTypes.pickupAndDelivery) {
        this.pickupTimeslot = this.tempPickupTimeslot;
      }
      this.updateAccordionValues();
      this.toogleModal();
    } else {
      const alert = new Alert({
        text: texts.genericErrorMessage,
        timeToKill: 5,
        type: 'error',
        showTimer: false,
      });
    }
    PubSub.publish('hide_loader');
  }

  initDeliverySection() {
    this.DOM.deliverySection = this.DOM.timeslotModal.querySelector(
      '.timeslot__section[data-type="delivery"]',
    );
    // setup delivery section
    // ==============================================================
    this.DOM.deliverySectionDays = this.DOM.deliverySection.querySelectorAll(
      '.js-days .timeslot__section-item',
    );
    this.DOM.deliverySectionHoursContainer =
      this.DOM.deliverySection.querySelector(
        '.timeslot__section-items-hours-container',
      );
    this.DOM.deliveryHoursSections =
      this.DOM.deliverySectionHoursContainer.querySelectorAll(
        '.timeslot__section-items',
      );
    this.DOM.deliveryHours =
      this.DOM.deliverySectionHoursContainer.querySelectorAll(
        '.timeslot__section-item',
      );

    // events for delivery section
    this.DOM.deliverySectionDays.forEach((day) => {
      day.addEventListener('click', () => {
        this.selectDeliveryDay(day);
      });
    });
    this.DOM.deliveryHours.forEach((hour) => {
      hour.addEventListener('click', () => {
        this.selectDeliveryHour(hour);
      });
    });

    // if there is only one date. Select it by default
    if (this.DOM.deliverySectionDays.length === 1) {
      this.selectDeliveryDay(this.DOM.deliverySectionDays[0]);
    }
  }

  initPickupSection() {
    // Query DOM
    this.DOM.pickupSection = this.DOM.timeslotModal.querySelector(
      '.timeslot__section[data-type="pickup"]',
    );
    this.DOM.pickupSectionDays = this.DOM.pickupSection.querySelectorAll(
      '.js-days .timeslot__section-item',
    );
    this.DOM.pickupSectionHoursContainer = this.DOM.pickupSection.querySelector(
      '.timeslot__section-items-hours-container',
    );
    this.DOM.pickupHoursSections =
      this.DOM.pickupSectionHoursContainer.querySelectorAll(
        '.timeslot__section-items',
      );
    this.DOM.pickupHours =
      this.DOM.pickupSectionHoursContainer.querySelectorAll(
        '.timeslot__section-item',
      );

    // Events
    this.DOM.pickupSectionDays.forEach((day) => {
      day.addEventListener('click', () => {
        this.selectPickupDay(day);
      });
    });
    this.DOM.pickupHours.forEach((hour) => {
      hour.addEventListener('click', () => {
        this.selectPickupHour(hour);
      });
    });
  }

  selectPickupDay(day) {
    // day is not available
    if (day.classList.contains('timeslot__section-item--unavailable')) return;

    // hide all hours sections
    this.DOM.pickupHoursSections.forEach((section) => {
      section.classList.add('d-none');
    });

    // show selected hours section
    const { date } = day.dataset;
    const pickupSection = this.DOM.pickupSectionHoursContainer.querySelector(
      `.timeslot__section-items[data-date="${date}"]`,
    );
    pickupSection.classList.remove('d-none');

    // remove selected class from days
    this.DOM.pickupSectionDays.forEach((dayItem) => {
      dayItem.classList.remove('timeslot__section-item--selected');
    });

    // add selected class to day
    day.classList.add('timeslot__section-item--selected');
  }

  selectPickupHour(hour) {
    // hour is not available
    if (hour.classList.contains('timeslot__section-item--unavailable')) return;

    // unselect all hours
    this.DOM.pickupHours.forEach((hourItem) => {
      hourItem.classList.remove('timeslot__section-item--selected');
    });

    // select hour
    hour.classList.add('timeslot__section-item--selected');

    // set temp delivery timeslot
    // only if the user clicks apply we set it permenantly
    this.tempPickupTimeslot = {
      date: hour.dataset.date,
      from: hour.dataset.from,
      to: hour.dataset.to,
      slotId: hour.dataset.slotId,
    };
    console.log(this.tempPickupTimeslot);

    // check the state of the apply button
    this.checkApplyFeasility();
  }

  selectDeliveryHour(hour) {
    // hour is not available
    if (hour.classList.contains('timeslot__section-item--unavailable')) return;

    // unselect all hours
    this.DOM.deliveryHours.forEach((hourItem) => {
      hourItem.classList.remove('timeslot__section-item--selected');
    });

    // select hour
    hour.classList.add('timeslot__section-item--selected');

    // set temp delivery timeslot
    // only if the user clicks apply we set it permenantly
    this.tempDeliveryTimeslot = {
      day: hour.dataset.day,
      date: hour.dataset.date,
      dateSmall: hour.dataset.dateSmall,
      from: hour.dataset.from,
      to: hour.dataset.to,
      slotId: hour.dataset.slotId,
    };
    console.log(this.tempDeliveryTimeslot);

    // if we the type is also pickup we need to make a call and get the pickup timeslots
    if (this.type === timeslotTypes.deliveryAndPickup) {
      this.createPickupTimeslotDOM();
    }

    // check the state of the apply button
    this.checkApplyFeasility();
  }

  selectDeliveryDay(day) {
    // day is not available. we allow
    // if (day.classList.contains('timeslot__section-item--unavailable')) return;

    // hide all hours sections
    this.DOM.deliveryHoursSections.forEach((section) => {
      section.classList.add('d-none');
    });

    // show selected hours section
    const { date } = day.dataset;
    const hoursSection = this.DOM.deliverySectionHoursContainer.querySelector(
      `.timeslot__section-items[data-date="${date}"]`,
    );
    hoursSection.classList.remove('d-none');

    // remove selected class from days
    this.DOM.deliverySectionDays.forEach((dayItem) => {
      dayItem.classList.remove('timeslot__section-item--selected');
    });

    // add selected class to day
    day.classList.add('timeslot__section-item--selected');
  }

  toogleModal() {
    if (this.isModalOpen) {
      this.closeModal();
    } else {
      this.openModal();
    }
    this.isModalOpen = !this.isModalOpen;
  }

  closeModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.timeslotModal.classList.remove('active');
  }

  openModal() {
    this.initModal();
    document.body.classList.add('hide-overflow');
    this.DOM.timeslotModal.classList.add('active');
  }

  cleaModalFromSelections() {
    // DELIVERY
    this.tempDeliveryTimeslot = null;
    // hide all hours sections
    this.DOM.deliveryHoursSections.forEach((section) => {
      section.classList.add('d-none');
    });
    // remove selected class from days
    this.DOM.deliverySectionDays.forEach((dayItem) => {
      dayItem.classList.remove('timeslot__section-item--selected');
    });
    // unselect all hours
    this.DOM.deliveryHours.forEach((hourItem) => {
      hourItem.classList.remove('timeslot__section-item--selected');
    });

    // PICKUP
    this.tempPickupTimeslot = null;
    // hide all hours sections
    if (this.DOM.pickupHoursSections) {
      this.DOM.pickupHoursSections.forEach((section) => {
        section.classList.add('d-none');
      });
    }
    // remove selected class from days
    if (this.DOM.pickupSectionDays) {
      this.DOM.pickupSectionDays.forEach((dayItem) => {
        dayItem.classList.remove('timeslot__section-item--selected');
      });
    }

    // unselect all hours
    if (this.DOM.pickupHours) {
      this.DOM.pickupHours.forEach((hourItem) => {
        hourItem.classList.remove('timeslot__section-item--selected');
      });
    }

    // remove the pickup section if exists
    if (this.DOM.pickupSection) {
      this.DOM.pickupSection.remove();
    }

    this.checkApplyFeasility();
  }

  updateAccordionValues() {
    // Clear inner html
    this.DOM.accordionBottomContainer.innerHTML = '';

    if (this.type === timeslotTypes.deliveryOnly) {
      if (!this.tempDeliveryTimeslot) {
        this.DOM.accordionBottomContainer.innerHTML =
          this.defaultAccordionValue;
      } else {
        const html = this.selectedDateAccordionTemplate(
          this.tempDeliveryTimeslot,
        );
        this.DOM.accordionBottomContainer.insertAdjacentHTML('beforeend', html);
      }
    }
  }

  selectedDateAccordionTemplate(timeslot, isDelivery) {
    console.log(timeslot);
    return `<div class="timeslot__item-selected">
    <img
      src="${store.context.imagesURL}/icons/timeslot-delivery.svg"
      alt=""
      class="timeslot__item-selected-icon"
    />
    <div class="timeslot__item-selected-copy">
      ${timeslot.day} ${timeslot.from} - ${timeslot.to}
    </div>
  </div>`;
  }

  checkApplyFeasility() {
    // todo
    if (this.type === timeslotTypes.deliveryOnly) {
      if (this.tempDeliveryTimeslot) {
        this.DOM.actionBtn.classList.remove('primary-btn--disabled');
      } else {
        this.DOM.actionBtn.classList.add('primary-btn--disabled');
      }
    } else if (this.type === timeslotTypes.deliveryAndPickup) {
      if (this.tempDeliveryTimeslot && this.tempPickupTimeslot) {
        this.DOM.actionBtn.classList.remove('primary-btn--disabled');
      } else {
        this.DOM.actionBtn.classList.add('primary-btn--disabled');
      }
    }
  }

  async createPickupTimeslotDOM() {
    PubSub.publish('show_loader');
    // remove the previous pickup section
    if (this.DOM.pickupSection) {
      this.DOM.pickupSection.remove();
    }
    // remove the previous pickup hours in case he selected
    this.tempPickupTimeslot = null;

    const dates = await this.api.getPickupDates(
      store.context.storeID,
      this.tempDeliveryTimeslot,
    );
    const html = await this.template(dates);
    this.DOM.deliverySection.insertAdjacentHTML('afterend', html);
    this.initPickupSection();
    PubSub.publish('hide_loader');
  }

  // eslint-disable-next-line class-methods-use-this
  async template(dates) {
    const templateData = {
      type: 'pickup',
      title: 'Παραλαβή',
      description: 'Ημέρα παραλαβής από το χώρο',
      days: dates.pickupDates,
    };

    // TODO dont compile the template every time
    const source = document.getElementById('timeslot-section-template');
    let HandlebarsTemplate;
    if (source) {
      HandlebarsTemplate = Handlebars.compile(source.innerHTML);
    }
    // console.log(HandlebarsTemplate(templateData));
    return HandlebarsTemplate(templateData);
  }
}
