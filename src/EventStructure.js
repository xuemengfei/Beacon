/*
 * @module  EventStructure
 * MIT Licensed
 * @author  baishuiz@gmail.com
 */
;(function (beacon) {
    var base = beacon.base;

    var EventStructure  = function(target) {
       var arrayIndexOf = base.arrayIndexOf;
       var events = [];
       
       function getEventName(event){
            var eventIndex = arrayIndexOf(events, event);
            if(eventIndex < 0){
                eventIndex = events.push(event)-1;
            }
            var eventAlias = "event_" + eventIndex;
            var eventName = (event.toString() === event) ? event : eventAlias;
            return eventName;
       }
       
       function tryGetEventName(event){
          var eventIndex = arrayIndexOf(events, event);
          if(eventIndex<0){
            return null;
          } else {
            return getEventName(event);
          }
       }
       
       var api = {
           dom : target,
           target : target
          ,attachEvent : function (event, eventHandle) {
              var eventName = getEventName(event);
              events[eventName] = events[eventName] || [];
              events[eventName].push(eventHandle);
          }
          
         ,removeEvent : function (event, eventHandle) {
              var result;
              var eventName = event && getEventName(event);
              var eventHandles = eventName && events[eventName];
              // if(!eventHandles){return}
              if(event && eventHandle) {
                  var handleIndex = arrayIndexOf(eventHandles, eventHandle);
                  result = events[eventName].splice(handleIndex, 1);
              } else if(event && !eventHandle) {
                  result = events[eventName];
                  events[eventName] = [];
              } else if(!event && !eventHandle) {
                  result = events;
                  events = [];
              }
              return result;
          }
          
         ,getEventList : function(event){
             var eventName = tryGetEventName(event);
             if(eventName){
             var result = event ? events[eventName] : events.slice(0);
             }
             return result;
         }
       }
       return api
    }

    base.EventStructure = EventStructure;
}) (beacon);