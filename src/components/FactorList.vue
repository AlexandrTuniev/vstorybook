<template>
  <draggable :list="list" class="factor-list-container"
             :options="dOptions"
             @change="onChange">
    <slot></slot>
  </draggable>
</template>

<script>
  import draggable from 'vuedraggable';

  export default {
    name: "factor-list",
    props: {
      list: Array,
      dOptions: Object,
    },
    components: {
      draggable,
    },
    methods:{
      onChange(e){
        this.$emit('change', e, this.dOptions.name);
      }
    }
  }
</script>

<style>
  .factor-list-container {
    display: inline-flex;
    flex-direction: row;
    height: 50px;
    background: #E6E6E7;
    justify-content: space-between;
    min-width: 40px;
    align-items: flex-end;
    padding: 5px;
  }

  .sortable-ghost {
    opacity: 0.1;
    border: 1px dashed;
  }

  .sortable-chosen {
    background: white;
  }

  .sortable-drag {
    opacity: 1;
  }
</style>
