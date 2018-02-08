import Vue from "vue";
import VueTippy from 'vue-tippy';
import VTooltip from 'v-tooltip'
import { storiesOf } from "@storybook/vue";
import { action } from '@storybook/addon-actions';
import {
  withKnobs,
  text,
  boolean,
  array,
} from '@storybook/addon-knobs';

import MathQuillInput from '../components/MathQuillInput.vue';
import EntryBox from '../components/Entrybox.vue';
import Numberline from '../components/Numberline.vue';
import Factor from '../components/Factor.vue';
import FactorWithPopup from '../components/FactorWithPopup.vue';
import FactorList from '../components/FactorList.vue';

Vue.use(VueTippy);
Vue.use(VTooltip);
storiesOf("Welcome", module)
  .addDecorator(withKnobs)
  .add('MathQuill input', () => ({
    components: { MathQuillInput },
    template: `<div>
                    <math-quill-input ref='mathquill' :change="change"></math-quill-input>
               </div>`,
    methods: {
      change: action('text changed'),
      focus: function() {
        this.$refs.mathquill.focus();
      },
      write: function(str) {
        this.$refs.mathquill.write(str);
      },
      clear: function() {
        this.$refs.mathquill.clear();
      }
    },
  }))
  .add('EntryBox', () => {
    const header = text('Header', 'Combine to');
    return {
      components: { EntryBox },
      data() {
        return {
          cancelHidden: boolean('CancelHidden', false),
          disabled: false,
          header: text('Header', 'Combine to'),
          input: null,
          kbvisible: true,
          layout: "normal",
          actionsVisible: true
        }
      },
      template: `<div>
                    <entry-box :header-text="header" 
                        v-bind:cancel-hidden="cancelHidden"
                        v-bind:disabled="disabled"
                        :actionsVisible="actionsVisible" 
                        :onOk="onOk" 
                        :onCancel="onCancel"
                        :onFocus="onFocus"
                        :onChange="onChange"></entry-box>
                 </div>`,
      methods: {
        onCancel: action('cancel clicked'),
        onOk: action('ok clicked'),
        onFocus: action('focused'),
        onChange: action('changed'),
      },
    }
  })
  .add('jsxgraph', () => ({
    components: { Numberline },
    data() {
      return {
        numbers: array('numbers', ["-2", "3"], ',').map((e) => {return +e;}),
      }
    },
    template: `<div style="width: 200px; height: 150px;">
                    <Numberline :numbers="numbers" :y-offset="0"/>
               </div>`,
    methods: {},
  }))
  .add('Numberline as tippy', () => ({
    components: { Numberline, VueTippy },
    data() {
      return {
        numbers: array('numbers', ["-2", "3"], ',').map((e) => {return +e;}),
        caption: text('caption', "Not quite.  What expression is represented in this graphic?")
      }
    },
    template: `<div style="padding: 150px;">
                    <div style="width: 250px; padding: 15px; background: black;">
                        <div style="color: white; font-size: 18px">{{caption}}</div>
                        <div style="height: 150px;">
                          <Numberline :numbers="numbers" :y-offset="0" ref="numberline"/>
                        </div>
                    </div>
               </div>`,
    methods: {
      onShown(){
      }
    },
  }))
  .add('Factor', () => ({
    components: { Factor },
    template: `<div style="display: inline-flex;">
                    <Factor :value="{value:5}"/>
               </div>`,
    methods: {},
  }))
  .add('Factor with popup', () => ({
    components: { FactorWithPopup },
    template: `<div  style="padding: 140px;">
                    <factor-with-popup :value="{value:5}" :onclick="onClick"/>
               </div>`,
    methods: {
      onClick(){
        console.log("clicked");
      }
    },
  }))
  .add('Factor-list', () => ({
    components: { FactorList, Factor },
    data() {
      return {
        selectedElement: {},
        inputModel: 0,
        list1: [
          { value: 12, id: 0 },
          { value: 24, id: 1 },
          { value: 18, id: 2 }
        ]
      }
    },
    template: `<div style="padding: 140px;">
                    <factor-list :list="list1">
                      <factor  v-bind:ref="'element' + element.id" v-for="(element, index) in list1" :value="element" :on-click="onclick"/>
                    </factor-list>
               </div>`,
    methods: {
      onclick(element) {
        this.selectedElement = element;
        this.inputModel = this.selectedElement.value;
      },
      onShow(element) {
        //this.$refs['input-' + element.id][0].focus();
      },
      onSubmit(event, element) {
        if (event.keyCode === 13) {
          let value = event.target.value;
          let parts = value.split("*");
          let newItems = parts.map((num) => {
            return { value: num, id: Math.floor((Math.random() * 100) + 1) }
          });
          let idx = this.list1.indexOf(element);
          this.list1.splice(idx, 1);
          this.list1.splice(idx, 0, ...newItems);
          //this.$refs['element' + element.id][0].$el._tippy.hide();
        }
      }
    },
  }))
  .add('Factor-list v-tooltip', () => ({
    components: { FactorList, FactorWithPopup },
    data() {
      return {
        selectedElement: {},
        inputModel: 0,
        list1: [
          { value: 12, id: 0 },
          { value: 24, id: 1 },
          { value: 18, id: 2 }
        ]
      }
    },
    template: `<div style="padding: 140px;">
                    <factor-list :list="list1">
                      <factor-with-popup v-for="(element, index) in list1" :value="element" :on-click="onclick"/>
                    </factor-list>
               </div>`,
    methods: {
      onclick(element) {
        this.selectedElement = element;
        this.inputModel = this.selectedElement.value;
      },
      onShow(element) {
        //this.$refs['input-' + element.id][0].focus();
      },
      onSubmit(event, element) {
      }
    },
  }));


