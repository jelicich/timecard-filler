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
};
