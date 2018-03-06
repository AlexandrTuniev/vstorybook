<template>
  <div class="mq-selectable" ref="element">
    <span class="math-quill-static mathquill-embedded-latex" ref="mathField"> {{value}}</span>
  </div>
</template>
<script>
  if (typeof MathQuill === "undefined") {
    throw "MathQuill is undefined";
  }
  import Selectable from 'selectable.js';

  export default {
    name: "math-quill-static-selectable",
    data() {
      return {
        selectable: null,
      }
    },
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
        this.selectable = new Selectable({
          filter: "[mathquill-command-id]:not([class])",
          multiple: true,
          toggle: true,
        });
        let mousedownEvent;
        jQuery(this.$refs.element).mousedown((event) => {
          mousedownEvent = event;
        });


        let isClick = (upEvent, downEvent) => {
          if (!downEvent) {
            return false;
          }
          return (upEvent.clientX - downEvent.clientX === 0) && (upEvent.clientY - downEvent.clientY === 0);
        };

        let dragInplace = false;
        this.selectable.on("selectable.drag", (e, coords) => {
          dragInplace = coords.x2 < 40;
        });
        this.selectable.on("selectable.end", (event, selected, unselected) => {
          this.removeHighlights();
          let selectedNodes = this.selectable.getSelectedNodes();
          let drawRectangles = [];
          for (let i = 0; i < selectedNodes.length; i++) {
            let term = selectedNodes[i];
            //TODO getBoundingClientRect doesn't consider margin and padding, need to find workaround
            let bcr = term.getBoundingClientRect();
            let width = bcr.width;
            let height = bcr.height;
            let top = bcr.top;
            let left = bcr.left;
            let prevR = drawRectangles[drawRectangles.length - 1];
            if (prevR) {
              if (Math.abs((prevR.left + prevR.width) - left) < 0.1) {
                prevR.width += width;
                prevR.height = Math.max(prevR.height, height);
                prevR.top = Math.min(prevR.top, top);
                continue;
              }
            }
            drawRectangles.push({
              width: width,
              height: height,
              top: top,
              left: left
            });

          }
          this.drawRectangles(drawRectangles);
          if (selected.length === 0) {
            this.selectable.clear();
            this.removeHighlights();
          }
        });

      },
      removeHighlights() {
        $('.highlight').remove();
      },
      drawRectangles(rects) {
        rects.forEach((r) => {
          let $div = $("<div></div>");
          $div.addClass('highlight');
          $div.width(r.width);
          $div.height(r.height);
          $(document.body).append($div);
          $div.css({
            position: 'absolute',
            top: r.top,
            left: r.left,
            zIndex: -1
          });
        });
      }
    },
    beforeDestroy() {
      this.removeHighlights();
      this.selectable.destroy();
    }
  }
</script>
<style>
  .mq-selectable {
    display: flex;
    align-items: flex-end;
  }

  .highlight {
    background: #FED957;
  }

  .mq-math-mode .mq-selection,
  .mq-editable-field .mq-selection,
  .mq-math-mode .mq-selection .mq-non-leaf,
  .mq-editable-field .mq-selection .mq-non-leaf,
  .mq-math-mode .mq-selection .mq-scaled,
  .mq-editable-field .mq-selection .mq-scaled {
    background: none !important;
    color: unset !important;
    border-color: unset !important;
  }
</style>
