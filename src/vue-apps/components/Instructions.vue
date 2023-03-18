<template>
  <div class="instructions">
    <template v-if="!personioUrl">
      <div>
        <p>Enter the url to "My Attendance" section in Personio</p>
        <input type="text" v-model="inputUrl" placeholder="e.g. https://company.personio.de/attendance/employee/1020304" />
      </div>
      <button class="button-primary" @click="saveUrl">Save</button>
    </template>
    <template v-else>
      <button class="button-primary" :href="personioUrl" @click="openPersonio">Open Personio</button>
    </template>
  </div>
</template>
<script>
import { STORAGE_KEYS, EVENTS } from '../../constants';

export default {
  props: {
    personioUrl: {
      type: String || null,
      required: false,
      default: null
    }
  },

  data() {
    return {
      inputUrl: null,
    }
  },

  methods: {
    openPersonio() {
      chrome.tabs.create({ url: this.personioUrl });
    },

    async saveUrl() {
      const data = {
        personioUrl: this.inputUrl,
      }

      await chrome.storage.sync.set({[STORAGE_KEYS.PERSONIO_URL]: data });
      this.$emit(EVENTS.URL_SAVED);
    },
  }
}
</script>
<style lang="scss">
.instructions {
  display: flex;
  flex-direction: column;
  height: 100%;

  input {
    width: 100%;
  }

  button {
    margin: auto;
  }
}
</style>
