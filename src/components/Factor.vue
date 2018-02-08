<template>
  <div class="factor-element" @click="onClick && onClick(value, $event)">
    <span class="factor-operator">*</span>
    {{value.value}}
  </div>
</template>

<script>
  export default {
    name: "factor",
    props: {
      value: Object,
      onClick: Function
    },
    watch: {},
    methods: {}
  }
</script>

<style>
  .factor-element {
    font-size: 24px;
    padding: 4px;
    margin: 5px;
    border: 1px solid;
    cursor: pointer;
  }
</style>
