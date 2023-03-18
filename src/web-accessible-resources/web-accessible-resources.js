import { MESSAGES } from '../constants';

class WebAccessibleResources {
  constructor() {
    window.postMessage({ from: MESSAGES.WEB_ACCESSIBLE_RESOURCES, data: window.EMPLOYEE });
  }
}

new WebAccessibleResources();