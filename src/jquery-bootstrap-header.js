/****************************************************************************
	jquery-bootstrap-header.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    /*
    A header can contain any of the following icons:
    back (<)
    forward (>)
    extend (^)
    diminish
    pin
    unpin
    new
    warning
    info
    help
    close (x)
    */

    /*
    There are two ways to display icon-buttons on the header:
    1: Small icons inside round borders (default), or
    2: Full sized icons with square background changing color on hover - a la MS Windows

    Popups and Noty always uses 1.

    For bsModals a global variablecan be set to use square icons

    bsHeaderIcons and bsHeaderIconsSquare = {icon, className, title} for the different icons on the header. Set by function to allow updating $.FONTAWESOME_PREFIX_??


    */

    $.BSMODAL_USE_SQUARE_ICONS = $.BSMODAL_USE_SQUARE_ICONS || false;

    let bsHeaderIcons       = $.bsHeaderIcons       = {},
        bsHeaderIconsSquare = $.bsHeaderIconsSquare = {};

    $.getBsHeaderIcons = $.getHeaderIcons = function( SquareIcons ){ return SquareIcons ? bsHeaderIconsSquare : bsHeaderIcons; };
    $.getModalHeaderIcons = function(){ return $.getBsHeaderIcons( $.BSMODAL_USE_SQUARE_ICONS ); };

    function adjustHeaderIcon( headerIcon ){
        if ((typeof headerIcon == 'string') || Array.isArray(headerIcon))
                headerIcon = {icon: headerIcon};
        return headerIcon;
    }

    function adjustHeaderIcons( headerIcons ){
        $.each( headerIcons, (id, cont) => {
            headerIcons[id] = adjustHeaderIcon(cont);
        });
        return headerIcons;
    }
    function getDefaultHeaderIcons( square ){
        return adjustHeaderIcons({
            back    : square ? 'fas fa-arrow-left'  : 'fa-circle-chevron-left',
            forward : square ? 'fas fa-arrow-right' : 'fa-circle-chevron-right',

            pin     : square ? 'fa-thumbtack' : ['fas fa-thumbtack fa-inside-circle', $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle'],
            unpin   : {
                icon: 'fa-thumbtack',
                class: square ? 'header-icon-selected' : null
            },

            extend  : square ? 'fa-square-plus' : 'fa-chevron-circle-up',
            diminish: square ? 'fa-square-minus' : 'fa-chevron-circle-down',


            new     : square ? 'fa-window-maximize' : [ $.FONTAWESOME_PREFIX_STANDARD + ' fa-window-maximize fa-inside-circle2', $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle'],

            warning : {
                icon : square ? 'fa-exclamation' : [ 'fas fa-circle back text-warning', $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle', 'fas fa-exclamation fa-inside-circle-xmark'],
                class: square ? 'header-icon-warning' : null
            },

            info    : square ? 'fa-info' : 'fa-circle-info',
            help    : square ? 'fa-question' : 'fa-circle-question',

            close   : {
                icon : square ? 'fas fa-xmark' : ['fas fa-circle show-for-hover fa-hover-color-red', 'fa-xmark fa-inside-circle-xmark fa-hover-color-white', $.FONTAWESOME_PREFIX_STANDARD+' fa-circle'],
                title: {da:'Luk', en:'Close'},
                class: square ? 'header-icon-close' : null
            }
        });
    }

    $._set_bsHeaderIcons = function( newHeaderIcons = {}, newHeaderIconsSquare = {}){
        bsHeaderIcons       = $.extend(true, getDefaultHeaderIcons(),     bsHeaderIcons,       adjustHeaderIcons(newHeaderIcons)       );
        bsHeaderIconsSquare = $.extend(true, getDefaultHeaderIcons(true), bsHeaderIconsSquare, adjustHeaderIcons(newHeaderIconsSquare) );
    };

    $._set_bsHeaderIcons();

    /******************************************************
    _bsHeaderAndIcons(options, useSquareIcons)
    Create the text and icon content of a header inside this
    options: {
        headerClassName: [string]
        icons: {
            back, forward, ..., close: { title: [string], disabled: [boolean], className: [string], altEvents: [string], onClick: [function] },
        }
    }
    ******************************************************/
    function checkDisabled( event ){
        var $target = $(event.target);
        if ($target.hasClass('disabled') || $target.prop('disabled'))
            event.stopImmediatePropagation();
    }

    $.fn._bsHeaderAndIcons = function(options, useSquareIcons){
        var $this = this;

        options = $.extend( true, {text:'DAVS MED DIG', headerClassName: '', inclHeader: true, icons: {} }, options );
        this
            .addClass( options.headerClassName )
            .addClass('header-content');

        if (options.inclHeader){
            options.header = $._bsAdjustIconAndText(options.header);
            //If header contents more than one text => set the first to "fixed" so that only the following text are truncated
            if (Array.isArray(options.header) && (options.header.length > 1))
                options.header[0].textClass = 'fixed-header';

            this._bsAddHtml( options.header || $.EMPTY_TEXT );
        }
        //Add icons (if any)
        if ( !$.isEmptyObject(options.icons) ){
            //Container for icons
            var $iconContainer =
                    $('<div/>')
                        ._bsAddBaseClassAndSize( {
                            baseClass   :'header-icon-container',
                            useTouchSize: true
                        })
                        .toggleClass('with-square-icons', !!useSquareIcons)
                        .appendTo( this );

            //Add icons
            let headerIcons = useSquareIcons ? bsHeaderIconsSquare : bsHeaderIcons;
            ['back', 'forward', 'pin', 'unpin', 'extend', 'diminish', 'new', 'warning', 'info', 'help', 'close'].forEach( (id) => {
                let iconOptions = options.icons[id];
                if (iconOptions && (iconOptions.onClick || (typeof iconOptions == 'function'))){
                    if (typeof iconOptions == 'function')
                        iconOptions = {onClick: iconOptions};
                    iconOptions = $.extend(true, {}, headerIcons[id] || {}, iconOptions);

                    $._bsCreateIcon(
                        Array.isArray(iconOptions.icon) ? iconOptions.icon : [iconOptions.icon],
                        $iconContainer,
                        iconOptions.title || '',
                        'header-icon ' + (iconOptions.className || '') + ' ' + (iconOptions.class || '')
                    )
                    .toggleClass('hidden', !!iconOptions.hidden)
                    .toggleClass('disabled', !!iconOptions.disabled)
                    .attr('data-header-icon-id', id)
                    .on('click', checkDisabled)
                    .on('click', iconOptions.onClick);

                    //Add alternative (swipe) event
                    if (iconOptions.altEvents)
                        $this.on( iconOptions.altEvents, iconOptions.onClick );
                }
            });
        }
        return this;
    };

}(jQuery, this, document));