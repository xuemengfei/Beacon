/*
 * @module  DOMEvent
 * MIT Licensed
 * @author  baishuiz@gmail.com
 */
;(function (beacon) {
    var base = beacon.base;
    var host = (function(){return this}());
    
    var EventStructure  = function(dom) {
       var arrayIndexOf = base.arrayIndexOf;
       var events = [];
       var api = {
           dom : dom
          ,attachEvent : function (eventName, eventHandle) {
              events[eventName] = events[eventName] || [];
              events[eventName].push(eventHandle);
              events.push(eventName);
          }
          
         ,removeEvent : function (eventName, eventHandle) {
              var eventHandles = events[eventName];
              var result;
              if(eventName && eventHandle) {
                  var handleIndex = arrayIndexOf(eventHandles, eventHandle);
                  result = events[eventName].splice(handleIndex, 1);
              } else if(eventName && !eventHandle) {
                  result = events[eventName];
                  events[eventName] = [];
              } else if(!eventName && !eventHandle) {
                  result = events;
                  events = [];
              }
              return result;
          } 
       }
       return api
    }

    var eventMap = {
        structures : []
       ,getStructure : function(dom) {
           var activeStructure
           for(var i = 0; i < eventMap.structures.length; i++) {
               activeStructure = eventMap.structures[i];
               if (activeStructure.dom === dom) {
                   return activeStructure;
               }
           }
       }
       
       ,add : function (dom, eventName, eventHandle) {
           var activeStructure = eventMap.getStructure(dom);
           if(!activeStructure) {
             activeStructure = new EventStructure(dom);
             eventMap.structures.push(activeStructure);
           } 
           activeStructure.attachEvent(eventName, eventHandle);
           
       }
       
      ,remove : function (dom, eventName, eventHandle) {
          var activeStructure = eventMap.getStructure(dom);
          return activeStructure.removeEvent(eventName, eventHandle);
      }
    }
    
    
    var help = {
        attachEvent : function (eventName, eventHandle) {
            var dom = this;
            
            var addEventListener = function (eventName, eventHandle) {
                var dom = this;
                dom.addEventListener(eventName, eventHandle, false);
            };
            
            var attachEvent = function(eventName, eventHandle){
                var dom = this;
                dom.attachEvent("on" + eventName, eventHandle);
            };
            
            var otherFn = function(eventName, eventHandle) {
                var dom = this;
                var oldHandle = dom["on" + eventName];
                dom["on" + eventName] = function() {
                    oldHandle.call(dom);
                    eventHandle.call(dom);
                };
            };
            
            var proxy;
            if (host.addEventListener) {
                addEventListener.call(dom, eventName, eventHandle);
                proxy = addEventListener;
            } else if (host.attachEvent) {
                attachEvent.call(dom, eventName, eventHandle);
                proxy = attachEvent;
            }else {
                otherFn.call(dom, eventName, eventHandle);
                proxy = otherFn;
            }
            return help.attachEvent = proxy;
        }
       
       ,fireEvent   : function (eventType, option) {
            var dom = this;
            var dispatchEvent = function(eventType, option) {
                    var dom = this;
                    option = option || {bubbles:true,cancelable:true};
                    option.ieHack = dom.all && dom.all.toString(); // 规避 IE 异常，当 dom 不在DOM树时，IE9下 fireEVent会抛出异常；此处采用赋值操作以避免js压缩时清除冗余语句；
                    option.ieHack = dom.style; // 规避 IE 异常，当 dom 不在DOM树时，IE9下 fireEVent 不会触发事件；此处采用赋值操作以避免js压缩时清除冗余语句；
                
                    var evt = document.createEvent("Event");
                    evt.initEvent(eventType, option.bubbles, option.cancelable);
                    dom.dispatchEvent(evt);
           };
           
           var fireEvent = function (eventType, option) {
                var dom = this;
                option = option || {bubbles:true, cancelable:true};
                option.ieHack = dom.all && dom.all.toString(); // 规避 IE 异常，当 dom 不在DOM树时，IE7下 fireEVent会抛出异常；此处采用赋值操作以避免js压缩时清除冗余语句；
                option.ieHack = dom.style; // 规避 IE 异常，当 dom 不在DOM树时，IE8下 fireEVent 不会触发事件；此处采用赋值操作以避免js压缩时清除冗余语句；
                
                eventType = 'on' + eventType;
                var evt = document.createEventObject();
                evt.cancelBubble = option.cancelable;
                dom.fireEvent(eventType, evt);
           };
           
            var proxy;
            if (document.createEvent && dom.dispatchEvent) {
                dispatchEvent.call(dom, eventType, option);
                proxy = dispatchEvent;
            } else if (document.createEventObject && dom.fireEvent) {
                fireEvent.call(dom, eventType, option);
                proxy = fireEvent;
            }
            return proxy;
       }
        
       ,removeEvent : function (eventType, eventHandle) {
            var dom = this;
            var removeEventListener = function(eventType, eventHandle) {
                    var dom = this;
                    dom.removeEventListener(eventType, eventHandle, false);
           };
           
           var detachEvent = function (eventType, eventHandle) {
                var dom = this;
                dom.detachEvent('on' + eventType, eventHandle);
           };
           
            var proxy;
            if (dom.removeEventListener) {
                removeEventListener.call(dom, eventType, eventHandle);
                proxy = removeEventListener;
            } else if (dom.detachEvent) {
                detachEvent.call(dom, eventType, eventHandle);
                proxy = detachEvent;
            }
            return help.removeEvent = proxy;           
       }   
    };
    
    var event = {
        attachEvent : function(eventName, eventHandle){
            var dom = this;
            eventMap.add(dom, eventName, eventHandle);
            help.attachEvent.call(dom, eventName, eventHandle);
        }
       
       ,fireEvent : function(eventType, option) {
            var dom = this;
            event.fireEVent = help.fireEvent.call(dom, eventType, option);
       }
       
      ,removeEvent : function(eventType, eventHandle) {
          var dom = this;
          if(eventType && eventHandle) {
              help.removeEvent.call(dom, eventType, eventHandle);
          } else if (eventType && !eventHandle) {
              var eventHandles = eventMap.remove(dom, eventType) 
              eventHandles && base.each(eventHandles, function(){
                 var activeHandle = this;
                 event.removeEvent.call(dom, eventType, activeHandle);
              });
          } else if (!eventType && !eventHandle) {
              var eventTypes = eventMap.remove(dom) 
              eventTypes && base.each(eventTypes, function(){
                  var activeEventType = this;
                  activeEventType && base.each(eventTypes[activeEventType], function(){
                      var activeEventHandle = this;  
                      event.removeEvent.call(dom, activeEventType, activeEventHandle);
                  });
                  
              });              
          }     
      }
       
      ,isHTMLElement : function (obj) {
            var _isHTMLElement;
            if (host.HTMLElement) {
        	    _isHTMLElement = obj instanceof HTMLElement ;
        	} else {
        	    var _nodeName = obj.nodeName;
        		_isHTMLElement = !delete obj.nodeName;
        		obj.nodeName = _nodeName;
        	}
        
        	if(!_isHTMLElement){
        	    _isHTMLElement = obj==document || obj == window;
        	}
        	return _isHTMLElement;
        }
        
       ,isEventSupported : function(dom, eventType){
            if(!event.isHTMLElement(dom)){ return false}
        	
            var isSupported = false;
            if(dom === window || dom === document) {
                var ifm = document.createElement('iframe');
                ifm.style.display='none';
                document.body.appendChild(ifm);
                
                var dummyElement = dom === window ? 
                                     ifm.contentWindow : 
                                     ifm.contentDocument;
                event.attachEvent.call(dummyElement, eventType, function(){
                    isSupported = true;
                });
                event.fireEvent.call(dummyElement, eventType);
                ifm.parentNode.removeChild(ifm)
            } else {
            
            	var elementName = dom.tagName;
            	var eventType = 'on' + eventType;
            	dom = document.createElement(elementName);
            	
            	isSupported  = (eventType in dom);
            	
                if ( !isSupported ) {
                    dom.setAttribute(eventType, "return;");
                    isSupported = typeof dom[eventType] === "function";
                }
                dom = null;
            }
        
            return isSupported;
       }

    };

    base.DOMEvent = event;
}) (beacon);