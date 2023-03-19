<template>
  <div class="options-page">
    <div class="options-page-inner">
      <h1>Timecard Filler options</h1>
      <form>
        <!-- Url -->
        <div class="mb">
          <label>Edit the url to "My Attendance" section in Personio
            <input type="text" class="url-input" v-model="personioUrl" placeholder="e.g. https://company.personio.de/attendance/employee/1020304" />
          </label>
        </div>
        
        <hr/>
        
        <!-- Fixed Fields defaults -->
        <div>
          <p>Set default values so everytime you open the extension you don't have to type in anything</p>
          <fixed-fields
            :starting-work-time.sync="startingWorkTime"
            :ending-work-time.sync="endingWorkTime"
            :starting-lunch-time.sync="startingLunchTime"
            :ending-lunch-time.sync="endingLunchTime"
          />
        </div>

        <!-- Intensive friday -->
        <time-frame
          label="Intensive friday"
          :toggable="true"
          :from.sync="startingIntensive"
          :to.sync="endingIntensive"
          :toggle-status.sync="enabledIntensive"
        />

        <!-- Current month -->
        <label>
          <input
            type="checkbox"
            :checked="currentMonth"
            @change="($event) => currentMonth = $event.target.checked"
          >
          Set current month as default selected date range
        </label>
        <small>Timecard Filler won't fill days off or days that have been already submited</small>
        <hr/>
        <button
          v-loading="isLoading"
          class="button-primary"
          @click.prevent="save"
        >
          Save
        </button>
        <span class="save-notification" v-if="saveNotificationVisible">Options saved!</span>
      </form>
    </div>
  </div>
</template>
<script>
import FixedFields from '../components/FixedFields.vue';
import TimeFrame from '../components/TimeFrame.vue';
import StorageMixin from '../mixins/Storage.mixin.js';
import {STORAGE_KEYS } from '../../constants';

export default {
  components: {
    FixedFields,
    TimeFrame
  },

  mixins: [StorageMixin],

  data() {
    return {
      isLoading: false,

      personioUrl: null,

      startingWorkTime: null,
      endingWorkTime: null,
      startingLunchTime: null,
      endingLunchTime: null,

      startingIntensive: null,
      endingIntensive: null,
      enabledIntensive: null,

      currentMonth: null,

      saveNotificationVisible: false,
    }
  },

  methods: {
    
    /**
     * Save options
     */
    async save() {
      this.isLoading = true;
      const savePromise = [
        this.savePersonioUrl(),
        this.saveFixedDefaults(),
        this.saveIntensiveDefaults(),
        this.saveCurrentMonthDefault(),
      ]
      await Promise.all(savePromise);
      this.isLoading = false;

      this.saveNotificationVisible = true;
      setTimeout(() => {
        this.saveNotificationVisible = false;
      }, 3 * 1000);
    },

    async savePersonioUrl() {
      const data = {
        personioUrl: this.personioUrl,
      }

      await chrome.storage.sync.set({[STORAGE_KEYS.PERSONIO_URL]: data });
    },

    async saveFixedDefaults() {
      const data = {
        startingWorkTime: this.startingWorkTime,
        endingWorkTime: this.endingWorkTime,
        startingLunchTime: this.startingLunchTime,
        endingLunchTime: this.endingLunchTime,
      }

      await chrome.storage.sync.set({[STORAGE_KEYS.FIXED_DEFAULTS]: data });
    },

    async saveIntensiveDefaults() {
      const data = {
        enabledIntensive: this.enabledIntensive,
        startingIntensive: this.enabledIntensive ? this.startingIntensive : null,
        endingIntensive: this.enabledIntensive ? this.endingIntensive : null,
      }

      await chrome.storage.sync.set({[STORAGE_KEYS.INTENSIVE_DEFAULTS]: data });
    },

    async saveCurrentMonthDefault() {
      const data = {
        currentMonth: this.currentMonth
      }

      await chrome.storage.sync.set({[STORAGE_KEYS.CURRENT_MONTH_DEFAULT]: data });
    }
  }
}
</script>
<style lang="scss">
.options-page {
  background: lightgray;
  min-height: 100%;
  display: flex;

  .options-page-inner {
    background: white;
    border-radius: 5px;
    width: 600px;
    margin:auto;
    padding: 20px;
    border: 1px solid gray;
    box-shadow: 0 0 15px 5px gray;
  }

  h1 {
    font-size: 22px;
  }

  .url-input {
    display: block;
    width: 100%;
  }

  .save-notification {
    color: green;
    font-weight: bold;
    font-size: 14px;
    display: inline-block;
    margin-left: 10px;
  }
}
</style>