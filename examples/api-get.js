
var apnl = require('../index.js')('../ap-config.json');

//very simple GET request on /test with get parameters foo, value FOO
apnl.request("test?foo=FOO");
