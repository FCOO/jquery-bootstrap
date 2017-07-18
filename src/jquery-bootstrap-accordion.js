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