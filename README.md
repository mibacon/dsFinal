# Data Structures Final Assignments

## Michal Bacon
-----


#### Assignment 1:AA Data
A map of all upcoming AA meetings within the next 24 hours.

Files: 
clean.js - code to pull information from the html files of information, parse the data, look up the address information via Google Maps API and push all information into an output.txt file.
output.txt - all meetings pulled from clean.js into an array of meeting objects.
connect.js - code to push data from output.txt to a mongo db 
app2.js - code to pull data from mongo db, filter/aggregate it according to data we want to present (i.e. meetings within the next 24 hours) and visualize it on a map using Google Maps API.

http://ec2-18-216-149-40.us-east-2.compute.amazonaws.com:3000/aa

#### Assignment 2: Sensor Data
Using the FSR and Temperature sensors assigned to me, I measured the interplay between how hot it is in my apartment and how full the water tank is for my plants (assuming that an empty water tank is lighter than a full one).

I decided to visualize this in two seperate line charts, stacked on top of each other: http://ec2-18-216-149-40.us-east-2.compute.amazonaws.com:3000/test
(a previous version of a dual axis line chart can be found here: http://ec2-18-216-149-40.us-east-2.compute.amazonaws.com:3000)

I decided to collect my infromation once every 5 minutes, as I figured this would capture the nuances of the fluctuations in temperature, especially when the heat goes on for a few minutes only.

Files:
app2.js - code to pull data from my RDS database and push it to http://ec2-18-216-149-40.us-east-2.compute.amazonaws.com:3000/sensor
	this files also includes the code for the app.get to read the static html files with the D3 visulizations 
Public/index.html - the first attempt to create my visualization
Test/index.html - the ultimate version of my visualization


