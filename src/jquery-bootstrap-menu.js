/****************************************************************************
	jquery-bootstrap-menu.js,

	(c) 2019, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document, undefined) {
	"use strict";

    /**********************************************************
    bsMenu( options ) - create a group of menu-items.
    Each item can be a header, radio-button, checkbox-button or standard button

    options:
        //any options from list as global/default values

        fullWidth: [BOOLEAN]. false

        list: [] of {

            id  : [STRING], null => type='header'
            type: [STRING], 'header'/'button'/'radio'/'checkbox'

            radioGroupId/radioId: [STRING]. Not null  => type = 'radio'
            list: [] of {icon, text} . ONLY for type == 'radio'

            onChange: function(id, selected [$buttonGroup]). Not null => type = 'checkbox' (if radioGroupId == null)
            onClick: function(id). Not null => type = 'button'
            selected: [BOOLEAN] or function(id [, radioGroupId]) - return true if the item is selected (both rsdio and checkbox)
            disabled: [BOOLEAN] or function(id [, radioGroupId]) - return true if the item is disabled
            hidden  : [BOOLEAN] or function(id [, radioGroupId]) - return true if the item is hidden

            lineBefore: [BOOLEAN] - insert a <hr> before the item
            lineAfter : [BOOLEAN] - insert a <hr> after the item

        }

    **********************************************************/
    function nothing(){ return false; }
    function allways(){ return true; }

    function updateBsMenu(){
        var options = this.data('bsMenu_options');

        //Update all items
        var $firstItem, $lastItem;
        $.each(options.list, function(index, itemOptions){
            var $item  = itemOptions.$item,
                hidden = !!itemOptions.hidden();

            $item.removeClass('first last');
            hidden ? $item.hide() : $item.show();
            $item.toggleClass('disabled', !!itemOptions.disabled() );

            if (!hidden){
                $firstItem = $firstItem || $item;
                $lastItem = $item;
            }
        });

        if ($firstItem)
            $firstItem.addClass('first');
        if ($lastItem)
            $lastItem.addClass('last');
    }

    $.bsMenu = function( options = {}){
        //Adjust options.list
        var list = options.list = options.list || [];
        $.each(list, function(index, itemOptions){

            //Set type from other values
            if (!itemOptions.type){
                if (itemOptions.radioGroupId)
                    itemOptions.type = 'radio';
                else
                if (itemOptions.onChange)
                    itemOptions.type = 'checkbox';
                else
                if (itemOptions.onClick)
                    itemOptions.type = 'button';
                else
                if (itemOptions.content)
                    itemOptions.type = 'content';
            }

            //Use default values
            function setDefault(id){
                if (itemOptions[id] === undefined)
                    itemOptions[id] = options[id] || nothing;
                if (!$.isFunction(itemOptions[id]))
                    itemOptions[id] = itemOptions[id] ? allways : nothing;
            }

            if ((itemOptions.type == 'radio') || (itemOptions.type == 'checkbox')){

                itemOptions.radioGroupId = itemOptions.radioGroupId || itemOptions.radioId || itemOptions.id;
                itemOptions.id = itemOptions.radioGroupId; //To prevent no-close-on-click in popover

                setDefault('onChange');

                //Allow selected as function
                setDefault('selected');
                itemOptions.isSelected = itemOptions.selected;
                itemOptions.selected = itemOptions.isSelected();
            }

            if (itemOptions.type == 'button')
                setDefault('onClick');

            setDefault('disabled');
            setDefault('hidden');
        });

        //Create bsButtonGroup, but without any buttons (for now)
        var $result       = $.bsButtonGroup( $.extend({}, options, {class:'bs-menu-container', center: false, vertical: true, list: [] }) ),
            $previousItem = null,
            spaceAfter    = false;

        //Append the items
        $.each(list, function(index, itemOptions){
            var $item = null,
                isItemWithSpaceAfter = false,
                radioGroup = null;

            itemOptions.small = options.small;

            switch (itemOptions.type){
                case 'button':
                    $item = $.bsButton($.extend(itemOptions, {returnFromClick: true}));
                    isItemWithSpaceAfter = true;
                    break;

                case 'checkbox':
                    $item = $.bsStandardCheckboxButton(itemOptions);
                    isItemWithSpaceAfter = true;
                    break;

                case 'radio':
                    $item = $.bsRadioButtonGroup( $.extend({vertical: true, fullWidth: true}, itemOptions));
                    radioGroup = $item.data('radioGroup');
                    isItemWithSpaceAfter = true;
                    break;

                case 'content':
                    var content = itemOptions.content;
                    if (content instanceof $)
                        $item = content.clone(true);
                    else
                        $item = $('<div/>')._bsAddHtml( content );
                    break;

                default:
                    //A header
                    $item = $('<div/>')
                                .addClass('btn header-content')
                                .toggleClass('header-main', !!itemOptions.mainHeader)
                                ._bsAddHtml( itemOptions );
                    itemOptions.spaceBefore = true;
            }

            $item.addClass(itemOptions.class);

            if (isItemWithSpaceAfter)
                $item.addClass('text-truncate');

            if ((itemOptions.spaceBefore || itemOptions.lineBefore || spaceAfter) && $previousItem){
                $previousItem.addClass('space-after');
            }
            spaceAfter = itemOptions.spaceAfter || itemOptions.lineAfter;

            $previousItem = isItemWithSpaceAfter ? $item : null;

            $result.append($item);

            options.list[index].$item = $item;
            options.list[index].radioGroup = radioGroup;

        });
        $result.data('bsMenu_options', options);
        var update = $.proxy(updateBsMenu, $result);
        $result.on('click', update);

        update();

        return $result;
    };

    function eachBsMenuListItem( itemFunc, values, $this ){
        $.each($this.data('bsMenu_options').list, function(index, item){
            if (item.id && ( (item.type == 'checkbox') || (item.type == 'radio') ) )
                itemFunc(item, values, $this );
        });
        return values;
    }

    $.fn._bsMenu_getValues = function(){
        var values = {};
        eachBsMenuListItem(
            function( item, values ){
                switch (item.type){
                    case 'checkbox':
                        values[item.id] = item.$item._cbxGet();
                        break;
                    case 'radio':
                        values[item.id] = item.radioGroup.getSelected();
                        break;
                }
            },
            values,
            this
        );
        return values;
    };

    $.fn._bsMenu_setValues = function(values){
        eachBsMenuListItem(
            function( item, values ){
                var newValue = values[item.id];
                if (newValue !== undefined){
                    switch (item.type){
                        case 'checkbox':
                            if (item.$item._cbxGet() != newValue)
                                item.$item._cbxSet( newValue );
                            break;
                        case 'radio':
                            if (item.radioGroup.getSelected() != newValue)
                                item.radioGroup.setSelected( newValue );
                            break;
                    }
                }
            },
            values,
            this
        );
        return values;
    };
}(jQuery, this, document));