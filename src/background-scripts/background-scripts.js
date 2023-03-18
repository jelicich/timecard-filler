import { MESSAGES, PATHS, APP } from '../constants';

class BackgroundScripts {
  tabId = null;
  // An object mapping a message to a callback
  listenersMap = {
    [MESSAGES.SAVE_TAB_ID]: this.saveTabId.bind(this)
  };

  constructor() {
    this.setListeners();
    this.startMonitorSaveRequests();
    // this.startMonitorChangeMonthRequests();
    // this.startMonitorPopupConnection();
  }

  /**
   * Executes the callback according to the message based on the map listenersMap
   */
  setListeners() {
    chrome.runtime.onMessage.addListener((request) => {
      this.listenersMap[request.message](request);
    })
  }

  /**
   * Saves the tab id where personio is that is sent from the popup
   */
  saveTabId(request) {
    this.tabId = request.data.tabId;
  }

  /**
   * Set listeners to monitor save webrequests and when a request is completed 
   * sends a message to content-scripts to let them know save has finished
   */
  startMonitorSaveRequests() {
    const networkFilters = {
      urls: [
        PATHS.SAVE_TIME_API,
      ]
    };
    chrome.webRequest.onCompleted.addListener(async (details) => {
      // const { url } = details;

      await this.notify(MESSAGES.SAVE_FINISHED);
    }, networkFilters);
  }

  /**
   * Set listeners to monitor change month webrequests and when a request is completed 
   * sends a message to content-scripts to let them know it has finished
   */
  // startMonitorChangeMonthRequests() {
  //   const networkFilters = {
  //     urls: [
  //       PATHS.GET_MONTH_API
  //     ]
  //   };
  //   chrome.webRequest.onCompleted.addListener(async (details) => {
  //     const { url } = details;
  //     console.log('completed url: ', url, details);
  //     await this.notify(MESSAGES.CURRENT_MONTH_CHANGED);
  //   }, networkFilters);
  // }

  /**
   * Sends a message to personio tab for content script to know that the request has finished
   */
  notify(message) {
    if(this.tabId) {
      chrome.tabs.sendMessage(this.tabId, { 
        message: message
      });
    }
  }

  // startMonitorPopupConnection() {
  //   chrome.runtime.onConnect.addListener(function(port) {
  //     if (port.name === APP.POPUP) {
  //       port.onDisconnect.addListener(function() {
  //           console.log("popup has been closed")
  //       });
  //     }
  //   });
  // }
}

new BackgroundScripts();