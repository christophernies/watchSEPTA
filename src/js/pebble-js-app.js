
function iconFromWeatherId(weatherId) {
  return 0;
}

function fetchTime(latitude, longitude) {
  var response;
  var stop_id = 5372;
  var req2 = new XMLHttpRequest();
  req2.onload = function(e) {
    if (req2.readyState == 4) {
      if(req2.status == 200) {
        response = JSON.parse(req2.responseText);
        console.log(response['48'][0]['date'])
        var next_bus;
        if (response && response.length > 0) {
          var stopResult = response[0];
          next_bus = stopResult.Route;
          console.log(next_bus);
          Pebble.sendAppMessage({
            "next_bus":next_bus});
        }

      } else {
        console.log("Error");
      }
    }
  }
  req2.open('GET', "http://www3.septa.org/hackathon/BusSchedules/?req1=" + stop_id + "&req3=i&req6=1", true);
  req2.send();
}

function fetchStop(latitude, longitude) {
  var response;
  var req = new XMLHttpRequest();
  req.open('GET', "http://www3.septa.org/hackathon/locations/get_locations.php?" +
    "lat=" + latitude + "&lon=" + longitude + "&radius=.5", true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if(req.status == 200) {
        response = JSON.parse(req.responseText);
        var stopname, icon, stopaddress;
        if (response && response.length > 0) {
          var stopResult = response[0];
          stopname = stopResult.location_name;
          icon = iconFromWeatherId(1);
          stopaddress = stopResult.location_data.address1;
          stop_id = stopResult.location_id;
          console.log(stopname);
          console.log(stopaddress);
          console.log(stop_id);
          
          Pebble.sendAppMessage({
            "icon":icon,
            "stopname":stopname,
            "stopaddres":stopaddress});
        }

      } else {
        console.log("Error");
      }
    }
  }
  req.send(null);
}

function locationSuccess(pos) {
  var coordinates = pos.coords;
  fetchStop(coordinates.latitude, coordinates.longitude);
  fetchTime(coordinates.latitude, coordinates.longitude);
}

function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
  Pebble.sendAppMessage({
    "city":"Loc Unavailable",
    "temperature":"N/A"
  });
}

var locationOptions = { "timeout": 15000, "maximumAge": 60000 }; 


Pebble.addEventListener("ready",
                        function(e) {
                          console.log("connect!" + e.ready);
                          locationWatcher = window.navigator.geolocation.watchPosition(locationSuccess, locationError, locationOptions);
                          console.log(e.type);
                        });

Pebble.addEventListener("appmessage",
                        function(e) {
                          window.navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
                          console.log(e.type);
                          console.log(e.payload.temperature);
                          console.log("message!");
                        });

Pebble.addEventListener("webviewclosed",
                                     function(e) {
                                     console.log("webview closed");
                                     console.log(e.type);
                                     console.log(e.response);
                                     });


