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
                        .addClass('form-control-border form-control')
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


        /******************************************************
        $.bsText( options )
        Create a <div> with text inside a <label>
        ******************************************************/
/* REMOVED. ALL TEXT-INPUTS ARE CREATED IN _bsAppendContent
        bsText: function( options ){
            return $('<div/>')
                       ._bsAddHtml( options )
                       .addClass('form-control-border form-control no-hover')
                       ._wrapLabel(options);
        },
//*/
        /******************************************************
        $.bsTextArea( options )
        Create a <div> with text inside a <label>
        ******************************************************/
/* REMOVED. ALL TEXT-INPUTS ARE CREATED IN _bsAppendContent
        bsTextArea: function( options ){
            var $result = $.bsText( options );
            $result.children('.form-control').css('height', 'auto');
            return $result;
        }
//*/
    });


    $.fn.extend({
        /* NOT USED FOR NOW
        _onInputmaskChanged: function( inputmaskStatus ){
            var $this = $(this);
            $(this).closest('.form-group').toggleClass('has-warning', !$this.inputmask("isComplete"));
            $(this).closest('.input-group').toggleClass('has-warning', !$this.inputmask("isComplete"));
        },
        */

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
    });


}(jQuery, this, document));