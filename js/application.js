var weatherOn = false, trafficOn = false, imagesOn = false;

$(function() {
 
 //check for geolocation support
 if(jQuery.geoLocation.supported()){
   
  //init
  jQuery.geoLocation('AIzaSyCcUEtHe3SWtOFNXNAqJetuIktE0ApnFbY', 'map_canvas', './lcbo.json', dataReadyCallback, markerClickCallback);
  
 } else {
   alert('Your browser does not supprot geolocation');
 }
 
});

function dataReadyCallback(){
  
  //distance selection
  $('.distance-select').change(function(){
     if(this.value == 'show all'){
       jQuery.geoLocation.showAll();
     } else {
       jQuery.geoLocation.showWithInDistance(this.value);
     }
  });
  
  //closest location
  var data = jQuery.geoLocation.getClosestLocation();
  
  $('.store-name').html(data.name);
  $('.store-address').html(data.address);
  $('.store-city').html(', ' + data.city);
  $('.store-phone').html(data.phone);
  $('.get-closest-directions').data('lat', data.latitude);
  $('.get-closest-directions').data('lng', data.longitude);
  
  $('.get-closest-directions').click(function(){
    
    jQuery.geoLocation.getDirections($('.get-closest-directions').data('lat'), $('.get-closest-directions').data('lng'), document.getElementById('directions-body'));
    $('#directions-modal').modal('show');
    
  });
  
  //weather button
  $('.get-weather').click(function(){
    
    if(weatherOn){
      jQuery.geoLocation.removeWeatherLayer();
    } else {
      jQuery.geoLocation.addWeatherLayer("c", "km");
    }
    
    weatherOn = !weatherOn;
    
  });
  
  //traffic button
  $('.get-traffic').click(function(){
    
    if(trafficOn){
      jQuery.geoLocation.removeTrafficLayer();
    } else {
      jQuery.geoLocation.addTrafficLayer();
    }
    
    trafficOn = !trafficOn;
    
  });
  
  //traffic button
  $('.toggle-images').click(function(){
    
    if(imagesOn){
      jQuery.geoLocation.removePanoramioLayer();
    } else {
      jQuery.geoLocation.addPanoramioLayer(null);
    }
    
    imagesOn = !imagesOn;
    
  });
  
  //selected directions
  $('.selected-directions').click(function(){
    
    jQuery.geoLocation.getDirections($('.selected-directions').data('lat'), $('.selected-directions').data('lng'), document.getElementById('directions-body'));
    $('#directions-modal').modal('show');
    
  });
  
}

function markerClickCallback(markerTitle){
  
  var data = jQuery.geoLocation.getLocationDataByName(markerTitle);
  
  $('.selected-store-name').html(data.name);
  $('.selected-store-address').html(data.address);
  $('.selected-store-city').html(', ' + data.city);
  $('.selected-store-phone').html(data.phone);
  $('.selected-directions').data('lat', data.latitude);
  $('.selected-directions').data('lng', data.longitude);
  $('.selected-directions').show();
  $('.selected-msg').hide();
  
}
