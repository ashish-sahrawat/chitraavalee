const postModel = require('../models/postModel');
const albumModel = require('../models/albumModel');
const userModel = require('../models/usermodel');
const multer = require('multer');
var path = require('path')

var upload = multer({ dest: 'uploads/' });

function makeJSONResponse(responseCode, response) {
    let r = { code: responseCode, response: response };
    return JSON.stringify(r);
}

/**
 * 201 - error while finding posts
 * 202 - unable to create post
 * 203 - unable to update post
 */
function postController(app, verifyToken) {
    app.get('/api/posts/:albumId', verifyToken, function (req, res) {

        postModel.getPostsForAlbumId(req.params.albumId, function (err, posts) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(201, err));
            }
            else {
                res.send(makeJSONResponse(0, posts));
            }

        });
    });

    app.get('/postimage/:imageId', function (req, res) {

        let imageId = req.params.imageId;
        let imagePath = `${__dirname}/../uploads/${imageId}`;
        res.sendFile(path.resolve(imagePath));
    });

    app.post('/api/post/comment', verifyToken, function (req, res) {

        let postId = req.body.postId;
        let newcomment = req.body.comment;
        let userEmail = req.user.userEmail;
        let userName = req.user.userName;
        postModel.addCommentToPost(postId, userName, userEmail, newcomment, function (err, post) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(203, err));
            }
            else {
                res.send(makeJSONResponse(0, post));
            }
        });
    });

    app.post('/api/post', verifyToken, upload.single('postImage'), function (req, res) {

        console.log(req.body);
        let caption = req.body.caption;
        let fileName = req.file.filename;
        let albumId = req.body.albumId;
        let userEmail = req.user.userEmail;
        let userName = req.user.userName;
        if (!albumId) {
            res.end(makeJSONResponse(201, 'invalid album'));
            return;
        }

        albumModel.getAlbumForId(albumId, function (err, album) {
            if (err || !album) {
                console.log(err);
                res.end(makeJSONResponse(301, err));
                return;
            }
            let postAlbum = {};
            postAlbum.albumId = album._id;
            postAlbum.albumName = album.name;
            postAlbum.isPrivate = album.isPrivate;
            postModel.addPost(caption, fileName, postAlbum, userEmail, userName, function (err, post) {
                if (err) {
                    console.log(err);
                    res.end(makeJSONResponse(202, err));
                    return;
                }
                res.send(makeJSONResponse(0, post));
            });
        });
    });

    app.get('/api/worldPosts', verifyToken, (req, res) => {
        userModel.findUserForEmail(req.user.userEmail, function (err, user) {
            if (err) {
                console.log(err);
                res.send(makeJSONResponse(101, err))
            }
            else {
                let userFollows = user.follows;
                postModel.getWorldPosts(userFollows, function (err, posts) {
                    if (err) {
                        console.log(err);
                        res.send(makeJSONResponse(201, err))
                    }
                    else {
                        res.send(makeJSONResponse(0, posts));
                    }
                });
            }
        });
    });


}

module.exports = { postController };