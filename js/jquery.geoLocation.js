//add toRad functionality
if (typeof(Number.prototype.toRad) === 'undefined') {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}


(function( $ ) {
  
  $.geoLocation = function(api_key, mapContainer, dataFile, dataReadyCallback, markerClickCallback) {
      
      $.geoLocation.vars.map_container = mapContainer;
      $.geoLocation.vars.data_file = dataFile;
      $.geoLocation.vars.data_ready_callback = dataReadyCallback;
      $.geoLocation.vars.marker_callback = markerClickCallback;
      
      var maps_url = 'https://maps.googleapis.com/maps/api/js?key=' + api_key + '&sensor=false&libraries=weather,panoramio&callback=$.geoLocation.createMap';
      var script = document.createElement('script');
      script.src = maps_url;
      document.head.appendChild(script);
      
  };
  
  $.geoLocation.vars = {
    lat: 0,
    lng: 0,
    map_container: null,
    map: null,
    data_ready_callback: null,
    data_file: null,
    location_data: null,
    location_markers: null,
    user_marker: null,
    marker_callback: null,
    icon: null,
    direction_renderer: null,
    weather_layer: null,
    cloud_layer: null,
    traffic_layer: null,
    panaramio_layer: null,
    ready: false,
  };
  
  //supported function
  $.geoLocation.supported = function() {
    
    if(navigator.geolocation){
      return true;
    } else {
      return false;
    }
    
  };
  //end of supported function
  
  //get createMap function
  $.geoLocation.createMap = function() {
   navigator.geolocation.getCurrentPosition(
     function(position){
       
       $.getJSON(
         $.geoLocation.vars.data_file,
         //success function
         function(data){
           
           $.geoLocation.vars.location_data = data
          
           $.geoLocation.vars.lat = position.coords.latitude;
           $.geoLocation.vars.lgn = position.coords.longitude;

            var mapOptions = {
              zoom: 8,
              center: new google.maps.LatLng($.geoLocation.vars.lat, $.geoLocation.vars.lgn),
              mapTypeId: google.maps.MapTypeId.ROADMAP
            }

            $.geoLocation.vars.map = new google.maps.Map(document.getElementById($.geoLocation.vars.map_container), mapOptions);
            
            google.maps.event.addDomListener(window, 'resize', function() {
                $.geoLocation.vars.map.setCenter(new google.maps.LatLng($.geoLocation.vars.lat, $.geoLocation.vars.lgn));
            });
            
            $.geoLocation.vars.icon = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|54b0ea");
            
            $.geoLocation.vars.ready = true;
            if( $.geoLocation.vars.data_ready_callback != null)  $.geoLocation.vars.data_ready_callback();
            $.geoLocation.showUser();
            $.geoLocation.showAll();
         
         }
        );
      
     }, 
     $.geoLocation.checkError
    );
  };
  //end of createMap function
  
  //error function
  $.geoLocation.checkError = function(error) {
   
    switch(error.code){
       case error.TIMEOUT:
         alert ('Timeout');
       	break;
       case error.POSITION_UNAVAILABLE:
       	alert ('Position unavailable');
       	break;
       case error.PERMISSION_DENIED:
       	alert ('Permission denied');
       	break;
       case error.UNKNOWN_ERROR:
       	alert ('Unknown error');
       	break;
     }
   
  };
  //end of error function
  
  //show user function
  $.geoLocation.showUser = function(){
    
    $.geoLocation.vars.user_marker = new google.maps.Marker({
      animation: google.maps.Animation.BOUNCE,
      position: new google.maps.LatLng($.geoLocation.vars.lat, $.geoLocation.vars.lgn),
      map: $.geoLocation.vars.map,
      title: "Your Location",
    });
    
  }
  //end of show user function
  
  //show all function
  $.geoLocation.showAll = function(){
    
    if($.geoLocation.vars.location_markers != undefined || $.geoLocation.vars.location_markers != null){
      $.geoLocation.clearLocations();
    } else {
      $.geoLocation.vars.location_markers = [];
    }
    
    $.each($.geoLocation.vars.location_data.info, function(key, val){
      
      $.geoLocation.createMarker(val);
      
    });
    
  }
  //end of show all function
  
  //show with in distance function
  $.geoLocation.showWithInDistance = function(dist){
    
    if($.geoLocation.vars.location_markers != undefined || $.geoLocation.vars.location_markers != null){
      $.geoLocation.clearLocations();
    }

    $.each($.geoLocation.vars.location_data.info, function(key, val){
     
     if($.geoLocation.calcDistance(val.latitude, val.longitude, $.geoLocation.vars.lat, $.geoLocation.vars.lgn) <= dist){
        
        $.geoLocation.createMarker(val);
     
     }
     
    });
    
  }
  //end of show with in distance function
  
  //create marker function
  $.geoLocation.createMarker = function(val){
    
    var newMarker = new google.maps.Marker({
       animation: google.maps.Animation.DROP,
       position: new google.maps.LatLng(val.latitude, val.longitude),
       icon: $.geoLocation.vars.icon,
       map: $.geoLocation.vars.map,
       title: val.name,
     });
   $.geoLocation.addMarkerListener(newMarker);   
   $.geoLocation.vars.location_markers.push(newMarker);
    
  }
  //end of create marker function
  
  //add marker click listener
  $.geoLocation.addMarkerListener = function(marker){
    google.maps.event.addListener(marker, 'click', function() {
        $.geoLocation.vars.map.setCenter(marker.getPosition());
        if($.geoLocation.vars.marker_callback != null || $.geoLocation.vars.marker_callback != undefined) $.geoLocation.vars.marker_callback(marker.title);
    });
  }
  //end of add marker click listener
  
  //get closest location
  $.geoLocation.getClosestLocation = function(){
    
    var rawData = $.geoLocation.vars.location_data.info;
    rawData.sort(function(a, b){
      return parseFloat($.geoLocation.calcDistance(a.latitude, a.longitude, $.geoLocation.vars.lat, $.geoLocation.vars.lgn)) - parseFloat($.geoLocation.calcDistance(b.latitude, b.longitude, $.geoLocation.vars.lat, $.geoLocation.vars.lgn));
    });
    return rawData[0];
  }
  //end of get closest location
  $.geoLocation.getLocationDataByName = function(name){
    
    var returnValue;
    
    $.each($.geoLocation.vars.location_data.info, function(key, val){
     
     if(val.name == name){
      returnValue = val;
     }
     
    });
    
    return returnValue;
    
  }
  //get location by name
  
  //end of get location by name
  
  //clear locations function
  $.geoLocation.clearLocations = function(){
    for(var i = 0; i < $.geoLocation.vars.location_markers.length; i++){
      $.geoLocation.vars.location_markers[i].setMap(null);
    }

    $.geoLocation.vars.location_markers = [];
  }
  //end of clear locations function
  $.geoLocation.getDirections = function(endLat, endLng, display){
    
    var dirService = new google.maps.DirectionsService();
    
    var dirRequest = {
      origin: new google.maps.LatLng($.geoLocation.vars.lat, $.geoLocation.vars.lgn),
      destination: new google.maps.LatLng(endLat, endLng),
      travelMode: google.maps.TravelMode.DRIVING,
    };
    
    display.innerHTML = '';
    
    dirService.route(dirRequest, function(response, status){
      if(status == google.maps.DirectionsStatus.OK){
        
        if($.geoLocation.vars.direction_renderer != null || $.geoLocation.vars.direction_renderer != undefined) $.geoLocation.vars.direction_renderer.setMap(null);
        
        var dirRendererOptions = {
          panel: display,
          directions: response,
          map: $.geoLocation.vars.map,
          suppressMarkers: true,
        };

        $.geoLocation.vars.direction_renderer = new google.maps.DirectionsRenderer(dirRendererOptions);
        
      }
    });
    
  }
  //get directions function
  
  //add weather layer
  //temp units should pass in "c" or "f"
  //wind speed units shoud pass in "km" or "m"
  $.geoLocation.addWeatherLayer = function(tempsUnits, windSpeedUnits){
    
    var tUnit, wUnit;
    if(tempsUnits = "c"){
      tUnit = google.maps.weather.TemperatureUnit.CELSIUS;
    } else {
      tUnit = google.maps.weather.TemperatureUnit.FAHRENHEIT
    }
    
    if(windSpeedUnits == "km"){
      wUnit = google.maps.weather.WindSpeedUnit.KILOMETERS_PER_HOUR;
    } else {
     wUnit = google.maps.weather.WindSpeedUnit.MILES_PER_HOUR; 
    }
    
    var weatherOptions = {
      clickable: false,
      temperatureUnits: tUnit,
      windSpeedUnits: wUnit,
      map: $.geoLocation.vars.map,
    };
    
    $.geoLocation.vars.weather_layer = new google.maps.weather.WeatherLayer(weatherOptions);
    $.geoLocation.vars.cloud_layer = new google.maps.weather.CloudLayer();
    $.geoLocation.vars.cloud_layer.setMap($.geoLocation.vars.map);
  }
  //end of add weather layer
  
  //remove weather layer
  $.geoLocation.removeWeatherLayer = function(){
    
     if($.geoLocation.vars.weather_layer != null || $.geoLocation.vars.weather_layer != undefined) $.geoLocation.vars.weather_layer.setMap(null);
     if($.geoLocation.vars.cloud_layer != null || $.geoLocation.vars.cloud_layer != undefined) $.geoLocation.vars.cloud_layer.setMap(null);
  }
  //end of remove weather layer
  
  //add traffic layer function
   $.geoLocation.addTrafficLayer = function(){
     
     $.geoLocation.vars.traffic_layer = new google.maps.TrafficLayer();
     $.geoLocation.vars.traffic_layer.setMap($.geoLocation.vars.map);
   
   }
  //end of traffic layer function
  
  //remove traffic layer function
  $.geoLocation.removeTrafficLayer = function(){
     
    if($.geoLocation.vars.traffic_layer != null || $.geoLocation.vars.traffic_layer != undefined)  $.geoLocation.vars.traffic_layer.setMap(null);
   
   }
  //end of remove traffic layer function
  
  //add panoramio layer function
  //image tag is a string of the tag to look for or null
  $.geoLocation.addPanoramioLayer = function(imgTag){
    
    var panoOpts = {
      map: $.geoLocation.vars.map,
      tag: imgTag,
    }
    
    $.geoLocation.vars.panaramio_layer = new google.maps.panoramio.PanoramioLayer(panoOpts);
    
   }
  //end of add panoramio layer function
  
  //remove panoramio layer function
   $.geoLocation.removePanoramioLayer = function(){
     $.geoLocation.vars.panaramio_layer.setMap(null);
  }
  //end of remove panoramio layer function
  
  //end of get directions function
  
  //calc distance
  $.geoLocation.calcDistance = function(lat1, lon1, lat2, lon2){
    var R = 6371; // km
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad(); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };
  //end of calc distance
  
})( jQuery );