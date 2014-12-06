  $(document).ready(function(){
  		//global variables
  		var map,
  		cities,
  		tiles,
      choropleth;


  	//new leaflet map
  	map= L.map('map',{
      center: [44.7, -90],
  		zoom: 7,
  		minZoom: 7,

  	});
    map.setMaxBounds([[49,-85],[42,-94]]);
  	//new leaflet tilelayer for background slippy tiles
  	tiles= L.tileLayer('http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png',
  	{
  		attribution: 'Acetate tileset from GeoIQ Data from Wikipedia'
  	}).addTo(map);

    //retrieve choropleth data
    $.getJSON("data/WI_Counties_geojson.geojson").done(function(choroplethData){
        console.log(choroplethData);
        passChoropleth(choroplethData);
    }).fail(function(){alert("There was a problem loading data")});

    function passChoropleth(choroplethData){
      choropleth = L.geoJson(choroplethData).addTo(map);
    }

    //highlight the county
    function highlight(e){

      var layer = e.target;

      layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });

    }

    //reset highlight
    function resetHighlight(e){
      geojson.resetStyle(e.target);
    }


  })
