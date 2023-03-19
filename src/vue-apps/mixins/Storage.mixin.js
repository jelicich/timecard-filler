import {STORAGE_KEYS } from '../../constants';

export default {
  async mounted() {
    await this.getPersonioUrl();
    await this.getFixedDefaults();
    await this.getIntensiveDefaults();
    await this.getCurrentMonthDefault();
  },

  methods: {
    /**
     * Gets the personio url if it was set
     */
    async getPersonioUrl() {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.PERSONIO_URL]);
      this.setData(result[STORAGE_KEYS.PERSONIO_URL] || null);
    },

    /**
     * Gets the default values saved for fixed time
     */
    async getFixedDefaults() {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.FIXED_DEFAULTS]);
      this.setData(result[STORAGE_KEYS.FIXED_DEFAULTS] || null);
    },

    /**
     * Gets the default values saved for intensive friday
     */
    async getIntensiveDefaults() {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.INTENSIVE_DEFAULTS]);
      this.setData(result[STORAGE_KEYS.INTENSIVE_DEFAULTS] || null);
    },

    /**
     * Gets the default value for current month checkbox
     */
    async getCurrentMonthDefault() {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.CURRENT_MONTH_DEFAULT]);
      this.setData(result[STORAGE_KEYS.CURRENT_MONTH_DEFAULT] || null);
    },

    /**
     * Set the data to the models
     */
    setData(data) {
      if(!data) {
        return;
      } 

      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      }) 
    },

  }
}