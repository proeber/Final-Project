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

    $( function() {
      // Getting the input from the user using jQuery
      $('input#search_button').click( function() {
        //Storing the input values
        var county = $('#county').val();
        var type = $('#type').val();

        // This goes to the function at line 111 to parse the csv data using the user input
        parser(type);
        // Insert code that has to do with data here
        console.log(county);
      });
    });

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

    function parser(type)
    {
      var file = type + ".csv"
      var path = "/data/csv/" + file;
      
      Papa.parse(path, {
        download: true,
        delimiter: ',',
        complete: function(results) {
            console.log(results);
        }
    })
    }

  })
