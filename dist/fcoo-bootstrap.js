/****************************************************************************
	jquery-bootstrap-accordion.js, 

	(c) 2017, FCOO

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

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
    bsAccordion( options ) - create a Bootstrap-modal

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
                ///*REMOVED - Only ONE size addSizeClass: true,
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
                    ._bsAddHtml( opt )
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

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /*
    The buttons in Bootstrap can be styled in different ways (btn-primary, btn-outline-primary etc)
    The variable window.bsButtonClass contain the selected class-name  
    */

    //Create namespace
	var ns = window; 

    ns.bsButtonClass        = 'btn-secondary'; 
    ns.bsPrimaryButtonClass = 'btn-outline-primary';


    /**********************************************************
    bsButton( options ) - create a Bootstrap-button
    Is also used to create list-items for select-lists
    **********************************************************/
    $.bsButton = function( options ){
        options = 
            $._bsAdjustOptions( options, {
//                tagName     : 'button',
                tagName     : 'a',//Using <a> instead of <button> to be able to control font-family
                baseClass   : 'btn',
                styleClass  : ns.bsButtonClass,
                class       : '',
                addSizeClass: true,
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

        result._bsAddHtml( options );

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
                addSizeClass          : true,
                attr                  : { role: 'group' },
                buttonOptions         : {
                    addSizeClass: false,
                    onClick     : options.onClick                    
                }
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

        if (options.attr)
            result.attr( options.attr );
        $.each( options.list, function(index, buttonOptions ){
            $.bsButton( $.extend({}, options.buttonOptions, buttonOptions ) ).appendTo( result );
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
        options = 
            $._bsAdjustOptions( options, 
                {},
                {
                    addOnClick: false
                }
            );
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
        radioGroup.addElement( result.children(), options );
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

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /**********************************************************
    bsCheckbox( options ) - create a Bootstrap checkbox
    **********************************************************/
    $.bsCheckbox = function( options ){ 
        options = 
            $._bsAdjustOptions( options, {
                ///*REMOVED - Only ONE size addSizeClass: true,
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

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

****************************************************************************/

(function ($, window, document/*, undefined*/) {
	"use strict";
	
    /**********************************************************
    bsModal( options ) - create a Bootstrap-modal

    options
        fixedContent
        content
        flex
        noVerticalPadding

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
        // if the z-index of this modal has been set, ignore.
        if ( $(this).hasClass( modalStackClassName ) )
            return;

        $(this).addClass( modalStackClassName );

        // keep track of the number of open modals
        var modalNumber = incOpenModals( +1 ); 

        //Move the modal to the front
        $(this).css('z-index', 1040 + 10*modalNumber );
    }

    //******************************************************
    //shown_bs_modal - called when a modal is opened
    function shown_bs_modal( /*event*/ ) {
        //Update other backdrop
        var modalNumber = incOpenModals(); 
        $( '.modal-backdrop' ).not( '.'+modalStackClassName )
            .css( 'z-index', 1039 + 10*modalNumber );

        //Set current backdrop
        $( '.modal-backdrop' ).not( '.'+modalStackClassName )
            .addClass( modalStackClassName );


        //Focus on focus-element
        var $focusElement = $(this).find('.init_focus').last();
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
        $(this).removeClass( modalStackClassName );
        var openModals = incOpenModals( -1 );
        if (openModals)
            //Re-add class "modal-open" to body (it is removed by Bootstrap
            $('body').addClass('modal-open');
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
    bsModal
    ******************************************************/
    $.bsModal = function( options ){

        var id = options.id || '_bsModal'+ modalId++,
            classNames = 'fade '+
                         (options.noVerticalPadding ? 'no-vertical-padding ' : '');

        options = 
            $._bsAdjustOptions( options, {
                baseClass       : 'modal',
                class           : classNames,
                //REMOVED - Only ONE size addSizeClass    : true,
                content         : '',
                show            : true,
                //REMOVED getContentHeight    : default_getContentHeight,
                //REMOVED postGetContentHeight: default_postGetContentHeight
                                    
            });

        var $result = $('<div/>')
                        ._bsAddBaseClassAndSize( options )
                        .attr({ 
                            'id'         : id,
                            'tabindex'   : -1, 
                            'role'       : "dialog",
                            'aria-hidden': true
                        }),
            $modalDialog = $('<div/>')
                                .addClass('modal-dialog')
                                .addClass(options.flex ? 'modal-flex' : '')
                                .attr( 'role', 'document')
                                .appendTo( $result ),
            $modalContent = $('<div/>')
                                .addClass('modal-content')
                                .appendTo( $modalDialog );

        //Extend with prototype
        $result.init.prototype.extend( bsModal_prototype );


        
        //Append header
        $modalContent.append(
            $('<div/>')
                .addClass('modal-header right-side-icon-parent')
                ._bsAddHtml( options )
                .append( $('<i class="fa modal-close" data-dismiss="modal" aria-label="Close"/>') )
        );
        
        //Append fixed-content (if any)                    
        var $modalBodyFixed = $('<div/>')
                                .addClass('modal-body-fixed')
                                .appendTo( $modalContent ),

        //Append body                    
            $modalBody = $('<div/>')
                             .addClass('modal-body')
                             .appendTo( $modalContent ),

            $modalBodyContent = $modalBody.addScrollbar();

        //Add fixed content (if any)
        if (options.fixedContent){
            if ($.isFunction( options.fixedContent ))
                options.fixedContent( $modalBodyFixed );
            else
                $modalBodyFixed.append( options.fixedContent );
        }

        //Add content        
        if ($.isFunction( options.content ))
            options.content( $modalBodyContent );
        else
            $modalBodyContent.append( options.content );
        

        //Append footer with bottons
        var buttonOptions = {
            class       : '',
            addSizeClass: false,
            closeOnClick: true,
            addOnClick  : true
        },
        buttons = options.buttons || [];

        //Add close-botton. Avoid by setting options.closeText == ""
        if (options.closeText != '')
            buttons.push({   
                text        : options.closeText || {da:'Luk', en:'Close'}, 
                icon        : options.closeIcon || 'fa-times', 
                closeOnClick: true,
focus: true, //TODO: Skal checke om der er andre knapper, der skal have focus - feks. 'Save' eller 'Ok'
                addOnClick  : false
            });

/*
        buttons.push({
            text: options.okText || {da:'Ok', en:'Ok'}, 
            icon: options.okIcon || 'fa-check',
            styleClass: window.bsPrimaryButtonClass,
            closeOnClick: true, 
focus: true,
            onClick: function(){ alert(''); },
        });
*/

        if (buttons.length){
            var $modalFooter = $('<div/>')
                                   .addClass('modal-footer')
                                   .appendTo( $modalContent );
        
            for (var i=0; i<buttons.length; i++ ){
                if (buttons[i].closeOnClick){
                    buttons[i].attr = buttons[i].attr || {};                  
                    buttons[i].attr['data-dismiss'] = "modal";
                }
                $.bsButton( $.extend({}, buttonOptions, buttons[i] ) )
                    .appendTo( $modalFooter );
            }
        }
    
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



        
        //Create as modal and adds methods
        $result.modal({
            //Name      Value     Type	                Default Description
            backdrop:   "static", //boolean or 'static' true	Includes a modal-backdrop element. Alternatively, specify static for a backdrop which doesn't close the modal on click.
            keyboard:   true,     //boolean	            true	Closes the modal when escape key is pressed
            focus	:   true,     //boolean	            true    Puts the focus on the modal when initialized.
            show	:   false     //boolean	            true	Shows the modal when initialized.
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

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

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

        footer: {icon, text, link, title} or [] of {icon, text, link, title}
    **********************************************************/
    $.fn.bsPopover = function( options ){
        options = $._bsAdjustOptions( options );
        
        var title = options.text,
            $this = $(this);

        //If title is a function => use it, else add a <span> with the i18n-text or object
        if (options.text || options.icon){
            title = 
                $('<div/>')
                    .addClass('popover-title-content')
                    ._bsAddHtml( options );

                if (options.close)
                    title
                        .addClass('popover-close')
                        .append( 
                            $('<i class="fa modal-close"/>') 
                                .on('click', function(){ 
                                    $this.popover('hide');
                                } )
                        );
        }


        if (options.footer){
            //Create function to create the footer
            var footer = options.footer;
            options.footer = function(){ 
                if (footer){
                    $(this)._bsAddHtml( footer ); 
                    footer = null;                  
                }
            };
        }
        var popoverOptions = {
                trigger  :  options.trigger || 'click', //or 'hover' or 'focus' ORIGINAL='click'
                //delay    : { show: 0, hide: 1000 },
                toggle   :  options.toggle || 'popover', 
                html     :  true,
                placement:  options.placement || (options.vertical ? 'top' : 'right'),
                template :  '<div class="popover ' + $._bsGetSizeClass({baseClass:'popover', size: options.size }) + '" role="tooltip">'+
                                '<div class="popover-title"></div>' + 
                                '<div class="popover-content' + (options.defaultPadding ? ' default-padding' : '') + '"></div>' + 
                                '<div class="popover-footer"></div>' + 
                                '<div class="popover-arrow"></div>' + 
                            '</div>',

                title    : title,
                content  : options.content,
                footer   : options.footer
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
;
/****************************************************************************
	jquery-bootstrap-table.js, 

	(c) 2017, FCOO

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

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
            addSizeClass  : true,

            showHeader    : true,
            verticalBorder: true
        },

        defaultColunmOptions = {
            contentType: 'default',
            align      : 'left',
            sortable   : false
        };


    /**********************************************************
    Prototype for bsTable
    **********************************************************/
    var bsTable_prototype = {
        /**********************************************************
        addRow( rowContent)  - add a new row to the table
        **********************************************************/
        addRow: function( /*rowContent*/ ){

    
        },

        /**********************************************************
        asModal - display the table in a modal-window with fixed header and scrolling content
        **********************************************************/
        asModal: function( modalOptions ){
            //Clone the header and place them in fixed-body of the modal. Hide the original header by padding the table
            var $theadClone = this.find('thead').clone( true ),
                $tableWithHeader =  
                    $('<table/>')
                        ._bsAddBaseClassAndSize( this.data('bsTable_options') )
                        .addClass('table-with-header')
                        .append( $theadClone ),

                $result = $.bsModal( 
                            $.extend( modalOptions || {}, {
                                flex             : true,
                                noVerticalPadding: true,
                                content          : this,
                                fixedContent     : $tableWithHeader
                            })
                          ),

            //Using timeout to wait for the browser to update DOM and get height of the header
                _this = this,
                $thead = this.find('thead'),
                count = 20,

                setHeaderHeight = function(){
                    var height = $tableWithHeader.height(); 
                    if (height <= 0){
                        count--;
                        if (count){
                            setTimeout( setHeaderHeight, 50 );
                            return;
                        }
                    }
                    
                    _this.parent().css('padding-bottom', height+'px');     
                    _this.css('margin-top', -height+'px');

                    setHeaderWidth();
                },
                
                setHeaderWidth = function(){
                    $thead.find('th').each(function( index, th ){
                        $theadClone.find('th:nth-child(' + (index+1) + ')')
                            .width( $(th).width()+'px' );
                    });
                    $tableWithHeader.width( _this.width()+'px' );
                };

            //Using timeout to wait for the browser to update DOM and get height of the header
            //setHeaderHeight();
            setTimeout( setHeaderHeight, 50 );

            $thead.resize( setHeaderWidth );

            return $result;
        }

    }; //end of bsTable_prototype = {

    //**********************************************************
    function table_th_onClick( event ){
        var $th = $( event.currentTarget ),
            newClass = $th.hasClass('desc') ? 'asc' : 'desc'; //desc = default

        //Remove .asc and .desc from all th
        $th.parent().find('th').removeClass('asc desc');
        $th.addClass(newClass);
    }
    
    /**********************************************************
    bsTable( options ) - create a Bootstrap-table
    **********************************************************/
    var tableId  = 0,
        columnId = 0,
        rowId    = 0;

    $.bsTable = function( options ){
        options = $._bsAdjustOptions( options, defaultOptions );
        options.class = 
            (options.verticalBorder ? 'table-bordered ' : '' ) + 
            (options.selectable ? 'table-selectable ' : '' ) + 
            (options.allowZeroSelected ? 'allow-zero-selected ' : '' ),

        //Adjust text-style for each column
        $.each( options.columns, function( index, column ){
            column = $.extend( true, {}, defaultColunmOptions, column ); 

            column.id = column.id || 'bsColumn'+ columnId++;
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

        //Create headers
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
            var radioGroup = $.radioGroup( radioGroupOptions );            
        }
        
        //Create tbody and all rows
        var $tbody = $('<tbody/>').appendTo( $table );
        $.each( options.data, function( index, rowData ){
            $tr = $('<tr/>').appendTo( $tbody );

            if (options.selectable)
                $tr.attr('id', rowData.id || 'rowId_'+rowId++);                

            $.each( options.columns, function( index, column ){
                var content = rowData[column.id],
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
        });
        
        //Add rows to radioGroup
        if (options.selectable)
            radioGroup.addElement( $tbody.children('tr'), radioGroupOptions );

        $table.data('bsTable_options', options);

        //Extend with prototype
        $table.init.prototype.extend( bsTable_prototype );

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

	https://github.com/FCOO/jquery-bootstrap
	https://github.com/FCOO

****************************************************************************/

(function (/*$, window/*, document, undefined*/) {
	"use strict";
	
    /*
    

    Many of the elements comes in tree different sizes: large, normal, small set by the options.size

    In jquery-bootstrap.scss sizing class-postfix -xs is added (from Bootstrap 3)

    Since some of the 'large' Bootstrap elements are a bit to larges it is possible to use 
    'normal' as large, 'small' as normal and 'extra-small' as 'small on desktop and still use original size on touch devices
    The variable window.bsIsTouch must be overwriten with the correct value in the application

    */

    //Create namespace
	var ns = window; 

    ns.bsIsTouch     =  true; //false;        

    $._bsGetSizeClass = function( options ){
        var size = '';
        switch (options.size || 'normal'){
            case 'small': size = ns.bsIsTouch ? 'sm' : 'xs'; break;
            case 'large': size = ns.bsIsTouch ? 'lg' :   ''; break;
            default     : size = ns.bsIsTouch ?   '' : 'sm'; 
        }
        return size ? options.baseClass+'-'+size : '';
    };

    ns._bsGetSmallerSize = function( size ){
        return (size || 'normal') == 'large' ? 'normal' : 'small';
    };



    //$._bsAdjustOptions( options [, defaultOptions ): Adjust options to allow text/name/title/header etc.
    $._bsAdjustOptions = function( options, defaultOptions, forceOptions ){
        
        options = $.extend( true, defaultOptions || {}, options, forceOptions || {} );

        options.icon     = options.icon || options.headerIcon || options.titleIcon;
        options.text     = options.text || options.header || options.title || options.name;

        options.iconClass = options.iconClass       || options.iconClassName       || 
                            options.headerIconClass || options.headerIconClassName ||
                            options.titleIconClass  || options.titleIconClassName;

        options.textClassName = options.textClass   || options.textClassName   || 
                                options.headerClass || options.headerClassName || 
                                options.titleClass  || options.titleClassName;
        
        options.selected = options.selected || options.checked || options.active;

        options.list = options.list || options.buttons || options.items || options.children;

        
        return options;
    };

    $.fn.extend({
        /****************************************************************************************
        _bsAddBaseClassAndSize

        Add classes

        options:
            baseClass           [string]
            baseClassPostfix    [string]
            addSizeClass        [boolean]
            styleClass          [string]
            class               [string]
            textStyle           [string] or [object]. see _bsAddStyleClasses
        ****************************************************************************************/
        _bsAddBaseClassAndSize: function( options ){
            var classNames = options.baseClass ? [options.baseClass + (options.baseClassPostfix || '')] : [],
                sizeClass = '';
            if (options.addSizeClass && options.baseClass){
                sizeClass = $._bsGetSizeClass( options );
                if (sizeClass)
                  classNames.push( sizeClass );
            }

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
            var styles = "left right center lowercase uppercase capitalize normal bold italic".split(' '),
                classes = "text-left text-right text-center text-lowercase text-uppercase text-capitalize font-weight-normal font-weight-bold font-italic".split(' ');
                
            for (var i=0; i<styles.length; i++ ){
                var nextStyle = styles[i]; 
                if (  
                      ( (typeof options == 'string') && (options.indexOf(nextStyle) > -1 )  ) ||
                      ( (typeof options == 'object') && (options[nextStyle]) ) 
                    )
                    this.addClass( classes[i] );                    
            }
            return this;
        },

        /****************************************************************************************
        _bsAddHtml
        Internal methods to add innerHTML to button or other element
        options: array of textOptions or textOptions
        textOptions: {
            icon     : String or array of String
            text     : String or array of String
            textStyle: String or array of String
            link     : String or array of String
            title    : String or array of String
            iconClass: string or array of String
            textClass: string or array of String
    }
        ****************************************************************************************/

        _bsAddHtml:  function( options ){
            options = options || '';
            function getArray( input ){ return input ? $.isArray( input ) ? input : [input] : []; }
            var _this = this;
    
            //Simple version: options == string
            if ($.type( options ) !== "object")
                return this._bsAddHtml( {text: options} );              
            
            //options = array => add each with space between            
            if ($.isArray( options )){
                $.each( options, function( index, textOptions ){
                    if (index)
                        _this.append('&nbsp;');                      
                    _this._bsAddHtml( textOptions );
                });        
                return this;    
            }
           
            //options = simple textOptions
            var iconArray      = getArray( options.icon ),
                textArray      = getArray( options.text ),
                textStyleArray = getArray( options.textStyle ),
                linkArray      = getArray( options.link ),
                titleArray     = getArray( options.title ),
                iconClassArray = getArray( options.iconClass ),
                textClassArray = getArray( options.textClass );

            //Add icons (optional)
            $.each( iconArray, function( index, icon ){
                var $icon = $('<i/>').addClass('fa '+icon);
                if (index < iconClassArray.length)
                    $icon.addClass( iconClassArray[index] );
                $icon.appendTo( _this );                
            });
                
            //Add color (optional)
            if (options.color)
                _this.addClass('text-'+ options.color);

            if (options.icon && options.text)
                _this.append('&nbsp;');

            $.each( textArray, function( index, text ){
                var link = linkArray[ index ],
                    title = titleArray[ index ],
                    textStyle = textStyleArray[ index ] || '',
                    $text;
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
                    $text = $('<span/>');

                if (title)
                    $text.i18n(title, 'title');

                $text._bsAddStyleClasses( textStyle );
                
                if ($.isFunction( text ))
                    text( $text );
                else
                    $text.i18n( text );

                if (index < textClassArray.length)
                    $text.addClass( textClassArray[index] );
                $text.appendTo( _this );                
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