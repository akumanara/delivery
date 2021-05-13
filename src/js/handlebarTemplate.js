import Handlebars from 'handlebars';
import { currencyFormat } from './utils';

Handlebars.registerHelper('currency', (price) => currencyFormat(price));
const source = document.getElementById('entry-template').innerHTML;
const HandlebarsTemplate = Handlebars.compile(source);

export { HandlebarsTemplate };
