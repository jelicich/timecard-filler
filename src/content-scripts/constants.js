/**
 * Constants exclusive for content-scripts
 */

export const TOKENS = {
  DATE: '{DATE}',
  HOUR: '{HOUR}',
};

export const SELECTORS = {
  // Selector for the child elements in the button of the days that have been completed already
  SUBMITED_DAYS_SEL: '[class^="WorkStatus"]',
  // Selector for days off (includes weekends, public holidays and PTO)
  // for some reason this selector does not work. Using BTN_INNER_SEL instead and checking with js
  // DAYS_OFF_SEL: '[class~="offDay"]',
  // Selector for today's button wrapper
  TODAY_SEL: '[data-test-id="today-cell"]',
  // Selector for all button wrappers
  BTNS_WRAPPER_SEL: `[data-test-id^="day_"]`,
  // Selector for button wrapper (replace the token with the date)
  BTN_WRAPPER_SEL: `[data-test-id="day_${TOKENS.DATE}"]`,
  // Selector for button (BTN_WRAPPER_SEL children)
  BTN_SEL: 'button[data-test-id="day-cell-action-button"]',
  // Selector for the immediate children of BTN_SEL 
  BTN_INNER_SEL: `button[data-test-id="day-cell-action-button"] > div`,
  // Selector for the work hours field section
  WORK_SECTION_SEL: '[data-test-id="work-entry"]',
  // Selector for the lunch hours field section
  LUNCH_SECTION_SEL: '[data-test-id="break-entry"]',
  // Selector for start range input
  START_RANGE_SEL: '[data-test-id="timerange-start"]',
  // Selector for end range input
  END_RANGE_SEL: '[data-test-id="timerange-end"]',
  // Selector for hour in dropdown (replace token)
  HOUR_SEL: `[title="${TOKENS.HOUR}"]`,
  // Selector for the save button
  SAVE_BTN_SEL: '[data-test-id="day-entry-save"]',
}

export const KEYWORDS = {
  OFF_DAY: 'offDay'
}

export const IDS = {
  INJECT: 'tcf-inject'
}