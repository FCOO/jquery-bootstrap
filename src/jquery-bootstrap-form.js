/****************************************************************************
	jquery-bootstrap-form.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    /******************************************************
    _wrapLabel( options )
    Wrap the element inside a <label> and add
    options.placeholder and options.label
        <label class="has-float-label">
            <THIS placeholder="options.placeholder"/>
            <span>options.label</span>
        </label>
    Return the label-element
    ******************************************************/
    $.fn._wrapLabel = function(options){

        this.addClass('form-control-with-label');

        var $label = $('<label/>').addClass('has-float-label');
        $label.append( this );

        if (options.placeholder)
            this.i18n( options.placeholder, 'placeholder' );

        $('<span/>')
            ._bsAddHtml( options.label )
            .appendTo( $label );

        return $label;
    };

    $.fn._NEWbsHeaderAndIcons = function(options){
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