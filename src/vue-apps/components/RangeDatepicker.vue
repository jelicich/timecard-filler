<template>
  <div class="datepicker">
    <date-picker
      v-model="date"
      type="date"
      range
      :confirm="true"
      @change="handleChange"
      @clear="handleClear"
      @open="addButtonClass"
    >
      <template v-slot:content>
        <calendar-panel
          :value="innerDate"
          :default-value="defaultDateValue"
          :get-classes="getClasses"
          :disabled-date="disabledDates"
          @select="handleDateSelect"
        ></calendar-panel>
      </template>
    </date-picker>
  </div>
</template>
<script>
import DatePicker from 'vue2-datepicker';
import { 
  format,
  isValid
} from 'date-fns';
import { EVENTS, DATE_FORMATS } from '../../constants'

const { CalendarPanel } = DatePicker;

export default {
  components: {
    DatePicker,
    CalendarPanel
  },
  
  model: {
    prop: 'value',
    event: EVENTS.CHANGE
  },

  props: {
    value: {
      type: Array,
      required: false,
      default: () => []
    },

    defaultDateValue: {
      type: String,
      required: false,
      default: format(new Date(), DATE_FORMATS.ISO_DATE)
    },

    disabledDates: {
      type: Function,
      required: false,
      default: () => false
    }
  },

  data() {
    return {
      date: this.value,
      innerDate: this.value,
    }
  },

  watch: {
    value(newValue) {
      this.date = newValue;
      this.innerDate = newValue;
    }
  },

  methods: {
    handleChange($event) {
      this.$emit(EVENTS.CHANGE, $event);
    },

    /**
     * Clear inner state of panel date picker
     */
    handleClear() {
      this.$emit(EVENTS.CHANGE, []);
      this.innerDate = [];
    },

    /**
     * Handle the date selection manually due to having a custom 
     * template for the datepicker panel
     */
    handleDateSelect(date) {
      const [startValue, endValue] = this.innerDate;
      if (isValid(new Date(startValue)) && !isValid(new Date(endValue))) {
        if (startValue.getTime() > date.getTime()) {
          this.innerDate = [date, startValue];
        } else {
          this.innerDate = [startValue, date];
        }
        this.date = this.innerDate;
        this.handleChange(this.date);
      } else {
        this.innerDate = [date, new Date(NaN)];
      }
    },

    /**
     * Set classes manually to date picker due to having 
     * a custom panel 
     */
    getClasses(cellDate, currentDates, classes) {
      if (
        !/disabled|active|not-current-month/.test(classes) &&
        currentDates.length === 2 &&
        cellDate.getTime() > currentDates[0].getTime() &&
        cellDate.getTime() < currentDates[1].getTime()
      ) {
        return "in-range";
      }
      return "";
    },

    addButtonClass() {
      this.$nextTick(() => {
        const btn = document.querySelector('.mx-datepicker-btn-confirm');
        btn.classList.add('button-primary');
      });
    }
  }
}
</script>