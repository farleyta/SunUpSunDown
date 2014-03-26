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
        return "http://www.earthtools.org/sun/" + lat + "/" + lng + "/4/12/-5/0";
    }
    
    // first, use the Geolocation API to get the Lat/Lng
    getLatLng();

    // Listen for when the Lat/Lng has been returned, then build the URL
    window.addEventListener("locationReported", function(evt) {
        console.log( buildXHR(evt.detail.lat, evt.detail.lng) );
    }, false);

}());