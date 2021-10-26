const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

const SERVER_URL = "http://110.77.148.104";
const WS_URL = "ws://110.77.148.104";
const WS_ENDPOINT = "/ws/live/";
const SERVER_PORT = "13111";
const ASSET_TRACKING_ENDPOINT = "/api/asset_tracking/";
const AUTHEN_ENDPOINT = "/o/token/";

const client_id = "pN8RUcbi34WpQReDAJIGCbvzH4Jy70FkzcoR9ZpP";
const client_secret =
  "P67x8iUah9TK8aG9fWUwGeWcHDcD3QyNCnlh2hXSrLLWRJPQZbypxNLov6t0pBZgoaj4nAlUPY38W5tL8iX7qkylHYnkpNneej5SnFb9joHiHUZCa3pIYP7DvabjpYoK";

const TEMP_AUTHEN_TOKEN = "WiXyr9Tv2ah6uyGhwhtxMjXyuZJz7W";

const AUTHEN_USER = "aerotest";
const AUTHEN_PASS = "test1234";

// When the login button is clicked, the following code is executed
loginButton.addEventListener("click", (e) => {
  // Prevent the default submission of the form
  e.preventDefault();
  // Get the values input by the user in the form fields
  const username = loginForm.username.value;
  const password = loginForm.password.value;
  authen(username, password);

});

function authen(USER, PASS) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.open("POST", SERVER_URL + ":" + SERVER_PORT + AUTHEN_ENDPOINT, true);
  xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xmlhttp.responseType = "json";
  xmlhttp.send(
    "grant_type=password&username=" +
      USER +
      "&password=" +
      PASS +
      "&client_id=" +
      client_id +
      "&client_secret=" +
      client_secret
  );
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var myObj = this.response;
      //token = myObj.access_token;
      loginErrorMsg.style.opacity = 0;
      console.log(myObj.access_token);
      const TOKEN =myObj.access_token;
      window.location.href = './index.html?t='+TOKEN;
    } else {
      loginErrorMsg.style.opacity = 1;
    }
  };
}
