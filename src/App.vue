<template>
  <div id="app">
    <banner></banner>
    <legendPane></legendPane>
    <mapPane></mapPane>
  </div>
</template>

<script>
import Hello from './components/Hello'
import Banner from './components/Banner'
import LegendPane from './components/LegendPane'
import MapPane from './components/MapPane'

export default {
  name: 'app',
  components: {
    Banner,
    LegendPane,
    MapPane
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
html {
  height: 100%;
}
body {
  min-height: 100%;
}
</style>


<html>
  <head>
    <script src="https://code.jquery.com/jquery-1.7.1.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/openlayers/2.11/OpenLayers.js"></script>
    <script src="dist/bundle.js"></script>
    <script src="http://code.jquery.com/ui/1.8.16/jquery-ui.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/2.0.5/jquery.fancybox.pack.js"></script>

    <link rel="stylesheet" type="text/css" href="src/css/openlayers/style.css">
    <link rel="stylesheet" type="text/css" href="src/css/jquery-ui-1.8.16.custom.css">
    <link rel="stylesheet" type="text/css" href="src/css/jquery-ui-1.8.16.custom.css">
    <link rel="stylesheet" type="text/css" href="src/css/jquery.fancybox.css">
    <link rel="stylesheet" type="text/css" href="src/css/unredd.css">

    <!--<pack:script enabled="${config.minifiedJs}">
    	<src>/js/OpenLayers.unredd.js</src>
    	<src>/js/jquery-1.7.1.js</src>
    	<src>/js/jquery.mustache.js</src>
    	<src>/js/jquery-ui-1.8.16.custom.min.js</src>
    	<src>/js/jquery.fancybox.js</src>
    	<src>/js/ol-extensions/PortalToolbar.js</src>
    	<src>/js/unredd.js</src>
    	<src>${base}/static/custom.js</src>
    </pack:script>-->
    <!--<pack:style enabled="${config.minifiedJs}">
    	<src>/css/openlayers/style.css</src>
    	<src>/css/jquery-ui-1.8.16.custom.css</src>
    	<src>/css/jquery.fancybox.css</src>
    	<src>/css/toolbar.css</src>
    	<src>${base}/static/unredd.css</src>
    </pack:style>-->
  </head>
  <body>
    <!--<div id="map-tools" style="position:relative">
      <div id="layer_list_selector_pane">
        <input type="radio" id="all_layers" name="layer_list_selector" checked="checked"></input><label for="all_layers">Layers</label>
        <input type="radio" id="active_layers" name="layer_list_selector"></input><label for="active_layers">Selected layers</label>
      </div>

      <a class="blue_button" style="z-index:1000;top:8px;margin-right:0px;position:absolute;width:60px;right:20px;margin-top:0" href="#" id="toggle_legend">Legend</a>

      <div style="z-index:1100;position:relative;top:40px;left:10px;width:250px;font-size:10px;">
        <div id="active_layers_pane" style="position:relative;left:0;display:none">
          <h3><a href="#">Selected Layers</a></h3>
          <div></div>
        </div>
        <div id="layers_pane" style="position:relative;top:0;left:0;display:none"></div>
      </div>
      <a href="#" onclick="UNREDD.map.zoomIn();return false" id="zoom_in"></a>
      <a href="#" onclick="UNREDD.map.zoomOut();return false" id="zoom_out"></a>
      <a href="#" onclick="UNREDD.map.setCenter(UNREDD.mapCenter, UNREDD.defaultZoomLevel); return false" id="zoom_to_max_extent"></a>
    </div>-->
    
    <div id="info_popup"></div>

    <!--<div id="map"></div>-->
    
    <div style="display:none">
    	<div id="custom_popup"></div>
    </div>
    
  </body>
</html>
