<template>
  <div class="popup">
    <template v-if="!personioUrl || !tabId">
      <instructions :personio-url="personioUrl" @url-saved="onUrlSaved"/>
    </template>
    <template v-else>
      <timecard-form :tab-id="tabId" />
    </template>
  </div>
</template>
<script>
import Instructions from './Instructions.vue';
import TimecardForm from './TimecardForm.vue';
import { MESSAGES, STORAGE_KEYS } from '../../constants';

export default {
  components: {
    Instructions,
    TimecardForm
  },

  data() {
    return {
      tabId: null,
      personioUrl: null,
    }
  },

  async mounted() {
    // chrome.runtime.connect({ name: APP.POPUP });
    await this.getPersonioUrl();
    await this.getTabId();
  },

  methods: {
    /**
     * Returns the tab id if url matches personio
     */
    async getTabId() {
      // TEST-03: remove currentWindo and set lastFocusedWindow
      const queryOptions = { active: true, /*lastFocusedWindow: true*/ currentWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);
      const tabId = !tab?.url?.includes(this.personioUrl) ? null : tab.id;
      tabId && this.sendTabIdToBackground(tabId);
      this.tabId = tabId;
    },

    /**
     * Checks if the url for personio has been set
     */
    async getPersonioUrl() {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.PERSONIO_URL]);
      console.log('storage', result);
      this.personioUrl = result[STORAGE_KEYS.PERSONIO_URL]?.personioUrl || null;
    },

    /**
     * Notify the background script with the tab id where personio is
     */
    sendTabIdToBackground(tabId) {
      chrome.runtime.sendMessage({
        message: MESSAGES.SAVE_TAB_ID,
        data: { tabId }
      })
    },

    /**
     * Executed when the url was saved gets the info so it updates the view
     */
    async onUrlSaved() {
      await this.getPersonioUrl();
      await this.getTabId();
    }
  }
}
</script>
<style lang="scss">
.popup {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>