<template>
  <modal v-if=show>
    <h1 slot="header">{{error ? 'Error' : 'Login'}}</h1>
    <div slot="body" class="body">
      <div v-if="error">
        <p>{{error}}</p>
      </div>
      <table v-else>
        <tr>
          <td>User:</td>
          <td><input type="text" v-model="user" placeholder="Enter your username"></td>
        </tr>
        <tr>
          <td>Pasword:</td>
          <td><input type="password" v-model="password" placeholder="Enter your password"></td>
        </tr>
      </table>
    </div>
    <div slot="footer">
      <a v-if="error" href="#" class="modal-default-button" @click.prevent="cancel">
        Ok
      </a>
      <template v-else>
        <a href="#" class="modal-default-button" @click.prevent="submit">
          Login
        </a>
        <a href="#" class="modal-default-button" @click.prevent="cancel">
          Cancel
        </a>
      </template>
    </div>
  </modal>
</template>

<script>
import auth from '../auth';

import Modal from './Modal';

export default {
  data() {
    return {
      user: null,
      password: null,
      error: null
    };
  },
  components: {
    Modal
  },
  props: ['show'],
  methods: {
    submit(user, password) {
      const credentials = {
        username: this.user,
        password: this.password
      };
      auth.login(credentials, 'secretquote')
          .then(user => {
            this.$emit('disable');
            this.user = this.password = this.error = null;
          })
          .catch(function(error) { this.error = error.statusText }.bind(this));
    },
    cancel() {
      this.$emit('disable');
      this.user = this.password = this.error = null;
    }
  }
};
</script>

<style scoped>
h1 {
  font-size: 16px;
  color: dimgrey;
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
.body {
  height: 60px;
  color: black;
}
</style>
