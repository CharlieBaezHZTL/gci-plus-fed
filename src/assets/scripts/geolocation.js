var googleMapsAPIKey = "";

function removeGciCartCookies() {
    Cookies.remove('gci_cart');
}

function getCurrentTime() {
    var d = new Date();
    var n = d.getTime();
    return n
}

$("a").on('click', function (event) {
    if ($('.checkout-form').is(':visible') && (getBeforeYouGoOrNot()) && $('#CartError').is(':hidden')) {
        if ($(this).data('modalid') != 'BeforeYouGo') {
            event.preventDefault();
            if (!$(this).hasClass('save-cart')) {
                var $target = $(this).attr("href");
                $('.ctatwo a').attr('href', $target);
                $("#BeforeYouGo").modal('toggle');
            }
        }
    }
});

$('#BeforeYouGo .close').click(function () {
    setBeforeYouGoOrNot();
});


function getBeforeYouGoOrNot() {
    var pop = true;
    if (Cookies.get('gci_beforeYouGo')) {
        var json = JSON.parse(Cookies.get('gci_beforeYouGo'));
        pop = json.pop;
    } else {
        pop = true;
    }
    return pop;
}
function setBeforeYouGoOrNot() {
    var d = new Date();
    d.setDate(d.getDate() + 30);
    var json = {};
    json.pop = false;

    Cookies.set('gci_beforeYouGo', json, { expires: d, path: '/' });
}

function getReferenceNumber() {
    var referenceNumber = "";
    if (Cookies.get('gci_cart')) {
        var json = JSON.parse(Cookies.get('gci_cart'));
        if (json.referenceNumber !== undefined) {
            referenceNumber = json.referenceNumber;
        }
    }
    return referenceNumber;
}

function checkReferenceNumber() {
    if (getReferenceNumber() == "") {
        return getCurrentTime();
    } else {
        return getReferenceNumber();
    }
}

function setReferenceNumber(ref) {
    var d = new Date();
    d.setDate(d.getDate() + 30);
    var json = {};

    if (Cookies.get('gci_cart')) {
        json = JSON.parse(Cookies.get('gci_cart'));
    }

    json.referenceNumber = ref;

    Cookies.set('gci_cart', json, { expires: d, path: '/' });
}

function getGeoCity() {
    var geocookies = "";
    if (Cookies.get('gci_geolocation')) {
        var geolocationJSON = JSON.parse(Cookies.get('gci_geolocation'));
        var city = geolocationJSON.city;
        var zip = geolocationJSON.zip;
        var state = geolocationJSON.state;
        var country = geolocationJSON.country;
        geocookies = geolocationJSON.city;
        if (JSON.parse(Cookies.get('gci_geolocation')).city !== "Your Location") {
            $('.location-popup').addClass("active");
            $('.update-location').removeClass("active");
            //$("#UpdateLocationDesktop").attr("style", "display: none!important;");
            //$("#UpdateLocationMobile").attr("style", "display: none!important;");
            //$("#locationSelectorInline").attr("href", "#locationPopup");
            //$("#locationInline").attr("href", "#locationPopup");
            //$("#locationNone").attr("href", "#locationPopup");
        }
        else {
            $('.location-popup').removeClass("active");
            $('.update-location').addClass("active");
            //$("#LocationPopUpDesktop").attr("style", "display: none!important;");
            //$("#ULocationPopUpMobile").attr("style", "display: none!important;");
            //alert("location not set");
            //$("#locationSelectorInline").attr("href", "#updateLocationPopup");
            //$("#locationInline").attr("href", "#updateLocationPopup");
            //$("#locationNone").attr("href", "#updateLocationPopup");
        }
    } else {
        geocookies = "";
        $('.location-popup').addClass("active");
        $('.update-location').removeClass("active");
        //$("#UpdateLocationDesktop").attr("style", "display: none!important;");
        //$("#UpdateLocationMobile").attr("style", "display: none!important;");
        //$("#locationSelectorInline").attr("href", "#updateLocationPopup");
        //$("#locationInline").attr("href", "#updateLocationPopup");
        //$("#locationNone").attr("href", "#updateLocationPopup");
    }
    return geocookies;
}

function showValidCityName(refreshpage) {
    refreshpage = refreshpage || false;
    if (getGeoCity()) {
        $('.geocitytext').text(getGeoCity());
    }

    $('.updateCityMobile').val("");
    $('.updateCityDesk').val("");
    $("#locationUpdated").slideDown('slow');


    if (refreshpage) {
        location.reload();
    }
}

function setLocationToAnchorage() {
    setGeoLocation('99504', 'Anchorage');
}

function setGeoLocation(zip, city, state, country, refreshpage, avail) {
    refreshpage = refreshpage || false;
    state = state || "AK";
    country = country || "USA";
    city = city || "Anchorage";
    var d = new Date();
    d.setDate(d.getDate() + 30);
    var geolocationJSON = {};
    geolocationJSON.city = capitalize(city);
    geolocationJSON.zip = zip;
    geolocationJSON.state = state;
    geolocationJSON.country = country;
    if (avail && avail.length > 0) {
        geolocationJSON.availability = avail;
    }
    else {
        geolocationJSON.availability = [];
    }
    Cookies.set('gci_geolocation', geolocationJSON, { expires: d, path: '/' });
    showValidCityName(refreshpage);
}

function setGeoCookie(zip, city, state, country, refreshpage, avail) {
    refreshpage = refreshpage || false;
    state = state || "AK";
    country = country || "USA";
    var d = new Date();
    d.setDate(d.getDate() + 30);
    var geolocationJSON = {};
    geolocationJSON.city = capitalize(city);
    geolocationJSON.zip = zip;
    geolocationJSON.state = state;
    geolocationJSON.country = country;
    if (avail && avail.length > 0) {
        geolocationJSON.availability = avail;
    }
    else {
        geolocationJSON.availability = [];
    }
    Cookies.set('gci_geolocation', geolocationJSON, { expires: d, path: '/' });
    showValidCityName(refreshpage);
}


function geoFindMe() {
    var output = document.getElementById('locationFailed');

    if (!navigator.geolocation) {
        output.innerHTML = '<p>Geolocation is not supported by your browser</p>';
        $("#locationFailed").slideDown('slow');
    }

    function success(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        try {
            ga('gtm1.send', 'event', 'BrowserLocationEnablement', 'Allow');
        } catch (err) {
            console.log("ga error");
        }
        reverseGeo(latitude, longitude);
    }

    function error() {
        if (error.code == error.PERMISSION_DENIED) {
            // pop up dialog asking for location
            try {
                ga('gtm1.send', 'event', 'BrowserLocationEnablement', 'Block');
            } catch (err) {
                console.log("ga error");
            }
        }
        setGeoCookie('', "Your Location");

    }

    output.innerHTML = '<p>Locating…</p>';
    navigator.geolocation.getCurrentPosition(success, error);
}



function reverseGeo(lat, long) {
    $.get('/AvailabilityAPI/SelfMadeGeocoding?input=' + lat + ',' + long, function (data) {
        if (data == '') {
            console.log("Set location via internal API failed");
        } else {
            var geo = data.split(",");
            var country = "";
            var state = geo[2];
            var city = geo[0];
            var zip = geo[1];
            var re = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;
            if (re.test(city)) {
                LookupLocation(city, true);
                console.log('Set location via internal API');
            }
        }
    }).fail(function () {
        console.log("Set location via internal API failed");
        setLocationToAnchorage();

    });

}




function isValidUSZip(zip) {
    return /^\d{5}(-\d{4})?$/.test(zip);
}

function capitalize(str) {
    return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

function LookupLocation(c, refreshpage) {
    refreshpage = refreshpage || false;
    if (c != '') {

        $.getJSON('/AvailabilityAPI/getGeo?search=' + c, function (json) {
        }).done(function (json) {
            if (json.zip != '' && json.cityName != "") {
                setGeoLocation(json.zip, json.cityName, "AK", "USA", refreshpage, json.availability);
            }
            else {
                GoogleAddressAPI(c, refreshpage);
            }
        }).fail(function(){
            console.log(":>")
            GoogleAddressAPI(c, refreshpage);
        });

    }
    return true;
}

function GoogleAddressAPI(c, refreshpage) {
    refreshpage = refreshpage || false;
    $.getJSON('/AvailabilityAPI/getFullAddress?input=' + c, function (json) {
        try {
            var addressComponents;
            json.results.forEach(function (ac) {
                if (ac.address_components.filter(function (x) { return x.types.indexOf('administrative_area_level_1') >= 0 })[0].short_name === 'AK') {
                    addressComponents = ac.address_components;
                    return;
                }
            });

            if (addressComponents === undefined) {
                addressComponents = json.results[0].address_components;
            }

            var country = addressComponents.filter(function (x) { return x.types.indexOf('country') >= 0 })[0].short_name;
            var city = addressComponents.filter(function (x) { return x.types.indexOf('locality') >= 0 })[0].short_name;
            var state = addressComponents.filter(function (x) { return x.types.indexOf('administrative_area_level_1') >= 0 })[0].short_name;
            var zip = "00000"; // placeholder, we aren't going to use the zip if they're not in our API anyway.

            if (city.length !== 0) {
                setGeoLocation(zip, city, state, country, refreshpage);
            }
        }
        catch (err) {
            //"<p>Plans are not available in your location.</p>"
            $("#locationFailed").html($("#locationFailed").attr("data-plan-not-available-message"));
            $("#locationFailed").slideDown('slow');
        }
    });
}

function notFoundLocationHandle() {
    $("#locationFailed").html($("#locationFailed").attr("data-location-not-found-message"));
    $("#locationFailed").slideDown('slow');
}

function noServiceLocationHandle() {
    $("#locationFailed").html($("#locationFailed").attr("data-plan-not-available-message"));
    $("#locationFailed").slideDown('slow');
}

function requiredLocationHandle() {
    $("#locationFailed").html($("#locationFailed").attr("data-required-message"));
    $("#locationFailed").slideDown('slow');
}

function outOfStateLocationHandle() {
    $("#locationFailed").html($("#locationFailed").attr("data-out-of-state-message"));
    $("#locationFailed").slideDown('slow');
}

$(document).ready(function () {
    googleMapsAPIKey = $("#googleMapsApiKey").val();

    if (typeof Cookies === 'function') {
        if (!Cookies.get('gci_geolocation')) {
            geoFindMe();
        } else {
            showValidCityName();
        }
    } else {
        setLocationToAnchorage();
    }

    //$('.geolocation-utility .geocity').on("click", function (e) {
    //    $("#locationUpdated").slideUp();
    //    $('#locationPopup').addClass('show').css("display", "block");
    //});

    //$('#locationPopup .close').on("click", function (e) {
    //    $('#locationPopup').removeClass('show').css("display", "none");
    //});

    //Autofocus the input field for geolocation header pop out
    $('#locationPopup').on("shown.bs.modal", function () {
        $('.updateCity').focus();
    });

    $(".updateCityDesk").keyup(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $(".updateCityDesk").trigger("blur"); // make sure autocomplete validation has a chance to run first
            $(".btnlocation").click();
        } else {
            $("#locationFailed").slideUp('slow');
        }
    });
    $('.btnlocation').on('click', function (e) {
        var c = $(".updateCityDesk").val();
        if ($(this).hasClass("geomobile")) {
            c = $(".updateCityMobile").val();
        }
        if (c.trim().length < 2) {
            var errorClass = $(".updateCityDesk").attr("data-city-autocomplete-error-class");
            if ($(".updateCityDesk").hasClass(errorClass)) outOfStateLocationHandle();
            else requiredLocationHandle();
            $(".updateCityDesk").trigger("focus");
            $(".updateCityDesk").removeClass(errorClass);
        }
        // TODO: shouldn't these be using the content authored fields?
        else if (c === "99559") {
            var errorMessage = "99559 is shared by Atmautluak, Oscarville, Bethel and Newtok. <br>Please enter the city name."
            $("#locationFailed").html(errorMessage);
            $("#locationFailed").slideDown('slow');
        }
        else if (c === "99603") {
            var errorMessage = "99603 is shared by Homer, Nanwalek and Port Graham. <br>Please enter the city name."
            $("#locationFailed").html(errorMessage);
            $("#locationFailed").slideDown('slow');
        }
        else {
            $("#locationFailed").html("").slideUp('fast');
            LookupLocation(c, true);
            $("#LocationUpdatedConfirmation").modal('show');
            $("#updateLocationPopup").modal('hide');
        }
    });

    $('.btnUpdateLocation').on('click', function (e) {
        // $("#updateLocationPopup").modal('show');
        $("#locationPopup").modal('hide');
    });

    $('.geolcoationheadertext').on('click', function (e) {
        // ShowLocationUpdateModal();
    });

    function ShowLocationUpdateModal() {
        if (JSON.parse(Cookies.get('gci_geolocation')).city === "Your Location") {
            $("#updateLocationPopup").modal('show');
        }
        else {
            $("#locationPopup").modal('show');
        }
    }

    $('.change-location-modal').on('click', function (e) {
        $("#updateLocationPopup").modal('show');
        $('.updateCity').focus();
        $("#locationPopup").modal('hide');
        return false;
    });

    $('.update-location-modal').on('click', function (e) {
        $("#updateLocationPopup").modal('hide');
    });

    $('#LocationUpdatedConfirmation .close-button,  #LocationUpdatedConfirmation a').on('click', function (e) {
        location.reload();
    });

    $('.modal#updateLocationPopup').on('shown.bs.modal', function () {
        setTimeout(function () { $('input.updateCityDesk').focus() }, 100);
    });

    // prevent page scrolling when modal is active because dynamic elements like the autocomplete menu will scroll as well
    $('.modal#updateLocationPopup').on('shown.bs.modal', function () {
        $("body").css("overflow", "hidden");
    });
    $('.modal#updateLocationPopup').on('hidden.bs.modal', function () {
        $("body").css("overflow", "");
    });

    // this is in the geolocation library so it can operate on both checkout and non-checkout city fields
    if ($.ui && typeof $.ui.autocomplete === "function") {
        var cityFields = $("input[data-city-autocomplete=true]");

        var requireListSelection = true; // whether the current business rule requires users to choose from the list or not
        var minLength = 2; // if changing this setting, also update the server-side action

        if (cityFields.length > 0) {
            // allow for multiple independent instances on a single page (e.g. a form page and the sitewide geolocate feature)
            cityFields.each(function (i) {
                var cityField = $(cityFields[i]);

                // get the custom error class if defined
                var errorClass = (cityField.attr("data-city-autocomplete-error-class") ? cityField.attr("data-city-autocomplete-error-class") : "input-validation-error");

                // shared instance response state
                var autoLoaded, autoContent;
                function clearState() {
                    autoLoaded = false;
                    autoContent = [];
                }
                clearState();

                cityField.autocomplete({
                    source: "/AvailabilityAPI/getGeoPartial",
                    minLength: 0, // this is handled below for reset purposes

                    // make sure it's always in front even when in a modal
                    open: function () {
                        $(this).autocomplete('widget').css({ 'z-index': 10000, 'overflow': "hidden auto", 'max-height': "400px" });
                        return false;
                    },

                    // triggered when the field is changed
                    change: function (event, ui) {
                        if (requireListSelection) {
                            // if the list didn't load at all, or they chose an item, allow it
                            var allowVal = ((!autoLoaded || ui.item) && cityField.val().trim().length >= minLength);

                            // if they used browser autofill, allow it (otherwise it may wipe out their fill since the list isn't re-triggered)
                            if (cityField.is("\\:-internal-autofill-selected") || cityField.is("\\:-internal-autofill-previewed")) allowVal = true;

                            // if they entered a matching value but didn't use the list, allow it
                            if (ui.item === null && autoContent.length > 0) {
                                if ($.inArray(cityField.val().trim().toLowerCase(),
                                    $.map(autoContent, function (x) { return x.value.trim().toLowerCase(); })) !== -1) {
                                    allowVal = true;
                                }
                            }

                            // if a whitelist pattern was set and the input fully matches, allow it (e.g. zip code instead of city name)
                            if (cityField.attr("data-city-autocomplete-whitelist")) {
                                var regex = new RegExp(cityField.attr("data-city-autocomplete-whitelist"), 'gi');
                                if (cityField.val().replace(regex, "") === "") allowVal = true;
                            }

                            // prevent any data entry not in the list
                            if (!allowVal) {
                                if (errorClass) cityField.val("").addClass(errorClass);

                                // see whether a custom error function is set
                                if (cityField.attr("data-city-autocomplete-error-function")) {
                                    var thisFn = cityField.attr("data-city-autocomplete-error-function");
                                    if (typeof window[thisFn] === "function") {
                                        window[thisFn]();
                                    }
                                }

                                clearState(); // in case the next entry bypasses search (e.g. autofill), reset it
                            }
                        }
                    },

                    // search started, reset the instance
                    search: function (event, ui) {
                        clearState();
                        if (cityField.val().trim().length < minLength) return false;
                    },

                    // list was loaded, update the instance
                    response: function (event, ui) {
                        autoLoaded = true;
                        autoContent = ui.content;

                        if (errorClass) cityField.removeClass(errorClass);

                        // if enabled, this would prefill the first result
                        //if (ui.content.length > 0) cityField.val(ui.content[0].value);
                    }
                });
            });
        }
    }

});