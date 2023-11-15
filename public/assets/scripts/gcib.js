"use strict";
(function ($) {
    var elem_css = ".cta-card-grid";
    var $elem = $(elem_css);
    var $elem_cards = $(".cta-card .cta-card-body", $elem);
    var timeout = null;

    function resetCards() {
        if (timeout !== null)
            clearTimeout(timeout);

        $elem_cards.each(function () {
            $(this).css("height", "");
        });
    }

    function equalHeights() {
        resetCards();
        //console.log("$(window).width(): " + $(window).width());

        if ($(window).width() > 1183)
            return;

        var maxH = 0;

        timeout = setTimeout(function () {
            $elem_cards.each(function () {
                if ($(this).outerHeight() > maxH)
                    maxH = $(this).outerHeight();
            });

            $elem_cards.each(function () {
                $(this).css("height", maxH);
            });

        }, 20);
    }

    $(window).on("resize", function () {
        equalHeights();
    });
})(jQuery);
//
// Industry Popup Z-Index Fix
//
(function ($) {
    "use strict";

    $("#dropdownIndustry").parent().on("show.bs.dropdown", function (e) {
        $(this).closest(".feature-content").css("zIndex", 10);
    });

    $("#dropdownIndustry").parent().on("hide.bs.dropdown", function (e) {
        $(this).closest(".feature-content").css("zIndex", '');
    });
})(jQuery);


// END: Card Deck Carousel
//
// Info Card Carousel
//
(function ($) {
    "use strict";
    var carousel_class = ".info-card-carousel";
    var scrollable_elem = $(carousel_class + " .scrollable .card-deck");
    var item = $(carousel_class + " .scrollable .card");
    var move = item.outerWidth(true);
    var sliderLimit = -900;
    var arrows = $(carousel_class + " .arrows");


    $(carousel_class + " .arrows > .left").on("click", function () {

        if ($(this).hasClass("animating") || $(this).hasClass("disabled"))
            return;

        move = item.outerWidth(true);

        var currentPosition = parseInt(scrollable_elem.css("left"));

        arrows.children().removeClass("disabled");

        if (currentPosition < 0) {

            if ((currentPosition + move) >= 0) {
                move = -currentPosition;
                arrows.children(".left").addClass("disabled");
            }

            arrows.children().addClass("animating");
            scrollable_elem.stop(false, true).animate({ left: "+=" + move }, {
                duration: 400,
                complete: function () {
                    arrows.children().removeClass("animating");
                }
            });
        }
    });

    $(carousel_class + " .arrows > .right").on("click", function () {

        if ($(this).hasClass("animating") || $(this).hasClass("disabled"))
            return;

        move = item.outerWidth(true);

        sliderLimit = scrollable_elem.parent().outerWidth(true) - scrollable_elem.outerWidth(true);

        if (move > (scrollable_elem.outerWidth() - scrollable_elem.parent().width())) {
            move = Math.ceil(scrollable_elem.outerWidth(true) - scrollable_elem.parent().width());
            sliderLimit = -move;
        }

        var currentPosition = parseInt(scrollable_elem.css("left"));

        arrows.children().removeClass("disabled");

        if (currentPosition > sliderLimit) {
            arrows.children().addClass("animating");

            var adjW = scrollable_elem.outerWidth() + (currentPosition - move);
            var space = scrollable_elem.parent().outerWidth() - adjW;


            if (space > 0) {
                console.log("too much: " + space);
                move = Math.ceil(move - space);
            }

            console.log("sliderLimit: " + sliderLimit);
            console.log("move: " + move);

            scrollable_elem.stop(false, true).animate({ left: "-=" + move }, {
                duration: 400,
                complete: function () {
                    arrows.children().removeClass("animating");

                    if (parseInt(scrollable_elem.css("left")) <= sliderLimit) {
                        arrows.children(".right").addClass("disabled");
                    }
                }
            })
        }
    });

    function initialize() {
        scrollable_elem.css({ left: 0 });

        // disabled left arrow on load
        arrows.children().removeClass("disabled");
        arrows.children(".left").addClass("disabled");

        var totalWidth = 0;

        item.each(function (index) {
            totalWidth += parseInt($(this).outerWidth(true), 10);
        });
        scrollable_elem.width(totalWidth);
    }

    initialize();

    $(window).on("resize", function () {
        initialize();
    });
})(jQuery);


// END: Card Deck Carousel
(function ($) {
    var elem_css = ".info-card-grid";
    var $elem = $(elem_css);
    var $elem_cards = $(".card .card-body", $elem);
    var timeout = null;

    function resetCards() {
        if (timeout !== null)
            clearTimeout(timeout);

        $elem_cards.each(function () {
            $(this).css("height", "");
        });
    }

    function equalHeights() {
        resetCards();
        //console.log("$(window).width(): " + $(window).width());

        if ($(window).width() > 1183)
            return;

        var maxH = 0;

        timeout = setTimeout(function () {
            $elem_cards.each(function () {
                if ($(this).outerHeight() > maxH)
                    maxH = $(this).outerHeight();
            });

            $elem_cards.each(function () {
                $(this).css("height", maxH);
            });

        }, 20);
    }

    $(window).on("resize", function () {
        equalHeights();
    });
})(jQuery);

// END: Card Deck Carousel
(function ($) {
    var elem_css = ".info-card-grid";
    var $elem = $(elem_css);
    var $elem_cards = $(".card .card-body", $elem);
    var timeout = null;

    function resetCards() {
        if (timeout !== null)
            clearTimeout(timeout);

        $('.teaser-card-group .card').each(function () {
            $(this).css("height", "");
        });
    }

    function equalHeights() {
        resetCards();
        //console.log("$(window).width(): " + $(window).width());

        if ($(window).width() > 1183)
            return;

        var maxH = 0;

        timeout = setTimeout(function () {
            $('.teaser-card-group .card').each(function () {
                if ($(this).outerHeight() > maxH)
                    maxH = $(this).outerHeight();
            });

            $('.teaser-card-group .card').each(function () {
                $(this).css("height", maxH);
            });

        }, 20);
    }

    $(window).on("resize", function () {
        equalHeights();
    });
    $(window).on("load", function () {
        equalHeights();
    });
})(jQuery);
//
// CMagnific Popups
//
(function ($) {
    "use strict";

    $(document).ready(function () {

        // videos
        $('.popup-iframe').magnificPopup({
            type: 'iframe',
            iframe: {
                markup: '<div class="mfp-iframe-scaler">' +
                    '<div class="mfp-close"></div>' +
                    '<iframe class="mfp-iframe" frameborder="0" allowfullscreen allow="autoplay"></iframe>' +
                    '</div>', // HTML markup of popup, `mfp-close` will be replaced by the close button

                patterns: {
                    youtube: {
                        index: 'youtube.com/', // String that detects type of video (in this case YouTube). Simply via url.indexOf(index).

                        id: 'v=', // String that splits URL in a two parts, second part should be %id%
                        // Or null - full URL will be returned
                        // Or a function that should return %id%, for example:
                        // id: function(url) { return 'parsed id'; }
                        src: 'https://www.youtube.com/embed/%id%?autoplay=1' // URL that will be set as a source for iframe.
                    },
                    vimeo: {
                        index: 'vimeo.com/',
                        id: '/',
                        src: 'https://player.vimeo.com/video/%id%?autoplay=1' //need the https protocol to autoplay
                    },
                    gmaps: {
                        index: '//maps.google.',
                        src: '%id%&output=embed'
                    }

                    // you may add here more sources

                },
                srcAction: 'iframe_src', // Templating object key. First part defines CSS selector, second attribute. "iframe_src" means: find "iframe" and set attribute "src".
            },
            callbacks: {
                open: function () {
                    if (this.currItem.src.indexOf('vimeo.') > -1) {
                        var vframe = $('.mfp-iframe');
                        var player = new Vimeo.Player(vframe);
                        player.play();
                    }
                }
            }
        });


        $('.inline-iframe').each(function () {
            var ele = $(this);
            var href = ele.attr("href");
            if (href.indexOf('youtube.com/') > -1) {
                var hrefArray = href.split("v=");
                var src = 'https://www.youtube.com/embed/' + hrefArray[1];
                var iframeId = ele.data("video-id");
                $("#" + iframeId).attr('src', src);
                ele.hide();
            }
            else if (href.indexOf('vimeo.com/') > -1) {
                var hrefArray2 = href.split("/");
                var src2 = '';
                if (href.indexOf('//') > -1)
                    src2 = 'https://player.vimeo.com/video/' + hrefArray2[3];
                else
                    src2 = 'https://player.vimeo.com/video/' + hrefArray2[1];
                var iframeId2 = ele.data("video-id");
                $("#" + iframeId2).attr('src', src2);
                ele.hide();
            }
        });

    });
})(jQuery);


// END: Card Deck Carousel
//
// Floating Scroll Nav
//
(function ($) {
    "use strict";
    var scrollnav_class = ".scroll-nav";
    var $scrollnav = $(scrollnav_class);
    var pad = 0;
    var top = 0;
    var stopPos = 0;

    function fixWidth() {
        setTimeout(function () {

            var parentWidth = $scrollnav.parent().outerWidth() + ($scrollnav.parent().offset().left - $scrollnav.closest('.body-container').offset().left);
            $scrollnav.width(parentWidth);
        }, 500);
    }

    function moveNav() {
        if ($scrollnav == null || $scrollnav.length == 0)
            return;

        if ($(window).width() < 768) {
            return;
        }

        var scrollTop = $(window).scrollTop();
        var contactEle = $(".cta-panel").first();
        var contactPos = contactEle.offset().top;// - $scrollnav.outerHeight();
        var scrollnavheight = $scrollnav.outerHeight();
        var scrollnavtop = $scrollnav.offset().top;

        //console.log('scrollTop:' + scrollTop + ', stopPos:' + stopPos + ', scrollnavtop: ' + $scrollnav.offset().top + ', contactpos: ' + contactPos + ', scrollnavheight: ' + $scrollnav.outerHeight());
        if (stopPos < scrollTop) {
            $scrollnav.css("position", "fixed");
            $scrollnav.css("marginTop", 0);
            if (contactPos > scrollTop + scrollnavheight) {
                $scrollnav.css("top", 0);
                $scrollnav.addClass("shadow");
                //$scrollnav.animate({ "top": "+="+pad+"px" }, 1500);
            }
            else {

                //don't reset below contact bar
                //$scrollnav.css("position", "absolute");
                //$scrollnav.css("marginTop", contactPos - ($scrollnav.outerHeight()));// + 284));
                $scrollnav.css("top", contactPos - scrollTop - scrollnavheight);
                $scrollnav.removeClass("shadow");

                //console.log("scrollnavtop: " + $scrollnav.offset().top + ", contact top: " + contactEle.offset().top + ", scrollnavheight: " + $scrollnav.outerHeight());// / placement: " + (contactPos - ($scrollnav.outerHeight() + pad)));
            }
        } else {
            resetNav();
        }
    }

    function animateScrollLink() {

        // animate when clicking from the nav
        $("a", $scrollnav).each(function (anchor) {
            if (this.hash === "")
                return;

            $(this).on('click', function (event) {
                // Make sure this.hash has a value before overriding default behavior
                // Prevent default anchor click behavior
                event.preventDefault();

                // Store hash
                var hash = this.hash;

                // Using jQuery's animate() method to add smooth page scroll
                // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
                $('html, body').animate({
                    scrollTop: $(hash).offset().top
                }, 800, function () {

                    // Add hash (#) to URL when done scrolling (default click behavior)
                    window.location.hash = hash;
                });
            });
        });

        // animate when clicking from the scrollable content
        $("a[data-animation='scroll']").each(function (anchor) {
            if (this.hash === "")
                return;

            $(this).on('click', function (event) {
                // Make sure this.hash has a value before overriding default behavior
                // Prevent default anchor click behavior
                event.preventDefault();

                // Store hash
                var hash = this.hash;

                // Using jQuery's animate() method to add smooth page scroll
                // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
                $('html, body').animate({
                    scrollTop: $(hash).offset().top
                }, 800, function () {

                    // Add hash (#) to URL when done scrolling (default click behavior)
                    window.location.hash = hash;
                });
            });
        });

        var didScroll = false;
        var $panels = $('.industry-solution-panel');
        var $window = $(window);

        window.scrollY += 1;

        $window.scroll(function () {
            didScroll = true;
        });

        setInterval(function () {
            if (didScroll) {
                didScroll = false;

                $(".solution-jump-link").removeClass("active");
                $panels.each(function () {
                    var $this = $(this);
                    var distance = $this.offset().top - ($window.outerHeight() * 0.4);// 150;
                    var height = $this.outerHeight();

                    if ($window.scrollTop() - distance <= height && $window.scrollTop() >= distance) {
                        $("#" + $this.data("target")).addClass("active");
                    }

                });
            }
        }, 250);
    };


    function resetNav() {
        $scrollnav.css("position", "");
        $scrollnav.css("marginTop", "");
        $scrollnav.css("top", 0);
        $scrollnav.removeClass("shadow");

    }

    function initialize() {
        if ($scrollnav == null || $scrollnav.length == 0)
            return;

        $scrollnav.css("width", "");
        resetNav();

        if ($(window).width() > 767) {
            top = $scrollnav.offset().top;
            //console.log('init top:' + top + ', init pad: ' + pad);
            stopPos = top - pad;
            fixWidth();
        }
    }

    animateScrollLink();

    $(window).ready(function () {
        initialize();
    });

    $(window).on("resize", function () {
        initialize();
    });

    $(window).on("scroll", function () {
        moveNav();
    });
})(jQuery);


// END: Floating Scroll Nav
(function () {
    $('.tabbed_panel .tabbed_content').not('.slick-initialized').slick({
        dots: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
            {
                breakpoint: 1020,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });

    $(".tabbed_navigation_item").click(function (e) {
        e.preventDefault();
        var dataSlide = $(this).data('slide');
        $(".tabbed_panel .tabbed_content").slick("slickGoTo", dataSlide);
    });


})();
//
// Card Deck Carousel
//
(function ($) {
    "use strict";
    var carousel_class = ".teaser-carousel";

    //function positionAllArrows() {
    //    $(carousel_class).each(function () {
    //        positionArrows(this);
    //    });
    //}

    //function positionArrows(carousel) {

    //    if (carousel) {
    //        var dots = $(".slick-dots li", carousel);
    //        if (dots.length > 1) {
    //            var left = dots.first().offset().left - 70;
    //            var right = dots.last().offset().left + 30;

    //            $(".carousel-arrows .carousel-prev", carousel).css("left", left);
    //            $(".carousel-arrows .carousel-next", carousel).css("left", right);
    //        }
    //    }
    //}


    function positionDots(slide) {

        if ($(window).width() < 768) {
            $(carousel_class + " .slick-dots").each(function () {
                $(this).css("top", '');
            });
        }
        else {
            if (slide) {
                $(carousel_class + " .slick-dots").each(function () {
                    var body = $(".teaser-body", slide);
                    var bodyTop = body.position().top;
                    var bodyHeight = body.outerHeight();
                    var top = bodyTop + bodyHeight + 20;

                    $(this).css("top", top);
                });
            }
        }
    }


    function updateSlideDims() {
        var elem = carousel_class + ' .slick-carousel';

        $(".photo-caption", elem).css("height", "");
        // only do this on browser width's less than lg breakpoint 
        if ($(window).width() >= 1358)
            return;

        $(elem).each(function () {
            var me = this;
            var maxH = 0;

            window.setTimeout(function () {

                $(".photo-caption", me).each(function () {

                    var cap = $(this);
                    if (maxH < cap.outerHeight()) {
                        maxH = cap.outerHeight();
                    }
                });

                $(".photo-caption", me).outerHeight(maxH);
            }, 200);
        });
    }

    function initializeTeaserCarousels(parent, deferInit) {
        var elem = carousel_class + ' .slick-carousel:not(.defer-init)';

        if (deferInit) {
            elem = carousel_class + " .slick-carousel.defer-init";
        }

        if (typeof (parent) === "undefined") {
            parent = $("body");
        }

        $(elem, parent).each(function () {
            var me = this;
            var options = $(me).data("carousel");

            $(me).css("opacity", 0);

            if ($(me).hasClass("slick-initialized")) {
                $(me).slick("unslick");
            }


            $(me).on("init breakpoint", function (event, slick) {

                var slide_width = $(me).width();
                var slides = $(".slick-slide .slick-item", me);
                slides.width(slide_width);

                var slickObj = this;
                if (options) {
                    // position the arrows
                    if (options.arrowsTop)
                        $(".slick-arrow", me).css("top", options.arrowsTop);

                    // change the arrow size
                    if (options.arrowsSize) {
                        $(".slick-arrow", me).css({
                            "font-size": options.arrowsSize,
                            "height": options.arrowsSize
                        });
                    }

                    //    // sync this carousel with another
                    var syncWith = $(options.syncWith);
                    if (syncWith.length > 0) {
                        syncWith.on("beforeChange", function (event, slick2, currentSlide, nextSlide) {

                            if (currentSlide == 0 && nextSlide == (slick2.slideCount - 1)) {
                                $(slickObj).slick("slickPrev");
                            } else if (nextSlide == 0 && currentSlide == (slick2.slideCount - 1)) {
                                $(slickObj).slick("slickNext");
                            } else if ((nextSlide - currentSlide) > 0) {
                                $(slickObj).slick("slickNext");
                            } else if ((nextSlide - currentSlide) < 0) {
                                $(slickObj).slick("slickPrev");
                            }

                            //$(slickObj).slick("slickGoTo", nextSlide);
                        });
                    }

                    if (options.setWidth) {
                        if (options.setWidth == "viewport") {
                            $(".slick-slide", me).each(function () {
                                //$(this).css({
                                //    "width": "",
                                //    "overflow-x": "",
                                //    "overflow-y": ""
                                //}).removeClass("scrollbar-simple");

                                if ($(this).width() > $(me).width()) {

                                    $(this).width($(me).width());


                                    //$(this).css({
                                    //    "width": $(me).width(),
                                    //    "overflow-x": "auto",
                                    //    "overflow-y": "hidden"
                                    //}).addClass("scrollbar-simple");
                                }
                            });
                        }
                    }

                    if (options.setHeight) {
                        if (options.setWidth == "viewport") {
                            $(".slick-slide", me).each(function () {
                                //$(this).css({
                                //    "width": "",
                                //    "overflow-x": "",
                                //    "overflow-y": ""
                                //}).removeClass("scrollbar-simple");

                                if ($(this).height() > $(me).height()) {

                                    $(this).height($(me).height());


                                    //$(this).css({
                                    //    "width": $(me).width(),
                                    //    "overflow-x": "auto",
                                    //    "overflow-y": "hidden"
                                    //}).addClass("scrollbar-simple");
                                }
                            });
                        }
                    }
                }


                $(".carousel-arrows .carousel-prev", $(me).parent()).on("click", function () {
                    $(me).slick("slickPrev");
                });

                $(".carousel-arrows .carousel-next", $(me).parent()).on("click", function () {
                    $(me).slick("slickNext");
                });

                positionDots(slick.$slides.get(0));
                //positionArrows($(me).parent());
                updateSlideDims();

                //$(me).append($(".slick-prev", me));
            });


            $(me).on('beforeChange', function (event, slick, currentSlide, nextSlide) {
                positionDots(slick.$slides.get(nextSlide));
            });


            $(me).slick();
            $(me).animate({
                "opacity": 1
            }, 200);

            $(".carousel-arrows .carousel-prev", $(me).parent()).on("click", function () {
                $(me).slick("slickPrev");
            });

            $(".carousel-arrows .carousel-next", $(me).parent()).on("click", function () {
                $(me).slick("slickNext");
            });
        });
    }


    //initializeTeamCarousels();
    window.setTimeout(initializeTeaserCarousels, 500);

    $(window).on("resize", function () {
        //window.setTimeout(function () {
        initializeTeaserCarousels();
        //positionAllArrows();
        updateSlideDims();
        //}, 500);
    });
})(jQuery);


// END: Card Deck Carousel


(function ($) {

    function scrollToWFFMErrors() {
        if ($('form .validation-summary-errors').length) {
            $('html, body').animate({
                scrollTop: $('form .validation-summary-errors').offset().top
            }, 800, function () {
            });
        }

    }
    $(window).on("load", function () {
        scrollToWFFMErrors();
    });
})(jQuery);

/* Tabbed Navigation Component */
(function ($) {
    var tabNavigationPane = $(".tab-navigation-container .nav-tabs .tab-pane");
    $(tabNavigationPane).each(function () {
        $(".tab-navigation-container .nav-tabs .tab-pane:nth-last-child(2)").addClass("last-pane");
    });  

    $(tabNavigationPane).on("click", function () {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).find("a").addClass("active");
            $(this).siblings(".tab-pane").removeClass("active");
            $(this).siblings(".tab-pane").find("a").removeClass("active");

            if ($(this).hasClass("last-pane")) {
                $(this).parent().addClass("last-pane-selected");
                $(this).parent().parent("nav").addClass("add-after");

            } else {
                $(this).parent().removeClass("last-pane-selected");
                $(this).parent().parent("nav").removeClass("add-after");
                
            }
        }
        findActiveTabContent($(this).parent());
        getTabWidth();
    })
    function getTabWidth() {
        
        var fullNavWidth = $(".last-pane-selected").width();
        var tabWidth = $(".last-pane-selected .tab-pane").width();
        var numberOfTabs = $(".nav-tabs.last-pane-selected .tab-pane").not(".last-pane").length;
        var widthOfTabs = numberOfTabs * tabWidth;
        var widthOfLastTab = fullNavWidth - widthOfTabs;
        if ($(".last-pane").hasClass("active")) {
            $(".last-pane-selected .last-pane.active").css("width", widthOfLastTab);
        } else {
            $(".last-pane").css("width", "unset");
        }
        
        
        
    }
    function findActiveTabContent(tabsParent) {
        var activeCollectionItem = $(tabsParent).find(".tab-pane.active");
        
        var tabId = $(activeCollectionItem).attr("id");
        var activeTabContent = $(".tab-navigation-container .tab-content .copy-container .tab-pane");
     
        $(activeTabContent).each(function () {
            var tabContentId = $(this).attr("id");
            if (tabContentId == tabId) {
                $(this).addClass("active-tab-content");
                $(this).parents(".copy-container").addClass("active");
            } else {
                $(this).removeClass("active-tab-content");
                $(this).parents(".copy-container").removeClass("active");
            }
          
        });
    }

})(jQuery);
/* Table Component */
(function ($) {
    var termsContainer = $(".table-component_container");
    $(termsContainer).on("click", function () {
        $(this).toggleClass("show-text");
    });
   /*  var overflow = document.querySelector(".overflow");
    if ((overflow.offsetHeight < overflow.scrollHeight) || (overflow.offsetWidth < overflow.scrollWidth)) {
        // your element have overflow
        overflow.classList.add("change-cursor");
    }
    else {
        overflow.classList.remove("change-cursor");
    } */

})(jQuery);

/* Cart Component */
(function ($) {
/*Terms show hide*/
    var cartTermsContainer = $(".terms-container");
    $(cartTermsContainer).on("click", function () {
        $(this).toggleClass("show-text");
    });


})(jQuery);
/* Checkout Component */
(function ($) {
    /*Terms show hide*/
    var accountInput = $(".form-group.account-number");
    var checkoutInput = $(".checkout-container .form-group input");
    var acctChkBx = $(".account-number-ckbx");


    $(acctChkBx).on("click", function () {
        $(this).toggleClass("checked");
        $(accountInput).toggleClass("show");
    });

    /* $(checkoutInput).focus(function () {
         $(this).siblings("label").css("display", "block");
         $(this).removeAttr("placeholder");
     });*/

    $(checkoutInput).each(
        function () {
            $(this).data('holder',
                $(this).attr('placeholder'));
            $(this).focusin(function () {
                $(this).attr('placeholder', '');
                $(this).siblings("label").css("display", "block");
            });
            $(this).focusout(function () {
                $(this).attr('placeholder',
                    $(this).data('holder'));
                if ($(this).val().length === 0) {
                    $(this).siblings("label").css("display", "none");
                }
            });

        });
})(jQuery);
/* Modals */
(function ($) {
    var beforeYouGo = $("#BeforeYouGo");
    var submitBtn = $(beforeYouGo).find(".btn");
    if ($(window).width() < 578) {
        $(submitBtn).empty().addClass("fa fa-arrow-right");
    }

    var saveyourCart = $("#SaveYourCart");
    var saveBtn = $(saveyourCart).find(".btn");
    if ($(window).width() < 578) {
        $(saveBtn).empty().addClass("fa fa-arrow-right mobile-arrow");
    }
    

})(jQuery);

(function ($) {
    var getInTouch = $(".get-in-touch .container-group input");
    
    $(getInTouch).on("click", function () {
        $(".get-in-touch .container-group input:checked").parent(".container-group").parent(".comm-option").addClass("input-checked");
        $(".get-in-touch .container-group input:not(:checked)").parent(".container-group").parent(".comm-option").removeClass("input-checked");
        if ($(".comm-option").hasClass("input-checked")) {
            $(".comm-option.input-checked .checkmark").html("Selected");
            $(".comm-option").not(".input-checked").find(".checkmark").html("Select");
        }
    });
})(jQuery);
/* Add Data */
(function ($) {
    var selectBtn = $(".stepped-component .select-btn");

    $(selectBtn).on("click", function () {
        var jqueryThis = $(this);

        jqueryThis.addClass("selected");
        jqueryThis.parent(".plan").addClass("blue-background");
        jqueryThis.find("a").html("Selected");

        var otherSelects = jqueryThis.parent().siblings().find('.select-btn');

        otherSelects.removeClass("selected");        
        otherSelects.find("a").html("Select");
        otherSelects.parent(".plan").removeClass("blue-background");
    });
})(jQuery);

/* Add Package Yukon */
//(function ($) {
//    var addBtn = $(".yukon .yukon-package .add-btn");

//    $(addBtn).on("click", function () {
//        $(this).toggleClass("added");
//        $(this).parent(".yukon-package").toggleClass("blue-background");
//        if ($(this).hasClass("added")) {
//            $(this).find("a").html("Added");
//        } else {
//            $(this).find("a").html("Add");
//        }
        
//    });
//})(jQuery);

/* Add Device Yukon */
//(function ($) {
//    var addBtn = $(".yukon .yukon-device .add-btn");

//    $(addBtn).on("click", function () {
//        $(this).toggleClass("added");
//        $(this).parent(".yukon-device").toggleClass("blue-background");
//        if ($(this).hasClass("added")) {
//            var CTASelectedTitle = $(this).find("a").attr("data-selected-title");
//            $(this).find("a").html(CTASelectedTitle);
//        } else {
//            var CTASelectTitle = $(this).find("a").attr("data-select-title");
//            $(this).find("a").html(CTASelectTitle);
//        }

//    });
//})(jQuery);


/* Add Internet Yukon */
//(function ($) {
//    var addInternetBtn = $(".yukon .yukon-internet .add-btn");

//    $(addInternetBtn).on("click", function () {
       

//        $(this).addClass("selected");
//        $(this).parent(".yukon-internet").toggleClass("blue-background");
//        $(addInternetBtn).not(this).removeClass("selected");
//        $(this).find("a").html("Selected");
//        $(addInternetBtn).not(this).find("a").html("Select");
//        $(addInternetBtn).not(this).parent(".yukon-internet").removeClass("blue-background");

//        if ($(this).hasClass("need-internet")) {
//            $(".internet-options").show();
//        } else {
//            $(".internet-options").hide();
//        }

//    });
//})(jQuery);
//(function ($) {
//    calculateTotal();
//    var addLine = $(".add-subtract .plus");
//    var subtractLine = $(".add-subtract .minus");
//    var totalLines = $(".add-subtract .current-count.total-count");
//    var totalLinesMax = $(".add-subtract .current-count.total-count").data('max');
//    $(addLine).click(function () {
//        var lineCount = $(this).parent(".add-subtract").find(".current-count");
//        if ($(totalLines).html() <= totalLinesMax - 1) {
//            if ($(lineCount).html() < $(this).data("max")) {
//                $(lineCount).html(function (i, val) {
//                    return val * 1 + 1
//                });
//            }
//        }
       
     
        
//        calculateMonthlyPrice(lineCount);
//        calculateTotal();
//    });

//    $(subtractLine).click(function () {
//        var lineCount = $(this).parent(".add-subtract").find(".current-count");
//        if ($(lineCount).html() > $(this).data("min")) {
//            $(lineCount).html(function (i, val) { return val * 1 - 1 });
//            calculateMonthlyPrice(lineCount);
//            calculateTotal();
//        }
//    });

//    function calculateMonthlyPrice(x) {
//        var y = $(x).html();
//        var monthlyPrice = $(x).parent(".add-subtract").siblings(".add-device-price").find("span").data("val");
//        var newPrice = $(x).parent(".add-subtract").siblings(".add-device-price").find("span");
//        $(newPrice).html(function () {
//            return y * monthlyPrice;
//        });
//    }

//    function calculateTotal() {
//        var sum = 0;
//        $(".add-subtract .current-count:not(.total-count)").each(function (i, value) {

//            var countValue = $(value).text();

//            var iNum = parseInt(countValue);

//            sum += iNum;
//        });
//        $(totalLines).html(sum);
//        calculateTotalyMonthlyPrice();
//    }

//    function calculateTotalyMonthlyPrice() {
//        var devicePrice = $(".monthly-price span");
//        var monthlySum = 0;
//        $(devicePrice).each( function (i, val) {
//            var monthlyValue = $(val).text();

//            var newNum = parseInt(monthlyValue);

//            monthlySum += newNum;
//        });
//        $(".total .add-device-price span").html(monthlySum);
//    }
//})(jQuery);

$(window).ready(function () {
})

$(window).scroll(function () {
})
;