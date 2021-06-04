// Variables coming from webpack
/* global MODE, VERSION */
import Stats from 'stats.js';
import currency from 'currency.js';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

// Show the FPS counter
const showFPS = () => {
  // fps counter
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  stats.dom.className = 'stats';
  document.body.appendChild(stats.dom);
  function animate() {
    stats.begin();
    // monitored code goes here
    stats.end();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
};

// Generate a random string
const makeid = (length) => {
  const result = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength)),
    );
  }
  return result.join('');
};

// Console log
const deliveryConsole = () => {
  const msg = '%cDelivery.gr';
  const styles = [
    'font-size: 12px',
    'background: #5A88FF',
    'display: inline-block',
    'color: white',
    'font-weight: 500',
    'padding: 8px 19px',
    'border: 1px;',
  ].join(';');
  console.log(msg, styles);
};

const deliveryConsoleWithMessage = (msg) => {
  const msgS = `%c${msg}`;
  const styles = [
    'font-size: 12px',
    'background: #5A88FF',
    'display: inline-block',
    'color: white',
    'font-weight: 500',
    'padding: 8px 19px',
    'border: 1px;',
  ].join(';');
  console.log(msgS, styles);
};

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve) => {
    const animationName = `${prefix}${animation}`;
    const node = element;

    node.classList.add(`${prefix}animated`, animationName, `${prefix}faster`);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, { once: true });
  });

const currencyFormatOptions = {
  symbol: '€',
  separator: '.',
  decimal: ',',
  pattern: `#!`,
  precision: 2,
};

const currencyFormat = (cur) => currency(cur, currencyFormatOptions).format();

const has = (obj, property) =>
  Object.prototype.hasOwnProperty.call(obj, property);

const getFormData = (object) => {
  const formData = new FormData();
  Object.keys(object).forEach((key) => formData.append(key, object[key]));
  return formData;
};

const initSentry = () => {
  console.log(`MODE IS  ${MODE}`);
  console.log(`RELEASE IS  ${VERSION}`);
  Sentry.init({
    dsn: 'https://638d2b3b62374e10acdd8359960a28cb@o346983.ingest.sentry.io/5769914',
    integrations: [new Integrations.BrowserTracing()],
    environment: MODE,
    release: `delivery@${VERSION}`,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
};

export {
  showFPS,
  makeid,
  deliveryConsole,
  deliveryConsoleWithMessage,
  animateCSS,
  currencyFormatOptions,
  currencyFormat,
  has,
  getFormData,
  initSentry,
};
