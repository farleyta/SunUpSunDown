var sunupsundown = (function () {

    var firstLight, // 30 mins prior to sunrise
        sunUp, // sunrise
        sunDown, // sunset
        lastLight; // 30 mins after sunset

    // Use Geolcation to grab user's lat/lng
    function getLatLng(){
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    }

    // Callback function if there is an error grabbing the Geolocation
    function geoError(){
        console.log("Sorry, your current location cannot be found.");
    }

    // Callback function for when location is successfully received
    function geoSuccess(location) {
        var loc = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
        };
        // Create and dispatch a custom event for location being reported
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent("locationReported", true, true, loc);
        window.dispatchEvent(evt);
    }

    // Build and return a URL for the AJAX request
    function buildXHR(lat,lng) {
        var currentDate = new Date(),
            day = currentDate.getDate(),
            mon = currentDate.getMonth(),
            utcOffset = createOffset(currentDate);

        // Construct the Earthtools URL - note that utcOffset will differ 
        // depending on DST, so we always set the final field to 0 (false)
        return "http://www.earthtools.org/sun/" + lat + "/" + lng + "/" + day + "/" + mon + "/" + utcOffset + "/0";
    }

    // Create the UTC offset from a given JS timezoneOffset value
    function createOffset(date) {
        var sign = (date.getTimezoneOffset() > 0) ? "-" : "";
        return sign + Math.floor( Math.abs(date.getTimezoneOffset()) / 60);
    }

    // Get the data from EarthTools
    function getSunUpSunDown(urlToFetch) {

        // Unfortunately, EarthTools does not implement a CORS Access-Control-Allow-Origin,
        // and they only return data as XML, so no possibility of using JSONP to
        // get around cross-domain issues.  Hence the ugly YQL dependency.
        
        var urlForYQL = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'" + encodeURIComponent(urlToFetch) + "'&format=json";

        request = new XMLHttpRequest();
        request.open('GET', urlForYQL, true);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400){
                // Success!
                data = JSON.parse(request.responseText);

                // Set the sunrise and first light times
                sunUp = formatSunObjTime( data.query.results.sun.morning.sunrise, data.query.results.sun.date );
                firstLight = getOffsetTime(sunUp, -30);

                // And the sunset and last light times
                sunDown = formatSunObjTime( data.query.results.sun.evening.sunset, data.query.results.sun.date );
                lastLight = getOffsetTime(sunDown, 30);

            } else {
                console.log("Sorry, the EarthTools service returned an error: " + request.status);
            }
        };

        request.onerror = function() {
            console.log("Sorry, there was an error establishing a connection to the EarthTools service.");
        };

        request.send();
    }

    // This takes the messy sun object returned by EarthTools and returns a Date()
    // sunObj = sunrise or sunset
    function formatSunObjTime(sunObj, sunObjDate) {
        // get the pieces of the Date obj from the sun obj
        var time = sunObj,
            day = sunObjDate.day,
            mon = sunObjDate.month,
            // we don't have the year from sunObj, so assume it is the current year
            year = new Date().getFullYear(),
            formattedDate = year + "-" + mon + "-" + day;

            sunObjTime = new Date(formattedDate + " " + time); // ie "1970-01-01 12:00:00"

        return sunObjTime;
    }

    // This returns a date obj representing time time offset by the offset param
    function getOffsetTime(firstTime, offset) {
        var newTime = new Date(firstTime);

        // Change the mins to be earlier than sunrise
        newTime.setMinutes(firstTime.getMinutes() + offset);

        return newTime;

    }

    
    // first, use the Geolocation API to get the Lat/Lng
    getLatLng();

    // Listen for when the Lat/Lng has been returned, then build the URL
    window.addEventListener("locationReported", function(evt) {
        var urlToFetch = buildXHR(evt.detail.lat, evt.detail.lng);
        getSunUpSunDown(urlToFetch);
    }, false);

}());