//main code for the map

//centering around the map with specified coordinates
var map  = L.map('map');

/*var map  = L.map('map', {
  center: [26.1611, 91.7732],
  minZoom: 5,
  zoom: 15

});*/

//loading a tile layer from OSM
/*L.tileLayer( 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c'],
  id: 'mapbox.streets'
}).addTo(map);*/
L.tileLayer( 'http://{s}.tile.osm.org/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c'],
  id: 'mapbox.streets'
}).addTo(map);


//track live location
//body onload locate in a function    
function locate() {
  map.locate({setView: true, maxZoom: 18});
}

// call locate every 60 seconds... forever
//setInterval(locate, 60000);

//placeholders for the L.marker and L.circle representing user's current position and accuracy    
    var current_position, current_accuracy, ar1;

    function onLocationFound(e) {
      // if position defined, then remove the existing position marker and accuracy circle from the map

      if (current_position) {
          map.removeLayer(current_position);
          map.removeLayer(current_accuracy);
      }

      var radius = e.accuracy / 2;

      current_position = L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

     
      //to draw a circle around the current coordinate
      current_accuracy = L.circle(e.latlng, radius).addTo(map);
      
      //capturing latlng
      ar1 = e.latlng;
	    //console.log(ar1.lat, ar1.lng);

      //to store the data of hospitals within 5 km
      var myobj = [{}];
      
      
      for(var i = 0; i < records.length; ++i) {


          //read out lat & lng  from a string-"lat,lng"
          //records[i].location_coordinates is a string
          //querying out position of ,
          var commaPos = (records[i].location_coordinates).indexOf(',');

          //read first part - latitude
          var coordinatesLat = parseFloat(records[i].location_coordinates.substring(0, commaPos));

          //read second part - longitude
          var coordinatesLong = parseFloat(records[i].location_coordinates.substring(commaPos + 1, (records[i].location_coordinates).length));

          //set the lat & lng from data array into variable
          var datalatlng = L.latLng(coordinatesLat, coordinatesLong);

          //check whether lat-lng is within area of query
          //using haversine's formula
          //https://github.com/chrisveness/geodesy
          const p1 = new LatLon(Dms.parseDMS(ar1.lat), Dms.parseDMS(ar1.lng));
          const p2 = new LatLon(Dms.parseDMS(coordinatesLat), Dms.parseDMS(coordinatesLong));
          const dist = parseFloat(p1.distanceTo(p2).toPrecision(9));

          //distance_from_current = datalatlng.distanceTo(ar1);
          //var result1 = pointsInArea(datalatlng, ar1)


          if (dist <= 5000) {

              L.marker([coordinatesLat, coordinatesLong])
                .bindPopup(records[i].hospital_name)
                .addTo(map);

              records[i].distance = dist;
              myobj.push(records[i]);
              
          } //close for dist conditional


      } //close for for-loop

      
      /*track down nearest three hospitals*/
      for (var i = 0; i < 3; ++i) {
      
        const closest = myobj.reduce(
        (acc, loc) =>
          acc.distance < loc.distance
            ? acc
            : loc
        )
        console.log(closest);

        //read out lat & lng  from a string-"lat,lng"
        //records[i].location_coordinates is a string
        //querying out position of,
        var commaPos = (closest.location_coordinates).indexOf(',');

        //read first part - latitude
        var coordinatesLat = parseFloat(closest.location_coordinates.substring(0, commaPos));

        //read second part - longitude
        var coordinatesLong = parseFloat(closest.location_coordinates.substring(commaPos + 1, (closest.location_coordinates).length));


        L.Routing.control({
            waypoints: [
              L.latLng(ar1.lat, ar1.lng),
              L.latLng(coordinatesLat, coordinatesLong)
            ],
            draggableWaypoints: false
        }).addTo(map);

        

        $("#panel"+[i+1]).text(closest.hospital_name);
        //$("#body"+[i+1]+" #address").text(closest.address_original_first_line);
        $("#body"+[i+1]+" #location").text("Loocation: " + closest.location);
        $("#body"+[i+1]+" #distance").text("Distance: " + closest.distance + " km");
        
        delete myobj[myobj.indexOf(closest)];
        
      }

    }//close for onLocationFound


    function onLocationError(e) {
      alert(e.message);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);