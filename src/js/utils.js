import Stats from 'stats.js';

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

export { showFPS, makeid, deliveryConsole, deliveryConsoleWithMessage };
