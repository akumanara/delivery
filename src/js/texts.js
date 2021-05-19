export default {
  // Product (group options and variants)
  mandatory: 'Yποχρεωτικό',
  optional: 'Προαιρετικό',
  maxLimit: (x) => `Μέγιστος αριθμός επιλογών: ${x}`,
  variantName: 'επιλογές',
  // Delivery type accordion
  delivery: 'Delivery',
  deliveryFee: (x) => `Κόστος παράδοσης - ${x}`,
  takeaway: 'Takeaway',
  takeawayLocation: (x) => `Κατάστημα - ${x}`,
};
