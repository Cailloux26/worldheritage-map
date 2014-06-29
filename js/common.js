
window.onload = getMyLocation
function getMyLocation() { 
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(displayMap,displayError); 
	}else{ 
		alert("Sorry, there is no geolocation support"); 
	}

}
function displayError(error) { 
	var errorTypes = { 
		0: "Unknown error", 
		1: "Permission denied by user", 
		2: "Position is not available", 
		3: "Request timed out" 
	} 
	var errorMessage = errorTypes[error.code]; 
	if (error.code == 0 || error.code == 2) {
		errorMessage = errorMessage +" " + error.message; 
	}
	var div = document.getElementById("detailWindow"); 
	div.innerHTML = errorMessage; 
}

var map;
var arrMarkers = [];
var arrInfoWindows = [];

function displayMap(position) {

    //creating google map
    var centerCoord = new google.maps.LatLng(position.coords.latitude, position.coords.longitude); //current position
    var mapOptions = {
        zoom: 5,
        minZoom: 3,
        maxZoom: 20,
        center: centerCoord,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    //adding searchField to the map
    var input = (document.getElementById('searchTextField'));
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
    var searchBox = new google.maps.places.SearchBox((input));


    //get Elements of information window for worldsheritages.
    var infowindow;
    var contentHTML;
    var cards = document.getElementById("cards-card");
    var detailWindow = document.getElementById("detailWindow");

    //creating Markers for map
    var currentMarker;
    var NaturalColor = "78E853";
    var NaturalpinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + NaturalColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
    var CulturalColor = "FF0066";
    var CulturalpinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + CulturalColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
    var MixedColor = "000066";
    var MixedpinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + MixedColor,
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
    var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
        new google.maps.Size(40, 37),
        new google.maps.Point(0, 0),
        new google.maps.Point(12, 35));

    //adding Pin descriptions to information window.
    var pinDescriptionHTML = '<p id="iconline"><img id="iconimage" src="http://chart.apis.google.com/chart?chst=d_map_pin_letter&amp;chld=%E2%80%A2|78E853" draggable="false"> Natural Heritage</p><p id="iconline" ><img  id="iconimage" src="http://chart.apis.google.com/chart?chst=d_map_pin_letter&amp;chld=%E2%80%A2|FF0066" draggable="false"> Cultural Heritage</p><p id="iconline"><img  id="iconimage" src="http://chart.apis.google.com/chart?chst=d_map_pin_letter&amp;chld=%E2%80%A2|000066" draggable="false"> Mixed Heritage</p>';
    detailWindow.innerHTML = pinDescriptionHTML;

    //for markers
    var markers = [];
    //adding event listener for searchBox
    google.maps.event.addListener(searchBox, 'places_changed', function() {

        //get the place name which users type.
        var places = searchBox.getPlaces();
        //reset markers
        for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
        }
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            var image = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            markers.push(marker);
            bounds.extend(place.geometry.location);
        }
        map.fitBounds(bounds);
    });

    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });


    var pinImage;
    var jqxhr = $.getJSON("worldheritage.json", {}, function (data) {
        console.log("1");
        $.each(data.row, function (key, val) {
        	switch(val.category) {
        		case 'Natural':
        			pinImage = NaturalpinImage;
        			break;
        		case 'Cultural':
        			pinImage = CulturalpinImage;
        			break;
        		case 'Mixed':
        			pinImage = MixedpinImage;
        			break;
        		default:
        			pinImage = NaturalpinImage;
        	}

            //setting a marker
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(val.latitude, val.longitude),
                map: map,
                title: val.site,
                draggable:true,
                animation: google.maps.Animation.DROP,
                image_url : val.image_url,
                site : val.site,
                category : val.category,
                location : val.location,
                states: val.states,
                region: val.region,
                icon: pinImage,
                shadow: pinShadow,
                short_description:val.short_description,
                long_description:val.long_description
            });


            arrMarkers[key] = marker;

            //setting click event listner each marker 
            google.maps.event.addListener(marker, 'click', function (event) {
            	 if(infowindow) {
      				infowindow.close();
    			}
				contentHTML = "<img border='0' align='left' src='"+ val.image_url+"'><h3>" + val.site + "</h3>";
				if(val.long_description == ""){
					val.long_description = val.short_description;
				}
				
				contentDetailHTML = "<img src='"+ val.image_url+"'><h3>" + val.site + "</h3><img src='./flags/"+val.states.replace(/ /g, "_")+".png'><span id='countryname'>" + val.states + "</span><p id='location'>" + val.location + "</p><span id='region'>(" + val.region + ")</span><p>" + val.long_description + "</p>";
    			infowindow = new google.maps.InfoWindow({
                content: contentHTML,
                maxWidth: 300
            	});
            	arrInfoWindows[key] = infowindow;
            	detailWindow.innerHTML = contentDetailHTML;
                infowindow.open(map, marker);
                currentMarker = marker;
                displayGoogleImages(currentMarker.site);
            });
        });

        console.log("2");
        arrMarkers = sortMarker();
        detailWindow.addEventListener("click", function(){
        	currentMarker = getNextMarker();
        	contentHTML = "<img border='0' align='left' src='"+ currentMarker.image_url+"'><h3>" + currentMarker.site + "</h3>";
        	contentDetailHTML = "<img src='"+ currentMarker.image_url+"'><h3>" + currentMarker.site + "</h3><img src='./flags/"+currentMarker.states.replace(/ /g, "_")+".png'><span id='countryname'>" + currentMarker.states + "</span><p id='location'>" + currentMarker.location + "</p><span id='region'>(" + currentMarker.region + ")</span><p>" + currentMarker.long_description + "</p>";
	    	if(infowindow) {
      			infowindow.close();
    		}
			infowindow = new google.maps.InfoWindow({
            content: contentHTML,
            maxWidth: 300,
            maxHeight: 200
        	});
        	detailWindow.innerHTML = contentDetailHTML;
            infowindow.open(map, currentMarker);
            displayGoogleImages(currentMarker.site);
		});
    });

    jqxhr.complete(function() {
      console.log( "complete" );
      find_closest_marker(position);
      console.log("3-2");
    });

    function rad(x) {return x*Math.PI/180;}
    function find_closest_marker( position ) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var R = 6371; // radius of earth in km
        var distances = [];
        var closest = -1;
        for( i=0;i<arrMarkers.length; i++ ) {
            var mlat = arrMarkers[i].position.lat();
            var mlng = arrMarkers[i].position.lng();
            var dLat  = rad(mlat - lat);
            var dLong = rad(mlng - lng);
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong/2) * Math.sin(dLong/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            if(d != 0){
                distances[i] = d;
                if ( closest == -1 || d < distances[closest] ) {
                    closest = i;
                }
            }

        }
        var div = document.getElementById("instagram");
        div.innerHTML = "<h4>You are at Latitude: "+lat+ ", Longitude: "+lng+"</h4>"; 
        var km = computeDistance(position.coords, arrMarkers[closest].position);
        div.innerHTML += "<p>The closest WorldHeritage is <em>" + arrMarkers[closest].title + "</em>. You are " +km+ " km from " + arrMarkers[closest].title + "</p>";
        console.log("3-1");
    }
    // Calculating Distance: 
    function computeDistance(startCoords, destCoords) { 
        var startLatRads = degreesToRadians(startCoords.latitude); 
        var startLongRads = degreesToRadians(startCoords.longitude); 
        var destLatRads = degreesToRadians(destCoords.lat()); 
        var destLongRads = degreesToRadians(destCoords.lng());

        var Radius = 6371; // radius of the earth in km
        var distance = Math.acos(Math.sin(startLatRads) * Math.sin(destLatRads) + Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)) * Radius;

        return distance; 
    }
    function degreesToRadians(degrees) { 
        var radians = (degrees * Math.PI)/180; 
        return radians; 
    }
	function getNextMarker() {
		var lat = currentMarker.position.lat();
    	var lng = currentMarker.position.lng();
    	for( i=0;i<arrMarkers.length; i++ ) {	
    		var mlat = arrMarkers[i].position.lat();
        	var mlng = arrMarkers[i].position.lng();
        	if(lat == mlat && lng == mlng){
        		console.log("find");
        		if(i+1 == arrMarkers.length){
        			return arrMarkers[0];
        		}else{
        			return arrMarkers[i+1];
        		}
        		break;
        	}
    	}
	}
    function sortMarker(){
        var res = arrMarkers.sort(
                        function(a,b){
                            return (a.position.A - b.position.A);
                        }
                    );
        return res;
    }
 }

    google.load('search', '1');
    var imageSearch;

    function searchComplete(searcher) {
        var current = searcher.cursor;// cursor object
        var currentPage = current.currentPageIndex; //get the Index of current page
        if( currentPage < current.pages.length - 1 )
        {
        	var nextPage = currentPage + 1;
        	// Check that we got results
        	if (searcher.results && searcher.results.length > 0) {
        		// Loop through our results, printing them to the page.
        		var results = searcher.results;
                
        		for(var i = 0; i < results.length; i++) {
        			var result = results[i];
        				
        				var imgContainer = document.createElement('figure');
        				imgContainer.className = 'grid';
        			(function(arg) {
        				imgContainer.addEventListener('click', function() {
        				console.log(arg);
        			}, false);
        			})(i);

        			var title = document.createElement('h2');
        			// We use titleNoFormatting so that no HTML tags are left in the title
        			title.innerHTML = result.titleNoFormatting;

        			var newImg = document.createElement('img');
        			// There is also a result.url property which has the escaped version
        			newImg.src = result.tbUrl;

        			var aelement = document.createElement('a');
        			aelement.className = 'grouped_elements';
        			aelement.rel = 'googleimages';
        			aelement.href = result.url;
        			imgContainer.appendChild(aelement);
        			aelement.appendChild(newImg);
        			$("a.grouped_elements").fancybox();
                    var contentDiv = document.getElementById('googleImages');
                    if(currentPage == 1){
                        contentDiv.innerHTML = "";
                    }

                    contentDiv.appendChild(imgContainer);
        		}
        	}
        	searcher.gotoPage(nextPage);
        }
    }

  function displayGoogleImages(query) {
    //making an instance
    imageSearch = new google.search.ImageSearch();
    imageSearch.setLayout(google.search.ImageSearch.LAYOUT_CLASSIC);
    imageSearch.setResultSetSize(google.search.Search.LARGE_RESULTSET);

    // Restrict to extra large images only
    imageSearch.setRestriction(google.search.ImageSearch.RESTRICT_IMAGESIZE,
                               google.search.ImageSearch.IMAGESIZE_LARGE);

    imageSearch.setSearchCompleteCallback(this, searchComplete, [imageSearch]);

    // find images
    imageSearch.execute(query);
    }