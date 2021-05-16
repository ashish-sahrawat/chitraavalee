var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AlbumSchema = new Schema({
    name: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    dateAdded: { type: Date, default: new Date() },
    userEmail: String
});

const Album = mongoose.model('albums', AlbumSchema);

function addAlbum(albumName, isPrivate, userEmail, callback) {
    let newAlbum = new Album();
    newAlbum.name = albumName;
    newAlbum.isPrivate = isPrivate;
    newAlbum.dateAdded = new Date();
    newAlbum.userEmail = userEmail;
    newAlbum.save(function (err, album) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, album);
        }
    });

}

function getAlbumsForUserEmail(userEmail, callback) {
    Album.find({ "userEmail": userEmail }).sort({ 'dateAdded': 'desc' }).exec(function (err, albums) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, albums);
        }
    });
}

function getAlbumForId(albumId, callback) {
    Album.findOne({ "_id": albumId }).exec(function (err, album) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, album);
        }
    });
}

function updateAlbumForId(albumId, newAlbumName, isPrivate, callback) {
    Album.findOne({ "_id": albumId }).exec(function (err, album) {
        if (err) {
            callback(err, null);
        }
        else {
            album.name = newAlbumName;
            album.isPrivate = isPrivate;
            album.save(function (err, newAlbum) {
                if (err) {
                    callback(err, null);
                }
                else {
                    callback(null, newAlbum);
                }
            })
        }
    });
}



module.exports = { addAlbum, getAlbumsForUserEmail, getAlbumForId, updateAlbumForId };