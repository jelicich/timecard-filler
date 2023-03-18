<template>
  <div class="time-frame">
    <fieldset>
      <legend>
        <template v-if="toggable">
          <label>
            <input
              type="checkbox"
              :checked="initialChecked"
              @change="handleCheckboxChange" 
            />
            {{ label }}
          </label>
        </template>
        <template v-else>
        {{ label }}
        </template>
      </legend>
      <div class="fieldset-inner">
        <label class="field mb">
          <span>From</span> 
          <hour-autocomplete 
            :value="from"
            :disabled="toggable && !toggleStatus"
            :range-end="to"
            @change="$emit('update:from', $event)"
          />
        </label>
        <label class="field mb">
          <span>To</span>
          <hour-autocomplete 
            :value="to"
            :disabled="toggable && !toggleStatus"
            :range-start="from"
            @change="$emit('update:to', $event)"
          />
        </label>
        <span class="chip">
          {{ getHourDifference(to, from) }}h
        </span>
        <button
          class="close-button"
          tabindex="-1"
          @click.prevent="clear"
        >
          X
        </button>
      </div>
    </fieldset>
  </div>
</template>
<script>
import HourAutocomplete from './HourAutocomplete.vue';
import { getHourDifference } from '../utils/datetime.js';

export default {
  components: {
    HourAutocomplete
  },

  props: {
    label: {
      type: String,
      required: false,
      default: ''
    },

    from: {
      type: String,
      required: false,
      default: ''
    },

    to: {
      type: String,
      required: false,
      default: ''
    },

    toggable: {
      type: Boolean,
      required: false,
      default: false
    },

    toggleStatus: {
      type: Boolean,
      required: false,
      default: null
    }
  },

  data() {
    return {
      initialChecked: this.toggleStatus
    }
  },

  watch: {
    toggleStatus(newVal) {
      this.initialChecked = newVal;
    }
  },

  methods: {
    getHourDifference,
    
    clear() {
      this.$emit('update:from', '');
      this.$emit('update:to', '');
    },

    handleCheckboxChange($event) {
      this.$emit('update:toggleStatus', $event.target.checked)
      // clear hours
      if(!$event.target.checked) {
        this.$emit('update:from', '')
        this.$emit('update:to', '')
      }
    }
  }
}
</script>
<style lang="scss">
.time-frame {
  .fieldset-inner {
    align-items: center;
    display: flex;
    position: relative;

    .close-button {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
  
  .hour-autocomplete {
    margin-right: 10px;
  }

  .chip {
    margin-top: 10px;
  }
}
</style>