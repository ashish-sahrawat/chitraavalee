const express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('jsonwebtoken');
const { userController } = require('./controllers/userController');
const { albumController } = require('./controllers/albumController');
const { postController } = require('./controllers/postController');
var mongoose = require('mongoose');


var db = 'mongodb+srv://chitra:vaalee@chitraavalee.irbqd.mongodb.net/chitraavalee?retryWrites=true&w=majority'


mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }, function (error) {
    if (error) {
        console.log(error);
    }
    else {
        console.log('mongodb connected');
    }
});
const app = express();

app.use(cors());
app.use(bodyParser.json())

app.use(express.static('public/'));

function makeJSONResponse(responseCode, response) {
    let r = { code: responseCode, response: response };
    return JSON.stringify(r);
}



const verifyToken = function (req, res, next) {
    const token = req.headers['token'];
    if (!token) {
        console.log('token not found');
        //res.redirect('/login');
        res.end(makeJSONResponse(21, 'no token found'));
        return;
    }
    let tokenArray = token.split(' ');
    if (tokenArray.length != 2) {
        res.end(makeJSONResponse(22, 'invalid token'));
        //res.redirect('/login');
    }
    else {
        let jwtToken = tokenArray[1];
        if (!jwtToken || jwtToken == 'undefined') {
            //res.redirect('/login');
            res.end(makeJSONResponse(22, 'invalid token'));
            return;
        }
        else
            jwt.verify(jwtToken, 'melody', function (err, user) {
                if (!err) {
                    req.user = user;
                    next();
                }
                else {
                    console.log(err);
                    res.end(makeJSONResponse(22, 'invalid token'));
                    //res.redirect('/login');
                }
            });
    }

}

app.get('/test', verifyToken, function (req, res) {
    console.log(req.user);
    res.end(JSON.stringify(req.user));
});

userController(app, verifyToken);
albumController(app, verifyToken);
postController(app, verifyToken);

app.get('/*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

let port = process.env.PORT || 7814;
app.listen(port, function () {
    console.log('ChitraaValee started');
});
