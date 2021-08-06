const deliveryTypes = {
  DELIVERY: 'delivery',
  TAKEAWAY: 'takeaway',
};

const paymentTypes = {
  CASH: 'cash',
  POS: 'pos',
  SAVED_CARD: 'saved_card',
  NEW_CARD: 'new_card',
  EXPIRED_CARD: 'expired_card',
};

const loginWithEmailResponses = {
  SHOW_PASSWORD: 'show_password',
  SHOW_OTP: 'show_otp',
  SHOW_INFOBOX: 'show_infobox',
  SHOW_NEW_USER: 'show_new_user',
};

const mergeResponsesTypes = {
  SHOW_VERIFICATION_INPUT: 'mail_verification',
  SHOW_CONSENT: 'no_verification',
};

const timeslotTypes = {
  deliveryOnly: 'delivery_only',
  deliveryAndPickup: 'delivery_and_pickup',
};

// typoi prosforon
// -----------------------------
// -----------------------------
// Έκπτωση με ποσοστό στο Φθηνότερο προϊόν
// - to fthinotero proion tis prosforas exei ektposi me pososto

// Έκπτωση με ποσοστό σε συγκεκριμένο προϊόν
// - to ena apo ta proionta (sigekrimeno) tis prosforas exei ektposi me pososto

// Σταθερή τιμή σε συγκεκριμένο προϊόν
// - to ena apo ta proionta (sigekrimeno) tis prosforas exei fixed timi (h posostiaia h xrimatiki ekptosi)

// Σταθέρη χρέωση προσφοράς
// - oti proion kai na valeis i prosfora exei fixed timi

// Έκπτωση χρηματική στο σύνολο της προσφοράς
// - sto sinoliko kostos ton proionton ginete apply ena meion X euro

// Έκπτωση με ποσοστό στο σύνολο της προσφοράς
// - sto sinoliko kostos ton proionton ginete apply ena meion X pososto

const offerTypes = {
  discountPercentageOnCheapestProduct: 0,
  discountPercentageOnSpecificOfferCategory: 1,
  fixedPriceOnSpecificOfferCategory: 2,
  fixedPriceOnOffer: 3,
  discountAmountOnOffer: 4,
  discountPercentageOnOffer: 5,
};
export {
  offerTypes,
  deliveryTypes,
  paymentTypes,
  loginWithEmailResponses,
  timeslotTypes,
};
