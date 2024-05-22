"use strict";

var ObjectId = require('mongodb').ObjectId;
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const processFormBody = multer({ storage: multer.memoryStorage() }).single('uploadedphoto');
var MongoStore = require('connect-mongo')(session);
const fs = require("fs");
var express = require('express');
var app = express();
var async = require('async');

var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

app.use(express.static(__dirname));
app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(bodyParser.json());

function hasSessionRecord(request, response, next) {
    if (request.session.userIdRecord) {
        next();
    } else {
        response.status(401).json({ message: 'Unauthorized' });
    }
}

app.post('/user', (request, response) => {
    const newUser = request.body;
    if (!(newUser.first_name && newUser.last_name && newUser.password)) {
        response.status(400).json({ message: "The first_name, last_name, and password must be non-empty strings" });
        return;
    }

    User.findOne({ login_name: newUser.login_name })
        .then(user => {
            if (!user) {
                User.create(newUser)
                    .then(() => {
                        console.log("New User created in the DB");
                        response.status(200).json({ message: "User created successfully!" });
                    })
                    .catch(e => {
                        console.log("Error creating new user ", e);
                        response.status(500).json({ message: "Error creating user" });
                    });
            } else {
                response.status(400).json({ message: "The login name already exists, please choose a different login name" });
            }
        })
        .catch(error => {
            response.status(500).json({ message: "Other error occurred" });
        });
});

app.post('/photos/new', hasSessionRecord, (request, response) => {
    processFormBody(request, response, err => {
        if (err || !request.file) {
            console.log("Error in processing photo received from request", err);
            response.status(400).json({ message: 'Error processing photo' });
            return;
        }

        if (request.file.size === 0) {
            response.status(400).json({ message: 'Error: Uploaded photo is empty' });
            return;
        }

        const timestamp = new Date().valueOf();
        const filename = 'U' + String(timestamp) + request.file.originalname;
        fs.writeFile(`./images/${filename}`, request.file.buffer, function (error) {
            if (error) {
                console.log("Error during photo data writing into the images directory: ", error);
                response.status(500).json({ message: 'Error writing photo to file system' });
                return;
            }
        });

        Photo.create({
            file_name: filename,
            date_time: timestamp,
            user_id: request.session.userIdRecord
        })
            .then(() => {
                console.log(`** Server: photo saved in the DB **`);
                response.status(200).send();
            })
            .catch(e => {
                console.log(`** Error during photo saving into the DB: ${e} **`);
                response.status(500).json({ message: 'Error saving photo to database' });
            });
    });
});

app.post('/commentsOfPhoto/:photo_id', hasSessionRecord, (request, response) => {
    const commentText = request.body.comment;
    if (Object.keys(commentText).length === 0) {
        response.status(400).json({ message: "Status 400: empty comment is not allowed" });
        return;
    }

    Photo.findOne({ _id: new ObjectId(request.params.photo_id) })
        .then(photo => {
            if (!photo) {
                response.status(400).json({ message: "Status: 400, Photo not found" });
            } else {
                const commentObj = {
                    comment: commentText,
                    date_time: new Date().toISOString(),
                    user_id: request.session.userIdRecord
                };
                if (!photo.comments) photo.comments = [commentObj];
                else photo.comments.push(commentObj);
                photo.save();
                response.status(200).send();
            }
        })
        .catch(error => {
            response.status(500).json({ message: "Other error occurred" });
        });
});

app.post('/admin/login', (request, response) => {
    User.findOne({ login_name: request.body.login_name })
        .then(user => {
            if (!user) {
                response.status(400).json({ message: `Login name "${request.body.login_name}" does not exist, please try again` });
            } else if (user.password !== request.body.password) {
                response.status(400).json({ message: `Password is not correct, please try again` });
            } else {
                const userObj = JSON.parse(JSON.stringify(user));
                request.session.userIdRecord = userObj._id;
                response.status(200).json({ first_name: userObj.first_name, _id: userObj._id });
            }
        })
        .catch(error => {
            response.status(500).json({ message: "Other error occurred" });
        });
});

app.post('/admin/logout', (request, response) => {
    if (!request.session.userIdRecord) {
        response.status(400).json({ message: "User is not logged in" });
    } else {
        request.session.destroy(err => {
            if (err) {
                response.status(500).send();
            } else {
                response.status(200).send();
            }
        });
    }
});

app.get('/', hasSessionRecord, function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

app.get('/test/:p1', hasSessionRecord, function (request, response) {
    var param = request.params.p1 || 'info';

    if (param === 'info') {
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                response.status(500).send('Missing SchemaInfo');
                return;
            }
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        var collections = [
            { name: 'user', collection: User },
            { name: 'photo', collection: Photo },
            { name: 'schemaInfo', collection: SchemaInfo }
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));
            }
        });
    } else {
        response.status(400).send('Bad param ' + param);
    }
});

app.get('/user/list', hasSessionRecord, function (request, response) {
    User.find({}, function (err, users) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
        } else {
            const userList = JSON.parse(JSON.stringify(users));
            const newUsers = userList.map(user => {
                const { first_name, last_name, _id } = user;
                return { first_name, last_name, _id };
            });
            response.status(200).json(newUsers);
        }
    });
});

app.get('/user/:id', hasSessionRecord, function (request, response) {
    const id = request.params.id;
    User.findOne({ _id: id })
        .then(user => {
            if (!user) {
                response.status(400).json({ message: `User ${id}: Not Found!` });
            } else {
                const userObj = JSON.parse(JSON.stringify(user));
                delete userObj.__v;
                response.status(200).json(userObj);
            }
        })
        .catch(error => {
            response.status(500).json({ message: error.message });
        });
});

app.get('/photosOfUser/:id', hasSessionRecord, function (request, response) {
    var id = request.params.id;
    Photo.find({ user_id: id }, (err, photos) => {
        if (err) {
            response.status(400).json({ message: `Photos for user with id ${id}: Not Found` });
        } else {
            let count = 0;
            const photoList = JSON.parse(JSON.stringify(photos));

            photoList.forEach(photo => {
                delete photo.__v;

                async.eachOf(photo.comments, (comment, index, callback) => {
                    User.findOne({ _id: comment.user_id }, (error, user) => {
                        if (!error) {
                            const userObj = JSON.parse(JSON.stringify(user));
                            const { location, description, occupation, __v, ...rest } = userObj;
                            photo.comments[index].user = rest;
                            delete photo.comments[index].user_id;
                        }
                        callback(error);
                    });
                }, error => {
                    count += 1;
                    if (error) {
                        response.status(400).json({ message: "Error occurred in finding comments under a photo" });
                    } else if (count === photoList.length) {
                        response.status(200).json(photoList);
                    }
                });
            });
        }
    });
});

var server = app.listen(3000, () => {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});
