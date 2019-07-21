var express  = require('express');
var app      = express();
var os       = require('os');
var PORT     = process.env.PORT || 3000;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const config = require('dotenv').config();

var auth = require('./auth');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', express.static('public/'));
app.use(auth());

app.listen(PORT, () => {
    console.log("Starting up http-server. Available on:");
    var ni = os.networkInterfaces();
    for (var i in ni)
        for (var ip in ni[i])
            if (ni[i][ip].family == 'IPv4'){
                let protocol = app.cert? 'https': 'http'
                console.log(`    ${protocol}:\/\/${ni[i][ip].address}:${PORT}`);
                
            }
     console.log("Hit CTRL-C to stop the server");
});
