
var apnl = require('../index.js')('../ap-config.json');

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
