(function () {
    var body = document.getElementsByTagName("body")[0];
    var lazyloadsettingsattribute = body.getAttribute("data-lazyload-breakpoints");
    var lazyloadSettingsArray = new Array();
    var lazyloadsettings;
    if (lazyloadsettingsattribute === null || lazyloadsettingsattribute === "undefined") {
        lazyloadsettingsattribute = "data-src-small:768|data-src-medium:1080|data-src-desktop:5000";//defaults
    }

    lazyloadsettings = lazyloadsettingsattribute.split("|");        
    for (var i = 0; i < lazyloadsettings.length; i++) {
        var breakpoint = new Object();
        var lazyloadsetting = lazyloadsettings[i].split(":");
        breakpoint.width = lazyloadsetting[1] - 0; //subtracting 0 changes value to numeral
        breakpoint.src = lazyloadsetting[0];
        lazyloadSettingsArray.push(breakpoint);
    }
    var bLazy = new Blazy({
        breakpoints: lazyloadSettingsArray,

        success: function (ele) {
            // Image has loaded
            // Do your business here
        }
        , error: function (ele, msg) {
            if (msg === 'missing') {
                // Data-src is missing
                console.log(msg);
            }
            else if (msg === 'invalid') {
                // Data-src is invalid
                console.log(msg);
            }
        }
    });



    document.addEventListener("DOMContentLoaded", function (event) {
        bLazy.load(document.getElementsByClassName('b-lazy'), true);
    });

    if (typeof (jQuery) === 'undefined') {
        return;
    }
    else {
        $('.slick-carousel').on('afterChange', function (event, slick, direction) {
            bLazy.revalidate();
        });
    }

})();

