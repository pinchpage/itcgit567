// ====================================aya slider=================================================
/**
* ayaSlider
* MIT Licensed
* @author Mamod Mehyar
* http://twitter.com/mamod
* http://mamod.me
* version : 1.2.4
*/

(function($) {
    function _action(){}
    $.fn.ayaSlider = function(customOptions) {
        var action = new _action();
        var options = $.extend({},$.fn.ayaSlider.defaultOptions, customOptions);
        action.inout = 'in';
        action.items = undefined;
        action.currentSlide = undefined;
        
        action.clearTimeOuts = function(){
            for (var i = 0; i < action.timeOuts.length; i++){
                clearTimeout(action.timeOuts[i]);
            }
        };
        
        action.timer = function(delay){
            var container = action.appendTimerTo;
            if (!(container && container.length)) return;
            
            action.appendTimerTo.find('._ayaSlider_timer').each(function(){
                var $this = $(this);
                
                if (!delay) delay = 0;
                
                $this.stop().animate({
                    width : '100%',
                    height : '100%'
                },{
                    duration : delay
                }); 
            });
        };
        
        action.move = function(pack){
            action.timeOuts = [];
            action.currentSlide = pack;
            if (!pack) return false;
            
            var items = pack.find('._ayaSlider_move').andSelf();
            action.items = items;
            items.stop();
            
            var length = items.length;
            pack.css({
                display: 'block',
                opacity: 1
            });
            
            if (action.appendTimerTo){
                action.appendTimerTo.find('._ayaSlider_timer').stop().css({
                    width : 0
                });
            }

            if (options.list){
                var $index = pack.data('slideIndex');
                var $list = $(options.list);
                $list.find('li').removeClass('current');
                $list.find('li:eq('+$index+')').addClass('current');
            }
            
            items.each(function(i){
                var ele = $(this);
                var opt = ele.data("_options");
                if (!opt) return true;
                
                var durationIn = parseFloat(opt.In.duration) || 1000+(i*300),
                delayIn = parseFloat(opt.In.delay) || 0,
                easeIn = opt.In.ease || options.easeIn || 'easeOutBack',
                easeOut = opt.Out.ease || options.easeOut || easeIn,
                durationOut = parseFloat(opt.Out.duration) || durationIn,
                delayOut = parseFloat(opt.Out.delay) || options.delay;
                
                var defaultIn = {};
                
                if (typeof options.defaultIn === 'object'){
                    defaultIn = options.defaultIn;
                }
                
                if ( opt.In.top || opt.In.left || opt.In.opacity ){
                    defaultIn = {
                        top: parseFloat(opt.In.top) || 0,
                        left : parseFloat(opt.In.left) || 0
                    };
                    
                    if (opt.In.opacity){
                        defaultIn.opacity = parseFloat(opt.In.opacity);
                    }
                }
                
                ele.css(defaultIn);
                var posType = ele.css('position');
                if (posType == 'static'){
                    ele.css({
                        position : 'relative'
                    });
                }
                
                action.timeOuts.push(setTimeout(function(){
                    ele.stop().animate({
                        opacity : opt.opacity,
                        left: opt.left+'px',
                        top: opt.top+'px'
                    },{
                        queue: false,
                        duration: durationIn,
                        complete: function(){
                            var css = {};
                            if (ele[0] !== pack[0]){
                                css = defaultIn;
                            }
                            
                            if (opt.Out.top || opt.Out.left || opt.Out.opacity){
                                css = {
                                    top: parseFloat(opt.Out.top) || 0,
                                    left : parseFloat(opt.Out.left) || 0,
                                    opacity : parseFloat(opt.Out.opacity) || ele.css('opacity') || 1
                                };
                            }
                            //out animation
                            if (ele[0] === pack[0]){
                                if (action.previousSlide){
                                    action.previousSlide.hide();
                                }
                                //play timer
                                action.timer(delayOut);
                            }
                            
                            if (opt.Out.opacity){
                                css.opacity = parseFloat(opt.Out.opacity);
                            }
                            
                            if (delayOut > -1) {
                                action.timeOuts.push(setTimeout(function(){
                                    clearInterval(action.interval);
                                    var inter = setInterval(function(){
                                        if (action.pause == true){
                                        
                                        } else {
                                            clearInterval(inter);
                                            if (ele[0] === pack[0]){
                                                action.move(pack.loopSiblings(action));
                                                items.stop();
                                            }
                                            
                                            ele.stop().animate(css,{
                                                duration: durationOut,
                                                queue: false,
                                                complete: function(){},
                                                easing : easeOut
                                            });
                                        }
                                    },60);
                                },delayOut));
                            }
                        },
                        easing : easeIn
                    });
                },delayIn));
            });
            return false;
        };
        
        action.add = function(text){
            var data = {};
            var options = text.split(';');
            for (var x = 0; x < options.length; x++){
                var values = options[x].split(':');
                if (values && values.length == 2){
                    //if (key == 'opacity') continue;
                    var key = values[0].replace(/\s+/,'');
                    var value = values[1].replace(/\s+/,'');
                    data[key] = value;
                }
            }
            return data;
        };
        
        action.ini = function($this){
            var next,previous;
            $this.mouseenter(function(){
                action.pause = true;
            }).mouseleave(function(){
                action.pause = false;
            });
            
            //set required style
            $this.css({
                'position' : 'relative',
                'overflow' : 'hidden'
            });
            
            if (options.next) next = options.next;
            if (options.previous) previous = options.previous;
            
            $(previous).click(function(event){
                event.stopPropagation();
                //stop all previous animations
                if (action.items) action.items.stop();
                action.clearTimeOuts();
                action.currentSlide.fadeOut('slow');
                action.move(action.currentSlide.loopSiblings(action,'previous'));
                return false;
            });
            
            $(next).click(function(event){
                event.stopPropagation();
                //stop all previous animations
                if (action.items) action.items.stop();
                action.clearTimeOuts();
                action.currentSlide.fadeOut('fast');
                action.move(action.currentSlide.loopSiblings(action));
                return false;
            });
            
            if (options.list){
                var $list = $(options.list);
                $list.find('li').each(function(i){
                    var $li = $(this);
                    $li.click(function(){
                        if ($li.hasClass('current')) return false;
                        if (action.items) action.items.stop();
                        action.clearTimeOuts();
                        action.currentSlide.fadeOut('fast');
                        action.move(action.currentSlide.loopSiblings(action,i));
                        return false;
                    });
                });
            }
            
            var _first, _height = $this.height();
            $this.children().each(function(i){
                var ele = $(this);
                ele.addClass('_ayaSlider_slide').data('slideIndex',i);
                ele.css({
                    position: 'absolute',
                    overflow:'hidden',
                    display: 'none',
                    width : '100%',
                    height : _height
                });
                
                if (i == 0){
                    _first = ele;
                    action.firstElement = _first.clone();
                }
            });
            
            $this.find('*').each(function(){
                var ele = $(this);
                var data = {
                    In : {},
                    Out : {}
                };
                
                if(!ele.data("_in")){
                    var options = ele.data('in');
                    if (options) data.In = action.add(options);
                }
                
                if(!ele.data("_out")){
                    var options = ele.data('out');
                    if (options) data.Out = action.add(options);
                }
                
                data.left = 0;
                data.top = 0;
                //save opacity in data
                if (!ele.data('_opacity')) ele.data('_opacity',ele.css('opacity'));
                
                data.opacity = ele.data('_opacity');
                ele.data("_options",data);
                ele.addClass('_ayaSlider_move');
            });
            
            if (options.timer){
                //var appendTimerTo;
                if (options.timer == true){
                    action.appendTimerTo = $this;
                } else {
                    action.appendTimerTo = $(options.timer);
                }
                
                $('<div class="_ayaSlider_timer" style="z-index:9999;width:0;left:0;top:0;margin:0;padding:0"></div>')
                .css({
                    opacity: options.timerOpacity,
                    height: '100%',
                    position : options.timerPosition,
                    backgroundColor : options.timerColor
                }).appendTo(action.appendTimerTo);
                
                $(window).resize(function(){
                    action.timer();
                });
            }
            
            action.move(_first);
        };
        
        this.destroySlider = function(){
            if (action.items) action.items.stop();
            action.clearTimeOuts();
            var item = this.find(':first');
            item.replaceWith(action.firstElement);
            action.firstElement.show();
        };
        
        this.reloadSlider = function(newoptions){
            options = $.extend({},options, newoptions);
            this.destroySlider();
            action.ini($(this));
        };
        
        return this.each(function() {
            action.ini($(this));
        });
    };
    
    $.fn.ayaSlider.defaultOptions = {
        delay : 5000,
        easeIn : "linear",
        easeOut : "linear",
        timerColor : '#000',
        timerPosition : 'relative',
        timerOpacity : .5
    };
    
    $.fn.loopSiblings = function(_action,type){
        var $this = this;
        
        $this.css('zIndex','2');
        _action.previousSlide = $this;
        var item;
        if (parseInt(type) >= 0 ){
            item = $('._ayaSlider_slide:eq('+type+')');
        }else if (type === 'previous'){
            item = $this.prev('._ayaSlider_slide');
            var len = item.length;
            if (item.length == 0) {
                item = $this.nextAll('._ayaSlider_slide').eq(len-1);
            }
        } else {
            item = $this.next('._ayaSlider_slide');
            var len = item.length;
            if (item.length == 0) {
                item = $this.prevAll('._ayaSlider_slide').eq(len-1);
            }
        }
        item.css('zIndex','3');
        return item;
    };
    
})(jQuery);

// ============================device.min===========================================================
/*! device.js 0.1.57 */
(function(){var a,b,c,d,e,f,g,h,i;window.device={},b=window.document.documentElement,i=window.navigator.userAgent.toLowerCase(),device.ios=function(){return device.iphone()||device.ipod()||device.ipad()},device.iphone=function(){return c("iphone")},device.ipod=function(){return c("ipod")},device.ipad=function(){return c("ipad")},device.android=function(){return c("android")},device.androidPhone=function(){return device.android()&&c("mobile")},device.androidTablet=function(){return device.android()&&!c("mobile")},device.blackberry=function(){return c("blackberry")||c("bb10")||c("rim")},device.blackberryPhone=function(){return device.blackberry()&&!c("tablet")},device.blackberryTablet=function(){return device.blackberry()&&c("tablet")},device.windows=function(){return c("windows")},device.windowsPhone=function(){return device.windows()&&c("phone")},device.windowsTablet=function(){return device.windows()&&c("touch")},device.fxos=function(){return c("(mobile; rv:")||c("(tablet; rv:")},device.fxosPhone=function(){return device.fxos()&&c("mobile")},device.fxosTablet=function(){return device.fxos()&&c("tablet")},device.mobile=function(){return device.androidPhone()||device.iphone()||device.ipod()||device.windowsPhone()||device.blackberryPhone()||device.fxosPhone()},device.tablet=function(){return device.ipad()||device.androidTablet()||device.blackberryTablet()||device.windowsTablet()||device.fxosTablet()},device.portrait=function(){return 90!==Math.abs(window.orientation)},device.landscape=function(){return 90===Math.abs(window.orientation)},c=function(a){return-1!==i.indexOf(a)},e=function(a){var c;return c=new RegExp(a,"i"),b.className.match(c)},a=function(a){return e(a)?void 0:b.className+=" "+a},g=function(a){return e(a)?b.className=b.className.replace(a,""):void 0},device.ios()?device.ipad()?a("ios ipad tablet"):device.iphone()?a("ios iphone mobile"):device.ipod()&&a("ios ipod mobile"):device.android()?device.androidTablet()?a("android tablet"):a("android mobile"):device.blackberry()?device.blackberryTablet()?a("blackberry tablet"):a("blackberry mobile"):device.windows()?device.windowsTablet()?a("windows tablet"):device.windowsPhone()?a("windows mobile"):a("desktop"):device.fxos()?device.fxosTablet()?a("fxos tablet"):a("fxos mobile"):a("desktop"),d=function(){return device.landscape()?(g("portrait"),a("landscape")):(g("landscape"),a("portrait"))},h="onorientationchange"in window,f=h?"orientationchange":"resize",window.addEventListener?window.addEventListener(f,d,!1):window.attachEvent?window.attachEvent(f,d):window[f]=d,d()}).call(this);

// ==========================shuffle================================================================
/*!
 * Shuffle.js by @Vestride
 * Categorize, sort, and filter a responsive grid of items.
 * Dependencies: jQuery 1.9+, Modernizr 2.6.2+
 * @license MIT license
 * @version 2.1.2
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery","modernizr"],a):a(window.jQuery,window.Modernizr)}(function(a,b,c){"use strict";function d(a){return a?a.replace(/([A-Z])/g,function(a,b){return"-"+b.toLowerCase()}).replace(/^ms-/,"-ms-"):""}function e(b,c,d){var e,f,g,h=null,i=0;d=d||{};var j=function(){i=d.leading===!1?0:a.now(),h=null,g=b.apply(e,f),e=f=null};return function(){var k=a.now();i||d.leading!==!1||(i=k);var l=c-(k-i);return e=this,f=arguments,0>=l||l>c?(clearTimeout(h),h=null,i=k,g=b.apply(e,f),e=f=null):h||d.trailing===!1||(h=setTimeout(j,l)),g}}if("object"!=typeof b)throw new Error("Shuffle.js requires Modernizr.\nhttp://vestride.github.io/Shuffle/#dependencies");var f=b.prefixed("transition"),g=b.prefixed("transitionDelay"),h=b.prefixed("transitionDuration"),i={WebkitTransition:"webkitTransitionEnd",transition:"transitionend"}[f],j=b.prefixed("transform"),k=d(j),l=b.csstransforms&&b.csstransitions,m=b.csstransforms3d,n="shuffle",o="all",p="groups",q=1,r=.001,s=0,t=function(b,c){c=c||{},a.extend(this,t.options,c,t.settings),this.$el=a(b),this.$window=a(window),this.unique="shuffle_"+s++,this._fire(t.EventType.LOADING),this._init(),setTimeout(a.proxy(function(){this.initialized=!0,this._fire(t.EventType.DONE)},this),16)};return t.EventType={LOADING:"loading",DONE:"done",SHRINK:"shrink",SHRUNK:"shrunk",FILTER:"filter",FILTERED:"filtered",SORTED:"sorted",LAYOUT:"layout",REMOVED:"removed"},t.prototype={_init:function(){var b,c,d=this,e=a.proxy(d._onResize,d),g=d.throttle?d.throttle(e,d.throttleTime):e,h=d.initialSort?d.initialSort:null;d._layoutList=[],d._shrinkList=[],d._setVars(),d._resetCols(),d._addClasses(),d._initItems(),d.$window.on("resize."+n+"."+d.unique,g),b=d.$el.css(["paddingLeft","paddingRight","position"]),c=d._getOuterWidth(d.$el[0]),"static"===b.position&&(d.$el[0].style.position="relative"),d.offset={left:parseInt(b.paddingLeft,10)||0,top:parseInt(b.paddingTop,10)||0},d._setColumns(parseInt(c,10)),d.shuffle(d.group,h),d.supported&&setTimeout(function(){d._setTransitions(),d.$el[0].style[f]="height "+d.speed+"ms "+d.easing},0)},_addClasses:function(){this.$el.addClass(n),this.$items.addClass("shuffle-item filtered")},_setVars:function(){var b=this,c=b.columnWidth;b.$items=b._getItems(),0===c&&null!==b.sizer&&(c=b.sizer),"string"==typeof c?b.$sizer=b.$el.find(c):c&&c.nodeType&&1===c.nodeType?b.$sizer=a(c):c&&c.jquery&&(b.$sizer=c),b.$sizer&&b.$sizer.length&&(b.useSizer=!0,b.sizer=b.$sizer[0])},_filter:function(b,d){var e=this,f=d!==c,g=f?d:e.$items,h=a();return b=b||e.lastFilter,e._fire(t.EventType.FILTER),a.isFunction(b)?g.each(function(){var c=a(this);b.call(c[0],c,e)&&(h=h.add(c))}):(e.group=b,b===o?h=g:g.each(function(){var c=a(this),d=c.data(p),f=e.delimeter&&!a.isArray(d)?d.split(e.delimeter):d;a.inArray(b,f)>-1&&(h=h.add(c))})),e._toggleFilterClasses(g,h),g=null,d=null,h},_toggleFilterClasses:function(b,c){var d="concealed",e="filtered";b.filter(c).each(function(){var b=a(this);b.hasClass(d)&&b.removeClass(d),b.hasClass(e)||b.addClass(e)}),b.not(c).each(function(){var b=a(this);b.hasClass(d)||b.addClass(d),b.hasClass(e)&&b.removeClass(e)})},_initItems:function(a){a=a||this.$items,a.css(this.itemCss).data("position",{x:0,y:0})},_updateItemCount:function(){this.visibleItems=this.$items.filter(".filtered").length},_setTransition:function(a){a.style[f]=k+" "+this.speed+"ms "+this.easing+", opacity "+this.speed+"ms "+this.easing},_setTransitions:function(a){var b=this;a=a||b.$items,a.each(function(){b._setTransition(this)})},_setSequentialDelay:function(b){var c=this;c.supported&&a.each(b,function(b,d){d.style[g]="0ms,"+(b+1)*c.sequentialFadeDelay+"ms",a(d).on(i+"."+c.unique,function(b){var d=b.currentTarget;d===b.target&&(d.style[g]="0ms",a(d).off(i+"."+c.unique))})})},_getItems:function(){return this.$el.children(this.itemSelector)},_getPreciseDimension:function(b,c){var d;return d=window.getComputedStyle?window.getComputedStyle(b,null)[c]:a(b).css(c),parseFloat(d)},_getOuterWidth:function(b,c){var d=b.offsetWidth;if(c){var e=a(b).css(["marginLeft","marginRight"]),f=parseFloat(e.marginLeft)||0,g=parseFloat(e.marginRight)||0;d+=f+g}return d},_getOuterHeight:function(b,c){var d=b.offsetHeight;if(c){var e=a(b).css(["marginTop","marginBottom"]),f=parseFloat(e.marginTop)||0,g=parseFloat(e.marginBottom)||0;d+=f+g}return d},_getColumnSize:function(b,c){var d;return d=a.isFunction(this.columnWidth)?this.columnWidth(c):this.useSizer?this._getPreciseDimension(this.sizer,"width"):this.columnWidth?this.columnWidth:this.$items.length>0?this._getOuterWidth(this.$items[0],!0):c,0===d&&(d=c),d+b},_getGutterSize:function(b){var c;return c=a.isFunction(this.gutterWidth)?this.gutterWidth(b):this.useSizer?this._getPreciseDimension(this.sizer,"marginLeft"):this.gutterWidth},_setColumns:function(a){var b=a||this._getOuterWidth(this.$el[0]),c=this._getGutterSize(b),d=this._getColumnSize(c,b),e=(b+c)/d;Math.abs(Math.round(e)-e)<.03&&(e=Math.round(e)),this.cols=Math.max(Math.floor(e),1),this.containerWidth=b,this.colWidth=d},_setContainerSize:function(){this.$el.css("height",Math.max.apply(Math,this.colYs))},_fire:function(a,b){this.$el.trigger(a+"."+n,b&&b.length?b:[this])},_layout:function(b,c,d){var e=this;c=c||e._filterEnd,a.each(b,function(b,f){var g=a(f),h=g.data(),i=h.position,j=e._getItemPosition(g);if(g.data("position",j),j.x!==i.x||j.y!==i.y||h.scale!==q){var k={$item:g,x:j.x,y:j.y,scale:q};d?(k.skipTransition=!0,k.opacity=0):(k.opacity=1,k.callback=c),e.styleQueue.push(k),e._layoutList.push(g[0])}}),e._processStyleQueue(),e._setContainerSize()},_resetCols:function(){var a=this.cols;for(this.colYs=[];a--;)this.colYs.push(0)},_reLayout:function(){this._resetCols(),this.lastSort?this.sort(this.lastSort,!0):this._layout(this.$items.filter(".filtered").get(),this._filterEnd)},_getItemPosition:function(a){var b=this,c=b._getOuterWidth(a[0],!0),d=c/b.colWidth;Math.abs(Math.round(d)-d)<.03&&(d=Math.round(d));var e=Math.min(Math.ceil(d),b.cols);if(1===e)return b._placeItem(a,b.colYs);var f,g,h=b.cols+1-e,i=[];for(g=0;h>g;g++)f=b.colYs.slice(g,g+e),i[g]=Math.max.apply(Math,f);return b._placeItem(a,i)},_placeItem:function(a,b){for(var c=this,d=Math.min.apply(Math,b),e=0,f=0,g=b.length;g>f;f++)if(b[f]>=d-c.buffer&&b[f]<=d+c.buffer){e=f;break}var h={x:Math.round(c.colWidth*e+c.offset.left),y:Math.round(d+c.offset.top)},i=d+c._getOuterHeight(a[0],!0),j=c.cols+1-g;for(f=0;j>f;f++)c.colYs[e+f]=i;return h},_shrink:function(b,c){var d=this,e=b||d.$items.filter(".concealed");c=c||d._shrinkEnd,e.length&&(d._fire(t.EventType.SHRINK),e.each(function(){var b=a(this),e=b.data(),f=e.scale===r;if(!f){var g={$item:b,x:e.position.x,y:e.position.y,scale:r,opacity:0,callback:c};d.styleQueue.push(g),d._shrinkList.push(b[0])}}))},_onResize:function(){if(this.enabled&&!this.destroyed){var a=this._getOuterWidth(this.$el[0]);a!==this.containerWidth&&this.resized()}},_getItemTransformString:function(a,b,c){return m?"translate3d("+a+"px, "+b+"px, 0) scale3d("+c+", "+c+", 1)":"translate("+a+"px, "+b+"px) scale("+c+", "+c+")"},_getStylesForTransition:function(a){var b={opacity:a.opacity};return this.supported?a.x!==c&&(b[j]=this._getItemTransformString(a.x,a.y,a.scale)):(b.left=a.x,b.top=a.y),1===a.opacity&&(b.visibility="visible"),b},_transition:function(a){a.$item.data("scale",a.scale);var b=this._getStylesForTransition(a);this._startItemAnimation(a.$item,b,a.callback)},_startItemAnimation:function(b,c,d){var e=1===c.opacity,f=a.proxy(this._handleItemAnimationEnd,this,d||a.noop,b[0],e);this.supported?(b.css(c),this.initialized?b.on(i+".shuffleitem",f):f()):("visibility"in c&&(b.css("visibility",c.visibility),delete c.visibility),b.stop(!0).animate(c,this.speed,"swing",f))},_handleItemAnimationEnd:function(b,c,d,e){if(e){if(e.target!==c)return;a(c).off(".shuffleitem")}this._layoutList.length>0&&a.inArray(c,this._layoutList)>-1?(this._fire(t.EventType.LAYOUT),b.call(this),this._layoutList.length=0):this._shrinkList.length>0&&a.inArray(c,this._shrinkList)>-1&&(b.call(this),this._shrinkList.length=0),d||(c.style.visibility="hidden")},_processStyleQueue:function(){var b=this;a.each(this.styleQueue,function(a,c){c.skipTransition?b._skipTransition(c.$item[0],function(){c.$item.css(b._getStylesForTransition(c))}):b._transition(c)}),b.styleQueue.length=0},_shrinkEnd:function(){this._fire(t.EventType.SHRUNK)},_filterEnd:function(){this._fire(t.EventType.FILTERED)},_sortEnd:function(){this._fire(t.EventType.SORTED)},_skipTransition:function(b,c,d){var e=b.style[h];b.style[h]="0ms",a.isFunction(c)?c():b.style[c]=d;var f=b.offsetWidth;f=null,b.style[h]=e},_addItems:function(a,b,d){var e=this;e.supported||(b=!1),a.addClass("shuffle-item"),e._initItems(a),e._setTransitions(a),e.$items=e._getItems(),a.css("opacity",0);var f=e._filter(c,a),g=f.get();e._updateItemCount(),b?(e._layout(g,null,!0),d&&e._setSequentialDelay(f),e._revealAppended(f)):e._layout(g)},_revealAppended:function(b){var c=this;setTimeout(function(){b.each(function(b,d){c._transition({$item:a(d),opacity:1,scale:q})})},c.revealAppendedDelay)},shuffle:function(a,b){var c=this;c.enabled&&(a||(a=o),c._filter(a),c.lastFilter=a,c._updateItemCount(),c._shrink(),b&&(c.lastSort=b),c._reLayout())},sort:function(a,b){var c=this,d=c.$items.filter(".filtered").sorted(a);b||c._resetCols(),c._layout(d,function(){b&&c._filterEnd(),c._sortEnd()}),c.lastSort=a},resized:function(a){this.enabled&&(a||this._setColumns(),this._reLayout())},layout:function(){this.update(!0)},update:function(a){this.resized(a)},appended:function(a,b,c){b=b===!1?!1:!0,c=c===!1?!1:!0,this._addItems(a,b,c)},disable:function(){this.enabled=!1},enable:function(a){this.enabled=!0,a!==!1&&this.update()},remove:function(a){if(a.length&&a.jquery){var b=this;return b._shrink(a,function(){var b=this;a.remove(),setTimeout(function(){b.$items=b._getItems(),b.layout(),b._updateItemCount(),b._fire(t.EventType.REMOVED,[a,b]),a=null},0)}),b._processStyleQueue(),b}},destroy:function(){var a=this;a.$window.off("."+a.unique),a.$el.removeClass(n).removeAttr("style").removeData(n),a.$items.removeAttr("style").removeClass("concealed filtered shuffle-item"),a.$window=null,a.$items=null,a.$el=null,a.$sizer=null,a.sizer=null,a.destroyed=!0}},t.options={group:o,speed:250,easing:"ease-out",itemSelector:"",sizer:null,gutterWidth:0,columnWidth:0,delimeter:null,buffer:0,initialSort:null,throttle:e,throttleTime:300,sequentialFadeDelay:150,supported:l},t.settings={$sizer:null,useSizer:!1,itemCss:{position:"absolute",top:0,left:0},offset:{top:0,left:0},revealAppendedDelay:300,enabled:!0,destroyed:!1,initialized:!1,styleQueue:[]},a.fn.shuffle=function(b){var c=Array.prototype.slice.call(arguments,1);return this.each(function(){var d=a(this),e=d.data(n);e||(e=new t(d,b),d.data(n,e)),"string"==typeof b&&e[b]&&e[b].apply(e,c)})},a.fn.sorted=function(b){var d=a.extend({},a.fn.sorted.defaults,b),e=this.get(),f=!1;return e.length?d.randomize?a.fn.sorted.randomize(e):(d.by!==a.noop&&null!==d.by&&d.by!==c&&e.sort(function(b,e){if(f)return 0;var g=d.by(a(b)),h=d.by(a(e));return g===c&&h===c?(f=!0,0):"sortFirst"===g||"sortLast"===h?-1:"sortLast"===g||"sortFirst"===h?1:h>g?-1:g>h?1:0}),f?this.get():(d.reverse&&e.reverse(),e)):[]},a.fn.sorted.defaults={reverse:!1,by:null,randomize:!1},a.fn.sorted.randomize=function(a){var b,c,d=a.length;if(!d)return a;for(;--d;)c=Math.floor(Math.random()*(d+1)),b=a[c],a[c]=a[d],a[d]=b;return a},t});

// ========================featehr light===========================================================
/**
 * Featherlight - ultra slim jQuery lightbox
 * Version 1.0.1 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2014, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
**/
!function(a){"use strict";function b(a,c){if(!(this instanceof b)){var d=new b(a,c);return d.open(),d}this.id=b.id++,this.setup(a,c),this.chainCallbacks(b._callbackChain)}if("undefined"==typeof a)return void("console"in window&&window.console.info("Too much lightness, Featherlight needs jQuery."));var c=function(a){if(!a.isDefaultPrevented()){var c=b.current();c&&c.onKeyDown(a)}};b.prototype={constructor:b,namespace:"featherlight",targetAttr:"data-featherlight",variant:null,resetCss:!1,background:null,openTrigger:"click",closeTrigger:"click",filter:null,root:"body",openSpeed:250,closeSpeed:250,closeOnClick:"background",closeOnEsc:!0,closeIcon:"&#10005;",otherClose:null,beforeOpen:a.noop,beforeContent:a.noop,beforeClose:a.noop,afterOpen:a.noop,afterContent:a.noop,afterClose:a.noop,onKeyDown:a.noop,type:null,contentFilters:["jquery","image","html","ajax","text"],setup:function(b,c){"object"!=typeof b||b instanceof a!=!1||c||(c=b,b=void 0);var d=a.extend(this,c,{target:b}),e=d.resetCss?d.namespace+"-reset":d.namespace,f=a(d.background||['<div class="'+e+'">','<div class="'+e+'-content">','<span class="'+e+"-close-icon "+d.namespace+'-close">',d.closeIcon,"</span>",'<div class="'+d.namespace+'-inner"/></div>',"</div>","</div>"].join("")),g="."+d.namespace+"-close"+(d.otherClose?","+d.otherClose:"");return d.$instance=f.clone().addClass(d.variant),d.$instance.on(d.closeTrigger+"."+d.namespace,function(b){var c=a(b.target);("background"===d.closeOnClick&&c.is("."+d.namespace)||"anywhere"===d.closeOnClick||c.is(g))&&(b.preventDefault(),d.close())}),this},getContent:function(){var b=this,c=this.constructor.contentFilters,d=function(a){return b.$currentTarget&&b.$currentTarget.attr(a)},e=d(b.targetAttr),f=b.target||e||"",g=c[b.type];if(!g&&f in c&&(g=c[f],f=b.target&&e),f=f||d("href")||"",!g)for(var h in c)b[h]&&(g=c[h],f=b[h]);if(!g){var i=f;if(f=null,a.each(b.contentFilters,function(){return g=c[this],g.test&&(f=g.test(i)),!f&&g.regex&&i.match&&i.match(g.regex)&&(f=i),!f}),!f)return"console"in window&&window.console.error("Featherlight: no content filter found "+(i?' for "'+i+'"':" (no target specified)")),!1}return g.process.call(b,f)},setContent:function(b){var c=this;return(b.is("iframe")||a("iframe",b).length>0)&&c.$instance.addClass(c.namespace+"-iframe"),c.$content=b.addClass(c.namespace+"-inner"),c.$instance.find("."+c.namespace+"-inner").slice(1).remove().end().replaceWith(c.$content),c},open:function(d){var e=this;if(!(d&&d.isDefaultPrevented()||e.beforeOpen(d)===!1)){d&&d.preventDefault();var f=e.getContent();if(f)return e.constructor._opened.add(e._openedCallback=function(a,b){e instanceof a&&e.$instance.closest("body").length>0&&(b.currentFeatherlight=e)}),b._keyHandlerInstalled||(a(document).on("keyup."+b.prototype.namespace,c),b._keyHandlerInstalled=!0),e.$instance.appendTo(e.root).fadeIn(e.openSpeed),e.beforeContent(d),a.when(f).done(function(b){e.setContent(b),e.afterContent(d),a.when(e.$instance.promise()).done(function(){e.afterOpen(d)})}),e}return!1},close:function(d){var e=this;return e.beforeClose(d)===!1?!1:(e.constructor._opened.remove(e._openedCallback),b.current()||(a(document).off("keyup."+b.namespace,c),e.constructor._keyHandlerInstalled=!1),void e.$instance.fadeOut(e.closeSpeed,function(){e.$instance.detach(),e.afterClose(d)}))},chainCallbacks:function(b){for(var c in b)this[c]=a.proxy(b[c],this,a.proxy(this[c],this))}},a.extend(b,{id:0,autoBind:"[data-featherlight]",defaults:b.prototype,contentFilters:{jquery:{regex:/^[#.]\w/,test:function(b){return b instanceof a&&b},process:function(b){return a(b).clone(!0)}},image:{regex:/\.(png|jpg|jpeg|gif|tiff|bmp)(\?\S*)?$/i,process:function(b){var c=this,d=a.Deferred(),e=new Image;return e.onload=function(){d.resolve(a('<img src="'+b+'" alt="" class="'+c.namespace+'-image" />'))},e.onerror=function(){d.reject()},e.src=b,d.promise()}},html:{regex:/^\s*<[\w!][^<]*>/,process:function(b){return a(b)}},ajax:{regex:/./,process:function(b){var c=a.Deferred(),d=a("<div></div>").load(b,function(a,b){"error"!==b&&c.resolve(d.contents()),c.fail()});return c.promise()}},text:{process:function(b){return a("<div>",{text:b})}}},functionAttributes:["beforeOpen","afterOpen","beforeContent","afterContent","beforeClose","afterClose"],readElementConfig:function(b){var c=this,d={};return b&&b.attributes&&a.each(b.attributes,function(){var b=this.name.match(/^data-featherlight-(.*)/);if(b){var e=this.value,f=a.camelCase(b[1]);if(a.inArray(f,c.functionAttributes)>=0)e=new Function(e);else try{e=a.parseJSON(e)}catch(g){}d[f]=e}}),d},extend:function(b,c){var d=function(){this.constructor=b};return d.prototype=this.prototype,b.prototype=new d,b.__super__=this.prototype,a.extend(b,this,c),b.defaults=b.prototype,b},attach:function(b,c,d){var e=this;"object"!=typeof c||c instanceof a!=!1||d||(d=c,c=void 0),d=a.extend({},d);var f=a.extend({},e.defaults,e.readElementConfig(b[0]),d);return b.on(f.openTrigger+"."+f.namespace,f.filter,function(f){var g=a.extend({$source:b,$currentTarget:a(this)},e.readElementConfig(b[0]),e.readElementConfig(this),d);new e(c,g).open(f)}),b},current:function(){var a={};return this._opened.fire(this,a),a.currentFeatherlight},close:function(){var a=this.current();a&&a.close()},_onReady:function(){var b=this;b.autoBind&&(b.attach(a(document),{filter:b.autoBind}),a(b.autoBind).filter("[data-featherlight-filter]").each(function(){b.attach(a(this))}))},_callbackChain:{onKeyDown:function(a,b){return 27===b.keyCode&&this.closeOnEsc?(this.$instance.find("."+this.namespace+"-close:first").click(),void b.preventDefault()):(console.log("pass"),a(b))}},_opened:a.Callbacks()}),a.featherlight=b,a.fn.featherlight=function(a,c){return b.attach(this,a,c)},a(document).ready(function(){b._onReady()})}(jQuery);

//===============================j loader==========================================================
// (function(a){var b=new Array,c=new Array,d=function(){},e=0;var f={splashVPos:"35%",loaderVPos:"75%",splashID:"#jpreContent",showSplash:true,showPercentage:true,autoClose:true,closeBtnText:"Start!",onetimeLoad:false,debugMode:false,splashFunction:function(){}};var g=function(){if(f.onetimeLoad){var a=document.cookie.split("; ");for(var b=0,c;c=a[b]&&a[b].split("=");b++){if(c.shift()==="jpreLoader"){return c.join("=")}}return false}else{return false}};var h=function(a){if(f.onetimeLoad){var b=new Date;b.setDate(b.getDate()+a);var c=a==null?"":"expires="+b.toUTCString();document.cookie="jpreLoader=loaded; "+c}};var i=function(){jOverlay=a("<div></div>").attr("id","jpreOverlay").css({position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:9999999}).appendTo("body");if(f.showSplash){jContent=a("<div></div>").attr("id","jpreSlide").appendTo(jOverlay);var b=a(window).width()-a(jContent).width();a(jContent).css({position:"absolute",top:f.splashVPos,left:Math.round(50/a(window).width()*b)+"%"});a(jContent).html(a(f.splashID).wrap("<div/>").parent().html());a(f.splashID).remove();f.splashFunction()}jLoader=a("<div></div>").attr("id","jpreLoader").appendTo(jOverlay);var c=a(window).width()-a(jLoader).width();a(jLoader).css({position:"absolute",top:f.loaderVPos,left:Math.round(50/a(window).width()*c)+"%"});jBar=a("<div></div>").attr("id","jpreBar").css({width:"0%",height:"100%"}).appendTo(jLoader);if(f.showPercentage){jPer=a("<div></div>").attr("id","jprePercentage").css({position:"relative",height:"100%"}).appendTo(jLoader).html("Loading...")}if(!f.autoclose){jButton=a("<div></div>").attr("id","jpreButton").on("click",function(){n()}).css({position:"relative",height:"100%"}).appendTo(jLoader).text(f.closeBtnText).hide()}};var j=function(c){a(c).find("*:not(script)").each(function(){var c="";if(a(this).css("background-image").indexOf("none")==-1&&a(this).css("background-image").indexOf("-gradient")==-1){c=a(this).css("background-image");if(c.indexOf("url")!=-1){var d=c.match(/url\((.*?)\)/);c=d[1].replace(/\"/g,"")}}else if(a(this).get(0).nodeName.toLowerCase()=="img"&&typeof a(this).attr("src")!="undefined"){c=a(this).attr("src")}if(c.length>0){b.push(c)}})};var k=function(){for(var a=0;a<b.length;a++){if(l(b[a]));}};var l=function(b){var d=new Image;a(d).load(function(){m()}).error(function(){c.push(a(this).attr("src"));m()}).attr("src",b)};var m=function(){e++;var c=Math.round(e/b.length*100);a(jBar).stop().animate({width:c+"%"},500,"linear");if(f.showPercentage){a(jPer).text(c+"%")}if(e>=b.length){e=b.length;h();if(f.showPercentage){a(jPer).text("100%")}if(f.debugMode){var d=o()}a(jBar).stop().animate({width:"100%"},500,"linear",function(){if(f.autoClose)n();else a(jButton).fadeIn(1e3)})}};var n=function(){a(jOverlay).fadeOut(800,function(){a(jOverlay).remove();d()})};var o=function(){if(c.length>0){var a="ERROR - IMAGE FILES MISSING!!!\n\r";a+=c.length+" image files cound not be found. \n\r";a+="Please check your image paths and filenames:\n\r";for(var b=0;b<c.length;b++){a+="- "+c[b]+"\n\r"}return true}else{return false}};a.fn.jpreLoader=function(b,c){if(b){a.extend(f,b)}if(typeof c=="function"){d=c}a("body").css({display:"block"});return this.each(function(){if(!g()){i();j(this);k()}else{a(f.splashID).remove();d()}})}})(jQuery)

// ====================================appear======================================================
/*
 * jQuery.appear
 * https://github.com/bas2k/jquery.appear/
 * http://code.google.com/p/jquery-appear/
 *
 * Copyright (c) 2009 Michael Hixson
 * Copyright (c) 2012 Alexander Brovikov
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 */
(function($) {
    $.fn.appear = function(fn, options) {

        var settings = $.extend({

            //arbitrary data to pass to fn
            data: undefined,

            //call fn only on the first appear?
            one: true,

            // X & Y accuracy
            accX: 0,
            accY: 0

        }, options);

        return this.each(function() {

            var t = $(this);

            //whether the element is currently visible
            t.appeared = false;

            if (!fn) {

                //trigger the custom event
                t.trigger('appear', settings.data);
                return;
            }

            var w = $(window);

            //fires the appear event when appropriate
            var check = function() {

                //is the element hidden?
                if (!t.is(':visible')) {

                    //it became hidden
                    t.appeared = false;
                    return;
                }

                //is the element inside the visible window?
                var a = w.scrollLeft();
                var b = w.scrollTop();
                var o = t.offset();
                var x = o.left;
                var y = o.top;

                var ax = settings.accX;
                var ay = settings.accY;
                var th = t.height();
                var wh = w.height();
                var tw = t.width();
                var ww = w.width();

                if (y + th + ay >= b &&
                    y <= b + wh + ay &&
                    x + tw + ax >= a &&
                    x <= a + ww + ax) {

                    //trigger the custom event
                    if (!t.appeared) t.trigger('appear', settings.data);

                } else {

                    //it scrolled out of view
                    t.appeared = false;
                }
            };

            //create a modified fn with some additional logic
            var modifiedFn = function() {

                //mark the element as visible
                t.appeared = true;

                //is this supposed to happen only once?
                if (settings.one) {

                    //remove the check
                    w.unbind('scroll', check);
                    var i = $.inArray(check, $.fn.appear.checks);
                    if (i >= 0) $.fn.appear.checks.splice(i, 1);
                }

                //trigger the original fn
                fn.apply(this, arguments);
            };

            //bind the modified fn to the element
            if (settings.one) t.one('appear', settings.data, modifiedFn);
            else t.bind('appear', settings.data, modifiedFn);

            //check whenever the window scrolls
            w.scroll(check);

            //check whenever the dom changes
            $.fn.appear.checks.push(check);

            //check now
            (check)();
        });
    };

    //keep a queue of appearance checks
    $.extend($.fn.appear, {

        checks: [],
        timeout: null,

        //process the queue
        checkAll: function() {
            var length = $.fn.appear.checks.length;
            if (length > 0) while (length--) ($.fn.appear.checks[length])();
        },

        //check the queue asynchronously
        run: function() {
            if ($.fn.appear.timeout) clearTimeout($.fn.appear.timeout);
            $.fn.appear.timeout = setTimeout($.fn.appear.checkAll, 20);
        }
    });

    //run checks when these methods are called
    $.each(['append', 'prepend', 'after', 'before', 'attr',
        'removeAttr', 'addClass', 'removeClass', 'toggleClass',
        'remove', 'css', 'show', 'hide'], function(i, n) {
        var old = $.fn[n];
        if (old) {
            $.fn[n] = function() {
                var r = old.apply(this, arguments);
                $.fn.appear.run();
                return r;
            }
        }
    });

})(jQuery);
// ==============================back streach=================================================
/*! Backstretch - v2.0.4 - 2013-06-19
* http://srobbin.com/jquery-plugins/backstretch/
* Copyright (c) 2013 Scott Robbin; Licensed MIT */
(function(a,d,p){a.fn.backstretch=function(c,b){(c===p||0===c.length)&&a.error("No images were supplied for Backstretch");0===a(d).scrollTop()&&d.scrollTo(0,0);return this.each(function(){var d=a(this),g=d.data("backstretch");if(g){if("string"==typeof c&&"function"==typeof g[c]){g[c](b);return}b=a.extend(g.options,b);g.destroy(!0)}g=new q(this,c,b);d.data("backstretch",g)})};a.backstretch=function(c,b){return a("body").backstretch(c,b).data("backstretch")};a.expr[":"].backstretch=function(c){return a(c).data("backstretch")!==p};a.fn.backstretch.defaults={centeredX:!0,centeredY:!0,duration:5E3,fade:0};var r={left:0,top:0,overflow:"hidden",margin:0,padding:0,height:"100%",width:"100%",zIndex:-999999},s={position:"absolute",display:"none",margin:0,padding:0,border:"none",width:"auto",height:"auto",maxHeight:"none",maxWidth:"none",zIndex:-999999},q=function(c,b,e){this.options=a.extend({},a.fn.backstretch.defaults,e||{});this.images=a.isArray(b)?b:[b];a.each(this.images,function(){a("<img />")[0].src=this});this.isBody=c===document.body;this.$container=a(c);this.$root=this.isBody?l?a(d):a(document):this.$container;c=this.$container.children(".backstretch").first();this.$wrap=c.length?c:a('<div class="backstretch"></div>').css(r).appendTo(this.$container);this.isBody||(c=this.$container.css("position"),b=this.$container.css("zIndex"),this.$container.css({position:"static"===c?"relative":c,zIndex:"auto"===b?0:b,background:"none"}),this.$wrap.css({zIndex:-999998}));this.$wrap.css({position:this.isBody&&l?"fixed":"absolute"});this.index=0;this.show(this.index);a(d).on("resize.backstretch",a.proxy(this.resize,this)).on("orientationchange.backstretch",a.proxy(function(){this.isBody&&0===d.pageYOffset&&(d.scrollTo(0,1),this.resize())},this))};q.prototype={resize:function(){try{var a={left:0,top:0},b=this.isBody?this.$root.width():this.$root.innerWidth(),e=b,g=this.isBody?d.innerHeight?d.innerHeight:this.$root.height():this.$root.innerHeight(),j=e/this.$img.data("ratio"),f;j>=g?(f=(j-g)/2,this.options.centeredY&&(a.top="-"+f+"px")):(j=g,e=j*this.$img.data("ratio"),f=(e-b)/2,this.options.centeredX&&(a.left="-"+f+"px"));this.$wrap.css({width:b,height:g}).find("img:not(.deleteable)").css({width:e,height:j}).css(a)}catch(h){}return this},show:function(c){if(!(Math.abs(c)>this.images.length-1)){var b=this,e=b.$wrap.find("img").addClass("deleteable"),d={relatedTarget:b.$container[0]};b.$container.trigger(a.Event("backstretch.before",d),[b,c]);this.index=c;clearInterval(b.interval);b.$img=a("<img />").css(s).bind("load",function(f){var h=this.width||a(f.target).width();f=this.height||a(f.target).height();a(this).data("ratio",h/f);a(this).fadeIn(b.options.speed||b.options.fade,function(){e.remove();b.paused||b.cycle();a(["after","show"]).each(function(){b.$container.trigger(a.Event("backstretch."+this,d),[b,c])})});b.resize()}).appendTo(b.$wrap);b.$img.attr("src",b.images[c]);return b}},next:function(){return this.show(this.index<this.images.length-1?this.index+1:0)},prev:function(){return this.show(0===this.index?this.images.length-1:this.index-1)},pause:function(){this.paused=!0;return this},resume:function(){this.paused=!1;this.next();return this},cycle:function(){1<this.images.length&&(clearInterval(this.interval),this.interval=setInterval(a.proxy(function(){this.paused||this.next()},this),this.options.duration));return this},destroy:function(c){a(d).off("resize.backstretch orientationchange.backstretch");clearInterval(this.interval);c||this.$wrap.remove();this.$container.removeData("backstretch")}};var l,f=navigator.userAgent,m=navigator.platform,e=f.match(/AppleWebKit\/([0-9]+)/),e=!!e&&e[1],h=f.match(/Fennec\/([0-9]+)/),h=!!h&&h[1],n=f.match(/Opera Mobi\/([0-9]+)/),t=!!n&&n[1],k=f.match(/MSIE ([0-9]+)/),k=!!k&&k[1];l=!((-1<m.indexOf("iPhone")||-1<m.indexOf("iPad")||-1<m.indexOf("iPod"))&&e&&534>e||d.operamini&&"[object OperaMini]"==={}.toString.call(d.operamini)||n&&7458>t||-1<f.indexOf("Android")&&e&&533>e||h&&6>h||"palmGetResource"in d&&e&&534>e||-1<f.indexOf("MeeGo")&&-1<f.indexOf("NokiaBrowser/8.5.0")||k&&6>=k)})(jQuery,window);

// ==============================easing=======================================================
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
	def: 'easeOutQuad',
	swing: function (x, t, b, c, d) {
		//alert(jQuery.easing.default);
		return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */

// =====================================fittext==================================================
/*global jQuery */
/*! 
* FitText.js 1.1
*
* Copyright 2011, Dave Rupert http://daverupert.com
* Released under the WTFPL license 
* http://sam.zoy.org/wtfpl/
*
* Date: Thu May 05 14:23:00 2011 -0600
*/

(function( $ ){
    
  $.fn.fitText = function( kompressor, options ) {
       
    // Setup options
    var compressor = kompressor || 1,
        settings = $.extend({
          'minFontSize' : Number.NEGATIVE_INFINITY,
          'maxFontSize' : Number.POSITIVE_INFINITY
        }, options);
    
    return this.each(function(){

      // Store the object
      var $this = $(this); 
        
      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        $this.css('font-size', Math.max(Math.min($this.width() / (compressor*10), parseFloat(settings.maxFontSize)), parseFloat(settings.minFontSize)));
      };

      // Call once to set.
      resizer();
                
      // Call on resize. Opera debounces their resize by default. 
      $(window).on('resize', resizer);
        
    });

  };

})( jQuery );

 // ==============================map main=======================================================
 /*
* jquery.gmap
* Version 2.1.5 2013-10-30
* @requires jQuery >= 1.6.1 or later
*
* Homepage: http://labs.mario.ec/jquery-gmap/
* Author: Mario Estrada <me@mario.ec>
* License: MIT
*/
!function(a){a.fn.gMap=function(b,c){switch(b){case"addMarker":return a(this).trigger("gMap.addMarker",[c.latitude,c.longitude,c.content,c.icon,c.popup]);case"centerAt":return a(this).trigger("gMap.centerAt",[c.latitude,c.longitude,c.zoom]);case"clearMarkers":return a(this).trigger("gMap.clearMarkers")}var d=a.extend({},a.fn.gMap.defaults,b);return this.each(function(){var b=new google.maps.Map(this);a(this).data("gMap.reference",b);var c=new google.maps.Geocoder;d.address?c.geocode({address:d.address},function(a){a&&a.length&&b.setCenter(a[0].geometry.location)}):d.latitude&&d.longitude?b.setCenter(new google.maps.LatLng(d.latitude,d.longitude)):a.isArray(d.markers)&&d.markers.length>0?d.markers[0].address?c.geocode({address:d.markers[0].address},function(a){a&&a.length>0&&b.setCenter(a[0].geometry.location)}):b.setCenter(new google.maps.LatLng(d.markers[0].latitude,d.markers[0].longitude)):b.setCenter(new google.maps.LatLng(34.885931,9.84375)),b.setZoom(d.zoom),b.setMapTypeId(google.maps.MapTypeId[d.maptype]);var e={scrollwheel:d.scrollwheel,disableDoubleClickZoom:!d.doubleclickzoom};d.controls===!1?a.extend(e,{disableDefaultUI:!0}):0!==d.controls.length&&a.extend(e,d.controls,{disableDefaultUI:!0}),b.setOptions(e);var f,g,h=new google.maps.Marker;f=new google.maps.MarkerImage(d.icon.image),f.size=new google.maps.Size(d.icon.iconsize[0],d.icon.iconsize[1]),f.anchor=new google.maps.Point(d.icon.iconanchor[0],d.icon.iconanchor[1]),h.setIcon(f),d.icon.shadow&&(g=new google.maps.MarkerImage(d.icon.shadow),g.size=new google.maps.Size(d.icon.shadowsize[0],d.icon.shadowsize[1]),g.anchor=new google.maps.Point(d.icon.shadowanchor[0],d.icon.shadowanchor[1]),h.setShadow(g)),a(this).bind("gMap.centerAt",function(a,c,d,e){e&&b.setZoom(e),b.panTo(new google.maps.LatLng(parseFloat(c),parseFloat(d)))});var i=[];a(this).bind("gMap.clearMarkers",function(){for(;i[0];)i.pop().setMap(null)});var j;a(this).bind("gMap.addMarker",function(a,c,e,f,g,k){var l,m,n=new google.maps.LatLng(parseFloat(c),parseFloat(e)),o=new google.maps.Marker({position:n});if(g?(l=new google.maps.MarkerImage(g.image),l.size=new google.maps.Size(g.iconsize[0],g.iconsize[1]),l.anchor=new google.maps.Point(g.iconanchor[0],g.iconanchor[1]),o.setIcon(l),g.shadow&&(m=new google.maps.MarkerImage(g.shadow),m.size=new google.maps.Size(g.shadowsize[0],g.shadowsize[1]),m.anchor=new google.maps.Point(g.shadowanchor[0],g.shadowanchor[1]),h.setShadow(m))):(o.setIcon(h.getIcon()),o.setShadow(h.getShadow())),f){"_latlng"===f&&(f=c+", "+e);var p=new google.maps.InfoWindow({content:d.html_prepend+f+d.html_append});google.maps.event.addListener(o,"click",function(){j&&j.close(),p.open(b,o),j=p}),k&&google.maps.event.addListenerOnce(b,"tilesloaded",function(){p.open(b,o)})}o.setMap(b),i.push(o)});for(var k,l=this,m=function(b){return function(c){c&&c.length>0&&a(l).trigger("gMap.addMarker",[c[0].geometry.location.lat(),c[0].geometry.location.lng(),b.html,b.icon,b.popup])}},n=0;n<d.markers.length;n++)k=d.markers[n],k.address?("_address"===k.html&&(k.html=k.address),c.geocode({address:k.address},m(k))):a(this).trigger("gMap.addMarker",[k.latitude,k.longitude,k.html,k.icon,k.popup])})},a.fn.gMap.defaults={address:"",latitude:0,longitude:0,zoom:1,markers:[],controls:[],scrollwheel:!1,doubleclickzoom:!0,maptype:"ROADMAP",html_prepend:'<div class="gmap_marker">',html_append:"</div>",icon:{image:"http://www.google.com/mapfiles/marker.png",shadow:"http://www.google.com/mapfiles/shadow50.png",iconsize:[20,34],shadowsize:[37,34],iconanchor:[9,34],shadowanchor:[6,34]}}}(jQuery);

// =============================scrolly========================================================
/*
 *  Project: Scrolly : parallax is easy as a matter of fact !
 *  Description: Based on jQuery boilerplate
 *  Author: Victor C. / Octave & Octave web agency
 *  Theme : Star
 *  Customised  : pixelglimpse
 *  Licence: MIT
 */
(function ( $, window, document, undefined ) {
    // Create the defaults once
    var pluginName = 'scrolly',
        defaults = {
            bgParallax: false
        },
        didScroll = false;

    function Plugin( element, options ) {
        this.element = element;
        this.$element = $(this.element);

        this.options = $.extend( {}, defaults, options) ;
        
        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    Plugin.prototype.init = function () {
        var self = this;
        this.startPosition = this.$element.position().top;
        this.offsetTop = this.$element.offset().top;
        this.height = this.$element.outerHeight(true);
        this.velocity = this.$element.attr('data-velocity');
        this.mypos = this.$element.attr('data-mypos');
        this.bgStart = parseInt(this.$element.attr('data-fit'), 10);

        $(document).scroll(function(){
            self.didScroll = true;
        });
        
        setInterval(function() {
            if (self.didScroll) {
                self.didScroll = false;
                self.scrolly();
            }
        }, 10);
    };

    Plugin.prototype.scrolly = function() {
        var dT =  $(window).scrollTop(),
            wH = $(window).height(),
            position = this.startPosition;

        if(this.offsetTop >= (dT+wH)) {
            this.$element.addClass('scrolly-invisible');
        } else {
            if(this.$element.hasClass('scrolly-invisible')){
                position = this.startPosition + (dT + ( wH - this.offsetTop ) ) * this.velocity;
            } else {
                position = this.startPosition + dT  * this.velocity;
            }
        }
        // Fix background position
        if(this.bgStart){ position = position + this.bgStart; }
        if(this.mypos){ mypos = this.mypos; }

        if(this.options.bgParallax === true) {
            this.$element.css({backgroundPosition: mypos + position+'px'});
        } else {
            this.$element.css({top: position});
        }
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
            }
        });
    };

})(jQuery, window, document);

// ============================== slick nav =================================================
/*!
    SlickNav Responsive Mobile Menu v1.0.1
    (c) 2014 Josh Cope
    licensed under MIT
*/
;(function(e,t,n){function o(t,n){this.element=t;this.settings=e.extend({},r,n);this._defaults=r;this._name=i;this.init()}var r={label:"MENU",duplicate:true,duration:200,easingOpen:"swing",easingClose:"swing",closedSymbol:"&#9658;",openedSymbol:"&#9660;",prependTo:"body",parentTag:"a",closeOnClick:false,allowParentLinks:false,nestedParentLinks:true,showChildren:false,init:function(){},open:function(){},close:function(){}},i="slicknav",s="slicknav";o.prototype.init=function(){var n=this,r=e(this.element),i=this.settings,o,u;if(i.duplicate){n.mobileNav=r.clone();n.mobileNav.removeAttr("id");n.mobileNav.find("*").each(function(t,n){e(n).removeAttr("id")})}else{n.mobileNav=r}o=s+"_icon";if(i.label===""){o+=" "+s+"_no-text"}if(i.parentTag=="a"){i.parentTag='a href="#"'}n.mobileNav.attr("class",s+"_nav");u=e('<div class="'+s+'_menu"></div>');n.btn=e(["<"+i.parentTag+' aria-haspopup="true" tabindex="0" class="'+s+"_btn "+s+'_collapsed">','<span class="'+s+'_menutxt">'+i.label+"</span>",'<span class="'+o+'">','<span class="'+s+'_icon-bar"></span>','<span class="'+s+'_icon-bar"></span>','<span class="'+s+'_icon-bar"></span>',"</span>","</"+i.parentTag+">"].join(""));e(u).append(n.btn);e(i.prependTo).prepend(u);u.append(n.mobileNav);var a=n.mobileNav.find("li");e(a).each(function(){var t=e(this),r={};r.children=t.children("ul").attr("role","menu");t.data("menu",r);if(r.children.length>0){var o=t.contents(),u=false;nodes=[];e(o).each(function(){if(!e(this).is("ul")){nodes.push(this)}else{return false}if(e(this).is("a")){u=true}});var a=e("<"+i.parentTag+' role="menuitem" aria-haspopup="true" tabindex="-1" class="'+s+'_item"/>');if(!i.allowParentLinks||i.nestedParentLinks||!u){var f=e(nodes).wrapAll(a).parent();f.addClass(s+"_row")}else e(nodes).wrapAll('<span class="'+s+"_parent-link "+s+'_row"/>').parent();t.addClass(s+"_collapsed");t.addClass(s+"_parent");var l=e('<span class="'+s+'_arrow">'+i.closedSymbol+"</span>");if(i.allowParentLinks&&!i.nestedParentLinks&&u)l=l.wrap(a).parent();e(nodes).last().after(l)}else if(t.children().length===0){t.addClass(s+"_txtnode")}t.children("a").attr("role","menuitem").click(function(t){if(i.closeOnClick&&!e(t.target).parent().closest("li").hasClass(s+"_parent")){e(n.btn).click()}});if(i.closeOnClick&&i.allowParentLinks){t.children("a").children("a").click(function(t){e(n.btn).click()});t.find("."+s+"_parent-link a:not(."+s+"_item)").click(function(t){e(n.btn).click()})}});e(a).each(function(){var t=e(this).data("menu");if(!i.showChildren){n._visibilityToggle(t.children,null,false,null,true)}});n._visibilityToggle(n.mobileNav,null,false,"init",true);n.mobileNav.attr("role","menu");e(t).mousedown(function(){n._outlines(false)});e(t).keyup(function(){n._outlines(true)});e(n.btn).click(function(e){e.preventDefault();n._menuToggle()});n.mobileNav.on("click","."+s+"_item",function(t){t.preventDefault();n._itemClick(e(this))});e(n.btn).keydown(function(e){var t=e||event;if(t.keyCode==13){e.preventDefault();n._menuToggle()}});n.mobileNav.on("keydown","."+s+"_item",function(t){var r=t||event;if(r.keyCode==13){t.preventDefault();n._itemClick(e(t.target))}});if(i.allowParentLinks&&i.nestedParentLinks){e("."+s+"_item a").click(function(e){e.stopImmediatePropagation()})}};o.prototype._menuToggle=function(e){var t=this;var n=t.btn;var r=t.mobileNav;if(n.hasClass(s+"_collapsed")){n.removeClass(s+"_collapsed");n.addClass(s+"_open")}else{n.removeClass(s+"_open");n.addClass(s+"_collapsed")}n.addClass(s+"_animating");t._visibilityToggle(r,n.parent(),true,n)};o.prototype._itemClick=function(e){var t=this;var n=t.settings;var r=e.data("menu");if(!r){r={};r.arrow=e.children("."+s+"_arrow");r.ul=e.next("ul");r.parent=e.parent();if(r.parent.hasClass(s+"_parent-link")){r.parent=e.parent().parent();r.ul=e.parent().next("ul")}e.data("menu",r)}if(r.parent.hasClass(s+"_collapsed")){r.arrow.html(n.openedSymbol);r.parent.removeClass(s+"_collapsed");r.parent.addClass(s+"_open");r.parent.addClass(s+"_animating");t._visibilityToggle(r.ul,r.parent,true,e)}else{r.arrow.html(n.closedSymbol);r.parent.addClass(s+"_collapsed");r.parent.removeClass(s+"_open");r.parent.addClass(s+"_animating");t._visibilityToggle(r.ul,r.parent,true,e)}};o.prototype._visibilityToggle=function(t,n,r,i,o){var u=this;var a=u.settings;var f=u._getActionItems(t);var l=0;if(r){l=a.duration}if(t.hasClass(s+"_hidden")){t.removeClass(s+"_hidden");t.slideDown(l,a.easingOpen,function(){e(i).removeClass(s+"_animating");e(n).removeClass(s+"_animating");if(!o){a.open(i)}});t.attr("aria-hidden","false");f.attr("tabindex","0");u._setVisAttr(t,false)}else{t.addClass(s+"_hidden");t.slideUp(l,this.settings.easingClose,function(){t.attr("aria-hidden","true");f.attr("tabindex","-1");u._setVisAttr(t,true);t.hide();e(i).removeClass(s+"_animating");e(n).removeClass(s+"_animating");if(!o){a.close(i)}else if(i=="init"){a.init()}})}};o.prototype._setVisAttr=function(t,n){var r=this;var i=t.children("li").children("ul").not("."+s+"_hidden");if(!n){i.each(function(){var t=e(this);t.attr("aria-hidden","false");var i=r._getActionItems(t);i.attr("tabindex","0");r._setVisAttr(t,n)})}else{i.each(function(){var t=e(this);t.attr("aria-hidden","true");var i=r._getActionItems(t);i.attr("tabindex","-1");r._setVisAttr(t,n)})}};o.prototype._getActionItems=function(e){var t=e.data("menu");if(!t){t={};var n=e.children("li");var r=n.find("a");t.links=r.add(n.find("."+s+"_item"));e.data("menu",t)}return t.links};o.prototype._outlines=function(t){if(!t){e("."+s+"_item, ."+s+"_btn").css("outline","none")}else{e("."+s+"_item, ."+s+"_btn").css("outline","")}};o.prototype.toggle=function(){var e=this;e._menuToggle()};o.prototype.open=function(){var e=this;if(e.btn.hasClass(s+"_collapsed")){e._menuToggle()}};o.prototype.close=function(){var e=this;if(e.btn.hasClass(s+"_open")){e._menuToggle()}};e.fn[i]=function(t){var n=arguments;if(t===undefined||typeof t==="object"){return this.each(function(){if(!e.data(this,"plugin_"+i)){e.data(this,"plugin_"+i,new o(this,t))}})}else if(typeof t==="string"&&t[0]!=="_"&&t!=="init"){var r;this.each(function(){var s=e.data(this,"plugin_"+i);if(s instanceof o&&typeof s[t]==="function"){r=s[t].apply(s,Array.prototype.slice.call(n,1))}});return r!==undefined?r:this}}})(jQuery,document,window)

// ==============================morphtext====================================================
/*!
 * Morphext v2.0.0 - Text Rotating Plugin for jQuery
 * https://github.com/MrSaints/Morphext
 *
 * Built on jQuery Boilerplate
 * http://jqueryboilerplate.com/
 *
 * Copyright 2013 Ian Lai and other contributors
 * Released under the MIT license
 * http://ian.mit-license.org/
 */
;(function ($, window, document, undefined) {
    var pluginName = "Morphext",
        defaults = {
            animation: "bounceIn",
            separator: ",",
            speed: 2000
        };

    function Plugin (element, options) {
        this.element = $(element);

        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var $that = this;
            this.phrases = [];

            this.element.addClass('morphext');

            $.each(this.element.text().split(this.settings.separator), function (key, value) {
                $that.phrases.push(value);
            });

            this.element.html("<span>" + this.phrases.join('</span><span>') + "</span>");

            this.index = -1;
            this.animate();

            setInterval(function () {
                $that.animate();
            }, this.settings.speed);
        },
        animate: function () {
            if ((this.index + 1) === this.phrases.length)
                this.index = -1;

            ++this.index;

            this.element.find('span').removeClass().eq(this.index).addClass('animated ' + this.settings.animation);
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);

// =========================== owl carousel==========================================================
/*
 *  jQuery OwlCarousel v1.3.2
 *
 *  Copyright (c) 2013 Bartosz Wojciechowski
 *  http://www.owlgraphic.com/owlcarousel/
 *
 *  Licensed under MIT
 *
 */

/*JS Lint helpers: */
/*global dragMove: false, dragEnd: false, $, jQuery, alert, window, document */
/*jslint nomen: true, continue:true */

if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function ($, window, document) {

    var Carousel = {
        init : function (options, el) {
            var base = this;

            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

            base.userOptions = options;
            base.loadContent();
        },

        loadContent : function () {
            var base = this, url;

            function getData(data) {
                var i, content = "";
                if (typeof base.options.jsonSuccess === "function") {
                    base.options.jsonSuccess.apply(this, [data]);
                } else {
                    for (i in data.owl) {
                        if (data.owl.hasOwnProperty(i)) {
                            content += data.owl[i].item;
                        }
                    }
                    base.$elem.html(content);
                }
                base.logIn();
            }

            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }

            if (typeof base.options.jsonPath === "string") {
                url = base.options.jsonPath;
                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        },

        logIn : function () {
            var base = this;

            base.$elem.data("owl-originalStyles", base.$elem.attr("style"))
                      .data("owl-originalClasses", base.$elem.attr("class"));

            base.$elem.css({opacity: 0});
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible = null;
            base.setVars();
        },

        setVars : function () {
            var base = this;
            if (base.$elem.children().length === 0) {return false; }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        },

        onStartup : function () {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();

            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();

            base.$elem.find(".owl-wrapper").css("display", "block");

            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        },

        eachMoveUpdate : function () {
            var base = this;

            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();

            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        },

        updateVars : function () {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        },

        reload : function () {
            var base = this;
            window.setTimeout(function () {
                base.updateVars();
            }, 0);
        },

        watchVisibility : function () {
            var base = this;

            if (base.$elem.is(":visible") === false) {
                base.$elem.css({opacity: 0});
                window.clearInterval(base.autoPlayInterval);
                window.clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = window.setInterval(function () {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({opacity: 1}, 200);
                    window.clearInterval(base.checkVisible);
                }
            }, 500);
        },

        wrapItems : function () {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        },

        baseClass : function () {
            var base = this,
                hasBaseClass = base.$elem.hasClass(base.options.baseClass),
                hasThemeClass = base.$elem.hasClass(base.options.theme);

            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }

            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        },

        updateItems : function () {
            var base = this, width, i;

            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }

            width = $(base.options.responsiveBaseWidth).width();

            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (base.options.itemsCustom !== false) {
                //Reorder array by screen size
                base.options.itemsCustom.sort(function (a, b) {return a[0] - b[0]; });

                for (i = 0; i < base.options.itemsCustom.length; i += 1) {
                    if (base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }

            } else {

                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }

                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }

                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }

                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }

                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }

            //if number of items is less than declared
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        },

        response : function () {
            var base = this,
                smallDelay,
                lastWindowWidth;

            if (base.options.responsive !== true) {
                return false;
            }
            lastWindowWidth = $(window).width();

            base.resizer = function () {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        window.clearInterval(base.autoPlayInterval);
                    }
                    window.clearTimeout(smallDelay);
                    smallDelay = window.setTimeout(function () {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            };
            $(window).resize(base.resizer);
        },

        updatePosition : function () {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        },

        appendItemsSizes : function () {
            var base = this,
                roundPages = 0,
                lastItem = base.itemsAmount - base.options.items;

            base.$owlItems.each(function (index) {
                var $this = $(this);
                $this
                    .css({"width": base.itemWidth})
                    .data("owl-item", Number(index));

                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages);
            });
        },

        appendWrapperSizes : function () {
            var base = this,
                width = base.$owlItems.length * base.itemWidth;

            base.$owlWrapper.css({
                "width": width * 2,
                "left": 0
            });
            base.appendItemsSizes();
        },

        calculateAll : function () {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        },

        calculateWidth : function () {
            var base = this;
            base.itemWidth = Math.round(base.$elem.width() / base.options.items);
        },

        max : function () {
            var base = this,
                maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0;
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        },

        min : function () {
            return 0;
        },

        loops : function () {
            var base = this,
                prev = 0,
                elWidth = 0,
                i,
                item,
                roundPageNum;

            base.positionsInArray = [0];
            base.pagesInArray = [];

            for (i = 0; i < base.itemsAmount; i += 1) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);

                if (base.options.scrollPerPage === true) {
                    item = $(base.$owlItems[i]);
                    roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        },

        buildControls : function () {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        },

        buildButtons : function () {
            var base = this,
                buttonsWrapper = $("<div class=\"owl-buttons\"/>");
            base.owlControls.append(buttonsWrapper);

            base.buttonPrev = $("<div/>", {
                "class" : "owl-prev",
                "html" : base.options.navigationText[0] || ""
            });

            base.buttonNext = $("<div/>", {
                "class" : "owl-next",
                "html" : base.options.navigationText[1] || ""
            });

            buttonsWrapper
                .append(base.buttonPrev)
                .append(base.buttonNext);

            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
            });

            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            });
        },

        buildPagination : function () {
            var base = this;

            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);

            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        },

        updatePagination : function () {
            var base = this,
                counter,
                lastPage,
                lastItem,
                i,
                paginationButton,
                paginationButtonInner;

            if (base.options.pagination === false) {
                return false;
            }

            base.paginationWrapper.html("");

            counter = 0;
            lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

            for (i = 0; i < base.itemsAmount; i += 1) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        lastItem = base.itemsAmount - base.options.items;
                    }
                    paginationButton = $("<div/>", {
                        "class" : "owl-page"
                    });
                    paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);

                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);

                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        },
        checkPagination : function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function () {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper
                        .find(".owl-page")
                        .removeClass("active");
                    $(this).addClass("active");
                }
            });
        },

        checkNavigation : function () {
            var base = this;

            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        },

        updateControls : function () {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        },

        destroyControls : function () {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        },

        next : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        prev : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0;
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind";
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        goTo : function (position, speed, drag) {
            var base = this,
                goToPixel;

            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }

            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0);
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            goToPixel = base.positionsInArray[position];

            if (base.browser.support3d === true) {
                base.isCss3Finish = false;

                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);

                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);

                } else {
                    base.swapSpeed("slideSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        },

        jumpTo : function (position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0);
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        },

        afterGo : function () {
            var base = this;

            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0);

            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();

                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        },

        stop : function () {
            var base = this;
            base.apStatus = "stop";
            window.clearInterval(base.autoPlayInterval);
        },

        checkAp : function () {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        },

        play : function () {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            window.clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = window.setInterval(function () {
                base.next(true);
            }, base.options.autoPlay);
        },

        swapSpeed : function (action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        },

        addCssSpeed : function (speed) {
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        },

        removeTransition : function () {
            return {
                "-webkit-transition": "",
                "-moz-transition": "",
                "-o-transition": "",
                "transition": ""
            };
        },

        doTranslate : function (pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        },

        transition3d : function (value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        },

        css2move : function (value) {
            var base = this;
            base.$owlWrapper.css({"left" : value});
        },

        css2slide : function (value, speed) {
            var base = this;

            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({
                "left" : value
            }, {
                duration : speed || base.options.slideSpeed,
                complete : function () {
                    base.isCssFinish = true;
                }
            });
        },

        checkBrowser : function () {
            var base = this,
                translate3D = "translate3d(0px, 0px, 0px)",
                tempElem = document.createElement("div"),
                regex,
                asSupport,
                support3d,
                isTouch;

            tempElem.style.cssText = "  -moz-transform:" + translate3D +
                                  "; -ms-transform:"     + translate3D +
                                  "; -o-transform:"      + translate3D +
                                  "; -webkit-transform:" + translate3D +
                                  "; transform:"         + translate3D;
            regex = /translate3d\(0px, 0px, 0px\)/g;
            asSupport = tempElem.style.cssText.match(regex);
            support3d = (asSupport !== null && asSupport.length === 1);

            isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

            base.browser = {
                "support3d" : support3d,
                "isTouch" : isTouch
            };
        },

        moveEvents : function () {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        },

        eventTypes : function () {
            var base = this,
                types = ["s", "e", "x"];

            base.ev_types = {};

            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl mousedown.owl",
                    "touchmove.owl mousemove.owl",
                    "touchend.owl touchcancel.owl mouseup.owl"
                ];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl",
                    "touchmove.owl",
                    "touchend.owl touchcancel.owl"
                ];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = [
                    "mousedown.owl",
                    "mousemove.owl",
                    "mouseup.owl"
                ];
            }

            base.ev_types.start = types[0];
            base.ev_types.move = types[1];
            base.ev_types.end = types[2];
        },

        disabledEvents :  function () {
            var base = this;
            base.$elem.on("dragstart.owl", function (event) { event.preventDefault(); });
            base.$elem.on("mousedown.disableTextSelect", function (e) {
                return $(e.target).is('input, textarea, select, option');
            });
        },

        gestures : function () {
            /*jslint unparam: true*/
            var base = this,
                locals = {
                    offsetX : 0,
                    offsetY : 0,
                    baseElWidth : 0,
                    relativePos : 0,
                    position: null,
                    minSwipe : null,
                    maxSwipe: null,
                    sliding : null,
                    dargging: null,
                    targetElement : null
                };

            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x : event.touches[0].pageX,
                        y : event.touches[0].pageY
                    };
                }

                if (event.touches === undefined) {
                    if (event.pageX !== undefined) {
                        return {
                            x : event.pageX,
                            y : event.pageY
                        };
                    }
                    if (event.pageX === undefined) {
                        return {
                            x : event.clientX,
                            y : event.clientY
                        };
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types.move, dragMove);
                    $(document).on(base.ev_types.end, dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types.move);
                    $(document).off(base.ev_types.end);
                }
            }

            function dragStart(event) {
                var ev = event.originalEvent || event || window.event,
                    position;

                if (ev.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }

                if (base.options.autoPlay !== false) {
                    window.clearInterval(base.autoPlayInterval);
                }

                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing");
                }

                base.newPosX = 0;
                base.newRelativeX = 0;

                $(this).css(base.removeTransition());

                position = $(this).position();
                locals.relativePos = position.left;

                locals.offsetX = getTouches(ev).x - position.left;
                locals.offsetY = getTouches(ev).y - position.top;

                swapEvents("on");

                locals.sliding = false;
                locals.targetElement = ev.target || ev.srcElement;
            }

            function dragMove(event) {
                var ev = event.originalEvent || event || window.event,
                    minSwipe,
                    maxSwipe;

                base.newPosX = getTouches(ev).x - locals.offsetX;
                base.newPosY = getTouches(ev).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;

                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }

                if ((base.newRelativeX > 8 || base.newRelativeX < -8) && (base.browser.isTouch === true)) {
                    if (ev.preventDefault !== undefined) {
                        ev.preventDefault();
                    } else {
                        ev.returnValue = false;
                    }
                    locals.sliding = true;
                }

                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }

                minSwipe = function () {
                    return base.newRelativeX / 5;
                };

                maxSwipe = function () {
                    return base.maximumPixels + base.newRelativeX / 5;
                };

                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var ev = event.originalEvent || event || window.event,
                    newPosition,
                    handlers,
                    owlStopEvent;

                ev.target = ev.target || ev.srcElement;

                locals.dragging = false;

                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }

                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left";
                } else {
                    base.dragDirection = base.owl.dragDirection = "right";
                }

                if (base.newRelativeX !== 0) {
                    newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
                        $(ev.target).on("click.disable", function (ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(ev.target).off("click.disable");
                        });
                        handlers = $._data(ev.target, "events").click;
                        owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }
            base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
        },

        getNewPosition : function () {
            var base = this,
                newPosition = base.closestItem();

            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition  = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        },
        closestItem : function () {
            var base = this,
                array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX,
                closest = null;

            $.each(array, function (i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                } else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        },

        moveDirection : function () {
            var base = this,
                direction;
            if (base.newRelativeX < 0) {
                direction = "right";
                base.playDirection = "next";
            } else {
                direction = "left";
                base.playDirection = "prev";
            }
            return direction;
        },

        customEvents : function () {
            /*jslint unparam: true*/
            var base = this;
            base.$elem.on("owl.next", function () {
                base.next();
            });
            base.$elem.on("owl.prev", function () {
                base.prev();
            });
            base.$elem.on("owl.play", function (event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function () {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function (event, item) {
                base.goTo(item);
            });
            base.$elem.on("owl.jumpTo", function (event, item) {
                base.jumpTo(item);
            });
        },

        stopOnHover : function () {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function () {
                    base.stop();
                });
                base.$elem.on("mouseout", function () {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        },

        lazyLoad : function () {
            var base = this,
                i,
                $item,
                itemNumber,
                $lazyImg,
                follow;

            if (base.options.lazyLoad === false) {
                return false;
            }
            for (i = 0; i < base.itemsAmount; i += 1) {
                $item = $(base.$owlItems[i]);

                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }

                itemNumber = $item.data("owl-item");
                $lazyImg = $item.find(".lazyOwl");

                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    base.lazyPreload($item, $lazyImg);
                }
            }
        },

        lazyPreload : function ($item, $lazyImg) {
            var base = this,
                iterations = 0,
                isBackgroundImg;

            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                if (base.options.lazyEffect === "fade") {
                    $lazyImg.fadeIn(400);
                } else {
                    $lazyImg.show();
                }
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) {//if image loads in less than 10 seconds 
                    window.setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            checkLazyImage();
        },

        autoHeight : function () {
            var base = this,
                $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
                iterations;

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    window.setTimeout(function () {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", ""); //Else remove height attribute
                }
            }

            if ($currentimg.get(0) !== undefined) {
                iterations = 0;
                checkImage();
            } else {
                addHeight();
            }
        },

        completeImg : function (img) {
            var naturalWidthType;

            if (!img.complete) {
                return false;
            }
            naturalWidthType = typeof img.naturalWidth;
            if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
                return false;
            }
            return true;
        },

        onVisibleItems : function () {
            var base = this,
                i;

            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
                base.visibleItems.push(i);

                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        },

        transitionTypes : function (className) {
            var base = this;
            //Currently available: "fade", "backSlide", "goDown", "fadeUp"
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        },

        singleItemTransition : function () {
            var base = this,
                outClass = base.outClass,
                inClass = base.inClass,
                $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
                animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

            base.isTransition = true;

            base.$owlWrapper
                .addClass('owl-origin')
                .css({
                    "-webkit-transform-origin" : origin + "px",
                    "-moz-perspective-origin" : origin + "px",
                    "perspective-origin" : origin + "px"
                });
            function transStyles(prevPos) {
                return {
                    "position" : "relative",
                    "left" : prevPos + "px"
                };
            }

            $prevItem
                .css(transStyles(prevPos, 10))
                .addClass(outClass)
                .on(animEnd, function () {
                    base.endPrev = true;
                    $prevItem.off(animEnd);
                    base.clearTransStyle($prevItem, outClass);
                });

            $currentItem
                .addClass(inClass)
                .on(animEnd, function () {
                    base.endCurrent = true;
                    $currentItem.off(animEnd);
                    base.clearTransStyle($currentItem, inClass);
                });
        },

        clearTransStyle : function (item, classToRemove) {
            var base = this;
            item.css({
                "position" : "",
                "left" : ""
            }).removeClass(classToRemove);

            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        },

        owlStatus : function () {
            var base = this;
            base.owl = {
                "userOptions"   : base.userOptions,
                "baseElement"   : base.$elem,
                "userItems"     : base.$userItems,
                "owlItems"      : base.$owlItems,
                "currentItem"   : base.currentItem,
                "prevItem"      : base.prevItem,
                "visibleItems"  : base.visibleItems,
                "isTouch"       : base.browser.isTouch,
                "browser"       : base.browser,
                "dragDirection" : base.dragDirection
            };
        },

        clearEvents : function () {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        },

        unWrap : function () {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem
                .attr("style", base.$elem.data("owl-originalStyles") || "")
                .attr("class", base.$elem.data("owl-originalClasses"));
        },

        destroy : function () {
            var base = this;
            base.stop();
            window.clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        },

        reinit : function (newOptions) {
            var base = this,
                options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        },

        addItem : function (htmlString, targetPosition) {
            var base = this,
                position;

            if (!htmlString) {return false; }

            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString);
            } else {
                base.$userItems.eq(position).before(htmlString);
            }

            base.setVars();
        },

        removeItem : function (targetPosition) {
            var base = this,
                position;

            if (base.$elem.children().length === 0) {
                return false;
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }

            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }

    };

    $.fn.owlCarousel = function (options) {
        return this.each(function () {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };

    $.fn.owlCarousel.options = {

        items : 5,
        itemsCustom : false,
        itemsDesktop : [1199, 4],
        itemsDesktopSmall : [979, 3],
        itemsTablet : [768, 2],
        itemsTabletSmall : false,
        itemsMobile : [479, 1],
        singleItem : false,
        itemsScaleUp : false,

        slideSpeed : 200,
        paginationSpeed : 800,
        rewindSpeed : 1000,

        autoPlay : false,
        stopOnHover : false,

        navigation : false,
        navigationText : ["prev", "next"],
        rewindNav : true,
        scrollPerPage : false,

        pagination : true,
        paginationNumbers : false,

        responsive : true,
        responsiveRefreshRate : 200,
        responsiveBaseWidth : window,

        baseClass : "owl-carousel",
        theme : "owl-theme",

        lazyLoad : false,
        lazyFollow : true,
        lazyEffect : "fade",

        autoHeight : false,

        jsonPath : false,
        jsonSuccess : false,

        dragBeforeAnimFinish : true,
        mouseDrag : true,
        touchDrag : true,

        addClassActive : false,
        transitionStyle : false,

        beforeUpdate : false,
        afterUpdate : false,
        beforeInit : false,
        afterInit : false,
        beforeMove : false,
        afterMove : false,
        afterAction : false,
        startDragging : false,
        afterLazyLoad: false
    };
}(jQuery, window, document));

// =============================== retina =======================================================
/*!
 * Retina.js v1.3.0
 *
 * Copyright 2014 Imulus, LLC
 * Released under the MIT license
 *
 * Retina.js is an open source script that makes it easy to serve
 * high-resolution images to devices with retina displays.
 */

(function() {
    var root = (typeof exports === 'undefined' ? window : exports);
    var config = {
        // An option to choose a suffix for 2x images
        retinaImageSuffix : '@2x',

        // Ensure Content-Type is an image before trying to load @2x image
        // https://github.com/imulus/retinajs/pull/45)
        check_mime_type: true,

        // Resize high-resolution images to original image's pixel dimensions
        // https://github.com/imulus/retinajs/issues/8
        force_original_dimensions: true
    };

    function Retina() {}

    root.Retina = Retina;

    Retina.configure = function(options) {
        if (options === null) {
            options = {};
        }

        for (var prop in options) {
            if (options.hasOwnProperty(prop)) {
                config[prop] = options[prop];
            }
        }
    };

    Retina.init = function(context) {
        if (context === null) {
            context = root;
        }

        var existing_onload = context.onload || function(){};

        context.onload = function() {
            var images = document.getElementsByTagName('img'), retinaImages = [], i, image;
            for (i = 0; i < images.length; i += 1) {
                image = images[i];
                if (!!!image.getAttributeNode('data-no-retina')) {
                    retinaImages.push(new RetinaImage(image));
                }
            }
            existing_onload();
        };
    };

    Retina.isRetina = function(){
        var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';

        if (root.devicePixelRatio > 1) {
            return true;
        }

        if (root.matchMedia && root.matchMedia(mediaQuery).matches) {
            return true;
        }

        return false;
    };


    var regexMatch = /\.\w+$/;
    function suffixReplace (match) {
        return config.retinaImageSuffix + match;
    }

    function RetinaImagePath(path, at_2x_path) {
        this.path = path || '';
        if (typeof at_2x_path !== 'undefined' && at_2x_path !== null) {
            this.at_2x_path = at_2x_path;
            this.perform_check = false;
        } else {
            if (undefined !== document.createElement) {
                var locationObject = document.createElement('a');
                locationObject.href = this.path;
                locationObject.pathname = locationObject.pathname.replace(regexMatch, suffixReplace);
                this.at_2x_path = locationObject.href;
            } else {
                var parts = this.path.split('?');
                parts[0] = parts[0].replace(regexMatch, suffixReplace);
                this.at_2x_path = parts.join('?');
            }
            this.perform_check = true;
        }
    }

    root.RetinaImagePath = RetinaImagePath;

    RetinaImagePath.confirmed_paths = [];

    RetinaImagePath.prototype.is_external = function() {
        return !!(this.path.match(/^https?\:/i) && !this.path.match('//' + document.domain) );
    };

    RetinaImagePath.prototype.check_2x_variant = function(callback) {
        var http, that = this;
        if (this.is_external()) {
            return callback(false);
        } else if (!this.perform_check && typeof this.at_2x_path !== 'undefined' && this.at_2x_path !== null) {
            return callback(true);
        } else if (this.at_2x_path in RetinaImagePath.confirmed_paths) {
            return callback(true);
        } else {
            http = new XMLHttpRequest();
            http.open('HEAD', this.at_2x_path);
            http.onreadystatechange = function() {
                if (http.readyState !== 4) {
                    return callback(false);
                }

                if (http.status >= 200 && http.status <= 399) {
                    if (config.check_mime_type) {
                        var type = http.getResponseHeader('Content-Type');
                        if (type === null || !type.match(/^image/i)) {
                            return callback(false);
                        }
                    }

                    RetinaImagePath.confirmed_paths.push(that.at_2x_path);
                    return callback(true);
                } else {
                    return callback(false);
                }
            };
            http.send();
        }
    };


    function RetinaImage(el) {
        this.el = el;
        this.path = new RetinaImagePath(this.el.getAttribute('src'), this.el.getAttribute('data-at2x'));
        var that = this;
        this.path.check_2x_variant(function(hasVariant) {
            if (hasVariant) {
                that.swap();
            }
        });
    }

    root.RetinaImage = RetinaImage;

    RetinaImage.prototype.swap = function(path) {
        if (typeof path === 'undefined') {
            path = this.path.at_2x_path;
        }

        var that = this;
        function load() {
            if (! that.el.complete) {
                setTimeout(load, 5);
            } else {
                if (config.force_original_dimensions) {
                    that.el.setAttribute('width', that.el.offsetWidth);
                    that.el.setAttribute('height', that.el.offsetHeight);
                }

                that.el.setAttribute('src', path);
            }
        }
        load();
    };


    if (Retina.isRetina()) {
        Retina.init(root);
    }
})();

// ======================================scroll===============================================
//SMOOTH TOP DOWN SCROLLING

//Mobile Only Navigation Scroll
function moveTo(contentArea){
            var goPosition = $(contentArea).offset().top;
            $('html,body').animate({ scrollTop: goPosition}, 'slow');
        }


//Desktop Navigation Scroll
$(document).ready(function() {

    $(".scroll-link").click(function() {
    	var ScrollOffset = $(this).attr('data-soffset');
    	//alert(ScrollOffset);
        $("html, body").animate({
            scrollTop: $($(this).attr("href")).offset().top-ScrollOffset + "px"
        }, {
            duration: 1500,
            easing: "swing"
        });
        return false;
    });

});

// ======================smooth scroll========================================================
/** smooth-scroll v5.2.0, by Chris Ferdinandi | http://github.com/cferdinandi/smooth-scroll | Licensed under MIT: http://gomakethings.com/mit/ */
!function(t,e){"function"==typeof define&&define.amd?define("smoothScroll",e(t)):"object"==typeof exports?module.exports=e(t):t.smoothScroll=e(t)}(window||this,function(t){"use strict";var e,n={},o=!!document.querySelector&&!!t.addEventListener,r={speed:500,easing:"easeInOutCubic",offset:0,updateURL:!0,callbackBefore:function(){},callbackAfter:function(){}},a=function(t,e,n){if("[object Object]"===Object.prototype.toString.call(t))for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&e.call(n,t[o],o,t);else for(var r=0,a=t.length;a>r;r++)e.call(n,t[r],r,t)},c=function(t,e){var n={};return a(t,function(e,o){n[o]=t[o]}),a(e,function(t,o){n[o]=e[o]}),n},u=function(t,e){for(var n=e.charAt(0);t&&t!==document;t=t.parentNode)if("."===n){if(t.classList.contains(e.substr(1)))return t}else if("#"===n){if(t.id===e.substr(1))return t}else if("["===n&&t.hasAttribute(e.substr(1,e.length-2)))return t;return!1},i=function(t){for(var e,n=String(t),o=n.length,r=-1,a="",c=n.charCodeAt(0);++r<o;){if(e=n.charCodeAt(r),0===e)throw new InvalidCharacterError("Invalid character: the input contains U+0000.");a+=e>=1&&31>=e||127==e||0===r&&e>=48&&57>=e||1===r&&e>=48&&57>=e&&45===c?"\\"+e.toString(16)+" ":e>=128||45===e||95===e||e>=48&&57>=e||e>=65&&90>=e||e>=97&&122>=e?n.charAt(r):"\\"+n.charAt(r)}return a},s=function(t,e){var n;return"easeInQuad"===t&&(n=e*e),"easeOutQuad"===t&&(n=e*(2-e)),"easeInOutQuad"===t&&(n=.5>e?2*e*e:-1+(4-2*e)*e),"easeInCubic"===t&&(n=e*e*e),"easeOutCubic"===t&&(n=--e*e*e+1),"easeInOutCubic"===t&&(n=.5>e?4*e*e*e:(e-1)*(2*e-2)*(2*e-2)+1),"easeInQuart"===t&&(n=e*e*e*e),"easeOutQuart"===t&&(n=1- --e*e*e*e),"easeInOutQuart"===t&&(n=.5>e?8*e*e*e*e:1-8*--e*e*e*e),"easeInQuint"===t&&(n=e*e*e*e*e),"easeOutQuint"===t&&(n=1+--e*e*e*e*e),"easeInOutQuint"===t&&(n=.5>e?16*e*e*e*e*e:1+16*--e*e*e*e*e),n||e},f=function(t,e,n){var o=0;if(t.offsetParent)do o+=t.offsetTop,t=t.offsetParent;while(t);return o=o-e-n,o>=0?o:0},l=function(){return Math.max(document.body.scrollHeight,document.documentElement.scrollHeight,document.body.offsetHeight,document.documentElement.offsetHeight,document.body.clientHeight,document.documentElement.clientHeight)},d=function(t){return t&&"object"==typeof JSON&&"function"==typeof JSON.parse?JSON.parse(t):{}},h=function(t,e){history.pushState&&(e||"true"===e)&&history.pushState({pos:t.id},"",window.location.pathname+t)};n.animateScroll=function(e,n,o){var a=c(a||r,o||{}),u=d(e?e.getAttribute("data-options"):null);a=c(a,u),n="#"+i(n.substr(1));var p,m,b,v=document.querySelector(n),g=document.querySelector("[data-scroll-header]"),O=null===g?0:g.offsetHeight+g.offsetTop,y=t.pageYOffset,I=f(v,O,parseInt(a.offset,10)),S=I-y,w=l(),A=0;h(n,a.updateURL);var Q=function(o,r,c){var u=t.pageYOffset;(o==r||u==r||t.innerHeight+u>=w)&&(clearInterval(c),v.focus(),a.callbackAfter(e,n))},C=function(){A+=16,m=A/parseInt(a.speed,10),m=m>1?1:m,b=y+S*s(a.easing,m),t.scrollTo(0,Math.floor(b)),Q(b,I,p)},H=function(){a.callbackBefore(e,n),p=setInterval(C,16)};0===t.pageYOffset&&t.scrollTo(0,0),H()};var p=function(t){var o=u(t.target,"[data-scroll]");o&&"a"===o.tagName.toLowerCase()&&(t.preventDefault(),n.animateScroll(o,o.hash,e,t))};return n.destroy=function(){e&&(document.removeEventListener("click",p,!1),e=null)},n.init=function(t){o&&(n.destroy(),e=c(r,t||{}),document.addEventListener("click",p,!1))},n});

// ============================superslides=====================================================
/*! Superslides - v0.6.2 - 2013-07-10
* https://github.com/nicinabox/superslides
* Copyright (c) 2013 Nic Aitch; Licensed MIT */
(function(i,t){var n,e="superslides";n=function(n,e){this.options=t.extend({play:!1,animation_speed:600,animation_easing:"swing",animation:"slide",inherit_width_from:i,inherit_height_from:i,pagination:!0,hashchange:!1,scrollable:!0,elements:{preserve:".preserve",nav:".slides-navigation",container:".slides-container",pagination:".slides-pagination"}},e);var s=this,o=t("<div>",{"class":"slides-control"}),a=1;this.$el=t(n),this.$container=this.$el.find(this.options.elements.container);var r=function(){return a=s._findMultiplier(),s.$el.on("click",s.options.elements.nav+" a",function(i){i.preventDefault(),s.stop(),t(this).hasClass("s-next")?s.animate("s-next",function(){s.start()}):s.animate("s-prev",function(){s.start()})}),t(document).on("keyup",function(i){37===i.keyCode&&s.animate("s-prev"),39===i.keyCode&&s.animate("s-next")}),t(i).on("resize",function(){setTimeout(function(){var i=s.$container.children();s.width=s._findWidth(),s.height=s._findHeight(),i.css({width:s.width,left:s.width}),s.css.containers(),s.css.images()},10)}),t(i).on("hashchange",function(){var i,t=s._parseHash();i=t&&!isNaN(t)?s._upcomingSlide(t-1):s._upcomingSlide(t),i>=0&&i!==s.current&&s.animate(i)}),s.pagination._events(),s.start(),s},h={containers:function(){s.init?(s.$el.css({height:s.height}),s.$control.css({width:s.width*a,left:-s.width}),s.$container.css({})):(t("body").css({margin:0}),s.$el.css({position:"relative",overflow:"hidden",width:"100%",height:s.height}),s.$control.css({position:"relative",transform:"translate3d(0)",height:"100%",width:s.width*a,left:-s.width}),s.$container.css({display:"none",margin:"0",padding:"0",listStyle:"none",position:"relative",height:"100%"})),1===s.size()&&s.$el.find(s.options.elements.nav).hide()},images:function(){var i=s.$container.find("img").not(s.options.elements.preserve);i.removeAttr("width").removeAttr("height").css({"-webkit-backface-visibility":"hidden","-ms-interpolation-mode":"bicubic",position:"absolute",left:"0",top:"0","z-index":"-1","max-width":"none"}),i.each(function(){var i=s.image._aspectRatio(this),n=this;if(t.data(this,"processed"))s.image._scale(n,i),s.image._center(n,i);else{var e=new Image;e.onload=function(){s.image._scale(n,i),s.image._center(n,i),t.data(n,"processed",!0)},e.src=this.src}})},children:function(){var i=s.$container.children();i.is("img")&&(i.each(function(){if(t(this).is("img")){t(this).wrap("<div>");var i=t(this).attr("id");t(this).removeAttr("id"),t(this).parent().attr("id",i)}}),i=s.$container.children()),s.init||i.css({display:"none",left:2*s.width}),i.css({position:"absolute",overflow:"hidden",height:"100%",width:s.width,top:0,zIndex:0})}},c={slide:function(i,t){var n=s.$container.children(),e=n.eq(i.upcoming_slide);e.css({left:i.upcoming_position,display:"block"}),s.$control.animate({left:i.offset},s.options.animation_speed,s.options.animation_easing,function(){s.size()>1&&(s.$control.css({left:-s.width}),n.eq(i.upcoming_slide).css({left:s.width,zIndex:2}),i.outgoing_slide>=0&&n.eq(i.outgoing_slide).css({left:s.width,display:"none",zIndex:0})),t()})},fade:function(i,t){var n=this,e=n.$container.children(),s=e.eq(i.outgoing_slide),o=e.eq(i.upcoming_slide);o.css({left:this.width,opacity:1,display:"block"}),i.outgoing_slide>=0?s.animate({opacity:0},n.options.animation_speed,n.options.animation_easing,function(){n.size()>1&&(e.eq(i.upcoming_slide).css({zIndex:2}),i.outgoing_slide>=0&&e.eq(i.outgoing_slide).css({opacity:1,display:"none",zIndex:0})),t()}):(o.css({zIndex:2}),t())}};c=t.extend(c,t.fn.superslides.fx);var d={_centerY:function(i){var n=t(i);n.css({top:(s.height-n.height())/2})},_centerX:function(i){var n=t(i);n.css({left:(s.width-n.width())/2})},_center:function(i){s.image._centerX(i),s.image._centerY(i)},_aspectRatio:function(i){if(!i.naturalHeight&&!i.naturalWidth){var t=new Image;t.src=i.src,i.naturalHeight=t.height,i.naturalWidth=t.width}return i.naturalHeight/i.naturalWidth},_scale:function(i,n){n=n||s.image._aspectRatio(i);var e=s.height/s.width,o=t(i);e>n?o.css({height:s.height,width:s.height/n}):o.css({height:s.width*n,width:s.width})}},l={_setCurrent:function(i){if(s.$pagination){var t=s.$pagination.children();t.removeClass("current"),t.eq(i).addClass("current")}},_addItem:function(i){var n=i+1,e=n,o=s.$container.children().eq(i),a=o.attr("id");a&&(e=a);var r=t("<a>",{href:"#"+e,text:e});r.appendTo(s.$pagination)},_setup:function(){if(s.options.pagination&&1!==s.size()){var i=t("<nav>",{"class":s.options.elements.pagination.replace(/^\./,"")});s.$pagination=i.appendTo(s.$el);for(var n=0;s.size()>n;n++)s.pagination._addItem(n)}},_events:function(){s.$el.on("click",s.options.elements.pagination+" a",function(i){i.preventDefault();var t=s._parseHash(this.hash),n=s._upcomingSlide(t-1);n!==s.current&&s.animate(n,function(){s.start()})})}};return this.css=h,this.image=d,this.pagination=l,this.fx=c,this.animation=this.fx[this.options.animation],this.$control=this.$container.wrap(o).parent(".slides-control"),s._findPositions(),s.width=s._findWidth(),s.height=s._findHeight(),this.css.children(),this.css.containers(),this.css.images(),this.pagination._setup(),r()},n.prototype={_findWidth:function(){return t(this.options.inherit_width_from).width()},_findHeight:function(){return t(this.options.inherit_height_from).height()},_findMultiplier:function(){return 1===this.size()?1:3},_upcomingSlide:function(i){if(/s-next/.test(i))return this._nextInDom();if(/s-prev/.test(i))return this._prevInDom();if(/\d/.test(i))return+i;if(i&&/\w/.test(i)){var t=this._findSlideById(i);return t>=0?t:0}return 0},_findSlideById:function(i){return this.$container.find("#"+i).index()},_findPositions:function(i,t){t=t||this,void 0===i&&(i=-1),t.current=i,t.next=t._nextInDom(),t.prev=t._prevInDom()},_nextInDom:function(){var i=this.current+1;return i===this.size()&&(i=0),i},_prevInDom:function(){var i=this.current-1;return 0>i&&(i=this.size()-1),i},_parseHash:function(t){return t=t||i.location.hash,t=t.replace(/^#/,""),t&&!isNaN(+t)&&(t=+t),t},size:function(){return this.$container.children().length},destroy:function(){return this.$el.removeData()},update:function(){this.css.children(),this.css.containers(),this.css.images(),this.pagination._addItem(this.size()),this._findPositions(this.current),this.$el.trigger("updated.slides")},stop:function(){clearInterval(this.play_id),delete this.play_id,this.$el.trigger("stopped.slides")},start:function(){var n=this;n.options.hashchange?t(i).trigger("hashchange"):this.animate(),this.options.play&&(this.play_id&&this.stop(),this.play_id=setInterval(function(){n.animate()},this.options.play)),this.$el.trigger("started.slides")},animate:function(t,n){var e=this,s={};if(!(this.animating||(this.animating=!0,void 0===t&&(t="s-next"),s.upcoming_slide=this._upcomingSlide(t),s.upcoming_slide>=this.size()))){if(s.outgoing_slide=this.current,s.upcoming_position=2*this.width,s.offset=-s.upcoming_position,("s-prev"===t||s.outgoing_slide>t)&&(s.upcoming_position=0,s.offset=0),e.size()>1&&e.pagination._setCurrent(s.upcoming_slide),e.options.hashchange){var o=s.upcoming_slide+1,a=e.$container.children(":eq("+s.upcoming_slide+")").attr("id");i.location.hash=a?a:o}e.$el.trigger("animating.slides",[s]),e.animation(s,function(){e._findPositions(s.upcoming_slide,e),"function"==typeof n&&n(),e.animating=!1,e.$el.trigger("animated.slides"),e.init||(e.$el.trigger("init.slides"),e.init=!0,e.$container.fadeIn("fast"))})}}},t.fn[e]=function(i,s){var o=[];return this.each(function(){var a,r,h;return a=t(this),r=a.data(e),h="object"==typeof i&&i,r||(o=a.data(e,r=new n(this,h))),"string"==typeof i&&(o=r[i],"function"==typeof o)?o=o.call(r,s):void 0}),o},t.fn[e].fx={}})(this,jQuery);

// ========================waypoint ===========================================================
// Generated by CoffeeScript 1.6.2
/*!
jQuery Waypoints - v2.0.5
Copyright (c) 2011-2014 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
(function(){var t=[].indexOf||function(t){for(var e=0,n=this.length;e<n;e++){if(e in this&&this[e]===t)return e}return-1},e=[].slice;(function(t,e){if(typeof define==="function"&&define.amd){return define("waypoints",["jquery"],function(n){return e(n,t)})}else{return e(t.jQuery,t)}})(window,function(n,r){var i,o,l,s,f,u,c,a,h,d,p,y,v,w,g,m;i=n(r);a=t.call(r,"ontouchstart")>=0;s={horizontal:{},vertical:{}};f=1;c={};u="waypoints-context-id";p="resize.waypoints";y="scroll.waypoints";v=1;w="waypoints-waypoint-ids";g="waypoint";m="waypoints";o=function(){function t(t){var e=this;this.$element=t;this.element=t[0];this.didResize=false;this.didScroll=false;this.id="context"+f++;this.oldScroll={x:t.scrollLeft(),y:t.scrollTop()};this.waypoints={horizontal:{},vertical:{}};this.element[u]=this.id;c[this.id]=this;t.bind(y,function(){var t;if(!(e.didScroll||a)){e.didScroll=true;t=function(){e.doScroll();return e.didScroll=false};return r.setTimeout(t,n[m].settings.scrollThrottle)}});t.bind(p,function(){var t;if(!e.didResize){e.didResize=true;t=function(){n[m]("refresh");return e.didResize=false};return r.setTimeout(t,n[m].settings.resizeThrottle)}})}t.prototype.doScroll=function(){var t,e=this;t={horizontal:{newScroll:this.$element.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.$element.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};if(a&&(!t.vertical.oldScroll||!t.vertical.newScroll)){n[m]("refresh")}n.each(t,function(t,r){var i,o,l;l=[];o=r.newScroll>r.oldScroll;i=o?r.forward:r.backward;n.each(e.waypoints[t],function(t,e){var n,i;if(r.oldScroll<(n=e.offset)&&n<=r.newScroll){return l.push(e)}else if(r.newScroll<(i=e.offset)&&i<=r.oldScroll){return l.push(e)}});l.sort(function(t,e){return t.offset-e.offset});if(!o){l.reverse()}return n.each(l,function(t,e){if(e.options.continuous||t===l.length-1){return e.trigger([i])}})});return this.oldScroll={x:t.horizontal.newScroll,y:t.vertical.newScroll}};t.prototype.refresh=function(){var t,e,r,i=this;r=n.isWindow(this.element);e=this.$element.offset();this.doScroll();t={horizontal:{contextOffset:r?0:e.left,contextScroll:r?0:this.oldScroll.x,contextDimension:this.$element.width(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:r?0:e.top,contextScroll:r?0:this.oldScroll.y,contextDimension:r?n[m]("viewportHeight"):this.$element.height(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};return n.each(t,function(t,e){return n.each(i.waypoints[t],function(t,r){var i,o,l,s,f;i=r.options.offset;l=r.offset;o=n.isWindow(r.element)?0:r.$element.offset()[e.offsetProp];if(n.isFunction(i)){i=i.apply(r.element)}else if(typeof i==="string"){i=parseFloat(i);if(r.options.offset.indexOf("%")>-1){i=Math.ceil(e.contextDimension*i/100)}}r.offset=o-e.contextOffset+e.contextScroll-i;if(r.options.onlyOnScroll&&l!=null||!r.enabled){return}if(l!==null&&l<(s=e.oldScroll)&&s<=r.offset){return r.trigger([e.backward])}else if(l!==null&&l>(f=e.oldScroll)&&f>=r.offset){return r.trigger([e.forward])}else if(l===null&&e.oldScroll>=r.offset){return r.trigger([e.forward])}})})};t.prototype.checkEmpty=function(){if(n.isEmptyObject(this.waypoints.horizontal)&&n.isEmptyObject(this.waypoints.vertical)){this.$element.unbind([p,y].join(" "));return delete c[this.id]}};return t}();l=function(){function t(t,e,r){var i,o;if(r.offset==="bottom-in-view"){r.offset=function(){var t;t=n[m]("viewportHeight");if(!n.isWindow(e.element)){t=e.$element.height()}return t-n(this).outerHeight()}}this.$element=t;this.element=t[0];this.axis=r.horizontal?"horizontal":"vertical";this.callback=r.handler;this.context=e;this.enabled=r.enabled;this.id="waypoints"+v++;this.offset=null;this.options=r;e.waypoints[this.axis][this.id]=this;s[this.axis][this.id]=this;i=(o=this.element[w])!=null?o:[];i.push(this.id);this.element[w]=i}t.prototype.trigger=function(t){if(!this.enabled){return}if(this.callback!=null){this.callback.apply(this.element,t)}if(this.options.triggerOnce){return this.destroy()}};t.prototype.disable=function(){return this.enabled=false};t.prototype.enable=function(){this.context.refresh();return this.enabled=true};t.prototype.destroy=function(){delete s[this.axis][this.id];delete this.context.waypoints[this.axis][this.id];return this.context.checkEmpty()};t.getWaypointsByElement=function(t){var e,r;r=t[w];if(!r){return[]}e=n.extend({},s.horizontal,s.vertical);return n.map(r,function(t){return e[t]})};return t}();d={init:function(t,e){var r;e=n.extend({},n.fn[g].defaults,e);if((r=e.handler)==null){e.handler=t}this.each(function(){var t,r,i,s;t=n(this);i=(s=e.context)!=null?s:n.fn[g].defaults.context;if(!n.isWindow(i)){i=t.closest(i)}i=n(i);r=c[i[0][u]];if(!r){r=new o(i)}return new l(t,r,e)});n[m]("refresh");return this},disable:function(){return d._invoke.call(this,"disable")},enable:function(){return d._invoke.call(this,"enable")},destroy:function(){return d._invoke.call(this,"destroy")},prev:function(t,e){return d._traverse.call(this,t,e,function(t,e,n){if(e>0){return t.push(n[e-1])}})},next:function(t,e){return d._traverse.call(this,t,e,function(t,e,n){if(e<n.length-1){return t.push(n[e+1])}})},_traverse:function(t,e,i){var o,l;if(t==null){t="vertical"}if(e==null){e=r}l=h.aggregate(e);o=[];this.each(function(){var e;e=n.inArray(this,l[t]);return i(o,e,l[t])});return this.pushStack(o)},_invoke:function(t){this.each(function(){var e;e=l.getWaypointsByElement(this);return n.each(e,function(e,n){n[t]();return true})});return this}};n.fn[g]=function(){var t,r;r=arguments[0],t=2<=arguments.length?e.call(arguments,1):[];if(d[r]){return d[r].apply(this,t)}else if(n.isFunction(r)){return d.init.apply(this,arguments)}else if(n.isPlainObject(r)){return d.init.apply(this,[null,r])}else if(!r){return n.error("jQuery Waypoints needs a callback function or handler option.")}else{return n.error("The "+r+" method does not exist in jQuery Waypoints.")}};n.fn[g].defaults={context:r,continuous:true,enabled:true,horizontal:false,offset:0,triggerOnce:false};h={refresh:function(){return n.each(c,function(t,e){return e.refresh()})},viewportHeight:function(){var t;return(t=r.innerHeight)!=null?t:i.height()},aggregate:function(t){var e,r,i;e=s;if(t){e=(i=c[n(t)[0][u]])!=null?i.waypoints:void 0}if(!e){return[]}r={horizontal:[],vertical:[]};n.each(r,function(t,i){n.each(e[t],function(t,e){return i.push(e)});i.sort(function(t,e){return t.offset-e.offset});r[t]=n.map(i,function(t){return t.element});return r[t]=n.unique(r[t])});return r},above:function(t){if(t==null){t=r}return h._filter(t,"vertical",function(t,e){return e.offset<=t.oldScroll.y})},below:function(t){if(t==null){t=r}return h._filter(t,"vertical",function(t,e){return e.offset>t.oldScroll.y})},left:function(t){if(t==null){t=r}return h._filter(t,"horizontal",function(t,e){return e.offset<=t.oldScroll.x})},right:function(t){if(t==null){t=r}return h._filter(t,"horizontal",function(t,e){return e.offset>t.oldScroll.x})},enable:function(){return h._invoke("enable")},disable:function(){return h._invoke("disable")},destroy:function(){return h._invoke("destroy")},extendFn:function(t,e){return d[t]=e},_invoke:function(t){var e;e=n.extend({},s.vertical,s.horizontal);return n.each(e,function(e,n){n[t]();return true})},_filter:function(t,e,r){var i,o;i=c[n(t)[0][u]];if(!i){return[]}o=[];n.each(i.waypoints[e],function(t,e){if(r(i,e)){return o.push(e)}});o.sort(function(t,e){return t.offset-e.offset});return n.map(o,function(t){return t.element})}};n[m]=function(){var t,n;n=arguments[0],t=2<=arguments.length?e.call(arguments,1):[];if(h[n]){return h[n].apply(null,t)}else{return h.aggregate.call(null,n)}};n[m].settings={resizeThrottle:100,scrollThrottle:30};return i.on("load.waypoints",function(){return n[m]("refresh")})})}).call(this);

// =============================== waypoint-sticky ==============================================
// Generated by CoffeeScript 1.6.2
/*
Sticky Elements Shortcut for jQuery Waypoints - v2.0.5
Copyright (c) 2011-2014 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
(function(){(function(t,n){if(typeof define==="function"&&define.amd){return define(["jquery","waypoints"],n)}else{return n(t.jQuery)}})(window,function(t){var n,i;n={wrapper:'<div class="sticky-wrapper" />',stuckClass:"stuck",direction:"down right"};i=function(t,n){var i;t.wrap(n.wrapper);i=t.parent();return i.data("isWaypointStickyWrapper",true)};t.waypoints("extendFn","sticky",function(r){var e,a,s;a=t.extend({},t.fn.waypoint.defaults,n,r);e=i(this,a);s=a.handler;a.handler=function(n){var i,r;i=t(this).children(":first");r=a.direction.indexOf(n)!==-1;i.toggleClass(a.stuckClass,r);e.height(r?i.outerHeight():"");if(s!=null){return s.call(this,n)}};e.waypoint(a);return this.data("stuckClass",a.stuckClass)});return t.waypoints("extendFn","unsticky",function(){var t;t=this.parent();if(!t.data("isWaypointStickyWrapper")){return this}t.waypoint("destroy");this.unwrap();return this.removeClass(this.data("stuckClass"))})})}).call(this);
