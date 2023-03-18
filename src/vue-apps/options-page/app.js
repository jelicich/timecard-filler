import Vue from 'vue';
import OptionsPage from '../components/OptionsPage.vue';
import Loading from "../directives/loading/Loading.directive.js";

import 'vue2-datepicker/index.css';

Vue.directive("loading", Loading);

const app = new Vue({
  el: '#app',
  render: (createElement) => createElement(OptionsPage)
})