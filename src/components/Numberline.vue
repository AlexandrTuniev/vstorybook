<template>
  <div id="box" ref="box" class="jxgbox"></div>
</template>

<script>
  if (typeof JXG === "undefined") {
    throw "JXG is undefined";
  }
  import Tippy from 'tippy.js';
  import * as _ from 'lodash';

  export default {
    name: "jsxgraph",
    props: {
      numbers: Array,
      yOffset: Number,
      breakPoints: {
        type: Array,
        default: function() {
          return [
            {
              absoluteDifference: 20,
              ticksDistance: 1,
              canvasHeight: 300,
              canvasWidth: 150,
            },
            {
              absoluteDifference: 40,
              ticksDistance: 1,
              canvasHeight: 600,
              canvasWidth: 150,
            },
            {
              absoluteDifference: 50,
              ticksDistance: 2,
              canvasHeight: 300,
              canvasWidth: 150,
            },
            {
              absoluteDifference: Infinity,
              ticksDistance: 5,
              canvasHeight: 300,
              canvasWidth: 150,
            }
          ]
        }
      }
    },
    mounted() {
      let board;
      let chResult = this.checkNumbers(this.numbers);
      let parsedNums = this.stripVariables(this.numbers);
      let extremaPoints = this.getExtremaPoints(parsedNums);
      let tickDistance = 1;
      let canvasHeight = 300;
      let canvasWidth = 150;
      _.forEach(this.breakPoints, (bpt) => {
        if ((extremaPoints.maximum - extremaPoints.minimum) <= bpt.absoluteDifference) {
          canvasHeight = bpt.canvasHeight;
          canvasWidth = bpt.canvasWidth;
          tickDistance = bpt.ticksDistance;
          return false;
        }
      });
      switch (chResult) {
        case 'variables':
          board = this.init(tickDistance, extremaPoints, true);
          this.draw(parsedNums, board, true);
          board.resizeContainer(canvasHeight, canvasWidth);
          break;
        case 'non-variables':
          board = this.init(tickDistance, extremaPoints, false);
          this.draw(parsedNums, board, false);
          board.resizeContainer(canvasHeight, canvasWidth);
          break;
        case 'mixed':
          break;
      }
      Tippy("[title]", {
        interactiveBorder: 4,
      });
    },
    methods: {
      init(tickDistance, extremaPoints, scaleByX) {
        // getting extreme points
        let minPoint = extremaPoints.minimum;
        let maxPoint = extremaPoints.maximum;
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
            scaleSymbol: scaleByX ? 'x' : '',
            drawZero: true,
            ticksDistance: tickDistance,
            majorHeight: 20,
            tickEndings: [1, 1],
            minorTicks: 0,
            label: { fontSize: 10, offset: [0, -8], },
            anchorX: 'middle',
          }
        });
        return board;
      },
      checkNumbers(numbers) {
        let allVariables = _.every(numbers, (num) => {return num.indexOf('x') > -1});
        let allNonVariables = _.every(numbers, (num) => {return num.indexOf('x') === -1});
        if (allVariables) {
          return 'variables';
        } else if (allNonVariables) {
          return 'non-variables';
        } else {
          return 'mixed';
        }
      },
      getExtremaPoints(numbers) {
        let maximum = 0;
        let minimum = 0;
        let sum = 0;
        _.forEach(numbers, (num) => {
          sum += num;
          if (sum > maximum) {
            maximum = sum;
          }
          if (sum < minimum) {
            minimum = sum;
          }
        });
        return { maximum, minimum };
      },
      stripVariables(numbers) {
        return numbers.map((num) => {
          let striped = num.replace(/[^\d|\-]/g, "");
          if (striped === "-" || striped === "+" || striped === "") {
            striped += "1"
          }
          return +striped;
        });
      },
      draw(nums, board, scaleByX) {
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
          s.setLabel(n > 0 ? "+" + n.toString() + (scaleByX ? 'x' : '') : n.toString() + (scaleByX ? 'x' : ''));
          let tip;
          if (n > 0) {
            tip = "positive so it moves to the right";
          } else {
            tip = "negative so it moves to the left";
          }

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
