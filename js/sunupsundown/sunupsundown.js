var sunupsundown = (function () {

    // Use Geolcation to grab user's lat/lng
    function getLatLng(){
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
    }

    function geoError(){
        console.log("Sorry, your current location cannot be found.");
    }

    function geoSuccess(location) {
        var latitude  = location.coords.latitude;
        var longitude = location.coords.longitude;

        console.log("Your current location is: " + latitude + " and " + longitude);
    }

    getLatLng();

}());