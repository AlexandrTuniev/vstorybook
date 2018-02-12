<template>
  <div id="box" ref="box" class="jxgbox"
       style="width:100%; height:100%;"></div>
</template>

<script>
  if (typeof JXG === "undefined") {
    throw "MathQuill is undefined";
  }
  import Tippy from 'tippy.js';
  export default {
    name: "jsxgraph",
    props: {
      numbers: Array,
      yOffset: Number,
    },
    mounted() {
      let board = this.init();
      let parsedNums = this.stripVariables(this.numbers);
      this.draw(parsedNums, board);
      Tippy("[title]", {
        interactiveBorder: 4,
      });
    },
    methods: {
      init() {
        // getting extreme points
        let minPoint = 0;
        let maxPoint = 0;
        let sum = 0;
        let parsedNums = this.stripVariables(this.numbers);
        parsedNums.forEach((num) => {
          sum += num;
          if (minPoint > sum) {
            minPoint = sum;
          }
          if (maxPoint < sum) {
            maxPoint = sum;
          }
        });

        let xMin = Math.floor(minPoint + minPoint / 10) - 1;
        let xMax = Math.floor(maxPoint + maxPoint / 10) + 1;
        let board = JXG.JSXGraph.initBoard('box', {
          boundingbox: [xMin, this.yOffset + 1, xMax, -this.numbers.length - 1],
          showZoom: false,
          showNavigation: false,
          showCopyright: false,
        });
        // create x axis
        board.create('axis', [[0, this.yOffset], [1, this.yOffset]], {
          firstArrow: true,
          lastArrow: true,
          ticks: {
            insertTicks: false,
            scaleSymbol: 'x',
            drawZero: true,
            ticksDistance: 1,
            majorHeight: 20,
            tickEndings: [1, 1],
            minorTicks: 0,
            label: { fontSize: 10, offset: [0, -8], },
            anchorX: 'middle',
          }
        });
        return board;
      },
      stripVariables(numbers){
        return numbers.map((num) => {
          return +num.replace(/[^\d|\-]/g,"");
        });
      },
      draw(nums, board) {
        let sum = 0;
        for (let [i, n] of nums.entries()) {
          let s = board.create("arrow",
            [[sum, this.yOffset - i - 1], [n + sum, this.yOffset - i - 1]],
            {
              fixed: true,
              strokeWidth: 3,
              label: {
                offset: [0, 8],
                anchorX: 'middle',
                position: 'top'
              },
            });
          s.setLabel(n > 0 ? "+" + n.toString()+ 'x' : n.toString() + 'x');
          let tip;
          if (n > 0)
            tip = "positive so it moves to the right";
          else
            tip = "negative so it moves to the left";
          s.rendNode.setAttribute("title", tip);

          board.create("segment",
            [[sum, this.yOffset - i], [sum, this.yOffset - i - 1]],
            {
              strokeWidth: 1, dash: 2, color: "red", fixed: true,
            });
          sum = sum + n;
        }
        board.create("segment",
          [[sum, this.yOffset - nums.length], [sum, this.yOffset]],
          {
            strokeWidth: 1,
            dash: 2,
            color: "red",
            fixed: true,
          });
        let startPoint = board.create("point", [0, this.yOffset],
          {
            fixed: true,
            color: "green",
            name: "start",
            draggable: false,
            label: {
              offset: [0, 6],
              anchorX: 'middle',
              anchorY: 'bottom',
            }
          });
        startPoint.rendNode.setAttribute("title", "start from 0");
        startPoint.label.rendNode.setAttribute("title", "start from 0");
        let endPoint = board.create("point", [sum, this.yOffset],
          {
            fixed: true,

            color: "red",
            name: "end",
            draggable: false,
            showInfobox: false,
            label: {
              offset: [0, 6],
              anchorX: 'middle',
              anchorY: 'bottom',
            }
          });
        endPoint.rendNode.setAttribute("title", "result of computation");
        endPoint.label.rendNode.setAttribute("title", "result of computation");
      }
    }
  }

</script>

<style>

</style>
