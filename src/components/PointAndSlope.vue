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
      initialPoint: {
        type: Array,
        default: function() {
          return [-3, 2]
        }
      },
      slope: {
        type: Array,
        default: function() {
          return [-5, 2]
        }
      }
    },
    mounted() {
      let board;
      board = this.init();
      board.resizeContainer(this.canvasWidth, this.canvasHeight);

      // console.log(Tippy());

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
          this.bindMovement();
        } else if (!this.pointB) {
          this.pickPoint('pointB', coords, board, () => {
            AB = board.create('segment', [this.pointA, this.pointB], { fixed: true, });
          });
          this.bindMovement();
        } else if (!this.pointC) {
          this.pickPoint('pointC', coords, board, () => {
            AC = board.create('line', [this.pointA, this.pointC], {
              fixed: true,
              color: "#5795CD"
            });
            BC = board.create('segment', [this.pointB, this.pointC], { fixed: true });
            let p = board.create('polygon', [this.pointA, this.pointB, this.pointC], {
              hasInnerPoints: false,
              borderless: true
            });
            p.borders.forEach((b) => {
              b.setAttribute({ fixed: true });
            });
            this.bindMovement();
          });
        }
      },

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
          // fall-through
          case 'level2':
            if (point === 'pointA') {
              direction = 'horizontal';
              x = coords.usrCoords[1];
              y = coords.usrCoords[2];
            }
            if (point === 'pointB') {
              // B can picked only on the same line as point A
              if (Math.abs(coords.usrCoords[2] - this.pointA.Y()) > this.epsilonY) {
                return;
              }
              direction = 'vertical';
              x = coords.usrCoords[1];
              y = this.pointA.Y();
            }
            if (point === 'pointC') {
              // B can picked only on the same line as point A
              if (Math.abs(coords.usrCoords[1] - this.pointB.X()) > this.epsilonY) {
                return;
              }
              x = this.pointB.X();
              y = coords.usrCoords[2]
            }
            this[point] = board.create('point', [x, y], options);
            this.epsilonSnap(this[point]);
            this.createHelperLine(board, direction, this[point], helperOptions);
            callback();
            break;
        }

      },
      createHelperLine(board, direction, point, options) {
        if (direction === 'horizontal' && options.strokeWidth) {
          this.horizontalHelperLine = board.create('line', [point, [() => {return point.X() + 1}, () => { return point.Y()}]], options);
          this.horizontalHelperLine.rendNode.setAttribute("title", "Change in x");
          this.hTooltip = Tippy("[title]", {
            interactiveBorder: 4,
            trigger: 'manual',
            arrow: true
          });
          this.horizontalHelperLine.rendNode._tippy.show();
          this.horizontalHelperLine.on('attribute:visible', (val, nval, el) => {
            if (val !== nval && nval) {
              el.rendNode._tippy.show();
            }
            if (val !== nval && !nval) {
              el.rendNode._tippy.hide();
            }
          });

        } else if (direction === 'vertical' && options.strokeWidth) {
          if (this.horizontalHelperLine) {
            this.horizontalHelperLine.setAttribute({ visible: false });
          }
          this.verticalHelperLine = board.create('line', [point, [() => {return point.X()}, () => {return point.Y() + 1}]], options);
          this.verticalHelperLine.rendNode.setAttribute("title", "Change in y");
          this.vTooltip = Tippy("[title]", {
            interactiveBorder: 4,
            trigger: 'manual',
            arrow: true,
            placement: 'right'
          });
          this.verticalHelperLine.rendNode._tippy.show();
          this.verticalHelperLine.on('attribute:visible', (val, nval, el) => {
            if (val !== nval && nval) {
              el.rendNode._tippy.show();
            }
            if (val !== nval && !nval) {
              el.rendNode._tippy.hide();
            }
          });
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
      bindMovement() {
        let ADragHandler, BDragHandler, CDragHandler;
        let BMoveHandler = () => {}, CMoveHandler = () => {},
          BOutHandler = () => {}, COutHandler = () => {};
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
        } else if (this.mode === 'level1') { // level 1
          ADragHandler = () => {
            this.epsilonSnap(this.pointA);
            if (this.pointB) {
              this.pointB.moveTo([this.pointB.X(), this.pointA.Y()]);
            }
          };
          BDragHandler = () => {
            this.epsilonSnap(this.pointB);
            this.pointB.moveTo([this.pointB.X(), this.pointA.Y()]);
            if (this.pointC) {
              this.pointC.moveTo([this.pointB.X(), this.pointC.Y()]);
            }
          };
          CDragHandler = () => {
            this.epsilonSnap(this.pointC);
            this.pointC.moveTo([this.pointB.X(), this.pointC.Y()]);
          };
        } else if (this.mode === 'level2') {
          ADragHandler = () => {
            this.epsilonSnap(this.pointA);
            if (this.pointB) {
              this.pointB.moveTo([this.pointB.X(), this.pointA.Y()]);
            }
          };
          BDragHandler = () => {
            this.epsilonSnap(this.pointB);
            this.pointB.moveTo([this.pointB.X(), this.pointA.Y()]);
            if (this.pointC) {
              this.pointC.moveTo([this.pointB.X(), this.pointC.Y()]);
            }

          };
          CDragHandler = () => {
            this.epsilonSnap(this.pointC);
            this.pointC.moveTo([this.pointB.X(), this.pointC.Y()]);
          };
          BMoveHandler = () => {
            if (this.horizontalHelperLine) {
              this.horizontalHelperLine.setAttribute({ visible: true });
            }
            if (this.verticalHelperLine) {
              this.verticalHelperLine.setAttribute({ visible: false });
            }
          };
          CMoveHandler = () => {
            if (this.horizontalHelperLine) {
              this.horizontalHelperLine.setAttribute({ visible: false });
            }
            if (this.verticalHelperLine) {
              this.verticalHelperLine.setAttribute({ visible: true });
            }
          };
          BOutHandler = () => {
            if (this.horizontalHelperLine) {
              this.horizontalHelperLine.setAttribute({ visible: false });
            }
            if (this.verticalHelperLine && !this.pointC) {
              this.verticalHelperLine.setAttribute({ visible: true });
            }
          };
          COutHandler = () => {
            if (this.verticalHelperLine) {
              this.verticalHelperLine.setAttribute({ visible: false });
            }
          };
        }
        this.pointA.off('drag', ADragHandler);
        this.pointB && this.pointB.off('drag', BDragHandler);
        this.pointC && this.pointC.off('drag', CDragHandler);

        this.pointA.on('drag', ADragHandler);
        this.pointB && this.pointB.on('drag', BDragHandler);
        this.pointC && this.pointC.on('drag', CDragHandler);
        this.pointB && this.pointB.on('move', BMoveHandler);
        this.pointC && this.pointC.on('move', CMoveHandler);
        this.pointB && this.pointB.on('out', BOutHandler);
        this.pointC && this.pointC.on('out', COutHandler);
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
