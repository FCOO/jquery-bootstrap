/****************************************************************************
	jquery-bootstrap-input.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    $.extend({
        /******************************************************
        $.bsInput( options )
        Create a <input type="text" class="form-control"> inside a <label>
        ******************************************************/
        bsInput: function( options ){
            return  $('<input/>')
                        ._bsAddIdAndName( options )
                        .addClass('form-control-border form-control')
                        .attr('type', 'text')
                        ._wrapLabel(options);
        },

    }); //$.extend({


    $.fn.extend({
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
        _wrapLabel: function(options){
            this.addClass('form-control-with-label');

            var $label = $('<label/>').addClass('has-float-label');
            $label.append( this );

            if (options.placeholder)
                this.i18n( options.placeholder, 'placeholder' );

            $('<span/>')
                ._bsAddHtml( options.label )
                .appendTo( $label )
                .on('mouseenter', function(){ $label.addClass('hover');    })
                .on('mouseleave', function(){ $label.removeClass('hover'); });

            return $label;
        },


    }); //$.fn.extend({


}(jQuery, this, document));