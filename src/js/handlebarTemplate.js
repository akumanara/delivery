import Handlebars from 'handlebars';
import { currencyFormat } from './utils';

// Handlebars partials
// Handlebars.registerPartial('myPartial', '{{prefix}}');

Handlebars.registerHelper('currency', (price) => currencyFormat(price));
// product template
const source = document.getElementById('entry-template');
let HandlebarsTemplate;
if (source) {
  HandlebarsTemplate = Handlebars.compile(source.innerHTML);
}

export { HandlebarsTemplate };
