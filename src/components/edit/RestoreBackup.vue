<template>
  <modal>
    <h1 slot="header">Restore from backup</h1>
    <div slot="body">
      <ul>
        <li v-for="backup in versions"
            @click="setRestoreVersion(backup.version)"
            v-bind:class="{ highlighted: backup.version === restoreVersion }" >
          Version {{backup.version}} - {{backup.date}}
        </li>
      </ul>
    </div>
    <div slot="footer">
      <a href="#" class="modal-default-button" @click.prevent="$emit('close')">Cancel</a>
      <a href="#" class="modal-default-button" @click.prevent="restore">Restore</a>
    </div>
  </modal>
</template>

<script>
import Modal from '../Modal';

export default {
  data() {
    return {
      restoreVersion: Math.max.apply(null, this.backups.map(b => b.version)),
      versions: this.backups.map(b => ({ version: b.version, date: new Date(b.date).toLocaleString() }))
    };
  },
  components: {
    'modal': Modal
  },
  props: {
    backups: Array
  },
  methods: {
    restore() {
      if (confirm(`Are you sure you want to restore version ${this.restoreVersion} of the configuration?`)) {
        this.$emit('close');
        this.$store.dispatch('restoreBackup', { version: this.restoreVersion });
      }
    },
    setRestoreVersion(version) {
      this.restoreVersion = version;
    }
  }
};
</script>

<style scoped>
h1 {
  font-size: 16px;
}
li {
  list-style: none;
  padding-left: 0;
  cursor: pointer;
}
ul {
  padding: 0;
  margin: 0;
}
.highlighted {
  font-weight: bold;
}
</style>
