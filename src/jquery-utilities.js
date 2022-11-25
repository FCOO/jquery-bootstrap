/****************************************************************************
jquery-utilities.js

Utilities for manipulation JSON and other objects

****************************************************************************/

(function ($ /*, window, document, undefined*/) {
	"use strict";

    /******************************************
    $.mergeObjects(obj1, obj2)
    Merge obj2 into obj1. Return the merged version
    The merge is on all content of objects and tables
    *******************************************/
    $.mergeObjects = function mergeObjects(obj1, obj2){
        function objType( obj ){
            if ($.isArray(obj)) return 'array';
            if ($.isPlainObject(obj)) return 'object';
            if (obj === undefined)  return 'undefined';
            return 'simple';
        }
        function copyObj(obj){
            return $.extend(true, {}, obj);
        }

        var type1 = objType(obj1),
            type2 = objType(obj2),
            result;

        //If obj2 is undefined => No change
        if (type2 == 'undefined')
            return obj1;

        //If the two obj are different types or simple types: Can't merge => obj1 is replaced by obj2
        if ((type1 != type2) || (type2 == 'simple'))
            return obj2;

        if (type1 == 'array'){
            result = [...obj1];
            for (var i=0; i<obj2.length; i++){
                if (i < obj1.length)
                    result[i] = mergeObjects(obj1[i], obj2[i]);
                else
                    result.push( copyObj(obj2[i]) );
            }
        }

        if (type1 == 'object'){
            result = copyObj(obj1);
            $.each(obj2, function(id, value){
                result[id] = mergeObjects(obj1[id], value);
            });
        }

        return result;
    }

}(jQuery, this, document));