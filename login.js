const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

const SERVER_URL = "http://110.77.148.104";
const WS_URL = "ws://110.77.148.104";
const WS_ENDPOINT = "/ws/live/";
const SERVER_PORT = "8888";
const ASSET_TRACKING_ENDPOINT = "/api/asset_tracking/";
const AUTHEN_ENDPOINT = "/o/token/";

const client_id = "fbGXEuXRI5qNOeJjvk6fzS1bVadpjrQFOUF6PlKF";
const client_secret =
  "w2texbkmjioQVNxyRCj3868lvVr3hrjSqFYjJAkQcvnZMdvmXf2RvCVhdrAIaF9QVt1Ff2badx0g3AmXADl269ZAJG5KS0BhoWbcgSBVuLDiGbz6RXEWOD9A0XyXrzQk";

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
