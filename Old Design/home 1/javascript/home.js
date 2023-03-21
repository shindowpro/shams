$(document).ready(function () {
    "use strict";
    //cordinate navbar with active
    $(".navbar-light .navbar-nav .nav-link").click(function () {
        $(".navbar-light .navbar-nav .nav-link").removeClass("active");
        $(this).addClass("active");
    });
});    