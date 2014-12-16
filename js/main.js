$(document).ready(function()
{

		//global variables
		var map, tiles, choropleth;
		var counties = [];
		var screenHeight;
		var selected =[];
		var select = false;
		var layerTarget;
		var dataTable;
		var yearsTable;

		screenHeight = screen.height;

	 // $(".container").css("height:"+ screenHeight);
	// Initializing the dropdowns
	$(".chosen-select").chosen();
	//Initializing the table
	$('#dataTable').tablesorter();

	$("#reset").click(function(){
		history.go(0);
	});

	//new leaflet maps
	map = L.map('map',{
		center: [44.7, -90],
		zoom: 7,
		minZoom: 7,

	});
	map.setMaxBounds([[49,-85],[42,-94]]);




	//new leaflet tilelayer for background slippy tiles
	tiles = L.tileLayer('http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png',
	{
		attribution: 'Acetate tileset from GeoIQ Data from Wikipedia'
	}).addTo(map);

	//retrieve choropleth data
	$.getJSON("data/WI_Counties_geojson.geojson").done(function(choroplethData){

			passChoropleth(choroplethData);

			geojson = L.geoJson(choroplethData, {
					onEachFeature: onEachFeature,
					style: style
			}).addTo(map);

			var array = geojson._layers;
			for( key in array){
				
				var index = array[key].feature.properties.NAME;
				counties[index] = array[key];
			}

	}).fail(function(){alert("There was a problem loading data")});

	//Whenever the search button is pressed
	$( function() {
		// Getting the input from the user using jQuery
		$('input#search_button').click( function() {

			select = true;
			//Storing the input values
			var county;
			var type;
			$('#county_chosen').find('.chosen-single').each(function(){
			county = $(this).find('span').text();
			})
			$('#type_chosen').find('.chosen-single').each(function(){
			type = $(this).find('span').text();
			});
			
			console.log(county);
			// Formatting the data type string correctly
			var correctedType = dataFormat(type);
			// This goes to the function at line 111 to parse the csv data using the user input
			parser(correctedType);
			// Insert code that has to do with data here
		

		});
	});

	function passChoropleth(choroplethData){
		choropleth = L.geoJson(choroplethData).addTo(map);
		
	}

	//highlight the county
	function highlight(e){

		layerTarget = e.target;

		// layer.bindPopup(layer.feature.properties.NAME);
		// layer.on('mouseover',function(e){
		//   this.openPopup();
		// });
		// layer.on('mouseout',function(e){
		//   this.closePopup();
		// });

		layerTarget.setStyle({
			weight: 5,
			color: 'black',
			dashArray: '',
			fillOpacity: 1,
			fillColor: 'green'
		});

	}
//highlight the selection based on the county
//not working yet but hopefully is on the right track
function highlightSelection(county){

	var layer;
	var x = 0;
	//var current = counties[i].properties.NAME;

	for(key in counties){

		//console.log(key == county.trim(), key, county.trim());

			if(key === county.trim() )
		{
				layer = counties[key];
				console.log(layer);

				layer.setStyle({
					weight:5,
					color: 'black',
					dashArray:'',
					fillOpacity:1,
					fillColor:'yellow'
				});
		}

	}
		
}


	//reset highlight
	function resetHighlight(e) {

		if(!select){

			geojson.resetStyle(e.target);

		}
		else{
		
			if(selected.indexOf(e.target.feature.properties.NAME)>-1){
				console.log(selected);

				e.target.setStyle({
					weight:5,
					color:'black',
					dashArray:'',
					fillOpacity:1,
					fillColor:'yellow'
				});

			}
			else{
					geojson.resetStyle(e.target);
				}

		}
				
	}


	function onEachFeature(feature, layer) {
		layer.on({
				mouseover: highlight,
				mouseout: resetHighlight,
				click: updateTable
		});
	}

	function style(feature){
		return{
			fillColor: "red",
			weight: 2,
			opacity: 1,
			color: 'white',
			dashArray: '3',
			fillOpacity: 1
		};
	}

	function zoomToFeature(e){

		var layerTarget = e.target;

		map.fitBounds(e.target.getBounds());

		e.target.setStyle({
					weight:5,
					color: 'black',
					dashArray:'',
					fillOpacity:1,
					fillColor:'yellow'

		});
	}

	function parser(type)
	{
		// Getting the file type 
		var file = type + ".csv";
		var path = "/data/csv/" + file;
		
		Papa.parse(path, {
			download: true,
			delimiter: ',',
			complete: function(results) {
				console.log(results);
				updateDropdown(results.data[0], results.data);
			}
		})
	}

	function tableParser(countyName)
	{
		// 122 length
		var length = $('#type').children('option').length;

		var typeArray = [];
		var nameArray = [];

		$("#type option").each(function()
		{
			typeArray.push($(this).val());
			//console.log(typeArray);
		});

		//console.log(typeArray);

		
		for(var i = 1; i < length; i++)
		{
			nameArray[i] = typeArray[i];
			//Saving all the file names
			typeArray[i] = dataFormat(typeArray[i]);
			typeArray[i] = "/data/csv/" + typeArray[i] + ".csv";
			//console.log(typeArray[i]);
			//console.log(path);
				console.log(typeArray[i]);

			Papa.parse(typeArray[i], {
			download: true,
			delimiter: ',',
			complete: function(results)
			{
				// for(var j = 1; j < length; j++)
				// {
					//console.log(results.data[0]);
					
					tableResults(results.data[0], results.data, countyName, nameArray, typeArray);
					//console.log(nameArray);
				//}
			}
			});
		}
	}

	function tableResults(year, data, countyName, name, type)
	{
		var inCSVType, inCSVYear;
		// Looking for the current county in our csv
		// console.log(data.length);
		for(i = 1; i < data.length; i++)
		{
			if(countyName == data[i][0].trim())
			{
				// When found, look through the row
				for(k = 1; k < year.length; k++)
				{
					// Look for true throughout that csv
					if(data[i][k] == "TRUE")
					{
						console.log(type[i]);
						//console.log(countyName + " " + data[i][0].trim());
						//console.log("TRUE MF");
						inCSVType = name[k];
						// Save the year at which we have the year
						inCSVYear = year[k];
						//console.log(inCSVYear + " " + inCSVType);
					}
				}	
			}
		}
		//console.log("DONE");
	}

	// Format the data type string name
	function dataFormat(type)
	{
		// To lowercase
		var lowerType = type.toLowerCase();
		// Replacing spaces with underscores
		var typeFormat = lowerType.replace(/ /g, "_");
		return typeFormat;
	}

	// Updating the dropdown menus with the correct data from the csv files
	function updateDropdown(years, data)
	{
		var bool = false;
		var first =false;
		var index =-1;
		$('#county').empty();
		for(j = 0; j < data.length; j++)
		{
			bool = false;
			for(k = 0; k < data[j].length; k++)
			{
				if(data[j][k] == "TRUE" && bool == false)
				{
					// Setting boolean to true when found TRUE in current row
					bool = true;
					if (first == false){
						$('#county').append('<option value ="nothing">'+""+'</option>');
					}

					var option = '';
					option = '<option value="' + data[j][0] + '">' + data[j][0] + '</option>';
					$('#county').append(option);
					$('#county').trigger('chosen:updated');
					//console.log(data[j][0]);

					index +=1;
					//call the highlight option for a selection from the dropdowns
					selected[index] = data[j][0].trim();
					highlightSelection(data[j][0]);
				}
			}
		}

		var option = '';
		for (i = 0; i < years.length; i++){
			 option += '<option value="'+ years[i] + '">' + years[i] + '</option>';
			 yearsTable = years[i];
		}
		$('#year').append(option);
		$('#year').trigger('chosen:updated');
	}

	function updateTable(e)
	{
		$( ".tBody" ).empty();
		tableParser(e.target.feature.properties.NAME);
		//console.log(e.target.feature.properties.NAME);
		for(j = 0; j < dataTable.length; j++)
		{
			bool = false;
			for(k = 0; k < dataTable[j].length; k++)
			{
				if(dataTable[j][k] == "TRUE" && bool == false)
				{
					// Setting boolean to true when found TRUE in current row
					bool = true;

					//console.log(data[j][0]);

					index +=1;
					//call the highlight option for a selection from the dropdowns
					selected[index] = dataTable[j][0].trim();
					highlightSelection(dataTable[j][0]);
				}
			}
		}
		console.log(yearsTable + " " + dataTable);
		for(i = 1; i < yearsTable.length; i++)
		{
			
		}
	}
})