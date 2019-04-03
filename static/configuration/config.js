window.globalConf = {
  languages: [{ id: 'en', 'label': 'English' }],
  map: {
    bingMapsKey: 'ArXO9BbbCsJXDlX8dLLxcI5BhFPTPrKBdg9o-BNWvC8kJFTetsc96izVu0415SDy',
    mapCenterLonLat: [32, 1],
    mapZoom: 7,
    defaultGeoServerURLs: [
      '/geoserver/wms'
    ]
  },
  layersConfigApi: {
    baseUrl: '/api/',
    loginUrl: 'sessions/create',
    getLayersConfigUrl: 'layers.json',
    saveLayersConfigUrl: 'protected/layers_conf/save/',
    getLayersConfigHisoryUrl: 'protected/layers_conf/versions',
    restoreVersionUrl: 'protected/layers_conf/restore_version'
  },
  feedbackApi: {
    feedbackUrl: 'http://localhost:3001/feedback',
    feedbackCategories: [
      'Thematic mapping and Monitoring',
      'Forest Offences',
      'Information Dissemination (RTI)'
    ]
  },
  logos: {
    ll: [
      {
        imgUrl: '/static/images/help-90.png',
        link: 'static/help.html',
        size: { height: 90 }
      }
    ]
  }
}
