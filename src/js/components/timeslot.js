import autoBind from 'auto-bind';
import Handlebars from 'handlebars';
import { timeslotTypes } from '../utils/enum';

export default class {
  constructor(timeslotElement) {
    autoBind(this);

    // query DOM
    this.DOM = {};
    this.DOM.timeslotTrigger = timeslotElement;
    this.DOM.timeslotModal = document.querySelector('.js-timeslot');
    this.DOM.modalClose = this.DOM.timeslotModal.querySelector('.js-close');
    this.DOM.deliverySection = this.DOM.timeslotModal.querySelector(
      '.timeslot__section[data-type="delivery"]',
    );
    this.DOM.pickupSection = this.DOM.timeslotModal.querySelector(
      '.timeslot__section[data-type="pickup"]',
    );

    // event listeners
    this.DOM.timeslotTrigger.addEventListener('click', this.toogleModal);
    this.DOM.modalClose.addEventListener('click', this.toogleModal);
    this.isModalOpen = false;

    // setup type
    if (this.DOM.deliverySection && this.DOM.pickupSection) {
      this.type = timeslotTypes.deliveryAndPickup;
    } else {
      this.type = timeslotTypes.deliveryOnly;
    }

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

    if (this.type === timeslotTypes.deliveryAndPickup) {
      // setup pickup section
      // ==============================================================
      this.DOM.pickupSectionDays = this.DOM.pickupSection.querySelectorAll(
        '.js-days .timeslot__section-item',
      );
      this.DOM.pickupSectionHoursContainer =
        this.DOM.pickupSection.querySelector(
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

      // events for pickup section
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
      date: hour.dataset.date,
      from: hour.dataset.from,
      to: hour.dataset.to,
      slotId: hour.dataset.slotId,
    };
    console.log(this.tempDeliveryTimeslot);
  }

  selectDeliveryDay(day) {
    // day is not available
    if (day.classList.contains('timeslot__section-item--unavailable')) return;

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

  initModal() {
    this.tempDeliveryTimeslot = null;
    // todo set the selected delivery timeslot
  }

  updateAccordionValues() {
    // todo
  }

  checkApplyFeasility() {
    // todo
  }
}
