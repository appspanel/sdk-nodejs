
var apnl = require('../index.js')('../ap-config.json');

//POST request on /test with get parameters foo (value FOO) with POST parameters provided in options document, and callback success and error provided
apnl.request("test?foo=FOO", {post_data: {bar: "BAR"}}, function (data) {
    //success
    console.log("callback success");
    
    console.log(data);
    
    
}, function (error) {
    //error
    console.log("callback error");
    
    console.log(error);
});
