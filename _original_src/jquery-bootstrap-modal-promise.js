/****************************************************************************
jquery-bootstrap-modal-promise.js

****************************************************************************/

(function ($/*, window, document, undefined*/) {
	"use strict";

    /**********************************************************
    $.BsModalContentPromise
    Read data from a url and updates bsModal-content in associated "owner" of the modals.
    Is bsModal and other classes (leaflet-layer)
    Each class working as owner can have (but do not need to have) tree methods:
        _bsModalPromise_Update(options) - Called with the new options
        _bsModalPromise_Reject: Called when the reguest failed
        _bsModalPromise_SetOnChange( func ) - add event that calls func when the owner is changed and need "fresh" options

    options = {
        url             : STRING or FUNCTION
        getModalOptions : function(data): return new modal-options based on data retrieved fra url
        needToReload    : BOOLEAN or FUNCTION return true if the data nedd to reload from
    }

    Used methods:

    **********************************************************/
    $.BsModalContentPromise = function(options){
        this.options = options;
    };


	$.BsModalContentPromise.prototype = {
        _getUrl: function(){
            return $.isFunction(this.options.url) ? this.options.url() : this.options.url;
        },

        _needToUpdate: function(){
            if (!this.data) return true;
            if ($.isFunction(this.options.needToUpdate))
                return this.options.needToUpdate(this.modalOptions);
            return !!this.options.needToUpdate;
        },

        /**********************************************
        addBsModalOwner(owner) - add a object (owner) with methods for updating/reject of data.

        options
            getModalOptions(data): Convert data to options for owners modal (optional)
        **********************************************/
        addBsModalOwner: function( owner, options ){
            this.ownerList = this.ownerList || [];
            this.ownerList.push({owner: owner, options: options});

            if (owner._bsModalPromise_SetOnChange)
                owner._bsModalPromise_SetOnChange( $.proxy(this.update, this) );
        },

        resolve: function(data){
            this.loading = false;
            $.workingOff();
            this.data = data;
            this.updateOwner();
        },

        reject: function(){
            var _this = this;
            this.loading = false;
            $.workingOff();
            $.each(this.ownerList, function(index, ownerOptions){
                var owner      = ownerOptions.owner,
                    rejectFunc = owner._bsModalPromise_Reject || _this.options.reject;

                if (rejectFunc)
                    $.proxy(rejectFunc, owner)();
            });
            if (this.options.afterReject)
                this.options.afterReject();
        },

        //update() - check and load or update the content
        update: function(){
            if (this.loading) return;

            if (this._needToUpdate()){
                this.loading = true;
                $.workingOn();
                Promise.getJSON(this._getUrl(), {
                    useDefaultErrorHandler: true,
                    resolve: $.proxy(this.resolve, this),
                    reject : $.proxy(this.reject, this)
                });
            }
            else {
                this.loading = true;
                this.updateOwner();
                this.loading = false;
            }
        },

        //updateOwner - update the owners with the new content
        updateOwner: function(){
            var _this = this;
            $.each(this.ownerList, function(index, ownerOptions){
                //Convert this.data to modal-options
                var owner        = ownerOptions.owner,
                    convertFunc  = ownerOptions.getModalOptions || _this.options.getModalOptions || function(data){return data;},
                    updateFunc   = owner._bsModalPromise_Update || _this.options.update,
                    modalOptions = $.proxy(convertFunc, owner)(_this.data);

                if (updateFunc)
                    $.proxy(updateFunc, owner)(modalOptions);
            });
            if (this.options.afterUpdate)
                this.options.afterUpdate();
        }
    };

}(jQuery, this, document));
