"use strict";

(function () {
    $(".mega-dropdown").on("hide.bs.dropdown", function (e) {
        if (e.clickEvent != null && e.clickEvent.target.className.indexOf("sub-link") > -1 || e.clickEvent != null && e.clickEvent.target.className.indexOf("fa-angle") > -1) {
            e.preventDefault();
        }
    });



    $(".main-menu .tabs-vertical-left .submenu-content").on("hidden.bs.collapse", function (e) {
        e.stopPropagation();
    });

    $('.horizontal-tabs-slide').slick({
        responsive: [{
            breakpoint: 1024,
            settings: 'slick'
        },
        {
            breakpoint: 5000,
            settings: 'unslick'
        }
        ],
        infinite: false,
        variableWidth: true,
        slidesToShow: 1,
        dots: false,
        arrows: false,
        centerMode: false
    });

    $('.horizontal-tabs-slide.slick-slider .nav-link.sub-link').on("show.bs.tab", function (e) {

        var $this = $(this);
        $('.horizontal-tabs-slide.slick-slider .nav-link.sub-link').removeClass('active').removeClass('show');
        $this.addClass('active').addClass('show');
    });

})();

//IE11 megamenu dropdown fix 
function fixMegaMenu() {
    var $navbar = $('.theme-gcib header .main-menu .navbar');
    var $dropdown = $('.theme-gcib header .main-menu .mega-dropdown-menu');

    $dropdown.each(function () {
        $(this).width($navbar.width());
    });
}


$(document).ready(function () {
    fixMegaMenu();
})

$(window).ready(function () {
})

$(window).scroll(function () {
})

