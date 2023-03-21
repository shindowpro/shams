(function ($) {
    $(document).ready(function () {
        "use strict";
        $('.xs-dropdown-trigger').on('click', function (event) {
            event.preventDefault(); toggleNav()
        });
        $('.cd-dropdown .cd-close').on('click', function (event) { event.preventDefault(); toggleNav() });
        $('.has-children').children('a').on('click', function (event) {
            event.preventDefault(); var selected = $(this); selected.next('ul').removeClass('is-hidden').end().parent('.has-children').parent('ul').addClass('move-out')
        });
        var submenuDirection = (!$('.cd-dropdown-wrapper').hasClass('open-to-left')) ? 'right' : 'left';
        $('.cd-dropdown-content').menuAim(
            {
                activate: function (row) {
                    $(row).children().addClass('is-active').removeClass('');
                    if ($('.cd-dropdown-content').length == 0) $(row).children('ul').addClass('')
                },
                deactivate: function (row) {
                    $(row).children().removeClass('is-active');
                    if ($('li.has-children:hover').length == 0 || $('li.has-children:hover').is($(row))) {
                        $('.cd-dropdown-content').find('').removeClass(''); $(row).children('ul').addClass('')
                    }
                },
                exitMenu: function () {
                    $('.cd-dropdown-content').find('.is-active').removeClass('is-active'); return !0
                },
                submenuDirection: submenuDirection,
            });
        $('.go-back').on('click', function () {
            var selected = $(this),
                visibleNav = $(this).parent('ul').parent('.has-children').parent('ul');
            selected.parent('ul').addClass('is-hidden').parent('.has-children').parent('ul').removeClass('move-out')
        });
        function toggleNav() {
            var navIsVisible = (!$('.cd-dropdown').hasClass('dropdown-is-active')) ? !0 : !1;
            $('.cd-dropdown').toggleClass('dropdown-is-active', navIsVisible);
            $('.xs-dropdown-trigger').toggleClass('dropdown-is-active', navIsVisible);
            if (!navIsVisible) {
                $('.cd-dropdown').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function () {
                    $('.has-children ul').addClass('is-hidden');
                    $('.move-out').removeClass('move-out');
                    $('.is-active').removeClass('is-active')
                })
            }
        }
        if (!Modernizr.input.placeholder) {
            $('[placeholder]').focus(function () {
                var input = $(this);
                if (input.val() == input.attr('placeholder')) { input.val('') }
            }).blur(function () {
                var input = $(this);
                if (input.val() == '' || input.val() == input.attr('placeholder')) { input.val(input.attr('placeholder')) }
            }).blur();
            $('[placeholder]').parents('form').submit(function () {
                $(this).find('[placeholder]').each(function () {
                    var input = $(this);
                    if (input.val() == input.attr('placeholder')) { input.val('') }
                })
            })
        }
    })
})(jQuery)