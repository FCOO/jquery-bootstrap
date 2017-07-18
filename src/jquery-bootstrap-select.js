/****************************************************************************
	jquery-bootstrap-select.js, 

	(c) 2017, FCOO

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /**********************************************************
    bsSelectbox( options ) - create a Bootstrap-selectbox
    **********************************************************/
    var selectboxId = 0;

    //Function called when a new item is selected: Update the dropdownmenu-button with the content from the selected item
    function postOnChange( $selectedItem ){
        if ($selectedItem.length == 0)
            return;
        //Clone the new content from the selected element and replace the original content with the new
        var newContent = $selectedItem.find('._content').clone(true).addClass('selected-content');
        
        //Old content
        $selectedItem.closest( '.dropdown-selectbox').find('.selected-content')
            .after( newContent ) //Insert new content after
            .remove();           //Remove old content
    }

    $.bsSelectbox = function( options ){
        var id = '_bsSelectbox'+ selectboxId++;
        options = 
            $._bsAdjustOptions( options, {
                baseClass   : 'dropdown-selectbox',
                class       : 'dropdown',
                //REMOVED - Only ONE size 
                addSizeClass: true,
            });

        var $result = $('<div/>')
                        ._bsAddBaseClassAndSize( options );

        //Create the dropdown-button
        var placeholder = options.placeholder || {da:'Vælg...', en:'Select...'};
        $.bsButton({
                tagName     : 'div',
                class       : '',
                addSizeClass: false,
                addOnClick  : false
            })
            .attr({ 
                'id'           : id,
                'role'         : 'botton',
                'data-toggle'  : 'dropdown',
                'aria-haspopup': true,
                'aria-expanded': false
               
            })

            //Append span with selected content or placeholder
            .append( 
                $('<span/>')
                    .addClass( 'selected-content empty' )
                    ._bsAddHtml( {text: placeholder } )
             )

            //Append open-icon
            .append( 
                $('<i/>').addClass('fa arrow') 
            )

            .appendTo( $result );

        var $dropdown_menu = $('<div/>')
                                .addClass('dropdown-menu')
                                .attr('aria-labelledby', id )
                                .appendTo( $result ),

            $dropdown_menu_content = $dropdown_menu.addScrollbar();



        var radioGroup = $.radioGroup( 
                            $.extend({}, options, {
                                radioGroupId     : options.id || id, 
                                className        : 'active', 
                                allowZeroSelected: false,
                                postOnChange     : postOnChange
                            })
                         ); 

        $.each( options.list, function( index, itemOptions ){
            var isItem = (itemOptions.id != undefined ),
                $item = $('<div/>')
                            .addClass( isItem ? 'dropdown-item' : 'dropdown-header' )

                            //Create contents inside a span-element to allow easy duplication
                            .append(
                                $('<span/>')
                                    .addClass('_content')
                                    ._bsAddHtml( itemOptions )
                            )
                            .appendTo( $dropdown_menu_content );

                if (isItem)
                    radioGroup.addElement( $item, itemOptions );
        });


        //Updates dropdownmenu-button with selected contents (if any)
        postOnChange( $dropdown_menu_content.find( '.dropdown-item.active' ).first() );


        
        //REMOVED: Setting the width of the dropdown-button equal the width of the item-box. Need timeout to allow DOM in some browser to finish adding elements
/*
        setTimeout(function(){
            var bodyFontSize = parseFloat( $('body').css('font-size') ),
                dropDownMenuWidth = $dropdown_menu.outerWidth()/bodyFontSize + 'rem';
                $result.width( dropDownMenuWidth );
        }, 100);
*/
        return $result;
    };


    /**********************************************************
    bsList( options ) - create a Bootstrap-list
    **********************************************************/
    function listOptions( options ){
        return $.extend({
            tagName               : 'div',
            baseClass             : 'list-group',
            leftClass             : '', //Overwrite leftClass for button-group
            centerClass           : 'list-group-center',
            addSizeClass          : true,
            vertical              : true,
            verticalClassPostfix  : '', 
            horizontalClassPostfix: '-horizontal',
            attr                  : '',
            buttonOptions: {
                baseClass   :'list-group-item list-group-item-action',
                styleClass  : '',
                addSizeClass: false                    
            }
        },
        options );
    }
    /**********************************************************
    bsSelectList( options ) - create a Bootstrap-list with selection
    **********************************************************/
    $.bsSelectList = function( options ){ 
        return $.bsRadioButtonGroup( listOptions( options ) );
    };



	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));