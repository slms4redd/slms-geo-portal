window.globalConf = {
  _welcomePage: 'static/configuration/loc/en/html/howto.html',
  languages: [
    { id: 'en', 'label': 'English' },
    { id: 'fr', 'label': 'Français' }
  ],
  map: {
    bingMapsKey: 'ArXO9BbbCsJXDlX8dLLxcI5BhFPTPrKBdg9o-BNWvC8kJFTetsc96izVu0415SDy',
    mapCenterLonLat: [21.7587, -4.0383],
    mapZoom: 5,
    defaultGeoServerURLs: [
      'http://rdc-snsf.org/diss_geoserver/wms',
      'http://178.33.8.115/diss_geoserver/wms'
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
    askForEmail: false,
    feedbackUrl: 'http://localhost:3001/feedback',
    feedbackCategories: [
      'Thematic mapping and Monitoring',
      'Forest Offences',
      'Information Dissemination (RTI)'
    ]
  },
  printApi: {
    url: 'http://localhost:8080/geoserver/pdf/print.pdf'
  },
  logos: {
    ul: 'flag.gif',
    ll: [
      {
        imgUrl: '/static/configuration/logos/unredd.png',
        link: 'http://www.unredd.net/',
        size: { height: 35 }
      },
      {
        imgUrl: '/static/configuration/logos/inpe.png',
        link: 'http://www.inpe.br/ingles/',
        size: { height: 35 }
      },
      {
        text: 'Text link',
        link: 'http://uxmyths.com/post/715009009/myth-icons-enhance-usability',
        size: { height: 35 }
      }
    ]
  }
}
