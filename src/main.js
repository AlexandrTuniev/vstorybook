let component = require("./stories/Entrybox.vue");

module.exports = {
  component,
  install(Vue) {
    Vue.component("Entrybox", component);
  }
};
