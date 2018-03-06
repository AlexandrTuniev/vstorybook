<template>
  <div id="box" ref="box" class="jxgbox"></div>
</template>

<script>
  if (typeof JXG === "undefined") {
    throw "JXG is undefined";
  }
  export default {
    name: "Slope",
    data() {
      return {
        gliderA: null,
        gliderB: null,
      }
    },
    props: {
      pointA: Array,
      pointB: Array,
      canvasHeight: {
        default: 400,
        type: Number
      },
      canvasWidth: {
        default: 400,
        type: Number
      },
      snapToGrid: {
        default: false,
        type: Boolean,
      },
      x1: {
        default: -10,
        type: Number
      },
      x2: {
        default: 10,
        type: Number,
      },
      y1: {
        default: 10,
        type: Number
      },
      y2: {
        default: -10,
        type: Number,
      },
      ticksDistance: {
        default: 1,
        type: Number
      },
      epsilon: {
        default: 0.2,
        type: Number
      }
    },
    mounted() {
      let board;
      board = this.init();
      board.resizeContainer(this.canvasWidth, this.canvasHeight);
      this.drawLine(this.pointA, this.pointB, board);
    },
    methods: {
      init() {
        return JXG.JSXGraph.initBoard('box', {
          boundingbox: [this.x1, this.y1, this.x2, this.y2],
          showZoom: false,
          showNavigation: false,
          showCopyright: false,
        });
      },
      drawLine(pointA, pointB, board) {
        let perp1, perp2, inter, s1, s2, mp1, mp2, input1, input2;
        let line = board.create('line', [pointA, pointB], {
          strokeWidth: 2,
          fixed: true
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
        line.on("down", (e) => {
          let i, coords;
          if (e[JXG.touchProperty]) {
            // index of the finger that is used to extract the coordinates
            i = 0;
          }
          coords = this.getMouseCoords(e, i, board);
          if (!this.gliderA) {
            this.gliderA = board.create('glider', [coords.usrCoords[1], coords.usrCoords[2], line],
              {
                snapToGrid: this.snapToGrid,
                snapSizeX: 1,
                snapSizeY: 1,
                color: "#ED7D31",
                name: ""
              });
            perp1 = board.create('perpendicular', [ax, this.gliderA], {
              highlight: false,
              strokeWidth: 0,
              name: ""
            });
          } else if (!this.gliderB) {
            this.gliderB = board.create('glider', [coords.usrCoords[1], coords.usrCoords[2], line],
              {
                snapToGrid: this.snapToGrid,
                snapSizeX: 0.5,
                snapSizeY: 0.5,
                color: "#ED7D31",
                name: ""
              });
            perp2 = board.create('perpendicular', [ay, this.gliderB], {
              highlight: false,
              strokeWidth: 0,
              name: ""
            });
            JXG.Point.prototype.isOn = function(line) {
              return line.hasPoint(this.coords.scrCoords[1], this.coords.scrCoords[2]);
            };
            this.gliderA.on('up', () => {
              let x = this.gliderA.X();
              let y = this.gliderA.Y();
              let x1 = Math.round(x);
              let y1 = Math.round(y);
              if (this.isOnLine(line, x1, y1)) {
                let distance = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
                if (distance <= this.epsilon) {
                  this.gliderA.moveTo([x1, y1]);
                }
              }
            });
            this.gliderB.on('up', () => {
              let x = this.gliderB.X();
              let y = this.gliderB.Y();
              let x1 = Math.round(x);
              let y1 = Math.round(y);
              if (this.isOnLine(line, x1, y1)) {
                let distance = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
                if (distance <= this.epsilon) {
                  this.gliderB.moveTo([x1, y1]);
                }
              }
            });
          }
          if (perp1 && perp2 && !inter && !s1 && !s2) {
            inter = board.create('intersection', [perp1, perp2, 0], {
              size: 0,
              name: ""
            });
            s1 = board.create('segment', [inter, this.gliderA], { color: '#5B9BD5' });
            s2 = board.create('segment', [inter, this.gliderB], { color: '#5B9BD5' });
            // invisible point to anchor inputs
            mp1 = board.create('midpoint', [s1], { size: 0, name: "" });
            mp2 = board.create('midpoint', [s2], { size: 0, name: "" });

            input1 = board.create('input', [() => {
              return mp1.X();

            }, () => {
              return mp1.Y();
            }, "", ''], {
              cssStyle: 'width: 40px; background:#FFFF00;box-shadow: #8bd 0 0 1px 2px, inset #6ae 0 0 2px 0;\n' +
              '  border-color: #709AC0;\n' +
              '  border-radius: 1px;',
              fontSize: 15,
            });
            input2 = board.create('input', [() => {
              return mp2.X() - 2;
            }, () => {
              return mp2.Y() - 2;
            }, "", ''], {
              cssStyle: 'width: 40px; background:#FFFF00;box-shadow: #8bd 0 0 1px 2px, inset #6ae 0 0 2px 0;\n' +
              '  border-color: #709AC0;\n' +
              '  border-radius: 1px;',
              fontSize: 15
            });
          }
        });
        board.on('update', () => {
          if (input1 && input2) {
            if (mp1.X() < mp2.X()) {
              input1.setCoords(mp1.X() - 2.5, mp1.Y());
            } else {
              input1.setCoords(mp1.X() + 0.5, mp1.Y());
            }
            if (mp1.Y() < mp2.Y()) {
              input2.setCoords(mp2.X() - 1, mp2.Y() + 1);
            } else {
              input2.setCoords(mp2.X() - 1, mp2.Y() - 1);
            }
          }
        });
      },
      isOnLine(line, x, y) {
        let slope = line.getSlope();
        return (x === +this.pointA[0]) || (slope === (y - this.pointA[1]) / (x - this.pointA[0]));
      },
      getMouseCoords(e, i, board) {
        let cPos = board.getCoordsTopLeftCorner(e, i),
          absPos = JXG.getPosition(e, i),
          dx = absPos[0] - cPos[0],
          dy = absPos[1] - cPos[1];
        return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
      },
    }
  }

</script>

<style>

</style>
