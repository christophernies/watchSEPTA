
function iconFromWeatherId(weatherId) {
  return 0;
}

function fetchTime(latitude, longitude, transit_data) {
  var response;
  var icon = 0;
  console.log("transit_data: " + JSON.stringify(transit_data));
  var stop_id = transit_data['stop_id'];
  var req2 = new XMLHttpRequest();
  req2.onload = function(e) {
    if (req2.readyState == 4) {
      if(req2.status == 200) {
        response = JSON.parse(req2.responseText);
        var keys = [];
        for(var key in response)
        {
            if(response.hasOwnProperty(key))
            {
                keys.push(key);
            }
        }
        console.log("date: " + response[keys[0]][0]['date'])
        console.log("route: " + response[keys[0]][0]['Route'])
        var next_bus;
        stopname = transit_data['stopname'];
        stopaddress = transit_data['stopaddress'];
        var stopResult = response[keys[0]][0];
        next_bus = stopResult.Route;
        time = stopResult.date;
        console.log("time: " + time);
        
        Pebble.sendAppMessage({
          "next_bus":next_bus,
          "stopname":stopname,
          "time":time,
          "stopaddress":stopaddress});

      } else {
        console.log("Error");
      }
    }
  }
  req2.open('GET', "http://www3.septa.org/hackathon/BusSchedules/?req1=" + stop_id + "&req3=i&req6=1", true);
  req2.send();
}

function getData(latitude, longitude, data) {
  fetchTime(latitude, longitude, data);
}

function fetchStop(latitude, longitude, callback) {
  var response;
  var req = new XMLHttpRequest();
  req.open('GET', "http://www3.septa.org/hackathon/locations/get_locations.php?" +
    "lat=" + latitude + "&lon=" + longitude + "&radius=.5", true);
  data = {}
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
          data['stopname'] = stopname;
          data['stopaddress'] = stopaddress;
          data['stop_id'] = stop_id;
          callback(latitude, longitude, data);
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
  fetchStop(coordinates.latitude, coordinates.longitude, getData);
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


