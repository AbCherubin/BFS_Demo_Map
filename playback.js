window.onload = init;
function init() {
  var current_url = new URL(window.location.href);
  var id = current_url.searchParams.get("a");
  var asset = current_url.searchParams.get("n");
  document.getElementById("asset").innerHTML = asset;
  var marker_label = asset;
  var start_datetime;
  var end_datetime;
  var url;
  var startButton = document.getElementById("start-animation");
  var playButton = document.getElementById("play");
  var slideCol = document.getElementById("myRange");
  var table = document.getElementById("table");
  var loading_animate = document.getElementById("Loading");
  var myVar;

  var token;

  var latitude;
  var longitude;
  var post_lat = 0;
  var post_long = 0;

  var location;
  var PolylineData = [];
  var Snail_trail = [];
  var line_count = 0;
  var polydate = [];

  var route_polyline = [];
  var route_multiline = [];
  var line_string = [];
  var route_i = 0;

  var datafram = [];
  var driverfram = [];
  var sppedfram = [];
  var accfram = [];
  var timefram = [];
  var volt = [];

  var sum = 0;
  var countt = 0;
  var total = 0;

  var center = [100.75321197509766, 13.696901811402448];
  // MAP //
  var map = new ol.Map({
    view: new ol.View({
      center: ol.proj.fromLonLat(center),
      zoom: 15.5,
      maxZoom: 20,
      minZoom: 12,
      //rotation: Math.PI * 1.92,
      rotation: Math.PI * 1.42,
    }),
    target: "js-map",
  });

  var worldImagery = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maxZoom: 19,
    }),
  });

  ////////////////////////////////////  ////////////////////////////////////
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
      //polyline//
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "rgba(20, 188, 14,0  )",
          width: 1,
        }),
      }),
      new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [1, 46],
          anchorXUnits: "fraction",
          anchorYUnits: "pixels",
          src: "./pics/bus_pin.png",
          scale: 0.06,
          opacity: 0,
          color: "#0FB8FF",
        }),
      }),
    ],
  });

  //////////////////////playback///////////////////////////////////////////////////////////////////////////////

  var vectorFeature = new ol.Feature({});
  var vectorSource = new ol.source.Vector({
    features: [vectorFeature],
  });
  var styles = {
    route: new ol.style.Style({
      stroke: new ol.style.Stroke({
        width: 3,
        color: [255, 255, 0, 0.5],
      }),
    }),
    icon: new ol.style.Style({
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
      zIndex: 103,
    }),
    geoMarker: new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 450],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        src: "./pics/bus_pin.png",
        scale: 0.08,
        opacity: 1,
      }),
    }),
  };

  var vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    visible: true,
    title: "vector",
    zIndex: 102,
    style: function (feature) {
      // hide geoMarker if animation is active
      //console.log(feature.get("type"));
      // if (animating && feature.get("type") === "geoMarker") {
      //   return null;
      // }

      return styles[feature.get("type")];
    },
  });

  ////////////////////////////////////  ////////////////////////////////////

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
      route: new ol.style.Style({
        stroke: new ol.style.Stroke({
          width: 4,
          color: [255, 239, 51, 0.8],
        }),
        zIndex: 98,
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

  ////////////////////////////////////
  var baseLayerGroup = new ol.layer.Group({
    layers: [circle, markers, worldImagery, vectorLayer],
  });
  map.addLayer(baseLayerGroup);

  //////////////
  // function //
  //////////////
  function startAnimation() {
    iconSource.clear();
    for (i = 0; i <= line_count; i++) {
      if (Snail_trail[i].length !== 0) {
        route_polyline = new ol.geom.LineString(Snail_trail[i]);

        route_polyline.transform("EPSG:4326", "EPSG:3857");

        routeFeature = new ol.Feature({
          type: "route",
          geometry: route_polyline,
        });

        iconSource.addFeature(routeFeature);
      }
    }

    route_polyline = new ol.geom.LineString(datafram);

    route_polyline.transform("EPSG:4326", "EPSG:3857");

    routeFeature = new ol.Feature({
      type: "route",
      geometry: route_polyline,
    });
  }

  // Token

  //fetch Data
  // get_token();
  token = "zjzAY9OnbCSmXHtJfgzq8tNQrq4Mhp";

  function get_playback() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url, true);

    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        ready_status = false;
        var myObj = this.response;
        total = myObj.count;

        url = myObj.next;

        for (i = 0; i < myObj.results.length; i++) {
          latitude = myObj.results[i].latitude;
          longitude = myObj.results[i].longitude;

          if (latitude != 0 && longitude != 0) {
            // sds_datetime = myObj.results[i].updated_at.split("T");
            // sds_date = sds_datetime[0].split("-");
            // sds_date_y = parseInt(sds_date[0]);
            // sds_date_m = parseInt(sds_date[1]) - 1;
            // sds_date_d = parseInt(sds_date[2]);

            // sds_time = sds_datetime[1].split(":");
            // sds_time_h = parseInt(sds_time[0]) + 7;
            // sds_time_m = parseInt(sds_time[1]);
            // sds_time_s = parseInt(sds_time[2].split("z"));

            // dateOne = new Date(
            //   sds_date_y,
            //   sds_date_m,
            //   sds_date_d,
            //   sds_time_h,
            //   sds_time_m,
            //   sds_time_s
            // );
            // if (countt == 0) {
            //   datetwo = dateOne;

            // } else if (+datetwo <= +dateOne) {
            //   console.log(((Math.abs(dateOne - datetwo) / 1000) * 0.000277777778)*60*60);
            //   datetwo = dateOne;
            // }

            location = [parseFloat(longitude), parseFloat(latitude)];

            if (post_lat != 0 && post_long != 0) {
              line_string.push(
                [parseFloat(post_long), parseFloat(post_lat)],
                location
              );
              console.log([parseFloat(post_long), parseFloat(post_lat)]);
              console.log(location);
              // console.log(line_string);
              route_multiline[route_i] = new ol.geom.LineString(line_string);

              route_multiline[route_i].transform("EPSG:4326", "EPSG:3857");
              route_i++;
              line_string = [];
            }

            // set distance <0.5 km
            if (
              calcCrow(post_lat, post_long, latitude, longitude) <= 0.7 &&
              post_lat != 0 &&
              post_long != 0
            ) {
              sum = sum + calcCrow(post_lat, post_long, latitude, longitude);
              //console.log(calcCrow(post_lat, post_long, latitude, longitude));
              // console.log(sum);
              if (PolylineData.length === 0) {
                PolylineData.push([
                  parseFloat(post_long),
                  parseFloat(post_lat),
                ]);
              }
              PolylineData.push(location);
              polydate.push(myObj.results[i].updated_at);
            } else {
              Snail_trail[line_count] = PolylineData;
              line_count++;
              PolylineData = [];
              console.log(calcCrow(post_lat, post_long, latitude, longitude));
            }

            post_lat = latitude;
            post_long = longitude;

            datafram.push(location);
            driverfram.push(myObj.results[i].access_control_code);
            sppedfram.push(Math.floor(myObj.results[i].speed));
            accfram.push(myObj.results[i].acceleration.toFixed(2));
            timefram.push(myObj.results[i].updated_at);
            volt.push(myObj.results[i].fuel);
            countt = countt + 1;
          }
        }

        console.log(myObj);
        console.log(url);
        console.log(countt);
        console.log(route_multiline.length);
        console.log(datafram.length);

        Snail_trail[line_count] = PolylineData;
        document.getElementById("percent").innerHTML =
          Math.floor((countt / total) * 100) + " %";
        startAnimation();

        if (url !== null) {
          ready_status = true;
          get_playback();
          console.log("loop");
        } else {
          //////////////////////////////////////////////////////////////////////////////
          if (total === 0) {
            document.getElementById("percent").innerHTML = "No Data Found !";
            document.getElementById("percent").style.color = "red";
            document.getElementById("percent").style.marginLeft = "35%";
          } else {
            document.getElementById("percent").innerHTML = "Done";
            document.getElementById("percent").style.color = "white";
            document.getElementById("percent").style.marginLeft = "45%";
          }

          slideCol.max = datafram.length - 1;

          startButton.style.display = "block";
          loading_animate.style.display = "none";
          table.style.display = "block";
          document.getElementById("play").disabled = false;
          document.getElementById("myRange").disabled = false;
          showmark(0);
          //////////////////////////////////////////////////////////////////////////////
        }

        if (myObj == 0) {
          return;
        }
      } else if (this.readyState == 4 && this.status == 401) {
        get_token();
      }
    };

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
    xmlhttp.open("POST", "http://110.77.148.104:13111/o/token/", true);
    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    xmlhttp.setRequestHeader(
      "Authorization",
      "Basic " +
        btoa(
          "pN8RUcbi34WpQReDAJIGCbvzH4Jy70FkzcoR9ZpP:P67x8iUah9TK8aG9fWUwGeWcHDcD3QyNCnlh2hXSrLLWRJPQZbypxNLov6t0pBZgoaj4nAlUPY38W5tL8iX7qkylHYnkpNneej5SnFb9joHiHUZCa3pIYP7DvabjpYoK"
        )
    );
    xmlhttp.responseType = "json";
    xmlhttp.send("grant_type=password&username=aerotest&password=test1234");
  }
  function get_initial_url(id, start_datetime, end_datetime) {
    url =
      "http://110.77.148.104:13111/api/asset_tracking_log/?asset__id__icontains=" +
      id +
      "&updated_at__lte=" +
      end_datetime +
      "&updated_at__gte=" +
      start_datetime +
      "&ordering=created_at" +
      "&limit=200";
    ready_status = true;
  }

  function start() {
    iconSource.clear();
    init();
    clearTimeout(myVar);
    slideCol.value = 0;
    document.getElementById("play").innerHTML =
      "<i class='fas fa-play'></i>";
    var dateControl_s = document.querySelector('input[id="starttime"]');
    var dateControl_e = document.querySelector('input[id="endtime"]');
    document.getElementById("time").innerHTML = "";
    document.getElementById("play").disabled = true;
    document.getElementById("myRange").disabled = true;
    document.getElementById("percent").style.marginLeft = "45%";
    document.getElementById("percent").innerHTML = "";

    countt = 0;
    total = 0;

    datafram = [];
    driverfram = [];
    sppedfram = [];
    accfram = [];
    timefram = [];
    volt = [];

    route_multiline = [];
    route_polyline = [];
    route_i = 0;

    post_lat = 0;
    post_long = 0;

    start_datetime = dateControl_s.value;
    end_datetime = dateControl_e.value;

    console.log(start_datetime);
    console.log(end_datetime);
    if (start_datetime && end_datetime) {
      startButton.style.display = "none";
      loading_animate.style.display = "block";
      table.style.display = "none";

      start_datetime = set_UTC_7(start_datetime);
      end_datetime = set_UTC_7(end_datetime);

      PolylineData = [];
      line_count = 0;

      get_initial_url(id, start_datetime, end_datetime);
      console.log(url);
      console.log(token);
      get_playback();
    }
  }

  function set_UTC_7(date_time) {
    var sds_datetime = date_time.split("T");
    var sds_date = sds_datetime[0].split("-");
    var sds_date_y = parseInt(sds_date[0]);
    var sds_date_m = parseInt(sds_date[1]) - 1;
    var sds_date_d = parseInt(sds_date[2]);

    var sds_time = sds_datetime[1].split(":");
    var sds_time_h = parseInt(sds_time[0]) - 7;
    var sds_time_m = parseInt(sds_time[1]);

    var time_UTC_7 = new Date(
      sds_date_y,
      sds_date_m,
      sds_date_d,
      sds_time_h,
      sds_time_m
    );
    var new_date_string =
      time_UTC_7.getFullYear() +
      "-" +
      (time_UTC_7.getMonth() + 1) +
      "-" +
      time_UTC_7.getDate() +
      "T" +
      time_UTC_7.getHours() +
      ":" +
      time_UTC_7.getMinutes();

    console.log(new_date_string);
    return new_date_string;
  }

  function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }

  // Converts numeric degrees to radians
  function toRad(Value) {
    return (Value * Math.PI) / 180;
  }
  //
  function showmark(value) {
    if (timefram[value]) {
      sds_datetime = timefram[value].split("T");
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

      if (volt[value]) {
        //map.getView().getZoom() > 13 ? marker_label= vehicle_name[i]:"";
        //function Fuel Level//
        // f_100 = myObjWS.asset.vehicle.batt_max;
        // f_50 = myObjWS.asset.vehicle.batt_half;
        // f_0 = myObjWS.asset.vehicle.batt_min;
        // f_75 = f_middle(f_100, f_50);
        // f_25 = f_middle(f_50, f_0);
        // if (volt >= f_75) {
        //   fuel[index] = Math.floor(mapval(volt, f_75, f_100, 75, 100));
        // } else if (volt >= f_50) {
        //   fuel[index] = Math.floor(mapval(volt, f_50, f_75, 50, 75));
        // } else if (volt >= f_25) {
        //   fuel[index] = Math.floor(mapval(volt, f_25, f_50, 25, 50));
        // } else if (volt >= f_0) {
        //   fuel[index] = Math.floor(mapval(volt, f_0, f_25, 0, 25));
        // }
      }

      //document.getElementById("Volt").innerHTML =  mapval(volt[value], 0, 4095, 0, 3.3);
      document.getElementById("speed").innerHTML = sppedfram[value];
     // document.getElementById("acceleration").innerHTML = accfram[value];
      document.getElementById("driver").innerHTML = driverfram[value];
      document.getElementById("time").innerHTML = dateOne.toLocaleString();

      Marker_Feature = new ol.Feature({
        type: "Marker_online",
        geometry: new ol.geom.Point(ol.proj.fromLonLat(datafram[value])),
      });

      feature = iconSource.getFeatureById(0);
      if (feature) {
        iconSource.removeFeature(feature);
      }
      Marker_Feature.setProperties({
        lable: marker_label,
      });
      Marker_Feature.setId(0);
      iconSource.addFeature(Marker_Feature);
    }
  }

  function mapval(x, in_min, in_max, out_min, out_max) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  }

  var animating;
  var p;
  var distance;
  var elapsed;
  var startTime;
  var init_distance;
  var value;
  var i_showmark;

  function init() {
    animating = false;
    p = document.getElementById("play");
    distance = 0;
    elapsed = 0;
    startTime = 0;
    init_distance = 0;
    i_showmark = 0;
    value = 0;
  }
  init();
  function moveFeature(event) {
    //var vectorContext = ol.render.getVectorContext(event);
    var frameState = event.frameState;

    if (animating) {
      elapsed = frameState.time - startTime;
      distance = (speed * elapsed) / 1e6;

      if (distance >= 1 - init_distance) {
        // distance = 1;
        // init_distance = 0;
        distance = 0;
        init_distance = 0;
        startTime = new Date().getTime();
        frameState = event.frameState;
        console.log(i_showmark);

        if (parseInt(i_showmark)+1 >= parseInt(slideCol.max)) {
          console.log("DONE");
          refreshAnimation();
          return;
        }
        i_showmark++;
        console.log(i_showmark);
      }

      //value = (init_distance + distance) * slideCol.max;

      //showmark(Math.round(value/slideCol.max*( datafram.length - 1)));

      showmark(i_showmark);
      slideCol.value = i_showmark;
      if (parseInt(i_showmark) <= parseInt(slideCol.max) - 1) {
        Marker_Feature = new ol.Feature({
          type: "Marker_online",
          geometry: new ol.geom.Point(
            //route_polyline.getCoordinateAt(init_distance + distance)
            route_multiline[i_showmark].getCoordinateAt(
              init_distance + distance
            )
          ),
        });
        value = init_distance + distance;

        feature = iconSource.getFeatureById(0);
        if (feature) {
          iconSource.removeFeature(feature);
        }
        Marker_Feature.setProperties({
          lable: marker_label,
        });
        Marker_Feature.setId(0);
        iconSource.addFeature(Marker_Feature);
      }
      //vectorContext.drawFeature(feature, style);
    }
    // tell OpenLayers to continue the postrender animation
    map.render();
  }

  function play() {
    if (animating) {
      stopAnimation(false);
    } else {
      animating = true;
      startTime = new Date().getTime();
      speed = 3000;

      p.innerHTML = "<i class='fas fa-pause'></i>";
      // hide geoMarker
      markers.on("postrender", moveFeature);
      map.render();
    }
  }
  function stopAnimation(ended) {
    animating = false;
    p.innerHTML = "<i class='fas fa-play'></i>";
    
    console.log(slideCol.value);
    console.log(slideCol.max);
    // if animation cancelled set the marker at the beginning
    init_distance = distance + init_distance;

    if (parseInt(i_showmark) <= parseInt(slideCol.max) - 1) {
      Marker_Feature.getGeometry().setCoordinates(
        route_multiline[i_showmark].getCoordinateAt(value)
      );
    }
    // remove listener
    // vectorLayer.un("postrender", moveFeature);
  }
  function refreshAnimation() {
    animating = false;
    p.innerHTML = "<i class='fas fa-undo'></i>";

    //init_distance = distance + init_distance;
    showmark(slideCol.max);

    Marker_Feature.getGeometry().setCoordinates(
      route_multiline[slideCol.max - 1].getCoordinateAt(value)
    );
    slideCol.value = slideCol.max;

    init();
  }

  slideCol.onchange = function () {
    stopAnimation(false);
    showmark(slideCol.value);
    distance = 0;
    init_distance = 0;
    i_showmark = slideCol.value;
    console.log(i_showmark);
    if (parseInt(i_showmark) < parseInt(slideCol.max) - 1) {
      Marker_Feature.getGeometry().setCoordinates(
        route_multiline[i_showmark].getCoordinateAt(0)
      );
    }
  };
  slideCol.oninput = function () {
    stopAnimation(false);

    showmark(this.value);
  };

  startButton.addEventListener("click", start, false);
  playButton.addEventListener("click", play, false);
  ////////////////////////////////////
}
