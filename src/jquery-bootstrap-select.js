/****************************************************************************
	jquery-bootstrap-select.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

    $.bsSelectbox based on
    bootstrap-select https://developer.snapappointments.com/bootstrap-select/


****************************************************************************/

(function ($, window/*, document, undefined*/) {
	"use strict";

    //Setting defaults for bootstrap-select
    $.fn.selectpicker.Constructor.BootstrapVersion = '4';

    $.fn.selectpicker.Constructor.DEFAULTS = $.extend( $.fn.selectpicker.Constructor.DEFAULTS, {

        styleBase         : 'btn',
        style             : 'btn-standard',
        size              : 'auto',
        selectedTextFormat: 'values',

        title           : ' ', //Must be not-empty
        noneSelectedText: '',  //Must be empty

        width       : '100%',
        container   : 'body',
        hideDisabled: false,
        showSubtext : false,
        showIcon    : true,
        showContent : true,
        dropupAuto  : true,
        header      : false,
        liveSearch  : false,
        liveSearchPlaceholder: null,
        liveSearchNormalize  : false,
        liveSearchStyle      : 'contains',
        actionsBox: false,
        showTick  : true,
        iconBase: $.FONTAWESOME_PREFIX,
        tickIcon: 'fa-ok',
    });

    //Sets max visible items in list to four if the screen is 'small'
    if ( Math.min(window.screen.width, window.screen.height) < 420 )
        $.fn.selectpicker.Constructor.DEFAULTS.size = 4;

    /**********************************************************
    Extend selectpicker
    **********************************************************/
    var bsSelectpicker = {
        bsOnLoaded: function(){
            var dataList  = this.selectpicker.main.data,
                elemList  = this.selectpicker.main.elements,
                options   = this.bsOptions,
                itemIndex = 0;

            //Update content of all items
            $.each( dataList, function(index, data){
                if (data.display){
                    var $child = $(elemList[index]).children().first();
                    if ($child.length){
                        $child.empty();
                        $child._bsAddHtml(options.items[itemIndex]);
                    }

                    itemIndex++;
                }
            });

            //Set selected item (if any)
            this.$select.selectpicker('val', this.selectedId ? this.selectedId : null);
        },

        bsOnRendered: function(){
            this.bsUpdateSelectedItem();
            this.bsUpdateLabel();
        },

        bsOnChanged: function(/*e, clickedIndex, isSelected, previousValue*/) {
            var selectedIndex = this.$select[0].selectedIndex;

            if ((selectedIndex > 0) && this.bsOptions.onChange)
                this.bsOptions.onChange( this.itemOptionsList[selectedIndex].id, true );
        },

        bsOnShow: function(){
            this.bsUpdateSelectedItem();
            this.bsUpdateLabel( false );
        },

        bsOnHide: function(){
            this.bsUpdateLabel();
        },

        bsUpdateSelectedItem: function(){
            this.$inner = this.$inner || this.$select.parent().find('.filter-option-inner-inner');
            this.$inner.empty();

            var selectedIndex = this.$select[0].selectedIndex;
            if (selectedIndex > 0)
                this.$inner._bsAddHtml(this.itemOptionsList[selectedIndex]);
            else
                this.$inner.html('&nbsp;');
        },

        bsUpdateLabel: function( showLabelAsPlaceholder ){
            if (typeof showLabelAsPlaceholder != 'boolean')
                showLabelAsPlaceholder = !this.$select.selectpicker('val');
            this.$formControl.toggleClass('show-label-as-placeholder', showLabelAsPlaceholder);
        }
    };

    /**********************************************************
    Add method to close bsSelectBox to $._bsModal_closeMethods
    (See jquery-bootstrap.js)
    **********************************************************/
    $._bsModal_closeMethods = $._bsModal_closeMethods || [];
    $._bsModal_closeMethods.push({
        selector: '.dropdown.bootstrap-select select',
        method  : function($selectBox){
            var selectpicker = $selectBox.data('selectpicker');
            if (selectpicker && selectpicker.$menu.hasClass('show'))
                $selectBox.selectpicker('toggle');
        }
    });

    /**********************************************************
    bsSelectbox
    **********************************************************/
    var selectboxId = 0;
    $.bsSelectBox = $.bsSelectbox = function( options ){
        //Add size-class to button-class
        var buttonSizeClass = $._bsGetSizeClass({
                baseClass   : 'btn',
                small       : options.small,
                useTouchSize: true
            }),
            dropdownMenuSizeClass = $._bsGetSizeClass({
                baseClass   : 'dropdown-menu',
                small       : options.small,
                useTouchSize: true
            });

        options =
            $._bsAdjustOptions( options, {
                id          : '_bsSelectbox'+ selectboxId++,
                baseClass   : 'btn',
                class       : '',
                style       : 'btn-standard ' + buttonSizeClass,
                useTouchSize: true,
                data: [],
            });

        //Convert placeholder (if any)
        if (options.placeholder){
            options.placeholder = $._bsAdjustIconAndText( options.placeholder );
            options.placeholder = $.extend(options.placeholder, {
                id   : -1,
                _text: options.placeholder.text,
                text : ''
            });
        }

        //Create result and select-element
        var $select =
                $('<select/>')
                    ._bsAddIdAndName( options ),
            $formControl =
                $('<div class="form-control-with-label"></div>')
                    .append( $select );

        //Convert options.items to select-option
        var selectedId = null,
            $currentParent = $select,
            itemOptionsList = [{}]; //{} = dummy for the title

        $.each( options.items, function( index, itemOptions ){
            if (itemOptions.id){
                itemOptionsList.push(itemOptions);

                if (itemOptions.id == options.selectedId)
                    selectedId = itemOptions.id;

                $('<option/>')
                    .text(itemOptions.id)
                    .prop('selected', itemOptions.id == options.selectedId)
                    .appendTo($currentParent);
            }
            else
                $currentParent =
                    $('<optgroup/>')
                        .prop('label', index)
                        .appendTo($select);
        });

        //Create selectpicker
        var selectpicker = $select.selectpicker(options).data('selectpicker');

        $.extend(selectpicker, bsSelectpicker);

        selectpicker.bsOptions = options;
        selectpicker.itemOptionsList = itemOptionsList;
        selectpicker.selectedId = selectedId;
        selectpicker.$select = $select;
        selectpicker.$formControl = $formControl;

        $select.data('selectpicker', selectpicker);

        //Set size-class for dropdown-menu
        $select.parent().find('.dropdown-menu').addClass(dropdownMenuSizeClass);

        //Replace default arrow with Chevrolet-style
        $('<i/>')
            .addClass('fa chevrolet')
            .appendTo( $select.parent().find('.filter-option-inner') );

        //wrap inside a label
        var $label = $formControl._wrapLabel({ label: options.label });

        //Open/close select when click on the label
        $label.on('click', function(event){
            $select.selectpicker('toggle');
            event.stopPropagation();
            return false;
        });

        //Add events
        function selectpickerEventFromSelect( methodId ){
            return function(){
                var selectpicker = $(this).data('selectpicker');
                return selectpicker[methodId].apply(selectpicker, arguments);
            };
        }
        $select.on('changed.bs.select',  selectpickerEventFromSelect( 'bsOnChanged'  ) );
        $select.on('loaded.bs.select',   selectpickerEventFromSelect( 'bsOnLoaded'   ) );
        $select.on('rendered.bs.select', selectpickerEventFromSelect( 'bsOnRendered' ) );
        $select.on('show.bs.select',     selectpickerEventFromSelect( 'bsOnShow'     ) );
        $select.on('hide.bs.select',     selectpickerEventFromSelect( 'bsOnHide'     ) );

        return $label;
    };

}(jQuery, this, document));