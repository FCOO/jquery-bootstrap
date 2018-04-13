/****************************************************************************
	jquery-bootstrap-checkbox.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";

    /**********************************************************
    bsCheckbox( options ) - create a Bootstrap checkbox
    **********************************************************/
    $.bsCheckbox = function( options ){
        options =
            $._bsAdjustOptions( options, {
                useTouchSize: true,
                baseClass   : options.type || 'checkbox'
            });

        //Create outer div
        var $result = $('<div/>')._bsAddBaseClassAndSize( options ),

        //Create input-element
            $input =
                $('<input/>')
                    .prop({
                        type   : 'checkbox',
                        checked: options.selected
                    })
                    ._bsAddIdAndName( options )
                    .appendTo( $result );

        //Create input-element as checkbox from jquery-checkbox-radio-group
        $input.checkbox( options );

        //Get id and update input.id
        var id = $input.data('cbx_options').id;
        $input.prop({id: id });

        //Add label
        var $label = $('<label/>')
                        .prop('for', id )
                        .appendTo( $result );
        if (options.text)
            $('<span/>').i18n( options.text ).appendTo( $label );

        return $result;
    };
}(jQuery, this, document));

