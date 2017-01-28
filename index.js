
module.exports = function () {
    
    var confset =  false;
    var conf =  {};

    const CONFIG = './config.json';

    const DOMAIN = 'apnl.ws';

    const DEFAULT_DEVICEUID = 'nodejs-sdk';
    
    const LOG_DEBUG = 3;
    const LOG_INFO = 2;
    const LOG_ERROR = 1;
    const LOG_MESS_INVALID_CONF = "Invalid configuration, please verify all required values (appname, appkey, log_level, format) and JSON is ok";
    const LOG_MESS_NOTFOUND_CONF = "Configuration ("+CONFIG+") not found";
    const LOG_MESS_REQUEST_FAILED = "Request Failed (status code >= 400)";
    
    
    apfs = require('fs');
    aphttps = require('https');
    apquerystring = require('querystring');
    
    function ap() {
	console.log("construct ap");
    }
    
    ap.prototype.log = function (d, level)
    {
	if (confset == false)
	{
	    console.error(d);
	}
	else //we can check loglevel
	{
	    if (conf.log_level >= level)
	    {
		if (level == LOG_ERROR)
		    console.error(d);
		else
		    console.log(d);
	    }
	}
    }
    
    ap.prototype.getconf = function(apdata)
    {
	apfs.access(CONFIG, apfs.constants.R_OK | apfs.constants.W_OK, function (err) {
	    if (err)
	    {
		ap.prototype.log(err, LOG_ERROR);
		apdata.error();
	    }
	    else
	    {
		apfs.readFile(CONFIG, function (err, data) {
		    if (err)
		    {
			ap.prototype.log(err, LOG_ERROR);
			apdata.error(LOG_MESS_NOTFOUND_CONF);
		    }
		    else
		    {
			try {
			    conf = JSON.parse(data);
			}
			catch(e)
			{
			    ap.prototype.log(e, LOG_ERROR);
			}

			//verify needed element are here
			if (typeof conf.appname != "undefined" && conf.appname != ""
			    && typeof conf.appkey != "undefined" && conf.appkey != ""
			    && typeof conf.log_level != "undefined" && conf.log_level != ""
			   && typeof conf.format != "undefined" && conf.format != "")
			{
			    confset = true;
			    ap.prototype.prepreq(apdata);
			}
			else
			{
			    ap.prototype.log(LOG_MESS_INVALID_CONF, LOG_ERROR, 1);
			    apdata.error(LOG_MESS_INVALID_CONF);
			}
		    }
		}); 
	    }
	});
	
    }
    
    ap.prototype.prepreq = function (apdata)
    {
	var deviceuid;
	if (apdata.deviceuid != null)
	    deviceuid = apdata.deviceuid;
	else
	    deviceuid = DEFAULT_DEVICEUID;
	    
	var options = {
	    hostname: conf.appname+"."+DOMAIN,
	    port: 443,
	    path: '/'+apdata.action,
	    method: apdata.method,
	    headers: { 'X-AP-Key': conf.appkey, 'Accept' : conf.format, 'X-AP-Deviceuid' : deviceuid }
	};

	var body = [];

	var req = aphttps.request(options, function (res) {
	    
	    console.log('statusCode:', res.statusCode);
	    console.log('headers:', res.headers);

	    res.on('data', function (chunk) {
		//process.stdout.write(d);
		body.push(chunk);
	    });

	    res.on('end', function () {
		//process.stdout.write(d);
		body = Buffer.concat(body).toString();

		//on verifie le status code
		if (res.statusCode >= 400)
		{
		    ap.prototype.log("http code : "+res.statusCode, LOG_ERROR);
		    apdata.error(LOG_MESS_REQUEST_FAILED, res.statusCode);
		}
		else
		{
		    if (conf.format == "application/json")
		    {
			try {
			    var bodyjson = JSON.parse(body);
			}
			catch (e)
			{
			    ap.prototype.log("json parse failed", LOG_ERROR);
			    apdata.error(LOG_MESS_BODY_JSON_PARSE);
			}

			if (bodyjson != null)
			{
			    apdata.success(bodyjson);
			}
		    }
		    else
		    {
			apdata.success(body);
		    }
		}


		
	    });

	    res.on('error', function (e) {
		console.error(e);
	    });
	});

	if (apdata.post_data != null)
	{
	    var post_data = null;
	    
	    try {
		post_data = apquerystring.stringify(apdata.post_data);
	    }
	    catch (e)
	    {
		ap.prototype.log("post data parse failed", LOG_ERROR);
	    }

	    if (post_data != null)
		req.write(post_data);
	}
	
	req.on('error', function (e) {
	    console.error(e);
	});
	
	req.end();
	
    }
    
    ap.prototype.request = function (method, action, deviceuid, post_data, success, error)
    {
	var apdata = {
	    method: method,
	    action: action,
	    deviceuid: deviceuid,
	    post_data: post_data,
	    success: success,
	    error: error
	};

	if (confset == false)
	{
	    ap.prototype.getconf(apdata);
	}
	else
	    ap.prototype.prepreq(apdata);
	
    }

    return new ap();
    
}
