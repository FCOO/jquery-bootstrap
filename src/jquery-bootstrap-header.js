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

    close (x)

    */

    //$.bsHeaderIcons = class-names for the different icons on the header
    $.bsHeaderIcons = {
        back    : 'fa-chevron-left',
        forward : 'fa-chevron-right',

        pin     : ['fas fa-thumbtack fa-inside-circle', 'far fa-circle'],
        unpin   : 'fa-thumbtack',

        extend  : 'fa-chevron-up',
        diminish: 'fa-chevron-down',

        new     : ['far fa-window-maximize fa-inside-circle2', 'far fa-circle'],

        close   : ['fas fa-circle back', 'far fa-times-circle middle', 'fas fa-times-circle front']
    };

    //mandatoryHeaderIconClass = mandatory class-names and title for the different icons on the header
    var mandatoryHeaderIconClassAndTitle = {
        close: {class:'header-icon-close', title: {da:'Luk', en:'Close'}},
    };

    /******************************************************
    _bsHeaderAndIcons(options)
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

    $.fn._bsHeaderAndIcons = function(options){
        var $this = this;

        options = $.extend( true, {headerClassName: '', inclHeader: true, icons: {} }, options );
        this.addClass( options.headerClassName );

        if (options.inclHeader){
            options.header = $._bsAdjustIconAndText(options.header);
            //If header contents more than one text => set the first to "fixed" so that only the following text are truncated
            if ($.isArray(options.header) && (options.header.length > 1)){
                options.header[0].textClass = 'fixed-header';
            }
            this._bsAddHtml( options.header || $.EMPTY_TEXT );
        }
        //Add icons (if any)
        if ( !$.isEmptyObject(options.icons) ) {
            //Container for icons
            var $iconContainer =
                    $('<div/>')
                        ._bsAddBaseClassAndSize( {
                            baseClass   :'header-icon-container',
                            useTouchSize: true
                        })
                        .appendTo( this );

            //Add icons
            $.each( ['back', 'forward', 'pin', 'unpin', 'extend', 'diminish', 'new', 'close'], function( index, id ){
                var iconOptions = options.icons[id],
                    classAndTitle = mandatoryHeaderIconClassAndTitle[id] || {};

                if (iconOptions && iconOptions.onClick){
                    $._bsCreateIcon(
                        $.bsHeaderIcons[id],
                        $iconContainer,
                        iconOptions.title || classAndTitle.title || '',
                        (iconOptions.className || '') + ' header-icon ' + (classAndTitle.class || '')
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