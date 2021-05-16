var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: String,
    follows: [String],
    photo: String
});

const User = mongoose.model('user', UserSchema);

function createUser(userName, userEmail, password, callback) {
    var newUser = new User();
    newUser.name = userName;
    newUser.email = userEmail;
    newUser.password = password;
    newUser.follows = ['nature@chitra.com']
    newUser.save(function (err, user) {
        if (err) {
            console.log(err);
            callback(err, null);
        }
        else {
            callback(null, user);
        }
    });
}

function findUserForEmail(userEmail, callback) {

    User.findOne({ "email": userEmail }).exec(function (err, user) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, user);
        }
    });
}

function findUsers(searchText, callback) {
    let searchquery = {};
    if (searchText) {
        searchquery = { $or: [{ name: new RegExp(searchText, 'i') }, { email: new RegExp(searchText, 'i') }] };
    }

    User.find(searchquery).exec(function (err, users) {
        if (err) {
            callback(err, null);
        }
        else {
            let response = users.map((user) => {
                return { userName: user.name, userEmail: user.email, userFollows: user.follows, userPhoto: user.photo };
            })
            callback(null, response);
        }
    });
}

function followUser(currentUserEmail, emailToFollow, callback) {
    User.findOne({ "email": currentUserEmail }).exec(function (err, user) {
        if (err) {
            callback(err, null);
        }
        else {
            user.follows = [...user.follows, emailToFollow];
            user.save(function (err, user) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, user);
                }
            });
        }
    });
}

function unfollowUser(currentUserEmail, emailToUnFollow, callback) {
    User.findOne({ "email": currentUserEmail }).exec(function (err, user) {
        if (err) {
            callback(err, null);
        }
        else {
            user.follows = user.follows.filter(function (ele) {
                if (ele === emailToUnFollow) {
                    return false;
                }
                else {
                    return true;
                }
            });
            user.save(function (err, user) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, user);
                }
            });
        }
    });
}

function updatePhoto(currentUserEmail, photo, callback) {
    User.findOne({ "email": currentUserEmail }).exec(function (err, user) {
        if (err) {
            callback(err, null);
        }
        else {
            user.photo = photo;
            user.save(function (err, user) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, user);
                }
            });
        }
    });
}

module.exports = { createUser, findUserForEmail, findUsers, followUser, unfollowUser, updatePhoto };