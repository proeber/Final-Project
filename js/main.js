  $(document).ready(function(){
  		//global variables
  		var map,
  		tiles,
      choropleth;
      var counties = [];


   //make search menu sidebar
   $('#search').sidr({name:'sidr'});   


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
        for( var i =0; i< 72; i++){
          counties[i] = choroplethData.features[i];

        }

        geojson = L.geoJson(choroplethData, {
            onEachFeature: onEachFeature,
            style: style
        }).addTo(map);

        
    }).fail(function(){alert("There was a problem loading data")});

    parser();

    function passChoropleth(choroplethData){
      choropleth = L.geoJson(choroplethData).addTo(map);
      
    }

    //highlight the county
    function highlight(e){
      var layer = e.target;
      layer.setStyle({
        weight: 5,
        color: 'yellow',
        dashArray: '',
        fillOpacity: 0.7
      });

    }

    //reset highlight
    function resetHighlight(e) {
        geojson.resetStyle(e.target);
    }


    function onEachFeature(feature, layer) {
      layer.on({
          mouseover: highlight,
          mouseout: resetHighlight,
          click: zoomToFeature
      });
    }

    function style(feature){
      return{
        fillColor: "red",
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }

    function zoomToFeature(e){

      map.fitBounds(e.target.getBounds());

    }

    function parser()
    {
      // TODO: get input name and search for file
      var file = "/data/csv/2010_floodDamage.csv";
      Papa.parse(file, {
        download: true,
        delimiter: ',',
        complete: function(results) {
            console.log(results);
        }
    })
    }

  })
