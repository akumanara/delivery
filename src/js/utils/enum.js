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
const chooseSavedAddressEndpoints = {
  X: 'mail_verification',
  B: 'no_verification',
};

export {
  deliveryTypes,
  paymentTypes,
  loginWithEmailResponses,
  chooseSavedAddressEndpoints,
};
