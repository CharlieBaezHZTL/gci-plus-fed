$(document).ready(function () {
    tvChannelLineup = {
        vars: {
            $LineUpDatasourceID: {},
            $zipInput: {},
            $lineupDefaultLocation: {},
            $lineupNotFoundTag: {},
            $lineupNotFoundMessage: {},
            $lineupResults: {},
            $lineupCurrentLocation: {},
            $defaultZip: {},
            cookieName: "gci_geolocation",
        },
        getCookie: function () {
            var c = $.cookie(tvChannelLineup.vars.cookieName);
            return typeof (c) === 'string' ? c : "";
        },
        init: function () {
            var o = tvChannelLineup,
            v = o.vars;

            v.$LineUpDatasourceID = $("#LineUpDatasourceID");
            v.$defaultZip = $("#LineUpDefaultLocation");
            v.$zipInput = $(".geocitytext");
            v.$lineupResults = $(".channelLineupResults");
            v.$lineupNotFoundMessage = $("#LineUpNotFoundMessage");
            v.$currentLocation = $("#currentLocation");

            // read from cookie first, if it exists
            var c = o.getCookie();

            if (c.length > 0) {
                var geo = JSON.parse(c);
                v.$zipInput.val(geo.city);
                if (geo.city === "Your Location") {
                    v.$zipInput.val(v.$defaultZip.val());
                }
            }
            else {
                v.$zipInput.val(v.$defaultZip.val());
            }

            //Add page elemenet event handlers(handlebar template elements are added at end of LoadLineup funtion)
            $("#searchLineup").on('click', o.SearchLineup);

            v.$zipInput.keydown(function (e) {
                if (e.keyCode == 13) {
                    $("#searchLineup").click();
                }
            });

            o.LoadLineup();
        },
        LoadLineup: function () {
            var o = tvChannelLineup,
            v = o.vars;


            $(".waiting").show();
            $(".channelLineupResults").hide();
            $.ajax({
                type: 'GET',
                url: '/yukonchannelAPI/GetChannelLineup',
                data: {
                    datasourceid: v.$LineUpDatasourceID.val().replace(/{|}/gi, ""),
                    searchTerm: v.$zipInput.val()
                },
                success: function (data) {
                  if (data.Success) {
                        // reset the cookie
                        var c = o.getCookie();
                        if (c.length > 0) {
                            var geo = JSON.parse(c);
                            geo.city = (data.LineUpCurrentLocation) ? data.LineUpCurrentLocation : "";
                            geo.zip = (data.LineUpCurrentZipcode) ? data.LineUpCurrentZipcode : "";
                        }

                        if (data.Channels.length > 0) {
                            for (var i = 0; i < data.Channels.length; i++) {
                                data.Channels[i].AvailabilityString = "";
                                for (var z = 0; z < data.Channels[i].Availibility.length; z++) {
                                    if(data.Channels[i].Availibility[z].HasSD || data.Channels[i].Availibility[z].HasHD)
                                    {
                                        data.Channels[i].AvailabilityString += z + ",";
                                    }
                                }
                                data.Channels[i].AvailabilityString = data.Channels[i].AvailabilityString.replace(/,*$/, "");
                            }
                            
                            var source = $("#details-template").html();
                            var template = Handlebars.compile(source);
                            var dtlHtml = template(data);
                            v.$lineupResults.html(dtlHtml);

                            $("#currentLocation").html(data.LineUpCurrentLocation);
                            $("#currentZip").html(data.LineUpCurrentZipcode);
                            $(".found").show();
                            $(".notFound").hide();
                        } else {
                            v.$lineupResults.html("<p class='NotFound'>" + v.$lineupNotFoundMessage.val() + "</p>")
                            $(".found").hide();
                            $(".notFound").show();
                            $("#unknownLocation").html(data.SearchTerm);
                        }
                        $(".programming-filter ul").html(`<li class="selectable" selected data-order='-999999' data-value="">All</li>`)

                        if (data.Programming.length > 0) {
                          for (var i = 0; i < data.Programming.length; i++) {
                            cur = data.Programming.map(x => x.Name)[i]
                            order = '-1'
                            if (data.Programming.map(x => x.SortOrder)[i] != '') {
                              order = data.Programming.map(x => x.SortOrder)[i]
                            }
                            $(".programming-filter ul").append(`<li class="selectable" data-order=${order} data-value=${cur}>${cur}</li>`)
                          }
                        }
                       
                        $(".programming-filter ul").find('.selectable').sort(function (a, b) {
                          return +a.getAttribute('data-order') - +b.getAttribute('data-order');
                        }).appendTo($(".programming-filter ul"))

                        if (data.Packages.length > 0) {
                            for (var i = 0; i < data.Packages.length; i++) {
                                $(".plan-filter ul").append(`<li class="selectable" data-value=${i}>${data.Packages[i]}</li>`)
                            }
                        }

                        //v.$currentLocation = (data.LineUpCurrentLocation) ? data.LineUpCurrentLocation : "";
                        //$(".geocity").html((data.LineUpCurrentLocation) ? data.LineUpCurrentLocation : "");
                        v.$zipInput.val("");

                        //Adding dropdown select functionality
                        $("#LineupPlans").on('change', o.FilterByPlan);
                        //Adding Print Functionality
                        $("#print").on("click", o.PrintLineup);
                        //Adding Plan Button Functionality
                        $(".planbtn").on('click', o.FilterChannels);
                        
                        $("#searchChannels").on('keyup', o.FilterChannels);
                        
                        $('#network-search').on('keyup', o.FilterYukonChannels);
                        $('.selectable').on('click', o.HandleListClicks);
                        
                        o.SortYukonChannels();
                    }
                    else {
                        console.log(data.Message);
                    }

                    //click the first btn to load css
                    $(".planbtn").first().click()

                    $(".waiting").hide();
                    $(".channelLineupResults").show();

                    //add init alt row coloring 
                    $('.channelLineup tbody tr:visible:odd').css('background', '#f5f5f5');
                    $('.channelLineup tbody tr:visible:even').css('background', '#ffffff');

                    //Load Sort Functionality
                    var table = $("#simpleTable").sortTableJS();

                    table.bind('aftertablesort', function (event, data) {
                        // data.column - the index of the column sorted after a click
                        // data.direction - the sorting direction (either asc or desc)
                        // $(this) - this table object
                        $('.channelLineup tbody tr:visible:odd').css('background', '#f5f5f5');
                        $('.channelLineup tbody tr:visible:even').css('background', '#ffffff');
                    });
                },
                error: function (xhr, textStatus, error) {
                    console.log(xhr.statusText);
                    console.log(textStatus);
                    console.log(error);
                    console.log(data.Message);
                    $("#waiting").hide();
                    $("#channelLineupResults").show();
                }
            });
        },
        FilterChannels: function (e) {
            e.preventDefault();
            //base intvalue of 1st package column
            var $os = $(this);//os = original scope

            //make changes to btn classes
            if ($(this).hasClass('planbtn')) {
                $('.planbtn').each(function () {
                    $this = $(this);
                    $this.removeClass('btn-white selectedPlan').addClass('btn-red');
                });
                $os.addClass("btn-white selectedPlan");
                $os.css("border-color", "#b71234");
            }

            var ii = 4;
            var v = parseInt($('.selectedPlan').attr('data-value'), 10);
            if ($('.channelLineup tbody tr td chanres').length == 0) {
                ii = 2;
            }
            //add value of package index from dll
            var i = ii + v;

            //reset form from base
            $('.channelLineup thead tr th:nth-child(' + (ii - 1) + ')').nextAll("th").removeClass("tdgreyout");//replaced tdhighlight with olblue

            //Reset all body rows
            $('.channelLineup tbody tr').each(function () {
                $this = $(this);
                $this.show();;
                $(this).children('td').each(function () {
                    $(this).removeClass("tdgreyout");
                });
            });
            //filter if all packages option is not selected
            if (v != -1) {
                //grey it all out
                $('.channelLineup thead tr th:nth-child(' + (ii - 1) + ')').nextAll("th").addClass("tdgreyout");
                $('.channelLineup tbody tr td:nth-child(' + (ii - 1) + ')').nextAll("td").addClass("tdgreyout");

                //HeaderHandle highlights
                $('.channelLineup thead tr th:nth-child(' + i + ')').each(function () {
                    $this = $(this);
                    $this.removeClass("tdgreyout");
                });

                //hide rows without selected plan availability
                $('.channelLineup tbody tr td:nth-child(' + i + ')').each(function () {
                    $this = $(this);
                    // Test to see if both the SD column (first TD) and HD column (second TD; i.e., $this.next) is empty
                    if (($this.html().trim() == '') && ($this.next("td").html().trim() == ''))
                        $this.closest("tr").hide();
                    else
                        $this.removeClass("tdgreyout");
                });
            }
            var ss = $('#searchChannels').val().trim().toUpperCase();
            if (ss.length > 0) {
                //hide rows without selected plan availability
                $('.channelLineup tbody tr td:nth-child(1)').each(function () {
                    $this = $(this);
                    if ($(this).text().toUpperCase().indexOf(ss) == -1) {
                        $this.closest("tr").hide();
                    }
                });
            }
            $('.channelLineup tbody tr:visible:odd').css('background', '#f5f5f5');
            $('.channelLineup tbody tr:visible:even').css('background', '#ffffff');
        },
        PrintLineup: function () {
            window.print();
        },
        SearchLineup: function (e) {
            var o = tvChannelLineup,
            v = o.vars;

            e.preventDefault();
            var zip = v.$zipInput.val().trim();
            v.$zipInput.val(zip);
            if (zip.length == 0) {
                alert('Please enter a zip code');
                return;
            }

            if ($.isNumeric(zip[0])) {
                var isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zip);
                if (!isValidZip) {
                    alert('Please enter a valid zip code');
                    return;
                }
            }

            var isScript = /(<script>|<\/script>|%3Cscript%3E|%3C|%3E)/i.test(zip);
            if (isScript) {
                v.$zipInput.val(v.$defaultZip.val());
            }
            LookupLocation(v.$zipInput.val());
            o.LoadLineup();
        },
        FilterYukonChannels: function () {
            var searchText = $('#network-search').val().toLowerCase();
            var channels = document.querySelectorAll('tr[data-channel-name]');
            
            var selectedPlanFilter = $('.plan-filter li[selected]');
            var selectedProgrammingPlanFilter = $('.programming-filter li[selected]');

            for (var i = 0; i < channels.length; i++) {
                var channel = channels[i];
                if (channel.dataset.channelName.toLowerCase().indexOf(searchText) === -1 && channel.dataset.channelNumber.toLowerCase().indexOf(searchText) === -1) {
                    channel.classList.add('hidden');
                } else {
                    if (selectedPlanFilter.length && channel.dataset.channelAvailability.indexOf(selectedPlanFilter.data('value')) === -1) {
                        channel.classList.add('hidden');
                    } else {
                        if (channel.dataset.programming.toLowerCase().indexOf(selectedProgrammingPlanFilter.data("value").toLowerCase()) === -1) {
                            channel.classList.add('hidden');
                        }
                        else {
                            channel.classList.remove('hidden');
                        }
                    }
                }
            }
            
        },
        SortYukonChannels: function () {
            var sortVal = $('.channel-filter li[selected]').data('value') || "index";
            var tb = $('.channel-table table');
            var rows = $('tr[data-channel-name]');
            
            rows.sort(function(a, b) {
                var keyA = $(a).data(sortVal);
                var keyB = $(b).data(sortVal);
                
                if(keyA < keyB) { return -1; }
                if(keyA > keyB) { return 1; }
                return 0;
            });
            
            $.each(rows, function(index, row) {
                tb.append(row);
            });
        },
        HandleListClicks: function(e) {
            var target = $(e.target);
            target.attr("selected", "selected");
            target.parent().siblings('button').html(target.html()).addClass('interacted');
            
            target.siblings().removeAttr("selected")
            tvChannelLineup.FilterYukonChannels();
            tvChannelLineup.SortYukonChannels();
        },
        isPageEditor: function () {
            if (typeof Sitecore == "undefined") {
                return false;
            }
            if (typeof Sitecore.PageModes == "undefined" || Sitecore.PageModes == null) {
                return false;
            }
            return Sitecore.PageModes.PageEditor != null;
        }
    };

    if ($(".gci-channel-lineup").length > 0) {
        var tvChannelLineup;
        if (!tvChannelLineup.isPageEditor()) {
            tvChannelLineup.init();
        }
    }

    Handlebars.registerHelper("createAvailabilityString", function(availability) {
        var availabilityString = "";
        for (var i = 0; i < availability.length; i++) {
            if(availability.HasSD || availability.HasHD)
            {
                availabilityString += i + ",";
            }
        }
        
        return availabilityString.replace(/,*$/, "");
    });
});
function DeletePlanBuilderCookie(cookieName) {
    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// {%22numberOfLines%22:2}
function ReplaceNumOfLinesWithNewCookieValue(cookieName, cookieKey) {
    // Get spans of "num-lines-value"
    var numOfLinesElements = document.getElementsByClassName("num-lines-value");

    // Get full cookie
    var cookieValue = GetCookieWithKey(cookieName, cookieKey);
    if (cookieValue === undefined) {
        cookieValue = "0";}

    for (var e = 0; e < numOfLinesElements.length; e++) {
        numOfLinesElements[e].textContent = cookieValue;
        numOfLinesElements[e].innerHTML = cookieValue;
        numOfLinesElements[e].innerText = cookieValue;
    }
}

function GetCookieWithKey(cookieName, cookieKey) {
    var nameEQ = cookieName + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) {
            var cookieResult = c.substring(nameEQ.length, c.length);

            // Clean cookie value
            var cleanArray = unescape(cookieResult);
            cleanArray = cleanArray.replaceAll("\"", "");
            cleanArray = cleanArray.replaceAll("{", "");
            cleanArray = cleanArray.replaceAll("}", "");

            var strArray = cleanArray.split(",");
            var val = "";

            // Check if key matches
            for (var s = 0; s < strArray.length; s++) {
                var itemArray = strArray[s].split(":");
                if (itemArray[0] != null && itemArray[0] == cookieKey) {
                    val = itemArray[1];
                }
            }

            return val;
        }
    }
}
(function ($) {
    function gciPlusMobileLines() {
        if ($(".plus-mobile-lines .gci-plus-accordion").length) {
            $(".gci-plus-accordion .details").on("click", function () {
                var value = $(this).data("target");
                console.log(value);
                if ($(".collapse").is(value)) {
                    if ($(this).hasClass("rotate-arrow")) {
                        $(this).removeClass("rotate-arrow");
                    } else {
                        $(this).addClass("rotate-arrow");
                    }
                }
            })
        }
    }


    
    
    gciPlusMobileLines();


    $(".selectedOption").siblings(".add-data-title").addClass("match-price-style");
    $(".selectedOption").hide();

    $(".channel-options").each(function () {
        if ($(this).children().length == 0) {
            $(this).hide();
        }
    });

})(jQuery);
(function (window, $) {
    window.GCI = window.GCI || {};
    window.GCI.Sk = window.GCI.Sk || {};
    var sk = window.GCI.Sk;
    var GCICartJs = {
        onLoadEvents: function (e) {
            //if (Cookies.get('MenuCookie') != null) {
            //   var sectionItem = "." + Cookies.get('MenuCookie');
            //   $(sectionItem).addClass("active");
            //   $(sectionItem).next().slideToggle("fast");
            //};
        },
        onClickEvents: function (e) {

        },
        onScrollEvents: function (e) {
            //$(window).scroll(function () {
            //   var offset = 220;
            //   if ($(this).scrollTop() > offset) {
            //       $(".back-to-top").removeClass("not-active");
            //   } else {
            //       $(".back-to-top").addClass("not-active");
            //   }
            //});
        },
        onResize: function (e) {
            //window.onresize = function () {
            //    var offset = 220;
            //    if (($(window).width() < 800) && ($(this).scrollTop() > offset)) {
            //        $(".back-to-top").removeClass("not-active");
            //    }
            //    else {
            //        $(".back-to-top").addClass("not-active");
            //    }
            //};
        },
        onSaveCart: function (e) {
            //window.onresize = function () {
            //    var offset = 220;
            //    if (($(window).width() < 800) && ($(this).scrollTop() > offset)) {
            //        $(".back-to-top").removeClass("not-active");
            //    }
            //    else {
            //        $(".back-to-top").addClass("not-active");
            //    }
            //};
        }
    };
    GCICartJs.onLoadEvents();
    GCICartJs.onClickEvents();
    GCICartJs.onScrollEvents();
    GCICartJs.onResize();
    GCICartJs.onSaveCart();
})(window, jQuery);

function SaveMyCart(controlId) {
    event.preventDefault();
    var control = $('#' + controlId);
    var emailId = control.val();
    var validatorId = control.attr('validator-id');
    var saveCartConfirmationModalId = control.attr('data-success-message-modalid');
    var saveCartParentModalId = control.attr('data-parent-modalid');
    var validationMessageControl = $('#' + validatorId);
    validationMessageControl.css('color', 'red');
    if (emailId.length === 0) {
        control.css('border-color', 'red');
        validationMessageControl.html(control.attr('data-required-error'));
        return false;
    }
    if (!validateEmail(emailId)) {
        control.css('border-color', 'red');
        validationMessageControl.html(control.attr('data-invalid-format-error'));
        return false;
    }
    validationMessageControl.html('');
    control.css('border-color', '');

    var referenceNumber = GetCartIdFromCookie();
    var formData = { CartId: referenceNumber, EmailAddress: emailId };
    $.ajax({
        url: "/api/v1/savedshoppingcartupdate",
        type: "PUT",
        data: formData,
        success: function (data, textStatus, jqXHR) {
            $('#' + saveCartParentModalId).modal('hide');
            $('#' + saveCartConfirmationModalId).modal('show');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            validationMessageControl.html(jqXHR.responseJSON.Message);
        }
    });
}

function RetrieveCart(emailControlId, orderNumberControlId) {
    event.preventDefault();
    var emailControl = $('#' + emailControlId + '');
    var orderNumberControl = $('#' + orderNumberControlId + '');
    var emailFailedMessage = $('#EmailFailedId');
    var orderFailedMessage = $('#OrderFailedId');

    var emailId = emailControl.val();
    var orderNumber = orderNumberControl.val();

    if (emailId.length === 0 && orderNumber.length === 0) {
        emailFailedMessage.html(emailControl.attr('data-required-message'));
        emailControl.css('border-color', 'red');
        emailFailedMessage.slideDown('slow');
        orderFailedMessage.html(orderNumberControl.attr('data-required-message'));
        orderNumberControl.css('border-color', 'red');
        orderFailedMessage.slideDown('slow');
        return false;
    }

    if (emailId.length > 0 && !validateEmail(emailId)) {
        orderFailedMessage.html('');
        orderNumberControl.css('border-color', '');
        emailControl.css('border-color', 'red');
        emailFailedMessage.html(emailControl.attr('data-invalidformat-message'));
        emailFailedMessage.slideDown('slow');
        return false;
    }
    else if (orderNumber.length > 0 && !validateOrderNumber(orderNumber)) {
        emailFailedMessage.html('');
        emailControl.css('border-color', '');
        orderNumberControl.css('border-color', 'red');
        orderFailedMessage.html(orderNumberControl.attr('data-invalidformat-message'));
        orderFailedMessage.slideDown('slow');
        return false;
    }

    orderFailedMessage.html('');
    emailFailedMessage.html('');
    emailControl.css('border-color', '');
    orderNumberControl.css('border-color', '');

    var formData = "";
    var apiUrl = "/api/v1/retrieveshoppingcart";

    if (emailId.length > 0) {
       formData = emailId;
    }
    else {
      formData = orderNumber;
        apiUrl = "/api/v1/shoppingcart";
    }

    $.ajax({
        url: apiUrl + "?CartId=" + formData,
        type: "get",
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        success: function (data) {

            var referenceNumber = "";
            $.each(data, function (key, val) {
               referenceNumber = val.ReferenceNumber;
            });

            if (referenceNumber === "") {
                //Show the error screen
                if (emailId.length > 0) {
                    orderFailedMessage.html('');
                    orderNumberControl.css('border-color', '');
                    emailControl.css('border-color', 'red');
                    emailFailedMessage.html(emailControl.attr('data-invalidformat-message'));
                    emailFailedMessage.slideDown('slow');
                    return false;
                }
                else if (orderNumber.length > 0) {
                    emailFailedMessage.html('');
                    emailControl.css('border-color', '');
                    orderNumberControl.css('border-color', 'red');
                    orderFailedMessage.html(orderNumberControl.attr('data-invalidformat-message'));
                    orderFailedMessage.slideDown('slow');
                    return false;
                }
            }
            else {
                //Create cookie
                setReferenceNumber(referenceNumber);

                //Force reload the Cart page
                window.location.replace("/cart");
            }
            

        },
        error: function (jqXHR, textStatus, errorThrown) {
           // alert(jqXHR.responseJSON.Message);
           //Show the error screen
            if (emailId.length > 0 && !validateEmail(emailId)) {
                orderFailedMessage.html('');
                orderNumberControl.css('border-color', '');
                emailControl.css('border-color', 'red');
                emailFailedMessage.html(emailControl.attr('data-invalidformat-message'));
                emailFailedMessage.slideDown('slow');
                return false;
            }
            else if (orderNumber.length > 0 && !validateOrderNumber(orderNumber)) {
                emailFailedMessage.html('');
                emailControl.css('border-color', '');
                orderNumberControl.css('border-color', 'red');
                orderFailedMessage.html(orderNumberControl.attr('data-invalidformat-message'));
                orderFailedMessage.slideDown('slow');
                return false;
            }

        }
    });
}

function validateEmail(email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailReg.test(email);
}

function validateOrderNumber(orderNumber) {
    var orderReg = /^[a-z0-9]+$/i;
    return orderReg.test(orderNumber);
}

function GetCartIdFromCookie() {
    return getReferenceNumber();
}

function setAddDataCookie() {

    var d = new Date();
    d.setDate(d.getDate() + 30);

    var uid = $(this).attr("data-uid");
    var price = $(this).attr("data-price");

    var json = {};
    json.uid = uid;
    json.price = price;

    Cookies.set('gci_addline', json, { expires: d, path: '/' });
}

function setAddLineCookie() {

    var d = new Date();
    d.setDate(d.getDate() + 30);

    var uid = $(this).attr("data-uid");
    var numberOfLines = $(this).closest(".current-count").html();
    var price = $(this).attr("data-price");

    var json = {};
    json.uid = uid;
    json.numberOfLines = numberOfLines;
    json.price = price;

    Cookies.set('gci_addline', json, { expires: d, path: '/' });
}

function CloseModal() {
    //Used to help close modals
    return false;
}
function SubmitModal() {
    //Used to validate modal
}
function OpenModal(modalName) {
    //Open modal that is authored
    if (modalName === undefined) {
        return;
    }
    $("#" + modalName).modal("show");
}
function AddContentTagCookieWithRedirect(cookieName, contentTagName, contentTagValue, redirectUrl) {
    var contentTagCookie = GetContentTagCookie(cookieName);
    if (contentTagCookie) {
        RemoveContentTagCookie(cookieName);
    }

    this.cookieInfo = [];
    cookieInfo = contentTagName + ":" + contentTagValue;
    
    //Create a cookie for saving a content tag
    var cookie = [cookieName, '=', JSON.stringify(this.cookieInfo), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
    document.cookie = cookie;

    //Redirect to the url
    window.location.href = redirectUrl;
}

function GetContentTagCookie(cookieName) {
    var nameEQ = cookieName + "=";
    var ca = document.cookie.split(';')
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function RemoveContentTagCookie(cookieName) {
    var cookie = cookieName + '=;domain=.' +
        window.location.host.toString() +
        '; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = cookie;
}

function SwitchtoPDPPanel(productGuid) {
    $(".pdp-device-container").attr("data-catalog-item-id", productGuid);
    devicePdp.LoadDevicePdp();
    //Hide the PLP
    $('.plp-device-search').hide();
    // Scroll the PDP container to the top so it is front and center
    $('html, body').animate({ scrollTop: $(".pdp-device-container").offset().top }, 0);
    //Show the PDP
    $('.pdp-device-container').show();
}

function SwitchtoPLPPanel() {
    //Hide the PDP
    $('.pdp-device-container').hide();
    //Show the PLP
    $('.plp-device-search').show();
}
(function (window, $) {
    window.GCI = window.GCI || {};
    window.GCI.Sk = window.GCI.Sk || {};
    var sk = window.GCI.Sk;
    var GCIJs = {
        onLoadEvents: function (e) {
            //if (Cookies.get('MenuCookie') != null) {
            //   var sectionItem = "." + Cookies.get('MenuCookie');
            //   $(sectionItem).addClass("active");
            //   $(sectionItem).next().slideToggle("fast");
            //};
        },
        onClickEvents: function (e) {
            $(".close-modal").on("click", function () {
                var dataId = $(this).attr("data-modalid");
                $("#" + dataId).modal('hide');
            });
        },
        onScrollEvents: function (e) {

        },
        onResize: function (e) {

        }
    }
    GCIJs.onLoadEvents();
    GCIJs.onClickEvents();
    GCIJs.onScrollEvents();
    GCIJs.onResize();
})(window, jQuery);

 
$(document).ready(function () {
    miniCart = {
        vars: {
            $cookieName: "gci_cart",
            $cartFilter: "minicart"
        },
        getCartReferenceNumber: function () {
            var o = miniCart;
            var v = o.vars;
            var returnValue;

            if (typeof $.cookie(v.$cookieName) === 'undefined') {
                //no cookie
                returnValue = "";
            } else {
                //have cookie
                var cookieObj = jQuery.parseJSON($.cookie(v.$cookieName));
                returnValue = (cookieObj.referenceNumber) ? cookieObj.referenceNumber : "";
            }

            return returnValue;
        },
        init: function () {
            var o = miniCart;

            // Call the API to get device information and tell Handlebars JS to handle its business
            o.loadMiniCart();
        },
        loadMiniCart: function () {
            var o = miniCart;
            var v = o.vars;

            $.ajax({
                url: '/api/v1/shoppingcart',
                type: 'GET',
                data: {
                    'cartId': o.getCartReferenceNumber(),
                    'cartType': v.$cartFilter
                },
                success: function (results) {
                    if (results) {
                        var source = $("#mini-cart-template").html();
                        var template = Handlebars.compile(source);
                        var dtlHtml = template(results);
                        $("#mini-cart").html(dtlHtml);

                        // Click events have to be registered AFTER Handlebars JS does its thing.
                        // Deregister then Register all click events. A new trick I learned to resolve duplicate registrations. Pretty sweet!
                        // The syntax is: $(element).off('eventName', myAction).on('eventName', myAction);
                        // Reference: https://makandracards.com/makandra/36625-jquery-how-to-attach-an-event-handler-only-once
                        $(document).off('click', '#mini-cart a.remove', o.removeDeviceFromCart).on('click', '#mini-cart a.remove', o.removeDeviceFromCart);
                        $(document).off('click', '#mini-cart .toggler', o.toggleCartVisibility).on('click', '#mini-cart .toggler', o.toggleCartVisibility);

                        o.startSlick();

                        // Business rule to collapse mini cart if it doesn't contain any items
                        if (results.length == 0) {
                            $('#mini-cart .toggler').trigger('click');
                        }
                    }
                    else {
                        console.log("There was an error returning shopping cart items.");
                    }
                },
                error: function (xhr, textStatus, error) {
                    console.log(xhr.statusText);
                    console.log(textStatus);
                    console.log(error);
                }
            });
        },
        removeDeviceFromCart: function (event) {
            event.preventDefault();
            var o = miniCart;
            var itemId = $(event.target).attr("cart-id");

            $.ajax({
                url: '/api/v1/shoppingcartdelete',
                type: 'DELETE',
                data: { 'cartId': itemId },
                success: function (result) {
                    o.loadMiniCart();
                }
            });
        },
        toggleCartVisibility: function () {
            if ($("#devicesInCart").hasClass("show")) {
                $("#devicesInCart").removeClass("show");
                $("#devicesInCart").addClass("hide");
                $(".toggler").addClass("closed");
                $(".toggler").removeClass("open");
                $(".toggler img").attr("src", "/-/media/Images/GCI/Icons/black-arrow-down.svg");
            }
            else if ($("#devicesInCart").hasClass("hide")) {
                $("#devicesInCart").removeClass("hide");
                $("#devicesInCart").addClass("show");
                $(".toggler").addClass("open");
                $(".toggler").removeClass("closed");
                $(".toggler img").attr("src", "/-/media/Images/GCI/Icons/red-arrow-up.svg");
            }
        },
        startSlick: function () {
            $('#mini-cart .devices-in-cart')
                .slick({
                    arrows: true,
                    slidesToShow: 6,
                    infinite: false,
                    centerMode: false,
                    responsive: [
                        {
                            breakpoint: 1025,
                            settings: {
                                slidesToShow: 3
                            }
                        },
                        {
                            breakpoint: 770,
                            settings: {
                                slidesToShow: 2
                            }
                        }
                    ]
                });
        }
    };
    var miniCartDad = $("#mini-cart").parent().parent();
    $(miniCartDad).addClass("mini-cart-container");

    $(".SteppedMoveNextLink").on("click", function () {
        if ($(miniCartDad).prev().css('display') == 'block') {
            if ($("#mini-cart").length > 0) {
                miniCart.init();
            }
        }
    })
});

(function ($) {
    if ($("#devicesInCart").hasClass("show")) {
        $(".toggler").addClass("open");
    }
})(jQuery);
$(window).ready(function () {

    $('.header-logo').find('.nav-logo').clone().appendTo($(".nav-logo-mobile"));
    $('.quick-links-desktop').find('.quick-links-dropdown').clone().appendTo($(".quick-links-mobile"));
    $('.header-geolocation').find('.geolocation-utility').clone().appendTo($('.utility-nav-mobile'));
    $('.header-utility').find('.general-utility-menu').clone().appendTo($('.utility-nav-mobile'));
    $('.utility-nav-mobile ul').removeClass('list-inline').addClass('list-unstyled');
    $('.utility-nav-mobile ul li').removeClass('list-inline-item').addClass('svg-fill-primary');
    $('.header-microsite-nav').find('.nav-site-switcher').clone().appendTo($('.utility-nav-mobile'));

});

function AddCouponToCart(couponCode, callback, isPdp = false) {
    var endpoint = "/api/v1/shoppingcartprocessor";
    var cartData = {
        "CartId": "anonymous",
        "ReferenceNumber": "",
        "CartItemType": 27,
        "UID": 000,
        "CouponCode": couponCode,
        "EditUrl": ""
    }

    cartData.CartId = checkReferenceNumber();
    cartData.ReferenceNumber = getReferenceNumber();
    cartData.EditUrl = document.URL;
    $.post(endpoint, cartData, function (result) {
        if (result.IsSuccessCode) {
            if (getReferenceNumber() == "") {
                setReferenceNumber(result.ReferenceNumber);
            }

            if (isPdp) {
              $('#CouponConfirmationPDP').modal('show');
            }
            else if (result.ModalConfirmation != "") {
                $('#' + result.ModalConfirmation).modal('show');
            }
            else if (result.ForwardUrl != "") {
                window.location.href = result.ForwardUrl;
            }

            if (callback && typeof (callback) === "function") {
                callback();
            }
        }
    });

}

function ShowOfferModalByItemId(couponCode) {
    //call API endpoint, get offer modal details
    $.ajax({
        url: '/AvailabilityAPI/GetOfferDetail',
        type: 'GET',
        data: {
            'id': couponCode
        },
        success: function (results) {
            if (results) {
                $dev = results;
                //console.log($dev.ret)


                //populate modal content
                //device offers

                if (!jQuery.isEmptyObject($dev.ret)) {


                    $("#OfferConfirmation .title").html($dev.ret.ModalTitle);
                    $("#OfferConfirmation .terms").html($dev.ret.ModalTerms);
                    $("#OfferConfirmation .description").html($dev.ret.ModalDescription);
                    $("#OfferConfirmation #offerModalCTA").attr('data-offerid', couponCode);

                    let modalCTA = $dev.ret.ModalCTA;
                    if (!modalCTA) { modalCTA = "Claim Offer"; }
                    $("#OfferConfirmation .cta a").html(modalCTA);

                    $("#OfferConfirmation .modal-image img").attr('src', $dev.ret.ModalImage);

                    //show the modal
                    $("#OfferConfirmation").modal("show");
                }

            }
            else {
                console.log("There was an error returning shopping cart items.");
            }
        },
        error: function (xhr, textStatus, error) {
            console.log(xhr.statusText);
            console.log(textStatus);
            console.log(error);
        }
    });
    
}
function populateModal(couponCode, modalID) {
    //call API endpoint, get offer modal details
    $.ajax({
        url: '/AvailabilityAPI/GetOfferDetail',
        type: 'GET',
        data: {
            'id': v.$catalogItemID
        },
        success: function (results) {
            if (results) {
                v.$dev = results;


                //populate modal content
                //device offers
                if (v.$dev.ret.DeviceOffers.length > 0) {
                    $("#OfferConfirmation .title").html($("#modalTitle").html());
                    $("#OfferConfirmation .terms").html($("#modalTerms").html());
                    $("#OfferConfirmation .description").html($("#modalDescription").html());

                    let modalCTA = $("#modalCTA").html();
                    if (!modalCTA) { modalCTA = "Claim Offer"; }
                    $("#OfferConfirmation .cta a").html(modalCTA);

                    $("#OfferConfirmation .modal-image img").attr('src', $("#modalImage").html());
                }

            }
            else {
                console.log("There was an error returning shopping cart items.");
            }
        },
        error: function (xhr, textStatus, error) {
            console.log(xhr.statusText);
            console.log(textStatus);
            console.log(error);
        }
    });


}


$(document).on("click", "#offerModalCTA", function () {
    couponCode = $(this).attr('data-offerid');
    AddCouponToCart(couponCode, null, false);
    $('#OfferConfirmation').modal('hide');
});


$(document).ready(function () {
    devicePdp = {
        vars: {
            $catalogItemID: "",
            $dev: "",
            $selectedColorOption: "",
            $selectedStorageOption: "",
            $selectedPaymentOption: "",
            $selectedPaymentIndex: 0,  // Records an index instead of a price value
            $shoppingCartItemID: "",
            $mode: "",
            $useBusinessSettings: false
        },
        Init: function (guid) {
            var o = devicePdp;
            var v = o.vars;

            // Record these values if the url indicates this is an edit cart item action
            v.$selectedColorOption = o.GetUrlParam("color");
            v.$selectedStorageOption = o.GetUrlParam("storage");
            v.$selectedPaymentOption = o.GetUrlParam("payment");
            v.$shoppingCartItemID = o.GetUrlParam("cartItemID");
            v.$protectSelected = o.GetUrlParam("protect");
            v.$mode = o.GetUrlParam("mode");

            // Determine product segmentation for display purposes/changes
            v.$useBusinessSettings = $(".pdp-new").attr("data-use-business-settings").toLowerCase();

            // Perform the magic!
            o.LoadDevicePdp();
        },
        LoadDevicePdp: function () {
            var o = devicePdp;
            var v = o.vars;
            v.$catalogItemID = $(".pdp-new").attr("data-catalog-item-id")

            if (v.$catalogItemID.trim() !== "" && o.IsGuid(v.$catalogItemID.trim())) {
                $.ajax({
                    url: '/AvailabilityAPI/GetDeviceDetail',
                    type: 'GET',
                    data: {
                        'id': v.$catalogItemID
                    },
                    success: function (results) {
                        if (results) {

                            //console.log(JSON.stringify(results, undefined, 4));

                            var price = results.ret.Colors[0].Options[0].MonthlyPrice36;
                            if (price == 0) {
                              price = results.ret.Colors[0].Options[0].MonthlyPrice24;
                            }
                            if (price == 0) {
                              price = results.ret.Colors[0].Options[0].MonthlyPrice12;
                            }
                            if (price == 0) {
                              price = results.ret.Colors[0].Options[0].Price;
                            }

                            var schema = {
                                "@context": "https://schema.org/",
                                "@type": "Product",
                                "name": results.ret.DeviceName,
                                "image": window.location.origin + results.ret.PLPAndOverviewImage,
                                "description": results.ret.OverviewDescription.replace(/<\/?[^>]+(>|$)/g, ""),
                                "brand": {
                                    "@type": "Brand",
                                    "name": results.ret.Manufacturer
                                },
                                "category": results.ret.Category,
                                "model": results.ret.ModelNumber,
                                "size": results.ret.Dimensions,
                                "offers": {
                                    "@type": "Offer",
                                    "url": window.location.href,
                                    "priceCurrency": "USD",
                                    "price": price,
                                    "availability": "InStock"
                                }
                            }
                            var script = document.createElement('script');
                            script.type = "application/ld+json";
                            script.text = JSON.stringify(schema);
                            $("head").append(script);

                            v.$dev = results;
                            var source = $("#device-pdp-template").html();
                            var template = Handlebars.compile(source);
                            var dtlHtml = template(results);
                            $(".pdp-new").html(dtlHtml);


                            //populate modal content
                            //device offers
                            if (v.$dev.ret.DeviceOffers.length > 0) {
                                $("#OfferConfirmation .title").html($("#modalTitle").html());
                                $("#OfferConfirmation .terms").html($("#modalTerms").html());
                                $("#OfferConfirmation .description").html($("#modalDescription").html());

                                let modalCTA = $("#modalCTA").html();
                                if (!modalCTA) { modalCTA = "Claim Offer"; }
                                $("#OfferConfirmation .cta a").html(modalCTA);

                                $("#OfferConfirmation .modal-image img").attr('src', $("#modalImage").html());
                            }

                            // Deregister then Register all click events. A new trick I learned to resolve duplicate registrations. Pretty sweet!
                            // The syntax is: $(element).off('eventName', myAction).on('eventName', myAction);
                            // Reference: https://makandracards.com/makandra/36625-jquery-how-to-attach-an-event-handler-only-once
                            $(document).off("click", ".device-color .device-color-option", o.ColorClickEvent).on("click", ".device-color .device-color-option", o.ColorClickEvent);
                            $(document).off("click", "#storage-buttons .slider-item", o.StorageClickEvent).on("click", "#storage-buttons .slider-item", o.StorageClickEvent);
                            $(document).off("click", "#payment-buttons .slider-item", o.PaymentClickEvent).on("click", "#payment-buttons .slider-item", o.PaymentClickEvent);
                            $(document).off("click", "#device-protection .slider-item", o.DeviceProtectionClickEvent).on("click", "#device-protection .slider-item", o.DeviceProtectionClickEvent);
                            $(document).off("click", ".trade-in a", o.ShowOfferClickEvent).on("click", ".trade-in a", o.ShowOfferClickEvent);
                            $(document).off("click", ".device-overview .cta a", o.AddToCartClickEvent).on("click", ".device-overview .cta a", o.AddToCartClickEvent);
                            $(document).off("click", "#offerModalCTA", o.AddOfferClickEvent).on("click", "#offerModalCTA", o.AddOfferClickEvent);

                            if (v.$mode == "modify") {
                                // Auto click the first color so that we have a perfect experience (through defaults) even if someone messes with the url params (e.g., changes color from "silver" to "silverrr")
                                $(".device-color-container .device-color-option").first().click();
                                
                                // Make the appropriate selections based on the edit url params
                                $(".device-color").find("[data-color='" + o.GetUrlParam('color') + "']").click();
                                $(".device-storage").find("[data-size='" + o.GetUrlParam('storage') + "']").click();
                                $("#payment-buttons").find("[data-price='" + o.GetUrlParam('payment') + "']").click();
                                if (v.$protectSelected != "") {
                                    var protectSelectedArray = v.$protectSelected.split('+')
                                    for (let i = 0; i < protectSelectedArray.length; i++) {
                                        $(".protect-device-container").find("[data-id='" + protectSelectedArray[i] + "']").click()
                                    }
                                }
                            }
                            else {
                                // Clear any managed state. This special case occurs when the PDP is within a panel component and the LoadDevicePdp() method could be called multiple times
                                o.ResetManagedState();
                                // Auto click the first color so we can load the appropriate images into the carousel and get everything else set up properly
                                $(".device-color-container .device-color-option").first().click();
                            }
                        }
                        else {
                            console.log("There was an error returning shopping cart items.");
                        }
                    },
                    error: function (xhr, textStatus, error) {
                        console.log(xhr.statusText);
                        console.log(textStatus);
                        console.log(error);
                    }
                });
            }
        },
        ColorClickEvent: function (event) {
            var o = devicePdp;
            var v = o.vars;

            $(".device-color .device-color-option").removeClass("active");
            $(this).addClass("active");
            v.$selectedColorOption = $(this).children(".btn-circle").data("color");   // Manage state
            o.ReloadDeviceStorage(v.$selectedColorOption);  // Business rule! Only present the capacity options that are available for the selected/clicked color
            // Business rule! Load the carousel images and indicators based on the selected color and capacity options
            o.ReloadCarouselImages(v.$selectedColorOption, v.$selectedStorageOption);
            o.ReloadCarouselIndicators(v.$selectedColorOption, v.$selectedStorageOption);
        },
        StorageClickEvent: function (event) {
            var o = devicePdp;
            var v = o.vars;

            $("#storage-buttons .slider-item").removeClass("active");
            $(this).addClass("active");
            v.$selectedStorageOption = $(this).data("size");  // Manage state
            o.ReloadDevicePayment(v.$selectedColorOption);    // Business rule! Show the appropriate prices per device color + capacity combo.
            // Business rule! Load the carousel images and indicators based on the selected color and capacity options
            o.ReloadCarouselImages(v.$selectedColorOption, v.$selectedStorageOption);
            o.ReloadCarouselIndicators(v.$selectedColorOption, v.$selectedStorageOption);

            // Trigger the personalization rules
            o.Personalize();
        },
        PaymentClickEvent: function (event) {
            var o = devicePdp;
            var v = o.vars;

            $("#payment-buttons .slider-item").removeClass("active");
            $(this).addClass("active");
            v.$selectedPaymentIndex = $("#payment-buttons .slider-item").index(this);  // Manage state. In this case, we record the index position instead of the price value because the price values change per each color + storage combination
            o.ReloadPaymentTerms($(this).data("price"), $(this).data("term-length"));
        },
        DeviceProtectionClickEvent: function (event) {
            $(this).toggleClass("active");
        },
        ShowOfferClickEvent: function (event) {
            $("#OfferConfirmation").modal("show");
        },
        AddToCartClickEvent: function (event) {
            var o = devicePdp;
            o.PrepareDeviceModel();
        },
        ReloadDeviceStorage: function (color) {
            var o = devicePdp;
            var v = o.vars;
            var assignDefaultStorage = true;

            $(".device-storage-container #storage-buttons").empty();
            $.each(v.$dev.ret.Colors, function (index, item) {
                if (item.ColorRef == color) {
                    $.each(item.Options, function (i, c) {
                        // Business rule! The customer previously clicked on a storage option so let's remember that selection for them and mark it as active
                        if (c.StorageRef == v.$selectedStorageOption) {
                            $(".device-storage-container #storage-buttons").append('<div class="slider-item active" data-size=' + c.StorageRef + ' data-id=' + c.ID + ' data-preorder=' + c.Preorder + '>' + c.Storage + '</div>');
                            assignDefaultStorage = false;
                        }
                        else {
                            $(".device-storage-container #storage-buttons").append('<div class="slider-item" data-size=' + c.StorageRef + ' data-id=' + c.ID + ' data-preorder=' + c.Preorder + '>' + c.Storage + '</div>');
                        }
                    });
                }
            });

            // Business rule! If no storage options are selected, select the first one in the sequence as the default
            if (assignDefaultStorage) {
                $("#storage-buttons .slider-item").first().click();
            }
            else {
                // Click on the previously selected storage option so we guarantee the personalization rules are triggered
                $(".device-storage-container .slider-item.active").click();
            }
        },
        ReloadDevicePayment: function (color) {
            var o = devicePdp;
            var v = o.vars;

            $(".device-payment-container #payment-buttons").empty();
            $.each(v.$dev.ret.Colors, function (index, item) {
                if (item.ColorRef == color) {
                    $.each(item.Options, function (i, c) {
                        if (c.StorageRef == v.$selectedStorageOption) {
                            if (c.MonthlyPrice36 > 0 && v.$useBusinessSettings === "false") {
                                $(".device-payment-container #payment-buttons").append('<div class="slider-item monthly-price month-36" data-id="' + c.ID + '" data-term-length="36" data-price="' + c.MonthlyPrice36 + '">$' + c.MonthlyPrice36Ref + '/MO</div>');
                            }
                            if (c.MonthlyPrice24 > 0 && v.$useBusinessSettings === "false") {
                                $(".device-payment-container #payment-buttons").append('<div class="slider-item monthly-price month-24" data-id="' + c.ID + '" data-term-length="24" data-price="' + c.MonthlyPrice24 + '">$' + c.MonthlyPrice24Ref + '/MO</div>');
                            }
                            if (c.MonthlyPrice12 > 0 && v.$useBusinessSettings === "false") {
                                $(".device-payment-container #payment-buttons").append('<div class="slider-item monthly-price month-12" data-id="' + c.ID + '" data-term-length="12" data-price="' + c.MonthlyPrice12 + '">$' + c.MonthlyPrice12Ref + '/MO</div>');
                            }
                            if (c.Price > 0) {
                                $(".device-payment-container #payment-buttons").append('<div class="slider-item retail-price" data-id="' + c.ID + '" data-term-length="0" data-price="' + c.Price + '">$' + c.PriceRef + '</div>');
                            }
                        }
                    });
                }
            });

            // Business rule! Select the customer's previously selected "price". If nothing has been selected, then default to the first one in the sequence
            if (v.$selectedPaymentIndex >= 0) {
                $("#payment-buttons .slider-item").eq(v.$selectedPaymentIndex).click();
            }
            else {
                $("#payment-buttons .slider-item").first().click();
            }
        },
        ReloadPaymentTerms: function (price, termLength) {
            var o = devicePdp;
            var v = o.vars;

            if (v.$useBusinessSettings === "true") {
                $('.device-payment-alert').slideDown("fast");
            }
            else if (termLength == 0) {
                $('.device-payment-alert').slideUp("fast");
            }
            else {
                $('.device-payment-alert #term-price').empty();
                $('.device-payment-alert #term-length').empty();
                $('.device-payment-alert #term-price').append(price);
                $('.device-payment-alert #term-length').append(termLength);
                $('.device-payment-alert').slideDown("fast");
            }
        },
        ReloadCarouselImages: function (color, storage) {
            $(".carousel-inner .carousel-item").hide().removeClass("carousel-item active");
            $(".carousel-inner div img").each(function () {
                if ($(this).data("color") === color && $(this).data("storage") === storage) {
                    $(this).parent().show().addClass("carousel-item");

                    if ($(this).data("index") === 0) {
                        $(this).parent().addClass("active");
                    }
                }
            });
        },
        ReloadCarouselIndicators: function (color, storage) {
            $(".carousel-indicators").empty();
            $(".carousel-inner div img").each(function () {
                if ($(this).data("color") === color && $(this).data("storage") === storage) {
                    var addClassName = "";
                    var pos = $(this).data("index");
                    if (pos === 0) {
                        addClassName = "active";
                    }
                    $(".carousel-indicators").append("<li class='" + addClassName + "' data-target='#Device-Carousel' data-slide-to='" + pos + "' data-index='" + pos + "'></li>");
                }
            });
        },
        PrepareDeviceModel: function () {
            var o = devicePdp;
            var v = o.vars;
            var model = { "DeviceID": "", "CartItemType": "", "PaymentTermLength": "", "Subitems": [], "EditUrl": "", "DeleteCartID": 0 };
            var editColor = "";
            var editCapacity = "";
            var editPayment = "";
            var editUrl = $(".pdp-new").data("edit-url");;
            var editSlug = $(".pdp-new").data("catalog-item-id");
            var deviceName = $(".device-name").html();
            var editProtect = "";
            // Capture the selected color
            $.each($(".device-color-option.active .btn-circle"), function (index, item) {
                editColor = $(item).data("color");
            });

            // Capture the selected device configuration
            $.each($("#storage-buttons .slider-item.active"), function (index, item) {
                model.DeviceID = $(item).data("id");
                editCapacity = $(item).data("size");
            });

            // Capture the cart item type
            model.CartItemType = $(".device-overview").data("cart-item-type");

            // Capture the selected payment plan
            $.each($("#payment-buttons .slider-item.active"), function (index, item) {
                model.PaymentTermLength = $(item).data("term-length");
                editPayment = $(item).data("price");
            });

            // Capture any selected protection plans
            $.each($(".device-protection-item .slider-item.active"), function (index, item) {
                model.Subitems.push($(item).data("id"));
            });

            //Capture protect plan
            var protectSelected = []
            $(".protect-device-container .slider-item.active").each(function () {
                protectSelected.push($(this).data('id'))
            })
            editProtect = protectSelected.join('+')


            // Construct the device edit url, if applicable
            if (editUrl != "") {
                model.EditUrl = editUrl + "/" + deviceName.replace(/\s+/g, '-').toLowerCase() + "/" + editSlug + "?color=" + editColor + "&storage=" + editCapacity + "&payment=" + editPayment + "&protect=" + editProtect;
            }

            // If this was part of an edit cart item action
            if (v.$mode == "modify") {
                model.DeleteCartID = v.$shoppingCartItemID;
            }

            o.AddToCart(model);
        },
        AddOfferClickEvent: function () {
            couponCode = $("#offer").data("offer-id");
            AddCouponToCart(couponCode, null, true);
            $('#OfferConfirmation').modal('hide');

        },
        AddToCart: function (model) {
            var o = devicePdp;
            var apiEndPoint = "/api/v1/shoppingcartprocessor";
            var postData = {
                "CartId": "",
                "ReferenceNumber": "",
                "CartItemType": 0,
                "UID": 0,
                "ItemID": "",
                "PaymentType": "",
                "Quantity": 0,
                "ShoppingCartChildren": [],
                "EditUrl": "",
                "DeleteShoppingCartId": 0
            };

            postData.CartId = checkReferenceNumber();
            postData.ReferenceNumber = getReferenceNumber();
            postData.CartItemType = model.CartItemType;
            postData.ItemID = model.DeviceID;
            postData.PaymentType = model.PaymentTermLength;
            postData.EditUrl = model.EditUrl;
            postData.DeleteShoppingCartId = model.DeleteCartID;

            for (let i = 0; i < model.Subitems.length; i++) {
                var childItem = { "CartItemType": 17, "UID": 0, "ItemID": "" };
                childItem.ItemID = model.Subitems[i];
                postData.ShoppingCartChildren.push(childItem);
            }

            $.post(apiEndPoint, postData, function (result) {
                if (result.IsSuccessCode) {
                    if (getReferenceNumber() == "") {
                        setReferenceNumber(result.ReferenceNumber)
                    }
                    // Only refresh mini cart after device was successfully added to the cart
                    // Is there a better way to do a callback?
                    o.RefreshMiniCart();
                }
            });
        },
        IsGuid: function (stringToTest) {
            var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}(\-){0,1}[0-9a-fA-F]{4}(\-){0,1}[0-9a-fA-F]{4}(\-){0,1}[0-9a-fA-F]{4}(\-){0,1}[0-9a-fA-F]{12}(\}){0,1}$/gi;
            return regexGuid.test(stringToTest);
        },
        RefreshMiniCart: function () {
            // Handles scenario where both a mini cart and PDP component are part of a buy flow
            if ($("#mini-cart").length > 0) {
                // Reload the mini cart since a new device was added
                miniCart.loadMiniCart();
                // Scroll to the top of the mini cart so it is front and center
                $('html, body').animate({ scrollTop: $("#mini-cart").offset().top }, 0);
            }
        },
        ResetManagedState: function () {
            var o = devicePdp;
            var v = o.vars;
            v.$selectedColorOption = "";
            v.$selectedStorageOption = "";
            v.$selectedPaymentOption = "";
            v.$selectedPaymentIndex = 0;
            v.$shoppingCartItemID = "";
            v.$mode = "";
        },
        GetUrlParam: function (name) {
            var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);

            return (results !== null) ? results[1] || 0 : false;
        },
        IsBusiness: function () {
            var o = devicePdp;
            var v = o.vars;
            return (v.$useBusinessSettings === "true") ? true : false;
        },
        IsPreorder: function () {
            return $(".device-storage-container .slider-item.active").data("preorder");
        },
        Personalize: function () {
            var o = devicePdp;
            o.PersonalizeCTA();
        },
        PersonalizeCTA: function () {
            var o = devicePdp;
            
            if (!o.IsBusiness() && o.IsPreorder()) {
                $(".device-overview .cta").hide();
                $(".cta.preorder").show();
            }
            else if (!o.IsBusiness()) {
                $(".device-overview .cta").hide();
                $(".cta.available").show();
            }
        }
    };

    if ($(".pdp-new").length > 0) {
        devicePdp.Init();
    }
});
(function ($, window, document, undefined) {

    function plpDeviceSearchSetup() {
        if ($('.plp-device-search').length) {
            var coveoRoot;

            document.addEventListener("DOMContentLoaded", function () {
                coveoRoot = Coveo.$(document).find('.CoveoSearchInterface');
                Coveo.$(coveoRoot).on('preprocessResults', function (e, args) {
                    var numberOfDisplayedResults = args.query.firstResult + args.query.numberOfResults;
                    if (numberOfDisplayedResults >= args.results.totalCount) {
                        $('.coveoLoadMore').hide();
                    } else {
                        $('.coveoLoadMore').show();
                    }
                    $('.CoveoQuerySummary').html('Devices <span>' + args.results.totalCount + ' items</span>')
                    //goMobile(); // this was moved to the bottom, see expanatory comments below
                    $('.CoveoDynamicFacet #coveo-combobox-1-input').attr('placeholder', 'Device name');
                });
                Coveo.$$(coveoRoot).on("afterInitialization", function () {
                    Coveo.$$(coveoRoot).on('deferredQuerySuccess', SetSelectedFacets);
                });
            });

            var noofresults = 100;
            $(document).ready(function () {
                $('.coveo-filter-clear-all').click(function () {
                    $('.CoveoFacet, .CoveoDynamicFacet').coveo('reset');
                    coveoRoot.coveo("executeQuery");
                });
                $('.coveoLoadMore').on('click', function () {
                    Coveo.$('.CoveoResultList').coveo('displayMoreResults', noofresults);
                });
                $('.CoveoFacet, .CoveoDynamicFacet').on('click', SetSelectedFacets);
            });

            function SetSelectedFacets() {
                $('.coveo-filter-selected').html('');
                $('.coveo-selected').each(function () {
                    var label = $(this).data('value');
                    var cb = $(this).find('input:checked');
                    if (cb.length) {
                        var parentId = $(this).closest('.CoveoFacet, .CoveoDynamicFacet').data('id');
                        $('.coveo-filter-selected').append('<li class="listed-selected-facet"><a href="#" class="selected-facet-link" data-parent-id="' + parentId + '" data-facet="' + label + '">' + label + '</a></li>');
                    }
                });
                $('.selected-facet-link').on('click', function (e) {
                    e.preventDefault();
                    var label = $(this).data('facet');
                    var pid = $(this).data('parent-id');
                    var query = ".CoveoFacet[data-id='" + pid + "'], .CoveoDynamicFacet[data-id='" + pid + "']";
                    var f = Coveo.get(document.querySelector(query));
                    if (f !== undefined) {
                        var textualFacetSelector = ".CoveoFacet[data-id='" + pid + "'] li[data-value='" + label + "'] input";
                        var dynamicFacetSelector = ".CoveoDynamicFacet[data-id='" + pid + "'] li[data-value='" + label + "'] button";
                        $(textualFacetSelector + ", " + dynamicFacetSelector).click();
                    }
                });
            }
        }
    }

    function goMobile() {
        if ($(window).width() <= 991) {
            $(".coveo-dropdown-header-wrapper").insertBefore($(".coveo-results-column .coveo-sort-section "));
            $(".coveo-result-blue-bar").insertBefore($(".coveo-results-column"));
            $(".coveo-dropdown-header-wrapper").append($(".coveo-facet-column"));
            $(".coveo-summary-section").append($(".coveo-filter-header"));
            $(".coveo-filter-selected").insertBefore($(".coveo-dropdown-header-wrapper"));
            $(".CoveoFacet").last().addClass("lastFacet");
            $(".coveo-facet-dropdown-header").on('click', function () { $("body").css("overflow", ""); });
        }
    }

    /*
      We need all facet containers loaded and Coveo must be finished manipulating them before goMobile will work.
      So far I have been unable to find an event that guarantees this, including deferredQuerySuccess above.
      If we uncomment the log below and watch MutationRecords, it shows that the DOM insert is occurring twice.
      Once before Coveo is finished executing, and again *after* the last Coveo event listener hook fires.
      This code watches for inserts of coveo-dropdown-header-wrapper into the default parent and moves it back again.
      Something about this behavior changed between Coveo 5.0.1110.1 and 5.0.1202.1, see GCIC-6294 for details.
    */
    $(document).ready(function () {
        if ($(".coveo-main-section").length > 0) {
            var ran = false;
            var obs = new MutationObserver(function (e) {
                $(e).each(function (idx) {
                    if (e[idx].addedNodes.length > 0 && e[idx].addedNodes[0].className === "coveo-dropdown-header-wrapper") {
                        //console.log(e[idx]);
                        goMobile();
                        ran = true;
                    }
                });
            });
            obs.observe(document.querySelector(".coveo-main-section"), { childList: true });
            if (!ran) goMobile();
        }
    });

    plpDeviceSearchSetup();
 
}) (jQuery, window, document);
function AddToCart(itemId, keycode, modalId) {
    var endpoint = "/api/v1/shoppingcartprocessor";
    var cartData = {
        "CartId": "anonymous",
        "ReferenceNumber": "",
        "CartItemType": keycode,
        "UID": 000,  // TODO: delete when ShoppingCartProcessorPostViewModel.UID is no longer needed
        "ItemID": itemId,
        "EditUrl": "",
        "Quantity": 1
    }

    cartData.CartId = checkReferenceNumber();
    cartData.ReferenceNumber = getReferenceNumber();
    cartData.EditUrl = document.URL;

    if (navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {
        window.scrollTo(0, 1);
    }

    $.post(endpoint, cartData, function (result) {
        if (result.IsSuccessCode) {
            if (getReferenceNumber() == "") {
                setReferenceNumber(result.ReferenceNumber);
            }

            if (modalId.length > 0) {
                $('#' + modalId).modal('show');
            }
        }
    });
}
// this will be deprecated when we release the omnibox, only run it if the omnibox doesn't exist
if ($("header .coveo-search-section .CoveoSearchbox").length === 0) {
    $(window).ready(function () {
        $('.header-search').find('.form-search-bar').clone().appendTo($('.search-mobile'));

        //Add middleware here
        function searchDevice(input, url) {

            let searchTermForUnitedSupport = ['Alaska United Support', 'Alaska United Fiber', 'Alaska United Routes', 'Alaska United Fiber Routes', 'AK United', 'AK United Support', 'AK United Fiber', 'AK United Routes', 'AK United Fiber Routes', 'Alaska United map', 'Alaska United fiber map', 'AK United map', 'AK United map', 'AK United fiber map', 'Alaska United'];

            var getOutOfFunction = false;
            searchTermForUnitedSupport.forEach(function (term) {
                if (input.toLowerCase() === term.toLowerCase()) {
                    window.location.href = "/support/support-articles/business-alaska-united-support";
                    getOutOfFunction = true;
                    return;
                }
            });

            if (getOutOfFunction) {
                return;
            }

            var SearchFinished = false;             
            window.location.href = url + "#q=" + input;
        }

        $(".search-input").each(function () {
            $(this).on("keypress", function handle(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();

                    var url = $(".hidSiteSearchUrl").val();
                    var terms = $(this).val();
                
                    searchDevice(terms, url);
                }
            });
        });

        $(".btn-get-search-results").each(function () {
            $(this).on("click", function () {
                var url = $(".hidSiteSearchUrl").val();
                var terms = $(this).siblings(".search-input").val();

                searchDevice(terms, url);
            });
        });
    });
}

// NEW VERSION

function initMap() {
  $(document).ready(function () {

    var mapCanvasArea = $("#mapCanvasArea");

    if (mapCanvasArea.length > 0) {

      // html elements
      var mapStoreInfo = $("#mapStoreInfo");
      var mapSingleStore = $(".mapSingleStore");
      var mapSearchField = $("#mapSearchField");
      var mapViewAll = $("#mapViewAll");
      var mapMyLocation = $("#mapMyLocation");

      var map; // the main map object, to be set up later
      var mygeo; // set to user's geolocated position later
      var defaultAreaZoom = 11; // zoom when filtered to a region

      // device detection (legacy code, possibly removable)
      var isMobile = false;
      if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        isMobile = true;
      }
      if ($(window).height() >= 768) {
        isMobile = false;
      }
      if (!isMobile) {
        mapCanvasArea.parent().css("height", $(window).height() * 2 / 3)
      }

      // map style settings
      var styledMapType = new google.maps.StyledMapType(
      [
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f5f5f5"
            }
          ]
        },
        {
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#f5f5f5"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#bdbdbd"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#eeeeee"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e5e5e5"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#ffffff"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dadada"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e5e5e5"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#eeeeee"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#c9c9c9"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        }
      ],
      { name: 'Styled Map' })

      // basic map setup
      function initialize() {
        var defautlat = "64.613281";
        var defautlong = "-151.083984";
        map = new google.maps.Map(mapCanvasArea[0], {
          center: new google.maps.LatLng(defautlat, defautlong),
          zoom: (isMobile ? 3 : 4),
          mapTypeControlOptions: {
            mapTypeIds: ['satellite', 'styled_map'],
            position: google.maps.ControlPosition.RIGHT_BOTTOM

          },
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
          },
          streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_CENTER
          },
        })
        map.mapTypes.set('styled_map', styledMapType)
        map.setMapTypeId('styled_map')
      }

      // event handler hooks

      mapViewAll.on('click', function () {
        hideStorePane();
        removeStoreParam();
        initialize();
        addMarkers();
        mapSearchField.val("");
        return false;
      });

      mapMyLocation.on('click', function () {
        hideStorePane();
        removeStoreParam();
        mapSearchField.val("");
        if (!mygeo) navigator.geolocation.getCurrentPosition(showArea);
        else showArea(mygeo);
        return false;
      });

      mapSearchField.on("autocompleteselect", function (event, ui) {
        mapSearchField.val(ui.item.value);
        var e = jQuery.Event("keyup");
        e.keyCode = 13;
        mapSearchField.trigger(e);
      });

      // search box begins
      mapSearchField.keyup(function (event) {
        if (event.keyCode == 13) {
          var errorClass = mapSearchField.attr("data-city-autocomplete-error-class");
          mapSearchField.trigger("blur"); // make sure autocomplete validation has a chance to run first

          var val = mapSearchField.val();
          if (val.trim().length >= 2 && !mapSearchField.hasClass(errorClass)) {
            hideStorePane();
            removeStoreParam();

            if (val.trim().toLowerCase().indexOf(", alaska") === -1 && val.trim().toLowerCase().indexOf(", ak") === -1)
              val += ", Alaska";

            $.getJSON('/AvailabilityAPI/getFullAddress?input=' + val + '&key=', function (json) {
              try {
                var latlong = json.results[0].geometry.location;
                map.setCenter(new google.maps.LatLng(latlong.lat, latlong.lng));
                map.setZoom(defaultAreaZoom);
              }
              catch (err) { }
            });

          } else mapSearchField.trigger("focus");
        }
      }); // search box ends

      // toggling helper functions

      function showStorePane(html) {
        mapCanvasArea.removeClass('col-sm-12');
        mapCanvasArea.addClass('col-sm-9');
        mapSingleStore.show();
        mapStoreInfo.show().html(html);
      }

      function hideStorePane() {
        mapCanvasArea.addClass('col-sm-12');
        mapCanvasArea.removeClass('col-sm-9');
        mapSingleStore.hide();
        mapStoreInfo.hide().empty();
      }

      function addStoreParam(store) {
        if (history.pushState && store) {
          var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?store=" + store;
          window.history.pushState({ path: newurl }, '', newurl);
        }
      }

      function removeStoreParam() {
        if (history.pushState) {
          var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.pushState({ path: newurl }, '', newurl);
        }
      }

      // populate the store pins
      function addMarkers(sel) {
        var marker, i, myself, j, symbol;
        var allmarkers = [];

        for (i = 0; i < storeLocation.length; i++) {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(storeLocation[i][1], storeLocation[i][2]),
            map: map,
            draggable: false,
            icon: pinSymbol('#aa0023'),
          })
          allmarkers.push(marker)

          // click callback
          google.maps.event.addListener(marker, 'click', (function (marker, i) {

            return function () {
              hideStorePane();

              map.setCenter(new google.maps.LatLng(storeLocation[i][1], storeLocation[i][2]))
              map.setZoom(defaultAreaZoom);

              for (j = 0; j < allmarkers.length; j++) {
                symbol = allmarkers[j].getIcon();
                symbol.fillColor = '#aa0023';
                allmarkers[j].setIcon(symbol);
              }
              symbol = this.getIcon();
              symbol.fillColor = (symbol.fillColor === '#ffcb08')
                ? '#aa0023' // initial fillColor
                : '#ffcb08';
              this.setIcon(symbol);
              var a = storeLocation[i][0];
              var searchterm = a.split(',');

              var store = mapSingleStore.find('h2').filter(function () {
                return $(this).text() === searchterm[0];
              });
              store = store.parent().clone();

              showStorePane(store.show());
              addStoreParam(storeLocation[i][3]);

              if (isMobile) {
                $('html, body').animate({
                  scrollTop: mapCanvasArea.offset().top
                }, 500);
              }
            }

          })(marker, i))

          if (storeLocation[i][3] === sel) {
            google.maps.event.trigger(marker, 'click');

            var coords = { "coords": { "latitude": storeLocation[i][1], "longitude": storeLocation[i][2] } };
            showArea(coords, true);
          }

        }
      } // end add markers

      function pinSymbol(color, height) {
        return {
          path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
          fillColor: color,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2,
          scale: height
        }
      }

      // zoom and center to a specific area
      function showArea(position, comingFromClick) {
        var clat = position.coords.latitude
        var clng = position.coords.longitude
        map.setCenter(new google.maps.LatLng(clat, clng))

        map.setZoom(defaultAreaZoom);

        if (comingFromClick) navigator.geolocation.getCurrentPosition(showMyself);
        else (showMyself(position));

        function showMyself(pos) {
          mygeo = pos;

          var plat = pos.coords.latitude
          var plng = pos.coords.longitude
          myself = new google.maps.Marker({
            position: new google.maps.LatLng(plat, plng),
            map: map,
            icon:
            {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12.5,
              fillColor: "#337ab7",
              fillOpacity: 0.8,
              strokeColor: 'white',
              strokeWeight: 1
            },
            zIndex: 4
          })
        }
      }

      // start the instance
      initialize();

      // go directly to the store if it's set in the query string
      var store;
      if (window.location.search.indexOf("store=") !== -1) {
        var spl = window.location.search.split("store=");
        if (spl.length > 1) {
          store = spl[1].split("&")[0];
          store = store.replace("{", "").replace("}", "");
          addMarkers(store);
        }
      }

      // no selected store, load all markers and geolocate
      if (!store) {
        addMarkers();
        navigator.geolocation.getCurrentPosition(showArea);
      }

    } // length function
  }); // jquery ready
} // initmap

// Stupid jQuery table plugin.

(function($) {
  $.fn.sortTableJS = function(sortFns) {
    return this.each(function() {
      var $table = $(this);
      sortFns = sortFns || {};
      sortFns = $.extend({}, $.fn.sortTableJS.default_sort_fns, sortFns);
      $table.data('sortFns', sortFns);

      $table.on("click.sortTableJS", "thead th", function() {
          $(this).stupidsort();
      });
    });
  };


  // Expects $("#mytable").sortTableJS() to have already been called.
  // Call on a table header.
  $.fn.stupidsort = function(force_direction){
    var $this_th = $(this);
    var th_index = 0; // we'll increment this soon
    var dir = $.fn.sortTableJS.dir;
    var $table = $this_th.closest("table");
    var datatype = $this_th.data("sort") || null;

    // No datatype? Nothing to do.
    if (datatype === null) {
      return;
    }

    // Account for colspans
    $this_th.parents("tr").find("th").slice(0, $(this).index()).each(function() {
      var cols = $(this).attr("colspan") || 1;
      th_index += parseInt(cols,10);
    });

    var sort_dir;
    if(arguments.length == 1){
        sort_dir = force_direction;
    }
    else{
        sort_dir = force_direction || $this_th.data("sort-default") || dir.ASC;
        if ($this_th.data("sort-dir"))
           sort_dir = $this_th.data("sort-dir") === dir.ASC ? dir.DESC : dir.ASC;
    }

    // Bail if already sorted in this direction
    if ($this_th.data("sort-dir") === sort_dir) {
      return;
    }
    // Go ahead and set sort-dir.  If immediately subsequent calls have same sort-dir they will bail
    $this_th.data("sort-dir", sort_dir);

    $table.trigger("beforetablesort", {column: th_index, direction: sort_dir});

    // More reliable method of forcing a redraw
    $table.css("display");

    // Run sorting asynchronously on a timout to force browser redraw after
    // `beforetablesort` callback. Also avoids locking up the browser too much.
    setTimeout(function() {
      // Gather the elements for this column
      var column = [];
      var sortFns = $table.data('sortFns');
      var sortMethod = sortFns[datatype];
      var trs = $table.children("tbody").children("tr");

      // Extract the data for the column that needs to be sorted and pair it up
      // with the TR itself into a tuple. This way sorting the values will
      // incidentally sort the trs.
      trs.each(function(index,tr) {
        var $e = $(tr).children().eq(th_index);
        var sort_val = $e.data("sort-value");

        // Store and read from the .data cache for display text only sorts
        // instead of looking through the DOM every time
        if(typeof(sort_val) === "undefined"){
          var txt = $e.text();
          $e.data('sort-value', txt);
          sort_val = txt;
        }
        column.push([sort_val, tr]);
      });

      // Sort by the data-order-by value
      column.sort(function(a, b) { return sortMethod(a[0], b[0]); });
      if (sort_dir != dir.ASC)
        column.reverse();

      // Replace the content of tbody with the sorted rows. Strangely
      // enough, .append accomplishes this for us.
      trs = $.map(column, function(kv) { return kv[1]; });
      $table.children("tbody").append(trs);

      // Reset siblings
      $table.find("th").data("sort-dir", null).removeClass("sorting-desc sorting-asc");
      $this_th.data("sort-dir", sort_dir).addClass("sorting-"+sort_dir);

      $table.trigger("aftertablesort", {column: th_index, direction: sort_dir});
      $table.css("display");
    }, 10);

    return $this_th;
  };

  // Call on a sortable td to update its value in the sort. This should be the
  // only mechanism used to update a cell's sort value. If your display value is
  // different from your sort value, use jQuery's .text() or .html() to update
  // the td contents, Assumes sortTableJS has already been called for the table.
  $.fn.updateSortVal = function(new_sort_val){
  var $this_td = $(this);
    if($this_td.is('[data-sort-value]')){
      // For visual consistency with the .data cache
      $this_td.attr('data-sort-value', new_sort_val);
    }
    $this_td.data("sort-value", new_sort_val);
    return $this_td;
  };

  // ------------------------------------------------------------------
  // Default settings
  // ------------------------------------------------------------------
  $.fn.sortTableJS.dir = {ASC: "asc", DESC: "desc"};
  $.fn.sortTableJS.default_sort_fns = {
    "int": function(a, b) {
      return parseInt(a, 10) - parseInt(b, 10);
    },
    "float": function(a, b) {
      return parseFloat(a) - parseFloat(b);
    },
    "string": function(a, b) {
      return a.toString().localeCompare(b.toString());
    },
    "string-ins": function(a, b) {
      a = a.toString().toLocaleLowerCase();
      b = b.toString().toLocaleLowerCase();
      return a.localeCompare(b);
    }
  };
})(jQuery);

$(window).ready(function () {
    if ($('#superHero').length) {
        gsap.registerPlugin(DrawSVGPlugin, ScrollToPlugin, ScrollTrigger);

        TweenLite.set(window, { scrollTo: 0 });

        gsap.set("#Oval", { drawSVG: "0%" });
    }


    //list variables here
    var gciPlus = $(".super-hero .small-button img");
    var superheroTitle = $(".super-hero .title");
    var superheroSubtitle = $(".super-hero .subtitle");
    var superheroDescription = $(".super-hero .description");
    var superheroDemo = $(".super-hero #demo");
    var superheroCta = $(".super-hero .cta .cta-text");
    var r = 0;
    $(".super-hero").addClass("scrollMe");
    var beginAnimation = $('#superHero').attr("data-elementappearancedelay");
    var cookieName = $('#superHero').attr("data-cookieid");
    var cookieLength = Number($('#superHero').attr("data-cookielength"));
    
    superHeroSetup();

    // this function will set up the superhero page to include a cloned nav
    function superHeroSetup() {
        $("header").clone().prependTo(".super-hero");
        $("#superHero header .d-lg-flex").remove();
        $(".super-hero header").addClass("super-hero-header");
        $(".super-hero-header").find("nav").removeClass("navbar-expand-lg");
        $("#superHero").siblings(".theme-gcib:not(.footer)").find("header").css("background", "#fff");
        $(".super-hero .ctatwo a").addClass("hideSuperHero");
        $(".super-hero").siblings(".ctathree").find("a").addClass("showSuperHero");
        $("#superHero .cta a").css("pointer-events", "none");
        if ($("#superHero").is(":visible")) {
            $("#superHero").parent("body").addClass("stop-scroll");
            $("body.stop-scroll").parent("html").addClass("stop-scroll");
        }
        

        determineVideo();
    }




    //Check to see if they have skipped the Super Hero already

    function checkCookies() {
        //Check if cookie exists
        if ($.cookie(cookieName)) {
           // alert("Cookie exists");
            $("#superHero").hide();
            $("body").removeClass("stop-scroll");
            $("html").removeClass("stop-scroll");
        } else {
          //  alert("No Cookie Exists with the name of: " + cookieName);

            runAnimation();
            
            
        }
        
    }


    $(".ctatwo > a").on('click', function () {
        if (!$.cookie(cookieName)) {
            $.cookie(cookieName, 1, { expires: cookieLength });
        }
    });

    function determineVideo() {
        //Check to see if the super hero is on the page
        if ($('#superHero').length) {
            //Check the device orientation
            if (window.innerHeight > window.innerWidth) {
                //alert("Portrait!");
                $('#shVideo').attr('src', $('#superHero').attr("data-vertical"));
                $("#superHero .super-hero-video iframe").addClass("vertical");
            }
            else {
                // alert("Landscape!");
                $('#shVideo').attr('src', $('#superHero').attr("data-horizontal"));
                $("#superHero .super-hero-video iframe").removeClass("vertical");
            }
        }
        // runAnimation();
        checkCookies();

    }
    if ($('#superHero').length) {
        gsap.utils.toArray(".smoothClick a").forEach(function (a) {
            a.addEventListener("click", function (e) {
                if ($(this).hasClass("hideSuperHero")) {
                    var scrollToHere = e.target.getAttribute("href");
                    $("#superHero").hide(100);
                    $("body").removeClass("stop-scroll");
                    $("html").removeClass("stop-scroll");
                    e.preventDefault();
                    gsap.to(window, {
                        duration: .5,
                        delay: .5,
                        scrollTo: scrollToHere,
                        onComplete: function () {


                        }
                    });
                }
                else if ($(this).hasClass("showSuperHero")) {
                    e.preventDefault();
                    $("#shVideo")[0].src += "?autoplay=1";
                    $("#gradientBorder").hide();
                    $("#superHero .cta a").css("pointer-events", "none");

                    gsap.to(window, {
                        duration: 1,
                        scrollTo: {
                            y: e.target.getAttribute("href"),
                            autoKill: false
                        }
                    });
                    $("#superHero").show();
                    $("body").addClass("stop-scroll");
                    $("html").addClass("stop-scroll");
                    figureMask();
                    runAnimation();
                }

            });
        });

    }


    function runAnimation() {
        var mainTimeline = gsap.timeline()
            .to("#cover", { duration: .5, delay: beginAnimation, ease: "power4.out", attr: { r: 83 } })
            .from(superheroDemo, { opacity: 0, scale: 5, duration: .5, ease: "power4.out" })
            .from(gciPlus, { duration: .75, ease: "power4.out", rotationY: 90 })
            .from(superheroCta, { opacity: 0, duration: .25, ease: "power4.out", })
            .from(superheroTitle, { opacity: 0, duration: .25, ease: "power4.out", y: 50 })
            .from(superheroSubtitle, { opacity: 0, duration: .25, ease: "power4.out", y: 50, onComplete: showHover })
            .from(superheroDescription, { opacity: 0, duration: .25, ease: "power4.out", y: 50, onComplete: showHover })

        if ($("#superHero").is(":visible")) {
            mainTimeline.play();
        }



    }




    function showHover() {
        var $button = $('#superHero .cta');
        $("#gradientBorder").show();
        $("#superHero .cta a").css("pointer-events", "");
        $button.on('mouseenter', function (e) {
            gsap.to("#cover", { duration: 1, ease: "power4.out", attr: { r: r } })
            gsap.fromTo("#Oval", { drawSVG: "0%" }, { duration: 1, drawSVG: "100%" })
        });

        $button.on('mouseleave', function (e) {
            gsap.to("#cover", { duration: 1, ease: "power4.out", attr: { r: 83 } })
            gsap.fromTo("#Oval", { drawSVG: "100%" }, { duration: 1, drawSVG: "0%" })
        });
    }


    function figureMask() {
        // find the minimum radius needed to cover
        // the entire SVG and center the circle 
        if ($('#superHero').length) {
            var data = document.querySelector("#goAway").getBBox();
            r = figureRadius(data.width, data.height);
            // if the image is visible
            // update the radius while resizing

            TweenMax.set("#cover", { attr: { r: r } });
        }

    }

    function figureRadius(w, h) {
        return Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2)) / 2;
    };

   figureMask();
    window.addEventListener("resize", figureMask);


  //  const sections = document.querySelectorAll(".scrollMe");

 //   function goToSection(section, anim) {
 //       gsap.to(window, {
  //          scrollTo: { y: section, autoKill: false },
  //          duration: 1,
  //          onComplete: elementAtTop()
  //      });

    //    if (anim) {
    //        anim.restart();
    //    }

    //    function elementAtTop(){
    //        console.log("element function runs");
    //        var distance = $(".ctathree").offset().top,
    //            $window = $(window);

    //            if ($window.scrollTop() >= distance) {
     //               $("#superHero").hide();
     //           }
   //     }
   // }

   // sections.forEach(section => {
   //     const intoAnim = gsap.timeline({ paused: true })

    //    ScrollTrigger.create({
    //        trigger: section,
    //        onEnter: () => goToSection(section, intoAnim)

    //    });

    //    ScrollTrigger.create({
    //        trigger: section,
    //        start: "bottom bottom",
    //        onEnterBack: () => goToSection(section),
    //    });
   // });

   

});

(function ($) {
    $slick_slider = $('.gci-scroller .mobile-scroll-wrapper');
    settings_slider = {
        arrows: true,
        centerMode: true,
        centerPadding: '10%',
        slidesToShow: 1,
        dots: true,
        infinite: false,
        draggable: true,
        cssEase: 'ease'
        // more settings
    }
   
    slick_on_mobile($slick_slider, settings_slider);

    // slick on mobile
    function slick_on_mobile(slider, settings) {
        $(window).on('load resize', function () {
            if ($(window).width() > 768) {
                if (slider.hasClass('slick-initialized')) {
                    slider.slick('unslick');
                }
                return
            }
            if (!slider.hasClass('slick-initialized')) {
                return slider.slick(settings);
            }
        });

        slider.on('init afterChange',
            function (event, slick, currentSlide, nextSlide) {
                $(this).removeClass("red-bg");
                if ($(this).find(".slick-current").find(".content-block").parent().hasClass("red-bg")) {
                    $(this).addClass("red-bg");
                }
                if (slick.$slides.length - 1 == currentSlide) {
                    $(".slick-next").hide();
                } else {
                    $(".slick-next").show();
                }

                if (currentSlide === 0) {
                    $(".slick-prev").hide();
                } else {
                    $(".slick-prev").show();
                }

                $(".slick-slide").first().addClass("hide-prev");
                if ($('.slick-current.hide-prev').length > 0) {
                    $(".slick-prev").hide();
                } else {
                    $(".slick-prev").show();
                }
            });


    };
})(jQuery);
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function (predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return -1.
            return -1;
        },
        configurable: true,
        writable: true
    });
}
(function ($) {
    if ($(window).width() < 1024) {
        $('.scroller .slides')
            .on('afterChange init', function (event, slick, direction) {
                console.log('afterChange/init', event, slick, slick.$slides);
                // remove all prev/next
                slick.$slides.removeClass('prevdiv').removeClass('nextdiv');

                // find current slide
                for (var i = 0; i < slick.$slides.length; i++) {
                    var $slide = $(slick.$slides[i]);
                    if ($slide.hasClass('slick-current')) {
                        // update DOM siblings
                        $slide.prev().addClass('prevdiv');
                        $slide.next().addClass('nextdiv');
                        break;
                    }
                }
            }
            )
            .on('beforeChange', function (event, slick) {
                // optional, but cleaner maybe
                // remove all prev/next
                slick.$slides.removeClass('prevdiv').removeClass('nextdiv');
            })
            .slick({
                // normal options...

                arrows: true,
                centerMode: true,
                slidesToShow: 1,
                dots: true,
                infinite: false,
                cssEase: 'linear',
                centerPadding: '25px'
            });


    }

})(jQuery);
$(function () {
    // Initialize form validation on the registration form.
    // It has the name attribute "registration"
    var userRequiredMsg = $(".sso-container").attr("data-userRequiredMsg");
    var passwordRequiredMsg = $(".sso-container").attr("data-passwordRequiredMsg");

    $("form[name='sso']").validate({
        // Specify validation rules
        rules: {
            username: {
                required: true,
                // Specify that email should be validated
                // by the built-in "email" rule
            },
            password: {
                required: true
            }
        },
        // Specify validation error messages
        messages: {
            password: {
                required: passwordRequiredMsg
            },
            username: userRequiredMsg
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function (form) {
            form.submit();
            moveErrorMsg();
        }
    });
});

//#################################################################################  EXTENSION CONFIGURATION  ############################################################################################//

// ORC Configured Career Site Link. Appropriate endpoint urls are: https://edqv-dev1.fa.us2.oraclecloud.com, https://edqv-test.fa.us2.oraclecloud.com or https://edqv.fa.us2.oraclecloud.com.
// Values are driven through Sitecore configuration (Gci.Feature.Careers.config)
const _EXT_HCM_BASE_URL = $("#_EXT_HCM_main-wrapper").attr("data-ext-hcm-base-url");
/*const _EXT_HCM_TITLE_ERROR = 'Could not find any results matching your criteria';*/
const _EXT_HCM_LOCATION_ERROR = 'Could not find any matching locations.';

/* The following entries will be whitelisted to resolve CORS errors. Contact Matthew McNeil (mmcneil@gci.com) if 
 * modifying this list becomes necessary in the future.
 * 
 * https://www.gci.com
 * https://mc-08228167-436a-4f7f-b916-469355-cd.azurewebsites.net
 * https://mc-08228167-436a-4f7f-b916-469355-cd-staging.azurewebsites.net
 * https://cms.gci.com
 * https://mc-08228167-436a-4f7f-b916-469355-cm.azurewebsites.net
 * https://www-preview.gci.com
 * https://www-tst.gci.com
 * https://mc-fc67a1b4-783f-4b07-b231-281098-cd.azurewebsites.net
 * https://cms-tst.gci.com
 * https://mc-fc67a1b4-783f-4b07-b231-281098-cm.azurewebsites.net
 * https://www-previewtst.gci.com
 * https://local.gci.com
 * 
 */

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

$(document).ready(function () {

    if ($("#_EXT_HCM_main-wrapper").length > 0) {
        /*document.getElementById('_EXT_HCM_TITLE_ERROR').innerHTML = _EXT_HCM_TITLE_ERROR;*/
        document.getElementById('_EXT_HCM_LOCATION_ERROR').innerHTML = _EXT_HCM_LOCATION_ERROR;
        document.getElementById('_EXT_HCM_title-loader').style.display = "none";
        document.getElementById('_EXT_HCM_location-loader').style.display = "none";
        /*document.getElementById('_EXT_HCM_TITLE_ERROR').style.display = "none";*/
        document.getElementById('_EXT_HCM_LOCATION_ERROR').style.display = "none";


        //var searchRequest = null;
        var minlength = 2;
        responseData = [];
        searchResults = [];
        locationResults = [];
    }

    $('#_EXT_HCM_search-btn').click(function () {
        var searchValue = document.getElementById('_EXT_HCM_title-search').value;
        var locationValue = document.getElementById('_EXT_HCM_location-search').value;
        window.open(_EXT_HCM_BASE_URL + '/hcmUI/CandidateExperience/en/sites/CX_1/requisitions?' + 'keyword=' + searchValue + '&location=' + locationValue, '_blank');
    });


    //###################################################################################   TITLE SEARCH   #####################################################################################################
    $("#_EXT_HCM_title-search").keyup(function () {
        var that = this,
            value = $(this).val();

        if (value.length >= minlength) {

            document.getElementById('_EXT_HCM_title-loader').style.display = "block";

            /* if (searchRequest != null)
                 searchRequest.abort();*/
            searchRequest = $.ajax({
                type: "GET",
                url: _EXT_HCM_BASE_URL + "/hcmRestApi/resources/latest/recruitingCESearchAutoSuggestions?expand=all&onlyData=true&finder=findByKey;" + 'string=' + value + '&limit=5',
                success: function (response) {

                    //For testing purpose(Job title)
                    /*response = {
                                     "items" : [ {
                                       "Id" : null,
                                       "Name" : "Project Manager",
                                       "Level" : 0,
                                       "City" : null,
                                       "State" : null,
                                       "Country" : null
                                     }, {
                                       "Id" : null,
                                       "Name" : "Project Lead",
                                       "Level" : 0,
                                       "City" : null,
                                       "State" : null,
                                       "Country" : null
                                     },
                                      {
                                       "Id" : null,
                                       "Name" : "Project Lead2",
                                       "Level" : 0,
                                       "City" : null,
                                       "State" : null,
                                       "Country" : null
                                     }, {
                                       "Id" : null,
                                       "Name" : "Project Lead3",
                                       "Level" : 0,
                                       "City" : null,
                                       "State" : null,
                                       "Country" : null
                                     }, {
                                       "Id" : null,
                                       "Name" : "Project Lead4",
                                       "Level" : 0,
                                       "City" : null,
                                       "State" : null,
                                       "Country" : null
                                     }, {
                                       "Id" : null,
                                       "Name" : "Project Lead5",
                                       "Level" : 0,
                                       "City" : null,
                                       "State" : null,
                                       "Country" : null
                                     } ],
                                     "count" : 2,
                                     "hasMore" : false,
                                     "limit" : 5,
                                     "offset" : 0,
                                     "links" : [ {
                                       "rel" : "self",
                                       "href" : "https://efch-test.fa.us2.oraclecloud.com:443/hcmRestApi/resources/11.13.18.05/recruitingCESearchAutoSuggestions",
                                       "name" : "recruitingCESearchAutoSuggestions",
                                       "kind" : "collection"
                                     } ]
                                   }*/
                    searchResults = [];
                    if (response.items.length > 0) {
                    }
                    response.items.forEach(function (item) {
                        searchResults.push(item.Name);
                    });
                    document.getElementById('_EXT_HCM_title-loader').style.display = "none";
                    /*if(searchResults.length==0 && value.length >= minlength){
                       document.getElementById('_EXT_HCM_TITLE_ERROR').style.display = "block";
                    }
                    else{
                       document.getElementById('_EXT_HCM_TITLE_ERROR').style.display = "none";
                    }*/
                    _EXT_HCM_autocomplete(document.getElementById("_EXT_HCM_title-search"), searchResults);

                }
            });
        }
        /* else{
          document.getElementById('_EXT_HCM_TITLE_ERROR').style.display = "none";
         }*/
    });

    //###################################################################################   LOCATION SEARCH  ###################################################################################################
    $("#_EXT_HCM_location-search").keyup(function () {
        var that = this,
            value = $(this).val();
        if (value.length >= minlength) {

            document.getElementById('_EXT_HCM_location-loader').style.display = "block";
            /*if (searchRequest != null)
                searchRequest.abort();*/
            searchRequest = $.ajax({
                type: "GET",
                url: _EXT_HCM_BASE_URL + "/hcmRestApi/resources/latest/recruitingCESearchAutoSuggestions?expand=all&onlyData=true&finder=findByLoc;" + 'string=' + value + '&limit=5',
                success: function (response) {

                    // For testing purpose(Location)

                    /* response = {
                      "items": [{
                       "Id": "300000036892054",
                       "Name": "Mockingbird > TX > United States",
                       "Level": 3,
                       "City": "Mockingbird",
                       "State": "TX",
                       "Country": "United States"
                      }, {
                       "Id": "300000001329450",
                       "Name": "Moca > PR > United States",
                       "Level": 3,
                       "City": "Moca",
                       "State": "PR",
                       "Country": "United States"
                      }, {
                       "Id": "300000036891409",
                       "Name": "Mocanaqua > PA > United States",
                       "Level": 3,
                       "City": "Mocanaqua",
                       "State": "PA",
                       "Country": "United States"
                      }, {
                       "Id": "300000001291233",
                       "Name": "Moccasin > AZ > United States",
                       "Level": 3,
                       "City": "Moccasin",
                       "State": "AZ",
                       "Country": "United States"
                      }, {
                       "Id": "300000001293946",
                       "Name": "Moccasin > CA > United States",
                       "Level": 3,
                       "City": "Moccasin",
                       "State": "CA",
                       "Country": "United States"
                      }],
                      "count": 5,
                      "hasMore": true,
                      "limit": 5,
                      "offset": 0,
                      "links": [{
                       "rel": "self",
                       "href": "https://efch-test.fa.us2.oraclecloud.com:443/hcmRestApi/resources/11.13.18.05/recruitingCESearchAutoSuggestions",
                       "name": "recruitingCESearchAutoSuggestions",
                       "kind": "collection"
                      }]
                     };*/


                    locationResults = [];
                    response.items.forEach(function (item) {
                        combinedName = item.City + ", " + item.State + ", " + item.Country;
                        locationResults.push(combinedName);
                    });
                    document.getElementById('_EXT_HCM_location-loader').style.display = "none";
                    if (locationResults.length == 0 && value.length >= minlength) {
                        document.getElementById('_EXT_HCM_LOCATION_ERROR').style.display = "block";
                    } else {
                        document.getElementById('_EXT_HCM_LOCATION_ERROR').style.display = "none";
                    }
                    _EXT_HCM_autocomplete(document.getElementById("_EXT_HCM_location-search"), locationResults);

                }
            });
        } else {
            document.getElementById('_EXT_HCM_LOCATION_ERROR').style.display = "none";
        }
    });

    //###################################################################################   AUTOCOMPLETE COMPONENT SCRIPT   ####################################################################################

    function _EXT_HCM_autocomplete(inp, arr) {
        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function (e) {
            var a, b, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) {
                return false;
            }
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "_EXT_HCM_autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                // if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase())
                if ((arr[i].toUpperCase()).indexOf(val.toUpperCase()) !== -1) {
                    /*create a DIV element for each matching element:*/
                    b = document.createElement("DIV");
                    /*make the matching letters bold:*/
                    //b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                    b.innerHTML = arr[i].substr(0, val.length);
                    b.innerHTML += arr[i].substr(val.length);
                    /*insert a input field that will hold the current array item's value:*/
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener("click", function (e) {
                        /*insert the value for the autocomplete text field:*/
                        inp.value = this.getElementsByTagName("input")[0].value;
                        /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        });

        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName("_EXT_HCM_autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }

        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }
});
$(document).ready(function () {
  $('.device-carousel .devices-in-carousel')
    .slick({
      arrows: true,
      slidesToShow: 4,
      infinite: false,
      centerMode: false,
      focusOnSelect: true,
      responsive: [
        {
          breakpoint: 1025,
          settings: {
            slidesToShow: 3
          }
        },
        {
          breakpoint: 770,
          settings: {
            slidesToShow: 2
          }
        }
      ]
    });
});


var Step = (function ($, window, document, undefined) {

    var api = {};
    var stepObj;
    var defaults = {};

    function step(component, index, options, parent) {
        stepObj = this;

        this.component = component;
        this.index = index;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);
        this.planBuilders = [];
        this.isStepValid = !(this.options.validate);
        
        this.ctaStepInfo = {
            url: stepObj.options.linkUrl,
            class: stepObj.options.linkClass,
            description: stepObj.options.linkDescription
        };

        this.cta2StepInfo = {
            url: stepObj.options.link2Url,
            class: stepObj.options.link2Class,
            description: stepObj.options.link2Description
        };

        // events
        this.component.on("step:planBuilderInfoUpdate", function (event, planBuilderInfo, step) {
            if (!step.options.validate) {
                step.isStepValid = true;
            } else {
                // assume one plan builder per step?
                step.isStepValid = planBuilderInfo.items.length > 0;
            }
            if (planBuilderInfo.addToCartFnText !== "" && planBuilderInfo.addToCartFnText !== undefined) {
                step.ctaStepInfo.description = planBuilderInfo.addToCartFnText;
            }
            else if (planBuilderInfo.skipToStepText !== "" && planBuilderInfo.skipToStepText !== undefined) {
                step.ctaStepInfo.description = planBuilderInfo.skipToStepText;
            }

            stepObj.parent.component.trigger("stepped:planbuilderupdate", [planBuilderInfo, step.isStepValid, step.ctaStepInfo]);

        });


        // add plan builders for step
        $.each(component.find("div.PlanBuilder"), function (index, value) {
            var options = {}
            var comp = $(value);
            options.id = comp.data("planbuilder-id");
            options.type = comp.data("planbuilder-type");
            
            if (stepObj.parent.cartInfo.length > 0) {

                var selectedIndex = stepObj.parent.cartInfo.findIndex(function (e) {
                    return e.id == options.id;
                });
                if (selectedIndex > -1) {
                    options.selected = stepObj.parent.cartInfo[selectedIndex];
                    stepObj.isStepValid = true;
                }
            } else if(index === 0) { // only preselect first step
                options.autoSelectItems = stepObj.parent.autoSelectItems;
            }

            var planBuilder = new window[options.type].initInstance(comp, options, index, stepObj);
            stepObj.planBuilders.push(planBuilder);
            
        });
    }

    api.init = function (component, index, parent) {
        // set first step as visible and hide the rest
        var options = {}
        var comp = $(component);
        options.id = comp.data("step-id");
        options.title = comp.data("step-name");
        options.validate = comp.data("validate-step");
        options.linkUrl = comp.data("step-cta-href");
        options.linkClass = comp.data("step-cta-class");
        options.linkDescription = comp.data("step-cta-description");
        options.link2Url = comp.data("step-cta2-href");
        options.link2Class = comp.data("step-cta2-class");
        options.link2Description = comp.data("step-cta2-description");

        return new step(comp, index, options, parent);
    }

    return api;

})(jQuery, window, document);
(function ($, window, document, undefined) {



    window.GCI = window.GCI || {};
    window.GCI.components = window.GCI.components || {};
    window.GCI.components.stepped = [];
    var api = {};
    var steppedObj;
    var defaults = {
        cookieId: "SteppedComponent",
        lastStepStickyFooterText: "Update item in cart"
    };

    var nav = $('.header').outerHeight();
    function scollToTop() {
        $("html, body").animate({ scrollTop: nav }, "slow");
    }

    var Stepped = function () { }

    Stepped.prototype.init = function (component, options) {
        steppedObj = this;

        this.component = component;
        this.options = $.extend({}, defaults, options);
        this.steps = [];
        this.currentStep = null;
        this.cartInfo = [];
        this.autoSelectItems = [];

        // ?&mode=modify&cartItemID=1028
        this.mode = this.getUrlParameter("mode");
        this.existingCartId = this.getUrlParameter("cartItemID");
        if (this.mode === "modify" && this.existingCartId.length > 0) {
            // enable edit mode
            this.cartInfo = this.readCookie();
        } else {
            this.existingCartId = -1;

            var autoSelect = this.getUrlParameter("preselect");
            if (autoSelect !== null && autoSelect.length > 0) {
                this.autoSelectItems = autoSelect.split("|");
            }
        }

        // cta buttons (back and next step)
        this.nextStepLink = component.find("a.SteppedMoveNextLink");
        this.nextStepLinkDefaultCss = this.nextStepLink.attr("class");
        this.nextStepLink.hide();
        this.previousStepLink = component.find("a.BackCta");
        this.previousStepLinkCss = this.previousStepLink.attr("class");
        this.skipToStepIndex = [];
        this.skipToStepText = "";
        this.addToCartFn = "";
        this.addToCartFnText = "";

        // add events
        $(component).on("stepped:planbuilderupdate", function (event, cartInfo, isValid, ctaStepInfo) {
            var index = steppedObj.cartInfo.findIndex(function (item) {
                return item.id == cartInfo.id;
            });

            if (index > -1) {
                steppedObj.cartInfo.splice(index, 1);
            }

            steppedObj.addToCartFn = cartInfo.addToCartFn;
            steppedObj.addToCartFnText = cartInfo.addToCartFnText;

            steppedObj.skipToStepText = ctaStepInfo.skipToStepText;
            if (null !== steppedObj.currentStep) {
                steppedObj.skipToStepIndex[steppedObj.currentStep.index] = cartInfo.skipToStepIndex;
            }

            steppedObj.cartInfo.push(cartInfo);
            steppedObj.updateStickyFooter(isValid, ctaStepInfo);
        });

        $(this.nextStepLink).on("click", function (event) {
            event.preventDefault();
            steppedObj.moveToNextStep(steppedObj.currentStep);
            scollToTop();
        });

        $(this.previousStepLink).on("click", function (event) {
            event.preventDefault();
            steppedObj.moveToPreviousStep(steppedObj.currentStep);
            scollToTop();
        });

        // add each step
        $.each(component.find("div.SteppedPanel"), function (index, value) {
            var step = Step.init(value, index, steppedObj);

            // hide all steps but the first
            step.component.addClass('hidden-step');
            if (index === 0) {
                step.component.removeClass('hidden-step');
                steppedObj.nextStepLink.addClass(step.options.linkClass);
                steppedObj.nextStepLink.html(step.options.linkDescription);
            }
            steppedObj.steps.push(step);

            // Default all the next step values
            steppedObj.skipToStepIndex.push(-1);
        });


        // setup first step
        this.currentStep = this.steps[0];
        this.updateStickyFooter(this.currentStep.isStepValid, this.currentStep.ctaStepInfo);
        scollToTop();
        $('[data-addplan-uniqueid], [data-dataplan-id]').each(function (index) {
            this.dataset.planIndex = index;
        });
    }

    Stepped.prototype.updateStickyFooter = function (isValid, ctaStepInfo) {
        // update subtotal field
        var subtotal = 0.0000;
        this.cartInfo.forEach(function (plan) {
            plan.items.forEach(function (item) {
                subtotal += parseFloat(item.price);
            });
        });
        this.component.find("span.amount").text("$" + subtotal.toFixed(2));

        this.updateStickyFooterCta(ctaStepInfo, isValid);
    }

    Stepped.prototype.updateStickyFooterCta = function (ctaStepInfo, showCta) {
        if (this.currentStep !== null && this.mode === "modify" && this.currentStep.index + 1 === this.steps.length) {
            this.nextStepLink.text(this.options.lastStepStickyFooterText);
        } else {
            this.nextStepLink.text(ctaStepInfo.description);
        }

        this.nextStepLink.attr("class", this.nextStepLinkDefaultCss + " " + ctaStepInfo.class);

        if (showCta) {
            this.nextStepLink.show();
        } else {
            this.nextStepLink.hide();
        }
    }

    Stepped.prototype.addToCartCta = function (ctaStepInfo) {
       this.createCookie();
       this.addToDB(function () {
        $(ctaStepInfo.url).modal('show');
        });
    }

    Stepped.prototype.moveToNextStep = function (stepObj) {
        var currentStepIndex = stepObj.index;
        ReplaceNumOfLinesWithNewCookieValue("gci_cart", "numberOfLines");

        if (currentStepIndex + 1 === this.steps.length) {
            // write cookie
            this.createCookie();
            this.addToDB(function () {
                if (!stepObj.ctaStepInfo.url.startsWith("#")) {
                    window.location = stepObj.ctaStepInfo.url;
                } else {
                    // assume modal window needs to be shown
                    $(stepObj.ctaStepInfo.url).modal('show');
                }
            });
        } else {
            this.currentStep = this.steps[currentStepIndex + 1];
            this.nextStepLink.hide();
            this.steps[currentStepIndex].component.addClass('hidden-step');
            if (this.addToCartFn !== "") {
                this.currentStep.ctaStepInfo.description = this.addToCartFnText;
                this.currentStep.ctaStepInfo.url = this.addToCartFn;
                this.addToCartCta(this.currentStep.ctaStepInfo);
                this.steps[currentStepIndex].component.removeClass('hidden-step');
            }
            else if (this.skipToStepIndex[currentStepIndex] > -1) {
                // Skip steps if field in Sitecore is set
                this.createBackToStepCookie(currentStepIndex);
                this.steps[this.skipToStepIndex[currentStepIndex]].component.removeClass('hidden-step');
                this.currentStep = this.steps[this.skipToStepIndex[currentStepIndex]];
                this.currentStep.ctaStepInfo.description = this.skipToStepText;
                this.updateStickyFooterCta(this.currentStep.ctaStepInfo, this.steps[this.skipToStepIndex[currentStepIndex]].isStepValid);
            }
            else {
                this.steps[currentStepIndex + 1].component.removeClass('hidden-step');
                this.updateStickyFooterCta(this.currentStep.ctaStepInfo, this.steps[currentStepIndex + 1].isStepValid);
            }

        }

        var defaultItems = $('.SteppedPanel:not(.hidden-step) [data-default-selected]');
        defaultItems.each(function () {
            $(this).click();
            $(this).removeAttr('data-default-selected');
        });

        $(window).trigger('resize.planbuilder');
    }

    Stepped.prototype.moveToPreviousStep = function (stepObj) {
        var skippedStepCookie = this.getCookie('planbuilderSkippedStep');
        ReplaceNumOfLinesWithNewCookieValue("gci_cart", "numberOfLines");
        var currentStepIndex = stepObj.index;
        if (currentStepIndex - 1 < 0) {
            window.location = stepObj.cta2StepInfo.url;
        } else {
            this.currentStep = this.steps[currentStepIndex - 1];
            this.nextStepLink.hide();
            this.steps[currentStepIndex].component.addClass('hidden-step');
            if (skippedStepCookie) {
                this.removeBackToStepCookie();
                this.steps[skippedStepCookie].component.removeClass('hidden-step');
                this.currentStep = this.steps[skippedStepCookie];
                this.previousStepLink.text(this.currentStep.cta2StepInfo.linkDescription);
                this.previousStepLink.attr("class", this.previousStepLinkCss + " " + this.currentStep.cta2StepInfo.linkClass);
                this.updateStickyFooterCta(this.currentStep.ctaStepInfo, this.steps[skippedStepCookie].isStepValid);

            }
            else {
                this.steps[currentStepIndex - 1].component.removeClass('hidden-step');
                this.previousStepLink.text(this.currentStep.cta2StepInfo.linkDescription);
                this.previousStepLink.attr("class", this.previousStepLinkCss + " " + this.currentStep.cta2StepInfo.linkClass);
                this.updateStickyFooterCta(this.currentStep.ctaStepInfo, true);
            }
        }
    }

    Stepped.prototype.createCookie = function () {
        var cookie = [this.options.cookieId, '=', JSON.stringify(this.cartInfo), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
        document.cookie = cookie;
    }

    Stepped.prototype.createBackToStepCookie = function (currentStepIndex) {
        var cookie = 'planbuilderSkippedStep=' +
            currentStepIndex +
            '; domain=.' +
            window.location.host.toString() +
            '; path=/;';
        document.cookie = cookie;
    }

    Stepped.prototype.removeBackToStepCookie = function () {
        var cookie = 'planbuilderSkippedStep=;domain=.' +
            window.location.host.toString() +
            '; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        document.cookie = cookie;
    }

    Stepped.prototype.getCookie = function (cookieName) {
        var nameEQ = cookieName + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    Stepped.prototype.addToDB = function (callback) {
        var model = {};
        
        if (this.options.keycodeId === 26 || this.options.keycodeId === 21) {
            // GCIC-3914
            // This fixes cart ordering issues on 
            this.cartInfo.forEach(function (item) {
                item.items.sort(function (a, b) {
                    if (a.index === b.index)
                        return 0;

                    if (parseInt(a.index) > parseInt(b.index))
                        return 1;
                    else
                        return -1;
                });
            });

            this.cartInfo.sort(function (a, b) {
                if (a.items === undefined || a.items.length == 0 || b.items === undefined || b.items.length == 0)
                    return 0;
                if (a.items[0].index === b.items[0].index)
                    return 0;

                if (parseInt(a.items[0].index) > parseInt(b.items[0].index))
                    return 1;
                else
                    return -1;
            });
        }

        model.CartItemType = this.options.keycodeId;
        model.UID = this.cartInfo[0].items[0].id;
        model.Name = "";
        model.ReferenceNumber = getReferenceNumber();
        model.CartId = checkReferenceNumber();//model.ReferenceNumber;
        model.EditUrl = window.location.href.split(/[?#]/)[0]; //This request doesn't work in postman for some reason.
        model.DeleteShoppingCartId = this.existingCartId;
        model.ItemId = this.cartInfo[0].items[0].id;
        if (model.CartItemType === 21) { // No Worries Mobile Plan
            model.ShoppingCartChildren = [];

            this.cartInfo.forEach(function (item, index) {
                if (index > 0) {
                    item.items.forEach(function (item2, index2) {
                        var subItem = {};
                        subItem.CartItemType = 4; // product keycode
                        subItem.UID = 0;
                        subItem.ItemId = item2.id;
                        subItem.Quantity = item2.quantity;
                        model.ShoppingCartChildren.push(subItem);
                    });
                }
            });
        }
        else if (model.CartItemType === 26 || model.CartItemType === 35) {
            
            model.ShoppingCartChildren = [];
            var guidPattern = /^[a-zA-Z0-9\-]+$/;
            this.cartInfo.forEach(function (item, index) {
               
                if (index > 0) {
                    item.items.forEach(function (item2, index2) {
                       
                        //if (item2.addToCartFn) return; //mixedcontent item selected
                        var subItem = {};
                        if (item2.addToCartFn) {
                            subItem.CartItemType = 37;
                        } else {
                            subItem.CartItemType = item.keycode || 18; // product keycode
                        }
                        if (!(item2.id)) return;
                        if (!guidPattern.test(item2.id)) return; // false
                       
                        
                       // subItem.CartItemType = item.keycode || 18; // product keycode
                        subItem.UID = 0;
                        subItem.ItemId = item2.id;

                        subItem.Quantity = item2.quantity;
                       
                        model.ShoppingCartChildren.push(subItem);
                    });
                }
            });
        }
        else {
            model.Quantity = this.cartInfo[0].items[0].quantity;
        }

        var localThis = this;

        $.ajax({
            type: "POST",
            url: '/api/v1/shoppingcartprocessor',
            data: model,
            success: function (data) {
                if (getReferenceNumber() == "") {
                    setReferenceNumber(data.ReferenceNumber);
                }

                // set a cookie indicating which stepped plans are active, so we can modify the selections if changes are made in the cart context
                var cookieName = "gci_planbuilders";
                var planBuilders = $.cookie(cookieName);

                if (planBuilders !== undefined) {
                    var carryover = [];
                    var existing = JSON.parse(planBuilders);
                    existing.forEach(function(plan) {
                        if (plan.cookie !== localThis.options.cookieId) carryover.push(plan);
                    });
                  planBuilders = carryover;
                } else planBuilders = [];

                planBuilders.push({ "cookie": localThis.options.cookieId, "plan": model.UID });

                var cookie = [cookieName, '=', JSON.stringify(planBuilders), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
                document.cookie = cookie;

                callback();
            },
            error: function (data) {
            }
        });
    }

    Stepped.prototype.readCookie = function () {
        var result = document.cookie.match(new RegExp(this.options.cookieId + '=([^;]+)'));
        result && (result = JSON.parse(result[1]));
        return this.cartInfo = result !== null ? result : [];
    }

    Stepped.prototype.getUrlParameter = function (name, url) {
        if (!url)
            url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');

        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);

        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    api.initInstance = function (component, options) {
        if (options.editMode == "True")
            return;

        var stepped = new Stepped().init(component, options);
        window.GCI.components.stepped.push(stepped);
    }

    api.init = function () {
        var steppedComponents = $(".SteppedComponent:not(.initialized)");
        steppedComponents.each(function () {
            var options = {};
            var comp = $(this);
            options.cookieId = comp.data("cookie-id");
            options.keycodeId = comp.data("keycode-id");
            options.editMode = comp.data("editmode");
            api.initInstance(comp, options);
            comp.addClass("initialized");
        });
    };


    $(window).ready(function () {
        api.init();
        $(window).on('resize.planbuilder', function () {
            $('.PlanBuilder .copy-container.compare-plans').css('margin-left', $('.PlanBuilder .flex-container').css('margin-left'));
            $('.st-step-title:not(:first-child)').css('margin-left', $('.product-plan').css('margin-left'));
        });
        $(window).trigger('resize.planbuilder');
    });

    return api;



})(jQuery, window, document);
var planBuilderSelection = (function ($, window, document, undefined) {
	var api = {};

	var PlanBuilderSelection = function (id, keycode, cookieType, skipToStepIndex, skipToStepText, addToCartFn, addToCartFnText) {
		this.id = id;
		this.keycode = keycode;
		this.cookieType = cookieType;
		this.items = [];
		this.skipToStepIndex = skipToStepIndex;
		this.skipToStepText = skipToStepText;
		this.addToCartFn = addToCartFn;
		this.addToCartFnText = addToCartFnText;
    }

	PlanBuilderSelection.prototype.addItem = function (planBuilderItem) {
		var index = this.items.findIndex(function (item) {
			return item.id == planBuilderItem.id;
		});

		if (index > -1) {
			this.items.splice(index, 1);
		}

		this.items.push(planBuilderItem);
	}

	var PlanBuilderItem = function (id, quantity, price, options, index, addToCartFn) {
		this.id = id;
		this.quantity = quantity;
		this.price = price;
		this.options = options;
		this.index = index;
		this.addToCartFn = addToCartFn;
	}

	api.createNewPlanBuilderSelection = function (id, skipToStepIndex = -1, skipToStepText = "", addToCartFn = "", addToCartFnText = "", keycode, cookieType) {
        return new PlanBuilderSelection(id, keycode, cookieType, skipToStepIndex, skipToStepText, addToCartFn, addToCartFnText);
	}

	api.createNewPlanBuilderItem = function (id, quantity, price, options, index, addToCartFn) {
		if (index === undefined || isNaN(index)) {
			index = 999;
        }

		return new PlanBuilderItem(id, quantity, price, options, index, addToCartFn);
    }

	return api;

})(jQuery, window, document);

var planBuilderAddAuthoredContent = (function ($, window, document, undefined) {
    var api = {};
    var defaults = {
        selected: null
    };

    var planBuilderObj;

    var PlanBuilderAddAuthoredContent = function () { }

    PlanBuilderAddAuthoredContent.prototype.init = function (component, options, index, parent) {
        planBuilderObj = this;

        this.index = index;
        this.component = component;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);

        this.selectedContent = [];

        // get each plan
        this.authoredContents = [];

        $(component).on("planbuilder:selectAuthoredContent", function (event, authoredContent) {
            //var selectedIndex = authoredContent.parent.selectedContent.findIndex(function (e) {
            //    return e.options.uniqueId == authoredContent.options.uniqueId;
            //});

            var skpIndex = authoredContent.component.data("addauthoredcontent-skiptostep");
            var skpText = authoredContent.component.data("addauthoredcontent-skiptosteptext");
            var addToCartFn = authoredContent.component.data("addauthoredcontent-addtocartfn");
            var addToCartFnText = authoredContent.component.data("addauthoredcontent-addtocartfntext");
            planBuilderObj.selectedContent = authoredContent;
            planBuilderObj.selectedContent.options.skipToStepIndex = (skpIndex > -1 && skpIndex !== "") ? skpIndex : -1;
            planBuilderObj.selectedContent.options.skipToStepText = (skpText !== "" && skpText !== undefined) ? skpText : planBuilderObj.parent.options.linkDescription;
            planBuilderObj.selectedContent.options.addToCartFn = (addToCartFn !== "" && addToCartFn !== undefined) ? addToCartFn : "";
            planBuilderObj.selectedContent.options.addToCartFnText = (addToCartFnText !== "" && addToCartFnText !== undefined) ? addToCartFnText : "";

            //if (selectedIndex > -1) {
            //    // selected a authoredContent that is already selected. Treat as an deselect
            //    authoredContent.parent.selectedContent.splice(selectedIndex, 1);
            //} else {
            //    authoredContent.parent.selectedContent.push(authoredContent);
            //}
            
            //authoredContent.parent.NotifyPlanBuilderChange(authoredContent.parent);
            //authoredContent.parent.MarkProductsAsSelected();

            planBuilderObj.NotifyPlanBuilderChange();
            planBuilderObj.MarkProductsAsSelected();
        });

        $.each(component.find("div.AuthoredContent"), function (index, value) {
            var options = {};
            var comp = $(value);

            options.uniqueId = comp.data("addauthoredcontent-uniqueid");
            options.ctaSelect = comp.data("addauthoredcontent-cta-select");
            options.isFree = true;
            options.price = "0.00";
            options.ctaSelected = comp.data("addauthoredcontent-cta-selected");

            var authoredContent = new AuthoredContent(comp, options, index, planBuilderObj);
            planBuilderObj.authoredContents.push(authoredContent);

            if (planBuilderObj.options.selected !== null) {
                var selectedIndex = planBuilderObj.options.selected.items.findIndex(function (e) {
                    return e.id == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedContent.push(authoredContent);
                }
            }
        });

        if (this.selectedContent.length > 0) {
            this.MarkProductsAsSelected();
        }
    }

    PlanBuilderAddAuthoredContent.prototype.NotifyPlanBuilderChange = function () {
        if (this.selectedContent != null) {
            var selectedPlanInfo = planBuilderSelection.createNewPlanBuilderSelection(this.options.id, this.selectedContent.options.skipToStepIndex, this.selectedContent.options.skipToStepText, this.selectedContent.options.addToCartFn, this.selectedContent.options.addToCartFnText, 37, "TestCookieType"); // TODO: Make this dynamic somehow

            selectedPlanInfo.addItem(planBuilderSelection.createNewPlanBuilderItem(this.selectedContent.options.uniqueId, 1, this.selectedContent.options.price, {}, this.selectedContent.component[0].dataset.planIndex));
            this.parent.ctaStepInfo.description = this.selectedContent.options.skipToStepText;
            this.parent.component.trigger("step:planBuilderInfoUpdate", [selectedPlanInfo, this.parent]);
        }
    }

    PlanBuilderAddAuthoredContent.prototype.MarkProductsAsSelected = function () {

        this.authoredContents.forEach(function(authoredContent, index) {
            authoredContent.component.removeClass("selected plan");
            //plan.component.find("#cta-" + plan.options.uniqueId).parent().removeClass("selected");
            //plan.component.find("#cta-" + plan.options.uniqueId).text(plan.options.ctaSelect);
            $('.AuthoredContent[data-addauthoredcontent-uniqueid="' + authoredContent.options.uniqueId + '"] a').parent().removeClass("selected");
            $('.AuthoredContent[data-addauthoredcontent-uniqueid="' + authoredContent.options.uniqueId + '"] a').text(authoredContent.options.ctaSelect);
        });

        this.selectedContent.component.addClass("selected plan");
        $('.AuthoredContent[data-addauthoredcontent-uniqueid="' + this.selectedContent.options.uniqueId + '"] a').parent().addClass("selected");
        $('.AuthoredContent[data-addauthoredcontent-uniqueid="' + this.selectedContent.options.uniqueId + '"] a').text(this.selectedContent.options.ctaSelected);
        //this.component.find("#cta-" + this.selectedPlan.options.uniqueId).parent().addClass("selected");
        //this.component.find("#cta-" + this.selectedPlan.options.uniqueId).text(this.selectedPlan.options.ctaSelected);




        //    var selectedIndex = authoredContent.parent.selectedContent.findIndex(function (e) {
        //        return e.options.uniqueId == authoredContent.options.uniqueId;
        //    });

        //    if (selectedIndex > -1) {
        //        // mark as selected
        //        authoredContent.component.addClass("blue-background");
        //        authoredContent.component.find(".add-btn").addClass("added");
        //        //authoredContent.component.find("#cta-" + authoredContent.options.uniqueId).text(authoredContent.options.ctaSelected);
        //        $('.AuthoredContent[data-addauthoredcontent-uniqueid="' + authoredContent.options.uniqueId + '"] a').text(authoredContent.options.ctaSelected);
        //    } else {
        //        // mark as not selected
        //        authoredContent.component.removeClass("blue-background");
        //        authoredContent.component.find(".add-btn").removeClass("added");
        //        //authoredContent.component.find("#cta-" + authoredContent.options.uniqueId).text(authoredContent.options.ctaSelect);
        //        $('.AuthoredContent[data-addauthoredcontent-uniqueid="' + authoredContent.options.uniqueId + '"] a').text(authoredContent.options.ctaSelect);
        //    }
        //});

    }

    api.initInstance = function (component, options, index, parent) {
        options.skipToStepIndex = $(component).data("addauthoredcontent-skiptostep");
        options.skipToStepText = $(component).data("addauthoredcontent-skiptosteptext");
        return new PlanBuilderAddAuthoredContent().init(component, options, index, parent);
    }


    // authoredContent
    var AuthoredContent = function (component, options, index, parent) {
        this.index = index;
        this.component = component;
        this.options = options;
        this.parent = parent;

        $('.AuthoredContent[data-addauthoredcontent-uniqueid="' + this.options.uniqueId + '"] a').parent().on('click', { authoredContent: this }, function (event) {
            event.preventDefault();
            event.data.authoredContent.parent.component.trigger("planbuilder:selectAuthoredContent", event.data.authoredContent);
        });
    }

    return api;
})(jQuery, window, document);

var planBuilderAddData = (function ($, window, document, undefined) {
    var api = {};
    var defaults = {
        selected: null
    };

    var planBuilderObj;

    var PlanBuilderAddData = function () { }

    PlanBuilderAddData.prototype.init = function (component, options, index, parent) {
        planBuilderObj = this;

        this.index = index;
        this.component = component;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);

        this.selectedPlan = null;

        // get each plan
        this.plans = [];

        $(component).on("planbuilder:selectPlan", function (event, plan) {
            var skpIndex = plan.component.data("addauthoredcontent-skiptostep");
            var skpText = plan.component.data("addauthoredcontent-skiptosteptext");
            var addToCartFn = plan.component.data("addauthoredcontent-addtocartfn");
            var addToCartFnText = plan.component.data("addauthoredcontent-addtocartfntext");
            planBuilderObj.selectedPlan = plan;
            planBuilderObj.selectedPlan.options.skipToStepIndex = (skpIndex > -1 && skpIndex !== "") ? skpIndex : -1;
            planBuilderObj.selectedPlan.options.skipToStepText = (skpText !== "" && skpText !== undefined) ? skpText : planBuilderObj.parent.options.linkDescription;
            planBuilderObj.selectedPlan.options.addToCartFn = (addToCartFn !== "" && addToCartFn !== undefined) ? addToCartFn : "";
            planBuilderObj.selectedPlan.options.addToCartFnText = (addToCartFnText !== "" && addToCartFnText !== undefined) ? addToCartFnText : "";
            planBuilderObj.NotifyPlanBuilderChange();
            planBuilderObj.MarkPlanAsSelected();

        });

        

        $.each(component.find("div.DataPlan"), function (index, value) {
            var options = {};
            var comp = $(value);

            options.uniqueId = comp.data("dataplan-id");
            options.name = comp.data("dataplan-name");
            options.price = comp.data("dataplan-price");
            options.monthTitle = comp.data("dataplan-month-title");
            options.ctaSelect = comp.data("dataplan-cta-select");
            options.ctaSelected = comp.data("dataplan-cta-selected");

            var plan = new Plan(comp, options, index, planBuilderObj);
            planBuilderObj.plans.push(plan);

            if (planBuilderObj.options.selected !== null) {
                var selectedIndex = planBuilderObj.options.selected.items.findIndex(function (e) {
                    return e.id == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedPlan = plan;
                }
            } else if (planBuilderObj.options.autoSelectItems != null && planBuilderObj.options.autoSelectItems.length > 0) {
                var selectedIndex = planBuilderObj.options.autoSelectItems.findIndex(function (e) {
                    return e == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedPlan = plan;
                    planBuilderObj.NotifyPlanBuilderChange();
                }
            }
        });

        if (this.selectedPlan != null) {
            this.MarkPlanAsSelected();
            //this.NotifyPlanBuilderChange();
        }
    }

    PlanBuilderAddData.prototype.NotifyPlanBuilderChange = function () {
        if (this.selectedPlan != null) {
            var selectedPlanInfo = planBuilderSelection.createNewPlanBuilderSelection(this.options.id, this.selectedPlan.options.skipToStepIndex, this.selectedPlan.options.skipToStepText, this.selectedPlan.options.addToCartFn, this.selectedPlan.options.addToCartFnText);

            selectedPlanInfo.addItem(planBuilderSelection.createNewPlanBuilderItem(this.selectedPlan.options.uniqueId, 1, this.selectedPlan.options.price, {}, this.selectedPlan.component[0].dataset.planIndex));
            this.parent.ctaStepInfo.description = this.selectedPlan.options.skipToStepText;
            this.parent.component.trigger("step:planBuilderInfoUpdate", [selectedPlanInfo, this.parent]);;
        }
    }

    PlanBuilderAddData.prototype.MarkPlanAsSelected = function () {
        this.plans.forEach(function (plan, index) {
            plan.component.removeClass("selected");
            plan.component.find(".select-btn").removeClass("selected");
            //plan.component.find("#cta-" +plan.options.uniqueId).text(plan.options.ctaSelect);
            $('.DataPlan[data-dataplan-id="' + plan.options.uniqueId + '"] a').text(plan.options.ctaSelect);
        });
        
        this.selectedPlan.component.addClass("selected");
        $('.DataPlan[data-dataplan-id="' + this.selectedPlan.options.uniqueId + '"] a').parent().addClass("selected");
        $('.DataPlan[data-dataplan-id="' + this.selectedPlan.options.uniqueId + '"] a').text(this.selectedPlan.options.ctaSelected);
        //this.component.find("#cta-" + this.selectedPlan.options.uniqueId).parent().addClass("selected");
        //this.component.find("#cta-" + this.selectedPlan.options.uniqueId).text(this.selectedPlan.options.ctaSelected);
    }

    api.initInstance = function (component, options, index, parent) {
        return new PlanBuilderAddData().init(component, options, index, parent);
    }


    // plan
    var Plan = function (component, options, index, parent) {
        this.index = index;
        this.component = component;
        this.options = options;
        this.parent = parent;

        //this.component.find("#cta-" +this.options.uniqueId).on('click', { plan: this }, function (event) {
        $('.DataPlan[data-dataplan-id="' + this.options.uniqueId + '"] a').on('click', { plan: this }, function (event) {
            event.preventDefault();
            event.data.plan.parent.component.trigger("planbuilder:selectPlan", event.data.plan);
        });
    }

    return api;
})(jQuery, window, document);

var planBuilderAddDevice = (function ($, window, document, undefined) {
    var api = {};
    var defaults = {
        selected: null
    };

    var planBuilderObj;

    var PlanBuilderAddDevice = function () { }

    PlanBuilderAddDevice.prototype.init = function (component, options, index, parent) {
        planBuilderObj = this;

        this.index = index;
        this.component = component;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);

        this.selectedDevice = null;

        // get each device option
        this.devices = [];

        $(component).on("planbuilder:selectDevice", function (event, device) {
            planBuilderObj.selectedDevice = device;

            planBuilderObj.NotifyPlanBuilderChange();
            planBuilderObj.MarkDeviceAsSelected();
        });

        $.each(component.find("div.DeviceItem"), function (index, value) {
            var options = {};
            var comp = $(value);

            options.id = comp.data("adddevice-id");
            options.title = comp.data("adddevice-title");
            options.ctaSelect = comp.data("dataplan-cta-select");
            options.ctaSelected = comp.data("dataplan-cta-selected");

            var device = new Device(comp, options, index, planBuilderObj);
            planBuilderObj.devices.push(device);

            if (planBuilderObj.options.selected !== null) {
                var selectedIndex = planBuilderObj.options.selected.items.findIndex(function (e) {
                    return e.id == options.id;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedDevice = device;
                }
            } else if (planBuilderObj.options.autoSelectItems != null && planBuilderObj.options.autoSelectItems.length > 0) {
                var selectedIndex = planBuilderObj.options.autoSelectItems.findIndex(function (e) {
                    return e == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedDevice = plan;
                    planBuilderObj.NotifyPlanBuilderChange();
                }
            }
        });

        if (this.selectedDevice != null) {
            this.MarkDeviceAsSelected();
            //this.NotifyPlanBuilderChange();
        }
    }

    PlanBuilderAddDevice.prototype.NotifyPlanBuilderChange = function () {
        if (this.selectedDevice != null) {
            var selectedDeviceInfo = planBuilderSelection.createNewPlanBuilderSelection(this.options.id, this.selectedPlan.options.skipToStepIndex, this.selectedPlan.options.skipToStepText, this.selectedPlan.options.addToCartFn, this.selectedPlan.options.addToCartFnText, this.options.keycode);

            var options = {}
            options.name = this.selectedDevice.options.title;
            selectedDeviceInfo.addItem(planBuilderSelection.createNewPlanBuilderItem(this.selectedDevice.options.id, 1, 0, options));

            this.parent.component.trigger("step:planBuilderInfoUpdate", [selectedDeviceInfo, this.parent]);
        }
    }

    PlanBuilderAddDevice.prototype.MarkDeviceAsSelected = function () {
        this.devices.forEach(function (device, index) {
            device.component.removeClass("selected");
            device.component.find(".add-btn").removeClass("selected");
            device.component.find("#cta-" + device.options.id).text(device.options.ctaSelect);
        });
        this.selectedDevice.component.addClass("selected");
        this.component.find(".add-btn").addClass("selected");
        this.component.find("#cta-" + this.selectedDevice.options.id).text(this.selectedDevice.options.ctaSelected);
    }

    api.initInstance = function (component, options, index, parent) {
        options.keycode = $(component).data("planbuilder-keycode");
        return new PlanBuilderAddDevice().init(component, options, index, parent);
    }


    // device
    var Device = function (component, options, index, parent) {
        this.index = index;
        this.component = component;
        this.options = options;
        this.parent = parent;

        this.component.find("#cta-" + this.options.id).on('click', { device: this }, function (event) {
            event.preventDefault();
            event.data.device.parent.component.trigger("planbuilder:selectDevice", event.data.device);
        });
    }

    return api;
})(jQuery, window, document);
var planBuilderAddLine = (function ($, window, document, undefined) {
    var api = {};
    var defaults = {
        selected: null
    };

    var planBuilderObj;

    var PlanBuilderAddLine = function () { }
     
    PlanBuilderAddLine.prototype.init = function (component, options, index, parent) {
        planBuilderObj = this;

        this.index = index;
        this.component = component;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);
        this.selectedQuantity = 0;

        this.minLineSelection = planBuilderObj.options.minLineSelection;
        if (this.minLineSelection === "") this.minLineSelection = 1;
        this.maxLineSelection = planBuilderObj.options.maxLineSelection;
        if (this.maxLineSelection === "") this.maxLineSelection = 10;

        this.lines = [];

        $(component).on("planbuilder:selectPlan", function (event, line) {
            planBuilderObj.NotifyPlanBuilderChange();
            planBuilderObj.MarkAsSelected();
        });

        $.each(component.find("div.AddLine"), function (index, value) {
            var options = {};
            var comp = $(value);
            options.uniqueId = comp.data("addplan-uniqueid");
            options.price = comp.data("addplan-price");
            options.defaultQuantity = planBuilderObj.options.defaultQuantity;

            var line = new AddLine(comp, options, index, planBuilderObj);
            planBuilderObj.lines.push(line);

            if (planBuilderObj.options.selected !== null) {
                var selectedIndex = planBuilderObj.options.selected.items.findIndex(function (e) {
                    return e.id == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedQuantity += planBuilderObj.options.selected.items[selectedIndex].quantity;
                    line.selectedQuantity = planBuilderObj.options.selected.items[selectedIndex].quantity;
                    line.totalPrice = planBuilderObj.options.selected.items[selectedIndex].price;
                    line.component.find(".AddLineQty").text(line.selectedQuantity);
                }
            }
        });

        this.MarkAsSelected();
    }

    PlanBuilderAddLine.prototype.NotifyPlanBuilderChange = function () {
        var selectedPlanInfo = planBuilderSelection.createNewPlanBuilderSelection(this.options.id);
        var totalLine = planBuilderObj.selectedQuantity;
        var totalPrice = 0;

        $.each(planBuilderObj.lines, function (index, value) {
            //totalLine += value.selectedQuantity;
            totalPrice += value.selectedQuantity * value.price;

            if (value.selectedQuantity > 0) {
                selectedPlanInfo.addItem(planBuilderSelection.createNewPlanBuilderItem(value.options.uniqueId, value.selectedQuantity, value.totalPrice, value.options, value.component[0].dataset.planIndex));
            }
        });
        this.parent.component.trigger("step:planBuilderInfoUpdate", [selectedPlanInfo, this.parent]);
    }

    PlanBuilderAddLine.prototype.MarkAsSelected = function () {
        var totalLine = planBuilderObj.selectedQuantity;
        var totalPrice = 0;

        $.each(planBuilderObj.lines, function (index, value) {
            totalPrice += value.selectedQuantity * value.price;
        });

        $(".PlanBuilder .total-count").text(totalLine);
        $(".PlanBuilder .total .add-device-price").text("$" + totalPrice + this.options.monthTitle);
    }

    api.initInstance = function (component, options, index, parent) {
        options.minLineSelection = $(component).data("planbuilder-min-line-selection");
        options.maxLineSelection = $(component).data("planbuilder-max-line-selection");
        options.defaultQuantity = $(component).data("planbuilder-default-quantity");
        options.monthTitle = $(component).data("planbuilder-month-title");

        return new PlanBuilderAddLine().init(component, options, index, parent);
    }


    var AddLine = function (component, options, index, parent) {
        var theObj = this;

        this.index = index;
        this.component = component;
        this.options = options;
        this.parent = parent;

        this.selectedQuantity = options.defaultQuantity;
        this.price = options.price;
        this.totalPrice = 0;

        $(component).find(".AddLineMinus").on("click", function (event) {
            if (theObj.selectedQuantity >= theObj.parent.minLineSelection && theObj.parent.selectedQuantity >= theObj.parent.minLineSelection) {
                theObj.selectedQuantity -= 1;
                theObj.parent.selectedQuantity -= 1;

                $(component).find(".AddLineQty").text(theObj.selectedQuantity);
                theObj.totalPrice = theObj.price * theObj.selectedQuantity;

                if (theObj.selectedQuantity >= 0) {
                    parent.component.trigger("planbuilder:selectPlan", theObj);
                }
            }
        });

        $(component).find(".AddLinePlus").on("click", function (event) {
            if (theObj.selectedQuantity < theObj.parent.maxLineSelection && theObj.parent.selectedQuantity < theObj.parent.maxLineSelection) {
                theObj.selectedQuantity += 1;
                theObj.parent.selectedQuantity += 1;

                $(component).find(".AddLineQty").text(theObj.selectedQuantity);
                theObj.totalPrice = theObj.price * theObj.selectedQuantity;

                if (theObj.selectedQuantity > 0) {
                    parent.component.trigger("planbuilder:selectPlan", theObj);
                }
            }
        });
    }

    return api;
})(jQuery, window, document);

var planBuilderAddPlan = (function ($, window, document, undefined) {
    var api = {};
    var defaults = {
        selected: null
    };

    var planBuilderObj;

    var PlanBuilderAddPlan = function () { }

    PlanBuilderAddPlan.prototype.init = function (component, options, index, parent) {
        planBuilderObj = this;

        this.index = index;
        this.component = component;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);

        this.minLineSelection = planBuilderObj.options.minLineSelection;
        if (this.minLineSelection === "") this.minLineSelection = 1;
        this.maxLineSelection = planBuilderObj.options.maxLineSelection;
        if (this.maxLineSelection === "") this.maxLineSelection = 10;
        
        this.selectedPlan = null;
        this.selectedQuantity = 1;

        // get each plan
        this.plans = [];

        $(component).on("planbuilder:selectPlan", function (event, plan) {
            planBuilderObj.selectedPlan = plan;

            planBuilderObj.NotifyPlanBuilderChange();
            planBuilderObj.MarkPlanAsSelected();
            
        });

        $(component).on("planbuilder:updateQuantity", function (event, quantity) {
            planBuilderObj.selectedQuantity = quantity;

            planBuilderObj.NotifyPlanBuilderChange();
            planBuilderObj.MarkPlanAsSelected();
        })

        $(component).find(".AddPlanMinus").on("click", function (event) {
            if (planBuilderObj.selectedQuantity > planBuilderObj.minLineSelection) {
                planBuilderObj.selectedQuantity -= 1;
                $(planBuilderObj.component).find(".AddPlanQty").text(planBuilderObj.selectedQuantity);

                if (planBuilderObj.selectedPlan !== null) {
                    planBuilderObj.NotifyPlanBuilderChange();
                }
            }
        });

        $(component).find(".AddPlanPlus").on("click", function (event) {
            if (planBuilderObj.selectedQuantity < planBuilderObj.maxLineSelection) {
                planBuilderObj.selectedQuantity += 1;
                $(planBuilderObj.component).find(".AddPlanQty").text(planBuilderObj.selectedQuantity);

                if (planBuilderObj.selectedPlan !== null) {
                    planBuilderObj.NotifyPlanBuilderChange();
                }
            }
        });

        $.each(component.find("div.PlanLine"), function (index, value) {
            var options = {};
            var comp = $(value);

            options.uniqueId = comp.data("addplan-uniqueid");
            options.cardTitle = comp.data("addplan-cardtitle");
            options.firstLinePrice = comp.data("addplan-firstlineprice");
            options.secondLinePrice = comp.data("addplan-secondlineprice");
            options.additionalLinePrice = comp.data("addplan-additionallineprice");
            options.ctaSelect = comp.data("addplan-cta-select");
            options.ctaSelected = comp.data("addplan-cta-selected");

            var plan = new Plan(comp, options, index, planBuilderObj);
            planBuilderObj.plans.push(plan);
            console.log("AddPlan check:", planBuilderObj.options.autoSelectItems);
            if (planBuilderObj.options.selected !== null) {
                var selectedIndex = planBuilderObj.options.selected.items.findIndex(function (e) {
                    return e.id == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedPlan = plan;
                    planBuilderObj.selectedQuantity = planBuilderObj.options.selected.items[selectedIndex].quantity;
                }
            } else if (planBuilderObj.options.autoSelectItems != null && planBuilderObj.options.autoSelectItems.length > 0) {
                var selectedIndex = planBuilderObj.options.autoSelectItems.findIndex(function (e) {
                    return e == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedPlan = plan;
                    planBuilderObj.selectedQuantity = 1;
                    planBuilderObj.NotifyPlanBuilderChange();
                }
            }
        });

        if (this.selectedPlan != null) {
            this.MarkPlanAsSelected();
            $(this.component).find(".AddPlanQty").text(this.selectedQuantity);
        }
        else if (this.IsGuid(this.GetUrlParam("preselect"))) {
            // Click a plan as selected (by default) if the plan ID is passed via a query string. Has to be a guid (no more UIDs please!)
            $('[data-addplan-uniqueid="' + this.GetUrlParam("preselect").replace(/[{}]/g, '').toLowerCase() + '"] .PlanCta').trigger("click");
        }
    }

    PlanBuilderAddPlan.prototype.NotifyPlanBuilderChange = function () {
        if (this.selectedQuantity >= this.minLineSelection && this.selectedQuantity <= this.maxLineSelection && this.selectedPlan != null) {
            var price = 0.00;
            if (this.selectedQuantity === 1) {
                price = this.selectedPlan.options.firstLinePrice;
            } else if (this.selectedQuantity === 2) {
                price = this.selectedPlan.options.firstLinePrice + this.selectedPlan.options.secondLinePrice;
            } else {
                price = (this.selectedQuantity - 2) * this.selectedPlan.options.additionalLinePrice + this.selectedPlan.options.firstLinePrice + this.selectedPlan.options.secondLinePrice;
            }

            var selectedPlanInfo = planBuilderSelection.createNewPlanBuilderSelection(this.options.id);
            selectedPlanInfo.addItem(planBuilderSelection.createNewPlanBuilderItem(this.selectedPlan.options.uniqueId, this.selectedQuantity, price));
            this.parent.component.trigger("step:planBuilderInfoUpdate", [selectedPlanInfo, this.parent]);
        }
    }

    PlanBuilderAddPlan.prototype.MarkPlanAsSelected = function () {
        this.plans.forEach(function (plan, index) {
            plan.component.removeClass("selected plan");
            plan.component.find("#cta-" + plan.options.uniqueId).parent().removeClass("selected");
            plan.component.find("#cta-" + plan.options.uniqueId).text(plan.options.ctaSelect);
        });
        
        this.selectedPlan.component.addClass("selected plan");
        this.component.find("#cta-" + this.selectedPlan.options.uniqueId).parent().addClass("selected");
        this.component.find("#cta-" + this.selectedPlan.options.uniqueId).text(this.selectedPlan.options.ctaSelected);
    }

    PlanBuilderAddPlan.prototype.GetUrlParam = function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
        return (results !== null) ? results[1] || 0 : false;
    }

    PlanBuilderAddPlan.prototype.IsGuid = function (stringToTest) {
        var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}(\-){0,1}[0-9a-fA-F]{4}(\-){0,1}[0-9a-fA-F]{4}(\-){0,1}[0-9a-fA-F]{4}(\-){0,1}[0-9a-fA-F]{12}(\}){0,1}$/gi;
        return regexGuid.test(stringToTest);
    }

    api.initInstance = function (component, options, index, parent) {
        options.minLineSelection = $(component).data("planbuilder-min-line-selection");
        options.maxLineSelection = $(component).data("planbuilder-max-line-selection");

        return new PlanBuilderAddPlan().init(component, options, index, parent);
    }


    // plan
    var Plan = function (component, options, index, parent) {
        this.index = index;
        this.component = component;
        this.options = options;
        this.parent = parent;

        this.component.find("#cta-" +this.options.uniqueId).on('click', { plan: this }, function (event) {
            event.preventDefault();
            event.data.plan.parent.component.trigger("planbuilder:selectPlan", event.data.plan);
        });
    }


    return api;
})(jQuery, window, document);

var planBuilderAddPlanTV = (function ($, window, document, undefined) {
    var api = {};
    var defaults = {
        selected: null
    };

    var planBuilderObj;

    var PlanBuilderAddPlanTV = function () { }

    PlanBuilderAddPlanTV.prototype.init = function (component, options, index, parent) {
        planBuilderObj = this;

        this.index = index;
        this.component = component;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);

        this.selectedPlan = null;

        // get each plan
        this.plans = [];

        $(component).on("planbuilder:selectPlan", function (event, plan) {
            var skpIndex = plan.component.data("addauthoredcontent-skiptostep");
            var skpText = plan.component.data("addauthoredcontent-skiptosteptext");
            var addToCartFn = plan.component.data("addauthoredcontent-addtocartfn");
            var addToCartFnText = plan.component.data("addauthoredcontent-addtocartfntext");
            planBuilderObj.selectedPlan = plan;
            planBuilderObj.selectedPlan.options.skipToStepIndex = (skpIndex > -1 && skpIndex !== "") ? skpIndex : -1;
            planBuilderObj.selectedPlan.options.skipToStepText = (skpText !== "" && skpText !== undefined) ? skpText : planBuilderObj.parent.options.linkDescription;
            planBuilderObj.selectedPlan.options.addToCartFn = (addToCartFn !== "" && addToCartFn !== undefined) ? addToCartFn : "";
            planBuilderObj.selectedPlan.options.addToCartFnText = (addToCartFnText !== "" && addToCartFnText !== undefined) ? addToCartFnText : "";
            planBuilderObj.NotifyPlanBuilderChange();
            planBuilderObj.MarkPlanAsSelected();
            
        });

        $.each(component.find("div.PlanLine"), function (index, value) {
            var options = {};
            var comp = $(value);

            options.uniqueId = comp.data("addplan-uniqueid");
            options.price = comp.data("addplan-price");
            options.ctaSelect = comp.data("addplan-cta-select");
            options.ctaSelected = comp.data("addplan-cta-selected");
            //messy mixed content hotfix
            options.addToCartFn = comp.data("addauthoredcontent-addtocartfn");
            

            var plan = new Plan(comp, options, index, planBuilderObj);
            planBuilderObj.plans.push(plan);

            if (planBuilderObj.options.selected !== null) {
                var selectedIndex = planBuilderObj.options.selected.items.findIndex(function (e) {
                    return e.id == options.uniqueId;
                });
 
                if (selectedIndex > -1) {
                    planBuilderObj.selectedPlan = plan;
                }
            } else if (planBuilderObj.options.autoSelectItems != null && planBuilderObj.options.autoSelectItems.length > 0) {
                var selectedIndex = planBuilderObj.options.autoSelectItems.findIndex(function (e) {
                    return e == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedPlan = plan;
                    planBuilderObj.NotifyPlanBuilderChange();
                }
            }
        });

        if (this.selectedPlan != null) {
            this.MarkPlanAsSelected();
        } 
    }

    PlanBuilderAddPlanTV.prototype.NotifyPlanBuilderChange = function () {
        if (this.selectedPlan != null) {
            var selectedPlanInfo = planBuilderSelection.createNewPlanBuilderSelection(this.options.id, this.selectedPlan.options.skipToStepIndex, this.selectedPlan.options.skipToStepText, this.selectedPlan.options.addToCartFn, this.selectedPlan.options.addToCartFnText);

            selectedPlanInfo.addItem(planBuilderSelection.createNewPlanBuilderItem(this.selectedPlan.options.uniqueId, 1, this.selectedPlan.options.price, {}, this.selectedPlan.component[0].dataset.planIndex, this.selectedPlan.options.addToCartFn));
            this.parent.ctaStepInfo.description = this.selectedPlan.options.skipToStepText;
            this.parent.component.trigger("step:planBuilderInfoUpdate", [selectedPlanInfo, this.parent]);
        }
    }

    PlanBuilderAddPlanTV.prototype.MarkPlanAsSelected = function () {
        this.plans.forEach(function (plan, index) {
            plan.component.removeClass("selected plan");
            $('.PlanLine[data-addplan-uniqueid="' + plan.options.uniqueId + '"] a').parent().removeClass("selected");
            $('.PlanLine[data-addplan-uniqueid="' + plan.options.uniqueId + '"] a').text(plan.options.ctaSelect);

        });

        this.selectedPlan.component.addClass("selected plan");
        $('.PlanLine[data-addplan-uniqueid="' + this.selectedPlan.options.uniqueId + '"] a').parent().addClass("selected");
        $('.PlanLine[data-addplan-uniqueid="' + this.selectedPlan.options.uniqueId + '"] a').text(this.selectedPlan.options.ctaSelected);
    }

    api.initInstance = function (component, options, index, parent) {
        return new PlanBuilderAddPlanTV().init(component, options, index, parent);
    }


    // plan
    var Plan = function (component, options, index, parent) {
        this.index = index;
        this.component = component;
        this.options = options;
        this.parent = parent;

        $('.PlanLine[data-addplan-uniqueid="' + this.options.uniqueId + '"] a').on('click', { plan: this }, function (event) {
            event.preventDefault();
            event.data.plan.parent.component.trigger("planbuilder:selectPlan", event.data.plan);
        });
    }

    return api;
})(jQuery, window, document);

var planBuilderAddPlanWithLines = (function ($, window, document, undefined) {
    var api = {};
    var defaults = {
        selected: null
    };

    var planBuilderObj;

    var PlanBuilderAddPlanWithLines = function () { }

    PlanBuilderAddPlanWithLines.prototype.init = function (component, options, index, parent) {
        planBuilderObj = this;

        this.index = index;
        this.component = component;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);

        this.minLineSelection = planBuilderObj.options.minLineSelection;
        if (this.minLineSelection === "") this.minLineSelection = 1;
        this.maxLineSelection = planBuilderObj.options.maxLineSelection;
        if (this.maxLineSelection === "") this.maxLineSelection = 10;

        // get each plan
        this.plans = [];

        this.totalLines = 0;
        var tempTotalLines = 0;

        $(".AddPlanQty").each(function (index, element) {
            tempTotalLines += parseInt(element.dataset.lines);
            if (element.dataset.lines <= element.dataset.minLines) {
                $(this).siblings(".AddPlanMinus").hide()
            }
            if (element.dataset.minLines > 0) {
                $(this).parent().parent().parent().siblings(".content-container").find(".content").addClass("show");
                $(this).parent().parent().parent().siblings(".content-container").find(".cta .details").addClass("rotate-arrow");
                $(this).parent().parent().parent().siblings(".content-container").parent().parent().addClass("active-accordion");
            }
        });

        this.totalLines = tempTotalLines;

        var cartCookie = $.cookie("gci_cart");
        if (cartCookie != undefined) {
            this.cookieObj = jQuery.parseJSON($.cookie("gci_cart"));
        } else {
            this.cookieObj = {};
        }

        // Default the total lines to 1 and update the cookie. This resolves bug GCIC-4628 but also a bug where no cookie exists and the customer
        // clicks the continue button without adding or removing lines, which causes a "0" value token to be read on the following step
        planBuilderObj.totalLines = 1;
        this.updateCartCookie();

        $(component).find(".AddPlanMinus").on("click", function (event) {
            var addPlanQty = $(this).siblings(".AddPlanQty").first();
            var addPlanQtyLineCount = parseInt(addPlanQty.data('lines'));
            var minusDiv = $(this);
            if (addPlanQtyLineCount > parseInt(addPlanQty.data('min-lines')) && planBuilderObj.totalLines > parseInt(addPlanQty.data('min-lines'))) {
                addPlanQtyLineCount--;

                addPlanQty.text(addPlanQtyLineCount);
                addPlanQty.data('lines', addPlanQtyLineCount);

                planBuilderObj.totalLines--;

                planBuilderObj.NotifyPlanBuilderChange();
                checkCurrentLine(minusDiv, addPlanQtyLineCount, addPlanQty);
            }
        });

        $(component).find(".AddPlanPlus").on("click", function (event) {
            var addPlanQty = $(this).siblings(".AddPlanQty").first();
            var addPlanQtyLineCount = parseInt(addPlanQty.data('lines'));
            var plusDiv = $(this);
            $(this).siblings(".AddPlanMinus").show();
            if (planBuilderObj.totalLines < planBuilderObj.maxLineSelection) {
                addPlanQtyLineCount++;

                addPlanQty.text(addPlanQtyLineCount);
                addPlanQty.data('lines', addPlanQtyLineCount);

                planBuilderObj.totalLines++;

                planBuilderObj.NotifyPlanBuilderChange();
                checkTotalLines(plusDiv, addPlanQtyLineCount);
            }
        });

        $.each(component.find("div.PlanWithLines"), function (index, value) {
            var options = {};
            var comp = $(value);

            options.uniqueId = comp.data("addplan-uniqueid");

            var plan = new Plan(comp, options, index, planBuilderObj);
            planBuilderObj.plans.push(plan);
        });

        this.gciPlusItemId = planBuilderObj.options.gciPlusItemId;
        if (this.gciPlusItemId !== "" && this.gciPlusItemId !== undefined) {
            // If we have a gci+ item, lets add it to the cart.
            var planBuilderLinesSelection = planBuilderSelection.createNewPlanBuilderSelection(this.gciPlusItemId, -1, "", "", "", 35); // TODO: Let's not hardcode this value.
            var planBuilderItem = planBuilderSelection.createNewPlanBuilderItem(this.gciPlusItemId, 1, planBuilderObj.options.gciPlusItemPrice, {}, 0);
            planBuilderLinesSelection.addItem(planBuilderItem);
            this.parent.component.trigger("step:planBuilderInfoUpdate", [planBuilderLinesSelection, this.parent]);
        }

        function checkCurrentLine(minusDiv, addPlanQtyLineCount, addPlanQty) {
            if (addPlanQtyLineCount <= addPlanQty.data("min-lines")) {
                minusDiv.hide();
            }  
            $(".AddPlanPlus").css("visibility", "visible");
        }

        function checkTotalLines() {
            if (planBuilderObj.totalLines >= planBuilderObj.maxLineSelection) {
                $(".AddPlanPlus").css("visibility", "hidden");
            }
        }
    }

    PlanBuilderAddPlanWithLines.prototype.NotifyPlanBuilderChange = function () {
        // TODO: Let's not hardcode this
        var planBuilderLinesSelection = planBuilderSelection.createNewPlanBuilderSelection(planBuilderObj.options.id, -1, "", "", "", 5);

        // Handle cookie update
        this.updateCartCookie();

        $.each(planBuilderObj.plans, function (index, plan) {
            var qty = plan.component.find('.AddPlanQty');
            var lineCount = parseFloat(qty.data('lines'));
            if (lineCount > 0) {
                var price = parseFloat(plan.component.data('addplan-price'));

                var totalPrice = price * lineCount;

                // if there is a minimum number of free lines
                var minLines = parseInt(qty.data('min-lines'));

                if (minLines > 0) {
                    totalPrice = price * (lineCount - minLines);
                }

                var planBuilderItem = planBuilderSelection.createNewPlanBuilderItem(plan.options.uniqueId, lineCount, totalPrice, {}, plan.component[0].dataset.planIndex);

                planBuilderLinesSelection.addItem(planBuilderItem);
            }
        });

        this.parent.component.trigger("step:planBuilderInfoUpdate", [planBuilderLinesSelection, this.parent]);
    }

    PlanBuilderAddPlanWithLines.prototype.updateCartCookie = function () {
        var d = new Date();
        d.setDate(d.getDate() + 30);

        this.cookieObj.numberOfLines = planBuilderObj.totalLines;
        Cookies.set("gci_cart", this.cookieObj, { expires: d, path: '/' });
    }

    api.initInstance = function (component, options, index, parent) {
        options.minLineSelection = $(component).data("planbuilder-min-line-selection");
        options.maxLineSelection = $(component).data("planbuilder-max-line-selection");
        options.gciPlusItemId = $(component).data("planbuilder-gci-plus-item-id");
        options.gciPlusItemPrice = $(component).data("planbuilder-gci-plus-item-price");

        return new PlanBuilderAddPlanWithLines().init(component, options, index, parent);
    }


    // plan
    var Plan = function (component, options, index, parent) {
        this.index = index;
        this.component = component;
        this.options = options;
        this.parent = parent;

        this.component.find("#cta-" + this.options.uniqueId).on('click', { plan: this }, function (event) {
            event.preventDefault();
            event.data.plan.parent.component.trigger("planbuilder:selectPlanWithLines", event.data.plan);
        });
    }

    return api;
})(jQuery, window, document);

var planBuilderAddProduct = (function ($, window, document, undefined) {
    var api = {};
    var defaults = {
        selected: null
    };

    var planBuilderObj;

    var PlanBuilderAddProduct = function () { }

    PlanBuilderAddProduct.prototype.init = function (component, options, index, parent) {
        planBuilderObj = this;

        this.index = index;
        this.component = component;
        this.parent = parent;
        this.options = $.extend({}, defaults, options);

        this.selectedProducts = [];

        // get each plan
        this.products = [];

        $(component).on("planbuilder:selectProduct", function (event, product) {
            var selectedIndex = product.parent.selectedProducts.findIndex(function (e) {
                return e.options.uniqueId == product.options.uniqueId;
            });

            if (selectedIndex > -1) {
                // selected a product that is already selected. Treat as an deselect
                product.parent.selectedProducts.splice(selectedIndex, 1);
            } else {
                product.parent.selectedProducts.push(product);
            }
            
            product.parent.NotifyPlanBuilderChange(product.parent);
            product.parent.MarkProductsAsSelected();
        });

        $.each(component.find("div.PlanProduct"), function (index, value) {
            var options = {};
            var comp = $(value);

            options.uniqueId = comp.data("addplan-uniqueid");
            options.price = comp.data("addplan-price");
            options.isFree = comp.data("addplan-is-free");
            options.ctaSelect = comp.data("addplan-cta-select");
            options.ctaSelected = comp.data("addplan-cta-selected");

            var product = new Product(comp, options, index, planBuilderObj);
            planBuilderObj.products.push(product);

            if (planBuilderObj.options.selected !== null) {
                var selectedIndex = planBuilderObj.options.selected.items.findIndex(function (e) {
                    return e.id == options.uniqueId;
                });
                if (selectedIndex > -1) {
                    planBuilderObj.selectedProducts.push(product);
                }
            }
        });

        if (this.selectedProducts.length > 0) {
            this.MarkProductsAsSelected();
        }
    }

    PlanBuilderAddProduct.prototype.NotifyPlanBuilderChange = function (planBuilder) {
        var selectedPlanInfo = planBuilderSelection.createNewPlanBuilderSelection(planBuilder.options.id);

        if (planBuilder.selectedProducts.length > 0) {
            planBuilder.selectedProducts.forEach(function (product, index) {
                selectedPlanInfo.addItem(planBuilderSelection.createNewPlanBuilderItem(product.options.uniqueId, 1, product.options.price, {}, product.component[0].dataset.planIndex));
            });
        }

        planBuilder.parent.component.trigger("step:planBuilderInfoUpdate", [selectedPlanInfo, planBuilder.parent]);
    }

    PlanBuilderAddProduct.prototype.MarkProductsAsSelected = function () {
        
        this.products.forEach(function (product, index) {
            var selectedIndex = product.parent.selectedProducts.findIndex(function (e) {
                return e.options.uniqueId == product.options.uniqueId;
            });

            if (selectedIndex > -1) {
                // mark as selected
                product.component.addClass("selected");
                product.component.find(".add-btn").addClass("added");
                //product.component.find("#cta-" + product.options.uniqueId).text(product.options.ctaSelected);
                $('.PlanProduct[data-addplan-uniqueid="' + product.options.uniqueId + '"] a').text(product.options.ctaSelected);
            } else {
                // mark as not selected
                product.component.removeClass("selected");
                product.component.find(".add-btn").removeClass("added");
                //product.component.find("#cta-" + product.options.uniqueId).text(product.options.ctaSelect);
                $('.PlanProduct[data-addplan-uniqueid="' + product.options.uniqueId + '"] a').text(product.options.ctaSelect);
            }
        });

    }

    api.initInstance = function (component, options, index, parent) {
        return new PlanBuilderAddProduct().init(component, options, index, parent);
    }


    // product
    var Product = function (component, options, index, parent) {
        this.index = index;
        this.component = component;
        this.options = options;
        this.parent = parent;

        //this.component.find("#cta-" + this.options.uniqueId).parent().on('click', { product: this }, function (event) {
        $('.PlanProduct[data-addplan-uniqueid="' + this.options.uniqueId + '"]').on('click', { product: this }, function (event) {
            event.preventDefault();
            event.data.product.parent.component.trigger("planbuilder:selectProduct", event.data.product);
        });
    }

    return api;
})(jQuery, window, document);