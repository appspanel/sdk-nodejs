NodeJS SDK for AppsPanel Mobile Backend (APNL)
===

Use this sdk for :
  - Making API Call to your specific API (API Platform)
  - Interacting with standard AppsPanel modules (User/Auth, File & Content Management) -- coming soon
  - Sending specific KPI (Analytics) -- coming soon
  
Getting Started
---

#### 1 - Install ####

NodeJS-SDK will work on most systems out-of-the-box with nodejs and native API (no dependencies required).

```sh
npm install apnl
```

#### 2 - Configuration ####

Build ap-config.json :

```javascript
{
    "appname": "YOURAPPNAME",
    "appkey": "YOURAPPKEY",
    "log_level": 1
}
```

 - appname : this is your appname (you get it when you create an app on backend.appspanel.com)
 - appkey : this is your appkey (you get it when you create an app on backend.appspanel.com)
 - log_level :
  - 0 : no log
  - 1 : error => what you want in production
  - 2 : error & info => what you want in development
  - 3 : error, info & debug

#### 3 - Include & Run ####

```javascript
var apnl = require('apnl')();
```

if configuration is named "ap-config.json" and exist in the current directory.

or

```javascript
var apnl = require('apnl')('../ap-config.json');
```

depending where your config is located and how it's nammed.

Make your first call :

```javascript
var apnl = require('apnl')();

//very simple GET request on /test with get parameters foo (value FOO), and callback success and error provided
apnl.request("test?foo=FOO", null, function (data) {
    //success
    console.log("callback success");
    console.log(data);
}, function (error) {
    //error
    console.log("callback error");
    console.log(error);
});

```

Get more examples [here](https://github.com/appspanel/sdk-nodejs/tree/master/examples)

Have a problem ?
---

Feel free to contact us on : support@apps-panel.com

Resources
---
  - [Wiki](https://github.com/appspanel/sdk-nodejs/wiki)
  - [NPM Repo](https://www.npmjs.com/package/apnl)
  - [AppsPanel Website](http://www.appspanel.com/)
  - [AppsPanel Management Console](https://backend.appspanel.com)




