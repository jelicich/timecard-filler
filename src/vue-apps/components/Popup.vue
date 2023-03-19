<template>
  <div class="popup">
    <button class="options-button" @click.prevent="openOptions">
      <svg fill="#000000" viewBox="0 0 1920 1920" xmlns="http://www.w3.org/2000/svg">
        <path d="M1703.534 960c0-41.788-3.84-84.48-11.633-127.172l210.184-182.174-199.454-340.856-265.186 88.433c-66.974-55.567-143.323-99.389-223.85-128.415L1158.932 0h-397.78L706.49 269.704c-81.43 29.138-156.423 72.282-223.962 128.414l-265.073-88.32L18 650.654l210.184 182.174C220.39 875.52 216.55 918.212 216.55 960s3.84 84.48 11.633 127.172L18 1269.346l199.454 340.856 265.186-88.433c66.974 55.567 143.322 99.389 223.85 128.415L761.152 1920h397.779l54.663-269.704c81.318-29.138 156.424-72.282 223.963-128.414l265.073 88.433 199.454-340.856-210.184-182.174c7.793-42.805 11.633-85.497 11.633-127.285m-743.492 395.294c-217.976 0-395.294-177.318-395.294-395.294 0-217.976 177.318-395.294 395.294-395.294 217.977 0 395.294 177.318 395.294 395.294 0 217.976-177.317 395.294-395.294 395.294" fill-rule="evenodd"/>
      </svg>
    </button>
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
    },

    openOptions() {
      chrome.runtime.openOptionsPage();
    }
  }
}
</script>
<style lang="scss">
.popup {
  display: flex;
  flex-direction: column;
  height: 100%;

  .options-button {
    display: flex;
    height: 22px;
    margin: 0;
    padding: 2px;
    position: absolute;
    right: 15px;
    top: 15px;
    width: 22px;

    svg {
      fill: gray;
    }
  }
}
</style>