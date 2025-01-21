/****************************************************************************
	jquery-bootstrap-accordion.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    // Create $.BSASMODAL - See src/jquery-bootstrap.js for details
    $.BSASMODAL = $.BSASMODAL || {};

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
        accordion_onChange($this);
    }

    //card_onShow_close_siblings: Close all open siblings when card is shown
    function card_onShow_close_siblings(){
        var $this = $(this);
        $this.siblings('.show').children('.collapse').collapse('hide');
    }

    //card_onShown_close_siblings: Close all open siblings when card is shown BUT without animation
    function card_onShown_close_siblings(){
        var $this = $(this);
        if ($this.hasClass('show')){
            $this.addClass('no-transition');
            card_onShow_close_siblings.call(this);
            $this.removeClass('no-transition');
        }
        accordion_onChange($this);
    }

    //update_status: Create a
    function accordion_onChange($element){
        var $accordion = $element.parents('.accordion').last(),
            onChange = $accordion.data('accordion_onChange');
        if (onChange)
            onChange($accordion, $accordion.bsAccordionStatus());
    }


    /**********************************************************
    bsAccordion( options ) - create a Bootstrap-accordion

    <div id="accordion" class="accordion accordion-sm" role="tablist" aria-multiselectable="true">
        <div class="card">
            <div class="card-header" role="tab" id="headingOne" data-bs-toggle="collapse" _data-parent="#accordion" href="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                <i class="fa fa-home"></i>&nbsp;<span>Den nye overskrift</span>
            </div>
            <div id="collapseOne" class="collapse _show" role="tabpanel" aria-labelledby="headingOne">
                <div class="card-block">
                    This is the content
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header" role="tab" id="headingTwo" data-bs-toggle="collapse" _data-parent="#accordion" href="#collapseTwo" aria-expanded="true" aria-controls="collapseTwo">
                <i class="fa fa-home"></i>&nbsp;<span>Den nye overskrift</span>
            </div>
        <div id="collapseTwo" class="collapse" role="tabpanel" aria-labelledby="headingTwo">
            <div class="card-block">
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
            </div>
        </div>
    </div>

    <div class="accordion accordion-flush" id="accordionFlushExample">
        <div class="accordion-item">
            <h2 class="accordion-header" id="flush-headingOne">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                    Accordion Item #1
                </button>
            </h2>
            <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
                <div class="accordion-body">Placeholder content for this accordion, which is intended to demonstrate the <code>.accordion-flush</code> class. This is the first item's accordion body.</div>
            </div>
        </div>
    ..another <div class="accordion-item">...</div>
    </div>
    **********************************************************/
    var accordionId = 0;

    $.BSASMODAL.BSACCORDION = function( options ){
        return $.bsModal( $.extend( {
                              flexWidth: true,
                              content  : this,
                          }, options)
               );
    };

    $.bsAccordion = function( options ){
        var id = 'bsAccordion'+ accordionId++;
        options =
            $._bsAdjustOptions( options, {}, {
                baseClass   : 'accordion',
                styleClass  : '',
                content     : ''
            });

        if (options.neverClose){
            options.multiOpen = true;
            options.allOpen   = true;
        }

        var $result = $('<div/>')
                        .addClass('BSACCORDION')
                        ._bsAddBaseClassAndSize( options )
                        .attr({
                            'id'      : id,
                            'tabindex': -1,
                        });

        //Adding the children {icon, text, content}
        options.list = options.list || [];
        options.list.forEach( ( opt, index ) => {
            //Create the header
            opt = $._bsAdjustOptions( opt );

            var headerId   = id + 'header'+index,
                collapseId = id + 'collapse'+index,
                isOpen     = !!options.allOpen || !!opt.selected,
                $accordionItem = $('<div/>')
                    .addClass('accordion-item')
                    .toggleClass('show', isOpen)
                    .attr({'data-user-id': opt.id || null})
                    .on( 'shown.bs.collapse',  card_onShown )
                    .on( 'hidden.bs.collapse', card_onHidden )
                    .on( 'show.bs.collapse',   options.multiOpen ? null : card_onShow_close_siblings )
                    .on( 'shown.bs.collapse',  options.multiOpen ? null : card_onShown_close_siblings )
                    .appendTo( $result ),
                headerAttr = {
                    'id'  : headerId,
                    'role': 'tab',
                };

            //Add header
            if (!options.neverClose)
                $.extend(headerAttr, {
                    'data-bs-toggle': "collapse",
                    'data-parent'   : '#'+id,
                    'href'          : '#'+collapseId,
                    'aria-expanded' : true,
                    'aria-controls' : collapseId,
                    'aria-target'   : '#'+collapseId
                });

            var $accordionHeader = $('<div/>')
                    .addClass('accordion-header')
                    .attr('id', headerId)
                    .appendTo( $accordionItem );

            var $accordionButton = $('<button type="button"/>')
                    .addClass('accordion-button')
                    .toggleClass('collapsed', !isOpen)
                    ._bsAddHtml( $.extend({text:'&nbsp;'}, opt.header || opt )) //'&nbsp;' = bug fix to prevent header without text to be wronge height - not pretty :-)
                    .toggleClass('accordion-never-close', !!options.neverClose)
                    .appendTo( $accordionHeader );

            if (!options.neverClose)
                $.extend(headerAttr, {
                    'data-bs-toggle': "collapse",
                    'data-bs-target': '#'+collapseId,
                });

            $accordionButton.attr(headerAttr);

            //Add content-container
            var $outer =
                $('<div/>')
                    .addClass('collapse')
                    .toggleClass('show', isOpen)
                    .attr({
                        'id'             : collapseId,
                        'role'           : 'tabpanel',
                        'aria-labelledby': headerId
                    })
                    .appendTo( $accordionItem ),

                $contentContainer =
                    $('<div/>')
                        .addClass('accordion-body')
                        .toggleClass('no-vertical-padding', !!opt.noVerticalPadding)
                        .toggleClass('no-horizontal-padding', !!opt.noHorizontalPadding)
                        .addClass(opt.class || '')
                        .addClass(opt.className || '')
                        .appendTo( $outer );

            //Add footer
            if (opt.footer)
                $('<div/>')
                    .addClass('accordion-footer')
                    ._bsAddHtml( opt.footer )
                    .appendTo( $outer );

            //Add content: string, element, function or children (=accordion)
            if (opt.content)
                $contentContainer._bsAppendContent( opt.content, opt.contentContext, null, options );

            //If opt.list exists => create a accordion inside $contentContainer
            if (Array.isArray(opt.list))
                $.bsAccordion( {
                    allOpen   : options.allOpen,
                    multiOpen : options.multiOpen,
                    neverClose: options.neverClose,
                    list: opt.list
                } )
                    .appendTo( $contentContainer );


        }); //End of options.list.forEach( ( opt, index ){

        if (options.onChange){
            $result.data('accordion_onChange', options.onChange);
            options.onChange($result, $result.bsAccordionStatus());
        }
        return $result;
    };

    //Extend $.fn with method to get status for an accordion open/slose status
    $.fn.bsAccordionStatus = function(){
        function getStatus($elem){
            var result = [];
            $elem.children('.card').each( function(index, elem){
                var $elem = $(elem);
                result[index] = $elem.hasClass('show') ? getStatus($elem.find('> .collapse > .card-block > .accordion')) : false;
            });
            return result.length ? result : true;
        }
        return getStatus(this);
    };



    //Extend $.fn with method to open a card given by id (string) or index (integer)
    $.fn.bsOpenCard = function( indexOrId ){
        this.addClass('no-transition');
        var $accordionItem =
                this.children(
                    $.type(indexOrId) == 'number' ?
                    'div.accordion-item:nth-of-type('+(indexOrId+1)+')' :
                    'div.accordion-item[data-user-id="' + indexOrId + '"]'
                );

        if ($accordionItem && $accordionItem.length)
            $accordionItem.children('.collapse').collapse('show');
        this.removeClass('no-transition');
    };

}(jQuery, this, document));