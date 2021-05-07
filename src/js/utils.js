import Stats from 'stats.js';
import currency from 'currency.js';

// Show the FPS counter
const showFPS = () => {
  // fps counter
  const stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
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
  new Promise((resolve, reject) => {
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
};
