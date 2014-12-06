  $(document).ready(function(){
  		//global variables
  		var map,
  		cities,
  		tiles;

      var button = document.querySelector("button");
      console.log(button);

  	//new leaflet map
  	map= L.map('map',{
  		center: [43, -96],
  		zoom: 4,
  		minZoom: 4 
  	});
  	//new leaflet tilelayer for background slippy tiles
  	tiles= L.tileLayer('http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png',
  	{
  		attribution: 'Acetate tileset from GeoIQ Data from Wikipedia'
  	}).addTo(map);


    //create button that clicks
    button.addEventListener("click",function(){
      console.log("click");
      if(document.getElementById('runs').checked){

        //use jQuery to load the data
        $.getJSON("data/playoffRun.geojson").done(function(data){
            console.log(data);
              var info = processData(data);
              console.log(info);
             createPropSymbols(info.timestamps, data);
             createLegend(info.min, info.max);
             createSliderUI(info.timestamps);


          //new leaflet geoJSON layer creates point features out of data objects
          L.geoJson(data, {
            //attach a popup with the feature name to each point feature
            onEachFeature: function(feature, layer){
              layer.bindPopup(feature.properties.name)
            },

            //change default png markers to dynamic circle markers
            pointToLayer: function(feature,latlng){
              
              //new leaflet circleMarker layer for each marker
              return L.circleMarker(latlng,{

                //calculate each radius sperately using an attribute
                //radius: calcPropRadius(feature.properties["1930-31"]),
                //fillColor: '#f00',
                //color: '#f00'
              })
            }
          })//.addTo(map);
        });

      }
      else{
            //use jQuery to load the data
        $.getJSON("data/StanleyCupWinner.geojson").done(function(data){
            console.log(data);
              var info = processData(data);
              console.log(info);
             createPropSymbols(info.timestamps, data);
             createLegend(info.min, info.max);
             createSliderUI(info.timestamps);


          //new leaflet geoJSON layer creates point features out of data objects
          L.geoJson(data, {
            //attach a popup with the feature name to each point feature
            onEachFeature: function(feature, layer){
              layer.bindPopup(feature.properties.name)
            },

            //change default png markers to dynamic circle markers
            pointToLayer: function(feature,latlng){
              
              //new leaflet circleMarker layer for each marker
              return L.circleMarker(latlng,{

                //calculate each radius sperately using an attribute
                //radius: calcPropRadius(feature.properties["1930-31"]),
                //fillColor: '#f00',
                //color: '#f00'
              })
            }
          })//.addTo(map);
        });
          }
    });

  	

  function processData(data){

      var timestamps = [],
          min = Infinity, //start at highest possible number and loop through data,reduce to lowest number in data
          max = -Infinity;

      for(var feature in data.features){
          var attributes = data.features[feature].properties;
          for(var attribute in attributes){
              if(attribute != "Latitude" && 
                  attribute!= "Longitude"&& attribute!="Post_season_streak" && attribute!= "Team"){
                  if(attributes[attribute]< min){
                      min = attributes[attribute];
                  }
                  if(attributes[attribute]> max){
                      max = attributes[attribute];
                  }
                  if($.inArray(attribute,timestamps)===-1){
                      timestamps.push(attribute);
                  }
                  if(attributes[attribute]===""){
                    attributes[attribute]=0;
                  }
              }
          }
      }
      return{ timestamps : timestamps,
        min : min ,
        max : max
      }


  };
  
    function createPropSymbols(timestamps, data) { 

    cities = L.geoJson(data, { 
   
      pointToLayer: function(feature, latlng) { 
   
      return L.circleMarker(latlng, { 
        fillColor: "red", 
        color: 'red', 
        weight: 1, 
        fillOpacity: 0.6 
      }).on({ 
   
        mouseover: function(e) { 
          this.openPopup(); 
          this.setStyle({color: 'blue'}); 
        }, 
        mouseout: function(e) { 
          this.closePopup(); 
          this.setStyle({color: '#537898'}); 
   
        } 
      }); 
    } 
   });
    updatePropSymbols(timestamps[0]);
  }

  function updatePropSymbols(timestamp){

    cities.eachLayer(function(layer){
      var props = layer.feature.properties;
      console.log(props);

      var radius = calcPropRadius(props[timestamp]);
      console.log(radius);


      var popupContent ="<b> "+ props.Team+ "</b></br> # of years on streak: "+ props[timestamp] + 
      "</br>  Year: "  + timestamp;
      console.log(popupContent);
      if(radius=== ""){
        layer.setRadius(0);   
      }
       else{
        layer.setRadius(radius);
      }
     

      layer.bindPopup(popupContent, { offset : new L.point (0, -radius)});
    
    }).addTo(map);
  }

 function createLegend(min, max) { 
 
   if (min < 10) { 
    min = 10; 
  } 
 
    function roundNumber(inNumber) { 
 
      return (Math.round(inNumber/10) * 10); 
    } 
 
    var legend = L.control( { position: 'bottomright' } ); 
 
    legend.onAdd = function(map) { 
 
    var legendContainer = L.DomUtil.create("div", "legend"); 
    var symbolsContainer = L.DomUtil.create("div", "symbolsContainer"); 
    var classes = [roundNumber(min), roundNumber((max-min)/2), 
    roundNumber(max)]; 
    var legendCircle; 
    var lastRadius = 0; 
    var currentRadius; 
    var margin; 
 
    L.DomEvent.addListener(legendContainer, 'mousedown', function(e) { 
      L.DomEvent.stopPropagation(e); 
    }); 
 
    $(legendContainer).append("<h2 id='legendTitle'># of Playoffs in a Row</h2>"); 
 
    for (var i = 0; i <= classes.length-1; i++) { 
 
    legendCircle = L.DomUtil.create("div", "legendCircle"); 
 
    currentRadius = calcPropRadius(classes[i]); 
 
    margin = -currentRadius - lastRadius - 2; 
 
      $(legendCircle).attr("style", "width: " + currentRadius*2 + 
        "px; height: " + currentRadius*2 + 
        "px; margin-left: " + margin + "px" ); 
 
      $(legendCircle).append("<span class='legendValue'>" + 
        classes[i] + "<span>"); 
 
      $(symbolsContainer).append(legendCircle); 
 
        lastRadius = currentRadius; 
 
    }  
 
    $(legendContainer).append(symbolsContainer); 
 
      return legendContainer; 
 
  }; 
 
    legend.addTo(map); 
   
 } // end createLegend() 

 //creates the slider UI
 function createSliderUI(timestamps){
  var sliderControl =L.control({position : 'bottomleft'});

  sliderControl.onAdd = function(map){
      var slider =L.DomUtil.create("input", "range-slider");

      L.DomEvent.addListener(slider, 'mousedown', function(e){
        L.DomEvent.stopPropagation(e);
      });
      console.log(timestamps.length);
      $(slider)
        .attr({'type': 'range',
                'max':82,
                'min': 0,
                'step': 1,
                'value': 0
              }).on('input', function(){
                  updatePropSymbols(timestamps[$(this).val()]);
                  $(".temporal-legend").text(timestamps[this.value])
              });
      return slider;
  }
  sliderControl.addTo(map);
  createTemporalLegend(timestamps[0]);
 }

function createTemporalLegend(startTimeStamp){
  var temporalLegend =L.control({postion: 'bottomleft'});

  temporalLegend.onAdd = function(map) {
    var output = L.DomUtil.create("output","temporal-legend")
    console.log(output);
    return output;
  }

  temporalLegend.addTo(map);
}
  //function to calculate the radius of each proportional symbol
  function calcPropRadius(attributeValue){
  	var scaleFactor =10;
  	var area =attributeValue * scaleFactor;
  	var radius = Math.sqrt(area/Math.PI)*2;
  	return radius;
  }


  })
