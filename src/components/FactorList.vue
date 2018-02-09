<template>
  <draggable :list="list" class="factor-list-container" :options="{group:'people'}">
    <slot></slot>
  </draggable>
</template>

<script>
  import draggable from 'vuedraggable';

  export default {
    name: "factor-list",
    props: {
      list: Array,
    },
    components: {
      draggable,
    },
  }
</script>

<style>
  .factor-list-container {
    display: inline-flex;
    flex-direction: row;
    height: 50px;
    background: #E6E6E7;
    justify-content: space-between;
  }
  /* TODO this is shouldn't be handled here*/
  /*.factor-list-container .factor-element:first-child > .factor-operator{*/
    /*display: none;*/
  /*}*/
</style>
