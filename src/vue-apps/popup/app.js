import Vue from 'vue';
import Popup from '../components/Popup.vue';
import Loading from "../directives/loading/Loading.directive.js";

import 'vue2-datepicker/index.css';
// import '@trevoreyre/autocomplete-vue/dist/style.css'

Vue.directive("loading", Loading);

const app = new Vue({
  el: '#app',
  render: (createElement) => createElement(Popup)
})