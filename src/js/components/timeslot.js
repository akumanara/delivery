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
    // on Delivery only there a delivery section
    // on Delivery and Pickup there are two sections. The prerender serction is pickup
    this.queryTheDOM(timeslotElement);
    this.setupEventListeners();
    this.init();
  }

  queryTheDOM(timeslotElement) {
    this.DOM = {};
    // Trigger and accordion
    this.DOM.timeslotTrigger = timeslotElement;
    this.DOM.accordionBottomContainer = document.querySelector(
      '.timeslot__trigger .timeslot__accordion-container',
    );
    this.DOM.accordionTopContainer = document.querySelector(
      '.timeslot__trigger .delivery-type__option-header-top',
    );
    this.DOM.accordionTrigger = document.querySelector('.timeslot__trigger');

    // Main Modal
    this.DOM.timeslotModal = document.querySelector('.js-timeslot');
    this.DOM.modalClose = this.DOM.timeslotModal.querySelector('.js-close');
    this.DOM.actionBtn = this.DOM.timeslotModal.querySelector('.js-action-btn');

    // Modal (A LVL ALERT) for no available timeslots
    this.DOM.noAvailableTimeslotsModal = document.querySelector(
      '.js-no-timeslot-modal',
    );
    this.DOM.noAvailableTimeslotsModalClose =
      this.DOM.noAvailableTimeslotsModal.querySelector('.js-close');
    this.DOM.noAvailableTimeslotsModalBtn =
      this.DOM.noAvailableTimeslotsModal.querySelector('.js-action-btn');
    this.isNoSlotsModalOpen = false;
    this.DOM.noAvailableTimeslotsModalClose.addEventListener(
      'click',
      this.toggleNoSlotsModal,
    );
    this.DOM.noAvailableTimeslotsModalBtn.addEventListener(
      'click',
      this.toggleNoSlotsModal,
    );
  }

  setupEventListeners() {
    // event listeners
    this.DOM.timeslotTrigger.addEventListener('click', this.toogleModal);
    this.DOM.modalClose.addEventListener('click', this.toogleModal);
    this.isModalOpen = false;
    this.DOM.actionBtn.addEventListener('click', this.submitTimeslots);
  }

  init() {
    // set type and initial values
    this.type = store.context.timeslotType; // delivery_and_pickup || delivery_only
    // temp are use for current user selection and the other 2 when we have also submited them
    this.tempDeliveryTimeslot = null;
    this.tempPickupTimeslot = null;
    this.deliveryTimeslot = null;
    this.pickupTimeslot = null;

    // if type is delivery_only we already have only a delivery section rendered
    // if type is delivery_and_pickup we have only a pickup section rendered
    if (this.type === timeslotTypes.deliveryOnly) {
      this.initDeliverySection();
    }
    // else if (this.type === timeslotTypes.deliveryAndPickup) {
    //   this.initPickupSection();
    // }

    // save default accordion value to restore it later
    this.defaultBottomAccordionValue =
      this.DOM.accordionBottomContainer.innerHTML;
    this.defaultTopAccordionValue = this.DOM.accordionBottomContainer.innerHTML;

    // select value if it is already set in the context
    this.preselectValues();

    // Check for no available timeslots
    this.checkForNoTimeslots();

    // Check for expired submitted timeslots in order to show alert
    if (
      (this.deliveryTimeslot && this.deliveryTimeslot.expired) ||
      (this.pickupTimeslot && this.pickupTimeslot.expired)
    ) {
      const alert = new Alert({
        text: texts.timeslotExpiredSelected,
        timeToKill: 5,
        type: 'error',
        showTimer: false,
      });
    }
  }

  checkForNoTimeslots() {
    if (store.context.noAvailableTimeslots) {
      this.toggleNoSlotsModal();
    }
  }

  toggleNoSlotsModal() {
    if (this.isNoSlotsModalOpen) {
      this.closeNoSlotsModal();
    } else {
      this.openNoSlotsModal();
    }
    this.isNoSlotsModalOpen = !this.isNoSlotsModalOpen;
  }

  closeNoSlotsModal() {
    document.body.classList.remove('hide-overflow');
    this.DOM.noAvailableTimeslotsModal.classList.remove('active');
  }

  openNoSlotsModal() {
    document.body.classList.add('hide-overflow');
    this.DOM.noAvailableTimeslotsModal.classList.add('active');
  }

  initModal() {
    if (this.type === timeslotTypes.deliveryOnly) {
      if (this.deliveryTimeslot) {
        this.preselectDeliveryTimeslot();
      } else {
        this.cleaModalFromSelections();
      }
    } else if (this.type === timeslotTypes.deliveryAndPickup) {
      if (this.deliveryTimeslot && this.pickupTimeslot) {
        this.preselectDeliveryAndPickupTimeslots();
      } else {
        this.cleaModalFromSelections();
      }
    }
  }

  preselectValues() {
    if (this.type === timeslotTypes.deliveryOnly) {
      // todo we can use es11 and use optional chaining but jshint is not happy
      if (
        store.context.selectedTimeslots &&
        store.context.selectedTimeslots.delivery
      ) {
        this.deliveryTimeslot = store.context.selectedTimeslots.delivery;
        this.preselectDeliveryTimeslot();
      }
    } else if (this.type === timeslotTypes.deliveryAndPickup) {
      if (
        store.context.selectedTimeslots &&
        store.context.selectedTimeslots.delivery &&
        store.context.selectedTimeslots.pickup
      ) {
        this.deliveryTimeslot = store.context.selectedTimeslots.delivery;
        this.pickupTimeslot = store.context.selectedTimeslots.pickup;
        this.preselectDeliveryAndPickupTimeslots();
      }
    }
  }

  async preselectDeliveryTimeslot() {
    // find and select day
    const dayElement = [...this.DOM.deliverySectionDays].find(
      (element) => element.dataset.date === this.deliveryTimeslot.date,
    );

    // find and select hour
    const hourElement = [...this.DOM.deliveryHours].find(
      (element) => element.dataset.slotId === this.deliveryTimeslot.slotId,
    );

    // select only if we have both
    if (dayElement && hourElement) {
      this.selectDeliveryDay(dayElement);
      await this.selectDeliveryHour(hourElement);
      this.updateAccordionValues();
    }
  }

  async preselectPickupTimeslot() {
    // find and select day
    const dayElement = [...this.DOM.pickupSectionDays].find(
      (element) => element.dataset.date === this.pickupTimeslot.date,
    );
    // find and select hour
    const hourElement = [...this.DOM.pickupHours].find(
      (element) => element.dataset.slotId === this.pickupTimeslot.slotId,
    );

    // select only if we have both
    if (dayElement && hourElement) {
      this.selectPickupDay(dayElement);
      this.selectPickupHour(hourElement);
      this.updateAccordionValues();
    }
  }

  async preselectDeliveryAndPickupTimeslots() {
    await this.preselectDeliveryTimeslot();
    await this.preselectPickupTimeslot();
  }

  async submitTimeslots() {
    PubSub.publish('show_loader');
    const data = {
      delivery: {
        date: this.tempDeliveryTimeslot.date,
        from: this.tempDeliveryTimeslot.from,
        to: this.tempDeliveryTimeslot.to,
        id: this.tempDeliveryTimeslot.slotId,
      },
    };

    // if we also have pickup add it to the data
    if (this.type === timeslotTypes.deliveryAndPickup) {
      data.pickup = {
        date: this.tempPickupTimeslot.date,
        from: this.tempPickupTimeslot.from,
        to: this.tempPickupTimeslot.to,
        id: this.tempPickupTimeslot.slotId,
      };
    }
    const result = await this.api.submitTimeslots(data);
    if (result.status === 'success') {
      this.deliveryTimeslot = this.tempDeliveryTimeslot;
      if (this.type === timeslotTypes.deliveryAndPickup) {
        this.pickupTimeslot = this.tempPickupTimeslot;
      }
      this.updateAccordionValues();
      // clear previously expired timeslots
      this.clearExpiredTimeslots();
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

  clearExpiredTimeslots() {
    // remove all icons
    this.DOM.timeslotModal
      .querySelectorAll('.timeslot__section-item-alert')
      .forEach((element) => {
        element.remove();
      });
    this.DOM.timeslotModal
      .querySelectorAll('.timeslot__section-item--unavailable-red')
      .forEach((element) => {
        element.classList.remove('timeslot__section-item--unavailable-red');
      });
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
      day: hour.dataset.day,
      date: hour.dataset.date,
      dateSmall: hour.dataset.dateSmall,
      from: hour.dataset.from,
      to: hour.dataset.to,
      slotId: hour.dataset.slotId,
    };
    console.log(this.tempPickupTimeslot);

    // check the state of the apply button
    this.checkApplyFeasility();
  }

  async selectDeliveryHour(hour) {
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

    // if we the type is also pickup we need to make a call and get the pickup timeslots
    if (this.type === timeslotTypes.deliveryAndPickup) {
      await this.createPickupTimeslotDOM();
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
      if (!this.deliveryTimeslot) {
        // setting default values
        this.DOM.accordionBottomContainer.innerHTML =
          this.defaultBottomAccordionValue;
        this.DOM.accordionTopContainer.innerHTML =
          this.defaultTopAccordionValue;
      } else {
        let html;
        if (this.deliveryTimeslot.expired) {
          this.alertExpiredSelectedDates = true;
          html = this.selectedDateAccordionTemplate(
            this.deliveryTimeslot,
            true,
          );
          // add an error class to selected hour timeslot inside the modal
          // find hour element
          const hourElement = [...this.DOM.deliveryHours].find(
            (element) =>
              element.dataset.slotId === this.deliveryTimeslot.slotId,
          );
          hourElement.classList.add('timeslot__section-item--unavailable-red');
          // get error icons template
          const errorIconHTML = this.errorImageTemplate();
          hourElement
            .querySelector('.timeslot__section-item-inner')
            .insertAdjacentHTML('afterbegin', errorIconHTML);
        } else {
          html = this.selectedDateAccordionTemplate(
            this.deliveryTimeslot,
            false,
          );
        }
        this.DOM.accordionBottomContainer.insertAdjacentHTML('beforeend', html);
        this.DOM.accordionTopContainer.innerHTML = texts.timeslotSelected;
      }
    } else if (this.type === timeslotTypes.deliveryAndPickup) {
      if (!this.deliveryTimeslot && !this.pickupTimeslot) {
        // setting default values
        this.DOM.accordionBottomContainer.innerHTML =
          this.defaultBottomAccordionValue;
        this.DOM.accordionTopContainer.innerHTML =
          this.defaultTopAccordionValue;
      } else {
        let html;
        console.log(this.deliveryTimeslot.expired);
        if (this.deliveryTimeslot.expired) {
          this.alertExpiredSelectedDates = true;
          html = this.selectedDateAccordionTemplate(
            this.deliveryTimeslot,
            true,
          );
          // add an error class to selected hour timeslot inside the modal
          // find hour element
          const hourElement = [...this.DOM.deliveryHours].find(
            (element) =>
              element.dataset.slotId === this.deliveryTimeslot.slotId,
          );
          hourElement.classList.add('timeslot__section-item--unavailable-red');
          // get error icons template
          const errorIconHTML = this.errorImageTemplate();
          hourElement
            .querySelector('.timeslot__section-item-inner')
            .insertAdjacentHTML('afterbegin', errorIconHTML);
        } else {
          html = this.selectedDateAccordionTemplate(
            this.deliveryTimeslot,
            false,
          );
        }

        if (this.pickupTimeslot.expired) {
          this.alertExpiredSelectedDates = true;
          html += this.selectedDateAccordionTemplate(
            this.pickupTimeslot,
            true,
            true,
          );
          // add an error class to selected hour timeslot inside the modal
          // find hour element
          const hourElement = [...this.DOM.pickupHours].find(
            (element) => element.dataset.slotId === this.pickupTimeslot.slotId,
          );
          hourElement.classList.add('timeslot__section-item--unavailable-red');
          // get error icons template
          const errorIconHTML = this.errorImageTemplate();
          hourElement
            .querySelector('.timeslot__section-item-inner')
            .insertAdjacentHTML('afterbegin', errorIconHTML);
        } else {
          html += this.selectedDateAccordionTemplate(
            this.pickupTimeslot,
            false,
            true,
          );
        }
        this.DOM.accordionBottomContainer.insertAdjacentHTML('beforeend', html);
        this.DOM.accordionTopContainer.innerHTML = texts.timeslotSelected;
      }
    }
  }

  errorImageTemplate() {
    return `<img
    src="./images/icons/timeslot-alert.svg"
    alt=""
    class="timeslot__section-item-alert"
  />`;
  }

  selectedDateAccordionTemplate(timeslot, isExpired, flipArrow = false) {
    return `<div class="timeslot__item-selected ${
      isExpired ? 'timeslot__item-selected--error' : ''
    } js-delivery-timeslot">
    <img
      src="${store.context.imagesURL}/icons/timeslot-delivery${
      isExpired ? '-error' : ''
    }.svg"
      alt=""
      class="timeslot__item-selected-icon ${flipArrow ? 'flip-vertically' : ''}"
    />
    <div class="timeslot__item-selected-copy">
      ${timeslot.day} ${timeslot.from} - ${timeslot.to}
    </div>
  </div>`;
  }

  checkApplyFeasility() {
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
