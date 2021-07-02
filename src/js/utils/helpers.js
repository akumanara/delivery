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

const getURLSearchData = (object) => {
  const params = new URLSearchParams();
  Object.keys(object).forEach((key) => params.append(key, object[key]));
  return params;
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
    beforeSend(event) {
      // console.log(event);
      // Modify the event here
      // if (event.user) {
      //   // Don't send user's email address
      //   delete event.user.email;
      // }
      return event;
    },
  });
};

const validation = {
  isEmailAddress(str) {
    const pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return pattern.test(str); // returns a boolean
  },
  isNotEmpty(str) {
    const pattern = /\S+/;
    return pattern.test(str); // returns a boolean
  },
  isNumber(str) {
    const pattern = /^\d+$/;
    return pattern.test(str); // returns a boolean
  },
  isSame(str1, str2) {
    return str1 === str2;
  },
};

const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// :::  Passed to function:                                                    :::
// :::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
// :::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
// :::    unit = the unit you desire for results                               :::
// :::           where: 'M' is statute miles (default)                         :::
// :::                  'K' is kilometers                                      :::
// :::                  'N' is nautical miles                                  :::
const distanceBetweenLatLon = (lat1, lon1, lat2, lon2, unit) => {
  if (lat1 == lat2 && lon1 == lon2) {
    return 0;
  }

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == 'K') {
    dist *= 1.609344;
  }
  if (unit == 'N') {
    dist *= 0.8684;
  }
  return dist;
};

const formatTimer = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(14, 5);

export {
  formatTimer,
  showFPS,
  timeout,
  makeid,
  deliveryConsole,
  deliveryConsoleWithMessage,
  animateCSS,
  currencyFormatOptions,
  currencyFormat,
  has,
  getFormData,
  initSentry,
  validation,
  distanceBetweenLatLon,
  getURLSearchData,
};
