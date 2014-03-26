var sunupsundown = (function () {

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
    
    // first, use the Geolocation API to get the Lat/Lng
    getLatLng();

    // Listen for when the Lat/Lng has been returned, then build the URL
    window.addEventListener("locationReported", function(evt) {
        console.log( buildXHR(evt.detail.lat, evt.detail.lng) );
    }, false);

}());