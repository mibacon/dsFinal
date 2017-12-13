var fs = require('fs');

var meetings = JSON.parse(fs.readFileSync('./output.txt'));

// Connection URL
// var url = 'mongodb://' + process.env.IP + ':27017/aa';
//var url = process.env.ATLAS;
var url ="mongodb://bacom555:sZygMYOllmGbeGxF@cluster0-shard-00-00-rzdcl.mongodb.net:27017,cluster0-shard-00-01-rzdcl.mongodb.net:27017,cluster0-shard-00-02-rzdcl.mongodb.net:27017/michal?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin"

// Retrieve
var MongoClient = require('mongodb').MongoClient; // npm install mongodb

MongoClient.connect(url, function (err, db) {
    if (err) { return console.dir(err); }

    var collection = db.collection('meetings');

    // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
    collection.insert(meetings);

	fs.writeFileSync('mongo_aggregation_result.JSON', JSON.stringify(meetings, null, 4));

    db.close();

}); //MongoClient.connect
