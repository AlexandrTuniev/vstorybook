<template>
    <div class="el-entry-box"
         v-bind:class="{'cancel-hidden':cancelHidden}">
        <div class="el-entry-box-container">
            <div class="el-input-container"
                 v-bind:class="{'actions-disabled': !actionsVisible}">
                <div class="el-input-label">{{headerText}} :</div>
                <math-quill-input ref="mathquill" :onFocus="onFocus"
                                  :change="onChange"></math-quill-input>
                <!--TODO these are copied from http://khan.github.io/math-input/ consider to replace with something else-->
                <!--Refactor to separate component-->
                <div v-if="actionsVisible" class="el-entry-box-actions">
                    <div class="el-entry-box-action" @click="addExponent"
                         v-bind:class="{disabled:disabled}">
                        <svg width="48" height="48" viewBox="0 0 48 48">
                            <g fill="none" fill-rule="evenodd">
                                <path fill="none" d="M0 0h48v48H0z"></path>
                                <path d="M28 16.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006zM30 18h4v4h-4v-4zM14 21c0-.552.456-1 1.002-1h9.996A1 1 0 0 1 26 21v14c0 .552-.456 1-1.002 1h-9.996A1 1 0 0 1 14 35V21zm2 1h8v12h-8V22z"
                                      fill="#3B3E40"></path>
                            </g>
                        </svg>
                    </div>
                    <div class="el-entry-box-action" @click="addFraction"
                         v-bind:class="{disabled:disabled}">
                        <svg width="48" height="48" viewBox="0 0 48 48">
                            <g fill="none" fill-rule="evenodd">
                                <path fill="none" d="M0 0h48v48H0z"></path>
                                <g transform="translate(12 12)">
                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                    <path d="M8 16.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997H8.997c-.55 0-.997-.453-.997-.997v-6.006zM10 18h4v4h-4v-4z"
                                          fill="#3B3E40"></path>
                                    <rect fill="#3B3E40" x="2" y="11" width="20"
                                          height="2" rx="1"></rect>
                                    <path d="M8 .997C8 .447 8.453 0 8.997 0h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997H8.997C8.447 8 8 7.547 8 7.003V.997zM10 2h4v4h-4V2z"
                                          fill="#3B3E40"></path>
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="el-buttons-container">
                <div class="el-entry-box-button ok-button"
                     v-bind:class="{disabled:disabled, 'cancel-hidden':cancelHidden}"
                     @click="okHandler">OK
                </div>

                <div class="el-entry-box-button cancel-button"
                     v-bind:class="{disabled:disabled, 'cancel-hidden':cancelHidden}"
                     @click="cancelHandler">CANCEL
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import MathQuillInput from "./MathQuillInput.vue";

  export default {
    components: { MathQuillInput },
    name: "entry-box",
    props: {
      headerText: String,
      cancelHidden: Boolean,
      onOk: Function,
      onCancel: Function,
      disabled: Boolean,
      onFocus: Function,
      onChange: Function,
      actionsVisible: Boolean
    },
    watch: {
      disabled: function(val, oldVal) {
        if (val) {
          this.disablemq();
        } else {
          this.enablemq();
        }
      }
    },
    methods: {
      okHandler: function() {
        !this.disabled && this.onOk && this.onOk();
      },
      cancelHandler: function() {
        !this.disabled && this.onCancel && this.onCancel();
      },
      addExponent: function() {
        if (!this.disabled) {
          this.$refs.mathquill.write('\\left(\\right)');
          this.$refs.mathquill.cmd('^');
        }
      },
      addFraction: function() {
        if (!this.disabled) {
          this.$refs.mathquill.cmd('/');
        }
      },
      disablemq: function() {
        this.$refs.mathquill.disable();
      },
      enablemq: function() {
        this.$refs.mathquill.enable();
      },
      getMqRef: function() {
        return this.$refs.mathquill;
      }
    }
  }
</script>

<style>
    .el-entry-box {
        background: white;
        border-radius: 10px;
        width: 500px;
        box-shadow: 0 4px 80px -8px rgba(0, 20, 60, 0.25);
    }

    .el-entry-box-container {
        display: flex;
        flex-direction: row;
        height: 100%;
    }

    /*Input and label*/
    .el-input-container {
        flex-basis: 60%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 20px;
        padding-bottom: 0;
    }

    .el-input-container.actions-disabled {
        padding-bottom: 20px;
    }

    .el-input-label {
        width: 100%;
        font-family: Montserrat;
        font-size: 18px;
        color: #555555;
        padding-bottom: 10px;
    }

    /*Buttons*/
    .el-buttons-container {
        flex-basis: 40%;
        display: flex;
        flex-direction: row;
    }

    .el-entry-box-button {
        flex-basis: 50%;
        display: flex;
        justify-content: center;
        flex-direction: column;
        text-align: center;
        font-family: Montserrat;
        font-size: 18px;
        cursor: pointer;
    }

    .el-entry-box-button.ok-button {
        background: #66d79f;
        color: #ffffff;
    }

    .el-entry-box-button.cancel-button {
        color: #2486b5;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
    }

    .el-entry-box-button.ok-button:hover {
        background: #00bc5f;
    }

    .el-entry-box-button.cancel-button:hover {
        background: #2486b5;
        color: white;
    }

    .el-entry-box-button.disabled {
        opacity: 0.3;
        -webkit-transition: opacity .15s ease-in-out;
        -moz-transition: opacity .15s ease-in-out;
        transition: opacity .15s ease-in-out;
    }

    .el-entry-box-button.ok-button.cancel-hidden {
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        flex-basis: 100%;
    }

    .el-entry-box-button.cancel-button.cancel-hidden {
        display: none;
    }

    .el-entry-box.cancel-hidden {
        width: 408px;
    }

    .el-entry-box.cancel-hidden .el-input-container {
        flex-basis: 80%;
    }

    .el-entry-box.cancel-hidden .el-buttons-container {
        flex-basis: 20%;
    }

    .el-entry-box-actions {
        display: flex;
    }

    .el-entry-box-action:hover {
        background: #00bc5f;
    }

    .el-entry-box-action.disabled {
        opacity: 0.3;
        -webkit-transition: opacity .15s ease-in-out;
        -moz-transition: opacity .15s ease-in-out;
        transition: opacity .15s ease-in-out;
    }

    .math-quill-input {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        overflow: hidden;
        font-size: 28px;
        max-height: 65px;
        max-width: 278px;
    }

    @media screen and (max-width: 600px) {
        .el-entry-box {
            width: 400px;
            z-index: 20;
        }
    }
</style>