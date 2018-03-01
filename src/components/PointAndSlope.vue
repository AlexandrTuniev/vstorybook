<template>
  <div id="box" ref="box" class="jxgbox"></div>
</template>

<script>
  if (typeof JXG === "undefined") {
    throw "JXG is undefined";
  }
  import Tippy from 'tippy.js';

  export default {
    name: "PointAndSlope",
    data() {
      return {
        pointA: null,
        pointB: null,
        pointC: null,
        pointPickingInProgress: false,
        horizontalHelperLine: null,
        verticalHelperLine: null,
        horizontalHelperLineAnchor: null,
        verticalHelperLineAnchor: null,
        hTooltip: null,
        vTooltip: null
      }
    },
    props: {
      canvasHeight: {
        default: 400,
        type: Number
      },
      canvasWidth: {
        default: 400,
        type: Number
      },
      xMax: {
        default: 10,
        type: Number,
      },
      xMin: {
        default: -10,
        type: Number
      },
      yMax: {
        default: 10,
        type: Number,
      },
      yMin: {
        default: -10,
        type: Number
      },
      ticksDistance: {
        default: 1,
        type: Number
      },
      mode: {
        default: 'level0',
        type: String
      },
      epsilonX: {
        type: Number,
        default: 0.2
      },
      epsilonY: {
        type: Number,
        default: 0.2
      },
      pickEpsilon: {
        type: Number,
        default: 3
      }
    },
    mounted() {
      let board;
      board = this.init();
      board.resizeContainer(this.canvasWidth, this.canvasHeight);
    },
    beforeDestroy() {
      if (this.hTooltip) {
        this.hTooltip.destroyAll();
      }
      if (this.vTooltip) {
        this.vTooltip.destroyAll();
      }
    },
    methods: {
      init() {
        let board = JXG.JSXGraph.initBoard('box', {
          boundingbox: [this.xMin, this.yMin, this.xMax, this.yMax],
          showZoom: false,
          showNavigation: false,
          showCopyright: false,
        });

        let ax = board.create('axis', [[0, 0], [1, 0]], {
          strokeColor: 'black',
          ticks: {
            insertTicks: false,
            ticksDistance: this.ticksDistance,
          }
        });

        let ay = board.create('axis', [[0, 0], [0, 1]], {
          strokeColor: 'black',
          ticks: {
            insertTicks: false,
            ticksDistance: this.ticksDistance,
          }
        });

        board.on("down", (e) => {
          let i, canCreate = true, coords;
          if (e[JXG.touchProperty]) {
            // index of the finger that is used to extract the coordinates
            i = 0;
          }
          coords = this.getMouseCoords(e, i, board);
          for (let el in board.objects) {
            if (JXG.isPoint(board.objects[el]) && board.objects[el].hasPoint(coords.scrCoords[1], coords.scrCoords[2])) {
              canCreate = false;
              break;
            }
          }
          if (canCreate) {
            this.createPoint(coords, board);
          }
        });
        return board;
      },
      createPoint(coords, board) {
        let AB, AC, BC;
        if (!this.pointA) {
          this.pointPickingInProgress = true;
          this.pickPoint('pointA', coords, board, () => {
          });
          this.bindMovement(board);
        } else if (!this.pointB) {
          this.pickPoint('pointB', coords, board, () => {
            AB = board.create('segment', [this.pointA, this.pointB], { fixed: true, });

            if (this.mode === 'level2') {
              // invisible point to anchor tooltips
              this.horizontalHelperLineAnchor = board.create('midpoint', [AB], {
                size: 0,
                name: ""
              });
              this.horizontalHelperLineAnchor.rendNode.setAttribute("title", `Change in X=${AB.L().toFixed(2)}`);
              this.hTooltip = Tippy(this.horizontalHelperLineAnchor.rendNode, {
                interactiveBorder: 4,
                trigger: 'manual',
                arrow: true,
                dynamicTitle: true,
                placement: 'bottom'
              });
              this.horizontalHelperLineAnchor.rendNode._tippy.show();
            }
          });
          this.bindMovement(board);
        } else if (!this.pointC) {
          this.pickPoint('pointC', coords, board, () => {
            AC = board.create('line', [this.pointA, this.pointC], {
              fixed: true,
              color: "#5795CD"
            });
            BC = board.create('segment', [this.pointB, this.pointC], { fixed: true });
            if (this.mode === 'level2') {
              this.verticalHelperLineAnchor = board.create('midpoint', [BC], {
                size: 0,
                name: ""
              });
              this.verticalHelperLineAnchor.rendNode.setAttribute("title", `Change in Y=${BC.L().toFixed(2)}`);
              this.vTooltip = Tippy(this.verticalHelperLineAnchor.rendNode, {
                interactiveBorder: 4,
                trigger: 'manual',
                arrow: true,
                dynamicTitle: true,
                placement: 'right'
              });
              this.verticalHelperLineAnchor.rendNode._tippy.show();
            }
            let p = board.create('polygon', [this.pointA, this.pointB, this.pointC]);
            p.borders.forEach((b) => {
              b.setAttribute({ fixed: true });
            });
            this.bindMovement(board);
          });
        }
      },
      // todo cleanup this, simplify  level1 and 2 share a lot in common, need to fix this
      pickPoint(point, coords, board, callback) {
        let options = {
          color: "#ED7D31",
          name: "",
        };
        let helperOptions = {
          color: '#D9D9D9',
          strokeWidth: 2,
          highlight: false,
        };
        let x, y;
        let direction = '';
        switch (this.mode) {
          case 'level0':
            this[point] = board.create('point', [coords.usrCoords[1], coords.usrCoords[2]], options);
            callback();
            break;
          case 'level1':
            helperOptions.strokeWidth = 0;
            if (point === 'pointA') {
              direction = 'horizontal';
              x = coords.usrCoords[1];
              y = coords.usrCoords[2];
              this[point] = board.create('point', [x, y], options);
              this.epsilonSnap(this[point]);
              this.createHelperLine(board, direction, this[point], helperOptions);
            }
            if (point === 'pointB') {
              // B can picked only on the same line as point A
              if (Math.abs(coords.usrCoords[2] - this.pointA.Y()) > this.pickEpsilon) {
                return;
              }
              direction = 'vertical';
              x = coords.usrCoords[1];
              y = this.pointA.Y();
              this[point] = board.create('glider', [x, y, this.horizontalHelperLine], options);
              this.epsilonSnap(this[point]);
              this.createHelperLine(board, direction, this[point], helperOptions);
            }
            if (point === 'pointC') {
              // B can picked only on the same line as point A
              if (Math.abs(coords.usrCoords[1] - this.pointB.X()) > this.pickEpsilon) {
                return;
              }
              x = this.pointB.X();
              y = coords.usrCoords[2];
              this[point] = board.create('glider', [x, y, this.verticalHelperLine], options);
              this.epsilonSnap(this[point]);
              this.createHelperLine(board, direction, this[point], helperOptions);
            }

            callback();
            break;
          case 'level2': // todo refactor
            if (point === 'pointA') {
              direction = 'horizontal';
              x = coords.usrCoords[1];
              y = coords.usrCoords[2];
              this[point] = board.create('point', [x, y], options);
              this.epsilonSnap(this[point]);
              this.createHelperLine(board, direction, this[point], helperOptions);
            }
            if (point === 'pointB') {
              // B can picked only on the same line as point A
              if (Math.abs(coords.usrCoords[2] - this.pointA.Y()) > this.epsilonY) {
                return;
              }
              direction = 'vertical';
              x = coords.usrCoords[1];
              y = this.pointA.Y();
              this[point] = board.create('glider', [x, y, this.horizontalHelperLine], options);
              this.epsilonSnap(this[point]);
              this.createHelperLine(board, direction, this[point], helperOptions);
            }
            if (point === 'pointC') {
              // B can picked only on the same line as point A
              if (Math.abs(coords.usrCoords[1] - this.pointB.X()) > this.epsilonY) {
                return;
              }
              x = this.pointB.X();
              y = coords.usrCoords[2];
              this[point] = board.create('glider', [x, y, this.verticalHelperLine], options);
              this.epsilonSnap(this[point]);
              this.createHelperLine(board, direction, this[point], helperOptions);
            }
            callback();
            break;
        }

      },
      createHelperLine(board, direction, point, options) {
        if (direction === 'horizontal') {
          this.horizontalHelperLine = board.create('line', [point, [() => {return point.X() + 1}, () => { return point.Y()}]], options);
        } else if (direction === 'vertical') {
          this.verticalHelperLine = board.create('line', [point, [() => {return point.X()}, () => {return point.Y() + 1}]], options);
        }
      },
      checkPointCorrectness(point, xCoord, yCoord) {
        if (xCoord !== 'any') {
          if (xCoord !== point.X()) {
            return false;
          }
        }
        if (yCoord !== 'any') {
          if (yCoord !== point.Y()) {
            return false;
          }
        }
        return true;
      },
      bindMovement(board) {
        let ADragHandler, BDragHandler, CDragHandler;
        if (this.mode === 'level0') {// level 0 snapping based on epsilon
          ADragHandler = () => {
            this.epsilonSnap(this.pointA);
          };
          BDragHandler = () => {
            this.epsilonSnap(this.pointB);
          };
          CDragHandler = () => {
            this.epsilonSnap(this.pointC);
          };
          if (this.pointA && this.pointB && this.pointC) {
            let g = board.create('group', [this.pointA, this.pointB, this.pointC]);
            g.removeTranslationPoint(this.pointB);
            g.removeTranslationPoint(this.pointC);
          }
        } else if (this.mode === 'level1') { // level 1
          ADragHandler = () => {
            this.epsilonSnap(this.pointA);
          };
          BDragHandler = () => {
            this.epsilonSnap(this.pointB);
          };
          CDragHandler = () => {
            this.epsilonSnap(this.pointC);
          };
        } else if (this.mode === 'level2') {
          ADragHandler = () => {
            this.epsilonSnap(this.pointA);
            if (this.pointB) {
              this.horizontalHelperLineAnchor && this.horizontalHelperLineAnchor
                .rendNode.setAttribute("title", `Change in x=${this.pointA.Dist(this.pointB).toFixed(2)}`);
            }
            if (this.pointC) {
              this.verticalHelperLineAnchor && this.verticalHelperLineAnchor
                .rendNode.setAttribute("title", `Change in Y=${this.pointB.Dist(this.pointC).toFixed(2)}`);
            }
          };
          BDragHandler = () => {
            this.epsilonSnap(this.pointB);
            this.horizontalHelperLineAnchor && this.horizontalHelperLineAnchor
              .rendNode.setAttribute("title", `Change in X=${this.pointA.Dist(this.pointB).toFixed(2)}`);
            if (this.pointC) {
              this.verticalHelperLineAnchor && this.verticalHelperLineAnchor
                .rendNode.setAttribute("title", `Change in Y=${this.pointB.Dist(this.pointC).toFixed(2)}`);
            }

          };
          CDragHandler = () => {
            this.epsilonSnap(this.pointC);
            this.verticalHelperLineAnchor && this.verticalHelperLineAnchor
              .rendNode.setAttribute("title", `Change in Y=${this.pointB.Dist(this.pointC).toFixed(2)}`);
          };
        }
        this.pointA.off('drag', ADragHandler);
        this.pointB && this.pointB.off('drag', BDragHandler);
        this.pointC && this.pointC.off('drag', CDragHandler);

        this.pointA.on('drag', ADragHandler);
        this.pointB && this.pointB.on('drag', BDragHandler);
        this.pointC && this.pointC.on('drag', CDragHandler);
      },
      epsilonSnap(point) {
        let roundedX = Math.round(point.X());
        let roundedY = Math.round(point.Y());
        let newX = point.X();
        let newY = point.Y();
        if (Math.abs(roundedY - point.Y()) <= this.epsilonY) {
          newY = roundedY;
        }
        if (Math.abs(roundedX - point.X()) <= this.epsilonX) {
          newX = roundedX;
        }
        point.moveTo([newX, newY]);
      },
      getMouseCoords(e, i, board) {
        let cPos = board.getCoordsTopLeftCorner(e, i),
          absPos = JXG.getPosition(e, i),
          dx = absPos[0] - cPos[0],
          dy = absPos[1] - cPos[1];
        return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
      },
      down(e) {

      },
    }
  }

</script>

<style>

</style>
