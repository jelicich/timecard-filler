<template>
  <div class="random-fields">
    <template v-if="deactivated">
      <h3>Coming soon... 🙏</h3>
    </template>
    <template v-else>
      <!-- Work -->
      <label class="field mb">
        <span>Hours you have worked</span>
        <input
          class="input-number"
          type="number"
          :value="workHours"
          @change="$emit('update:workHours', $event)"
        />
      </label>
      <label>
        <span>Starting time range from</span>
        <hour-autocomplete 
          :value="startWorkRange"
          @change="$emit('update:startWorkRange', $event)"
        />
        <span>to</span>
        <hour-autocomplete 
          :value="endWorkRange"
          @change="$emit('update:endWorkRange', $event)"
        />
      </label>
      <small class="mb">(e.g: From 8 to 10)</small>
      <!-- Lunch -->
      <label class="field mb">
        <span>Hours for lunch</span>
        <input
          class="input-number"
          type="number"
          :value="lunchHours"
          @change="$emit('update:lunchHours', $event)"
        />
      </label>
      <label>
        <span>Starting time range from</span>
        <hour-autocomplete 
          :value="startLunchRange"
          @change="$emit('update:startLunchRange', $event)"
        />
        <span>to</span>
        <hour-autocomplete 
          :value="endLunchRange"
          @change="$emit('update:endLunchRange', $event)"
        />
      </label>
      <small class="mb">(e.g: From 13 to 15)</small>
    </template>
  </div>
</template>
<script>
import HourAutocomplete from './HourAutocomplete.vue';

export default {
  components: {
    HourAutocomplete,
  },

  props: {
    workHours: {
      type: [String, Number],
      required: false,
      default: ''
    },

    startWorkRange: {
      type: String,
      required: false,
      default: ''
    },

    endWorkRange: {
      type: String,
      required: false,
      default: ''
    },

    lunchHours: {
      type: [String, Number],
      required: false,
      default: ''
    },

    startLunchRange: {
      type: String,
      required: false,
      default: ''
    },

    endLunchRange: {
      type: String,
      required: false,
      default: ''
    },
  },

  data() {
    return {
      deactivated: true,
    }
  }
}
</script>
<style lang="scss">
.random-fields {
  h3 {
    text-align: center;
    margin: 20px 0;
  }
}
</style>