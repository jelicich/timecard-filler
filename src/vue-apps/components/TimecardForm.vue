<template>
  <div class="timecard-form" v-loading="isLoading">
    <h1>Timecard Filler</h1>
    <form>
      <div class="radio-group">
        <label>
          <input type="radio" name="time_type" :value="FIXED" v-model="timeType">
          Set the same starting and ending time every day
        </label>
        <label>
          <input type="radio" name="time_type" :value="RANDOM" v-model="timeType">
          Set random starting and ending time based on range
        </label>
      </div>
      <!-- Fixed -->
      <template v-if="timeType === FIXED">
        <fixed-fields
          :starting-work-time.sync="startingWorkTime"
          :ending-work-time.sync="endingWorkTime"
          :starting-lunch-time.sync="startingLunchTime"
          :ending-lunch-time.sync="endingLunchTime"
        />
      </template>

      <!-- Random -->
      <template v-if="timeType === RANDOM">
        <random-fields
          :work-hours.sync="workHours"
          :start-work-range.sync="startWorkRange"
          :end-work-range.sync="endWorkRange"
          :lunch-hours.sync="lunchHours"
          :start-lunch-range.sync="startLunchRange"
          :end-lunch-range.sync="endLunchRange"
        />
      </template>
      
      <!-- Intensive friday -->
      <time-frame
        label="Intensive friday"
        :toggable="true"
        :from.sync="startingIntensive"
        :to.sync="endingIntensive"
        :toggle-status.sync="enabledIntensive"
      />

      <label>
        Select the date range
      </label>
      <range-datepicker
        v-model="date"
        :default-value="defaultDateValue"
        :disabled-dates="disabledDates"
      />

      <button class="button-primary" :disabled="!isFormValid" @click.prevent="handleSubmit">
        Log
        <span v-if="startingWorkTime && endingWorkTime">
          {{ getHourDifference(endingWorkTime, startingWorkTime) }}h of work 
          <span v-if="startingLunchTime && endingLunchTime">
            and {{ getHourDifference(endingLunchTime, startingLunchTime) }}h of lunch
            ({{ getNetTime() }}h net)
          </span>
        </span>
      </button>
    </form>
  </div>
</template>
<script>
import HourAutocomplete from './HourAutocomplete.vue';
import FixedFields from './FixedFields.vue';
import RandomFields from './RandomFields.vue';
import RangeDatepicker from './RangeDatepicker.vue';
import TimeFrame from './TimeFrame.vue';
import DatePicker from 'vue2-datepicker';
import StorageMixin from '../mixins/Storage.mixin.js';
import { getHourDifference } from '../utils/datetime.js';
import { MESSAGES, VALUES, DATE_FORMATS, STORAGE_KEYS } from '../../constants';
import { 
  differenceInDays,
  differenceInMinutes,
  format,
  startOfDay,
  startOfMonth,
  endOfMonth,
  isAfter,
  isBefore,
} from 'date-fns';

const { CalendarPanel } = DatePicker;

export default {
  components: {
    HourAutocomplete,
    FixedFields,
    RandomFields,
    RangeDatepicker,
    TimeFrame,
    DatePicker,
    CalendarPanel,
  },

  mixins: [StorageMixin],

  props: {
    // chrome tab id of tab where personio is open
    tabId: {
      type: Number || null,
      required: true,
      default: null,
    }
  },

  data() {
    return {
      isLoading: false,

      timeType: VALUES.FIXED,

      // fixed props
      startingWorkTime: null,
      endingWorkTime: null,
      startingLunchTime: null,
      endingLunchTime: null,

      // random props
      workHours: null,
      startWorkRange: null,
      endWorkRange: null,
      lunchHours: null,
      startLunchRange: null,
      endLunchRange: null,

      // intensive props
      enabledIntensive: false,
      startingIntensive: null,
      endingIntensive: null,
      
      // Used for date picker
      date: [],
      
      // property used to set default value to date picker from saved config
      currentMonth: null,

      dateLimit: format(startOfMonth(new Date()), DATE_FORMATS.ISO_DATE),
    }
  },

  watch: {
    // watch to set defaults to date picker
    currentMonth(newValue) {
      if(newValue) {
        this.date = [
          startOfMonth(new Date()),
          endOfMonth(new Date())
        ]
      }
    }
  },

  computed: {
    FIXED() {
      return VALUES.FIXED;
    },

    RANDOM() {
      return VALUES.RANDOM;
    },

    isFormValid() {
      const isDateValid = this.date.length === 2;

      let isFormValid = null;
      if(this.timeType === this.FIXED) {
        const isWorkValid = !!this.startingWorkTime
          && !!this.endingWorkTime;
        
        const isLunchValid = (!this.startingLunchTime && !this.endingLunchTime)
          || (!!this.startingLunchTime && !!this.endingLunchTime);
        
        const isIntensiveValid = (!this.enabledIntensive && !this.startingIntensive && !this.endingIntensive)
          || (this.enabledIntensive && !!this.startingIntensive && !!this.endingIntensive);
        
        isFormValid = isWorkValid && isLunchValid && isIntensiveValid;
      } else {
        isFormValid = !!this.workHours
          && !!this.startWorkRange
          && !!this.endWorkRange
          && !!this.lunchHours
          && !!this.startLunchRange
          && !!this.endLunchRange;
      }

      return isFormValid && isDateValid;
    },

    payload() {
      if(this.isFormValid) {
        const from = new Date(this.date[0]);
        const to = new Date(this.date[1]);
        const days = differenceInDays(to, from) + 1;
        
        const cardsData = Array.from(Array(days)).map((x, i) => {
          const baseDate = new Date(this.date[0]);
          const currentDate = new Date(baseDate.setDate(baseDate.getDate() + i));
          const dateString = format(currentDate, DATE_FORMATS.ISO_DATE);
          
          let result;
          // intensive friday
          if(this.enabledIntensive && currentDate.getDay() === 5) {
            result = {
              dateString,
              startingWorkTime: this.startingIntensive,
              endingWorkTime: this.endingIntensive,
            }
          } else {
            result = {
              dateString,
              startingWorkTime: this.startingWorkTime,
              endingWorkTime: this.endingWorkTime,
              startingLunchTime: this.startingLunchTime || null,
              endingLunchTime: this.endingLunchTime || null,
            }
          }
          return result
        });

        return cardsData;
      };

      return [];
    },

    defaultDateValue() {
      return this.dateLimit || format(new Date(), DATE_FORMATS.ISO_DATE);
    },
  },

  async mounted() {
    this.setLoadingWatcher();
    
    const result = await chrome.storage.sync.get([STORAGE_KEYS.IS_LOADING]);
    this.isLoading = result[STORAGE_KEYS.IS_LOADING];

    await this.getCurrentMonth();
  },

  methods: {
    getHourDifference,
    
    async handleSubmit() {
      const result = await chrome.tabs.sendMessage(this.tabId, { 
        message: MESSAGES.START_FILL_PROCESS,
        payload: this.payload
      });
      this.onSubmitFinish(result);
    },

    /**
     * Executed after the filling process is done and it 
     * process the response
     * TODO: do we need this? result will be shown in personio by content script
     */
    onSubmitFinish(response) {
      if(response.result === MESSAGES.SUCCESS) {
        // TODO: do something, show success
      }

      if(response.result === MESSAGES.FAILURE) {
        // TODO: do something show error
      }
    },

    /**
     * Sends a message to content-script to get the current month
     * displayed in Personio UI to set limits to the date picker
     */
    async getCurrentMonth() {
      const date = await chrome.tabs.sendMessage(this.tabId, { 
        message: MESSAGES.GET_CURRENT_MONTH,
      });
      this.setDateLimit(date);
    },

    /**
     * Set the limit to the datepicker based on Personio UI
     */
    setDateLimit(date) {
      this.dateLimit = date;
    },
    
    /**
     * cb function passed to datepicker to disable dates 
     */
    disabledDates(date) {
      const dateLimitStart = startOfDay(new Date(this.dateLimit));
      const dateLimitEnd = endOfMonth(new Date(this.dateLimit));
      return isBefore(date, dateLimitStart) || isAfter(date, dateLimitEnd);
    },

    /**
     * Check the storage to see if content script is till running
     * the fill timecard request. This is needed in case the pop up
     * is closed before finishing, so next time is open it shows
     * the loading state
     */
    setLoadingWatcher() {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes[STORAGE_KEYS.IS_LOADING]) {
          this.isLoading = changes[STORAGE_KEYS.IS_LOADING].newValue;
        }
      });
    },

    /**
     * Get net time
     */
    getNetTime() {
      const startWork = `1970-01-01T${this.startingWorkTime}:00.000Z`;
      const endWork = `1970-01-01T${this.endingWorkTime}:00.000Z`;
      const diffWork = differenceInMinutes(new Date(endWork), new Date(startWork));
      
      const startLunch = `1970-01-01T${this.startingLunchTime}:00.000Z`;
      const endLunch = `1970-01-01T${this.endingLunchTime}:00.000Z`;
      const diffLunch = differenceInMinutes(new Date(endLunch), new Date(startLunch));

      const diff = diffWork - diffLunch;
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      
      return `${hours > 9 ? hours : '0' + hours}:${minutes > 9 ? minutes : '0' + minutes}`;
    }
  }
}
</script>
<style lang="scss">
.timecard-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  form {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-bottom: 0;
  }

  h1 {
    font-size: 20px;
    margin-bottom: 10px;
  }
  
  button:not(.close-button) {
    margin-bottom: 0;
    margin-top: auto;
    width: 100%;

    &[disabled] {
      background: lightgray;
      border: lightgray;
      opacity: 0.8;
      pointer-events: none;
    }
  }

  .mx-datepicker-range {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>