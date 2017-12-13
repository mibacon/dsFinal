var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
var moment = require('moment');

var nums = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']
var meetingsData = [];

var days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
}

//first go through array of numbers
async.eachSeries(nums, function (value, callback) {
        var url = 'http://visualizedata.github.io/datastructures/data/m' + value + '.html';
        //go to html
        console.log('async each round ' + value)
        request(url, function (err, resp, body) {
            var $ = cheerio.load(body);
            //parse data
            if (!err && resp.statusCode == 200) {
                var content = $('tbody tr').filter(function (i, el) {
                    return $(this).attr('style') == 'margin-bottom:10px'
                })
                //for each meeting:
                // .each(function (i, elem) {
                async.eachSeries(content, function (elem, callb) {
                    var thisMeeting = new Object;

                    async.waterfall([
                            function createObj(cb) {
                                thisMeeting.branch = $(elem).find('td').eq(0).contents().eq(1).text().trim()
                                thisMeeting.name = $(elem).find('td').eq(0).contents().eq(4).text().trim()
                                var line1 = $(elem).find('td').eq(0).contents().eq(6).text().trim().split(/\(|,|-/)[0]
                                thisMeeting.line1 = line1.split(". Meeting")[0].replace(/&/g, "") //stupid 06 and 02 zones
				thisMeeting.address_details = $(elem).find('td').eq(0).contents().eq(6).text().trim().split(/\(|,/)[1].replace(/[^a-zA-Z0-9]/g, " ").trim()
                                thisMeeting.events = []
                                thisMeeting.meeting_details = $(elem).find('td').eq(0).find('.detailsBox').text().trim()


                               $(elem).find('td').find(':contains("From")').each(function (i, el) {
                                    var temp = {};
                                    var dayLine = $(el).contents().text().replace('s From', "")
                                    if (dayLine !== "") {

                                        temp.weekDay = dayLine
                                        temp.day = days[temp.weekDay]

                                        $(el).filter(function () {
                                            temp.beginTime = $(this.nextSibling).text().trim();
                                            temp.beginTimeMoment = parseInt(moment(temp.beginTime, "h:mm A").format("H"))
                                        });

                                        $(el).next().filter(function () {
                                            temp.endTime = $(this.nextSibling).text().trim();

                                        })

                                        $(el).next().next().next().filter(function () {
						if ($(this).text() == "Meeting Type") { temp.meetingType = $(this.nextSibling).text().split(/\=/)[1].trim() }
})
                                        $(el).next().next().next().next().next().filter(function () {
                                            temp.meetingSpecial = $(this.nextSibling).text().trim();

                                        })

                                        thisMeeting.events.push(temp);
                                    }
                                }) 

                                var address = thisMeeting.line1;
                                console.log('round: ' + value + ' address: ' + address),
                                    cb(null, address)
                                                },
                                                function getAPI(address, cb) {

                                var apiKey = process.env.GMAKEY
                                var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address.split(' ').join('+') + '+NYC' + '&key=' + apiKey;

                                setTimeout(function () {
                                    request(apiRequest, function (err, resp, body) {
                                        if (err) { console.log(apiRequest) }

                                        thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
                                        thisMeeting.address = JSON.parse(body).results[0].formatted_address;
                                        console.log('round ' + value + ' ' + apiRequest + ' ' + thisMeeting.line1 + JSON.stringify(thisMeeting.latLong))
                                        callb() //callback for async.each
                                    }) //end of request
                                }, 1000) //end of settimeout

                                cb(null, address) //final callback for waterfall

                                //end of api request
                                                }],
                        function (err, address) {
                            if (err) { console.log(err) }
                            meetingsData.push(thisMeeting)
                            console.log('done with parsing ' + address + ' data')

                        }) //end of async waterfall

                }, function (err) {
                    if (err) { console.log(err) }
                    console.log('end of each ' + value)
                    callback() //callback for asynceachseries

                }) //end of async each

                // setTimeout(callback, 2000) //callback for asynceachseries
            } //end of if



        }) //end of request to html


    },
    function (err) {
        if (err) {
            console.log(err)
        }
        console.log('we are done')
        fs.writeFileSync('./output.txt', JSON.stringify(meetingsData))
    })


//

