var sunupsundown = (function () {

    var sunInfoEl = '.sun-info',
        firstLight, // 30 mins prior to sunrise
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
                sunData = data.query.results.sun;

                // Set the sunrise and first light times
                sunUp = formatSunObjTime( sunData.morning.sunrise, sunData.date );
                firstLight = getOffsetTime(sunUp, -30);

                // And the sunset and last light times
                sunDown = formatSunObjTime( sunData.evening.sunset, sunData.date );
                lastLight = getOffsetTime(sunDown, 30);

                // Remove the loading class
                toggleLoading();

                // Update the DOM with the new times
                updateDOMTime('first-light', firstLight);
                updateDOMTime('sunrise', sunUp);
                updateDOMTime('sunset', sunDown);
                updateDOMTime('last-light', lastLight);

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

    // Updates the DOM element with the time param
    function updateDOMTime(el, timeObj) {
        var timeEl = document.getElementById(el),
            timeTag = timeEl.getElementsByTagName("time"),
            // a bit of extra work to pad the hours/mins with leading 0 when necessary
            timeHour = (timeObj.getHours()<10?'0':'') + timeObj.getHours(),
            timeMin = (timeObj.getMinutes()<10?'0':'') + timeObj.getMinutes(),
            timeAmPm = timeHour<12?'am':'pm';

        timeTag[0].setAttribute('datetime', timeObj.toISOString());
        timeTag[0].innerHTML = timeHour + ":" + timeMin + "<span class='ampm'>" + timeAmPm + "</span>";
    }

    // Toggles the loading class on the main element
    function toggleLoading() {

        var el = document.querySelectorAll(sunInfoEl)[0],
            className = 'loading';

        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = -1;
            for (var i = classes.length; i--;) {
                if (classes[i] === className)
                    existingIndex = i;
            }

            if (existingIndex >= 0)
                classes.splice(existingIndex, 1);
            else
                classes.push(className);

            el.className = classes.join(' ');
        }
    }

    //–––––––– Get things rolling ––––––––––––//

    // This custom event listens for when the location is received and then fetches
    // the data from EarthTools
    window.addEventListener("locationReported", function(evt) {
        var urlToFetch = buildXHR(evt.detail.lat, evt.detail.lng);
        // getSunUpSunDown(urlToFetch);
    }, false);
    
    // first, use the Geolocation API to get the Lat/Lng – nothing is returned,
    // instead the custom "locationReported" event is triggered when the location
    // is successfully retrieved
    getLatLng();

}());