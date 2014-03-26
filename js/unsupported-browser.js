/***
 *
 * UnsupportedBrowser – a quick JS file that is run when the browser is
 * not supported.  In production, this would be a fuller feature, with a much
 * better UI/UX.  But for now, it works fine...
 * 
 **/
 
var msg = "Sorry, your browser doesn't support the <a href='https://developer.mozilla.org/en-US/docs/Web/API/NavigatorGeolocation.geolocation'>Geolocation API</a>.",
el = document.createElement('div');

el.innerHTML = '<h1>Sorry, you\'re using an unsupported browser.</h1><p>' + msg + '</p>';

document.body.appendChild(el);