<template>
  <modal v-if=show @close="hideUploadPopup()">
    <div slot="body">
      <div id="dropTarget"><span id="dropText">Drop<br>your KML<br/>file here</span></div>
    </div>
  </modal>
</template>

<script>
import Modal from './Modal'

export default {
  components: {
    'modal': Modal
  },
  props: ['show'],
  methods: {
    hideUploadPopup() {
      this.$emit('disable');
    }
  },
  watch: {
    show(show) {
      let counter = 0;

      const dragenter = function(e) {
        e.stopPropagation();
        e.preventDefault();
        counter++;
        document.getElementById('dropTarget').classList.add('dragover');
      }

      const dragleave = function(e) {
        counter--;
        if (counter === 0) {
          document.getElementById('dropTarget').classList.remove('dragover');
        }
      }

      const dragover = function(e) {
        e.stopPropagation();
        e.preventDefault();
      }

      const handleFiles = files => {
        const file = files[0]; // only the first file is shown - TODO show error
        // TODO check file type
        // if (file.type !== 'application/xml') {
        //   alert('Not a KML file');
        //   return;
        // }

        var reader = new FileReader();
        reader.onload = e => {
          try {
            this.$store.commit('overlay_kml', { kml: e.target.result });
          } catch (err) {
            alert('Error reading the KML file:\n' + err);
          }
          this.hideUploadPopup();
        }
        reader.readAsText(file);
      }

      const drop = function(e) {
        e.stopPropagation();
        e.preventDefault();

        var dt = e.dataTransfer;
        var files = dt.files;

        handleFiles(files);

        counter = 0;
      }
      if (show) {
        this.$nextTick(function() {
          const dropTarget = document.getElementById('dropTarget');
          dropTarget.addEventListener('dragenter', dragenter, false);
          dropTarget.addEventListener('dragleave', dragleave, false);
          dropTarget.addEventListener('dragover', dragover, false);
          dropTarget.addEventListener('drop', drop, false);
        });
      }
    }
  }
}
</script>

<style>
#dropTarget {
  width: 300px;
  height: 186px;
  line-height: 186px;
  border: 3px dashed grey;
  font-weight: bold;
  text-align: center;
  font-size: 32px;
  color: #999;
}
#dropTarget.dragover {
  border-color: #319FD3;
}
#dropText {
  display: inline-block;
  vertical-align: middle;
  line-height: normal;
}
</style>
