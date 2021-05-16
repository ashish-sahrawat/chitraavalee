const userModel = require('../models/usermodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
var path = require('path')

var upload = multer({ dest: 'profile/' });

function makeJSONResponse(responseCode, response) {
    let r = { code: responseCode, response: response };
    return JSON.stringify(r);
}

function userController(app, verifyToken) {

    /**
     * 101 - error while finding user
     * 102 - user not found
     * 103 - wrong password
     * 106 - error while creating user
     * 108 - unable to update users
     */
    app.post('/api/login', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;


        userModel.findUserForEmail(email, function (err, user) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(101, err));
            }
            else {

                if (user) {

                    bcrypt.compare(password, user.password, function (err, isSame) {
                        if (err) {
                            console.log(err);
                            res.end(makeJSONResponse(104, 'Error while comparing passwords.'));
                        }
                        else if (isSame) {
                            jwt.sign({ userName: user.name, userEmail: user.email }, 'melody', function (err, token) {
                                if (err) {
                                    console.log(err);
                                    res.end(makeJSONResponse(105, 'Error while signing token.'));
                                }
                                else {
                                    let loginResponse = {
                                        userName: user.name, userEmail: user.email, token: token, follows: user.follows
                                    }
                                    res.end(makeJSONResponse(0, loginResponse));
                                }
                            });
                        }
                        else {
                            console.log('Wrong password');
                            res.end(makeJSONResponse(103, 'Wrong password'));
                        }
                    });
                }
                else {
                    console.log('user not found');
                    res.end(makeJSONResponse(102, 'user not found'));
                }
            }

        });


    });
    app.post('/api/register', function (req, res) {
        var email = req.body.email;
        var password = req.body.password;
        var userName = req.body.name;


        bcrypt.hash(password, 10, function (err, hashString) {
            if (!err) {
                userModel.createUser(userName, email, hashString, function (err, user) {
                    if (err) {
                        console.log(err);
                        res.end(makeJSONResponse(106, err));
                    }
                    else {
                        res.send(makeJSONResponse(0, user));
                    }
                });
            }
            else {
                console.log(err);
                res.end(makeJSONResponse(107, err));
            }
        });



    });


    app.get('/api/users', verifyToken, function (req, res) {
        let search = req.query['search'];
        userModel.findUsers(search, function (err, users) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(101, err));
            }
            else {
                res.send(makeJSONResponse(0, users));
            }
        });
    });

    app.post('/api/users/follow', verifyToken, function (req, res) {
        var currentUserEmail = req.user.userEmail;
        var emailToFollow = req.body.emailToFollow;
        userModel.followUser(currentUserEmail, emailToFollow, function (err, users) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(108, err));
            }
            else {
                res.send(makeJSONResponse(0, users));
            }
        });
    });

    app.post('/api/users/unfollow', verifyToken, function (req, res) {
        var currentUserEmail = req.user.userEmail;
        var emailToUnFollow = req.body.emailToUnFollow;
        userModel.unfollowUser(currentUserEmail, emailToUnFollow, function (err, users) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(108, err));
            }
            else {
                res.send(makeJSONResponse(0, users));
            }
        });
    });

    app.get('/api/user/:userEmail', verifyToken, function (req, res) {
        var userEmail = req.params.userEmail;
        userModel.findUserForEmail(userEmail, function (err, users) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(108, err));
            }
            else {
                res.send(makeJSONResponse(0, users));
            }
        });
    });

    app.post('/api/user/profile', verifyToken, upload.single('userImage'), function (req, res) {

        let fileName = req.file.filename;
        let userEmail = req.user.userEmail;

        userModel.updatePhoto(userEmail, fileName, function (err, user) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(108, err));
            }
            else {
                res.send(makeJSONResponse(0, user));
            }
        });
    });

    app.get('/userimage/:imageId', function (req, res) {

        let imageId = req.params.imageId;
        let imagePath = `${__dirname}/../profile/${imageId}`;
        res.sendFile(path.resolve(imagePath));
    });

}

module.exports = { userController };