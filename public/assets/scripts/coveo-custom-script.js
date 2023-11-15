document.addEventListener('DOMContentLoaded', function () {
    var i;

    //Coveo.SearchEndpoint.configureSampleEndpointV2(); // Not sure what this is supposed to do, but it throws an error

    setTimeout(function () {
        // Add event listener to facet headers to allow accordion-style collapse
        var coll = document.getElementsByClassName('coveo-facet-header');
        for (i = 0; i < coll.length; i++) {
            coll[i].addEventListener('click', function () {
                var content = this.closest('.coveo-facet-column .CoveoFacet');
                if (!content.classList.contains('active')) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        }

        // query suggestions do not work with the tabs component, so set the pipline from the tab
        if (typeof Coveo !== "undefined") {
            var coveoSearchInterface = Coveo.$(document).find('.CoveoSearchInterface');
            Coveo.$(coveoSearchInterface).on(Coveo.OmniboxEvents.buildingQuerySuggest,
                function (e, args) {
                    var tabs = Coveo.$(document).find('.coveo-tab-section');
                    if (tabs && tabs.length) {
                        var selectedTab = $(tabs).find('a.coveo-selected');
                        if (selectedTab && selectedTab.length) {
                            var pipeline = selectedTab.data('pipeline');
                            args.payload.pipeline = pipeline;
                        }
                    }
                }
            );
        }

    }, 750);
});

var headerOmniboxes = [];

document.addEventListener("CoveoSearchEndpointInitialized", function () {
    var searchboxes = $("header .coveo-search-section .CoveoSearchbox");

    if (searchboxes.length > 0) {
        $(searchboxes).each(function (idx) {
            var elem = searchboxes[idx];

            if (!headerOmniboxes.includes(elem)) {
                headerOmniboxes.push(elem);
                elem.addEventListener("CoveoComponentInitialized", initOmni);
            }
        });
    }

    function initOmni(event) {
        var elem = event.target;
        var ran = false;

        var obs = new MutationObserver(function (records) {
            $(records).each(function (idx) {
                var mutation = records[idx];
                if (mutation.addedNodes.length > 0) {

                    $(mutation.addedNodes).each(function (added) {
                        if (mutation.addedNodes[added].className.indexOf("CoveoOmnibox") !== -1) {

                            if (!ran) {
                                adjustOmni(elem);
                                ran = true;
                            }

                        }
                    });

                }
            });
        });

        obs.observe(elem, { childList: true });
    }

    function adjustOmni(elem) {
        $(elem).find("a.CoveoSearchButton").hide();

        var searchBtn = '<div class="search-btn btn-get-search-results svg-fill-gcired"><svg style="width:20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22.56 22.56"><title>Search</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><g id="icon-search"><path d="M8.46,16.91a8.46,8.46,0,1,1,8.46-8.46A8.47,8.47,0,0,1,8.46,16.91ZM8.46,3a5.46,5.46,0,1,0,5.46,5.46A5.46,5.46,0,0,0,8.46,3Z" fill="#b71234" /><rect x="15.94" y="11.69" width="3" height="11.5" transform="translate(-7.22 17.44) rotate(-45)" fill="#b71234" /></g></g></g></svg></div>';

        var omni = $(elem).find(".CoveoOmnibox");
        $(omni).addClass("form-search-bar").find("input[type=text]").addClass("form-control search-input").after($(searchBtn));

        $(omni).find(".btn-get-search-results").on('click', function () {
            $(omni).find("input[type=text]").trigger($.Event("keydown", { which: 13 }));
        });

        var searchBtnIndent = function () {
            //if ($(window).width() >= 1200) {
                if ($(this).val().length > 0) $(".btn-get-search-results").animate({ "right": "60px" }, 200);
                else $(".btn-get-search-results").animate({ "right": "20px" }, 200);
            //}
        };

        $(omni).find("input[type=text]").on('input', searchBtnIndent);
        $(omni).find(".magic-box-clear").on('click', searchBtnIndent);
    }
});
