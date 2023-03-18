<template>
  <div class="hour-autocomplete">
    <autocomplete
      ref="autocomplete"
      v-model="innerValue"
      :items="hourList"
      :disabled="disabled"
      @change="$emit(change, $event)"
      @blur="autoSelect"
    />
  </div>
</template>
<script>
import { EVENTS } from '../../constants';
import Autocomplete from './Autocomplete.vue';

export default {
  components: {
    Autocomplete,
  },

  model: {
    prop: 'value',
    event: EVENTS.CHANGE
  },

  props: {
    value: {
      type: [String, Number],
      required: false,
      default: '',
    },

    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },

    /**
     * a limit to disable hours before the given hour
     */
    rangeStart: {
      type: String,
      required: false,
      default: null,
    },

    /**
     * a limit to disable hours after the given hour
     */
    rangeEnd: {
      type: String,
      required: false,
      default: null
    }
  },

  computed: {
    change() {
      return EVENTS.CHANGE
    },

    hourList() {
      let hourCounter = 0;
      const fullList = Array.from(Array(48)).map((x, i) => {
        i % 2 === 0 && i > 0 && hourCounter++
        const minutes = i % 2 === 0 ? '00' : '30';
        const hours = hourCounter > 9 ? hourCounter : `0${hourCounter}`;
        return `${hours}:${minutes}`;
      })
      let finalList = fullList;
      
      if(this.rangeStart || this.rangeEnd) {
        // remove before range start
        finalList = this.rangeStart 
          ? finalList.slice(finalList.findIndex(hour => hour === this.rangeStart))
          : finalList;

        // remove after range end
        finalList.length = this.rangeEnd
          ? finalList.findIndex(hour => hour === this.rangeEnd) + 1
          : finalList.length;
      }
      return finalList;
    }
  },

  watch:{
    value(newVal) {
      newVal !== this.innerValue && this.autoSelect(newVal, false);
    }
  },

  data() {
    return {
      innerValue: this.value
    }
  },
  
  methods: {
    /**
     * Autoselect the item based on the first result from the hour list
     * if no results, no selection is done
     */
    autoSelect(value, emit = true) {
      if(value !== this.innerValue && value.length > 0) {
        const transformedValue = this.transformValue(value);
        const result = this.hourList.filter(hour => {
          return hour.toLowerCase()
            .includes(transformedValue.toLowerCase())
        })[0];
        this.innerValue = result || '';
        this.$refs.autocomplete.forceUpdateInput(this.innerValue)
        emit && this.$emit(EVENTS.CHANGE, this.innerValue);
      } 
      
      // empty selection when input is empty
      if(value.length === 0) {
        this.innerValue = '';
        emit && this.$emit(EVENTS.CHANGE, this.innerValue);
      }
    },

    /**
     * Transform the hour by adding ":" when it's higher than 23:30
     * and other transformation like rounding minutes, etc
     * to replicate personio's behavior
     */
    transformValue(value) {
      let newValue = value;
      
      // Allow user to use . or , to separate mintutes
      if(value.includes('.') || value.includes(',')) {
        const replaced = value.replace(/[.,]/, ':');
        newValue = this.roundMinutes(replaced);
        return newValue;
      }

      let parsedValue = parseInt(value);
      if(parsedValue >= 24) {
        // check if number is not % 10 == 0, then add a 0 so it moves the place to add the ,
        // 100 => 10:0 235 => 23:5
        if(parsedValue >= 100 && parsedValue <= 235 && parsedValue % 10 !== 0) {
          parsedValue = parsedValue * 10 // add a 0 
        }
        
        const index = parsedValue < 999 ? 1 : 2;
        newValue = `${value.slice(0, index)}:${value.slice(index)}`;

        // check if minues are valid
        let minutes = newValue.split(':')[1];
        let hours = newValue.split(':')[0];
        // if minutes > 59 move the : 
        if (parseInt(minutes) > 59) {
          newValue = `${hours}${minutes.substr(0,1)}:${minutes.substr(1)}`;
        }

        // round minutes different than 30 or 0
        newValue = this.roundMinutes(newValue);

        return newValue;
      } else {
        // check if starts with 00 
        const isDoubleZero = value[0] === '0' && value[1] === '0' && value.length >= 3;
        newValue = isDoubleZero
         ? `${value.substr(0,2)}:${value.substr(2)}`
         : value;
        
        // round minutes different than 30 or 0
        newValue = this.roundMinutes(newValue);
        
        return newValue;
      }
    },
    
    /**
     * check if minutes are different than 30, if so, make them 30
     */
    roundMinutes(value) {
      let newValue = value;
      if(newValue.includes(':')) {
        let minutes = value.split(':')[1];
        const hours = value.split(':')[0];
        if(parseInt(minutes) > 0) {
          minutes = 30;
          newValue = `${hours}:${minutes}`;
        }
      }
      return newValue;
    }
  }
}
</script>
<style lang="scss">
.hour-autocomplete {
  width: 100px;
  position: relative;
  
  &:after {
    content: '';
    display: inline-block;
    background-color: lightgray;
    width: 15px;
    height: 15px;
    mask-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M10 0a10 10 0 1 0 10 10A10 10 0 0 0 10 0zm2.5 14.5L9 11V4h2v6l3 3z"/></svg>');
    mask-repeat: no-repeat;
    mask-size: cover;
    position: absolute;
    right: 10px;
    top: 11px;
  }
}
</style>