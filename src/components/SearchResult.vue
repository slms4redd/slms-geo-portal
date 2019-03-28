<template>
  <div class="result">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <div class="content" @click="clickHandler(result)">
            <p>
              <strong>{{result.title}}</strong>
              <br>
              {{result.fromtable}}
            </p>
          </div>
        </div>
      </article>
    </div>
  </div> 
</template>

<script>

export default {
  props: [
    'result',
    'clickHandler'
  ]
}

</script>

<style scoped>
.result {
  padding-left: 10px;
  max-width: 500px;
  margin: 0 auto;
  padding-bottom: 0px;
}

.box {
  margin-bottom: 0;
  border-radius: 0;
}

img {
  border-radius: 30px;
}

.level-item {
  padding-left: 10px;
  color: #00d1b2;
}

</style>
