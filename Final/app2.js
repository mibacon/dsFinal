var express = require('express'),
    app = express();
var fs = require('fs');
var moment = require('moment-timezone')

// Postgres
const { Pool } = require('pg');
var db_credentials = new Object();
db_credentials.user = 'mibacon';
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'sensor';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;


var collName = 'meetings';

// Connection URL
var url = process.env.ATLAS;


// HTML wrappers for AA data
var index1 = fs.readFileSync("./index1.txt");
var index3 = fs.readFileSync("./index3.txt");



app.use(express.static('public'));
app.use('/test', express.static('test'));

app.get('/sensor', function (req, res) {
    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query
    var q = `SELECT EXTRACT(MONTH FROM datatime AT TIME ZONE 'America/New_York') as sensormonth,
	     EXTRACT(DAY FROM datatime AT TIME ZONE 'America/New_York') as sensorday,
             EXTRACT(HOUR FROM datatime AT TIME ZONE 'America/New_York') as sensorhour,
             count(*) as num_obs,
             avg(temp) as avg_temp,
             avg(fsr) as avg_fsr,
	     max(datatime) as time 
             FROM sensordata
             GROUP BY sensormonth, sensorday, sensorhour;`;             

    client.connect();
    client.query(q, (qerr, qres) => {
        res.send(qres.rows);
        console.log('responded to request');
    });
    client.end();
});

// Retrieve
var MongoClient = require('mongodb').MongoClient;

app.get('/aa', function (req, res) {

    MongoClient.connect(url, function (err, db) {
        if (err) { return console.dir(err); }

        var dateTimeNow = new Date();
       // var today = dateTimeNow.getDay();
        var today= moment.tz(new Date(), "America/New_York").days();
	console.log('day is ' + today )
        var tomorrow;
        if (today == 6) { tomorrow = 0; }
        else { tomorrow = today + 1 }
        //var hour = dateTimeNow.getHours();
        var hour = moment.tz(new Date(), "America/New_York").hours();
	console.log('hour is ' + hour)
        

        var collection = db.collection(collName);


        collection.aggregate([

                { $unwind: "$events" },
                {
                    $project: {
                        branch: 1,
                        name: 1,
                        address_details: 1,
                        events: 1,
                        meeting_details: 1,
                        latLong: 1,
                        address: 1,
                        timeMore: {
                            $gte: ["$events.beginTimeMoment", hour]
                        },
                        timeLess: {
                            $lte: ["$events.beginTimeMoment", hour]
                        }
                    }
        },

                {
                    $match: {
                        $or: [{
                                $and: [{ "events.day": today }, { "timeMore": true }]
                        },

                            {
                                $and: [{ "events.day": tomorrow }, { "timeLess": true }]

                    }]
                    }

                            },
		//group by meeting Name
                {
                    $group: {
                        _id: {
                            latLong: "$latLong",
                            meetingName: "$name",
                            meetingAddress: "$address",
                            addressDetails: "$address_details"

                       },
                       // this is mine
                       meetingTimes: {
                          $push: {
                           "Day": "$events.weekDay",
                           "BeginTime": "$events.beginTime",
                           "MeetingType": "$events.meetingType"
                          }
                       }
			
                        //this is arron's
                      // meetingDay: { $push: "$events.weekDay" },
                      // meetingStartTime: { $push: "$events.beginTime" },
                      // meetingType: { $push: "$events.meetingType" }
                    }
                        },



                        // group meeting groups by latLong
                {
                    $group: {
                        _id: {
                            latLong: "$_id.latLong"
                        },
                        //this is mine:
                          meetingGroups: { $push: { groupInfo: "$_id", meetingDay: "$meetingTimes" } }
                        //this is aaron's
                       // meetingGroups: { $push: { groupInfo: "$_id", meetingDay: "$meetingDay", meetingStartTime: "$meetingStartTime", meetingType: "$meetingType" } }
                    }
                        }
                        ])

            .toArray(function (err, docs) {
                if (err) { console.log(err) }

                else {
                    fs.writeFileSync('result.JSON', JSON.stringify(docs, null, 4))
                    res.writeHead(200, { 'content-type': 'text/html' });
                    res.write(index1);
                    res.write(JSON.stringify(docs));
                    res.end(index3);
                }


                db.close();

            })

    }); //MongoClient.connect
})

// app.listen(process.env.PORT, function() {
app.listen(3000, function () {
    console.log('Server listening...');
});

