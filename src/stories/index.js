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
import MathQuillStatic from '../components/MathQuillStatic.vue';
import EntryBox from '../components/Entrybox.vue';
import Numberline from '../components/Numberline.vue';
import Factor from '../components/Factor.vue';
import FactorList from '../components/FactorList.vue';
import draggable from 'vuedraggable';
import * as _ from 'lodash';

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
  // .add('MathQuill static', () => ({
  //   components: { MathQuillStatic },
  //   template: `<div style="height: 50px; width: 120px">
  //                   <math-quill-static ref='mathquill' :value="'5x+3'"></math-quill-static>
  //              </div>`,
  //   methods: {},
  //   data() {
  //     return {
  //       header: text('math', '5x+3'),
  //     }
  //   }
  // }))
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
        numbers: array('numbers', ["-2", "3"], ','),
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
        } else {
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
  }))
  .add('Double factor-list with tippy', () => ({
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
        list2: [
          { value: 34, id: 3 },
          { value: 6, id: 4 },
          { value: 4, id: 5 }
        ],
        header: text("header", "Factor")
      }
    },
    template: `<div style="padding: 100px; padding-top: 140px; display:flex;">
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
                    <div style="height: 40px; width: 40px;"></div>
                    <factor-list :list="list2">
                        <factor   ref="factors" 
                                  v-for="(element, index) in list2"
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
          if (idx !== -1) {
            this.list1.splice(idx, 1);
            this.list1.splice(idx, 0, ...newItems);
          } else {
            idx = this.list2.indexOf(element);
            this.list2.splice(idx, 1);
            this.list2.splice(idx, 0, ...newItems);
          }
        } else {
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
  }))
  .add('Triple factor-list with equation', () => ({
    components: { FactorList, Factor, MathQuillStatic, draggable },
    data() {
      return {
        typpy: null,
        selectedElement: {},
        inputModel: 0,
        equation: [
          { value: 12, id: 13 },
          { value: 'x^2', id: 14, ignore: true },
          { value: '-2', id: 15 },
          { value: 'x', id: 16, ignore: true },
          { value: -4, id: 17 }
        ],
        list1: [],
        list2: [],
        list3: [],
        list4: [],
        draggedItemsFromEquation: [],
        header: text("header", "Factor"),
        equationDOption: {
          name: "equationList",
          filter: '.ignore',
          group: {
            name: 'equation',
            pull: 'clone',
            put: false,
            revertClone: true,
          },
          animation: 200,
          sort: false
        },
        dOptionsForFactors: {
          name: "factorsList",
          group: {
            name: 'factors',
            put: 'equation',
          },
          animation: 200,
        },
        dOptionsForAddends: {
          name: "addendsList",
          group: {
            name: 'addends',
            put: ['factors', 'addends'],
          }, animation: 200
        },
        dOptionsForSum: {
          name: "sumList",
          group: {
            name: 'sum',
            put: 'equation',
          },
        }
      }
    },
    template: `<div style="padding: 100px; padding-top: 140px; display:flex; flex-direction: column;">
                    <div>
                      <draggable @end="onEnd" @start="onStart" @change="onChange" :list="equation" style="display: inline-flex; align-items: flex-end;"  
                      :options="equationDOption" @clone="onClone" :move="onMove">
                        <factor  v-bind:key="el.id" :ignore="el.ignore" v-for="el in equation" :as-static="true" :factor="el"></factor>
                      </draggable>
                    </div>
                    <div style="padding-bottom: 40px;">
                      <factor-list :list="list1" :dOptions="dOptionsForFactors" @change="onChange">
                          <factor   ref="factors" 
                                    :list-name="'list1'"
                                    v-for="(element, index) in list1"
                                    v-bind:key="element.id" 
                                    :factor="element" 
                                    :click-handler="onClick"
                                    :showOperator="index !==0"
                                    :submit-handler="onSubmit"
                                    :headerText="header"/>
                      </factor-list>
                    </div>
                    
                    <div style="display: inline-flex;">
                      <factor-list :list="list2" :d-options="dOptionsForAddends">
                          <factor   ref="factors" 
                                    :list-name="'list2'"
                                    v-for="(element, index) in list2"
                                    v-bind:key="element.id" 
                                    :factor="element" 
                                    :click-handler="onClick"
                                    :showOperator="index !==0"
                                    :submit-handler="onSubmit"
                                    :headerText="header"/>
                      </factor-list>
                      <div style="font-size: 24px;  padding: 4px; margin: 5px; display: flex;">
                        <math-quill-static :value="'+'"/>
                      </div>
                      <factor-list :list="list3" :d-options="dOptionsForAddends">
                          <factor   ref="factors" 
                                    :list-name="'list3'"
                                    v-for="(element, index) in list3"
                                    v-bind:key="element.id" 
                                    :factor="element" 
                                    :click-handler="onClick"
                                    :showOperator="index !==0"
                                    :submit-handler="onSubmit"
                                    :headerText="header"/>
                      </factor-list>
                      <div style="font-size: 24px;  padding: 4px; margin: 5px; display: flex;">
                        <math-quill-static :value="'='"/>
                      </div>
                      <factor-list :list="list4" :d-options="dOptionsForSum" @change="onChange">
                          <factor   ref="factors" 
                                    :list-name="'list4'"
                                    v-for="(element, index) in list4"
                                    v-bind:key="element.id" 
                                    :factor="element" 
                                    :click-handler="onClick"
                                    :showOperator="index !==0"
                                    :submit-handler="onSubmit"
                                    :headerText="header"/>
                      </factor-list>
                    </div>
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
      onSubmit(value, element, listName) {
        if (this.validate(value, element.value)) {
          let parts = (value + '').split("\\cdot");
          //TODO generate UID's
          let newItems = parts.map((num) => {
            return { value: num, id: Math.floor((Math.random() * 10000) + 1) }
          });
          let idx = this[listName].indexOf(element);
          if (idx !== -1) {
            this[listName].splice(idx, 1);
            this[listName].splice(idx, 0, ...newItems);
          }
        } else {
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
      },
      onEnd(e) {
        //console.log(e);
      },
      onStart(e) {
        //console.log(e);
      },
      onChange(e, listName) {
        if (listName === 'factorsList' && e.added) {
          this.draggedItemsFromEquation.push(e.added.element.id);
        }
        if (listName === 'sumList' && e.added) {
          //this.draggedItemsFromEquation.push(e.added.element.id);
          this.list4.splice(0, this.list4.length);
          this.list4.push(e.added.element);
        }

      },

      onClone: function(/**Event*/evt) {
        let origEl = evt.item;
        let cloneEl = evt.clone;
      },
      onMove(evt) {

        if (this.checkList(evt, "sumList")) {
          return true;
        }
        let alreadyDragged = _.includes(this.draggedItemsFromEquation, evt.draggedContext.element.id);
        return !alreadyDragged;
      },
      checkList(event, name) {
        return (event.relatedContext.component.dOptions &&
          event.relatedContext.component.dOptions.name === name) ||
          (event.relatedContext.component.$parent.dOptions &&
            event.relatedContext.component.$parent.dOptions.name === name);
      }
    },
  }));
