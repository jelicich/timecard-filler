import { format } from "date-fns";
import { wait } from './helpers';

// Selector for the button wrapper that opens the pop up
const BTN_WRAPPERS_SEL = '.Day-module__day___WFrPD';
// Selector for the child elements in the button of the days that have been completed already
const SUBMITED_DAYS_SEL = '[class^="WorkStatus"]';
// Selector for days off (includes weekends, public holidays and PTO)
const DAYS_OFF_SEL = '[class~="offDay"]';
// Selector for today's button wrapper
const TODAY_SEL = '[data-test-id="today-cell"]';
// Selector for button wrapper (replace the token with the date)
const BTN_WRAPPER_SEL = '[data-test-id="day_{DATE}"]';
// Selector for button (BTN_WRAPPER_SEL children)
const BTN_SEL = 'button[data-test-id="day-cell-action-button"]';
// Selector for the work hours field section
const WORK_SECTION_SEL = '[data-test-id="work-entry"]';
// Selector for the lunch hours field section
const LUNCH_SECTION_SEL = '[data-test-id="break-entry"]';
// Selector for start range input
const START_RANGE_SEL = '[data-test-id="timerange-start"]';
// Selector for end range input
const END_RANGE_SEL = '[data-test-id="timerange-end"]';
// Selector for hour in dropdown (replace token)
const HOUR_SEL = '[title="{HOUR}"]';
// Selector for the save button
const SAVE_BTN_SEL = '[data-test-id="day-entry-save"]';

class ContentScript {
  constructor() {
    this.setListeners();
    console.log('content-script');
  }
  
  setListeners() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(request, sender, sendResponse);
      if(request.message === 'start') {
        this.startFillProcess(request.payload);
      }
    });
  }

  /**
   * Iterates the payload to filter valid dates and fill the form
   * @param {object} payload 
   */
  startFillProcess(payload) {
    console.log('start fill!', payload);
    const today = format(new Date(), 'yyyy-MM-dd');
    payload.forEach(async (timecardData) => {
      const selector = timecardData.dateString === today ?
        TODAY_SEL : BTN_WRAPPER_SEL.replace('{DATE}', timecardData.dateString);
      
      const btnWrapper = document.querySelector(selector);
      if(this.isValidDate(btnWrapper)) {
        await this.fillTimecard(btnWrapper, timecardData);
      }
    });
  }

  /**
   * Checks whether the given btnWrapper contains a button for a valid date
   * (business days) Will be valid when it does not have children with submited o days off sel
   * @param {Node} btnWrapper 
   */
  isValidDate(btnWrapper) {
    return !btnWrapper.querySelectorAll(`${SUBMITED_DAYS_SEL}, ${DAYS_OFF_SEL}`).length;
  }

  /**
   * Fills the timecard for the given button and data
   * @param {Node} btnWrapper 
   * @param {object} data 
   */
  async fillTimecard(btnWrapper, data) {
    const timecardBtn = btnWrapper.querySelector(BTN_SEL);
    // Open the modal
    timecardBtn.click();
    // TODO: investigate how to know when pop up is open instead of waiting random time
    await wait(500);

    // Fill fields
    const workFromInput = document.querySelector(`${WORK_SECTION_SEL} ${START_RANGE_SEL}`);
    const workToInput = document.querySelector(`${WORK_SECTION_SEL} ${END_RANGE_SEL}`);
    const lunchFromInput = document.querySelector(`${LUNCH_SECTION_SEL} ${START_RANGE_SEL}`);
    const lunchToInput = document.querySelector(`${LUNCH_SECTION_SEL} ${END_RANGE_SEL}`);

    // need to mimic user behavior for personio to update the values
    this.simulateUserInput(workFromInput, data.startingWorkTime);
    this.simulateUserInput(workToInput, data.endingWorkTime)
    this.simulateUserInput(lunchFromInput, data.startingLunchTime);
    this.simulateUserInput(lunchToInput, data.endingLunchTime);

    // TODO: submit and continue
    const saveBtn = document.querySelector(SAVE_BTN_SEL);
    saveBtn.click();
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
    const hourEl = document.querySelector(HOUR_SEL.replace('{HOUR}', value));
    hourEl.click();
  }




  /**
   * Get all button wrappers in the dom (current month)
   */
  // getAllButtons() {
  //   const btnWrappers = document.querySelectorAll(BTN_WRAPPERS_SEL);
  //   console.log(btnWrappers);
    
  //   this.filterValidButtons(btnWrappers);
  // }

  /**
   * Filter days (remove days off, holiday, etc)
   * btnWrappers and btns are always the same, we need to find 
   * specific children elements to filter them
   * @param {NodeList} btnWrappers 
   */
  // filterValidButtons(btnWrappers) {
  //   const buttons = [];
  //   for(let i = 0; i < btnWrappers.length; i++) {
  //     const isInvalid = btnWrappers[i].querySelectorAll(`${SUBMITED_DAYS_SEL}, ${DAYS_OFF_SEL}`);
  //     !isInvalid && buttons.push(btnWrappers[i]);
  //   }
  // }
}

new ContentScript();