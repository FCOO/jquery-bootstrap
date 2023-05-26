/****************************************************************************
jquery-bootstrap-progress-bar.js
****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

/******************************************************************
bsProgressBar( options )
options
    width

<div class="progress">
  <div class="progress-bar" role="progressbar" aria-label="Example with label" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
</div>



*******************************************************************/
    var bsProgressBarId = 0;



    /**********************************************************
    bsProgressBar( options ) - create a Bootstrap progress-bar
    **********************************************************/
    $.bsProgressBar = $.bsProgressbar = function( options ){

        var id = options.id = options.id || 'bsProgressBar_' + bsProgressBarId++;

        this.options = options;

        var $result = $('<div/>')
                .attr('id', id)
                .addClass('progress')
                .data('pspb_value', 0)
                .width(options.width);

        $('<div/>')
            .addClass('progress-bar')
            .attr({
                'role': 'progressbar',
                'aria-valuenow': '0',
                'aria-valuemin': '0',
                'aria-valuemax': '100'
            })
            .width('0%')
            .appendTo($result);

        if (options.value)
            $result._pb_setValue(options.value);



        return $result;
    };

    //Extend $.fn with methods to set and get the state of bsCheckbox and to handle click
    $.fn.extend({
        _pb_setValue: function(value){
            this.find('.progress-bar')
                .css('width', value+'%').attr('aria-valuenow', value)
                .text(value > 10 ? value+'%' : '');
            this.data('pspb_value', value);
            return this;
        },
        _pb_incValue: function(value = 0){
            return this._pb_setValue( this.data('pspb_value') + value );
        }
    });


}(jQuery, this, document));