var express = require('express');

var app = express();
app.use(app.router);

app.all('/user/:action/:id?', function (req, res, next) {
    next();
});

app.all('/user/?:action?', function (req, res, next) {
    res.json({});
});

app.listen(8080, function () {
    console.log('Bare Express Server listening');
});
