var mongoFactory = require('mongo-factory');

var connectionStringFrom = 'mongodb://127.0.0.1:27017/noserv';
var connectionStringTo = 'mongodb://127.0.0.1:27017/noservdb';

var bcrypt = require('bcrypt');

mongoFactory.getConnection(connectionStringFrom).then(function(dbFrom) {

    mongoFactory.getConnection(connectionStringTo).then(function(dbTo) {

        var collectionFromApps = dbFrom.collection('apps');
        var collectionToApps = dbTo.collection('apps');

        collectionFromApps.find().toArray(function(err, apps) {

            apps.forEach(function(value) {

                delete value._id;

                collectionToApps.findOne({objectId : value.objectId}, function(err, doc) {

                    if(!doc)
                        collectionToApps.insert(value, function(){});
                });

            });
        });


        var collectionFromUsers = dbFrom.collection('users');

        collectionFromUsers.find().toArray(function(err, users) {

            users.forEach(function(value) {

                delete value._id;
                value._className = '_Users';
                value._appid = value._appid.toHexString();

                if(value.password) {

                    var salt = bcrypt.genSaltSync(10);
                    value.password = bcrypt.hashSync(value.password, salt);
                }


                var collectionToClasses = dbTo.collection(value._appid);

                collectionToClasses.findOne({objectId : value.objectId}, function(err, doc) {

                    if(!doc)
                        collectionToClasses.insert(value, function(){});
                });
            });
        });


        var collectionFromClasses = dbFrom.collection('classes');

        collectionFromClasses.find().toArray(function(err, classes) {

            classes.forEach(function(value) {

                delete value._id;
                value._appid = value._appid.toHexString();

                var collectionToClasses = dbTo.collection(value._appid);

                collectionToClasses.findOne({objectId : value.objectId}, function(err, docClasses) {

                    if(!docClasses) {

                        collectionToClasses.insert(value, function(){});
                    }

                });
            });
        });


    }).fail(function(err) {

        console.log('db connection error', err.message);
    });

}).fail(function(err) {

    console.log('db connection error', err.message);
});