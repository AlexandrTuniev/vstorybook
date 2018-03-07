<template>
  <div class="mq-selectable" ref="element">
    <span class="math-quill-static mathquill-embedded-latex" ref="mathField"> {{value}}</span>
  </div>
</template>
<script>
  // Mathquill itself depends on jQuery, so jq is used here.
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
          filter: "[mathquill-command-id]:not([class]),.mq-binary-operator[mathquill-command-id]",
          multiple: true,
          toggle: true,
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
                let topDiff = Math.abs(prevR.top - top);
                prevR.top = Math.min(prevR.top, top);
                prevR.height = Math.max(prevR.height, height) + topDiff;
                continue;
              }
            }
            drawRectangles.push({
              id: term.getAttribute('mathquill-command-id'),
              width: width,
              height: height,
              top: top,
              left: left
            });
          }

          let fractions = $('.mq-fraction');
          for (let j = 0; j < fractions.length; j++) {
            let anyNumSelected = $(fractions[j])
              .find('.mq-numerator').find('.ui-selected');
            let anyDenSelected = $(fractions[j])
              .find('.mq-denominator').find('.ui-selected');
            let anyOtherSelected = _.some(selectedNodes, (node) => {
              return !$(fractions[j]).has(node).length;
            });
            let firstSelectedNumTermId = $(fractions[j])
              .find('.mq-numerator').find('.ui-selected[mathquill-command-id]')
              .first().attr('mathquill-command-id');
            let firstSelectedDenTermId = $(fractions[j])
              .find('.mq-denominator').find('.ui-selected[mathquill-command-id]')
              .first().attr('mathquill-command-id');
            let numRect = _.find(drawRectangles, (rec) => {
              return rec.id === firstSelectedNumTermId;
            });
            let denRect = _.find(drawRectangles, (rec) => {
              return rec.id === firstSelectedDenTermId;
            });
            let fractionBCR = $(fractions[j]).get(0).getBoundingClientRect();
            if (anyNumSelected.length && anyDenSelected.length) {
              numRect.width = fractionBCR.width;
              numRect.height = fractionBCR.height;
              numRect.top = fractionBCR.top;
              numRect.left = fractionBCR.left;
              if (denRect) {
                denRect.ignore = true;
              }
            }
            if (anyNumSelected.length && anyOtherSelected) {
              numRect.width = fractionBCR.width;
              numRect.height = fractionBCR.height;
              numRect.top = fractionBCR.top;
              numRect.left = fractionBCR.left;
              if (denRect) {
                denRect.ignore = true;
              }
            } else if (anyDenSelected.length && anyOtherSelected) {
              denRect.width = fractionBCR.width;
              denRect.height = fractionBCR.height;
              denRect.top = fractionBCR.top;
              denRect.left = fractionBCR.left;
            }
          }
          drawRectangles = _.filter(drawRectangles, (r) => {return !r.ignore});
          let i = drawRectangles.length;
          while (i--) {
            let curRect = drawRectangles[i];
            let nextRect = drawRectangles[i + 1];
            if (nextRect && Math.abs((curRect.left + curRect.width) - nextRect.left) < 0.1) {
              curRect.width += nextRect.width;
              curRect.top = Math.min(curRect.top, nextRect.top);
              curRect.height = Math.max(curRect.height, nextRect.height);
              nextRect.ignore = true;
              drawRectangles.splice(i + 1, 1);
            }
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
