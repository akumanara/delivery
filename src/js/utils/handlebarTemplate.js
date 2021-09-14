import Handlebars from 'handlebars';
import { currencyFormat } from './helpers';

// Handlebars partials
// Handlebars.registerPartial('myPartial', '{{prefix}}');

Handlebars.registerHelper('currency', (price) => currencyFormat(price));
Handlebars.registerHelper('inc', (value) => parseInt(value) + 1);
// product template
const source = document.getElementById('product-template');
let HandlebarsTemplate;
if (source) {
  HandlebarsTemplate = Handlebars.compile(source.innerHTML);
}

// offer template
const OfferSource = document.getElementById('offer-template');
let OfferHandlebarsTemplate;
if (OfferSource) {
  OfferHandlebarsTemplate = Handlebars.compile(OfferSource.innerHTML);
}

// autocomplete result item
const AutocompleteItemSource = document.getElementById(
  'autocomplete-result-item-template',
);
let AutocompleteItemTemplate;
if (AutocompleteItemSource) {
  AutocompleteItemTemplate = Handlebars.compile(
    AutocompleteItemSource.innerHTML,
  );
}
// market product
const MarketProductSource = document.getElementById('market-product-template');
let MarketProductTemplate;
if (MarketProductSource) {
  MarketProductTemplate = Handlebars.compile(MarketProductSource.innerHTML);
}
// user order
const UserOrderSource = document.getElementById('user-order-template');
let UserOrderTemplate;
if (MarketProductSource) {
  UserOrderTemplate = Handlebars.compile(UserOrderSource.innerHTML);
}
// rate order
const RateOrderSource = document.getElementById('rate-order-template');
let RateOrderTemplate;
if (MarketProductSource) {
  RateOrderTemplate = Handlebars.compile(RateOrderSource.innerHTML);
}

export {
  RateOrderTemplate,
  UserOrderTemplate,
  MarketProductTemplate,
  HandlebarsTemplate,
  OfferHandlebarsTemplate,
  AutocompleteItemTemplate,
};
