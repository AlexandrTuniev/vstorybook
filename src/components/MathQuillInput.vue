<template>
    <div class="math-quill-input-container">
        <span class="math-quill-input" ref="mathField"></span>
    </div>
</template>

<script>
  if (typeof MathQuill === "undefined") {
    throw "MathQuill is undefined";
  }
  export default {
    name: "math-quill-input",
    props: {
      change: Function,
      onFocus: Function,
    },
    data() {
      return {
        mathField: null,
      };
    },
    mounted() {
      this.mathquillify();
      let mqtextarea = document.querySelector(".mq-textarea>textarea");
      mqtextarea.addEventListener("focus", (e) => {
        this.onFocus && this.onFocus(e);
      });
    },
    methods: {
      mathquillify() {
        const MQ = MathQuill.getInterface(2);
        this.mathField = MQ.MathField(this.$refs.mathField, {
          spaceBehavesLikeTab: true, // configurable
          handlers: {
            edit: () => { // useful event handlers
              const latexText = this.mathField.latex();
              if (this.change) {
                this.change(latexText);
              }
            }
          }
        });
      },
      clear() {
        this.mathField.select();
        this.mathField.keystroke('Backspace');
      },
      keystroke(cmd) {
        this.mathField.keystroke(cmd);
      },
      focus() {
        this.mathField && this.mathField.focus();
      },
      write(latexString) {
        this.mathField && this.mathField.write(latexString);
      },
      getLatex() {
        return this.mathField && this.mathField.latex();
      },
      cmd(command) {
        this.mathField && this.mathField.cmd(command);
        this.mathField.focus();
      },
      disable() {
        let mqtextarea = document.querySelector(".mq-textarea>textarea");
        mqtextarea.setAttribute('disabled', true);
        let mqCursor = document.querySelector(".mq-root-block");
        mqCursor.classList.add("hidden-cursor");
      },
      enable() {
        let mqtextarea = document.querySelector(".mq-textarea>textarea");
        mqtextarea.removeAttribute('disabled');
        let mqCursor = document.querySelector(".mq-root-block ");
        mqCursor.classList.remove("hidden-cursor");
      },
      getText() {
        return this.mathField && this.mathField.text();
      }
    }
  }
</script>
<style>
    .hidden-cursor > span.mq-cursor {
        display: none !important;
    }
</style>