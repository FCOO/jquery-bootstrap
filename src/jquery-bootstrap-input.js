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
        Also add input-mask using https://github.com/RobinHerbots/Inputmask
        ******************************************************/
        bsInput: function( options ){
            if (options.inputmask)
                options.placeholder = null;

            var $input =
                    $('<input/>')
                        ._bsAddIdAndName( options )
                        ._bsAddBaseClassAndSize({baseClass: 'form-control', useTouchSize: true})
                        .attr('type', 'text');

            if (options.inputmask){
                /* NOT USED FOR NOW
                var updateFunc = $.proxy($input._onInputmaskChanged, $input);
                options.inputmask.oncomplete   = options.inputmask.oncomplete   || updateFunc;
                options.inputmask.onincomplete = options.inputmask.onincomplete || updateFunc;
                options.inputmask.oncleared    = options.inputmask.oncleared    || updateFunc;
                */

                //Bug fix in chrome: Keep mask in input to prevent label "flicking"
                options.inputmask.clearMaskOnLostFocus = false;

                $input.inputmask(options.inputmask);
            }

            return $input._wrapLabel(options);
        },

    });


    $.fn.extend({
        /* NOT USED FOR NOW
        _onInputmaskChanged: function( inputmaskStatus ){
            var $this = $(this);
            $(this).closest('.input-group-container').toggleClass('has-warning', !$this.inputmask("isComplete"));
            $(this).closest('.input-group').toggleClass('has-warning', !$this.inputmask("isComplete"));
        },
        */

        /******************************************************
        _wrapLabel( options )
        Wrap the element inside a <label> and add
        options.placeholder and options.label
            <label class="label-inside">
                <THIS placeholder="options.placeholder"/>
                <span>options.label</span>
            </label>
        Return the label-element
        ******************************************************/
        _wrapLabel: function(options){
            var $label = $('<label/>')
                            .addClass('label-inside')
                            .append( this );

            if (options.placeholder)
                this.i18n( options.placeholder, 'placeholder' );

            $('<span/>')
                ._bsAddHtml( options.label )
                .addClass('label-content')
                .appendTo( $label )
                .on('mouseenter', function(){ $label.addClass('hover');    })
                .on('mouseleave', function(){ $label.removeClass('hover'); });

            return $label;
        },
    });


}(jQuery, this, document));