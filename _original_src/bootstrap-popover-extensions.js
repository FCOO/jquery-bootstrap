/****************************************************************************
	bootstrap-popover-extensions.js,

	(c) 2017, FCOO

	https://github.com/FCOO/bootstrap-popover-extensions
	https://github.com/FCOO

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    //Concert from all new placement to original
    var truePlacement2placement = {
            topleft   : 'top',    top   : 'top',    topright   : 'top',
            bottomleft: 'bottom', bottom: 'bottom', bottomright: 'bottom',
            lefttop   : 'left',   left  : 'left',   leftbottom : 'left',
            righttop  : 'right',  right : 'right',  rightbottom: 'right'
    };

    /****************************************************
    Overwrite Popover.show to save and modify new positions
    *****************************************************/
    $.fn.tooltip.Constructor.prototype.show = function( _show ){
        return function(){
            //If first time: Save 'true' placement
            if (!this.config.truePlacement){
                this.config.truePlacement = this.config.placement;
                this.config.placement = truePlacement2placement[this.config.truePlacement];
            }

            //Original methods
            _show.apply(this, arguments);

            //Adjust popover
            var $tip        = $(this.tip),
                arrowDim    = $tip.find('.arrow').width() || 10,
                arrowOffset = 6 + arrowDim,
                offset      = 0,
                sign        = 0;



            switch (this.config.truePlacement){
                case 'topright'   :
                case 'rightbottom':
                case 'bottomright':
                case 'leftbottom' : sign = +1; break;

                case 'topleft'    :
                case 'righttop'   :
                case 'bottomleft' :
                case 'lefttop'    : sign = -1; break;

                default           : sign = 0;
            }

            switch (sign) {
                case +1: offset = '+50%p - ' + arrowOffset + 'px'; break;
                case -1: offset = '-50%p + ' + arrowOffset + 'px'; break;
                default: offset = 0;
            }

            if (this._popper)
                this._popper.modifiers[1].offset = offset;
        };

    }( $.fn.tooltip.Constructor.prototype.show );

}(jQuery, this, document));