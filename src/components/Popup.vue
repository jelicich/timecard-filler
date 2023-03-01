<template>
  <div class="popup">
    <h1>Timecard Filler</h1>
    <form>
      <div class="radio-group">
        <label>
          <input type="radio" name="time_type" value="fixed" v-model="timeType">
          Set the same starting and ending time every day
        </label>
        <label>
          <input type="radio" name="time_type" value="random" v-model="timeType">
          Set random starting and ending time based on range
        </label>
      </div>
      <!-- Fixed -->
      <template v-if="timeType === 'fixed'">
        <!-- Work -->
        <label class="field mb">
          <span>Starting work time</span>
          <input type="number" v-model="startingWorkTime" class="input-number">
        </label>
        <label class="field mb">
          <span>Ending work time</span>
          <input type="number" v-model="endingWorkTime" class="input-number">
        </label>
        <!-- Lunch -->
        <label class="field mb">
          <span>Starting lunch time</span>
          <input type="number" v-model="startingLunchTime" class="input-number">
        </label>
        <label class="field mb">
          <span>Ending lunch time</span>
          <input type="number" v-model="endingLunchTime" class="input-number">
        </label>
      </template>

      <!-- Random -->
      <template v-if="timeType === 'random'">
        <!-- Work -->
        <label class="field mb">
          <span>Hours you have worked</span>
          <input type="number" v-model="workHours" class="input-number">
        </label>
        <label>
          <span>Starting time range from</span>
          <input type="number" v-model="startWorkRange" class="input-number">
          <span>to</span>
          <input type="number" v-model="endWorkRange" class="input-number">
        </label>
        <small class="mb">(e.g: From 8 to 10)</small>
        <!-- Lunch -->
        <label class="field mb">
          <span>Hours for lunch</span>
          <input type="number" v-model="lunchHours" class="input-number">
        </label>
        <label>
          <span>Starting time range from</span>
          <input type="number" v-model="startLunchRange" class="input-number">
          <span>to</span>
          <input type="number" v-model="endLunchRange" class="input-number">
        </label>
        <small class="mb">(e.g: From 13 to 15)</small>
      </template>
      
      <label>
        Fill from date
        <input type="text" placeholder="YYYY-MM-DD" v-model="dateFrom" class="input-date">
        to
        <input type="text" placeholder="YYYY-MM-DD" v-model="dateTo" class="input-date">
      </label>
      <small>Make sure the dates you enter are being displayed currently</small>
      
      {{ payload }}

      <button @click.prevent="handleSubmit">test</button>
      <button class="button-primary" :disabled="!isFormValid" @click.prevent="handleSubmit">
        Log
        <span v-if="startingWorkTime && endingWorkTime">
          {{ endingWorkTime - startingWorkTime }} h. of work 
          <span v-if="startingLunchTime && endingLunchTime">
            and {{ endingLunchTime - startingLunchTime }} h. of lunch
            ({{ (endingWorkTime - startingWorkTime) - (endingLunchTime - startingLunchTime) }} h. net)
          </span>
        </span>
      </button>
    </form>
  </div>
</template>
<script>
import { differenceInDays, format } from 'date-fns';

export default {
  data() {
    return {
      timeType: 'fixed',

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

      dateFrom: null,
      dateTo: null,
    }
  },

  computed: {
    isDateFromValid() {
      const isValid = this.dateFrom && this.dateFrom.length === 10;
      const date = new Date(this.dateFrom);
      return date instanceof Date && !isNaN(date) && isValid;
    },

    isDateToValid() {
      const isValid = this.dateTo && this.dateTo.length === 10;
      const date = new Date(this.dateTo);
      return date instanceof Date && !isNaN(date) && isValid;
    },

    isFormValid() {
      let isFormValid = null;
      
      if(this.timeType === 'fixed') {
        isFormValid = !!this.startingWorkTime
          && !!this.endingWorkTime
          && !!this.startingLunchTime
          && !!this.endingLunchTime;
      } else {
        isFormValid = !!this.workHours
          && !!this.startWorkRange
          && !!this.endWorkRange
          && !!this.lunchHours
          && !!this.startLunchRange
          && !!this.endLunchRange;
      }

      return isFormValid && this.isDateFromValid && this.isDateToValid;
    },

    payload() {
      if(this.isFormValid) {
        const from = new Date(this.dateFrom);
        const to = new Date(this.dateTo);
        const days = differenceInDays(to, from) + 1;
        
        const cardsData = Array.from(Array(days)).map((x, i) => {
          const baseDate = new Date(this.dateFrom);
          const currentDate = new Date(baseDate.setDate(baseDate.getDate() + i));
          // const dateString = `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`;
          const dateString = format(currentDate, 'yyyy-MM-dd');

          return {
            dateString,
            startingWorkTime: this.startingWorkTime > 9 ? `${this.startingWorkTime}:00` : `0${this.startingWorkTime}:00`,
            endingWorkTime: this.endingWorkTime > 9 ? `${this.endingWorkTime}:00` : `0${this.endingWorkTime}:00`,
            startingLunchTime: this.startingLunchTime > 9 ? `${this.startingLunchTime}:00` : `0${this.startingLunchTime}:00`,
            endingLunchTime: this.endingLunchTime > 9 ? `${this.endingLunchTime}:00` : `0${this.endingLunchTime}:00`,
          }
        });

        return cardsData;
      };

      return [];
    },
  },

  methods: {
    async handleSubmit() {
      const queryOptions = { active: true, lastFocusedWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);
      if(!tab?.url?.includes('https://caravelo.personio.de')) {
        // TODO: create warning
        alert('please go to https://caravelo.personio.de')
        return;
      }
      chrome.tabs.sendMessage(tab.id, { 
        message: 'start',
        // TODO: MOCKED
        payload: [ { "dateString": "2023-03-02", "startingWorkTime": "09:00", "endingWorkTime": "18:00", "startingLunchTime": "13:00", "endingLunchTime": "14:00" } ]
      });
    }
  }
}
</script>
<style lang="scss">
.popup {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  form {
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-bottom: 0;
  }

  h1 {
    font-size: 20px;
  }
  
  button {
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
  
  .field {
    display: flex;
    align-items: center;
  
    > span {
      flex: 1;
    }
  }
  
  .input-number {
    width: 60px;
  }
  
  .input-date {
    width: 110px;
  }
}
</style>