/****************************************************************************
	jquery-bootstrap-checkbox.js,

	(c) 2017, FCOO

	https://github.com/fcoo/jquery-bootstrap
	https://github.com/fcoo

****************************************************************************/

(function ($/*, window/*, document, undefined*/) {
	"use strict";



    var bsCheckBoxId = 0;

    /**********************************************************
    bsCheckbox( options ) - create a Bootstrap checkbox
    **********************************************************/
    $.bsCheckbox = function( options ){

        options.id = options.id || 'bsCheckBox_' + bsCheckBoxId++;
        options.type = options.type || 'checkbox';
        options.className_semi = 'semi-selected';

        if (options.semiSelected){
            options.selected = true;
        }

        options =
            $._bsAdjustOptions( options, {
                useTouchSize: true,
                baseClass   : options.type
            });

        //Create outer div
        var $result = $('<div/>')._bsAddBaseClassAndSize( options ),

        //Create input-element
            $input =
                $('<input/>')
                    .addClass('cbxInput')
                    .prop({
                        type   : 'checkbox',
                        checked: options.selected
                    })
                    ._bsAddIdAndName( options )
                    .appendTo( $result );

        //Allow multi-lines
        $result.toggleClass('multi-lines', !!options.multiLines);


        /*
        If options.onClick = function(id, state, checkbox) exists => The control of setting
        and getting the state of the checkbox/radio is transfered to the onClick-function.
        This option prevent the default click-event for the input. The state of the input must be set using the cbxSetXXXX-methods of checkbox

        */
        if (options.onClick){
            $input.on('click', $.proxy($result._cbx_onClick, $result) ),

            //Add options used by $.fn._cbxSet
            $input.data('cbx_options', options);
        }
        else
            //Create input-element as checkbox from jquery-checkbox-radio-group
            $input.checkbox( options );

        //Get id and update input.id
        $input.prop({id: options.id });

        //Add label
        var $label = $('<label/>')
                        .prop('for', options.id )
                        .appendTo( $result );

        //Add <i> with check-icon if it is a checkbox
        $('<i/>')
            .addClass('checkbox-icon fas')
            .addClass(options.type == 'checkbox' ? 'fa-check' : 'fa-circle')
            .appendTo( $label );

        var content = options.content ? options.content : {icon: options.icon, text: options.text};
        $('<div/>')._bsAddHtml( content ).appendTo( $label );

        return $result;
    };

    //Extend $.fn with methods to set and get the state of bsCheckbox and to handle click
    $.fn.extend({
        _cbx_getInput: function(){
            return this.children('input.cbxInput');
        },

        cbxOptions: function(){
            return this._cbx_getInput().data('cbx_options');
        },

        cbxSetSelected: function(callOnChange){
            return this.cbxSetState(true, callOnChange);
        },
        cbxSetUnselected: function(callOnChange){
            return this.cbxSetState(false, callOnChange);
        },
        cbxSetSemiSelected: function(callOnChange){
            return this.cbxSetState('semi', callOnChange);
        },

        cbxToggleState: function(callOnChange){
            return this.cbxSetState(!this.cbxOptions().selected, callOnChange);
        },

        cbxSetState: function(state, callOnChange){
            var checked = !!state;

            this._cbx_getInput()._cbxSet(checked, !callOnChange);

            this._cbx_getInput().prop('checked', checked);

            //Update semi-selected class
            this._cbx_getInput().toggleClass( this.cbxOptions().className_semi, !!(state && (state !== true)) );

            return this;
        },

        cbxGetState: function(){
            var result = this.cbxOptions().selected;
            if (result && this._cbx_getInput().hasClass(this.cbxOptions().className_semi))
                result = 'semi';
            return result;
        },

        _cbx_onClick: function(event){
            //Prevent default event and call the users onClick-function instead
            //The onClick-function must bee called with delay to allow update of the input-element

            var _this       = this,
                options     = this.cbxOptions(),
                state       = this.cbxGetState(),
                onClickFunc = options.onClick;

            setTimeout(function(){
                onClickFunc(options.id, state, _this);
            }, 10);

            event.preventDefault();
        }

    });


}(jQuery, this, document));

