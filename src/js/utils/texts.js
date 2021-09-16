// using es6-string-html vscode plugin for format

import { store } from './store';

export default {
  // Product (group options and variants)
  mandatory: 'Υποχρεωτική επιλογή',
  optional: 'Πρόσθεσε προαιρετικά',
  maxLimit: (x) => `Μέγιστος αριθμός επιλογών: ${x}`,
  variantName: 'Eπιλογές',
  // Delivery type accordion
  delivery: 'Delivery',
  deliveryFee: (x) => `Ελάχιστη παραγγελία - ${x}`,
  unsupportedAddress: (x) => `Δεν παραδίδουμε σε ${x}`,
  unsupportedAddressInChooseAddressModal: `Εκτός ορίων παράδοσης`,
  takeaway: 'Takeaway',
  takeawayLocation: (x) => `Κατάστημα - ${x}`,
  // Checkout payment types
  paymentType: {
    notSelected: {
      top: `Διάλεξε τρόπο πληρωμής`,
      bottom: `<img src="${store.context.imagesURL}icons/add-card.svg" alt="" class="img-fluid mw-22 mr-10"><div>Προσθήκη νέας κάρτας</div>`,
      opened: `Διάλεξε τρόπο πληρωμής`,
    },
    cash: {
      top: `Πληρωμή με μετρητά`,
      bottom: `<img src="${store.context.imagesURL}icons/cash.svg" alt="" class="img-fluid mw-22 mr-10"><div>Μετρητά</div>`,
      opened: `Πληρωμή με μετρητά`,
    },
    pos: {
      top: `Πληρωμή με χρεωστική ή πιστωτική κάρτα`,
      /* html */
      bottom: `
        <img src="${store.context.imagesURL}icons/pos.svg" alt="" class="img-fluid mw-22 mr-10">
        <div>POS</div>
      `,
      opened: `Πληρωμή με χρεωστική ή πιστωτική κάρτα`,
    },
    saved: {
      top: (tag) => `Τρόπος πληρωμής ― ${tag}`,
      /* html */
      bottom: (lastDigits) =>
        `
          <img src="${store.context.imagesURL}icons/visa.svg" alt="" class="img-fluid mw-22 mr-10">
          <div>•••• ${lastDigits}</div>
        `,
      opened: (tag) => `Τρόπος πληρωμής ― ${tag}`,
    },
    expired: {
      top: `Αυτή η κάρτα έχει λήξει!`,
      /* html */
      bottom: (lastDigits) =>
        `
          <img src="${store.context.imagesURL}icons/no-card-red.svg" alt="" class="img-fluid mw-22 mr-10">
          <div>•••• ${lastDigits}</div>
        `,
      opened: `Αυτή η κάρτα έχει λήξει!`,
    },
    new: {
      top: (tag) => `Επιλεγμένος τρόπος πληρωμής ― ${tag}`,
      /* html */
      bottom: `
        <img src="${store.context.imagesURL}icons/card.svg" alt="" class="img-fluid mw-22 mr-10">
        <div>Πιστωτική κάρτα</div>
      `,
      opened: (tag) => `Επιλεγμένος τρόπος πληρωμής ― ${tag}`,
    },
  },
  autocompleteNoResults: `Δεν βρήκες τη διεύθυνση σου; Πάτησε εδώ.`,
  genericErrorMessage: `Κάτι πήγε στραβά`,
  micNotAllowed: `Δεν έγινε αποδοχή χρήσης μικροφώνου`,
  clickToCallSuccess: `Τέλεια! Θα σε καλέσουμε σύντομα εδώ.`,
  login: {
    invalidPhoneOrEmail: 'Μη έγκυρο τηλέφωνο ή email',
    userIsSocialLoginError:
      'Δεν εντοπίσαμε το προφίλ. Δοκίμασε να συνδεθείς μέσω social media.',
    wrongPassword: 'Δε βρίσκουμε τον κωδικό σου. Δοκίμασε ξανά!',
  },
  verify: {
    wrongOTP:
      'Φαίνεται ότι ο κωδικός επιβεβαίωσης δεν είναι σωστός. Μπορείς να ξαναδοκιμάσεις;',
  },
  resetPasswordDifferentPasswords:
    'Μμμ, οι δύο κωδικοί δεν είναι ίδιοι. Δοκίμασε ξανά!',
  resetPasswordSuccess:
    'Έχεις πια νέο κωδικό! Κάνε τη σύνδεσή σου χρησιμοποιώντας αυτόν.',
  resetPasswordRequestSuccess:
    'Σου στέλνουμε email για την αλλαγή! Δες και στα ανεπιθύμητα.',
  timeslotDefault: 'Διαθέσιμες ώρες παράδοσης - Σημερά',
  timeslotSelected: 'Επιλεγμένη ημερομηνία',
  timeslotPickupTitle: 'Παραλαβή',
  timeslotPickupDescription:
    'Πότε προτιμάς να γίνει η παραλαβή από την επιλεγμένη διεύθυνση;',
  timeslotExpiredSelected:
    'Αυτή η επιλογή δεν είναι πλέον διαθέσιμη. Δοκίμασε μια άλλη!',
  timeslotDeliveryTitle: 'Παράδοση',
  timeslotDeliveryDescription:
    'Πότε προτιμάς να γίνει η παράδοση στην επιλεγμένη διεύθυνση;',
  order: {
    statusCompleted: 'Ολοκληρώθηκε',
    statusCancelled: 'Ακυρώθηκε',
  },
  ratingSuccess: 'h vathmologia sou apothikeftike. TODO',
  deleteCardSuccess: 'h karta sas diagrafike. TODO',
};
