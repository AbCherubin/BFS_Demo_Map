window.onload = init;

const SERVER_URL = "http://110.77.148.104";
const WS_URL = "ws://110.77.148.104";
const WS_ENDPOINT = "/ws/live/";
const SERVER_PORT = "8000";
const ASSET_TRACKING_ENDPOINT = "/api/asset_tracking/";
const AUTHEN_ENDPOINT = "/o/token/";

const AUTHEN_CLIENT_ID = "ambZViQ35gyfwTkqdnxbQCjPPsGGo9NMFNXeZm91";
const AUTHEN_CLIENT_SECRET =
  "oCGC642skgXPbz3wX3GYuBXHNOsRkpXd56yhHI7RsiSkfFMXbgb1fXQFiqQVaYGeSBwfleWPY0SoQtFGPht7KSXdHBqtDdxblvQJAnA6TmuJzidsmxoVhrv9eyh3EUAM";
const TEMP_AUTHEN_TOKEN = "WiXyr9Tv2ah6uyGhwhtxMjXyuZJz7W";

const AUTHEN_USER = "aerotest";
const AUTHEN_PASS = "test1234";

function init() {
//  var token = "mxshs8DSnepC7Dvc7NuHPthlNwaIay";
  var token;
  var id_selected;
  var obj_data = {};
  var index;
  var check_init_feature = [];

  var latitude = [];
  var longitude = [];
  var location;
  var circle_location ;
  var date_time = [];
  var id = [];
  var speed = [];
  var dateOne;
  var todayDate;
  var sds_datetime;
  var active_time = [];
  var time = [];
  var marker_label = "";

  var acceleration = [];
  var box_id = [];
  var driver = [];
  var vehicle_name = [];
  var log_time = [];

  var fuel = [];
  var volt;
  var f_100;
  var f_75;
  var f_50;
  var f_25;
  var f_0;


  var feature_point;
  var animate_check = [];

  var Marker_type;

  var bomb_duration = 1000;

  var center = [100.75049, 13.691678];
  // MAP //
  var map = new ol.Map({
    view: new ol.View({
      center: ol.proj.fromLonLat(center),
      zoom: 15,
      maxZoom: 20,
      minZoom: 12,
      //rotation: Math.PI * 1.92,
      rotation: Math.PI * 1.42,
    }),
    target: "js-map",
  });

  var worldImagery = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maxZoom: 19,
    }),
  });

  var geoMarker = new ol.Feature({});
  var circleFeature = new ol.Feature({});
  var circleSource = new ol.source.Vector({
    features: [circleFeature, geoMarker],
    projection: "EPSG:4326",
  });
  var circle = new ol.layer.Vector({
    source: circleSource,
    visible: true,

    style: [
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 1,
          fill: new ol.style.Fill({
            color: "rgba(20, 188, 14  , 0)",
          }),
          stroke: new ol.style.Stroke({
            color: "rgba(20, 188, 14 ,0 )",
            width: 3,
          }),
        }),
      }),
    ],
  });

  //Marker//

  var iconFeature = new ol.Feature({});
  var iconSource = new ol.source.Vector({
    features: [iconFeature],
  });

  function getstyle(marker_label) {
    var styles = {
      Marker_online: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 450],
          anchorXUnits: "fraction",
          anchorYUnits: "pixels",
          src: "./pics/bus_pin.png",
          scale: 0.08,
          opacity: 1,
          // color: "#00FB03",
        }),
        text: new ol.style.Text({
          offsetY: 15,
          text: marker_label,
          font: "12px Calibri,sans-serif",
          fill: new ol.style.Fill({ color: "#000" }),
          stroke: new ol.style.Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
        zIndex: 101,
      }),
      Marker_offline: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 450],
          anchorXUnits: "fraction",
          anchorYUnits: "pixels",
          src: "./pics/bus_pin.png",
          scale: 0.08,
          opacity: 1,
          color: "#726C6A",
        }),
        text: new ol.style.Text({
          offsetY: 15,
          text: marker_label,
          font: "12px Calibri,sans-serif",
          fill: new ol.style.Fill({ color: "#000" }),
          stroke: new ol.style.Stroke({
            color: "#fff",
            width: 2,
          }),
        }),
        zIndex: 99,
      }),
    };
    return styles;
  }
  var markers = new ol.layer.Vector({
    source: iconSource,
    visible: true,
    title: "marker",
    zIndex: 100,
    style: function (feature) {
      styles = getstyle(feature.get("lable"));
      return styles[feature.get("type")];
    },
  });

  map.on("click", function (e) {
    map.forEachFeatureAtPixel(
      e.pixel,
      function (feature, layer) {
        let id = feature.get("index");
        id_selected = id;
        openNav();
  
        display(id_selected);
      },
      {
        layerFilter: function (layerCandidate) {
          return layerCandidate.get("title") === "marker";
        },
      }
    );
  });
  ////////////////////////////////////
  var baseLayerGroup = new ol.layer.Group({
    layers: [markers, worldImagery, circle],
  });
  map.addLayer(baseLayerGroup);

  //////////////
  // function //
  //////////////

  // Token
  //get_token();

  // Bomb //

  function flash(location, i) {
    animate_check[i] = false;
    var start = new Date().getTime();
    var listenerKey = circle.on("postrender", animate);
    function animate(event) {
      var vectorContext = ol.render.getVectorContext(event);
      var frameState = event.frameState;
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / bomb_duration;
      // radius will be 5 at start and 30 at end.
      var radius = ol.easing.easeOut(elapsedRatio) * 10 + 7;
      var opacity = ol.easing.easeOut(1 - elapsedRatio);

      var currentPoint = new ol.geom.Point(ol.proj.fromLonLat(location));

      var style = new ol.style.Style({
        image: new ol.style.Circle({
          radius: radius,
          stroke: new ol.style.Stroke({
            color: "rgba(20, 188, 14," + opacity + ")",
            width: 2 + opacity,
          }),
        }),
      });
      var feature = new ol.Feature(currentPoint);

      vectorContext.setStyle(style);
      vectorContext.drawFeature(feature, style);
      if (elapsed > bomb_duration + 3000) {
        ol.Observable.unByKey(listenerKey);
        animate_check[i] = true;
        return;
      }
      // tell OpenLayers to continue postrender animation
      map.render();
    }
  }

  function display(i) {
    document.getElementById("id").innerHTML = id[i];
    document.getElementById("speed").innerHTML = speed[i];
    document.getElementById("acceleration").innerHTML = acceleration[i];
    document.getElementById("box_id").innerHTML = box_id[i];
    document.getElementById("driver").innerHTML = driver[i];
    document.getElementById("fuel").innerHTML = fuel[i];
    document.getElementById("vehicle_name").innerHTML = vehicle_name[i];
    var now = new Date();
    active_time[i] = Math.round(
      (now - time[i]) / 1000 / 60
    );
    console.log("loop");
    if (active_time[i] > 2) {
      document.getElementById("active").innerHTML = active_time[i];
      document.getElementById("active").style.color = "red";
      document.getElementById("active_text").innerHTML = "minutes ago";
    } else {
      document.getElementById("active").innerHTML = "Now";
      document.getElementById("active_text").innerHTML = "";
      document.getElementById("active").style.color = "#A0F961";
    }
  }

  function showMarker() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var myObj = this.response;

        iconSource.clear();
        for (i = 0; i < myObj.count; i++) {
          // let socket = new WebSocket(WS_URL+":"+SERVER_PORT+WS_ENDPOINT+id+"/?token="+token);
          latitude[i] = myObj.results[i].latitude;
          longitude[i] = myObj.results[i].longitude;

          if (latitude[i] != 0 && longitude[i] != 0) {
            id[i] = myObj.results[i].id;
            var key = id[i];
            obj_data[key] = i;
            console.log(obj_data);
            let socket = new WebSocket(
              WS_URL +
                ":" +
                SERVER_PORT +
                WS_ENDPOINT +
                id[i] +
                "/?token=" +
                token
            );
            socket.onopen = function (e) {
              console.log(" open now");
   
            };

            socket.onmessage = function (event) {
              // Set Up
              var myObjWS = JSON.parse(event.data);
              index = obj_data[myObjWS.id];
              latitude[index] = myObjWS.latitude;
              longitude[index] = myObjWS.longitude;
              speed[index] = Math.floor(myObjWS.speed);
              date_time[index] = myObjWS.date_time;
              acceleration[index] = Math.floor(myObjWS.acceleration);
              box_id[index] = myObjWS.box;
              volt = mapval(myObjWS.fuel, 0, 4095, 0, 3.3);
              circle_location = [
                parseFloat(longitude[index]),
                parseFloat(latitude[index]),
              ];
              if (isEmpty(myObjWS.driver)) {
                // Check if Empty
              } else {
                //function get driver name//
                driver[index] = myObjWS.driver.access_control_code;
              }

              if (isEmpty(myObjWS.asset.vehicle)) {
                // Check if Empty
           
              } else {
                //function get vehicle name//
                vehicle_name[index] = myObjWS.asset.vehicle.name;

                //map.getView().getZoom() > 13 ? marker_label= vehicle_name[i]:"";
               

                //function Fuel Level//
                f_100 = myObjWS.asset.vehicle.batt_max;
                f_50 = myObjWS.asset.vehicle.batt_half;
                f_0 = myObjWS.asset.vehicle.batt_min;
                f_75 = f_middle(f_100, f_50);
                f_25 = f_middle(f_50, f_0);

                if (volt >= f_75) {
                  fuel[index] = Math.floor(mapval(volt, f_75, f_100, 75, 100));
                } else if (volt >= f_50) {
                  fuel[index] = Math.floor(mapval(volt, f_50, f_75, 50, 75));
                } else if (volt >= f_25) {
                  fuel[index] = Math.floor(mapval(volt, f_25, f_50, 25, 50));
                } else if (volt >= f_0) {
                  fuel[index] = Math.floor(mapval(volt, f_0, f_25, 0, 25));
                }
              }
              sds_datetime = date_time[index].split("T");
              sds_date = sds_datetime[0].split("-");
              sds_date_y = parseInt(sds_date[0]);
              sds_date_m = parseInt(sds_date[1]) - 1;
              sds_date_d = parseInt(sds_date[2]);

              sds_time = sds_datetime[1].split(":");
              sds_time_h = parseInt(sds_time[0]) + 7;
              sds_time_m = parseInt(sds_time[1]);
              sds_time_s = parseInt(sds_time[2].split("z"));

             
              dateOne = new Date(
                sds_date_y,
                sds_date_m,
                sds_date_d,
                sds_time_h,
                sds_time_m,
                sds_time_s
              );
              time[index] = dateOne;

         
              display(id_selected);
              if (animate_check[index] != false) {
                feature_animate = new ol.Feature({
                  geometry: new ol.geom.Point(ol.proj.fromLonLat(circle_location)),
                });
                circleSource.addFeature(feature_animate);

                flash(circle_location, index);
              }

              //loop
              for (var i in obj_data) {
                j=  obj_data[i];
           
                location = [
                  parseFloat(longitude[j]),
                  parseFloat(latitude[j]),
                ];
                marker_label = vehicle_name[j];
                todayDate = new Date();
                active_time[j] = Math.round(
                  (todayDate - time[j]) / 1000 / 60
                );
                if (active_time[j] > 2) {
                  Marker_type = "Marker_offline";
                } else if(active_time[j]<=2) {
                  Marker_type = "Marker_online";
                
                }else{Marker_type = "Marker_offline";}
    
                  feature_point = new ol.Feature({
                    type: Marker_type,
                    geometry: new ol.geom.Point(ol.proj.fromLonLat(location)),
                  });
    
                  feature_point.setProperties({
                    index: j,
                    lable: marker_label,
                  });
    
                  if (check_init_feature[j] == true) {
                    feature = iconSource.getFeatureById(j);
                    iconSource.removeFeature(feature);
                   // let intervalId = setInterval(check_alive, 2000);
                  }
                  feature_point.setId(j);
                  iconSource.addFeature(feature_point);

              }
              //
              
              // hide label
              //if( map.getView().getZoom() < 15) { marker_label= "";}
              //function time//

              
             

              //function Markers Animate//

        
              check_init_feature[index] = true;
              console.log(myObjWS);
              console.log(token);
              //overlayFeatureName.innerHTML = vehicle_name[i];

              // function Alert
              // overlayLayer.setPosition //

              //  if(acceleration[i]>1 &&log_time[i]!=dateOne.valueOf()){

              // log_time[i] = dateOne.valueOf();
              //   alert(vehicle_name[i]+" is hitting the brakes suddenly. (" + acceleration[i] + " m/s^2)" );
              //  }
            };
            socket.onclose = function (event) {
              if (event.wasClean) {
                console.log(
                  `B [close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
                );
              } else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                console.log("B [close] Connection died");
                location.reload();
              }
            };

            socket.onerror = function (error) {
              console.log(`A [error] ${error.message}`);
              showMarker();
            };
          }
        }
        if (myObj == 0) {
          return;
        }

      
      } else if (this.readyState == 4 && this.status == 401) {
        get_token();
        showMarker();
      }
    };

    xmlhttp.open(
      "GET",
      SERVER_URL + ":" + SERVER_PORT + ASSET_TRACKING_ENDPOINT,
      true
    );
    xmlhttp.setRequestHeader("Authorization", "Bearer " + token);
    xmlhttp.responseType = "json";
    xmlhttp.send();
  }

  function get_token() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.open(
      "POST",
      SERVER_URL + ":" + SERVER_PORT + AUTHEN_ENDPOINT,
      true
    );
    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    xmlhttp.setRequestHeader(
      "Authorization",
      "Basic " + btoa(AUTHEN_CLIENT_ID + ":" + AUTHEN_CLIENT_SECRET)
    );
    xmlhttp.responseType = "json";
    xmlhttp.send(
      "grant_type=password&username=" + AUTHEN_USER + "&password=" + AUTHEN_PASS
    );
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var myObj = this.response;
        token = myObj.access_token;
        console.log(token);
      }
    };
  }

  function f_middle(max, min) {
    return (max - min) / 2 + min;
  }

  function openNav() {
    document.getElementById("mySidenav").style.width = "350px";
  }
  function mapval(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }
  function isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) return false;
    }
    return true;
  }

  showMarker();

  
  ////////////////////////////////////
}
