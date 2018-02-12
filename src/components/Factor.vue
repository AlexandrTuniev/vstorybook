<template>
  <div>
    <div ref="element" class="factor-element" @click="clicked">
      <div class="factor-element-overlay"></div>
      <math-quill-static v-show="showOperator" :value="'\\star'"/>
      <math-quill-static :value="factor.value"/>
    </div>
    <div ref="tooltip" class="factor-tooltip-content">
      <div class="factor-tooltip-header">{{headerText}}</div>
      <math-quill-input ref="mathquill" :onFocus="mqFocus" :change="mqChange"
                        :onKeyup="onSubmit"></math-quill-input>
      <button v-on:click="okHandler" class="factor-tooltip-ok-button">OK
      </button>
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
    components: { MathQuillInput, MathQuillStatic},
    props: {
      factor: Object,
      clickHandler: Function,
      submitHandler: Function,
      showOperator: Boolean,
      headerText: String,
    },
    data() {
      return {
        inputModel: this.factor.value,
      }
    },
    watch: {},
    methods: {
      mqChange() {},
      mqFocus() {},
      clicked() {
        setTimeout(()=>{
          this.$refs.element._tippy.show();
          this.clickHandler && this.clickHandler(this.factor, this);
        }, 100)
      },
      hidePopup() {
        this.$refs.element._tippy.hide();
      },
      onSubmit(event) {
        if (event.keyCode === 13) {
          this.okHandler();
        }
      },
      okHandler() {
        let value = this.$refs.mathquill.getLatex();
        this.submitHandler && this.submitHandler(value, this.factor);
        this.hidePopup();
      }
    },
    mounted() {
      let targetElement = this.$refs.element;
      new Tippy(targetElement, {
        html: this.$refs.tooltip,
        arrow: true,
        trigger: 'manual',
        theme: 'light',
        interactive: true,
        onShown: () => {
          this.$refs.mathquill.focus();
        }
      });
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
  .factor-tooltip-header{
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

  .factor-tooltip-content {
    flex-basis: 60%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 110px;
    width: 220px;
  }

  .math-quill-input {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
    font-size: 28px;
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
  .factor-element-overlay{
    position: absolute;
    height: 100%;
    width: 100%;
  }
</style>
