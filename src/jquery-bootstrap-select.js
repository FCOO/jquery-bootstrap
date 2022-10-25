/****************************************************************************
	jquery-bootstrap-select.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, i18next/*, window, document, undefined*/) {
	"use strict";


    /**********************************************************
    bsSelect
    Create a simple <select><option/>*N</select>
    The options can only contain text.
    To support language the text is stored with the <option> and used to update the text
    **********************************************************/
    i18next.on('languageChanged', function() {
        $('.jb-option').each( function( index, option ){
            setOptionText( $(option) );
        });
    });

    function setOptionText( $option ){
        var lang    = i18next.language,
            text    = $option.data('jb-text') || '';

        if (typeof text != 'string')
            text = text[lang] || text['eng'] || text['da'] || '';

        if ($option.prop("tagName") == 'option')
            $option.text( text );
        else
            $option.prop('label', text);
    }

    var selectboxId = 0;
    $.bsSelect = $.bsSelectBox = $.bsSelectbox = function( options ){

        options.items = options.items || options.list;
        options.list = options.list || options.items;

        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectbox'+ selectboxId++,
                baseClass   : 'form-select',
                class       : 'form-control',
                useTouchSize: true,
            });

        //Create select-element
        var $select =
                $('<select/>')
                    ._bsAddBaseClassAndSize( options )
                    ._bsAddIdAndName( options );


$select.on('change', function(){
console.log('>>>', arguments);
});


        $.each( options.list, function( index, itemOptions ){
            var $option =
                    itemOptions.id ?
                    $('<option/>')
                        .val(itemOptions.id)
                        .prop('selected', itemOptions.id == options.selectedId) :
                    $('<optgroup/>');

            $option
                .addClass('jb-option')
                .data('jb-text', itemOptions.text)
                .appendTo($select);

            setOptionText( $option );
        });

        //wrap inside a label (if any)
        var $result = options.label ? $select._wrapLabel({ label: options.label }) : $select;

        $result.toggleClass('w-100', !!options.fullWidth);

        return $result;
    };

}(jQuery, this.i18next, this, document));