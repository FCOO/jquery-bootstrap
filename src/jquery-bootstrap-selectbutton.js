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
        options.onClick = $.fn._bsSelectButton_onClick;
        options.list    = options.list || options.items;
        options._class  = (options._class || '') + ' text-truncate btn-select';
        delete options.items;

        var $result = $.bsButton( options );

        options = $result.data('bsButton_options');
        options.context = $result,
        $result.data('bsButton_options', options);

        if (options.selectedId)
            $result._bsSelectButton_setValue(options.selectedId);

        return $result;
    };

    /**************************************************
    Methods for bsSelectButton
    **************************************************/
    $.fn._bsSelectButton_setValue = function( value ){
        var options = this.data('bsButton_options'),
            selectedItem;

        options.selectedId = value;
        this.data('bsButton_options', options);

        options.list.forEach( function(item){
            if (item.id == value)
                selectedItem = item;
        });

        if (selectedItem){
            this
                .empty()
                ._bsAddHtml(
                    $.extend(true,
                        {textClass: 'text-truncate'},
                        selectedItem
                    )
                );

            if (options.onChange)
                $.proxy(options.onChange, options.context)(value);
        }

        return this;
    }

    $.fn._bsSelectButton_getValue = function(){
        return this.data('bsButton_options').selectedId;
    }

    var $selectButton_Modal = null;
    $.fn._bsSelectButton_onClick = function( id, selected, $button ){
        var options    = this.data('bsButton_options'),
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
            transparentBackground: true,
            content: {
                type         : 'selectlist',
                allowReselect: true,
                list         : list,
                onChange     : $.fn._bsSelectButton_onChange,
                context      : this,
                truncate     : true
            },
            show: true
        });
    }

    /**************************************************
    **************************************************/
    $.fn._bsSelectButton_onChange = function( id ){
        this._bsSelectButton_setValue( id );
        if ($selectButton_Modal)
            $selectButton_Modal.close();
    }

}(jQuery, this, document));