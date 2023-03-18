<template>
  <div class="autocomplete">
    <autocomplete
      ref="autocomplete"
      :search="filterResults"
      :type="type"
      :disabled="disabled"
      @submit="handleSelect"
      @keyup="e => { if(e.keyCode === 13) handleSelect(e.target.value) }"
      @blur="handleBlur"
    />
  </div>
</template>
<script>
import Autocomplete from '@trevoreyre/autocomplete-vue'
import { EVENTS } from '../../constants'

export default {
  components: {
    Autocomplete
  },
  
  model: {
    prop: 'value',
    event: EVENTS.CHANGE
  },

  props: {
    /**
     * v-model
     */
    value: {
      type: [String, Number],
      required: false,
      default: ''
    },

    type: {
      type: String,
      required: false,
      default: 'text',
    },

    /**
     * Items to use as suggestions and filter them
     */
    items: {
      type: Array,
      required: false,
      default: () => []
    },
    
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    }
  },

  watch: {
    value(newValue) {
      this.forceUpdateInput(newValue);
    },

    disabled(newValue) {
      this.setDisabledStatus(newValue);
    }
  },

  mounted() {
    this.value && this.forceUpdateInput(this.value);
    this.setDisabledStatus(this.disabled)
  },

  methods: {
    setDisabledStatus(status) {
      if(status) {
        this.$refs.autocomplete.$refs.input.setAttribute('disabled', status);
      } else {
        this.$refs.autocomplete.$refs.input.removeAttribute('disabled');
      }
    },

    handleSelect(value) {
      this.$emit(EVENTS.CHANGE, value);
    },

    handleBlur(e) {
      this.$emit(EVENTS.BLUR, e.target.value);
    },

    /**
     * cb function to be passed to autocomplete to filter results
     */
    filterResults(query) {
      if (query.length < 1) { return [] }
      return this.items.filter(item => {
        return item.toLowerCase()
          .includes(query.toLowerCase())
      })
    },

    /**
     * Update input. autocomplete component does not have a v-model
     * so we update manually
     */
    forceUpdateInput(value) {
      this.$refs.autocomplete.setValue(value);
    }
  }
}
</script>
<style lang="scss">
.autocomplete {
  &-result-list {
    background: white;
    border: 1px solid #e8e8e8;
    box-shadow: 0 6px 12px rgb(0 0 0 / 18%);
    box-sizing: border-box;
    list-style: none;
    max-height: 200px;
    overflow-y: scroll;
    padding: 0;
  }

  &-result {
    cursor: pointer;
    margin-bottom: 0;
    padding: 10px;

    &:hover {
      background: lightgray;
    }
  }

  &-input {
    width: 100%;
    max-width: 100%;

    &[disabled] {
      background: lightgray;
      opacity: 0.5;
    }
  }

}
</style>