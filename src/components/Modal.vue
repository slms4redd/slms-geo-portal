<template>
  <transition name="modal">
    <div class="modal-mask" @mousedown="$emit('close')">
      <!-- <div class="modal-wrapper" @mousedown="$emit('close')"> -->
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
      <!-- </div> -->
    </div>
  </transition>
</template>

<script>
export default {
  created() {
    window.addEventListener('keydown', this.handleKeyDown)
  },
  methods: {
    handleKeyDown(e) {
      if (e.keyCode === 13 || e.keyCode === 27) this.$emit('close') // enter || esc
    }
  }
}
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

  transition: opacity .2s ease;
}

/* .modal-wrapper {
  vertical-align: middle;
  height: 100%;
} */

.modal-container {
  margin: auto;
  /* padding: 20px 30px; */
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: opacity .2s ease;

  overflow-y: auto;
  width: auto;
  min-width: 250px;
  font-size: 14px;
  padding: 13px 20px 6px 20px;

  max-height: 80%;

  display: inline-block;

  position: fixed;
  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%);
}

.modal-header {
  margin-top: 0;
  text-align: center;
}

.modal-body {
  /* display: table-row; */
  margin: 20px 0;
  max-height: 80%;
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

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

/* .modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
} */

hr {
  margin:0 -20px;
  border: 0;
  height: 1px;
  background: #ddd;
}
</style>
