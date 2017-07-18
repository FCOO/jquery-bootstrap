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