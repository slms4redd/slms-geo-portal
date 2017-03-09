<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper" @mousedown="$emit('close')">
        <div class="modal-container" @mousedown.stop>
          <div v-if="$slots.header" class="modal-header">
            <slot name="header"></slot>
          </div>
          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>
          <hr>
          <div class="modal-footer">
            <slot name="footer">
              <a href="#" class="modal-default-button" @click.prevent="$emit('close')">
                Close
              </a>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  created: function() {
    window.addEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleKeyDown(e) {
      // enter || esc
      if (e.keyCode === 13 || e.keyCode === 27) {
        this.$emit('close');
      }
    }
  }
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .33);
  display: table;
  transition: opacity .2s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}

.modal-container {
  font-size: 14px;
  width: auto;
  display: inline-block;
  margin: 0px auto;
  padding: 13px 20px 6px 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  transition: all .3s ease;
  text-align: left;
  min-width: 250px;
  max-width: 80%;
  max-height: 80%;
  overflow: auto;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
  color: #006ae8;
  padding: 6px 6px;
  font-size: 15px;
  text-decoration: none;
  margin-top: 5px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

hr {
  margin:0 -20px;
  border: 0;
  height: 1px;
  background: #ddd;
}

/*.modal-container {
  / * Float fix * /
  overflow: hidden;
}*/
</style>
