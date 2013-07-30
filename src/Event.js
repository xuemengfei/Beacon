
/*
 * @module  EventDispatcher
 * MIT Licensed
 * @author  baishuiz@gmail.com
 */
;(function (beacon) {
    var base = beacon.base;
    
    var eventList = [];
    var targetList = [];
    
    var event = {
       hostProxy : {}
       
       ,attachEvent : function(eventName, eventHandle) {
            var eventId = registTarget(this);
            var regEvent = (eventName instanceof base.combinationalEvent) ? 
                               registCombinationinlEvent :
                                   registEvent;
                                   
            regEvent(eventId, eventName, eventHandle);
        }
        
       ,fireEvent : function(eventName, eventBody){
            var target = this;
            var targetIndex = getTargetIndex(targetList,target);
            var events = eventList[targetIndex];
            var eventHandles;
            for(var i=0; i<events.length; i++) {
                if(events[i].name === eventName ) {
                    eventHandles = events[i].fn;
                    break;
                }
            }
            base.each(eventHandles, function(i){
                var eventObject = {
                    eventType:eventName
                };
                eventHandles[i].call(target,eventObject, eventBody);
            });
        }
       
       ,publicDispatchEvent : function(eventName, eventBody){
            base.each(targetList,function(i){
                event.fireEvent.call(targetList[i], eventName, eventBody);
            });
       }
       
       
       ,removeEvent: function(eventName,eventHandle){
           var target = this;
           var targetIndex = getTargetIndex(targetList,target);
           
           if(eventName instanceof base.combinationalEvent) {
               removeCombinationinlEvent(targetIndex, eventName, eventHandle);
           } else {
               removeEvent(targetIndex, eventName, eventHandle);
           }
           
           
       }       
    };
    
    var Event = (function(){
            var Event = function(){};
            Event.prototype = event;
            base.blend(Event, event);
            return Event;
    }());
    
    
    
    function getTargetIndex(targetList,target){
         var targetIndex = base.arrayIndexOf(targetList,target);
         return targetIndex;
    }
    
    function registTarget(target) {
        var targetIndex = getTargetIndex(targetList,target);
        if(targetIndex<0){
            targetIndex = targetList.push(target) - 1;
        }
        return targetIndex;
    }
    
    function registEvent(eventId, eventName, eventHandle) {
        var indexOf = base.arrayIndexOf;
        
        if(!eventList[eventId] || eventList[eventId].length<=0) {
          eventList[eventId] = [{
            name:eventName
           ,fn  :[]
          }];  
        } 
        
        
        var events = eventList[eventId];
        for(var i=0; i<events.length; i++) {
            if(events[i].name === eventName ) {
                events[i].fn.push(eventHandle);        
                break;
            }
            
            if(i===events.length-1){
                eventList[eventId].push({
                    name:eventName
                   ,fn  :[]
                });
            }
        }
    }
    
    
    function registCombinationinlEvent(targetId, event, eventHandle){
        var eventList = event.eventList;
        var handleProxy = function(eventObject, eventBody){
                var target = this;
                var eventIndex = base.arrayIndexOf(eventList,eventObject.eventType);
                if(eventIndex>=0){
                    eventList.splice(eventIndex, 1);
                }
                
                if(eventList.length===0){
                    eventHandle.call(target,eventBody);
                    eventList = event.resetEventList();
                }
        };
        
        
        event.attachHandleProxy(eventHandle, handleProxy);
        base.each(eventList,function(index){
            registEvent(targetId, eventList[index], handleProxy);
        });
    }
    
    
    
    function removeEvent(eventId, eventName, eventHandle) {
        var indexOf = base.arrayIndexOf;
        if(!eventList[eventId]) {
          return null;
        } 
        
        if(!eventName && !eventHandle) {
            eventList[eventId] = [];
            return true
        }
        
        var events = eventList[eventId];
        var handleList;
        for(var i=0; i<events.length; i++) {
            if(events[i].name === eventName ) {
                handleList = events[i].fn;        
                break;
            }
        }
        
        
        if(eventHandle){
            for(var handleIndex = handleList.length; handleIndex >=0; handleIndex--){
                if(handleList[handleIndex] === eventHandle){
                    handleList.splice(handleIndex,1);
                }
            }
        } else {
            handleList.splice(0);
        }
    }
    
    
    
    function removeCombinationinlEvent(targetId, eventName, eventHandle) {
        var handleProxy = [].concat(eventName.getHandleProxy(eventHandle));
        
        base.each(handleProxy, function(){
            var handleProxy = this;
            base.each(eventName.eventList, function(index) {
                var eventName = this;
                removeEvent(targetId, eventName, handleProxy);    
            });
        });    
    }
    
    function getEventList(targetId, eventName) {
        var events = eventList[targetId];
        var handleList;
        for(var i=0; i<events.length; i++) {
            if(events[i].name === eventName ) {
                handleList = events[i].fn;        
                break;
            }
        }
        return handleList;
    }

    base.Event = Event;
}) (beacon);