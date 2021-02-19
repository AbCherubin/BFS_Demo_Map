window.onload = init;
function init() {
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
    }),
    zIndex: 99,
  };
  var markers = new ol.layer.Vector({
    source: iconSource,
    visible: true,
    title: "marker",
    zIndex: 100,
    style: function (feature) {
      return styles[feature.get("type")];
    },
  });

  // Vector Feature Popup Logic
  const overlayContainerElement = document.querySelector(".overlay-container");
  const overlayLayer = new ol.Overlay({
    element: overlayContainerElement,
  });
  map.addOverlay(overlayLayer);
  const overlayFeatureName = document.getElementById("feature-name");
  overlayLayer.setPosition(undefined);

  map.on("click", function (e) {
    map.forEachFeatureAtPixel(
      e.pixel,
      function (feature, layer) {
        let id = feature.get("index");
        id_selected = id;
        console.log(id_selected);
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
    layers: [ markers, worldImagery, circle],
  });
  map.addLayer(baseLayerGroup);
  //////////////
  // function //
  //////////////

  // Bomb //
  var duration = 1000;

  function flash(location,i) {
    animate_check[i] = false;
    var start = new Date().getTime();
    var listenerKey = circle.on("postrender", animate);
    function animate(event) {
      var vectorContext = ol.render.getVectorContext(event);
      var frameState = event.frameState;
      var elapsed = frameState.time - start;
      var elapsedRatio = elapsed / duration;
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
      if (elapsed > duration+3000) {
        ol.Observable.unByKey(listenerKey);
        animate_check[i]  = true;
        return;
      }
      // tell OpenLayers to continue postrender animation
      map.render();
    }
  }

  var intervaltime = 500;
  var token;
  var id_selected;

  var latitude = [];
  var longitude = [];
  var location;
  var date_time = [];
  var id = [];
  var speed = [];
  var active_time = [];
  var acceleration =[];
  var box_id =[];
  var driver =[];
  var vehicle_name =[];

  var fuel =[];
  var volt;
  var f_100;
  var f_75;
  var f_50;
  var f_25;
  var f_0;

  var geom;
  var feature_point;
  var animate_check=[];
  
  var Marker_type;
  var startpoint;
  var PolylineData = [];
  var route_polyline;

  function display(i) {
    document.getElementById("id").innerHTML = id[i];
    document.getElementById("speed").innerHTML = speed[i];
    document.getElementById("acceleration").innerHTML = acceleration[i];
    document.getElementById("box_id").innerHTML = box_id[i];
    document.getElementById("driver").innerHTML = driver[i];
    document.getElementById("fuel").innerHTML = fuel[i];
    document.getElementById("vehicle_name").innerHTML = vehicle_name[i];

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

          latitude[i] = myObj.results[i].latitude;
          longitude[i] = myObj.results[i].longitude;

          if (latitude[i] != 0 && longitude[i] != 0) {

            id[i] = myObj.results[i].id;
            speed[i] = Math.floor(myObj.results[i].speed);
            date_time[i] = myObj.results[i].date_time;
            acceleration[i] = Math.floor(myObj.results[i].acceleration);
            box_id[i] = myObj.results[i].box;
            volt  = mapval(myObj.results[i].fuel,0,4095,0,3.3);
         
            if(isEmpty(myObj.results[i].driver)) {
              // Object is empty (Would return true in this example)
          } else {
              // Object is NOT empty
              driver[i] = myObj.results[i].driver.access_control_code;
          } 

           // fuel //vehicle//
           if(isEmpty(myObj.results[i].asset.vehicle)) {
            // Object is empty (Would return true in this example)
        } else {

            vehicle_name[i] = myObj.results[i].asset.vehicle.name;
            // Object is NOT empty
            f_100 =myObj.results[i].asset.vehicle.batt_max;
            f_50  =myObj.results[i].asset.vehicle.batt_half;
            f_0 =myObj.results[i].asset.vehicle.batt_min;
            f_75= f_middle(f_100,f_50);
            f_25= f_middle(f_50,f_0);
   
            if(volt>=f_75){
              fuel[i] = Math.floor(mapval(volt,f_75,f_100,75,100));
            }
            else if(volt>=f_50){
              fuel[i] = Math.floor(mapval(volt,f_50,f_75,50,75));
            }
            else if(volt>=f_25){
              fuel[i] = Math.floor(mapval(volt,f_25,f_50,25,50));
            }
            else if(volt>=f_0){
              fuel[i] = Math.floor(mapval(volt,f_0,f_25,0,25));
            }
        } 





            location = [parseFloat(longitude[i]), parseFloat(latitude[i])];
            active_time[i] = diff_minutes(i);
            if (active_time[i] > 2) {
              Marker_type = "Marker_offline";

            } else {
              Marker_type = "Marker_online";
       
              if ((animate_check[i] != false)) {
                feature_animate = new ol.Feature({
                  geometry: new ol.geom.Point(ol.proj.fromLonLat(location)),
                });
                circleSource.addFeature(feature_animate);

                flash(location,i);
              }
            }


            feature_point = new ol.Feature({
              type: Marker_type,
              geometry: new ol.geom.Point(ol.proj.fromLonLat(location)),
            });

            feature_point.setProperties({
              index: i,
              id: myObj.results[i].id,
              speed: myObj.results[i].speed,
              time: myObj.results[i].date_time,
            });
            iconSource.addFeature(feature_point);
            console.log(myObj);
          }
        }
        if (myObj == 0) {
          return;
        }
        display(id_selected);

      } else if (this.readyState == 4 && this.status == 401) {
        get_token();
      }
    };

    xmlhttp.open("GET", "http://110.77.148.104:8000/api/asset_tracking/", true);
    xmlhttp.setRequestHeader("Authorization", "Bearer " + token);
    xmlhttp.responseType = "json";
    xmlhttp.send();
  }

  function get_token() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var myObj = this.response;
        token = myObj.access_token;
      }
    };
    xmlhttp.open("POST", "http://110.77.148.104:8000/o/token/", true);
    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    xmlhttp.setRequestHeader(
      "Authorization",
      "Basic " +
        btoa(
          "ambZViQ35gyfwTkqdnxbQCjPPsGGo9NMFNXeZm91:oCGC642skgXPbz3wX3GYuBXHNOsRkpXd56yhHI7RsiSkfFMXbgb1fXQFiqQVaYGeSBwfleWPY0SoQtFGPht7KSXdHBqtDdxblvQJAnA6TmuJzidsmxoVhrv9eyh3EUAM"
        )
    );
    xmlhttp.responseType = "json";
    xmlhttp.send("grant_type=password&username=aerotest&password=test1234");
  }

  let intervalId = setInterval(showMarker, intervaltime);

  function diff_minutes(i) {
    var sds_datetime = date_time[i].split("T");
    sds_date = sds_datetime[0].split("-");
    sds_date_y = parseInt(sds_date[0]);
    sds_date_m = parseInt(sds_date[1]) - 1;
    sds_date_d = parseInt(sds_date[2]);

    sds_time = sds_datetime[1].split(":");
    sds_time_h = parseInt(sds_time[0]) + 7;
    sds_time_m = parseInt(sds_time[1]);

    var todayDate = new Date();
    var dateOne = new Date(
      sds_date_y,
      sds_date_m,
      sds_date_d,
      sds_time_h,
      sds_time_m
    );
    var dif = todayDate - dateOne;
    var dif = Math.round(dif / 1000 / 60);

    return dif;
  }
  
  function f_middle(max,min) {
    return ((max-min)/2)+min;
  }


  function openNav() {
    document.getElementById("mySidenav").style.width = "350px";
  }
  function mapval(x,in_min, in_max,out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  }
  function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
  ////////////////////////////////////
}
