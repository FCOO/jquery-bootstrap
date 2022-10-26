/****************************************************************************
	jquery-bootstrap-selectbutton.js,

    bsSelectButton( options ) - create a button that opens a modal with a selectlist

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    var selectButtonId = 0;
    $.bsSelectButton = $.bsSelectbutton = function( options ){

        options.id      = options.id || '_bsSelectButton'+ selectButtonId++,
        options.text    = options.text || {da:'Vælg...', en:'Select...'};
        options.onClick = bsSelectButton_onClick;
        options.list    = options.list || options.items;
        options._class  = (options._class || '') + ' text-truncate btn-select';
        delete options.items;

        var $result = $.bsButton( options );

        if (options.selectedId)
            $.proxy(bsSelectButton_onChange, $result)(options.selectedId);

        return $result;
    };


    var $selectButton_Modal = null;
    /**************************************************
    **************************************************/
    function bsSelectButton_onClick( id, selected, $button ){
        var options    = $button.data('bsButton_options'),
            selectedId = options.selectedId,
            list       = $.extend(true, {}, options).list;

        list.forEach(function(item){
            item.selected = item.id ? item.id == selectedId : false;
        });

        if ($selectButton_Modal)
            $selectButton_Modal.remove();

        $selectButton_Modal = $.bsModal({
            noHeader    : true,
            closeButton : false,
            clickable   : true,
            content: {
                type         : 'selectlist',
                allowReselect: true,
                list         : list,
                onChange     : bsSelectButton_onChange,
                context      : $button,
            },
            show: true
        });
    }

    /**************************************************
    **************************************************/
    function bsSelectButton_onChange( id ){
        var options = this.data('bsButton_options'),
            list    = options.list,
            selectedItem;

        options.selectedId = id;
        this.data('bsButton_options', options);

        list.forEach( function(item){
            if (item.id == id)
                selectedItem = item;
        });

        this.empty()._bsAddHtml(selectedItem);

        if (options.onChange)
            $.proxy(options.onChange, options.context)(id);

        if ($selectButton_Modal)
            $selectButton_Modal.close();
    }

}(jQuery, this, document));