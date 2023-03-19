import { NOTIFICATIONS } from "../constants";

export async function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getElement(selector, from = document) {
  return from.querySelector(selector);
}

/**
 * Injects a script tag to the given html element
 * @param {string} filePath path to the file
 * @param {string} tag tag where the script tag will be appended
 * @param {string} id id for the script tag
 * @returns 
 */
export function injectScript(filePath, tag, id) {
  var node = document.getElementsByTagName(tag)[0];
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', chrome.runtime.getURL(filePath));
  script.setAttribute('id', id);
  node.appendChild(script);
}

export function removeInjectScript(scriptTagId) {
  const scriptElement = document.querySelector(`#${scriptTagId}`);
  if (!scriptElement) return;
  scriptElement.remove();
}

export function createNotificationElement(type, message) {
  const bg = type === NOTIFICATIONS.SUCCESS ? 'lightgreen' : 'lightsalmon';
  const color = type === NOTIFICATIONS.SUCCESS ? 'darkgreen' : 'darkred';

  let container = document.querySelector('#tcf-notification');

  if(!container) {
    container = document.createElement('div');
    container.setAttribute('id', 'tcf-notification');
  }

  container.style.color = color;
  container.style.background = bg;
  container.style.border = `1px solid ${color}`;
  container.style.position = 'fixed';
  container.style.zIndex = '9999999';
  container.style.top = '24px';
  container.style.left = '24px';
  container.style.width = '600px';
  container.style.borderRadius = '5px';
  container.style.padding = '10px';
  container.style.boxShadow = '0 0 10px 5px rgba(255, 255, 255, 0.6)';
  container.style.fontWeight = 'bold';

  container.innerHTML = `Timecard Filler: ${message}`;

  return container;
}
