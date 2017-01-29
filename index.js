
module.exports = function (apconfig) {
    
    var confset =  false;
    var pathconfig;
    var conf =  {};

    
    const CONFIG = './ap-config.json';

    const DOMAIN = 'apnl.ws';

    const DEFAULT_DEVICEUID = 'nodejs-sdk';
    const DEFAULT_LANG = 'fr-FR';
    const DEFAULT_APPVERSION = '1.0';
    const DEFAULT_FORMAT = 'application/json';

    const SDK_VERSION = '1.0';
    const OS = 'nodejs';
    
    const LOG_DEBUG = 3;
    const LOG_INFO = 2;
    const LOG_ERROR = 1;
    const LOG_MESS_INVALID_CONF = "Invalid configuration, please verify all required values (appname, appkey, log_level) and JSON is ok";
    const LOG_MESS_NOTFOUND_CONF = "Configuration not found";
    const LOG_MESS_REQUEST_FAILED = "Request Failed (status code >= 400)";
    const LOG_MESS_ACTION_EMPTY = "Action is missing";
    const LOG_MESS_REQ_ERROR = "Request error";
    const LOG_MESS_RES_ERROR = "Result error";
    
    
    apfs = require('fs');
    aphttps = require('https');
    apquerystring = require('querystring');
    
    function ap(config) {
	if (typeof config != "undefined" && config != "")
	    pathconfig = config;
	else
	    pathconfig = CONFIG;
    }
    
    ap.prototype.log = function (d, level)
    {
	if (typeof d == "string")
	{
	    var date_now = new Date();
	    var log = date_now.toISOString();
	    
	    log += " -- apnl-nodejs-sdk -- \"" + d + "\"";
	    
	}
	else
	    log = d;
	
	if (confset == false)
	{
	    if (level == LOG_ERROR)
		console.error(log);
	}
	else //we can check loglevel
	{
	    if (level <= conf.log_level)
	    {
		
		if (level == LOG_ERROR)
		    console.error(log);
		else
		    console.log(log);
	    }
	}
    }
    
    ap.prototype.getconf = function(apdata)
    {
	apfs.access(pathconfig, apfs.constants.R_OK | apfs.constants.W_OK, function (err) {
	    if (err)
	    {
		ap.prototype.log("json config access failed :", LOG_ERROR);
		ap.prototype.log(err, LOG_ERROR);
		if (apdata.error != null)
		    apdata.error({mess: LOG_MESS_NOTFOUND_CONF});
	    }
	    else
	    {
		apfs.readFile(pathconfig, function (err, data) {
		    if (err)
		    {
			ap.prototype.log("json config read failed :", LOG_ERROR);
			ap.prototype.log(err, LOG_ERROR);
			if (apdata.error != null)
			    apdata.error({mess: LOG_MESS_NOTFOUND_CONF});
		    }
		    else
		    {
			try {
			    conf = JSON.parse(data);
			}
			catch(e)
			{
			    ap.prototype.log("json config parse failed :", LOG_ERROR);
			    ap.prototype.log(e, LOG_ERROR);
			}

			//verify needed element are here
			if (typeof conf.appname != "undefined" && conf.appname != ""
			    && typeof conf.appkey != "undefined" && conf.appkey != ""
			    && typeof conf.log_level != "undefined" && conf.log_level >= 0
			   )
			{
			    confset = true;
			    ap.prototype.prepreq(apdata);
			}
			else
			{
			    ap.prototype.log(LOG_MESS_INVALID_CONF, LOG_ERROR, 1);
			    if (apdata.error != null)
				apdata.error({mess: LOG_MESS_INVALID_CONF});
			}
		    }
		}); 
	    }
	});
	
    }
    
    ap.prototype.prepreq = function (apdata)
    {
	ap.prototype.log("object conf : ", LOG_DEBUG);
	ap.prototype.log(conf, LOG_DEBUG);
	
	ap.prototype.log("parameters apdata : ", LOG_INFO);
	ap.prototype.log(apdata, LOG_INFO);
	
	var options = {
	    hostname: conf.appname+"."+DOMAIN,
	    port: 443,
	    path: '/'+apdata.action,
	    method: apdata.method,
	    headers: { 'X-AP-Key': conf.appkey, 'Accept' : apdata.format, 'X-AP-Deviceuid' : apdata.deviceuid,
		       'Accept-Charset': 'utf-8', 'Accept-Language' : apdata.lang, 'X-AP-AppVersion' : apdata.appversion, 'X-AP-SDKVersion': SDK_VERSION,
		       'X-AP-OS': OS, 'X-AP-RealTime': apdata.time}
	};

	ap.prototype.log("options for request : ", LOG_DEBUG);
	ap.prototype.log(options, LOG_DEBUG);

	var body = [];

	var req = aphttps.request(options, function (res) {
	    
	    ap.prototype.log("result start", LOG_DEBUG);

	    res.on('data', function (chunk) {
		//process.stdout.write(d);
		ap.prototype.log("result data received :", LOG_DEBUG);
		ap.prototype.log(chunk, LOG_DEBUG);
		body.push(chunk);
	    });

	    res.on('end', function () {
		//process.stdout.write(d);
		body = Buffer.concat(body).toString();

		ap.prototype.log("result data ended :", LOG_DEBUG);
		ap.prototype.log(body, LOG_DEBUG);

		ap.prototype.log("result code http : "+res.statusCode, LOG_INFO);

		ap.prototype.log("result headers http :", LOG_INFO);
		ap.prototype.log(res.headers, LOG_INFO);

		ap.prototype.log("result body :", LOG_INFO);
		ap.prototype.log(body, LOG_INFO);
		
		//on verifie le status code
		if (res.statusCode >= 400)
		{
		    ap.prototype.log("http code : "+res.statusCode, LOG_ERROR);

		    var out = {body: body, res: res};
		    
		    if (apdata.error != null)
			apdata.error({mess: LOG_MESS_REQUEST_FAILED, data: out});
		}
		else
		{
		    if (apdata.format == "application/json")
		    {
			ap.prototype.log("before json parse data result", LOG_INFO);
			
			try {
			    var bodyjson = JSON.parse(body);
			}
			catch (e)
			{
			    ap.prototype.log("json parse failed", LOG_ERROR);
			    if (apdata.error != null)
				apdata.error({mess: LOG_MESS_BODY_JSON_PARSE, data: e});
			}

			if (bodyjson != null)
			{
			    ap.prototype.log("before callback success", LOG_INFO);
			    if (apdata.success != null)
				apdata.success(bodyjson);
			}
		    }
		    else
		    {
			ap.prototype.log("before callback success", LOG_INFO);
			if (apdata.success != null)
			    apdata.success(body);
		    }
		}


		
	    });

	    res.on('error', function (e) {
		ap.prototype.log("result error :", LOG_ERROR);
		ap.prototype.log(e, LOG_ERROR);
		if (apdata.error != null)
		    apdata.error({mess:LOG_MESS_RES_ERROR, data: e});
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
	    ap.prototype.log("request error :", LOG_ERROR);
	    ap.prototype.log(e, LOG_ERROR);
	    if (apdata.error != null)
		apdata.error({mess: LOG_MESS_REQ_ERROR, data: e});
	});
	
	req.end();

	ap.prototype.log("request end done", LOG_DEBUG);
	
    }

    ap.prototype.request = function (action, options, success, error)
    {
	
	if (typeof action == "undefined" || action == null)
	{
	    ap.prototype.log(LOG_MESS_ACTION_EMPTY, LOG_ERROR);
	    if (typeof error == "function" && error != null)
		error({mess: LOG_MESS_ACTION_EMPTY});
	    return;
	}
	
	var apdata = {
	    action: action !== undefined ? action : null,
	    time: Math.round(new Date().getTime()/1000),
	    success: success,
	    error: error
	};

	if (typeof success == "function")
	{
	    apdata.success = success;
	}
	else
	{
	    apdata.success = null;
	    ap.prototype.log("no success callback", LOG_INFO);
	}

	if (typeof error == "function")
	{
	    apdata.error = error;
	}
	else
	{
	    apdata.error = null;
	    ap.prototype.log("no error callback", LOG_INFO);
	}
	
	if (typeof options != "undefined" && options != null)
	{
	    apdata.method = options.method !== undefined ? options.method : "GET";
	    apdata.deviceuid = options.deviceuid !== undefined ? options.deviceuid : DEFAULT_DEVICEUID;
	    apdata.lang = options.lang !== undefined ? options.lang : DEFAULT_LANG;
	    apdata.format = options.format !== undefined ? options.format : DEFAULT_FORMAT;
	    apdata.appversion = options.appversion !== undefined ? options.appversion : DEFAULT_APPVERSION;
	    apdata.post_data = options.post_data !== undefined ? options.post_data : null;
	}
	else
	{
	    apdata.method = "GET";
	    apdata.deviceuid = DEFAULT_DEVICEUID;
	    apdata.lang = DEFAULT_LANG;
	    apdata.format = DEFAULT_FORMAT;
	    apdata.appversion =DEFAULT_APPVERSION;
	    apdata.post_data = null;
	}

	if (apdata.post_data != null)
	{
	    apdata.method = "POST";
	}

	if (confset == false)
	{
	    ap.prototype.getconf(apdata);
	}
	else
	    ap.prototype.prepreq(apdata);
	
    }

    return new ap(apconfig);
    
}
