// using es6-string-html vscode plugin for format

import { store } from './store';

export default {
  // Product (group options and variants)
  mandatory: 'Yποχρεωτικό',
  optional: 'Προαιρετικό',
  maxLimit: (x) => `Μέγιστος αριθμός επιλογών: ${x}`,
  variantName: 'επιλογές',
  // Delivery type accordion
  delivery: 'Delivery',
  deliveryFee: (x) => `Ελάχιστη παραγγελία - ${x}`,
  unsupportedAddress: (x) => `No delivery to ${x}`,
  unsupportedAddressInChooseAddressModal: `No delivery to this address!`,
  takeaway: 'Takeaway',
  takeawayLocation: (x) => `Κατάστημα - ${x}`,
  // Checkout payment types
  paymentType: {
    notSelected: {
      top: `Choose payment method to proceed`,
      bottom: `<img src="${store.context.imagesURL}icons/add-card.svg" alt="" class="img-fluid mw-22 mr-10"><div>Add a Card</div>`,
      opened: `Choose payment method to proceed`,
    },
    cash: {
      top: `You can pay with cash`,
      bottom: `<img src="${store.context.imagesURL}icons/cash.svg" alt="" class="img-fluid mw-22 mr-10"><div>Μετρητά</div>`,
      opened: `You can pay with cash`,
    },
    pos: {
      top: `Pay by credit or debit card`,
      /* html */
      bottom: `
        <img src="${store.context.imagesURL}icons/pos.svg" alt="" class="img-fluid mw-22 mr-10">
        <div>POS</div>
      `,
      opened: `Pay by credit or debit card`,
    },
    saved: {
      top: (tag) => `${tag} ― Payment method`,
      /* html */
      bottom: (lastDigits) =>
        `
          <img src="${store.context.imagesURL}icons/visa.svg" alt="" class="img-fluid mw-22 mr-10">
          <div>•••• ${lastDigits}</div>
        `,
      opened: (tag) => `${tag} ― Payment method`,
    },
    expired: {
      top: `This card has expired!`,
      /* html */
      bottom: (lastDigits) =>
        `
          <img src="${store.context.imagesURL}icons/no-card-red.svg" alt="" class="img-fluid mw-22 mr-10">
          <div>•••• ${lastDigits}</div>
        `,
      opened: `This card has expired!`,
    },
    new: {
      top: (tag) => `${tag} - Card was chosen as payment method`,
      /* html */
      bottom: `
        <img src="${store.context.imagesURL}icons/card.svg" alt="" class="img-fluid mw-22 mr-10">
        <div>Card</div>
      `,
      opened: (tag) => `${tag} - Card was chosen as payment method`,
    },
  },
  autocompleteNoResults: `Δεν βρήκες τη διεύθυνση σου; Πάτησε εδώ.`,
  genericErrorMessage: `Κάτι πήγε στραβά`,
  micNotAllowed: `Δεν έγινε αποδοχή χρήσης μικροφώνου`,
  clickToCallSuccess: `Thank you for feedback, we will contact you shortly`,
  login: {
    invalidPhoneOrEmail: 'Μη έγκυρο τηλέφωνο ή email',
    userIsSocialLoginError:
      'Δεν εντοπίσαμε το προφίλ. Δοκίμασε να συνδεθείς μέσω social media.',
    wrongPassword: 'Λάθος κωδικός.',
  },
  verify: {
    wrongOTP: 'Λάθος κωδικός OTP',
  },
  resetPasswordDifferentPasswords: 'Οι κωδικοι δεν ειναι ιδιοι',
  resetPasswordSuccess: 'Ο κωδικος προσβασης άλλαξε',
  resetPasswordRequestSuccess:
    'Αν ο χρήστης υπάρχει, θα σας αποσταλλεί email για την αλλαγή του κωδικού σας! Εάν δεν το βλέπετε ελέγξτε την ανεπιθύμητη αλληλογραφία σας.',
  timeslotDefault: 'Διαθέσιμες ώρες παράδοσης - Σημερά',
  timeslotSelected: 'Επιλεγμένη ημερομηνία',
  timeslotPickupTitle: 'Παραλαβή',
  timeslotPickupDescription: 'Ημέρα παράδοσης στο χώρο σου',
  timeslotExpiredSelected:
    'Οι προγραμματισμένες ώρες που διάλεξες δεν είναι πλέον διαθέσιμες',
  timeslotDeliveryTitle: 'Παράδοση',
  timeslotDeliveryDescription: 'Ημέρα παράδοσης στο χώρο',
  order: {
    statusCompleted: 'Ολοκληρώθηκε',
    statusCancelled: 'Ακυρώθηκε',
  },
};
