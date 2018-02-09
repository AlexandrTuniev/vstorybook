import Vue from "vue";
import { storiesOf } from "@storybook/vue";
import { action } from '@storybook/addon-actions';

import {
  withKnobs,
  text,
  boolean,
  array,
} from '@storybook/addon-knobs';

import MathQuillInput from '../components/MathQuillInput.vue';
import  MathQuillStatic from '../components/MathQuillStatic.vue';
import EntryBox from '../components/Entrybox.vue';
import Numberline from '../components/Numberline.vue';
import Factor from '../components/Factor.vue';
import FactorList from '../components/FactorList.vue';

storiesOf("Welcome", module)
  .addDecorator(withKnobs)
  .add('MathQuill input', () => ({
    components: { MathQuillInput },
    template: `<div style="height: 50px; width: 120px">
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
  .add('MathQuill static', () => ({
    components: { MathQuillStatic },
    template: `<div style="height: 50px; width: 120px">
                    <math-quill-static ref='mathquill' :value="'5x+3'"></math-quill-static>
               </div>`,
    methods: {
    },
    data(){
      return {
        header: text('math', '5x+3'),
      }
    }
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
  .add('Factor-list with tippy', () => ({
    components: { FactorList, Factor },
    data() {
      return {
        typpy: null,
        selectedElement: {},
        inputModel: 0,
        list1: [
          { value: 12, id: 0 },
          { value: 24, id: 1 },
          { value: 18, id: 2 }
        ],
        header: text("header", "Factor")
      }
    },
    template: `<div style="padding: 140px;">
                    <factor-list :list="list1">
                        <factor   ref="factors" 
                                  v-for="(element, index) in list1"
                                  v-bind:key="element.id" 
                                  :factor="element" 
                                  :click-handler="onClick"
                                  :showOperator="index !==0"
                                  :submit-handler="onSubmit"
                                  :headerText="header"/>
                    </factor-list>
               </div>`,

    methods: {
      onClick(el, factor) {
        const restFactors = this.$refs.factors.filter((f) => {
          return f !== factor
        });
        restFactors.forEach((f) => {f.hidePopup()});
      },
      onShow(element) {
      },
      onSubmit(value, element) {
        if (this.validate(value, element.value)) {

          let parts = (value + '').split("\\cdot");
          //TODO generate UID's
          let newItems = parts.map((num) => {
            return { value: num, id: Math.floor((Math.random() * 10000) + 1) }
          });
          let idx = this.list1.indexOf(element);
          this.list1.splice(idx, 1);
          this.list1.splice(idx, 0, ...newItems);
        }else{
          alert("Something wrong");
        }

      },
      validate(value, result) {
        let parts = (value + '').split("\\cdot");
        let acc = 1;
        let prod = parts.reduce((acc, factor) => {
          return acc * factor;
        });
        return +result === prod;
      }
    },
  }));
