<template>
  <div class="math-quill-static-container">
    <span class="math-quill-static" ref="mathField">{{value}}</span>
  </div>
</template>

<script>
  if (typeof MathQuill === "undefined") {
    throw "MathQuill is undefined";
  }
  export default {
    name: "math-quill-static",
    props: {
      value: [String, Number],
    },
    mounted() {
      this.mathquillify();
    },
    methods: {
      mathquillify() {
        const MQ = MathQuill.getInterface(2);
        this.mathField = MQ.StaticMath(this.$refs.mathField);
      },
    }
  }
</script>
<style>
.math-quill-static-container{
  display: flex;
  align-items: flex-end;
}
</style>

