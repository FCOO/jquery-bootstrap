/****************************************************************************
	jquery-bootstrap-header.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    /******************************************************
    _bsHeaderAndIcons(options)
    Create the text and icon content of a header inside this
    options: {
        headerClassName: [string]
        icons: {
            close   : { className: [string], altEvents: [string], onClick: [function] },
            extend  : { className: [string], altEvents: [string], onClick: [function] },
            diminish: { className: [string], altEvents: [string], onClick: [function] },
        }
    }

    ******************************************************/
    $.fn._bsHeaderAndIcons = function(options){
        var $this = this;

        options = $.extend( true,
            {
                headerClassName: '',
                icons          : {}
            },
            options
        );

        this
            .addClass( options.headerClassName )
            ._bsAddHtml( options.header || $.EMPTY_TEXT );

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
            $.each( ['diminish', 'extend', 'close'], function( index, id ){
                var iconOptions = options.icons[id];
                if (iconOptions && iconOptions.onClick){
                    $('<i/>')
                        .addClass('header-icon header-icon-' + id )
                        .addClass( iconOptions.className || '')
                        .on('click', iconOptions.onClick)
                        .attr( iconOptions.attr || {})
                        .data( iconOptions.data || {})
                        .appendTo($iconContainer);

                    //Add alternative (swipe) event
                    if (iconOptions.altEvents)
                        $this.on( iconOptions.altEvents, iconOptions.onClick );
                }
            });
        }
        return this;
    };

}(jQuery, this, document));