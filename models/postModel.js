var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PostSchema = new Schema({
    caption: { type: String, required: true },
    fileName: { type: String, required: true },
    dateAdded: { type: Date, default: Date.now() },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    album: {
        albumId: { type: String },
        albumName: { type: String },
        isPrivate: { type: Boolean }
    },
    comments: [{
        commenterName: String,
        commenterEmail: String,
        message: String,
        commentDate: { type: Date, default: Date.now() }
    }]
});

const Post = mongoose.model('posts', PostSchema);

function addPost(caption, fileName, album, userEmail, userName, callback) {
    let newPost = new Post();
    newPost.caption = caption;
    newPost.fileName = fileName;
    newPost.dateAdded = new Date();
    newPost.userEmail = userEmail;
    newPost.userName = userName;
    newPost.album.albumId = album.albumId;
    newPost.album.albumName = album.albumName;
    newPost.album.isPrivate = album.isPrivate;
    newPost.comments = [];
    newPost.save(function (err, post) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, post);
        }
    });

}

function getWorldPosts(userEmail, callback) {
    Post.find({ "album": { "isPrivate": false } }).exec(function (err, albums) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, albums);
        }
    });
}

function getPostsForAlbumId(albumId, callback) {
    Post.find({ "album.albumId": albumId }).sort({ 'dateAdded': 'desc' }).exec(function (err, posts) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, posts);
        }
    });
}

function addCommentToPost(postId, userName, userEmail, newComment, callback) {
    Post.findOne({ "_id": postId }).exec(function (err, post) {
        if (err) {
            callback(err, null);
        }
        else {
            let newCommentObj = {
                commenterName: userName,
                commenterEmail: userEmail,
                message: newComment,
                commentDate: new Date()
            };
            post.comments = [newCommentObj, ...post.comments];
            post.save(function (err, newpost) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, newpost);
                }
            });
        }
    });
}

function getPostForPostId(postId, callback) {
    Post.findOne({ "_id": postId }).exec(function (err, post) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, post);
        }
    });
}

function getWorldPosts(userFollows, callback) {
    Post.find({ $and: [{ "userEmail": { $in: userFollows } }, { "album.isPrivate": false }] }).sort({ 'dateAdded': 'desc' }).exec(function (err, posts) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, posts);
        }
    });
}




module.exports = { addPost, getPostsForAlbumId, getPostForPostId, addCommentToPost, getWorldPosts };