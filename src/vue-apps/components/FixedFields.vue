<template>
  <div class="fixed-fields">
    <!-- Work -->
    <time-frame
      label="Work"
      :from="startingWorkTime"
      :to="endingWorkTime"
      @update:from="$emit('update:startingWorkTime', $event)"
      @update:to="$emit('update:endingWorkTime', $event)"
    />
    
    <!-- Lunch -->
    <time-frame
      label="Break"
      :from="startingLunchTime"
      :to="endingLunchTime"
      @update:from="$emit('update:startingLunchTime', $event)"
      @update:to="$emit('update:endingLunchTime', $event)"
    />
  </div>
</template>
<script>
import HourAutocomplete from './HourAutocomplete.vue';
import TimeFrame from './TimeFrame.vue';

export default {
  components: {
    HourAutocomplete,
    TimeFrame,
  },

  props: {
    startingWorkTime: {
      type: String,
      required: false,
      default: ''
    },

    endingWorkTime:  {
      type: String,
      required: false,
      default: ''
    },

    startingLunchTime:  {
      type: String,
      required: false,
      default: ''
    },

    endingLunchTime:  {
      type: String,
      required: false,
      default: ''
    },

    totalWork: {
      type: String,
      required: false,
      default: '00:00'
    },

    totalLunch: {
      type: String,
      required: false,
      default: '00:00'
    }
  },

  methods: {
    clearWorkFields() {
      this.$emit('update:startingWorkTime', '');
      this.$emit('update:endingWorkTime', '');
    },

    clearLunchFields() {
      this.$emit('update:startingLunchTime', '');
      this.$emit('update:endingLunchTime', '');
    },
  }
}
</script>
<style lang="scss">
.fixed-fields {
  
}
</style>