const albumModel = require('../models/albumModel');

function makeJSONResponse(responseCode, response) {
    let r = { code: responseCode, response: response };
    return JSON.stringify(r);
}

/**
 * 301 - error while finding album
 * 302 - error while creating album
 * 303 - error while updating album
 */
function albumController(app, verifyToken) {
    app.get('/api/album/:id', verifyToken, function (req, res) {
        albumModel.getAlbumForId(req.params['id'], function (err, album) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(301, err));
            }
            else {
                res.send(makeJSONResponse(0, album));
            }

        });
    });
    app.get('/api/albums', verifyToken, function (req, res) {
        let userEmail = req.user.userEmail;
        albumModel.getAlbumsForUserEmail(userEmail, function (err, albums) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(301, err));
            }
            else {
                res.send(makeJSONResponse(0, albums));
            }

        });
    });

    app.post('/api/album', verifyToken, function (req, res) {
        let albumName = req.body.albumName;
        let isPrivate = req.body.isPrivate;
        let userEmail = req.user.userEmail;
        albumModel.addAlbum(albumName, isPrivate, userEmail, function (err, album) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(302, err));
            }
            else {
                res.send(makeJSONResponse(0, album));
            }
        });
    });

    app.put('/api/album/:id', verifyToken, function (req, res) {
        let albumId = req.params.id;
        let albumName = req.body.albumName;
        let isPrivate = req.body.isPrivate;
        albumModel.updateAlbumForId(albumId, albumName, isPrivate, function (err, album) {
            if (err) {
                console.log(err);
                res.end(makeJSONResponse(303, err));
            }
            else {
                res.send(makeJSONResponse(0, album));
            }
        });
    });

}

module.exports = { albumController };