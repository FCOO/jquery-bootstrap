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

    //$.bsHeaderIcons = class-names for the different icons on the header. Set by function to allow updating $.FONTAWESOME_PREFIX_??
    $.bsHeaderIcons = {};
    $._set_bsHeaderIcons = function( forceOptions = {}){

        $.bsHeaderIcons = $.extend( $.bsHeaderIcons, {
            back    : 'fa-circle-chevron-left',
            forward : 'fa-circle-chevron-right',

            pin     : ['fas fa-thumbtack fa-inside-circle', $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle'],
            unpin   : 'fa-thumbtack',

            extend  : 'fa-chevron-circle-up',
            diminish: 'fa-chevron-circle-down',


            new     : [ $.FONTAWESOME_PREFIX_STANDARD + ' fa-window-maximize fa-inside-circle2',
                        $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle'  ],

            warning : [ 'fas fa-circle back text-warning',
                        $.FONTAWESOME_PREFIX_STANDARD + ' fa-circle',
                        'fas fa-exclamation fa-inside-circle-xmark'   ],

            info    : 'fa-circle-info',
            help    : 'fa-circle-question',

            close   : [ 'fas fa-circle show-for-hover fa-hover-color-red',
                        'fa-xmark fa-inside-circle-xmark fa-hover-color-white',
                        $.FONTAWESOME_PREFIX_STANDARD+' fa-circle' ]

        }, forceOptions );
    };
    $._set_bsHeaderIcons();

    //mandatoryHeaderIconClass = mandatory class-names and title for the different icons on the header
    var mandatoryHeaderIconClassAndTitle = {
        close  : {/*class:'',*/ title: {da:'Luk', en:'Close'}},
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

        options = $.extend( true, {text:'DAVS MED DIG', headerClassName: '', inclHeader: true, icons: {} }, options );
        this.addClass( options.headerClassName );
        this.addClass('header-content');

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
            $.each( ['back', 'forward', 'pin', 'unpin', 'extend', 'diminish', 'new', 'warning', 'info', 'help', 'close'], function( index, id ){
                var iconOptions = options.icons[id],
                    classAndTitle = mandatoryHeaderIconClassAndTitle[id] || {};

                if (iconOptions && iconOptions.onClick){
                    var icon = iconOptions.icon || $.bsHeaderIcons[id];
                    icon = $.isArray(icon) ? icon : [icon];

                    $._bsCreateIcon(
                        icon,
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