/****************************************************************************
	jquery-bootstrap-select.js, 

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

TODO:
- Open up
- Use scrollbar on list


****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /**********************************************************
    bsSelectbox( options ) - create a Bootstrap-selectbox
    **********************************************************/
    var selectboxId = 0;

    function getSelectId(){
        return '_bsSelectbox'+ selectboxId++;
    }

    //Function called when a new item is selected: Update the dropdownmenu-button with the content from the selected item
    function postOnChange( $selectedItem ){
        if ($selectedItem.length == 0)
            return;
        //Clone the new content from the selected element and replace the original content with the new
        var newContent = $selectedItem.find('._content').clone(true).addClass('selected-content');
        
        //Old content
        $selectedItem.closest( '.selectbox').find('.selected-content')
            .after( newContent ) //Insert new content after
            .remove();           //Remove old content
    }


    //addSelectItems( $container, items,  ) - Create radioGroup and adds items
    function addSelectItems( $container, options, inSpan ){
        var radioGroup = $.radioGroup( 
                            $.extend({}, options, {
                                radioGroupId     : options.id, 
                                className        : 'active', 
                                allowZeroSelected: false
                            })
                         ); 

        $.each( options.list, function( index, itemOptions ){
            var isItem = (itemOptions.id != undefined ),
                $item = $('<div/>')
                            .addClass( isItem ? 'dropdown-item' : 'dropdown-header' )
                            .addClass( options.center ? 'text-center' : '')
                            .appendTo( $container );

                if (inSpan)
                    //Create contents inside a span-element to allow easy duplication
                    $item
                        .append(
                            $('<span/>')
                                .addClass('_content')
                                ._bsAddHtml( itemOptions, true )
                        );
                else
                    $item._bsAddHtml( itemOptions, true );

                if (isItem)
                    radioGroup.addElement( $item, itemOptions );
        });

        return $container;
    }

    
    
    $.bsSelectbox = function( options ){
        options = 
            $._bsAdjustOptions( options, {
                id          : getSelectId(),
                baseClass   : 'selectbox',
                class       : 'dropdown',
                addSizeClass: true, //false if only ONE size 
            });


        var $result = $('<div/>')
                        ._bsAddBaseClassAndSize( options );

        //Create the dropdown-button
        var placeholder = options.placeholder || {da:'Vælg...', en:'Select...'};
        $.bsButton({
                tagName     : 'div', //'button',
                class       : '',
                addSizeClass: false,
                addOnClick  : false
            })
            .attr({ 
                'id'           : options.id,
                'role'         : 'botton',
                'tabindex'     : 0,
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
                                .attr('aria-labelledby', options.id )
                                .appendTo( $result );

        options.postOnChange = postOnChange;

        addSelectItems( $dropdown_menu.addScrollbar(), options, true );


        //Updates dropdownmenu-button with selected contents (if any)
        postOnChange( /*$dropdown_menu_content*/$dropdown_menu.find( '.dropdown-item.active' ).first() );


/* REMOVED        
        //Setting the width of the dropdown-button equal the width of the item-box. Need timeout to allow DOM in some browser to finish adding elements
        setTimeout(function(){
            var bodyFontSize = parseFloat( $('body').css('font-size') ),
                dropDownMenuWidth = $dropdown_menu.outerWidth()/bodyFontSize + 'rem';
                $result.width( dropDownMenuWidth );
        }, 100);
*/

        return $result;
    };


    /**********************************************************
    bsSelectList( options ) - create a Bootstrap-list with selection
    **********************************************************/
    $.bsSelectList = function( options ){ 
        options = 
            $._bsAdjustOptions( options, {
                id          : getSelectId(),
                baseClass   : 'selectList',
                class       : '',
                addSizeClass: true, 
            });


        var $result = $('<div tabindex="0"/>')
                        ._bsAddBaseClassAndSize( options );

        addSelectItems( $result, options );

        return $result;
    };



	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));