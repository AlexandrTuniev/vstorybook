<template>
  <div>
    <div ref="element" class="factor-element"
         v-bind:class="{ 'static': asStatic, 'ignore': ignore, 'highlight': selected}"
         @click="clicked">
      <div class="factor-element-overlay"></div>
      <math-quill-static v-show="showOperator" :value="'\\star'" />
      <math-quill-static :value="factor.value" />
    </div>
    <div ref="tooltip" class="factor-tooltip-content" v-show="!asStatic">
      <div class="factor-tooltip-header">{{headerText}}</div>
      <math-quill-input ref="mathquill" :onFocus="mqFocus"
                        :change="mqChange"></math-quill-input>
      <div class="factor-tooltip-button-container">
        <button v-on:click="multiply" class="factor-tooltip-ok-button">X
        </button>
        <button v-on:click="okHandler" class="factor-tooltip-ok-button">OK
        </button>
        <button v-on:click="cancelHandler" class="factor-tooltip-ok-button">
          Cancel
        </button>
      </div>

    </div>
  </div>
</template>

<script>
  import Tippy from 'tippy.js';

  require('!style-loader!css-loader!tippy.js/dist/themes/light.css');
  import MathQuillInput from "./MathQuillInput.vue";
  import MathQuillStatic from "./MathQuillStatic.vue";

  export default {
    name: "factor",
    components: { MathQuillInput, MathQuillStatic },
    replace: true,
    props: {
      factor: Object,
      clickHandler: Function,
      submitHandler: Function,
      showOperator: Boolean,
      headerText: String,
      listName: String,
      asStatic: Boolean,
      ignore: Boolean,
      maxFactoringElements: {
        default: 4,
        type: Number
      }
    },
    data() {
      return {
        selected: false
      }
    },
    watch: {},
    methods: {
      mqChange(latex) {
        // Restricting max factoring number
        let parts = latex.split("\\cdot");
        if (parts.length > this.maxFactoringElements) {
          this.$refs.mathquill.keystroke('Backspace');
        }
      },
      mqFocus() {},
      clicked() {
        if (!this.asStatic) {
          setTimeout(() => {
            this.$refs.element._tippy.show();
            this.clickHandler && this.clickHandler(this.factor, this);
            this.selected = true;
            window.addEventListener('keyup', (e) => {
              this.onKeyup(e);
            }, { once: true });
          }, 100);
        }

      },
      hidePopup() {
        this.selected = false;
        this.$refs.element._tippy.hide();
      },
      onKeyup(event) {
        if (event.keyCode === 13) {
          this.okHandler();
        }
        if (event.keyCode === 27) {
          this.hidePopup();
        }
      },
      okHandler() {
        let value = this.$refs.mathquill.getLatex();
        this.submitHandler && this.submitHandler(value, this.factor, this.listName);
        this.hidePopup();
      },
      cancelHandler() {
        this.$refs.mathquill.clear();
        this.hidePopup();
      },
      multiply() {
        this.$refs.mathquill.write('\\cdot');
      }
    },
    mounted() {
      if (!this.asStatic) {
        let targetElement = this.$refs.element;
        new Tippy(targetElement, {
          html: this.$refs.tooltip,
          arrow: true,
          trigger: 'manual',
          theme: 'light',
          interactive: true,
          onShown: () => {
            this.$refs.mathquill.focus();
          },
          onHidden: () => {
            this.selected = false;
          }
        });
      }
    },
    beforeDestroy() {
      this.$refs.element._tippy && this.$refs.element._tippy.hide(0);
      this.$refs.element._tippy && this.$refs.element._tippy.destroy();
    }
  }
</script>

<style>
  .mq-root-block {
    text-align: left;
  }

  .factor-tooltip-header {
    font-size: 14px;
    font-family: Montserrat;
    padding-bottom: 5px;
  }

  .factor-element {
    font-size: 24px;
    padding: 4px;
    margin: 5px;
    cursor: pointer;
    display: flex;
    position: relative;
  }

  .factor-element.static {
    padding: 0;
    margin: 0;
  }

  .factor-element.highlight {
    background: #FDD857;
  }

  .factor-tooltip-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 110px;
    width: 120px;
  }

  .math-quill-input {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
    font-size: 26px;
    max-height: 65px;
    max-width: 278px;
  }

  .tooltip-input {
    height: 30px;
    width: 140px;
    background: white;
    color: black;
    font-size: 24px;
  }

  .factor-tooltip-button-container {
    display: flex;
    justify-content: space-around;
  }

  .factor-tooltip-ok-button {
    color: white;
    font-size: 14px;
    font-family: Montserrat;
    background-color: #66d79f;
    border-radius: 5px;
    padding: 5px;
  }

  .factor-tooltip-ok-button:hover {
    background: #00bc5f;
  }

  .factor-element-overlay {
    position: absolute;
    height: 100%;
    width: 100%;
  }
</style>
