<template>
  <div>Ecchice!</div>
</template>

<script>
  import bus from '../bus';

  bus.$on('map-mounted', map => {
    console.log(map.getLayers());
    let wmsSource = map.getLayers().getArray()[0].getSource();

    map.on('singleclick', function(evt) {
      const url = wmsSource.getGetFeatureInfoUrl(
        evt.coordinate,
        map.getView().getResolution(),
        'EPSG:3857',
        { 'INFO_FORMAT': 'application/vnd.ogc.gml' });
      if (url) {
        console.log(url);
      }
    });
  });
</script>

<style scoped>
</style>

<!--
http://demo.opengeo.org/geoserver/wms
?BBOX=44.3115939344240175,-103.93616932504362182,44.55018319949628136,-103.57561215835877988
&CRS=EPSG:4326
&QUERY_LAYERS=topp:states,og:streams
&SERVICE=WMS
&HEIGHT=714
&REQUEST=GetFeatureInfo
&STYLES=
&I=775
&J=246
&WIDTH=1079
&FEATURE_COUNT=10
&VERSION=1.3.0
&FORMAT=image/png
&LAYERS=topp:states,og:streams
&info_format=text/html
-->