import { format, startOfMonth, addMonths } from "date-fns";
import { wait, getElement, injectScript } from './helpers';
import { SELECTORS as S, TOKENS, KEYWORDS, IDS } from "./constants";
import { MESSAGES, DATE_FORMATS, PATHS, ERRORS, STORAGE_KEYS } from "../constants";

class ContentScript {
  // An object mapping a message to a callback
  listenersMap = {
    [MESSAGES.START_FILL_PROCESS]: this.startFillProcess.bind(this),
    [MESSAGES.GET_CURRENT_MONTH]: this.getPopupDateLimits.bind(this)
  };

  constructor() {
    this.setListeners();
    this.injectResources();

    console.info('Timecard Filler injected');
  }
  
  setListeners() {
    // Listen for messages (background and popup)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if(this.listenersMap[request.message]) {
        this.listenersMap[request.message](request, sendResponse);
        return true; // Let chrome know the response is async
      };
    });

    // Listen for employee ID from web accessible resources
    window.addEventListener('message', this.handleWindowMessage);
  }

  injectResources() {
    injectScript(PATHS.WEB_ACCESSIBLE_RESOURCES, 'body', IDS.INJECT);
  }

  /**
   * Iterates the payload to filter valid dates and fill the form
   * @param {object} payload 
   */
  async startFillProcess({ payload }, callback) {
    const today = format(new Date(), DATE_FORMATS.ISO_DATE);
    // Save loading status in case popup is closed
    await chrome.storage.sync.set({[STORAGE_KEYS.IS_LOADING]: true });

    try {
      for(let i = 0; i < payload.length; i++) {
        const timecardData = payload[i];
        const selector = timecardData.dateString === today ?
          S.TODAY_SEL : S.BTN_WRAPPER_SEL.replace(TOKENS.DATE, timecardData.dateString);
        
        const btnWrapper = getElement(selector);
  
        if(this.isValidDate(btnWrapper)) {
          await this.fillTimecard(btnWrapper, timecardData);
        }
      }

      callback({
        result: MESSAGES.SUCCESS
      })
    } catch(e) {
      callback({
        result: MESSAGES.FAILURE,
        info: e
      })
    } finally {
      await chrome.storage.sync.set({[STORAGE_KEYS.IS_LOADING]: false });
    }
  }

  /**
   * Checks whether the given btnWrapper contains a button for a valid date
   * (business days) Will be valid when it does not have children with submited or days off sel
   * @param {Node} btnWrapper 
   */
  isValidDate(btnWrapper) {
    const btnInner = getElement(S.BTN_INNER_SEL, btnWrapper);
    const isDayOff = [...btnInner.classList].join().indexOf(KEYWORDS.OFF_DAY) >= 0;
    const isCompleted = getElement(`${S.SUBMITED_DAYS_SEL}`, btnWrapper)?.length;
    return !isCompleted && !isDayOff;
  }

  /**
   * Fills the timecard for the given button and data
   * @param {Node} btnWrapper 
   * @param {object} data 
   */
  async fillTimecard(btnWrapper, data) {
    const timecardBtn = btnWrapper.querySelector(S.BTN_SEL);
    // Open the modal
    timecardBtn.click();
    // TODO: investigate how to know when pop up is open instead of waiting random time
    await wait(500);

    // Fill fields
    const workFromInput = getElement(`${S.WORK_SECTION_SEL} ${S.START_RANGE_SEL}`);
    const workToInput = getElement(`${S.WORK_SECTION_SEL} ${S.END_RANGE_SEL}`);
    const lunchFromInput = getElement(`${S.LUNCH_SECTION_SEL} ${S.START_RANGE_SEL}`);
    const lunchToInput = getElement(`${S.LUNCH_SECTION_SEL} ${S.END_RANGE_SEL}`);

    // need to mimic user behavior for personio to update the values
    this.simulateUserInput(workFromInput, data.startingWorkTime);
    this.simulateUserInput(workToInput, data.endingWorkTime)
    data.startingLunchTime && this.simulateUserInput(lunchFromInput, data.startingLunchTime);
    data.endingLunchTime && this.simulateUserInput(lunchToInput, data.endingLunchTime);

    const saveBtn = getElement(S.SAVE_BTN_SEL);
    // TODO: #TEST-01 remove these 2 lines, only for testing
    getElement(S.TMP).click();
    const savePromiseMonitor = this.waitForRequestToFinish();
    saveBtn.click();
    await savePromiseMonitor;
    
    // TODO: #TEST-01 remove only for testing, close the popup
    getElement(S.TMP2).click();
  }

  /**
   * Personio won't update the value even after triggering events
   * so we select from the dropdown
   * @param {HTMLElement} element 
   * @param {string} value 
   */
  simulateUserInput(element, value) {
    element.click();
    // find dropdown item
    const hourEl = getElement(S.HOUR_SEL.replace(TOKENS.HOUR, value));
    hourEl.click();
  }

  /**
   * Returns a promise that is resolved whenever the ajax call to save 
   * the timecard finishes. Communicates with background to monitor ajax reqs
   * To do so it sets a listener to get messages from background
   */
  async waitForRequestToFinish() {
    return new Promise((resolve, reject) => {
      // wait for 15" and timeout in case personio hangs
      const timeout = setTimeout(() => {
        reject(ERRORS.PERSONIO_TIMEOUT);
      }, 1000 * 15);

      chrome.runtime.onMessage.addListener(async function onFinish(request) {
        if(request.message === MESSAGES.SAVE_FINISHED) {
          clearTimeout(timeout);
          chrome.runtime.onMessage.removeListener(onFinish);
          
          resolve();
        }
      });
    });
  }

  /**
   * Checks the current month to send it to the pop up to limit the date picker
   * Uses the dom to see the current date in a hackish way
   * Executed when receiving a message from popup
   */
  async getPopupDateLimits(request, callback) {
    // get first wrapper date
    const wrapperDate = getElement(S.BTNS_WRAPPER_SEL).getAttribute('data-test-id').substr(4);
    // Check if it's first of month
    const isFirstOfMonth = new Date(wrapperDate).getDate() === 1
    
    let date;
    if(isFirstOfMonth) {
      date = wrapperDate;
    } else {
      const previousMonthDate = startOfMonth(new Date(wrapperDate));
      const currentMonthDate = addMonths(previousMonthDate, 1);
      date = format(currentMonthDate, DATE_FORMATS.ISO_DATE);
    }
    
    callback(date);
  }

  // TODO: do we need this?
  handleWindowMessage(event) {
    if(event.data.from === MESSAGES.WEB_ACCESSIBLE_RESOURCES) {
      // console.log('llego el id:', event.data.data);
    }
  }
}

new ContentScript();