/****************************************************************************
	jquery-bootstrap-accordion.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

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


    //card_onShow_close_siblings: Close all open siblings when card is shown
    function card_onShow_close_siblings(){
        $(this).siblings('.show').children('.collapse').collapse('hide');
    }

    //card_onShown_close_siblings: Close all open siblings when card is shown BUT without animation
    function card_onShown_close_siblings(){
        var $this = $(this);
        $this.addClass('no-transition');
        card_onShow_close_siblings.call(this);
        $this.removeClass('no-transition');
    }

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
                              flexWidth: true,
                              content  : this,
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

        if (options.neverClose){
            options.multiOpen = true;
            options.allOpen   = true;
        }

        var $result = $('<div/>')
                        ._bsAddBaseClassAndSize( options )
                        .attr({
                            'id'      : id,
                            'tabindex': -1,
                            'role'    : "tablist",
                            'aria-multiselectable': true
                        });

        //Adding the children {icon, text, content}
        $.each( options.list, function( index, opt ){
            //Create the header
            opt = $._bsAdjustOptions( opt );

            var headerId   = id + 'header'+index,
                collapseId = id + 'collapse'+index,
                isOpen     = !!options.allOpen || !!opt.selected,
                $card = $('<div/>')
                            .addClass('card')
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
                    'data-toggle'  : "collapse",
                    'data-parent'  : '#'+id,
                    'href'         : '#'+collapseId,
                    'aria-expanded': true,
                    'aria-controls': collapseId,
                    'aria-target': '#'+collapseId
                });

            $card.append(
                $('<div/>')
                    .addClass('card-header')
                    .toggleClass('collapsed', !isOpen)
                    .toggleClass('collapsible', !options.neverClose)
                    .attr(headerAttr)
                    ._bsAddHtml( opt.header || opt )
                    //Add chevrolet-icon
                    .append( options.neverClose ? null : $('<i/>').addClass('fa chevrolet') )
            );

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
            if (opt.content)
                $contentContainer._bsAppendContent( opt.content, opt.contentContext );

            //If opt.list exists => create a accordion inside $contentContainer
            if ($.isArray(opt.list))
                $.bsAccordion( {
                    allOpen   : options.allOpen,
                    multiOpen : options.multiOpen,
                    neverClose: options.neverClose,
                    list: opt.list
                } )
                    .appendTo( $contentContainer );
        }); //End of $.each( options.list, function( index, opt ){

        $result.collapse(/*options*/);
        $result.asModal = bsAccordion_asModal;

        return $result;
    };


    //Extend $.fn with method to open a card given by id (string) or index (integer)
    $.fn.bsOpenCard = function( indexOrId ){
        this.addClass('no-transition');
        var $card =
                this.children(
                    $.type(indexOrId) == 'number' ?
                    'div.card:nth-of-type('+(indexOrId+1)+')' :
                    'div.card[data-user-id="' + indexOrId + '"]'
                );
        if ($card && $card.length)
            $card.children('.collapse').collapse('show');
        this.removeClass('no-transition');
    };

}(jQuery, this, document));