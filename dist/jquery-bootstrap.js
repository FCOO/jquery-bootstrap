/****************************************************************************
	jquery-bootstrap-accordion.js, 

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

TODO:
- More than one card open at the same time (apply to one or all card(s) )

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";
	
    //Add/Remove class "show" to .card
    function card_onShown(){ 
        var $this = $(this);
        if ($this.children('.collapse.show').length)
            $this.addClass('show'); 
    }
    function card_onHidden(){ 
        var $this = $(this);
        if (!$this.children('.collapse.show').length)
            $this.removeClass('show'); 
    }

    /**********************************************************
    accordion_getContentHeight( $container )
    Calculate the max height posible height of the accordion
    **********************************************************/
/*
    function accordion_getContentHeight( $container ){
        var $accordion = $container.find('.accordion').first(),
            $cards     = $accordion.children('.card');
        return getCardsMaxSize( $cards );
    }

    function getCardsMaxSize( $cards ){
        var result = 0,
            cardSizes = [];

        $cards.each( function( index, card ){
            //Get min and max size of eash card and push them to cardSizes
            var $card      = $(card),
                $collapse  = $card.find('.collapse').first(),
                $accordion = $collapse.find('.accordion').first(),
                $cards     = $accordion.children('.card');
            cardSizes.push({
                min: $card.outerHeight() - $collapse.outerHeight(), //Height when closed
                max: $card.outerHeight() - ($accordion.length ? $accordion.outerHeight() : 0) + //Height of own header and padding around children 
                       getCardsMaxSize( $cards ) //+ 
            });
        });

        if (cardSizes.length){
            cardSizes.sort( function( s1, s2) { return s2.max - s1.max; });
            result = cardSizes[0].max;
            for (var i=1; i<cardSizes.length; i++ )
                result += cardSizes[i].min;
        }
        return result;
    }        

    function accordion_postGetContentHeight( $container ){
        //Collaps all cards
        $container.find('.REMOVE_SHOW').removeClass('show REMOVE_SHOW');
    }
*/

    /**********************************************************
    bsAccordion( options ) - create a Bootstrap-accordion

    <div id="accordion" class="accordion accordion-sm" role="tablist" aria-multiselectable="true">
        <div class="card">
            <div class="card-header" role="tab" id="headingOne" data-toggle="collapse" _data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <i class="fa fa-home"></i>&nbsp;<span>Den nye overskrift</span>
            </div>
            <div id="collapseOne" class="collapse _show" role="tabpanel" aria-labelledby="headingOne">
                <div class="card-block">
                    This is the content
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header" role="tab" id="headingTwo" data-toggle="collapse" _data-parent="#accordion" href="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                <i class="fa fa-home"></i>&nbsp;<span>Den nye overskrift</span>
            </div>
        <div id="collapseTwo" class="collapse" role="tabpanel" aria-labelledby="headingTwo">
            <div class="card-block">
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
            </div>
        </div>
    </div>
    **********************************************************/
    var accordionId = 0;

    function bsAccordion_asModal( options ){
        return $.bsModal( $.extend( { 
                              flex                : true,  
                              content             : this,
                              //REMOVED getContentHeight    : accordion_getContentHeight,
                              //REMOVED postGetContentHeight: accordion_postGetContentHeight
                          }, options) 
               );
    }

    $.bsAccordion = function( options ){

        var id = 'bsAccordion'+ accordionId++;

        options = 
            $._bsAdjustOptions( options, {}, {
                baseClass   : 'accordion',
                styleClass  : '',
                class       : '',
                content     : ''
            });


        var $result = $('<div/>')
                        ._bsAddBaseClassAndSize( options )
                        .attr({ 
                            'id'  : id,
                            'tabindex'   : -1, 
                            'role': "tablist",
                            'aria-multiselectable': true
                        });
                            
        //Adding the children {icon, text, content}
        $.each( options.list, function( index, opt ){
            //Create the header
            opt = $._bsAdjustOptions( opt ); 

            var headerId   = id + 'header'+index,
                collapseId = id + 'collapse'+index,
                $card = $('<div/>')
                            .addClass('card')
                            .on( 'shown.bs.collapse',  card_onShown )
                            .on( 'hidden.bs.collapse',  card_onHidden )
                            .appendTo( $result );

            //Add header
            $card.append(
                $('<div/>')
                    .addClass('card-header collapsed')
                    .attr({
                        'id'           : headerId,
                        'role'         : 'tab',
                        'data-toggle'  : "collapse", 
                        'data-parent'  : '#'+id,
                        'href'         : '#'+collapseId,
                        'aria-expanded': true,
                        'aria-controls': collapseId,
                        'aria-target': '#'+collapseId
                    })
                    ._bsAddHtml( opt.header )
                    //Add chevrolet-icon
                    .append( $('<i/>').addClass('fa chevrolet') )
                    
            );

            //Add content-container
            var $outer = 
                $('<div/>')
//                    .addClass('collapse show REMOVE_SHOW')
                    .addClass('collapse')
                    .attr({
                        'id'             : collapseId,
                        'role'           : 'tabpanel',
                        'aria-labelledby': headerId
                    })
                    .appendTo( $card ),
                
                $contentContainer =
                    $('<div/>')
                        .addClass('card-block')
                        .appendTo( $outer );

            //Add footer
            if (opt.footer)
                $('<div/>')
                    .addClass('card-footer')
                    ._bsAddHtml( opt.footer )
                    .appendTo( $outer );
                    
            //Add content: string, element, function or children (=accordion)
            if (opt.content){
                if ($.isFunction( opt.content ))
                    opt.content( $contentContainer );
                else
                    $contentContainer.append( opt.content );                                
            }

            //If opt.list exists => create a accordion inside $contentContainer
            if ($.isArray(opt.list))
                $.bsAccordion( { list: opt.list } )
                    .appendTo( $contentContainer );
        });
        

        $result.collapse(/*options*/);


        $result.asModal = bsAccordion_asModal;


        return $result;
    };


    /**********************************************************
    bsModalAccordion
    Create a modal box with accordion content
    options
        titleIcon
        header
        children

    **********************************************************/
    $.bsModalAccordion = function( options ){
        var $accordion = $.bsAccordion({ children: options.children });
        return $accordion.asModal( options );
    };

	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-button.js, 

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    var bsButtonClass = 'btn-standard';  //MUST correspond with $btn-style-name in src/_variables.scss


    /**********************************************************
    bsButton( options ) - create a Bootstrap-button
    Is also used to create list-items for select-lists
    **********************************************************/
    $.bsButton = function( options ){
        options = options || {};
        options = 
            $._bsAdjustOptions( options, {
                tagName     : 'a', //Using <a> instead of <button> to be able to control font-family
                baseClass   : 'btn',
                styleClass  : bsButtonClass,
                class       : options.primary ? 'primary' : '',
                useTouchSize: true,
                addOnClick  : true
            });


        var result = $('<'+ options.tagName + '/>');

        //Adding href that don't scroll to top to allow anchor to get focus
        if (options.tagName == 'a')
            result.prop('href', 'javascript:undefined');

        result._bsAddBaseClassAndSize( options );

        if (options.id)
            result.attr('id', options.id);

        if (options.selected)  
            result.addClass('active');

        if (options.focus)  
            result.addClass('init_focus');

        if (options.attr)
            result.attr( options.attr );

        if (options.prop)
            result.prop( options.prop );

        result.data('bsButton_options', options );

        if (options.addOnClick && options.onClick)
            result.on('click', $.proxy( result._bsButtonOnClick, result ) );

        result._bsAddHtml( options, true, true );

        return result;
    };

    /**********************************************************
    bsLinkButton( options ) - create a Bootstrap-button as a link
    **********************************************************/
    $.bsLinkButton = function( options ){
        return $.bsButton( $.extend({}, options, { styleClass: 'btn-link'}) );
    };

    /**********************************************************
    bsCheckboxButton( options ) - create a Bootstrap-button as a checkbox
    options:
        icon: string or array[0-1] of string
        text: string or array[0-1] of string
    If icon and/or text is array[0-1] the first value is used when en button is unselected
    and the second when the button is selected.
    E.g. text: ['Unselected', 'Selected']
    **********************************************************/
    $.bsCheckboxButton = function( options ){
        //Clone options to avoid reflux
        options = $.extend({}, options);

        options.class = 'allow-zero-selected';

        //Use modernizr-mode and classes if icon and/or text containe two values
        if ($.isArray(options.icon)){
            options.iconClassName = ['hide-for-active', 'show-for-active'];
            options.modernizr = true;
        }
        if ($.isArray(options.text)){
            options.textClassName = ['hide-for-active', 'show-for-active'];
            options.modernizr = true;
        }
        return $.bsButton( options ).checkbox( $.extend(options, {className: 'active'}) );
    };
    
    /**********************************************************
    bsButtonGroup( options ) - create a Bootstrap-buttonGroup
    **********************************************************/
    $.bsButtonGroup = function( options ){
        options = 
            $._bsAdjustOptions( options, {
                tagName               : 'div',
                baseClass             : 'btn-group',
                leftClass             : 'btn-group-left', //Class for group when content is left-align
                centerClass           : '', //Class for group when content is center-align
                verticalClassPostfix  : '-vertical',
                horizontalClassPostfix: '',
                center                : !options.vertical, //Default: center on horizontal and left on vertical
                useTouchSize          : true,
                attr                  : { role: 'group' },
                buttonOptions         : { onClick: options.onClick }
            });

        options.baseClassPostfix = options.vertical ? options.verticalClassPostfix : options.horizontalClassPostfix;
        var result = $('<'+ options.tagName + '/>')
                        ._bsAddBaseClassAndSize( options );

        if (options.center)
            result.addClass( options.centerClass );
        else
            result.addClass( options.leftClass );

        if (options.verticalClassPostfix && options.vertical)
            result.addClass(options.baseClass + options.verticalClassPostfix );

        if (options.horizontalClassPostfix && !options.vertical)
            result.addClass(options.baseClass + options.horizontalClassPostfix );

        if (options.allowZeroSelected)
            result.addClass( 'allow-zero-selected' );

        if (options.attr)
            result.attr( options.attr );

        $.each( options.list, function(index, buttonOptions ){
            $.bsButton( $.extend({}, options.buttonOptions, buttonOptions ) )
                .appendTo( result );
        });
        return result;
    };

    /**********************************************************
    bsRadioButtonGroup( options ) - create a Bootstrap-buttonGroup
    options:
        id               : id for the group
        onChange         : function(id, selected, $buttonGroup)
	    allowZeroSelected: boolean. If true it is allowed to des-select a selected radio-button.
	                       If allowZeroSelected=true onChange will also be called on the un-selected radio-input
        buttons          : as bsButtonGroup

    **********************************************************/
    $.bsRadioButtonGroup = function( options ){ 
        options = $._bsAdjustOptions( options, {}, { useTouchSize: true, addOnClick: false } );

        var result = $.bsButtonGroup( options );

        //Set options for RadioGroup
        $.each( options.list, function(index, buttonOptions ){
            buttonOptions = $._bsAdjustOptions( buttonOptions );
            if (buttonOptions.id && buttonOptions.selected) {
                options.selectedId = buttonOptions.id;
                return false;
            }
        });
        options.className = 'active';
        var radioGroup = $.radioGroup( options );
        radioGroup.addElement( result.children('[id]'), options );
        result.data('radioGroup', radioGroup );

        return result;
    };


	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));
;
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
            $input = $('<input/>')
                        .prop({
                            type   : 'checkbox',
                            checked: options.selected
                        })
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



	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));


;
/****************************************************************************
	jquery-bootstrap-modal.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($, window, document/*, undefined*/) {
	"use strict";


    /**********************************************************
    bsModal( options ) - create a Bootstrap-modal

    options
        header
        icons: {
            close   : {onClick, attr, className, attr, data }
            extend  : {onClick, attr, className, attr, data }
            diminish: {onClick, attr, className, attr, data }
}
        fixedContent
        flex
        noVerticalPadding
        content
        scroll: boolean | 'vertical' | 'horizontal'
        extended: {
            fixedContent
            flex
            noVerticalPadding
            content
            scroll: boolean | 'vertical' | 'horizontal'
            footer
        }
        isExtended: boolean
        footer
        buttons = [];
        closeText


        REMOVED - getContentHeight: function( $container ) returns the max height of the content
    **********************************************************/
    var modalId = 0,
        modalStackClassName = 'fv-modal-stack'; //class-name for modals when added to the stack


/* REMOVED
    function default_getContentHeight( $container ){
        return 0;
    }
    function default_postGetContentHeight( $container ){
    }
*/

    //Merthods to allow multi modal-windows
    var openModalDataId = 'bs_open_modals';

    function incOpenModals( number ){
        $('body').data(
            openModalDataId,
            ($('body').data( openModalDataId  ) || 0)
                + (number || 0)
        );
        return $('body').data( openModalDataId  );
     }

    //******************************************************
    //show_bs_modal - called when a modal is opening
    function show_bs_modal( /*event*/ ) {

        //Close all popover
        $('.popover.show').popover('hide');

        var $this = $(this);
        // if the z-index of this modal has been set, ignore.
        if ( $this.hasClass( modalStackClassName ) )
            return;

        $this.addClass( modalStackClassName );

        // keep track of the number of open modals
        var modalNumber = incOpenModals( +1 );

        //Move the modal to the front
        $this.css('z-index', 1040 + 10*modalNumber );
    }

    //******************************************************
    //shown_bs_modal - called when a modal is opened
    function shown_bs_modal( /*event*/ ) {
        var $this = $(this);

        //Update other backdrop
        var modalNumber = incOpenModals();
        $( '.modal-backdrop' ).not( '.'+modalStackClassName )
            .css( 'z-index', 1039 + 10*modalNumber );

        //Set current backdrop
        $( '.modal-backdrop' ).not( '.'+modalStackClassName )
            .addClass( modalStackClassName );

        //Focus on focus-element
        var $focusElement = $this.find('.init_focus').last();
        if ($focusElement.length){
            document.activeElement.blur();
            $focusElement.focus();
        }
    }

    //******************************************************
    //hide_bs_modal - called when a modal is closing
    function hide_bs_modal( /*event*/ ) {

    }

    //******************************************************
    //hidden_bs_modal - called when a modal is closed/hidden
    function hidden_bs_modal( /*event*/ ) {
        var $this = $(this);

        $this.removeClass( modalStackClassName );
        var openModals = incOpenModals( -1 );
        if (openModals){
            //Move focus to previous modal on top
            var $modal = $('.modal.show').last(),
                $nextFocus = $modal.find('.init_focus');

            if ($nextFocus.length)
                $nextFocus.focus();
            else
                $modal.focus();

            //Re-add class "modal-open" to body (it is removed by Bootstrap
            $('body').addClass('modal-open');
        }
    }

    /******************************************************
    prototype for bsModal
    ******************************************************/
    var bsModal_prototype = {

        show: function(){
            this.modal('show');
        },

        assignTo: function( $element ){
            $element.attr({
                'data-toggle': 'modal',
                'data-target': '#'+this.attr('id')
            });
        }
    };

    /******************************************************
    _bsModalBodyAndFooter
    Create the body and footer content (exc header and bottoms) 
    of a modal inside this. Created elements are saved in parts
    ******************************************************/
    $.fn._bsModalBodyAndFooter = function(options, parts, className){
        //Set variables used to set scroll-bar (if any)
        var hasScroll       = !!options.scroll,
            scrollDirection = options.scroll === true ? 'vertical' : options.scroll;

        //Append fixed content (if any)
        var $modalFixedContent = parts.$fixedContent =
                $('<div/>')
                    .addClass('modal-body-fixed ' + className + (hasScroll ? ' scrollbar-'+scrollDirection : ''))
                    .appendTo( this );
        if (options.fixedContent){
            if ($.isFunction( options.fixedContent ))
                options.fixedContent( $modalFixedContent );
            else
                $modalFixedContent.append( options.fixedContent );
        }

        //Append body and content
        var $modalBody = parts.$body =
                $('<div/>')
                    .addClass('modal-body ' + className)
                    .appendTo( this ),

            $modalContent = parts.$content =
                hasScroll ?
                    $modalBody.addScrollbar({ direction: scrollDirection }) :
                    $modalBody;

        //Add content
        if ($.isFunction( options.content )){
            var contentFunc = $.proxy( options.content, options.contentContext );

            //Both support functions creating content on container and  functions returning content
//            var content = options.content( $modalContent );
            var content = contentFunc( $modalContent );
            if (content)
                $modalContent.append( content );
        }
        else
            $modalContent.append( options.content );


        //Add footer
        parts.$footer =
                $('<div/>')
                    .addClass('modal-footer-header ' + className)
                    .appendTo( this )
                    ._bsAddHtml( options.footer );
        return this;
    };
    
    /******************************************************
    _bsModalExtend, _bsModalDiminish, _bsModalToggle
    Methods to change extended-mode
    ******************************************************/
    $.fn._bsModalExtend = function( event ){
        if (this.hasClass('no-modal-extended'))
            this._bsModalToggle( event );
    };        
    $.fn._bsModalDiminish = function( event ){
        if (this.hasClass('modal-extended'))
            this._bsModalToggle( event );
    };        

    
    $.fn._bsModalToggle = function( event ){
        var $this = $(this),
            oldHeight = $this.outerHeight(),
            newHeight;
        
        this.modernizrToggle('modal-extended');

        newHeight = $this.outerHeight();
        $this.height( oldHeight); 

        $this.animate({height: newHeight}, 'fast', function() { $this.height('auto'); });

        if (event && event.stopPropagation)
            event.stopPropagation();
        return false;
    };

    /******************************************************
    _bsModalContent
    Create the content of a modal inside this
    Sets object with all parts of the result in this.modalParts
    ******************************************************/
    $.fn._bsModalContent = function( options ){
        options = options || {};

        
        //this.bsModal contains all created elements
        this.bsModal = {};

        var $modalContainer = this.bsModal.$container =
                $('<div/>')
                    .addClass('modal-content') 
                    .modernizrToggle('modal-extended', !!options.isExtended )
                    .appendTo( this );


        var modalExtend   = $.proxy( $modalContainer._bsModalExtend,   $modalContainer ),
            modalDiminish = $.proxy( $modalContainer._bsModalDiminish, $modalContainer ),
            modalToggle   = $.proxy( $modalContainer._bsModalToggle,   $modalContainer );
        
        options = $.extend( true, {
            //Buttons
            buttons    : [],
            closeButton: true,
            closeText  : {da:'Luk', en:'Close'},
            closeIcon  : 'fa-times',

            //Icons
            icons    : {
                extend  : { className: 'hide-for-modal-extended', altEvents:'swipeup',   onClick: options.extended ? modalExtend   : null },
                diminish: { className: 'show-for-modal-extended', altEvents:'swipedown', onClick: options.extended ? modalDiminish : null }
            }
        }, options );

        //Add close-botton. Avoid by setting options.closeButton  = false
        if (options.closeButton)
            options.buttons.push({
                text        : options.closeText,
                icon        : options.closeIcon,

                closeOnClick: true,
                addOnClick  : false
            });

        //If the modal has extended content: Normal and extended content get same scroll-options to have same horizontal padding in normal and extended mode
        if (options.extended){
            options.scroll = options.scroll || options.extended.scroll;            
            options.extended.scroll = options.scroll;            
        }
        
        //Determinate if there are any icons
        var inclIcons = false;
        $.each( options.icons, function( id, iconOptions ){
            inclIcons = inclIcons || (iconOptions !== null);
        });

        //Append header
        if (!options.noHeader &&  (options.header || inclIcons)){
            var $modalHeader = this.bsModal.$header =
                    $('<div/>')
                        .addClass('modal-header')
                        ._bsAddHtml( options.header || $.EMPTY_TEXT )
                        .appendTo( $modalContainer );

            //Add dbl-click on header to change to/from extended
            if (options.extended)
                $modalHeader
                    .addClass('clickable')
                    .on('doubletap', modalToggle );

            if (inclIcons){
                //Container for icons
                var $iconContainer =
                        $('<div/>')
                            ._bsAddBaseClassAndSize( {
                                baseClass   :'modal-header-icon-container',
                                useTouchSize: true
                            })
                            .appendTo( $modalHeader );

                //Add icons
                $.each( ['diminish', 'extend', 'close'], function( index, id ){
                    var iconOptions = options.icons[id];
                    if (iconOptions && iconOptions.onClick){
                        $('<i/>')
                            .addClass('modal-icon modal-icon-' + id )
                            .addClass( iconOptions.className || '')
                            .on('click', iconOptions.onClick)
                            .attr( iconOptions.attr || {})
                            .data( iconOptions.data || {})
                            .appendTo($iconContainer);

                        //Add alternative (swipe) event
                        if (iconOptions.altEvents)
                            $modalHeader.on( iconOptions.altEvents, iconOptions.onClick );
                    }
                });
            }
        }
        
        //Create normal content
        $modalContainer._bsModalBodyAndFooter( options, this.bsModal, 'hide-for-modal-extended' );

        //Create extended content (if any)
        if (options.extended){
            this.bsModal.extended = {};            
            $modalContainer._bsModalBodyAndFooter( options.extended, this.bsModal.extended, 'show-for-modal-extended' );
        }
      
        //Add buttons (if any)
        var $modalButtonContainer = this.bsModal.$buttonContainer =
                $('<div/>')
                    .addClass('modal-footer')
                    .toggleClass('modal-footer-vertical', !!options.verticalButtons)
                    .appendTo( $modalContainer ),
            $modalButtons = this.bsModal.$buttons = [],

            buttons = options.buttons || [],
            defaultButtonClass = options.verticalButtons ? 'btn-block' : '',
            defaultButtonOptions = {
                addOnClick  : true,
                small       : options.smallButtons
            };

        //If no button is given focus by options.focus: true => Last button gets focus
        var focusAdded = false;
        $.each( buttons, function( index, buttonOptions ){

            focusAdded = focusAdded || buttonOptions.focus;
            if (!focusAdded && (index+1 == buttons.length ) )
                buttonOptions.focus = true;

            //Add same onClick as close-icon if closeOnClick: true
            if (buttonOptions.closeOnClick)
                buttonOptions.equalIconId = (buttonOptions.equalIconId || '') + ' close';                    
            
            buttonOptions.class = defaultButtonClass + ' ' + (buttonOptions.className || '');
            
            var $button =
                $.bsButton( $.extend({}, defaultButtonOptions, buttonOptions ) )
                    .appendTo( $modalButtonContainer );
        
            //Add onClick from icons (if any)
            buttonOptions.equalIconId = buttonOptions.equalIconId || '';
            $.each( buttonOptions.equalIconId.split(' '), function( index, iconId ){
                if (iconId && options.icons[iconId] && options.icons[iconId].onClick)
                    $button.on('click', options.icons[iconId].onClick);                    
            });

            $modalButtons.push( $button );
        });


/* REMOVED FOR NOW BUT PERHAPS NEEDED LATER
        //Using timeout to wait for the browser to update DOM and get max height of the content
        var count = 20;
        function testHeight(){
            var height = $modalBodyContent.height();
            if (!height){
                count--;
                if (count){
                    setTimeout( testHeight, 50 );
                    return;
                }
            }

            //Get max height of contents
            var maxContainerHeight = options.getContentHeight( $modalBodyContent ) +
                                     parseInt( $modalBodyContent.css('padding-top') ) +
                                     parseInt( $modalBodyContent.css('padding-bottom') );


            //Call post-function
            options.postGetContentHeight( $modalBodyContent );
        }

        setTimeout( testHeight, 50);
*/
//       options.postGetContentHeight( $modalBodyContent ); //Only when testHeight isn't used





        return this;
    };

    /******************************************************
    bsModal
    ******************************************************/
    $.bsModal = function( options ){
        var $result, $modalDialog,
            id = options.id || '_bsModal'+ modalId++,
            classNames = options.noVerticalPadding ? 'no-vertical-padding' : '',
            //Create a close-function
            closeModalFunction = function(){ $result.modal('hide'); };

        //Adjust options
        options =
            $._bsAdjustOptions( options, {
                baseClass: 'modal',
                class    : classNames,

                //Header
                noHeader : false,

                //Icons
                icons    : {
                    close   : { onClick: closeModalFunction }
                },

                //Content
                scroll     : true,
                content    : '',

                //Modal-options
                show       : true,

                //REMOVED getContentHeight    : default_getContentHeight,
                //REMOVED postGetContentHeight: default_postGetContentHeight

            });


        //Create the modal
        $result =
            $('<div/>')
                ._bsAddBaseClassAndSize( options )
                .attr({
                    'id'         : id,
                    'tabindex'   : -1,
                    'role'       : "dialog",
                    'aria-hidden': true
                });

        $modalDialog =
            $('<div/>')
                .addClass('modal-dialog')
                .addClass(options.flex ? 'modal-flex' : '')
                .attr( 'role', 'document')
                .appendTo( $result );

        //Extend with prototype
        $result.init.prototype.extend( bsModal_prototype );

        //Create modal content
        $modalDialog._bsModalContent( options );

        //Create as modal and adds methods
        $result.modal({
           //Name       Value     Type	                Default Description
           backdrop :   "static", //boolean or 'static' true	Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
           keyboard :   true,     //boolean	            true	Closes the modal when escape key is pressed
           focus	:   true,     //boolean	            true    Puts the focus on the modal when initialized.
           show	    :   false     //boolean	            true	Shows the modal when initialized.
        });

        $result.on({
            'show.bs.modal'  : show_bs_modal,
            'shown.bs.modal' : shown_bs_modal,
            'hide.bs.modal'  : hide_bs_modal,
            'hidden.bs.modal': hidden_bs_modal,
        });


        $result.appendTo( $('body') );

        if (options.show)
            $result.show();

        return $result;
    };


    /**********************************************************


	/******************************************
	Initialize/ready
	*******************************************/
	$(function() {


	});
	//******************************************



}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap-popover.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";

    var Selector = {
        FOOTER: '.popover-footer'
    };

	/***********************************************************
	Extend the $.fn.popover.Constructor.prototype.setContent to
    also construct footer
	***********************************************************/
    $.fn.popover.Constructor.prototype.setContent = function (setContent) {
		return function () {

            //Add footer content
            var $tip = $(this.getTipElement());
            this.setElementContent($tip.find(Selector.FOOTER), this.config.footer);

            //Original function/method
            setContent.apply(this, arguments);
		};
	} ($.fn.popover.Constructor.prototype.setContent);


    /**********************************************************
    bsPopover( options ) - create a Bootstrap-popover
    options
        header      : {icon, text, link, title} or [] of {icon, text, link, title}
        close       : [Boolean] - show close cross in header
        trigger     : [String] 'click'	How popover is triggered - click | hover | focus | manual
        vertical    : [Boolean]
        closeOnClick: [Boolean] false - if true the popover will close when it is clicked
        placement   : [String] "top", "bottom", "left", "right". Default = 'right' for vertical: false and 'top' for vertical:true
        content     : The content (function, DOM-element, jQuery-object)
        footer      : {icon, text, link, title} or [] of {icon, text, link, title}
    **********************************************************/
    $.fn.bsPopover = function( options ){
        options = $._bsAdjustOptions( options );

        var $this = $(this),
            $header;

        //Add header (if any)
        if (options.header){
            $header =
                $('<div/>')
                    .addClass('popover-header-content')
                    ._bsAddHtml( options.header );

            if (options.close)
                $header
                    .append(
                        $('<i class="fa modal-close"/>')
                            .on('click', function(){
                                $this.popover('hide');
                            })
                    );
        }

        var popoverOptions = {
                trigger  :  options.trigger || 'click', //or 'hover' or 'focus' ORIGINAL='click'
                //delay    : { show: 0, hide: 1000 },
                toggle   :  options.toggle || 'popover',
                html     :  true,
                placement:  options.placement || (options.vertical ? 'top' : 'right'),
                template :  '<div class="popover ' + (options.small ? ' popover-sm' : '') + '" role="tooltip">'+
                                '<div class="popover-header"></div>' +
                                '<div class="popover-body"></div>' +
                                '<div class="popover-footer"></div>' +
                                '<div class="arrow"></div>' +
                            '</div>',

                title    : $header,
                content  : options.content,
                footer   : options.footer ? $('<div/>')._bsAddHtml( options.footer ) : ''
            };

        return this.each(function() {
            var $this = $(this);

            if (popoverOptions.trigger == 'click')
                $this.on('blur', popover_onBlur );

            //This event fires immediately when the show instance method is called.
            $this.on('show.bs.popover', popover_onShow );

            //This event is fired when the popover has been made visible to the user (will wait for CSS transitions to complete).
            $this.on('shown.bs.popover', popover_onShown );

            //This event is fired immediately when the hide instance method has been called.
            $this.on('hide.bs.popover', popover_onHide );

            //This event is fired when the popover has finished being hidden from the user (will wait for CSS transitions to complete).
            $this.on('hidden.bs.popover', popover_onHidden );

            $this.data('popover_options', options);
            $this.popover( popoverOptions );

            if (options.postCreate)
              options.postCreate( options.content );

        });
    };

    function popover_onBlur(e){
        //If the focus is shifted to a element inside the popover => shift focus back to the element ELSE hide the popover
        if ( this.skipNextBlur || ( !!this._$popover_element &&
                                    !!e.relatedTarget &&
                                    $.contains( this._$popover_element[0], e.relatedTarget )
                                  )
            )
            this.focus();
        else
            $(this).popover('hide');
        this.skipNextBlur = false;
    }

    function popover_onShow(){
    }

    function popover_onShown(){
        //Find the popover-element. It has id == aria-describedby
        var $this = $(this),
            _this = this,
            popoverId = $this.attr('aria-describedby'),
            options = $this.data('popover_options');

        this._$popover_element = popoverId ? $('#' + popoverId) : null;
        if (this._$popover_element){

            //Translate content
            this._$popover_element.localize();

            //Prevent mousedown on header to close popover
            this._$popover_element.on('mousedown.bs.popover', function(){
                _this.skipNextBlur = true;
            });

            //Close the popup when anything is clicked
            if (options.closeOnClick){
                this._$popover_element.on('click.bs.popover', function(){
                    $this.popover('hide');
                });
            }
        }
    }

    function popover_onHide(){
        if (this._$popover_element)
            this._$popover_element.off('click.bs.popover mousedown.bs.popover');
    }

    function popover_onHidden(){
        //Reset this._$popover_element
        this._$popover_element = null;
    }




    /**********************************************************
    bsButtonGroupPopover( options ) - create a Bootstrap-popover with buttons
    **********************************************************/
    $.fn.bsButtonGroupPopover = function( options, isSelectList ){
        return this.bsPopover(  $.extend( options, {
                        content:  isSelectList ? $.bsSelectList( options ) : $.bsButtonGroup( options )
                    })
        );
    };


    /**********************************************************
    bsRadioButtonPopover( options ) - create a Bootstrap-popover with radio-buttons
    **********************************************************/
    $.fn.bsSelectListPopover = function( options ){
        return this.bsButtonGroupPopover( $.extend({}, options, {
                        postOnChange : $.proxy( selectListPopover_postOnChange, this ),
                        postCreate   : $.proxy( selectListPopover_postCreate, this ),
                    }),
                    true
        );
    };

    function selectListPopover_postCreate( content ){
        //Update this with the selected items html
        $.proxy( selectListPopover_postOnChange, this )( content.children('.active') );
    }

    function selectListPopover_postOnChange( $item ){
        var options = this.data('popover_options');
        if ($item && $item.length && options && options.syncHtml)
            //Update owner html to be equal to $item
            this.html( $item.html() );
    }




	/******************************************
	Initialize/ready
	*******************************************/
	$(function() {


	});
	//******************************************



}(jQuery, this, document));
;
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


    //scrollSelectedItemIntoView
    function scrollSelectedItemIntoView(){
        $(this).find( '.dropdown-item.active' ).first().scrollIntoView();
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
                useTouchSize: true
            });

        var $result = $('<div/>')
                        ._bsAddBaseClassAndSize( options ),
            $dropdown_menu = $('<div/>')
                                .addClass('dropdown-menu')
                                .attr('aria-labelledby', options.id )
                                .appendTo( $result ),
            placeholder = options.placeholder || {da:'Vælg...', en:'Select...'};

        //Create the dropdown-button
        $.bsButton({
                tagName     : 'div', 
                class       : '',
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

        options.postOnChange = postOnChange;

        addSelectItems( $dropdown_menu.addScrollbar() , options, true );


        //Updates dropdownmenu-button with selected contents (if any)
        postOnChange( $dropdown_menu.find( '.dropdown-item.active' ).first() );

        //Scroll selected item into view when opened        
        $result.on('shown.bs.dropdown', scrollSelectedItemIntoView );

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
                useTouchSize: true
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
;
/****************************************************************************
	jquery-bootstrap-table.js, 

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";
	
/******************************************************************
bsTable( options )
options
    columns = [] of {
        id,
        header       : {icon, text, link, textStyle} or [] of {text,...}
        contentType  : '', 'date', 'date-time',...
        contentFormat: '', //Depends on contentType
        align        : 'left','center','right'
        sortable     : [boolean] false
    }
    showHeader: [boolean] true
    verticalBorder [boolean] true
    selectable [boolean] false
    selectedId [string] "" id for selected row
    onChange          [function(id, selected, trElement)] null Called when a row is selected or unselected (if options.allowZeroSelected == true)
	allowZeroSelected [boolean] false. If true it is allowed to un-select a selected row


TODO
Add sort-functions + save col-index for sorted column


*******************************************************************/    
    var defaultOptions = {
            baseClass     : 'table',
            styleClass    : 'fixed',
            showHeader    : true,
            verticalBorder: true
        },

        defaultColunmOptions = {
            contentType: 'default',
            align      : 'left',
            sortable   : false
        },

        dataTableId = 'bsTable_options';

    /**********************************************************
    Prototype for bsTable
    **********************************************************/
    var bsTable_prototype = {
        /**********************************************************
        addRow( rowContent)  - add a new row to the table
        **********************************************************/
        addRow: function( rowContent ){
            var options = this.data(dataTableId),
                $tbody  = this.find('tbody').first(),
                $tr     = $('<tr/>').appendTo( $tbody );

            if (options.selectable)
                $tr.attr('id', rowContent.id || 'rowId_'+rowId++);                

            $.each( options.columns, function( index, column ){
                var content = rowContent[column.id],
                    $td = $('<td/>')
                            ._bsAddStyleClasses( column.textStyle ) 
                            .addClass('align-middle')
                            ._bsAddStyleClasses( column.align )
                            .appendTo($tr);

                //Build the content using _bsAddHtml or jquery-value-format                    
                if (column.vfFormat)
                    $td.vfValueFormat( content, column.vfFormat, column.vfOptions );
                else
                    $td._bsAddHtml( content );
            });

            //Add rows to radioGroup
            if (options.selectable)
                options.radioGroup.addElement( $tr );
        },

        /**********************************************************
        asModal - display the table in a modal-window with fixed header and scrolling content
        **********************************************************/
        asModal: function( modalOptions ){
            var showHeader = this.find('.no-header').length == 0,
                _this      = this,
                $theadClone, 
                $tableWithHeader = null, 
                $result, $thead, count;
                
            if (showHeader){
                //Clone the header and place them in fixed-body of the modal. Hide the original header by padding the table
                $theadClone = this.find('thead').clone( true );
                $tableWithHeader =  
                    $('<table/>')
                        ._bsAddBaseClassAndSize( this.data(dataTableId) )
                        .addClass('table-with-header')
                        .append( $theadClone );
                $thead = this.find('thead');
                count  = 20;
            }


            $result = $.bsModal( 
                            $.extend( modalOptions || {}, {
                                flex             : true,
                                noVerticalPadding: true,
                                content          : this,
                                fixedContent     : $tableWithHeader
                            })
                          );

            if (showHeader){
                //Using timeout to wait for the browser to update DOM and get height of the header
                var setHeaderHeight = function(){ 
                        var height = $tableWithHeader.outerHeight(); 
                        if (height <= 0){
                            count--;
                            if (count){
                                //Using timeout to wait for the browser to update DOM and get height of the header
                                setTimeout( setHeaderHeight, 50 );
                                return;
                            }
                        }
                   
                        _this.css('margin-top', -height+'px');
                        setHeaderWidth();

                        //Only set header-height once
                        $result.off('shown.bs.modal.table', setHeaderHeight );
                    },
                
                    setHeaderWidth = function(){
                        $thead.find('th').each(function( index, th ){
                            $theadClone.find('th:nth-child(' + (index+1) + ')')
                                .width( $(th).width()+'px' );
                        });
                        $tableWithHeader.width( _this.width()+'px' );
                    };

                $result.on('shown.bs.modal.table', setHeaderHeight );
                $thead.resize( setHeaderWidth );
            }
            
            return $result;
        }

    }; //end of bsTable_prototype = {

    //**********************************************************
    function table_th_onClick( event ){
        var $th = $( event.currentTarget ),
            sortable = $th.hasClass('sortable'),
            newClass = $th.hasClass('desc') ? 'asc' : 'desc'; //desc = default

        if (sortable){
            //Remove .asc and .desc from all th
            $th.parent().find('th').removeClass('asc desc');
            $th.addClass(newClass);
        }
    }
    
    /**********************************************************
    bsTable( options ) - create a Bootstrap-table
    **********************************************************/
    var tableId  = 0,
        rowId    = 0;

    $.bsTable = function( options ){
        options = $._bsAdjustOptions( options, defaultOptions ); 
        options.class = 
            (options.small ? 'table-sm ' : '' ) + 
            (options.verticalBorder ? 'table-bordered ' : '' ) + 
            (options.selectable ? 'table-selectable ' : '' ) + 
            (options.allowZeroSelected ? 'allow-zero-selected ' : '' ),

        //Adjust text-style for each column
        $.each( options.columns, function( index, column ){
            column = $.extend( true, {}, defaultColunmOptions, column ); 

            column.index = index;

            options.columns[index] = column;
        });

        var id = 'bsTable'+ tableId++,
            $table = $('<table/>')
                        ._bsAddBaseClassAndSize( options )
                        .attr({ 
                            'id': id
                        }),
            $thead = $('<thead/>')
                        .toggleClass('no-header', !options.showHeader )
                        .appendTo( $table ),
            $tr = $('<tr/>')
                    .appendTo( $thead );

        //Extend with prototype
        $table.init.prototype.extend( bsTable_prototype );

        //Create headers
        if (options.showHeader)
            $.each( options.columns, function( index, column ){
                var $th = $('<th/>')
                            ._bsAddStyleClasses( column.textStyle ) 
                            .addClass('align-middle')
                            .toggleClass('sortable', !!column.sortable )
                            .on('click', table_th_onClick )
                            .appendTo( $tr );

                //Adding sort-direction icons
                if (column.sortable)
                    $th.addClass('sortable');

                $th
                    ._bsAddStyleClasses( column.align )
                    ._bsAddHtml( column.header );
            });
      
        if (options.selectable){
            var radioGroupOptions = $.extend( true, options );
            radioGroupOptions.className = 'active';
            options.radioGroup = $.radioGroup( radioGroupOptions );            
        }

        $table.data(dataTableId, options);
        

        //Create tbody and all rows
        $table.append( $('<tbody/>') );

        $.each( options.content, function( index, rowContent ){
            $table.addRow( rowContent );
        });
        

        return $table; 
    };



	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));
;
/****************************************************************************
	jquery-bootstrap.js, 

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /*
    
    Almost all elements comes in two sizes: normal and small set by options.small: false/true

    In jquery-bootstrap.scss sizing class-postfix -xs is added (from Bootstrap 3)

    Elements to click or touch has a special implementation:
    For device with 'touch' the Bootstrap size 'normal' and 'small' are used
    For desktop (only mouse) we using smaller version (large = Bootstrap normal, normal = Bootstrap small, small = Bootstrap x-small)

    The variable window.bsIsTouch must be overwriten with the correct value in the application

    */

    //Create namespace
	var ns = window; 

    ns.bsIsTouch =  true;

    $.EMPTY_TEXT = '___***EMPTY***___';

    //$._bsAdjustOptions: Adjust options to allow text/name/title/header etc.
    $._bsAdjustOptions = function( options, defaultOptions, forceOptions ){
        //*********************************************************************
        //adjustContentOptions: Adjust options for the content of elements
        function adjustContentAndContextOptions( options, context ){
            options.icon     = options.icon || options.headerIcon || options.titleIcon;
            options.text     = options.text || options.header || options.title || options.name;

            options.iconClass = options.iconClass       || options.iconClassName       || 
                                options.headerIconClass || options.headerIconClassName ||
                                options.titleIconClass  || options.titleIconClassName;

            options.textClass = options.textClass   || options.textClassName   || 
                                options.headerClass || options.headerClassName || 
                                options.titleClass  || options.titleClassName;

            //If context is given => convert all function to proxy
            if (context)
                $.each( options, function( id, value ){
                    if ($.isFunction( value ))
                        options[id] = $.proxy( value, context );
                });
            
            return options;
        }
        //*********************************************************************
        
        options = $.extend( true, defaultOptions || {}, options, forceOptions || {} );

        options.selected = options.selected || options.checked || options.active;
        options.list     = options.list     || options.buttons || options.items || options.children;

        options = adjustContentAndContextOptions( options, options.context );

        //Adjust options.content
        if (options.content){
            if ($.isArray( options.content ) )
                //Adjust each record in options.content
                for (var i=0; i<options.content.length; i++ )
                    options.content[i] = adjustContentAndContextOptions( options.content[i], options.context );
            else
                if ($.type( options.content ) == "object")
                    options.content = adjustContentAndContextOptions( options.content, options.context );
        }

        //Sert context = null to avoid "double" proxy
        options.context = null;
        
        return options;
    };

    $.fn.extend({
        /****************************************************************************************
        _bsAddBaseClassAndSize

        Add classes

        options:
            baseClass           [string]
            baseClassPostfix    [string]
            styleClass          [string]
            class               [string]
            textStyle           [string] or [object]. see _bsAddStyleClasses


        baseClass: "BASE" useTouchSize: false
            small: false => sizeClass = ''
            small: true  => sizeClass = "BASE-sm"

        baseClass: "BASE" useTouchSize: true
            small: false => sizeClass = 'BASE-sm'
            small: true  => sizeClass = "BASE-xs"
        
        
        ****************************************************************************************/
        _bsAddBaseClassAndSize: function( options ){
            var classNames = options.baseClass ? [options.baseClass + (options.baseClassPostfix || '')] : [],
                sizeClassPostfix = '';

            if (options.useTouchSize){
                if (ns.bsIsTouch)
                    sizeClassPostfix = options.small ? 'sm' : '';
                else
                    sizeClassPostfix = options.small ? 'xs' : 'sm';
            }
            else
                sizeClassPostfix = options.small ? 'sm' : '';


            if (sizeClassPostfix && options.baseClass)
              classNames.push( options.baseClass + '-' + sizeClassPostfix );                
            
            if (options.styleClass)
                classNames.push( options.styleClass ); 

            if (options.class)
                classNames.push( options.class ); 

            this.addClass( classNames.join(' ') );

            this._bsAddStyleClasses( options.textStyle );    

            return this;
        },

        /****************************************************************************************
        _bsAddStyleClasses
        Add classes for text-styel

        options [string] or [object]    
            Style for the contents. String or object with part of the following
            "left right center lowercase uppercase capitalize normal bold italic" or 
            {left: true, right: true, center: true, lowercase: true, uppercase: true, capitalize: true, normal: true, bold: true, italic: true}
        ****************************************************************************************/
        _bsAddStyleClasses: function( options ){
            options = options || {};

            var _this = this,

                bsStyleClass = {
                    //Text color
                    "primary"     : "text-primary",
                    "secondary"   : "text-secondary",
                    "success"     : "text-success",
                    "danger"      : "text-danger",
                    "warning"     : "text-warning",
                    "info"        : "text-info",
                    "light"       : "text-light",
                    "dark"        : "text-dark",

                    //Align
                    "left"        : "text-left",
                    "right"       : "text-right",
                    "center"      : "text-center",

                    //Case
                    "lowercase"   : "text-lowercase",
                    "uppercase"   : "text-uppercase",
                    "capitalize"  : "text-capitalize",

                    //Weight
                    "normal"      : "font-weight-normal",
                    "bold"        : "font-weight-bold",
                    "italic"      : "font-italic"
                };

            $.each( bsStyleClass, function( style, className ){
                if (  
                      ( (typeof options == 'string') && (options.indexOf(style) > -1 )  ) ||
                      ( (typeof options == 'object') && (options[style]) ) 
                    )
                    _this.addClass( className );                    
            });
            return this;
        },

        /****************************************************************************************
        _bsAddHtml
        Internal methods to add innerHTML to button or other element
        options: array of textOptions or textOptions
        textOptions: {
            icon     : String or array of String
            text     : String or array of String
            vfFormat : String or array of String
            vfValue  : any type or array of any-type
            vfOptions: JSON-object or array of JSON-object
            textStyle: String or array of String
            link     : String or array of String
            title    : String or array of String
            iconClass: string or array of String
            textClass: string or array of String
        }
        checkForContent: [Boolean] If true AND options.content exists => use options.content instead
        ****************************************************************************************/

        _bsAddHtml:  function( options, checkForContent, ignoreLink ){
            //**************************************************
            function create$element( tagName, link, title, textStyle, className ){
                var $text;
                if (link){
                    $text = $('<a/>');
                    if ($.isFunction( link ))
                        $text
                            .prop('href', 'javascript:undefined')
                            .on('click', link );
                    else 
                        $text
                            .i18n(link, 'href')
                            .prop('target', '_blank');
                }
                else
                    $text = $('<'+tagName+'/>');

                if (title)
                    $text.i18n(title, 'title');

                $text._bsAddStyleClasses( textStyle || '' );

                if (className)
                    $text.addClass( className );

                return $text;
            }
            //**************************************************
            function getArray( input ){ 
                return input ? $.isArray( input ) ? input : [input] : []; 
            }
            //**************************************************


            if (checkForContent && (options.content != null))
                return this._bsAddHtml( options.content );     

            options = options || '';

            var _this = this;

            //options = array => add each with space between            
            if ($.isArray( options )){
                $.each( options, function( index, textOptions ){
                    if (index)
                        _this.append('&nbsp;');                      
                    _this._bsAddHtml( textOptions );
                });        
                return this;    
            }

            //Simple version: options == string
            if ($.type( options ) != "object")
                return this._bsAddHtml( {text: options} );              
            
           
            //options = simple textOptions
            var iconArray       = getArray( options.icon ),
                textArray       = getArray( options.text ),
                vfFormatArray   = getArray( options.vfFormat ),
                vfValueArray    = getArray( options.vfValue ),
                vfOptionsArray  = getArray( options.vfOptions ),
                textStyleArray  = getArray( options.textStyle ),
                linkArray       = getArray( ignoreLink ? [] : options.link || options.onClick ),
                titleArray      = getArray( options.title ),
                iconClassArray  = getArray( options.iconClass ),
                textClassArray  = getArray( options.textClass );

            //Add icons (optional)
            $.each( iconArray, function( index, icon ){
                var $icon = $('<i/>').addClass('fa '+icon);
                if (index < iconClassArray.length)
                    $icon.addClass( iconClassArray[index] );
                //$icon.appendTo( _this );                

                create$element( 'i', null, titleArray[ index ], null, 'fa '+icon + ' ' + (iconClassArray[index] || '') )
                    .appendTo( _this );
            });
                
            //Add color (optional)
            if (options.color)
                _this.addClass('text-'+ options.color);

            if (options.icon && options.text)
                _this.append('&nbsp;');

            //Add text
            $.each( textArray, function( index, text ){
                var $text = create$element( 'span', linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index] );
               
                if ($.isFunction( text ))
                    text( $text );
                else
                    if (text == $.EMPTY_TEXT)
                        $text.html( '&nbsp;');
                    else
                        $text.i18n( text );

                if (index < textClassArray.length)
                    $text.addClass( textClassArray[index] );
                $text.appendTo( _this );                
            });
            
            //Add value-format content
            $.each( vfValueArray, function( index, vfValue ){
                create$element( 'span', linkArray[ index ], titleArray[ index ], textStyleArray[ index ], textClassArray[index] )
                    .vfValueFormat( vfValue || '', vfFormatArray[index], vfOptionsArray[index] )
                    .appendTo( _this );                
            });
            
            return this;
        },

        //_bsButtonOnClick
        _bsButtonOnClick: function(){
            var options = this.data('bsButton_options');
            $.proxy( options.onClick, options.context )( options.id, null, this );
            return false;
        }


    }); //$.fn.extend



	/******************************************
	Initialize/ready 
	*******************************************/
	$(function() { 

	
	}); 
	//******************************************



}(jQuery, this, document));