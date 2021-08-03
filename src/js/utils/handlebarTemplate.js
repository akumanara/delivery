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

export { HandlebarsTemplate, OfferHandlebarsTemplate };
