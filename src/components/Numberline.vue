<template>
    <div id="box" ref="box" class="jxgbox"
         style="width:100%; height:100%;"></div>
</template>

<script>
  if (typeof JXG === "undefined") {
    throw "MathQuill is undefined";
  }
  export default {
    name: "jsxgraph",
    props: {
      numbers: Array,
      yOffset: Number,
    },
    mounted() {
      let board = this.init();
      this.draw(this.numbers, board);
    },
    methods: {
      init() {
        // getting extreme points
        let minPoint = 0;
        let maxPoint = 0;
        let sum = 0;
        this.numbers.forEach((num) => {
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
            drawZero: true,
            majorHeight: 10,
            minorTicks: 0,
            insertTicks: false,
          }
        });
        return board;
      },
      draw(nums, board) {
        let sum = 0;
        for (let [i, n] of nums.entries()) {
          let s = board.create("arrow",
            [[sum, this.yOffset - i - 1], [n + sum, this.yOffset - i - 1]],
            {
              label: {
                position: "top",
              },
              fixed: true,
            });
          s.setLabel(n > 0 ? "+" + n.toString() : n.toString());
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
        board.create("point", [0, this.yOffset],
          {
            color: "blue",
            name: "",
            fixed: true,
          });
        board.create("point", [sum, this.yOffset],
          {
            color: "red",
            name: "",
            fixed: true,
          });
      }
    }
  }
</script>

<style>

</style>
