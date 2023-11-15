(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
        typeof define === 'function' && define.amd ? define(['jquery'], factory) :
            (global.Util = factory(global.jQuery));
}(this, (function ($) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.1.3): util.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Util = function ($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Private TransitionEnd Helpers
         * ------------------------------------------------------------------------
         */
        var TRANSITION_END = 'transitionend';
        var MAX_UID = 1000000;
        var MILLISECONDS_MULTIPLIER = 1000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

        function toType(obj) {
            return {}.toString.call(obj).match(/\s([a-z]+)/i)[1].toLowerCase();
        }

        function getSpecialTransitionEndEvent() {
            return {
                bindType: TRANSITION_END,
                delegateType: TRANSITION_END,
                handle: function handle(event) {
                    if ($$$1(event.target).is(this)) {
                        return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
                    }

                    return undefined; // eslint-disable-line no-undefined
                }
            };
        }

        function transitionEndEmulator(duration) {
            var _this = this;

            var called = false;
            $$$1(this).one(Util.TRANSITION_END, function () {
                called = true;
            });
            setTimeout(function () {
                if (!called) {
                    Util.triggerTransitionEnd(_this);
                }
            }, duration);
            return this;
        }

        function setTransitionEndSupport() {
            $$$1.fn.emulateTransitionEnd = transitionEndEmulator;
            $$$1.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
        }
        /**
         * --------------------------------------------------------------------------
         * Public Util Api
         * --------------------------------------------------------------------------
         */


        var Util = {
            TRANSITION_END: 'bsTransitionEnd',
            getUID: function getUID(prefix) {
                do {
                    // eslint-disable-next-line no-bitwise
                    prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
                } while (document.getElementById(prefix));

                return prefix;
            },
            getSelectorFromElement: function getSelectorFromElement(element) {
                var selector = element.getAttribute('data-target');

                if (!selector || selector === '#') {
                    selector = element.getAttribute('href') || '';
                }

                try {
                    return document.querySelector(selector) ? selector : null;
                } catch (err) {
                    return null;
                }
            },
            getTransitionDurationFromElement: function getTransitionDurationFromElement(element) {
                if (!element) {
                    return 0;
                } // Get transition-duration of the element


                var transitionDuration = $$$1(element).css('transition-duration');
                var floatTransitionDuration = parseFloat(transitionDuration); // Return 0 if element or transition duration is not found

                if (!floatTransitionDuration) {
                    return 0;
                } // If multiple durations are defined, take the first


                transitionDuration = transitionDuration.split(',')[0];
                return parseFloat(transitionDuration) * MILLISECONDS_MULTIPLIER;
            },
            reflow: function reflow(element) {
                return element.offsetHeight;
            },
            triggerTransitionEnd: function triggerTransitionEnd(element) {
                $$$1(element).trigger(TRANSITION_END);
            },
            // TODO: Remove in v5
            supportsTransitionEnd: function supportsTransitionEnd() {
                return Boolean(TRANSITION_END);
            },
            isElement: function isElement(obj) {
                return (obj[0] || obj).nodeType;
            },
            typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
                for (var property in configTypes) {
                    if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
                        var expectedTypes = configTypes[property];
                        var value = config[property];
                        var valueType = value && Util.isElement(value) ? 'element' : toType(value);

                        if (!new RegExp(expectedTypes).test(valueType)) {
                            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
                        }
                    }
                }
            }
        };
        setTransitionEndSupport();
        return Util;
    }($);

    return Util;

})));

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
        typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
            (global.Carousel = factory(global.jQuery, global.Util));
}(this, (function ($, Util) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Util = Util && Util.hasOwnProperty('default') ? Util['default'] : Util;

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);

            if (typeof Object.getOwnPropertySymbols === 'function') {
                ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
                    return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                }));
            }

            ownKeys.forEach(function (key) {
                _defineProperty(target, key, source[key]);
            });
        }

        return target;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.1.3): carousel.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Carousel = function ($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'carousel';
        var VERSION = '4.1.3';
        var DATA_KEY = 'bs.carousel';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

        var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

        var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

        var Default = {
            interval: 5000,
            keyboard: true,
            slide: false,
            pause: 'hover',
            wrap: true
        };
        var DefaultType = {
            interval: '(number|boolean)',
            keyboard: 'boolean',
            slide: '(boolean|string)',
            pause: '(string|boolean)',
            wrap: 'boolean'
        };
        var Direction = {
            NEXT: 'next',
            PREV: 'prev',
            LEFT: 'left',
            RIGHT: 'right'
        };
        var Event = {
            SLIDE: "slide" + EVENT_KEY,
            SLID: "slid" + EVENT_KEY,
            KEYDOWN: "keydown" + EVENT_KEY,
            MOUSEENTER: "mouseenter" + EVENT_KEY,
            MOUSELEAVE: "mouseleave" + EVENT_KEY,
            TOUCHEND: "touchend" + EVENT_KEY,
            LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            CAROUSEL: 'carousel',
            ACTIVE: 'active',
            SLIDE: 'slide',
            RIGHT: 'carousel-item-right',
            LEFT: 'carousel-item-left',
            NEXT: 'carousel-item-next',
            PREV: 'carousel-item-prev',
            ITEM: 'carousel-item'
        };
        var Selector = {
            ACTIVE: '.active',
            ACTIVE_ITEM: '.active.carousel-item',
            ITEM: '.carousel-item',
            NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
            INDICATORS: '.carousel-indicators',
            DATA_SLIDE: '[data-slide], [data-slide-to]',
            DATA_RIDE: '[data-ride="carousel"]'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Carousel =
            /*#__PURE__*/
            function () {
                function Carousel(element, config) {
                    this._items = null;
                    this._interval = null;
                    this._activeElement = null;
                    this._isPaused = false;
                    this._isSliding = false;
                    this.touchTimeout = null;
                    this._config = this._getConfig(config);
                    this._element = $$$1(element)[0];
                    this._indicatorsElement = this._element.querySelector(Selector.INDICATORS);

                    this._addEventListeners();
                } // Getters


                var _proto = Carousel.prototype;

                // Public
                _proto.next = function next() {
                    if (!this._isSliding) {
                        this._slide(Direction.NEXT);
                    }
                };

                _proto.nextWhenVisible = function nextWhenVisible() {
                    // Don't call next when the page isn't visible
                    // or the carousel or its parent isn't visible
                    if (!document.hidden && $$$1(this._element).is(':visible') && $$$1(this._element).css('visibility') !== 'hidden') {
                        this.next();
                    }
                };

                _proto.prev = function prev() {
                    if (!this._isSliding) {
                        this._slide(Direction.PREV);
                    }
                };

                _proto.pause = function pause(event) {
                    if (!event) {
                        this._isPaused = true;
                    }

                    if (this._element.querySelector(Selector.NEXT_PREV)) {
                        Util.triggerTransitionEnd(this._element);
                        this.cycle(true);
                    }

                    clearInterval(this._interval);
                    this._interval = null;
                };

                _proto.cycle = function cycle(event) {
                    if (!event) {
                        this._isPaused = false;
                    }

                    if (this._interval) {
                        clearInterval(this._interval);
                        this._interval = null;
                    }

                    if (this._config.interval && !this._isPaused) {
                        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
                    }
                };

                _proto.to = function to(index) {
                    var _this = this;

                    this._activeElement = this._element.querySelector(Selector.ACTIVE_ITEM);

                    var activeIndex = this._getItemIndex(this._activeElement);

                    if (index > this._items.length - 1 || index < 0) {
                        return;
                    }

                    if (this._isSliding) {
                        $$$1(this._element).one(Event.SLID, function () {
                            return _this.to(index);
                        });
                        return;
                    }

                    if (activeIndex === index) {
                        this.pause();
                        this.cycle();
                        return;
                    }

                    var direction = index > activeIndex ? Direction.NEXT : Direction.PREV;

                    this._slide(direction, this._items[index]);
                };

                _proto.dispose = function dispose() {
                    $$$1(this._element).off(EVENT_KEY);
                    $$$1.removeData(this._element, DATA_KEY);
                    this._items = null;
                    this._config = null;
                    this._element = null;
                    this._interval = null;
                    this._isPaused = null;
                    this._isSliding = null;
                    this._activeElement = null;
                    this._indicatorsElement = null;
                }; // Private


                _proto._getConfig = function _getConfig(config) {
                    config = _objectSpread({}, Default, config);
                    Util.typeCheckConfig(NAME, config, DefaultType);
                    return config;
                };

                _proto._addEventListeners = function _addEventListeners() {
                    var _this2 = this;

                    if (this._config.keyboard) {
                        $$$1(this._element).on(Event.KEYDOWN, function (event) {
                            return _this2._keydown(event);
                        });
                    }

                    if (this._config.pause === 'hover') {
                        $$$1(this._element).on(Event.MOUSEENTER, function (event) {
                            return _this2.pause(event);
                        }).on(Event.MOUSELEAVE, function (event) {
                            return _this2.cycle(event);
                        });

                        if ('ontouchstart' in document.documentElement) {
                            // If it's a touch-enabled device, mouseenter/leave are fired as
                            // part of the mouse compatibility events on first tap - the carousel
                            // would stop cycling until user tapped out of it;
                            // here, we listen for touchend, explicitly pause the carousel
                            // (as if it's the second time we tap on it, mouseenter compat event
                            // is NOT fired) and after a timeout (to allow for mouse compatibility
                            // events to fire) we explicitly restart cycling
                            $$$1(this._element).on(Event.TOUCHEND, function () {
                                _this2.pause();

                                if (_this2.touchTimeout) {
                                    clearTimeout(_this2.touchTimeout);
                                }

                                _this2.touchTimeout = setTimeout(function (event) {
                                    return _this2.cycle(event);
                                }, TOUCHEVENT_COMPAT_WAIT + _this2._config.interval);
                            });
                        }
                    }
                };

                _proto._keydown = function _keydown(event) {
                    if (/input|textarea/i.test(event.target.tagName)) {
                        return;
                    }

                    switch (event.which) {
                        case ARROW_LEFT_KEYCODE:
                            event.preventDefault();
                            this.prev();
                            break;

                        case ARROW_RIGHT_KEYCODE:
                            event.preventDefault();
                            this.next();
                            break;

                        default:
                    }
                };

                _proto._getItemIndex = function _getItemIndex(element) {
                    this._items = element && element.parentNode ? [].slice.call(element.parentNode.querySelectorAll(Selector.ITEM)) : [];
                    return this._items.indexOf(element);
                };

                _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
                    var isNextDirection = direction === Direction.NEXT;
                    var isPrevDirection = direction === Direction.PREV;

                    var activeIndex = this._getItemIndex(activeElement);

                    var lastItemIndex = this._items.length - 1;
                    var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

                    if (isGoingToWrap && !this._config.wrap) {
                        return activeElement;
                    }

                    var delta = direction === Direction.PREV ? -1 : 1;
                    var itemIndex = (activeIndex + delta) % this._items.length;
                    return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
                };

                _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
                    var targetIndex = this._getItemIndex(relatedTarget);

                    var fromIndex = this._getItemIndex(this._element.querySelector(Selector.ACTIVE_ITEM));

                    var slideEvent = $$$1.Event(Event.SLIDE, {
                        relatedTarget: relatedTarget,
                        direction: eventDirectionName,
                        from: fromIndex,
                        to: targetIndex
                    });
                    $$$1(this._element).trigger(slideEvent);
                    return slideEvent;
                };

                _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
                    if (this._indicatorsElement) {
                        var indicators = [].slice.call(this._indicatorsElement.querySelectorAll(Selector.ACTIVE));
                        $$$1(indicators).removeClass(ClassName.ACTIVE);

                        var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

                        if (nextIndicator) {
                            $$$1(nextIndicator).addClass(ClassName.ACTIVE);
                        }
                    }
                };

                _proto._slide = function _slide(direction, element) {
                    var _this3 = this;

                    var activeElement = this._element.querySelector(Selector.ACTIVE_ITEM);

                    var activeElementIndex = this._getItemIndex(activeElement);

                    var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

                    var nextElementIndex = this._getItemIndex(nextElement);

                    var isCycling = Boolean(this._interval);
                    var directionalClassName;
                    var orderClassName;
                    var eventDirectionName;

                    if (direction === Direction.NEXT) {
                        directionalClassName = ClassName.LEFT;
                        orderClassName = ClassName.NEXT;
                        eventDirectionName = Direction.LEFT;
                    } else {
                        directionalClassName = ClassName.RIGHT;
                        orderClassName = ClassName.PREV;
                        eventDirectionName = Direction.RIGHT;
                    }

                    if (nextElement && $$$1(nextElement).hasClass(ClassName.ACTIVE)) {
                        this._isSliding = false;
                        return;
                    }

                    var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

                    if (slideEvent.isDefaultPrevented()) {
                        return;
                    }

                    if (!activeElement || !nextElement) {
                        // Some weirdness is happening, so we bail
                        return;
                    }

                    this._isSliding = true;

                    if (isCycling) {
                        this.pause();
                    }

                    this._setActiveIndicatorElement(nextElement);

                    var slidEvent = $$$1.Event(Event.SLID, {
                        relatedTarget: nextElement,
                        direction: eventDirectionName,
                        from: activeElementIndex,
                        to: nextElementIndex
                    });

                    if ($$$1(this._element).hasClass(ClassName.SLIDE)) {
                        $$$1(nextElement).addClass(orderClassName);
                        Util.reflow(nextElement);
                        $$$1(activeElement).addClass(directionalClassName);
                        $$$1(nextElement).addClass(directionalClassName);
                        var transitionDuration = Util.getTransitionDurationFromElement(activeElement);
                        $$$1(activeElement).one(Util.TRANSITION_END, function () {
                            $$$1(nextElement).removeClass(directionalClassName + " " + orderClassName).addClass(ClassName.ACTIVE);
                            $$$1(activeElement).removeClass(ClassName.ACTIVE + " " + orderClassName + " " + directionalClassName);
                            _this3._isSliding = false;
                            setTimeout(function () {
                                return $$$1(_this3._element).trigger(slidEvent);
                            }, 0);
                        }).emulateTransitionEnd(transitionDuration);
                    } else {
                        $$$1(activeElement).removeClass(ClassName.ACTIVE);
                        $$$1(nextElement).addClass(ClassName.ACTIVE);
                        this._isSliding = false;
                        $$$1(this._element).trigger(slidEvent);
                    }

                    if (isCycling) {
                        this.cycle();
                    }
                }; // Static


                Carousel._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function () {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = _objectSpread({}, Default, $$$1(this).data());

                        if (typeof config === 'object') {
                            _config = _objectSpread({}, _config, config);
                        }

                        var action = typeof config === 'string' ? config : _config.slide;

                        if (!data) {
                            data = new Carousel(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'number') {
                            data.to(config);
                        } else if (typeof action === 'string') {
                            if (typeof data[action] === 'undefined') {
                                throw new TypeError("No method named \"" + action + "\"");
                            }

                            data[action]();
                        } else if (_config.interval) {
                            data.pause();
                            data.cycle();
                        }
                    });
                };

                Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
                    var selector = Util.getSelectorFromElement(this);

                    if (!selector) {
                        return;
                    }

                    var target = $$$1(selector)[0];

                    if (!target || !$$$1(target).hasClass(ClassName.CAROUSEL)) {
                        return;
                    }

                    var config = _objectSpread({}, $$$1(target).data(), $$$1(this).data());

                    var slideIndex = this.getAttribute('data-slide-to');

                    if (slideIndex) {
                        config.interval = false;
                    }

                    Carousel._jQueryInterface.call($$$1(target), config);

                    if (slideIndex) {
                        $$$1(target).data(DATA_KEY).to(slideIndex);
                    }

                    event.preventDefault();
                };

                _createClass(Carousel, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }]);

                return Carousel;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_SLIDE, Carousel._dataApiClickHandler);
        $$$1(window).on(Event.LOAD_DATA_API, function () {
            var carousels = [].slice.call(document.querySelectorAll(Selector.DATA_RIDE));

            for (var i = 0, len = carousels.length; i < len; i++) {
                var $carousel = $$$1(carousels[i]);

                Carousel._jQueryInterface.call($carousel, $carousel.data());
            }
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Carousel._jQueryInterface;
        $$$1.fn[NAME].Constructor = Carousel;

        $$$1.fn[NAME].noConflict = function () {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Carousel._jQueryInterface;
        };

        return Carousel;
    }($);

    return Carousel;

})));

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
        typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
            (global.Collapse = factory(global.jQuery, global.Util));
}(this, (function ($, Util) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Util = Util && Util.hasOwnProperty('default') ? Util['default'] : Util;

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);

            if (typeof Object.getOwnPropertySymbols === 'function') {
                ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
                    return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                }));
            }

            ownKeys.forEach(function (key) {
                _defineProperty(target, key, source[key]);
            });
        }

        return target;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.1.3): collapse.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Collapse = function ($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'collapse';
        var VERSION = '4.1.3';
        var DATA_KEY = 'bs.collapse';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var Default = {
            toggle: true,
            parent: ''
        };
        var DefaultType = {
            toggle: 'boolean',
            parent: '(string|element)'
        };
        var Event = {
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            SHOW: 'show',
            COLLAPSE: 'collapse',
            COLLAPSING: 'collapsing',
            COLLAPSED: 'collapsed'
        };
        var Dimension = {
            WIDTH: 'width',
            HEIGHT: 'height'
        };
        var Selector = {
            ACTIVES: '.show, .collapsing',
            DATA_TOGGLE: '[data-toggle="collapse"]'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Collapse =
            /*#__PURE__*/
            function () {
                function Collapse(element, config) {
                    this._isTransitioning = false;
                    this._element = element;
                    this._config = this._getConfig(config);
                    this._triggerArray = $$$1.makeArray(document.querySelectorAll("[data-toggle=\"collapse\"][href=\"#" + element.id + "\"]," + ("[data-toggle=\"collapse\"][data-target=\"#" + element.id + "\"]")));
                    var toggleList = [].slice.call(document.querySelectorAll(Selector.DATA_TOGGLE));

                    for (var i = 0, len = toggleList.length; i < len; i++) {
                        var elem = toggleList[i];
                        var selector = Util.getSelectorFromElement(elem);
                        var filterElement = [].slice.call(document.querySelectorAll(selector)).filter(function (foundElem) {
                            return foundElem === element;
                        });

                        if (selector !== null && filterElement.length > 0) {
                            this._selector = selector;

                            this._triggerArray.push(elem);
                        }
                    }

                    this._parent = this._config.parent ? this._getParent() : null;

                    if (!this._config.parent) {
                        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
                    }

                    if (this._config.toggle) {
                        this.toggle();
                    }
                } // Getters


                var _proto = Collapse.prototype;

                // Public
                _proto.toggle = function toggle() {
                    if ($$$1(this._element).hasClass(ClassName.SHOW)) {
                        this.hide();
                    } else {
                        this.show();
                    }
                };

                _proto.show = function show() {
                    var _this = this;

                    if (this._isTransitioning || $$$1(this._element).hasClass(ClassName.SHOW)) {
                        return;
                    }

                    var actives;
                    var activesData;

                    if (this._parent) {
                        actives = [].slice.call(this._parent.querySelectorAll(Selector.ACTIVES)).filter(function (elem) {
                            return elem.getAttribute('data-parent') === _this._config.parent;
                        });

                        if (actives.length === 0) {
                            actives = null;
                        }
                    }

                    if (actives) {
                        activesData = $$$1(actives).not(this._selector).data(DATA_KEY);

                        if (activesData && activesData._isTransitioning) {
                            return;
                        }
                    }

                    var startEvent = $$$1.Event(Event.SHOW);
                    $$$1(this._element).trigger(startEvent);

                    if (startEvent.isDefaultPrevented()) {
                        return;
                    }

                    if (actives) {
                        Collapse._jQueryInterface.call($$$1(actives).not(this._selector), 'hide');

                        if (!activesData) {
                            $$$1(actives).data(DATA_KEY, null);
                        }
                    }

                    var dimension = this._getDimension();

                    $$$1(this._element).removeClass(ClassName.COLLAPSE).addClass(ClassName.COLLAPSING);
                    this._element.style[dimension] = 0;

                    if (this._triggerArray.length) {
                        $$$1(this._triggerArray).removeClass(ClassName.COLLAPSED).attr('aria-expanded', true);
                    }

                    this.setTransitioning(true);

                    var complete = function complete() {
                        $$$1(_this._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).addClass(ClassName.SHOW);
                        _this._element.style[dimension] = '';

                        _this.setTransitioning(false);

                        $$$1(_this._element).trigger(Event.SHOWN);
                    };

                    var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
                    var scrollSize = "scroll" + capitalizedDimension;
                    var transitionDuration = Util.getTransitionDurationFromElement(this._element);
                    $$$1(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
                    this._element.style[dimension] = this._element[scrollSize] + "px";
                };

                _proto.hide = function hide() {
                    var _this2 = this;

                    if (this._isTransitioning || !$$$1(this._element).hasClass(ClassName.SHOW)) {
                        return;
                    }

                    var startEvent = $$$1.Event(Event.HIDE);
                    $$$1(this._element).trigger(startEvent);

                    if (startEvent.isDefaultPrevented()) {
                        return;
                    }

                    var dimension = this._getDimension();

                    this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px";
                    Util.reflow(this._element);
                    $$$1(this._element).addClass(ClassName.COLLAPSING).removeClass(ClassName.COLLAPSE).removeClass(ClassName.SHOW);
                    var triggerArrayLength = this._triggerArray.length;

                    if (triggerArrayLength > 0) {
                        for (var i = 0; i < triggerArrayLength; i++) {
                            var trigger = this._triggerArray[i];
                            var selector = Util.getSelectorFromElement(trigger);

                            if (selector !== null) {
                                var $elem = $$$1([].slice.call(document.querySelectorAll(selector)));

                                if (!$elem.hasClass(ClassName.SHOW)) {
                                    $$$1(trigger).addClass(ClassName.COLLAPSED).attr('aria-expanded', false);
                                }
                            }
                        }
                    }

                    this.setTransitioning(true);

                    var complete = function complete() {
                        _this2.setTransitioning(false);

                        $$$1(_this2._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).trigger(Event.HIDDEN);
                    };

                    this._element.style[dimension] = '';
                    var transitionDuration = Util.getTransitionDurationFromElement(this._element);
                    $$$1(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
                };

                _proto.setTransitioning = function setTransitioning(isTransitioning) {
                    this._isTransitioning = isTransitioning;
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    this._config = null;
                    this._parent = null;
                    this._element = null;
                    this._triggerArray = null;
                    this._isTransitioning = null;
                }; // Private


                _proto._getConfig = function _getConfig(config) {
                    config = _objectSpread({}, Default, config);
                    config.toggle = Boolean(config.toggle); // Coerce string values

                    Util.typeCheckConfig(NAME, config, DefaultType);
                    return config;
                };

                _proto._getDimension = function _getDimension() {
                    var hasWidth = $$$1(this._element).hasClass(Dimension.WIDTH);
                    return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
                };

                _proto._getParent = function _getParent() {
                    var _this3 = this;

                    var parent = null;

                    if (Util.isElement(this._config.parent)) {
                        parent = this._config.parent; // It's a jQuery object

                        if (typeof this._config.parent.jquery !== 'undefined') {
                            parent = this._config.parent[0];
                        }
                    } else {
                        parent = document.querySelector(this._config.parent);
                    }

                    var selector = "[data-toggle=\"collapse\"][data-parent=\"" + this._config.parent + "\"]";
                    var children = [].slice.call(parent.querySelectorAll(selector));
                    $$$1(children).each(function (i, element) {
                        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), [element]);
                    });
                    return parent;
                };

                _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
                    if (element) {
                        var isOpen = $$$1(element).hasClass(ClassName.SHOW);

                        if (triggerArray.length) {
                            $$$1(triggerArray).toggleClass(ClassName.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
                        }
                    }
                }; // Static


                Collapse._getTargetFromElement = function _getTargetFromElement(element) {
                    var selector = Util.getSelectorFromElement(element);
                    return selector ? document.querySelector(selector) : null;
                };

                Collapse._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function () {
                        var $this = $$$1(this);
                        var data = $this.data(DATA_KEY);

                        var _config = _objectSpread({}, Default, $this.data(), typeof config === 'object' && config ? config : {});

                        if (!data && _config.toggle && /show|hide/.test(config)) {
                            _config.toggle = false;
                        }

                        if (!data) {
                            data = new Collapse(this, _config);
                            $this.data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                _createClass(Collapse, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }]);

                return Collapse;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
            // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
            if (event.currentTarget.tagName === 'A') {
                event.preventDefault();
            }

            var $trigger = $$$1(this);
            var selector = Util.getSelectorFromElement(this);
            var selectors = [].slice.call(document.querySelectorAll(selector));
            $$$1(selectors).each(function () {
                var $target = $$$1(this);
                var data = $target.data(DATA_KEY);
                var config = data ? 'toggle' : $trigger.data();

                Collapse._jQueryInterface.call($target, config);
            });
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Collapse._jQueryInterface;
        $$$1.fn[NAME].Constructor = Collapse;

        $$$1.fn[NAME].noConflict = function () {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Collapse._jQueryInterface;
        };

        return Collapse;
    }($);

    return Collapse;

})));

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('popper.js'), require('./util.js')) :
        typeof define === 'function' && define.amd ? define(['jquery', 'popper.js', './util.js'], factory) :
            (global.Dropdown = factory(global.jQuery, global.Popper, global.Util));
}(this, (function ($, Popper, Util) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;
    Util = Util && Util.hasOwnProperty('default') ? Util['default'] : Util;

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);

            if (typeof Object.getOwnPropertySymbols === 'function') {
                ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
                    return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                }));
            }

            ownKeys.forEach(function (key) {
                _defineProperty(target, key, source[key]);
            });
        }

        return target;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.1.3): dropdown.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Dropdown = function ($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'dropdown';
        var VERSION = '4.1.3';
        var DATA_KEY = 'bs.dropdown';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

        var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key

        var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key

        var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key

        var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key

        var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

        var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
        var Event = {
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            CLICK: "click" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
            KEYDOWN_DATA_API: "keydown" + EVENT_KEY + DATA_API_KEY,
            KEYUP_DATA_API: "keyup" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            DISABLED: 'disabled',
            SHOW: 'show',
            DROPUP: 'dropup',
            DROPRIGHT: 'dropright',
            DROPLEFT: 'dropleft',
            MENURIGHT: 'dropdown-menu-right',
            MENULEFT: 'dropdown-menu-left',
            POSITION_STATIC: 'position-static'
        };
        var Selector = {
            DATA_TOGGLE: '[data-toggle="dropdown"]',
            FORM_CHILD: '.dropdown form',
            MENU: '.dropdown-menu',
            NAVBAR_NAV: '.navbar-nav',
            VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)'
        };
        var AttachmentMap = {
            TOP: 'top-start',
            TOPEND: 'top-end',
            BOTTOM: 'bottom-start',
            BOTTOMEND: 'bottom-end',
            RIGHT: 'right-start',
            RIGHTEND: 'right-end',
            LEFT: 'left-start',
            LEFTEND: 'left-end'
        };
        var Default = {
            offset: 0,
            flip: true,
            boundary: 'scrollParent',
            reference: 'toggle',
            display: 'dynamic'
        };
        var DefaultType = {
            offset: '(number|string|function)',
            flip: 'boolean',
            boundary: '(string|element)',
            reference: '(string|element)',
            display: 'string'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Dropdown =
            /*#__PURE__*/
            function () {
                function Dropdown(element, config) {
                    this._element = element;
                    this._popper = null;
                    this._config = this._getConfig(config);
                    this._menu = this._getMenuElement();
                    this._inNavbar = this._detectNavbar();

                    this._addEventListeners();
                } // Getters


                var _proto = Dropdown.prototype;

                // Public
                _proto.toggle = function toggle() {
                    if (this._element.disabled || $$$1(this._element).hasClass(ClassName.DISABLED)) {
                        return;
                    }

                    var parent = Dropdown._getParentFromElement(this._element);

                    var isActive = $$$1(this._menu).hasClass(ClassName.SHOW);

                    Dropdown._clearMenus();

                    if (isActive) {
                        return;
                    }

                    var relatedTarget = {
                        relatedTarget: this._element
                    };
                    var showEvent = $$$1.Event(Event.SHOW, relatedTarget);
                    $$$1(parent).trigger(showEvent);

                    if (showEvent.isDefaultPrevented()) {
                        return;
                    } // Disable totally Popper.js for Dropdown in Navbar


                    if (!this._inNavbar) {
                        /**
                         * Check for Popper dependency
                         * Popper - https://popper.js.org
                         */
                        if (typeof Popper === 'undefined') {
                            throw new TypeError('Bootstrap dropdown require Popper.js (https://popper.js.org)');
                        }

                        var referenceElement = this._element;

                        if (this._config.reference === 'parent') {
                            referenceElement = parent;
                        } else if (Util.isElement(this._config.reference)) {
                            referenceElement = this._config.reference; // Check if it's jQuery element

                            if (typeof this._config.reference.jquery !== 'undefined') {
                                referenceElement = this._config.reference[0];
                            }
                        } // If boundary is not `scrollParent`, then set position to `static`
                        // to allow the menu to "escape" the scroll parent's boundaries
                        // https://github.com/twbs/bootstrap/issues/24251


                        if (this._config.boundary !== 'scrollParent') {
                            $$$1(parent).addClass(ClassName.POSITION_STATIC);
                        }

                        this._popper = new Popper(referenceElement, this._menu, this._getPopperConfig());
                    } // If this is a touch-enabled device we add extra
                    // empty mouseover listeners to the body's immediate children;
                    // only needed because of broken event delegation on iOS
                    // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


                    if ('ontouchstart' in document.documentElement && $$$1(parent).closest(Selector.NAVBAR_NAV).length === 0) {
                        $$$1(document.body).children().on('mouseover', null, $$$1.noop);
                    }

                    this._element.focus();

                    this._element.setAttribute('aria-expanded', true);

                    $$$1(this._menu).toggleClass(ClassName.SHOW);
                    $$$1(parent).toggleClass(ClassName.SHOW).trigger($$$1.Event(Event.SHOWN, relatedTarget));
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    $$$1(this._element).off(EVENT_KEY);
                    this._element = null;
                    this._menu = null;

                    if (this._popper !== null) {
                        this._popper.destroy();

                        this._popper = null;
                    }
                };

                _proto.update = function update() {
                    this._inNavbar = this._detectNavbar();

                    if (this._popper !== null) {
                        this._popper.scheduleUpdate();
                    }
                }; // Private


                _proto._addEventListeners = function _addEventListeners() {
                    var _this = this;

                    $$$1(this._element).on(Event.CLICK, function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        _this.toggle();
                    });
                };

                _proto._getConfig = function _getConfig(config) {
                    config = _objectSpread({}, this.constructor.Default, $$$1(this._element).data(), config);
                    Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);
                    return config;
                };

                _proto._getMenuElement = function _getMenuElement() {
                    if (!this._menu) {
                        var parent = Dropdown._getParentFromElement(this._element);

                        if (parent) {
                            this._menu = parent.querySelector(Selector.MENU);
                        }
                    }

                    return this._menu;
                };

                _proto._getPlacement = function _getPlacement() {
                    var $parentDropdown = $$$1(this._element.parentNode);
                    var placement = AttachmentMap.BOTTOM; // Handle dropup

                    if ($parentDropdown.hasClass(ClassName.DROPUP)) {
                        placement = AttachmentMap.TOP;

                        if ($$$1(this._menu).hasClass(ClassName.MENURIGHT)) {
                            placement = AttachmentMap.TOPEND;
                        }
                    } else if ($parentDropdown.hasClass(ClassName.DROPRIGHT)) {
                        placement = AttachmentMap.RIGHT;
                    } else if ($parentDropdown.hasClass(ClassName.DROPLEFT)) {
                        placement = AttachmentMap.LEFT;
                    } else if ($$$1(this._menu).hasClass(ClassName.MENURIGHT)) {
                        placement = AttachmentMap.BOTTOMEND;
                    }

                    return placement;
                };

                _proto._detectNavbar = function _detectNavbar() {
                    return $$$1(this._element).closest('.navbar').length > 0;
                };

                _proto._getPopperConfig = function _getPopperConfig() {
                    var _this2 = this;

                    var offsetConf = {};

                    if (typeof this._config.offset === 'function') {
                        offsetConf.fn = function (data) {
                            data.offsets = _objectSpread({}, data.offsets, _this2._config.offset(data.offsets) || {});
                            return data;
                        };
                    } else {
                        offsetConf.offset = this._config.offset;
                    }

                    var popperConfig = {
                        placement: this._getPlacement(),
                        modifiers: {
                            offset: offsetConf,
                            flip: {
                                enabled: this._config.flip
                            },
                            preventOverflow: {
                                boundariesElement: this._config.boundary
                            }
                        } // Disable Popper.js if we have a static display

                    };

                    if (this._config.display === 'static') {
                        popperConfig.modifiers.applyStyle = {
                            enabled: false
                        };
                    }

                    return popperConfig;
                }; // Static


                Dropdown._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function () {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = typeof config === 'object' ? config : null;

                        if (!data) {
                            data = new Dropdown(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                Dropdown._clearMenus = function _clearMenus(event) {
                    if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
                        return;
                    }

                    var toggles = [].slice.call(document.querySelectorAll(Selector.DATA_TOGGLE));

                    for (var i = 0, len = toggles.length; i < len; i++) {
                        var parent = Dropdown._getParentFromElement(toggles[i]);

                        var context = $$$1(toggles[i]).data(DATA_KEY);
                        var relatedTarget = {
                            relatedTarget: toggles[i]
                        };

                        if (event && event.type === 'click') {
                            relatedTarget.clickEvent = event;
                        }

                        if (!context) {
                            continue;
                        }

                        var dropdownMenu = context._menu;

                        if (!$$$1(parent).hasClass(ClassName.SHOW)) {
                            continue;
                        }

                        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $$$1.contains(parent, event.target)) {
                            continue;
                        }

                        var hideEvent = $$$1.Event(Event.HIDE, relatedTarget);
                        $$$1(parent).trigger(hideEvent);

                        if (hideEvent.isDefaultPrevented()) {
                            continue;
                        } // If this is a touch-enabled device we remove the extra
                        // empty mouseover listeners we added for iOS support


                        if ('ontouchstart' in document.documentElement) {
                            $$$1(document.body).children().off('mouseover', null, $$$1.noop);
                        }

                        toggles[i].setAttribute('aria-expanded', 'false');
                        $$$1(dropdownMenu).removeClass(ClassName.SHOW);
                        $$$1(parent).removeClass(ClassName.SHOW).trigger($$$1.Event(Event.HIDDEN, relatedTarget));
                    }
                };

                Dropdown._getParentFromElement = function _getParentFromElement(element) {
                    var parent;
                    var selector = Util.getSelectorFromElement(element);

                    if (selector) {
                        parent = document.querySelector(selector);
                    }

                    return parent || element.parentNode;
                }; // eslint-disable-next-line complexity


                Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
                    // If not input/textarea:
                    //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
                    // If input/textarea:
                    //  - If space key => not a dropdown command
                    //  - If key is other than escape
                    //    - If key is not up or down => not a dropdown command
                    //    - If trigger inside the menu => not a dropdown command
                    if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $$$1(event.target).closest(Selector.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
                        return;
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    if (this.disabled || $$$1(this).hasClass(ClassName.DISABLED)) {
                        return;
                    }

                    var parent = Dropdown._getParentFromElement(this);

                    var isActive = $$$1(parent).hasClass(ClassName.SHOW);

                    if (!isActive && (event.which !== ESCAPE_KEYCODE || event.which !== SPACE_KEYCODE) || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
                        if (event.which === ESCAPE_KEYCODE) {
                            var toggle = parent.querySelector(Selector.DATA_TOGGLE);
                            $$$1(toggle).trigger('focus');
                        }

                        $$$1(this).trigger('click');
                        return;
                    }

                    var items = [].slice.call(parent.querySelectorAll(Selector.VISIBLE_ITEMS));

                    if (items.length === 0) {
                        return;
                    }

                    var index = items.indexOf(event.target);

                    if (event.which === ARROW_UP_KEYCODE && index > 0) {
                        // Up
                        index--;
                    }

                    if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
                        // Down
                        index++;
                    }

                    if (index < 0) {
                        index = 0;
                    }

                    items[index].focus();
                };

                _createClass(Dropdown, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }, {
                    key: "DefaultType",
                    get: function get() {
                        return DefaultType;
                    }
                }]);

                return Dropdown;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.KEYDOWN_DATA_API, Selector.DATA_TOGGLE, Dropdown._dataApiKeydownHandler).on(Event.KEYDOWN_DATA_API, Selector.MENU, Dropdown._dataApiKeydownHandler).on(Event.CLICK_DATA_API + " " + Event.KEYUP_DATA_API, Dropdown._clearMenus).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
            event.preventDefault();
            event.stopPropagation();

            Dropdown._jQueryInterface.call($$$1(this), 'toggle');
        }).on(Event.CLICK_DATA_API, Selector.FORM_CHILD, function (e) {
            e.stopPropagation();
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Dropdown._jQueryInterface;
        $$$1.fn[NAME].Constructor = Dropdown;

        $$$1.fn[NAME].noConflict = function () {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Dropdown._jQueryInterface;
        };

        return Dropdown;
    }($, Popper);

    return Dropdown;

})));

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
        typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
            (global.Modal = factory(global.jQuery, global.Util));
}(this, (function ($, Util) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Util = Util && Util.hasOwnProperty('default') ? Util['default'] : Util;

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);

            if (typeof Object.getOwnPropertySymbols === 'function') {
                ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
                    return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                }));
            }

            ownKeys.forEach(function (key) {
                _defineProperty(target, key, source[key]);
            });
        }

        return target;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.1.3): modal.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Modal = function ($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'modal';
        var VERSION = '4.1.3';
        var DATA_KEY = 'bs.modal';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

        var Default = {
            backdrop: true,
            keyboard: true,
            focus: true,
            show: true
        };
        var DefaultType = {
            backdrop: '(boolean|string)',
            keyboard: 'boolean',
            focus: 'boolean',
            show: 'boolean'
        };
        var Event = {
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            FOCUSIN: "focusin" + EVENT_KEY,
            RESIZE: "resize" + EVENT_KEY,
            CLICK_DISMISS: "click.dismiss" + EVENT_KEY,
            KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY,
            MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY,
            MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
            BACKDROP: 'modal-backdrop',
            OPEN: 'modal-open',
            FADE: 'fade',
            SHOW: 'show'
        };
        var Selector = {
            DIALOG: '.modal-dialog',
            DATA_TOGGLE: '[data-toggle="modal"]',
            DATA_DISMISS: '[data-dismiss="modal"]',
            FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
            STICKY_CONTENT: '.sticky-top'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Modal =
            /*#__PURE__*/
            function () {
                function Modal(element, config) {
                    this._config = this._getConfig(config);
                    this._element = element;
                    this._dialog = element.querySelector(Selector.DIALOG);
                    this._backdrop = null;
                    this._isShown = false;
                    this._isBodyOverflowing = false;
                    this._ignoreBackdropClick = false;
                    this._scrollbarWidth = 0;
                } // Getters


                var _proto = Modal.prototype;

                // Public
                _proto.toggle = function toggle(relatedTarget) {
                    return this._isShown ? this.hide() : this.show(relatedTarget);
                };

                _proto.show = function show(relatedTarget) {
                    var _this = this;

                    if (this._isTransitioning || this._isShown) {
                        return;
                    }

                    if ($$$1(this._element).hasClass(ClassName.FADE)) {
                        this._isTransitioning = true;
                    }

                    var showEvent = $$$1.Event(Event.SHOW, {
                        relatedTarget: relatedTarget
                    });
                    $$$1(this._element).trigger(showEvent);

                    if (this._isShown || showEvent.isDefaultPrevented()) {
                        return;
                    }

                    this._isShown = true;

                    this._checkScrollbar();

                    this._setScrollbar();

                    this._adjustDialog();

                    $$$1(document.body).addClass(ClassName.OPEN);

                    this._setEscapeEvent();

                    this._setResizeEvent();

                    $$$1(this._element).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, function (event) {
                        return _this.hide(event);
                    });
                    $$$1(this._dialog).on(Event.MOUSEDOWN_DISMISS, function () {
                        $$$1(_this._element).one(Event.MOUSEUP_DISMISS, function (event) {
                            if ($$$1(event.target).is(_this._element)) {
                                _this._ignoreBackdropClick = true;
                            }
                        });
                    });

                    this._showBackdrop(function () {
                        return _this._showElement(relatedTarget);
                    });
                };

                _proto.hide = function hide(event) {
                    var _this2 = this;

                    if (event) {
                        event.preventDefault();
                    }

                    if (this._isTransitioning || !this._isShown) {
                        return;
                    }

                    var hideEvent = $$$1.Event(Event.HIDE);
                    $$$1(this._element).trigger(hideEvent);

                    if (!this._isShown || hideEvent.isDefaultPrevented()) {
                        return;
                    }

                    this._isShown = false;
                    var transition = $$$1(this._element).hasClass(ClassName.FADE);

                    if (transition) {
                        this._isTransitioning = true;
                    }

                    this._setEscapeEvent();

                    this._setResizeEvent();

                    $$$1(document).off(Event.FOCUSIN);
                    $$$1(this._element).removeClass(ClassName.SHOW);
                    $$$1(this._element).off(Event.CLICK_DISMISS);
                    $$$1(this._dialog).off(Event.MOUSEDOWN_DISMISS);

                    if (transition) {
                        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
                        $$$1(this._element).one(Util.TRANSITION_END, function (event) {
                            return _this2._hideModal(event);
                        }).emulateTransitionEnd(transitionDuration);
                    } else {
                        this._hideModal();
                    }
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    $$$1(window, document, this._element, this._backdrop).off(EVENT_KEY);
                    this._config = null;
                    this._element = null;
                    this._dialog = null;
                    this._backdrop = null;
                    this._isShown = null;
                    this._isBodyOverflowing = null;
                    this._ignoreBackdropClick = null;
                    this._scrollbarWidth = null;
                };

                _proto.handleUpdate = function handleUpdate() {
                    this._adjustDialog();
                }; // Private


                _proto._getConfig = function _getConfig(config) {
                    config = _objectSpread({}, Default, config);
                    Util.typeCheckConfig(NAME, config, DefaultType);
                    return config;
                };

                _proto._showElement = function _showElement(relatedTarget) {
                    var _this3 = this;

                    var transition = $$$1(this._element).hasClass(ClassName.FADE);

                    if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
                        // Don't move modal's DOM position
                        document.body.appendChild(this._element);
                    }

                    this._element.style.display = 'block';

                    this._element.removeAttribute('aria-hidden');

                    this._element.scrollTop = 0;

                    if (transition) {
                        Util.reflow(this._element);
                    }

                    $$$1(this._element).addClass(ClassName.SHOW);

                    if (this._config.focus) {
                        this._enforceFocus();
                    }

                    var shownEvent = $$$1.Event(Event.SHOWN, {
                        relatedTarget: relatedTarget
                    });

                    var transitionComplete = function transitionComplete() {
                        if (_this3._config.focus) {
                            _this3._element.focus();
                        }

                        _this3._isTransitioning = false;
                        $$$1(_this3._element).trigger(shownEvent);
                    };

                    if (transition) {
                        var transitionDuration = Util.getTransitionDurationFromElement(this._element);
                        $$$1(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(transitionDuration);
                    } else {
                        transitionComplete();
                    }
                };

                _proto._enforceFocus = function _enforceFocus() {
                    var _this4 = this;

                    $$$1(document).off(Event.FOCUSIN) // Guard against infinite focus loop
                        .on(Event.FOCUSIN, function (event) {
                            if (document !== event.target && _this4._element !== event.target && $$$1(_this4._element).has(event.target).length === 0) {
                                _this4._element.focus();
                            }
                        });
                };

                _proto._setEscapeEvent = function _setEscapeEvent() {
                    var _this5 = this;

                    if (this._isShown && this._config.keyboard) {
                        $$$1(this._element).on(Event.KEYDOWN_DISMISS, function (event) {
                            if (event.which === ESCAPE_KEYCODE) {
                                event.preventDefault();

                                _this5.hide();
                            }
                        });
                    } else if (!this._isShown) {
                        $$$1(this._element).off(Event.KEYDOWN_DISMISS);
                    }
                };

                _proto._setResizeEvent = function _setResizeEvent() {
                    var _this6 = this;

                    if (this._isShown) {
                        $$$1(window).on(Event.RESIZE, function (event) {
                            return _this6.handleUpdate(event);
                        });
                    } else {
                        $$$1(window).off(Event.RESIZE);
                    }
                };

                _proto._hideModal = function _hideModal() {
                    var _this7 = this;

                    this._element.style.display = 'none';

                    this._element.setAttribute('aria-hidden', true);

                    this._isTransitioning = false;

                    this._showBackdrop(function () {
                        $$$1(document.body).removeClass(ClassName.OPEN);

                        _this7._resetAdjustments();

                        _this7._resetScrollbar();

                        $$$1(_this7._element).trigger(Event.HIDDEN);
                    });
                };

                _proto._removeBackdrop = function _removeBackdrop() {
                    if (this._backdrop) {
                        $$$1(this._backdrop).remove();
                        this._backdrop = null;
                    }
                };

                _proto._showBackdrop = function _showBackdrop(callback) {
                    var _this8 = this;

                    var animate = $$$1(this._element).hasClass(ClassName.FADE) ? ClassName.FADE : '';

                    if (this._isShown && this._config.backdrop) {
                        this._backdrop = document.createElement('div');
                        this._backdrop.className = ClassName.BACKDROP;

                        if (animate) {
                            this._backdrop.classList.add(animate);
                        }

                        $$$1(this._backdrop).appendTo(document.body);
                        $$$1(this._element).on(Event.CLICK_DISMISS, function (event) {
                            if (_this8._ignoreBackdropClick) {
                                _this8._ignoreBackdropClick = false;
                                return;
                            }

                            if (event.target !== event.currentTarget) {
                                return;
                            }

                            if (_this8._config.backdrop === 'static') {
                                _this8._element.focus();
                            } else {
                                _this8.hide();
                            }
                        });

                        if (animate) {
                            Util.reflow(this._backdrop);
                        }

                        $$$1(this._backdrop).addClass(ClassName.SHOW);

                        if (!callback) {
                            return;
                        }

                        if (!animate) {
                            callback();
                            return;
                        }

                        var backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);
                        $$$1(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(backdropTransitionDuration);
                    } else if (!this._isShown && this._backdrop) {
                        $$$1(this._backdrop).removeClass(ClassName.SHOW);

                        var callbackRemove = function callbackRemove() {
                            _this8._removeBackdrop();

                            if (callback) {
                                callback();
                            }
                        };

                        if ($$$1(this._element).hasClass(ClassName.FADE)) {
                            var _backdropTransitionDuration = Util.getTransitionDurationFromElement(this._backdrop);

                            $$$1(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(_backdropTransitionDuration);
                        } else {
                            callbackRemove();
                        }
                    } else if (callback) {
                        callback();
                    }
                }; // ----------------------------------------------------------------------
                // the following methods are used to handle overflowing modals
                // todo (fat): these should probably be refactored out of modal.js
                // ----------------------------------------------------------------------


                _proto._adjustDialog = function _adjustDialog() {
                    var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

                    if (!this._isBodyOverflowing && isModalOverflowing) {
                        this._element.style.paddingLeft = this._scrollbarWidth + "px";
                    }

                    if (this._isBodyOverflowing && !isModalOverflowing) {
                        this._element.style.paddingRight = this._scrollbarWidth + "px";
                    }
                };

                _proto._resetAdjustments = function _resetAdjustments() {
                    this._element.style.paddingLeft = '';
                    this._element.style.paddingRight = '';
                };

                _proto._checkScrollbar = function _checkScrollbar() {
                    var rect = document.body.getBoundingClientRect();
                    this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
                    this._scrollbarWidth = this._getScrollbarWidth();
                };

                _proto._setScrollbar = function _setScrollbar() {
                    var _this9 = this;

                    if (this._isBodyOverflowing) {
                        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
                        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
                        var fixedContent = [].slice.call(document.querySelectorAll(Selector.FIXED_CONTENT));
                        var stickyContent = [].slice.call(document.querySelectorAll(Selector.STICKY_CONTENT)); // Adjust fixed content padding

                        $$$1(fixedContent).each(function (index, element) {
                            var actualPadding = element.style.paddingRight;
                            var calculatedPadding = $$$1(element).css('padding-right');
                            $$$1(element).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + _this9._scrollbarWidth + "px");
                        }); // Adjust sticky content margin

                        $$$1(stickyContent).each(function (index, element) {
                            var actualMargin = element.style.marginRight;
                            var calculatedMargin = $$$1(element).css('margin-right');
                            $$$1(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) - _this9._scrollbarWidth + "px");
                        }); // Adjust body padding

                        var actualPadding = document.body.style.paddingRight;
                        var calculatedPadding = $$$1(document.body).css('padding-right');
                        $$$1(document.body).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px");
                    }
                };

                _proto._resetScrollbar = function _resetScrollbar() {
                    // Restore fixed content padding
                    var fixedContent = [].slice.call(document.querySelectorAll(Selector.FIXED_CONTENT));
                    $$$1(fixedContent).each(function (index, element) {
                        var padding = $$$1(element).data('padding-right');
                        $$$1(element).removeData('padding-right');
                        element.style.paddingRight = padding ? padding : '';
                    }); // Restore sticky content

                    var elements = [].slice.call(document.querySelectorAll("" + Selector.STICKY_CONTENT));
                    $$$1(elements).each(function (index, element) {
                        var margin = $$$1(element).data('margin-right');

                        if (typeof margin !== 'undefined') {
                            $$$1(element).css('margin-right', margin).removeData('margin-right');
                        }
                    }); // Restore body padding

                    var padding = $$$1(document.body).data('padding-right');
                    $$$1(document.body).removeData('padding-right');
                    document.body.style.paddingRight = padding ? padding : '';
                };

                _proto._getScrollbarWidth = function _getScrollbarWidth() {
                    // thx d.walsh
                    var scrollDiv = document.createElement('div');
                    scrollDiv.className = ClassName.SCROLLBAR_MEASURER;
                    document.body.appendChild(scrollDiv);
                    var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
                    document.body.removeChild(scrollDiv);
                    return scrollbarWidth;
                }; // Static


                Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
                    return this.each(function () {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = _objectSpread({}, Default, $$$1(this).data(), typeof config === 'object' && config ? config : {});

                        if (!data) {
                            data = new Modal(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config](relatedTarget);
                        } else if (_config.show) {
                            data.show(relatedTarget);
                        }
                    });
                };

                _createClass(Modal, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }]);

                return Modal;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
            var _this10 = this;

            var target;
            var selector = Util.getSelectorFromElement(this);

            if (selector) {
                target = document.querySelector(selector);
            }

            var config = $$$1(target).data(DATA_KEY) ? 'toggle' : _objectSpread({}, $$$1(target).data(), $$$1(this).data());

            if (this.tagName === 'A' || this.tagName === 'AREA') {
                event.preventDefault();
            }

            var $target = $$$1(target).one(Event.SHOW, function (showEvent) {
                if (showEvent.isDefaultPrevented()) {
                    // Only register focus restorer if modal will actually get shown
                    return;
                }

                $target.one(Event.HIDDEN, function () {
                    if ($$$1(_this10).is(':visible')) {
                        _this10.focus();
                    }
                });
            });

            Modal._jQueryInterface.call($$$1(target), config, this);
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Modal._jQueryInterface;
        $$$1.fn[NAME].Constructor = Modal;

        $$$1.fn[NAME].noConflict = function () {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Modal._jQueryInterface;
        };

        return Modal;
    }($);

    return Modal;

})));

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
        typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
            (global.ScrollSpy = factory(global.jQuery, global.Util));
}(this, (function ($, Util) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Util = Util && Util.hasOwnProperty('default') ? Util['default'] : Util;

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);

            if (typeof Object.getOwnPropertySymbols === 'function') {
                ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
                    return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                }));
            }

            ownKeys.forEach(function (key) {
                _defineProperty(target, key, source[key]);
            });
        }

        return target;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.1.3): scrollspy.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var ScrollSpy = function ($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'scrollspy';
        var VERSION = '4.1.3';
        var DATA_KEY = 'bs.scrollspy';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var Default = {
            offset: 10,
            method: 'auto',
            target: ''
        };
        var DefaultType = {
            offset: 'number',
            method: 'string',
            target: '(string|element)'
        };
        var Event = {
            ACTIVATE: "activate" + EVENT_KEY,
            SCROLL: "scroll" + EVENT_KEY,
            LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            DROPDOWN_ITEM: 'dropdown-item',
            DROPDOWN_MENU: 'dropdown-menu',
            ACTIVE: 'active'
        };
        var Selector = {
            DATA_SPY: '[data-spy="scroll"]',
            ACTIVE: '.active',
            NAV_LIST_GROUP: '.nav, .list-group',
            NAV_LINKS: '.nav-link',
            NAV_ITEMS: '.nav-item',
            LIST_ITEMS: '.list-group-item',
            DROPDOWN: '.dropdown',
            DROPDOWN_ITEMS: '.dropdown-item',
            DROPDOWN_TOGGLE: '.dropdown-toggle'
        };
        var OffsetMethod = {
            OFFSET: 'offset',
            POSITION: 'position'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var ScrollSpy =
            /*#__PURE__*/
            function () {
                function ScrollSpy(element, config) {
                    var _this = this;

                    this._element = element;
                    this._scrollElement = element.tagName === 'BODY' ? window : element;
                    this._config = this._getConfig(config);
                    this._selector = this._config.target + " " + Selector.NAV_LINKS + "," + (this._config.target + " " + Selector.LIST_ITEMS + ",") + (this._config.target + " " + Selector.DROPDOWN_ITEMS);
                    this._offsets = [];
                    this._targets = [];
                    this._activeTarget = null;
                    this._scrollHeight = 0;
                    $$$1(this._scrollElement).on(Event.SCROLL, function (event) {
                        return _this._process(event);
                    });
                    this.refresh();

                    this._process();
                } // Getters


                var _proto = ScrollSpy.prototype;

                // Public
                _proto.refresh = function refresh() {
                    var _this2 = this;

                    var autoMethod = this._scrollElement === this._scrollElement.window ? OffsetMethod.OFFSET : OffsetMethod.POSITION;
                    var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;
                    var offsetBase = offsetMethod === OffsetMethod.POSITION ? this._getScrollTop() : 0;
                    this._offsets = [];
                    this._targets = [];
                    this._scrollHeight = this._getScrollHeight();
                    var targets = [].slice.call(document.querySelectorAll(this._selector));
                    targets.map(function (element) {
                        var target;
                        var targetSelector = Util.getSelectorFromElement(element);

                        if (targetSelector) {
                            target = document.querySelector(targetSelector);
                        }

                        if (target) {
                            var targetBCR = target.getBoundingClientRect();

                            if (targetBCR.width || targetBCR.height) {
                                // TODO (fat): remove sketch reliance on jQuery position/offset
                                return [$$$1(target)[offsetMethod]().top + offsetBase, targetSelector];
                            }
                        }

                        return null;
                    }).filter(function (item) {
                        return item;
                    }).sort(function (a, b) {
                        return a[0] - b[0];
                    }).forEach(function (item) {
                        _this2._offsets.push(item[0]);

                        _this2._targets.push(item[1]);
                    });
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    $$$1(this._scrollElement).off(EVENT_KEY);
                    this._element = null;
                    this._scrollElement = null;
                    this._config = null;
                    this._selector = null;
                    this._offsets = null;
                    this._targets = null;
                    this._activeTarget = null;
                    this._scrollHeight = null;
                }; // Private


                _proto._getConfig = function _getConfig(config) {
                    config = _objectSpread({}, Default, typeof config === 'object' && config ? config : {});

                    if (typeof config.target !== 'string') {
                        var id = $$$1(config.target).attr('id');

                        if (!id) {
                            id = Util.getUID(NAME);
                            $$$1(config.target).attr('id', id);
                        }

                        config.target = "#" + id;
                    }

                    Util.typeCheckConfig(NAME, config, DefaultType);
                    return config;
                };

                _proto._getScrollTop = function _getScrollTop() {
                    return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
                };

                _proto._getScrollHeight = function _getScrollHeight() {
                    return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                };

                _proto._getOffsetHeight = function _getOffsetHeight() {
                    return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
                };

                _proto._process = function _process() {
                    var scrollTop = this._getScrollTop() + this._config.offset;

                    var scrollHeight = this._getScrollHeight();

                    var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

                    if (this._scrollHeight !== scrollHeight) {
                        this.refresh();
                    }

                    if (scrollTop >= maxScroll) {
                        var target = this._targets[this._targets.length - 1];

                        if (this._activeTarget !== target) {
                            this._activate(target);
                        }

                        return;
                    }

                    if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
                        this._activeTarget = null;

                        this._clear();

                        return;
                    }

                    var offsetLength = this._offsets.length;

                    for (var i = offsetLength; i--;) {
                        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]);

                        if (isActiveTarget) {
                            this._activate(this._targets[i]);
                        }
                    }
                };

                _proto._activate = function _activate(target) {
                    this._activeTarget = target;

                    this._clear();

                    var queries = this._selector.split(','); // eslint-disable-next-line arrow-body-style


                    queries = queries.map(function (selector) {
                        return selector + "[data-target=\"" + target + "\"]," + (selector + "[href=\"" + target + "\"]");
                    });
                    var $link = $$$1([].slice.call(document.querySelectorAll(queries.join(','))));

                    if ($link.hasClass(ClassName.DROPDOWN_ITEM)) {
                        $link.closest(Selector.DROPDOWN).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
                        $link.addClass(ClassName.ACTIVE);
                    } else {
                        // Set triggered link as active
                        $link.addClass(ClassName.ACTIVE); // Set triggered links parents as active
                        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor

                        $link.parents(Selector.NAV_LIST_GROUP).prev(Selector.NAV_LINKS + ", " + Selector.LIST_ITEMS).addClass(ClassName.ACTIVE); // Handle special case when .nav-link is inside .nav-item

                        $link.parents(Selector.NAV_LIST_GROUP).prev(Selector.NAV_ITEMS).children(Selector.NAV_LINKS).addClass(ClassName.ACTIVE);
                    }

                    $$$1(this._scrollElement).trigger(Event.ACTIVATE, {
                        relatedTarget: target
                    });
                };

                _proto._clear = function _clear() {
                    var nodes = [].slice.call(document.querySelectorAll(this._selector));
                    $$$1(nodes).filter(Selector.ACTIVE).removeClass(ClassName.ACTIVE);
                }; // Static


                ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function () {
                        var data = $$$1(this).data(DATA_KEY);

                        var _config = typeof config === 'object' && config;

                        if (!data) {
                            data = new ScrollSpy(this, _config);
                            $$$1(this).data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                _createClass(ScrollSpy, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }, {
                    key: "Default",
                    get: function get() {
                        return Default;
                    }
                }]);

                return ScrollSpy;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(window).on(Event.LOAD_DATA_API, function () {
            var scrollSpys = [].slice.call(document.querySelectorAll(Selector.DATA_SPY));
            var scrollSpysLength = scrollSpys.length;

            for (var i = scrollSpysLength; i--;) {
                var $spy = $$$1(scrollSpys[i]);

                ScrollSpy._jQueryInterface.call($spy, $spy.data());
            }
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = ScrollSpy._jQueryInterface;
        $$$1.fn[NAME].Constructor = ScrollSpy;

        $$$1.fn[NAME].noConflict = function () {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return ScrollSpy._jQueryInterface;
        };

        return ScrollSpy;
    }($);

    return ScrollSpy;

})));

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('./util.js')) :
        typeof define === 'function' && define.amd ? define(['jquery', './util.js'], factory) :
            (global.Tab = factory(global.jQuery, global.Util));
}(this, (function ($, Util) {
    'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Util = Util && Util.hasOwnProperty('default') ? Util['default'] : Util;

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    /**
     * --------------------------------------------------------------------------
     * Bootstrap (v4.1.3): tab.js
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     * --------------------------------------------------------------------------
     */

    var Tab = function ($$$1) {
        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */
        var NAME = 'tab';
        var VERSION = '4.1.3';
        var DATA_KEY = 'bs.tab';
        var EVENT_KEY = "." + DATA_KEY;
        var DATA_API_KEY = '.data-api';
        var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
        var Event = {
            HIDE: "hide" + EVENT_KEY,
            HIDDEN: "hidden" + EVENT_KEY,
            SHOW: "show" + EVENT_KEY,
            SHOWN: "shown" + EVENT_KEY,
            CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
        };
        var ClassName = {
            DROPDOWN_MENU: 'dropdown-menu',
            ACTIVE: 'active',
            DISABLED: 'disabled',
            FADE: 'fade',
            SHOW: 'show'
        };
        var Selector = {
            DROPDOWN: '.dropdown',
            NAV_LIST_GROUP: '.nav, .list-group',
            ACTIVE: '.active',
            ACTIVE_UL: '> li > .active',
            DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
            DROPDOWN_TOGGLE: '.dropdown-toggle',
            DROPDOWN_ACTIVE_CHILD: '> .dropdown-menu .active'
            /**
             * ------------------------------------------------------------------------
             * Class Definition
             * ------------------------------------------------------------------------
             */

        };

        var Tab =
            /*#__PURE__*/
            function () {
                function Tab(element) {
                    this._element = element;
                } // Getters


                var _proto = Tab.prototype;

                // Public
                _proto.show = function show() {
                    var _this = this;

                    if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $$$1(this._element).hasClass(ClassName.ACTIVE) || $$$1(this._element).hasClass(ClassName.DISABLED)) {
                        return;
                    }

                    var target;
                    var previous;
                    var listElement = $$$1(this._element).closest(Selector.NAV_LIST_GROUP)[0];
                    var selector = Util.getSelectorFromElement(this._element);

                    if (listElement) {
                        var itemSelector = listElement.nodeName === 'UL' ? Selector.ACTIVE_UL : Selector.ACTIVE;
                        previous = $$$1.makeArray($$$1(listElement).find(itemSelector));
                        previous = previous[previous.length - 1];
                    }

                    var hideEvent = $$$1.Event(Event.HIDE, {
                        relatedTarget: this._element
                    });
                    var showEvent = $$$1.Event(Event.SHOW, {
                        relatedTarget: previous
                    });

                    if (previous) {
                        $$$1(previous).trigger(hideEvent);
                    }

                    $$$1(this._element).trigger(showEvent);

                    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
                        return;
                    }

                    if (selector) {
                        target = document.querySelector(selector);
                    }

                    this._activate(this._element, listElement);

                    var complete = function complete() {
                        var hiddenEvent = $$$1.Event(Event.HIDDEN, {
                            relatedTarget: _this._element
                        });
                        var shownEvent = $$$1.Event(Event.SHOWN, {
                            relatedTarget: previous
                        });
                        $$$1(previous).trigger(hiddenEvent);
                        $$$1(_this._element).trigger(shownEvent);
                    };

                    if (target) {
                        this._activate(target, target.parentNode, complete);
                    } else {
                        complete();
                    }
                };

                _proto.dispose = function dispose() {
                    $$$1.removeData(this._element, DATA_KEY);
                    this._element = null;
                }; // Private


                _proto._activate = function _activate(element, container, callback) {
                    var _this2 = this;

                    var activeElements;

                    if (container.nodeName === 'UL') {
                        activeElements = $$$1(container).find(Selector.ACTIVE_UL);
                    } else {
                        activeElements = $$$1(container).children(Selector.ACTIVE);
                    }

                    var active = activeElements[0];
                    var isTransitioning = callback && active && $$$1(active).hasClass(ClassName.FADE);

                    var complete = function complete() {
                        return _this2._transitionComplete(element, active, callback);
                    };

                    if (active && isTransitioning) {
                        var transitionDuration = Util.getTransitionDurationFromElement(active);
                        $$$1(active).one(Util.TRANSITION_END, complete).emulateTransitionEnd(transitionDuration);
                    } else {
                        complete();
                    }
                };

                _proto._transitionComplete = function _transitionComplete(element, active, callback) {
                    if (active) {
                        $$$1(active).removeClass(ClassName.SHOW + " " + ClassName.ACTIVE);
                        var dropdownChild = $$$1(active.parentNode).find(Selector.DROPDOWN_ACTIVE_CHILD)[0];

                        if (dropdownChild) {
                            $$$1(dropdownChild).removeClass(ClassName.ACTIVE);
                        }

                        if (active.getAttribute('role') === 'tab') {
                            active.setAttribute('aria-selected', false);
                        }
                    }

                    $$$1(element).addClass(ClassName.ACTIVE);

                    if (element.getAttribute('role') === 'tab') {
                        element.setAttribute('aria-selected', true);
                    }

                    Util.reflow(element);
                    $$$1(element).addClass(ClassName.SHOW);

                    if (element.parentNode && $$$1(element.parentNode).hasClass(ClassName.DROPDOWN_MENU)) {
                        var dropdownElement = $$$1(element).closest(Selector.DROPDOWN)[0];

                        if (dropdownElement) {
                            var dropdownToggleList = [].slice.call(dropdownElement.querySelectorAll(Selector.DROPDOWN_TOGGLE));
                            $$$1(dropdownToggleList).addClass(ClassName.ACTIVE);
                        }

                        element.setAttribute('aria-expanded', true);
                    }

                    if (callback) {
                        callback();
                    }
                }; // Static


                Tab._jQueryInterface = function _jQueryInterface(config) {
                    return this.each(function () {
                        var $this = $$$1(this);
                        var data = $this.data(DATA_KEY);

                        if (!data) {
                            data = new Tab(this);
                            $this.data(DATA_KEY, data);
                        }

                        if (typeof config === 'string') {
                            if (typeof data[config] === 'undefined') {
                                throw new TypeError("No method named \"" + config + "\"");
                            }

                            data[config]();
                        }
                    });
                };

                _createClass(Tab, null, [{
                    key: "VERSION",
                    get: function get() {
                        return VERSION;
                    }
                }]);

                return Tab;
            }();
        /**
         * ------------------------------------------------------------------------
         * Data Api implementation
         * ------------------------------------------------------------------------
         */


        $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
            event.preventDefault();

            Tab._jQueryInterface.call($$$1(this), 'show');
        });
        /**
         * ------------------------------------------------------------------------
         * jQuery
         * ------------------------------------------------------------------------
         */

        $$$1.fn[NAME] = Tab._jQueryInterface;
        $$$1.fn[NAME].Constructor = Tab;

        $$$1.fn[NAME].noConflict = function () {
            $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
            return Tab._jQueryInterface;
        };

        return Tab;
    }($);

    return Tab;

})));

/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
; (function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function ($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this, dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function (slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function () {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof (index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof (index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function (now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function () {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function () {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function (index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if (asNavFor !== null && typeof asNavFor === 'object') {
            asNavFor.each(function () {
                var target = $(this).slick('getSlick');
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        _.autoPlayClear();

        if (_.slideCount > _.options.slidesToShow) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if (!_.paused && !_.interrupted && !_.focussed) {

            if (_.options.infinite === false) {

                if (_.direction === 1 && (_.currentSlide + 1) === (_.slideCount - 1)) {
                    _.direction = 0;
                }

                else if (_.direction === 0) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if (_.currentSlide - 1 === 0) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler(slideTo);

        }

    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if (_.slideCount > _.options.slidesToShow) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add(_.$nextArrow)

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function () {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active');

        }

    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides =
            _.$slider
                .children(_.options.slide + ':not(.slick-cloned)')
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function () {

        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 0) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width': (100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function (initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                            targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if ($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if (!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function () {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this, originalSlides;

        if (_.options.rows > 0) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function (refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.$prevArrow.length) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display', '');

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }
        }

        if (_.$nextArrow && _.$nextArrow.length) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display', '');

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }
        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function () {
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if (!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function (slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function () {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick', '*', function (event) {

                event.stopImmediatePropagation();
                var $sf = $(this);

                setTimeout(function () {

                    if (_.options.pauseOnFocus) {
                        _.focussed = $sf.is(':focus');
                        _.autoPlay();
                    }

                }, 0);

            });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if (!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                coef = -1

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2
                    }
                }
                verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft = 0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function () {

        return this;

    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function (creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if (_.options.autoplay) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function () {
        var _ = this,
            numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
            tabControlIndexes = _.getNavigableIndexes().filter(function (val) {
                return (val >= 0) && (val < _.slideCount);
            });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                    var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex
                    if ($('#' + ariaButtonControl).length) {
                        $(this).attr({
                            'aria-describedby': ariaButtonControl
                        });
                    }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function (i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': (i + 1) + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });

            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
            if (_.options.focusOnChange) {
                _.$slides.eq(i).attr({ 'tabindex': '0' });
            } else {
                _.$slides.eq(i).removeAttr('tabindex');
            }
        }

        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
                .off('click.slick')
                .on('click.slick', {
                    message: 'previous'
                }, _.changeSlide);
            _.$nextArrow
                .off('click.slick')
                .on('click.slick', {
                    message: 'next'
                }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }

    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function () {

        var _ = this;

        if (_.options.pauseOnHover) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(_.setPosition);

    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' : 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function () {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {

                    image
                        .animate({ opacity: 0 }, 100, function () {

                            if (imageSrcSet) {
                                image
                                    .attr('srcset', imageSrcSet);

                                if (imageSizes) {
                                    image
                                        .attr('sizes', imageSizes);
                                }
                            }

                            image
                                .attr('src', imageSource)
                                .animate({ opacity: 1 }, 200, function () {
                                    image
                                        .removeAttr('data-lazy data-srcset data-sizes')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function () {

                    image
                        .removeAttr('data-lazy')
                        .removeClass('slick-loading')
                        .addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
            if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
                loadImages(cloneRange);
            } else if (_.currentSlide === 0) {
                cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
                loadImages(cloneRange);
            }

    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        if (!_.unslicked) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if (_.options.autoplay) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function (event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function (tryCount) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $('img[data-lazy]', _.$slider),
            image,
            imageSource,
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ($imgsToLoad.length) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function () {

                if (imageSrcSet) {
                    image
                        .attr('srcset', imageSrcSet);

                    if (imageSizes) {
                        image
                            .attr('sizes', imageSizes);
                    }
                }

                image
                    .attr('src', imageSource)
                    .removeAttr('data-lazy data-srcset data-sizes')
                    .removeClass('slick-loading');

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function () {

                if (tryCount < 3) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout(function () {
                        _.progressiveLazyLoad(tryCount + 1);
                    }, 500);

                } else {

                    image
                        .removeAttr('data-lazy')
                        .removeClass('slick-loading')
                        .addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [_]);

        }

    };

    Slick.prototype.refresh = function (initializing) {

        var _ = this, currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if (!_.options.infinite && (_.currentSlide > lastVisibleIndex)) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, { currentSlide: currentSlide });

        _.init();

        if (!initializing) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function () {

        var _ = this, breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

            _.respondTo = _.options.respondTo || 'window';

            for (breakpoint in responsiveSettings) {

                l = _.breakpoints.length - 1;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function (a, b) {
                return (_.options.mobileFirst) ? a - b : b - a;
            });

        }

    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides =
            _.$slideTrack
                .children(_.options.slide)
                .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) { _.setPosition(); }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof (index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function () {

        var _ = this,
            targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
        Slick.prototype.slickSetOption = function () {

            /**
             * accepts arguments in format of:
             *
             *  - for changing a single option's value:
             *     .slick("setOption", option, value, refresh )
             *
             *  - for changing a set of responsive options:
             *     .slick("setOption", 'responsive', [{}, ...], refresh )
             *
             *  - for updating multiple values at once (not responsive)
             *     .slick("setOption", { 'option': value, ... }, refresh )
             */

            var _ = this, l, item, option, value, refresh = false, type;

            if ($.type(arguments[0]) === 'object') {

                option = arguments[0];
                refresh = arguments[1];
                type = 'multiple';

            } else if ($.type(arguments[0]) === 'string') {

                option = arguments[0];
                value = arguments[1];
                refresh = arguments[2];

                if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

                    type = 'responsive';

                } else if (typeof arguments[1] !== 'undefined') {

                    type = 'single';

                }

            }

            if (type === 'single') {

                _.options[option] = value;


            } else if (type === 'multiple') {

                $.each(option, function (opt, val) {

                    _.options[opt] = val;

                });


            } else if (type === 'responsive') {

                for (item in value) {

                    if ($.type(_.options.responsive) !== 'array') {

                        _.options.responsive = [value[item]];

                    } else {

                        l = _.options.responsive.length - 1;

                        // loop through the responsive object and splice out duplicates.
                        while (l >= 0) {

                            if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

                                _.options.responsive.splice(l, 1);

                            }

                            l--;

                        }

                        _.options.responsive.push(value[item]);

                    }

                }

            }

            if (refresh) {

                _.unload();
                _.reinit();

            }

        };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function () {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (_.options.fade) {
            if (typeof _.options.zIndex === 'number') {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides
                        .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                    infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function (toggle) {

        var _ = this;

        if (!toggle) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
                $(event.target) :
                $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.slideHandler(index, false, true);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this, navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if (_.options.asNavFor) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function () {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

        _.interrupted = false;
        _.shouldClick = (_.touchObject.swipeLength > 10) ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            direction = _.swipeDirection();

            switch (direction) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable(_.currentSlide + _.getSlideCount()) :
                            _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                            _.checkNavigable(_.currentSlide - _.getSlideCount()) :
                            _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if (direction != 'vertical') {

                _.slideHandler(slideCount);
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction]);

            }

        } else {

            if (_.touchObject.startX !== _.touchObject.curX) {

                _.slideHandler(_.currentSlide);
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function (fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                .removeClass('slick-active')
                .end();

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active');

        }

    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (_.options.autoplay) {

            if (document[_.hidden]) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function () {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

/*!
 * Bootstrap-select v1.13.3 (https://developer.snapappointments.com/bootstrap-select)
 *
 * Copyright 2012-2018 SnapAppointments, LLC
 * Licensed under MIT (https://github.com/snapappointments/bootstrap-select/blob/master/LICENSE)
 */

(function (root, factory) {
    if (root === undefined && window !== undefined) root = window;
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module unless amdModuleId is set
        define(["jquery"], function (a0) {
            return (factory(a0));
        });
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"));
    } else {
        factory(root["jQuery"]);
    }
}(this, function (jQuery) {

    (function ($) {
        'use strict';

        var testElement = document.createElement('_');

        testElement.classList.toggle('c3', false);

        // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
        // support the second argument.
        if (testElement.classList.contains('c3')) {
            var _toggle = DOMTokenList.prototype.toggle;

            DOMTokenList.prototype.toggle = function (token, force) {
                if (1 in arguments && !this.contains(token) === !force) {
                    return force;
                } else {
                    return _toggle.call(this, token);
                }
            };
        }

        // shallow array comparison
        function isEqual(array1, array2) {
            return array1.length === array2.length && array1.every(function (element, index) {
                return element === array2[index];
            });
        };

        //<editor-fold desc="Shims">
        if (!String.prototype.startsWith) {
            (function () {
                'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
                var defineProperty = (function () {
                    // IE 8 only supports `Object.defineProperty` on DOM elements
                    try {
                        var object = {};
                        var $defineProperty = Object.defineProperty;
                        var result = $defineProperty(object, object, object) && $defineProperty;
                    } catch (error) {
                    }
                    return result;
                }());
                var toString = {}.toString;
                var startsWith = function (search) {
                    if (this == null) {
                        throw new TypeError();
                    }
                    var string = String(this);
                    if (search && toString.call(search) == '[object RegExp]') {
                        throw new TypeError();
                    }
                    var stringLength = string.length;
                    var searchString = String(search);
                    var searchLength = searchString.length;
                    var position = arguments.length > 1 ? arguments[1] : undefined;
                    // `ToInteger`
                    var pos = position ? Number(position) : 0;
                    if (pos != pos) { // better `isNaN`
                        pos = 0;
                    }
                    var start = Math.min(Math.max(pos, 0), stringLength);
                    // Avoid the `indexOf` call if no match is possible
                    if (searchLength + start > stringLength) {
                        return false;
                    }
                    var index = -1;
                    while (++index < searchLength) {
                        if (string.charCodeAt(start + index) != searchString.charCodeAt(index)) {
                            return false;
                        }
                    }
                    return true;
                };
                if (defineProperty) {
                    defineProperty(String.prototype, 'startsWith', {
                        'value': startsWith,
                        'configurable': true,
                        'writable': true
                    });
                } else {
                    String.prototype.startsWith = startsWith;
                }
            }());
        }

        if (!Object.keys) {
            Object.keys = function (
                o, // object
                k, // key
                r  // result array
            ) {
                // initialize object and result
                r = [];
                // iterate over object keys
                for (k in o)
                    // fill result array with non-prototypical keys
                    r.hasOwnProperty.call(o, k) && r.push(k);
                // return result
                return r;
            };
        }

        // much faster than $.val()
        function getSelectValues(select) {
            var result = [];
            var options = select && select.options;
            var opt;

            if (select.multiple) {
                for (var i = 0, len = options.length; i < len; i++) {
                    opt = options[i];

                    if (opt.selected) {
                        result.push(opt.value || opt.text);
                    }
                }
            } else {
                result = select.value;
            }

            return result;
        }

        // set data-selected on select element if the value has been programmatically selected
        // prior to initialization of bootstrap-select
        // * consider removing or replacing an alternative method *
        var valHooks = {
            useDefault: false,
            _set: $.valHooks.select.set
        };

        $.valHooks.select.set = function (elem, value) {
            if (value && !valHooks.useDefault) $(elem).data('selected', true);

            return valHooks._set.apply(this, arguments);
        };

        var changed_arguments = null;

        var EventIsSupported = (function () {
            try {
                new Event('change');
                return true;
            } catch (e) {
                return false;
            }
        })();

        $.fn.triggerNative = function (eventName) {
            var el = this[0],
                event;

            if (el.dispatchEvent) { // for modern browsers & IE9+
                if (EventIsSupported) {
                    // For modern browsers
                    event = new Event(eventName, {
                        bubbles: true
                    });
                } else {
                    // For IE since it doesn't support Event constructor
                    event = document.createEvent('Event');
                    event.initEvent(eventName, true, false);
                }

                el.dispatchEvent(event);
            } else if (el.fireEvent) { // for IE8
                event = document.createEventObject();
                event.eventType = eventName;
                el.fireEvent('on' + eventName, event);
            } else {
                // fall back to jQuery.trigger
                this.trigger(eventName);
            }
        };
        //</editor-fold>

        function stringSearch(li, searchString, method, normalize) {
            var stringTypes = [
                'content',
                'subtext',
                'tokens'
            ],
                searchSuccess = false;

            for (var i = 0; i < stringTypes.length; i++) {
                var stringType = stringTypes[i],
                    string = li[stringType];

                if (string) {
                    string = string.toString();

                    // Strip HTML tags. This isn't perfect, but it's much faster than any other method
                    if (stringType === 'content') {
                        string = string.replace(/<[^>]+>/g, '');
                    }

                    if (normalize) string = normalizeToBase(string);
                    string = string.toUpperCase();

                    if (method === 'contains') {
                        searchSuccess = string.indexOf(searchString) >= 0;
                    } else {
                        searchSuccess = string.startsWith(searchString);
                    }

                    if (searchSuccess) break;
                }
            }

            return searchSuccess;
        }

        function toInteger(value) {
            return parseInt(value, 10) || 0;
        }

        /**
         * Remove all diatrics from the given text.
         * @access private
         * @param {String} text
         * @returns {String}
         */
        function normalizeToBase(text) {
            var rExps = [
                { re: /[\xC0-\xC6]/g, ch: "A" },
                { re: /[\xE0-\xE6]/g, ch: "a" },
                { re: /[\xC8-\xCB]/g, ch: "E" },
                { re: /[\xE8-\xEB]/g, ch: "e" },
                { re: /[\xCC-\xCF]/g, ch: "I" },
                { re: /[\xEC-\xEF]/g, ch: "i" },
                { re: /[\xD2-\xD6]/g, ch: "O" },
                { re: /[\xF2-\xF6]/g, ch: "o" },
                { re: /[\xD9-\xDC]/g, ch: "U" },
                { re: /[\xF9-\xFC]/g, ch: "u" },
                { re: /[\xC7-\xE7]/g, ch: "c" },
                { re: /[\xD1]/g, ch: "N" },
                { re: /[\xF1]/g, ch: "n" }
            ];
            $.each(rExps, function () {
                text = text ? text.replace(this.re, this.ch) : '';
            });
            return text;
        }


        // List of HTML entities for escaping.
        var escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
        };

        var unescapeMap = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#x27;': "'",
            '&#x60;': '`'
        };

        // Functions for escaping and unescaping strings to/from HTML interpolation.
        var createEscaper = function (map) {
            var escaper = function (match) {
                return map[match];
            };
            // Regexes for identifying a key that needs to be escaped.
            var source = '(?:' + Object.keys(map).join('|') + ')';
            var testRegexp = RegExp(source);
            var replaceRegexp = RegExp(source, 'g');
            return function (string) {
                string = string == null ? '' : '' + string;
                return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
            };
        };

        var htmlEscape = createEscaper(escapeMap);
        var htmlUnescape = createEscaper(unescapeMap);

        /**
         * ------------------------------------------------------------------------
         * Constants
         * ------------------------------------------------------------------------
         */

        var keyCodeMap = {
            32: ' ',
            48: '0',
            49: '1',
            50: '2',
            51: '3',
            52: '4',
            53: '5',
            54: '6',
            55: '7',
            56: '8',
            57: '9',
            59: ';',
            65: 'A',
            66: 'B',
            67: 'C',
            68: 'D',
            69: 'E',
            70: 'F',
            71: 'G',
            72: 'H',
            73: 'I',
            74: 'J',
            75: 'K',
            76: 'L',
            77: 'M',
            78: 'N',
            79: 'O',
            80: 'P',
            81: 'Q',
            82: 'R',
            83: 'S',
            84: 'T',
            85: 'U',
            86: 'V',
            87: 'W',
            88: 'X',
            89: 'Y',
            90: 'Z',
            96: '0',
            97: '1',
            98: '2',
            99: '3',
            100: '4',
            101: '5',
            102: '6',
            103: '7',
            104: '8',
            105: '9'
        };

        var keyCodes = {
            ESCAPE: 27, // KeyboardEvent.which value for Escape (Esc) key
            ENTER: 13, // KeyboardEvent.which value for Enter key
            SPACE: 32, // KeyboardEvent.which value for space key
            TAB: 9, // KeyboardEvent.which value for tab key
            ARROW_UP: 38, // KeyboardEvent.which value for up arrow key
            ARROW_DOWN: 40 // KeyboardEvent.which value for down arrow key
        }

        var version = {
            success: false,
            major: '3'
        };

        try {
            version.full = ($.fn.dropdown.Constructor.VERSION || '').split(' ')[0].split('.');
            version.major = version.full[0];
            version.success = true;
        }
        catch (err) {
            console.warn(
                'There was an issue retrieving Bootstrap\'s version. ' +
                'Ensure Bootstrap is being loaded before bootstrap-select and there is no namespace collision. ' +
                'If loading Bootstrap asynchronously, the version may need to be manually specified via $.fn.selectpicker.Constructor.BootstrapVersion.'
                , err);
        }

        var classNames = {
            DISABLED: 'disabled',
            DIVIDER: 'divider',
            SHOW: 'open',
            DROPUP: 'dropup',
            MENU: 'dropdown-menu',
            MENURIGHT: 'dropdown-menu-right',
            MENULEFT: 'dropdown-menu-left',
            // to-do: replace with more advanced template/customization options
            BUTTONCLASS: 'btn-default',
            POPOVERHEADER: 'popover-title'
        }

        var Selector = {
            MENU: '.' + classNames.MENU
        }

        if (version.major === '4') {
            classNames.DIVIDER = 'dropdown-divider';
            classNames.SHOW = 'show';
            classNames.BUTTONCLASS = 'btn-light';
            classNames.POPOVERHEADER = 'popover-header';
        }

        var REGEXP_ARROW = new RegExp(keyCodes.ARROW_UP + '|' + keyCodes.ARROW_DOWN);
        var REGEXP_TAB_OR_ESCAPE = new RegExp('^' + keyCodes.TAB + '$|' + keyCodes.ESCAPE);
        var REGEXP_ENTER_OR_SPACE = new RegExp(keyCodes.ENTER + '|' + keyCodes.SPACE);

        var Selectpicker = function (element, options) {
            var that = this;

            // bootstrap-select has been initialized - revert valHooks.select.set back to its original function
            if (!valHooks.useDefault) {
                $.valHooks.select.set = valHooks._set;
                valHooks.useDefault = true;
            }

            this.$element = $(element);
            this.$newElement = null;
            this.$button = null;
            this.$menu = null;
            this.options = options;
            this.selectpicker = {
                main: {
                    // store originalIndex (key) and newIndex (value) in this.selectpicker.main.map.newIndex for fast accessibility
                    // allows us to do this.main.elements[this.selectpicker.main.map.newIndex[index]] to select an element based on the originalIndex
                    map: {
                        newIndex: {},
                        originalIndex: {}
                    }
                },
                current: {
                    map: {}
                }, // current changes if a search is in progress
                search: {
                    map: {}
                },
                view: {},
                keydown: {
                    keyHistory: '',
                    resetKeyHistory: {
                        start: function () {
                            return setTimeout(function () {
                                that.selectpicker.keydown.keyHistory = '';
                            }, 800);
                        }
                    }
                }
            };
            // If we have no title yet, try to pull it from the html title attribute (jQuery doesnt' pick it up as it's not a
            // data-attribute)
            if (this.options.title === null) {
                this.options.title = this.$element.attr('title');
            }

            // Format window padding
            var winPad = this.options.windowPadding;
            if (typeof winPad === 'number') {
                this.options.windowPadding = [winPad, winPad, winPad, winPad];
            }

            //Expose public methods
            this.val = Selectpicker.prototype.val;
            this.render = Selectpicker.prototype.render;
            this.refresh = Selectpicker.prototype.refresh;
            this.setStyle = Selectpicker.prototype.setStyle;
            this.selectAll = Selectpicker.prototype.selectAll;
            this.deselectAll = Selectpicker.prototype.deselectAll;
            this.destroy = Selectpicker.prototype.destroy;
            this.remove = Selectpicker.prototype.remove;
            this.show = Selectpicker.prototype.show;
            this.hide = Selectpicker.prototype.hide;

            this.init();
        };

        Selectpicker.VERSION = '1.13.3';

        Selectpicker.BootstrapVersion = version.major;

        // part of this is duplicated in i18n/defaults-en_US.js. Make sure to update both.
        Selectpicker.DEFAULTS = {
            noneSelectedText: 'Nothing selected',
            noneResultsText: 'No results matched {0}',
            countSelectedText: function (numSelected, numTotal) {
                return (numSelected == 1) ? "{0} item selected" : "{0} items selected";
            },
            maxOptionsText: function (numAll, numGroup) {
                return [
                    (numAll == 1) ? 'Limit reached ({n} item max)' : 'Limit reached ({n} items max)',
                    (numGroup == 1) ? 'Group limit reached ({n} item max)' : 'Group limit reached ({n} items max)'
                ];
            },
            selectAllText: 'Select All',
            deselectAllText: 'Deselect All',
            doneButton: false,
            doneButtonText: 'Close',
            multipleSeparator: ', ',
            styleBase: 'btn',
            style: classNames.BUTTONCLASS,
            size: 'auto',
            title: null,
            selectedTextFormat: 'values',
            width: false,
            container: false,
            hideDisabled: false,
            showSubtext: false,
            showIcon: true,
            showContent: true,
            dropupAuto: true,
            header: false,
            liveSearch: false,
            liveSearchPlaceholder: null,
            liveSearchNormalize: false,
            liveSearchStyle: 'contains',
            actionsBox: false,
            iconBase: 'glyphicon',
            tickIcon: 'glyphicon-ok',
            showTick: false,
            template: {
                caret: '<span class="caret"></span>'
            },
            maxOptions: false,
            mobile: false,
            selectOnTab: false,
            dropdownAlignRight: false,
            windowPadding: 0,
            virtualScroll: 600,
            display: false
        };

        if (version.major === '4') {
            Selectpicker.DEFAULTS.style = 'btn-light';
            Selectpicker.DEFAULTS.iconBase = '';
            Selectpicker.DEFAULTS.tickIcon = 'bs-ok-default';
        }

        Selectpicker.prototype = {

            constructor: Selectpicker,

            init: function () {
                var that = this,
                    id = this.$element.attr('id');

                this.$element.addClass('bs-select-hidden');

                this.multiple = this.$element.prop('multiple');
                this.autofocus = this.$element.prop('autofocus');
                this.$newElement = this.createDropdown();
                this.createLi();
                this.$element
                    .after(this.$newElement)
                    .prependTo(this.$newElement);
                this.$button = this.$newElement.children('button');
                this.$menu = this.$newElement.children(Selector.MENU);
                this.$menuInner = this.$menu.children('.inner');
                this.$searchbox = this.$menu.find('input');

                this.$element.removeClass('bs-select-hidden');

                if (this.options.dropdownAlignRight === true) this.$menu.addClass(classNames.MENURIGHT);

                if (typeof id !== 'undefined') {
                    this.$button.attr('data-id', id);
                }

                this.checkDisabled();
                this.clickListener();
                if (this.options.liveSearch) this.liveSearchListener();
                this.render();
                this.setStyle();
                this.setWidth();
                if (this.options.container) {
                    this.selectPosition();
                } else {
                    this.$element.on('hide.bs.select', function () {
                        if (that.isVirtual()) {
                            // empty menu on close
                            var menuInner = that.$menuInner[0],
                                emptyMenu = menuInner.firstChild.cloneNode(false);

                            // replace the existing UL with an empty one - this is faster than $.empty() or innerHTML = ''
                            menuInner.replaceChild(emptyMenu, menuInner.firstChild);
                            menuInner.scrollTop = 0;
                        }
                    });
                }
                this.$menu.data('this', this);
                this.$newElement.data('this', this);
                if (this.options.mobile) this.mobile();

                this.$newElement.on({
                    'hide.bs.dropdown': function (e) {
                        that.$menuInner.attr('aria-expanded', false);
                        that.$element.trigger('hide.bs.select', e);
                    },
                    'hidden.bs.dropdown': function (e) {
                        that.$element.trigger('hidden.bs.select', e);
                    },
                    'show.bs.dropdown': function (e) {
                        that.$menuInner.attr('aria-expanded', true);
                        that.$element.trigger('show.bs.select', e);
                    },
                    'shown.bs.dropdown': function (e) {
                        that.$element.trigger('shown.bs.select', e);
                    }
                });

                if (that.$element[0].hasAttribute('required')) {
                    this.$element.on('invalid', function () {
                        that.$button.addClass('bs-invalid');

                        that.$element.on({
                            'shown.bs.select.invalid': function () {
                                that.$element
                                    .val(that.$element.val()) // set the value to hide the validation message in Chrome when menu is opened
                                    .off('shown.bs.select.invalid');
                            },
                            'rendered.bs.select': function () {
                                // if select is no longer invalid, remove the bs-invalid class
                                if (this.validity.valid) that.$button.removeClass('bs-invalid');
                                that.$element.off('rendered.bs.select');
                            }
                        });

                        that.$button.on('blur.bs.select', function () {
                            that.$element.focus().blur();
                            that.$button.off('blur.bs.select');
                        });
                    });
                }

                setTimeout(function () {
                    that.$element.trigger('loaded.bs.select');
                });
            },

            createDropdown: function () {
                // Options
                // If we are multiple or showTick option is set, then add the show-tick class
                var showTick = (this.multiple || this.options.showTick) ? ' show-tick' : '',
                    autofocus = this.autofocus ? ' autofocus' : '';

                // Elements
                var drop,
                    header = '',
                    searchbox = '',
                    actionsbox = '',
                    donebutton = '';

                if (this.options.header) {
                    header =
                        '<div class="' + classNames.POPOVERHEADER + '">' +
                        '<button type="button" class="close" aria-hidden="true">&times;</button>' +
                        this.options.header +
                        '</div>';
                }

                if (this.options.liveSearch) {
                    searchbox =
                        '<div class="bs-searchbox">' +
                        '<input type="text" class="form-control" autocomplete="off"' +
                        (
                            null === this.options.liveSearchPlaceholder ? ''
                                :
                                ' placeholder="' + htmlEscape(this.options.liveSearchPlaceholder) + '"'
                        ) +
                        ' role="textbox" aria-label="Search">' +
                        '</div>';
                }

                if (this.multiple && this.options.actionsBox) {
                    actionsbox =
                        '<div class="bs-actionsbox">' +
                        '<div class="btn-group btn-group-sm btn-block">' +
                        '<button type="button" class="actions-btn bs-select-all btn ' + classNames.BUTTONCLASS + '">' +
                        this.options.selectAllText +
                        '</button>' +
                        '<button type="button" class="actions-btn bs-deselect-all btn ' + classNames.BUTTONCLASS + '">' +
                        this.options.deselectAllText +
                        '</button>' +
                        '</div>' +
                        '</div>';
                }

                if (this.multiple && this.options.doneButton) {
                    donebutton =
                        '<div class="bs-donebutton">' +
                        '<div class="btn-group btn-block">' +
                        '<button type="button" class="btn btn-sm ' + classNames.BUTTONCLASS + '">' +
                        this.options.doneButtonText +
                        '</button>' +
                        '</div>' +
                        '</div>';
                }

                drop =
                    '<div class="dropdown bootstrap-select' + showTick + '">' +
                    '<button type="button" class="' + this.options.styleBase + ' dropdown-toggle" ' + (this.options.display === 'static' ? 'data-display="static"' : '') + 'data-toggle="dropdown"' + autofocus + ' role="button">' +
                    '<div class="filter-option">' +
                    '<div class="filter-option-inner">' +
                    '<div class="filter-option-inner-inner"></div>' +
                    '</div> ' +
                    '</div>' +
                    (
                        version.major === '4' ? ''
                            :
                            '<span class="bs-caret">' +
                            this.options.template.caret +
                            '</span>'
                    ) +
                    '</button>' +
                    '<div class="' + classNames.MENU + ' ' + (version.major === '4' ? '' : classNames.SHOW) + '" role="combobox">' +
                    header +
                    searchbox +
                    actionsbox +
                    '<div class="inner ' + classNames.SHOW + '" role="listbox" aria-expanded="false" tabindex="-1">' +
                    '<ul class="' + classNames.MENU + ' inner ' + (version.major === '4' ? classNames.SHOW : '') + '">' +
                    '</ul>' +
                    '</div>' +
                    donebutton +
                    '</div>' +
                    '</div>';

                return $(drop);
            },

            setPositionData: function () {
                this.selectpicker.view.canHighlight = [];

                for (var i = 0; i < this.selectpicker.current.data.length; i++) {
                    var li = this.selectpicker.current.data[i],
                        canHighlight = true;

                    if (li.type === 'divider') {
                        canHighlight = false;
                        li.height = this.sizeInfo.dividerHeight;
                    } else if (li.type === 'optgroup-label') {
                        canHighlight = false;
                        li.height = this.sizeInfo.dropdownHeaderHeight;
                    } else {
                        li.height = this.sizeInfo.liHeight;
                    }

                    if (li.disabled) canHighlight = false;

                    this.selectpicker.view.canHighlight.push(canHighlight);

                    li.position = (i === 0 ? 0 : this.selectpicker.current.data[i - 1].position) + li.height;
                }
            },

            isVirtual: function () {
                return (this.options.virtualScroll !== false) && this.selectpicker.main.elements.length >= this.options.virtualScroll || this.options.virtualScroll === true;
            },

            createView: function (isSearching, scrollTop) {
                scrollTop = scrollTop || 0;

                var that = this;

                this.selectpicker.current = isSearching ? this.selectpicker.search : this.selectpicker.main;

                var $lis;
                var active = [];
                var selected;
                var prevActive;
                var activeIndex;
                var prevActiveIndex;

                this.setPositionData();

                scroll(scrollTop, true);

                this.$menuInner.off('scroll.createView').on('scroll.createView', function (e, updateValue) {
                    if (!that.noScroll) scroll(this.scrollTop, updateValue);
                    that.noScroll = false;
                });

                function scroll(scrollTop, init) {
                    var size = that.selectpicker.current.elements.length,
                        chunks = [],
                        chunkSize,
                        chunkCount,
                        firstChunk,
                        lastChunk,
                        currentChunk = undefined,
                        prevPositions,
                        positionIsDifferent,
                        previousElements,
                        menuIsDifferent = true,
                        isVirtual = that.isVirtual();

                    that.selectpicker.view.scrollTop = scrollTop;

                    if (isVirtual === true) {
                        // if an option that is encountered that is wider than the current menu width, update the menu width accordingly
                        if (that.sizeInfo.hasScrollBar && that.$menu[0].offsetWidth > that.sizeInfo.totalMenuWidth) {
                            that.sizeInfo.menuWidth = that.$menu[0].offsetWidth;
                            that.sizeInfo.totalMenuWidth = that.sizeInfo.menuWidth + that.sizeInfo.scrollBarWidth;
                            that.$menu.css('min-width', that.sizeInfo.menuWidth);
                        }
                    }

                    chunkSize = Math.ceil(that.sizeInfo.menuInnerHeight / that.sizeInfo.liHeight * 1.5); // number of options in a chunk
                    chunkCount = Math.round(size / chunkSize) || 1; // number of chunks

                    for (var i = 0; i < chunkCount; i++) {
                        var end_of_chunk = (i + 1) * chunkSize;

                        if (i === chunkCount - 1) {
                            end_of_chunk = size;
                        }

                        chunks[i] = [
                            (i) * chunkSize + (!i ? 0 : 1),
                            end_of_chunk
                        ];

                        if (!size) break;

                        if (currentChunk === undefined && scrollTop <= that.selectpicker.current.data[end_of_chunk - 1].position - that.sizeInfo.menuInnerHeight) {
                            currentChunk = i;
                        }
                    }

                    if (currentChunk === undefined) currentChunk = 0;

                    prevPositions = [that.selectpicker.view.position0, that.selectpicker.view.position1];

                    // always display previous, current, and next chunks
                    firstChunk = Math.max(0, currentChunk - 1);
                    lastChunk = Math.min(chunkCount - 1, currentChunk + 1);

                    that.selectpicker.view.position0 = Math.max(0, chunks[firstChunk][0]) || 0;
                    that.selectpicker.view.position1 = Math.min(size, chunks[lastChunk][1]) || 0;

                    positionIsDifferent = prevPositions[0] !== that.selectpicker.view.position0 || prevPositions[1] !== that.selectpicker.view.position1;

                    if (that.activeIndex !== undefined) {
                        prevActive = that.selectpicker.current.elements[that.selectpicker.current.map.newIndex[that.prevActiveIndex]];
                        active = that.selectpicker.current.elements[that.selectpicker.current.map.newIndex[that.activeIndex]];
                        selected = that.selectpicker.current.elements[that.selectpicker.current.map.newIndex[that.selectedIndex]];

                        if (init) {
                            if (that.activeIndex !== that.selectedIndex) {
                                active.classList.remove('active');
                                if (active.firstChild) active.firstChild.classList.remove('active');
                            }
                            that.activeIndex = undefined;
                        }

                        if (that.activeIndex && that.activeIndex !== that.selectedIndex && selected && selected.length) {
                            selected.classList.remove('active');
                            if (selected.firstChild) selected.firstChild.classList.remove('active');
                        }
                    }

                    if (that.prevActiveIndex !== undefined && that.prevActiveIndex !== that.activeIndex && that.prevActiveIndex !== that.selectedIndex && prevActive && prevActive.length) {
                        prevActive.classList.remove('active');
                        if (prevActive.firstChild) prevActive.firstChild.classList.remove('active');
                    }

                    if (init || positionIsDifferent) {
                        previousElements = that.selectpicker.view.visibleElements ? that.selectpicker.view.visibleElements.slice() : [];

                        that.selectpicker.view.visibleElements = that.selectpicker.current.elements.slice(that.selectpicker.view.position0, that.selectpicker.view.position1);

                        that.setOptionStatus();

                        // if searching, check to make sure the list has actually been updated before updating DOM
                        // this prevents unnecessary repaints
                        if (isSearching || (isVirtual === false && init)) menuIsDifferent = !isEqual(previousElements, that.selectpicker.view.visibleElements);

                        // if virtual scroll is disabled and not searching,
                        // menu should never need to be updated more than once
                        if ((init || isVirtual === true) && menuIsDifferent) {
                            var menuInner = that.$menuInner[0],
                                menuFragment = document.createDocumentFragment(),
                                emptyMenu = menuInner.firstChild.cloneNode(false),
                                marginTop,
                                marginBottom,
                                elements = isVirtual === true ? that.selectpicker.view.visibleElements : that.selectpicker.current.elements;

                            // replace the existing UL with an empty one - this is faster than $.empty()
                            menuInner.replaceChild(emptyMenu, menuInner.firstChild);

                            for (var i = 0, visibleElementsLen = elements.length; i < visibleElementsLen; i++) {
                                menuFragment.appendChild(elements[i]);
                            }

                            if (isVirtual === true) {
                                marginTop = (that.selectpicker.view.position0 === 0 ? 0 : that.selectpicker.current.data[that.selectpicker.view.position0 - 1].position),
                                    marginBottom = (that.selectpicker.view.position1 > size - 1 ? 0 : that.selectpicker.current.data[size - 1].position - that.selectpicker.current.data[that.selectpicker.view.position1 - 1].position);

                                menuInner.firstChild.style.marginTop = marginTop + 'px';
                                menuInner.firstChild.style.marginBottom = marginBottom + 'px';
                            }

                            menuInner.firstChild.appendChild(menuFragment);
                        }
                    }

                    that.prevActiveIndex = that.activeIndex;

                    if (!that.options.liveSearch) {
                        that.$menuInner.focus();
                    } else if (isSearching && init) {
                        var index = 0,
                            newActive;

                        if (!that.selectpicker.view.canHighlight[index]) {
                            index = 1 + that.selectpicker.view.canHighlight.slice(1).indexOf(true);
                        }

                        newActive = that.selectpicker.view.visibleElements[index];

                        if (that.selectpicker.view.currentActive) {
                            that.selectpicker.view.currentActive.classList.remove('active');
                            if (that.selectpicker.view.currentActive.firstChild) that.selectpicker.view.currentActive.firstChild.classList.remove('active');
                        }

                        if (newActive) {
                            newActive.classList.add('active');
                            if (newActive.firstChild) newActive.firstChild.classList.add('active');
                        }

                        that.activeIndex = that.selectpicker.current.map.originalIndex[index];
                    }
                }

                $(window).off('resize.createView').on('resize.createView', function () {
                    scroll(that.$menuInner[0].scrollTop);
                });
            },

            createLi: function () {
                var that = this,
                    mainElements = [],
                    widestOption,
                    availableOptionsCount = 0,
                    widestOptionLength = 0,
                    mainData = [],
                    optID = 0,
                    headerIndex = 0,
                    liIndex = -1; // increment liIndex whenever a new <li> element is created to ensure newIndex is correct

                if (!this.selectpicker.view.titleOption) this.selectpicker.view.titleOption = document.createElement('option');

                var elementTemplates = {
                    span: document.createElement('span'),
                    subtext: document.createElement('small'),
                    a: document.createElement('a'),
                    li: document.createElement('li'),
                    whitespace: document.createTextNode("\u00A0")
                },
                    checkMark,
                    fragment = document.createDocumentFragment();

                if (that.options.showTick || that.multiple) {
                    checkMark = elementTemplates.span.cloneNode(false);
                    checkMark.className = that.options.iconBase + ' ' + that.options.tickIcon + ' check-mark';
                    elementTemplates.a.appendChild(checkMark);
                }

                elementTemplates.a.setAttribute('role', 'option');

                elementTemplates.subtext.className = 'text-muted';

                elementTemplates.text = elementTemplates.span.cloneNode(false);
                elementTemplates.text.className = 'text';

                // Helper functions
                /**
                 * @param content
                 * @param [classes]
                 * @param [optgroup]
                 * @returns {HTMLElement}
                 */
                var generateLI = function (content, classes, optgroup) {
                    var li = elementTemplates.li.cloneNode(false);

                    if (content) {
                        if (content.nodeType === 1 || content.nodeType === 11) {
                            li.appendChild(content);
                        } else {
                            li.innerHTML = content;
                        }
                    }

                    if (typeof classes !== 'undefined' && '' !== classes) li.className = classes;
                    if (typeof optgroup !== 'undefined' && null !== optgroup) li.classList.add('optgroup-' + optgroup);

                    return li;
                };

                /**
                 * @param text
                 * @param [classes]
                 * @param [inline]
                 * @returns {string}
                 */
                var generateA = function (text, classes, inline) {
                    var a = elementTemplates.a.cloneNode(true);

                    if (text) {
                        if (text.nodeType === 11) {
                            a.appendChild(text);
                        } else {
                            a.insertAdjacentHTML('beforeend', text);
                        }
                    }

                    if (typeof classes !== 'undefined' & '' !== classes) a.className = classes;
                    if (version.major === '4') a.classList.add('dropdown-item');
                    if (inline) a.setAttribute('style', inline);

                    return a;
                };

                var generateText = function (options) {
                    var textElement = elementTemplates.text.cloneNode(false),
                        optionSubtextElement,
                        optionIconElement;

                    if (options.optionContent) {
                        textElement.innerHTML = options.optionContent;
                    } else {
                        textElement.textContent = options.text;

                        if (options.optionIcon) {
                            var whitespace = elementTemplates.whitespace.cloneNode(false);

                            optionIconElement = elementTemplates.span.cloneNode(false);
                            optionIconElement.className = that.options.iconBase + ' ' + options.optionIcon;

                            fragment.appendChild(optionIconElement);
                            fragment.appendChild(whitespace);
                        }

                        if (options.optionSubtext) {
                            optionSubtextElement = elementTemplates.subtext.cloneNode(false);
                            optionSubtextElement.innerHTML = options.optionSubtext;
                            textElement.appendChild(optionSubtextElement);
                        }
                    }

                    fragment.appendChild(textElement);

                    return fragment;
                };

                var generateLabel = function (options) {
                    var labelTextElement = elementTemplates.text.cloneNode(false),
                        labelSubtextElement,
                        labelIconElement;

                    labelTextElement.innerHTML = options.labelEscaped;

                    if (options.labelIcon) {
                        var whitespace = elementTemplates.whitespace.cloneNode(false);

                        labelIconElement = elementTemplates.span.cloneNode(false);
                        labelIconElement.className = that.options.iconBase + ' ' + options.labelIcon;

                        fragment.appendChild(labelIconElement);
                        fragment.appendChild(whitespace);
                    }

                    if (options.labelSubtext) {
                        labelSubtextElement = elementTemplates.subtext.cloneNode(false);
                        labelSubtextElement.textContent = options.labelSubtext;
                        labelTextElement.appendChild(labelSubtextElement);
                    }

                    fragment.appendChild(labelTextElement);

                    return fragment;
                }

                if (this.options.title && !this.multiple) {
                    // this option doesn't create a new <li> element, but does add a new option, so liIndex is decreased
                    // since newIndex is recalculated on every refresh, liIndex needs to be decreased even if the titleOption is already appended
                    liIndex--;

                    var element = this.$element[0],
                        isSelected = false,
                        titleNotAppended = !this.selectpicker.view.titleOption.parentNode;

                    if (titleNotAppended) {
                        // Use native JS to prepend option (faster)
                        this.selectpicker.view.titleOption.className = 'bs-title-option';
                        this.selectpicker.view.titleOption.value = '';

                        // Check if selected or data-selected attribute is already set on an option. If not, select the titleOption option.
                        // the selected item may have been changed by user or programmatically before the bootstrap select plugin runs,
                        // if so, the select will have the data-selected attribute
                        var $opt = $(element.options[element.selectedIndex]);
                        isSelected = $opt.attr('selected') === undefined && this.$element.data('selected') === undefined;
                    }

                    if (titleNotAppended || this.selectpicker.view.titleOption.index !== 0) {
                        element.insertBefore(this.selectpicker.view.titleOption, element.firstChild);
                    }

                    // Set selected *after* appending to select,
                    // otherwise the option doesn't get selected in IE
                    // set using selectedIndex, as setting the selected attr to true here doesn't work in IE11
                    if (isSelected) element.selectedIndex = 0;
                }

                var $selectOptions = this.$element.find('option');

                $selectOptions.each(function (index) {
                    var $this = $(this);

                    liIndex++;

                    if ($this.hasClass('bs-title-option')) return;

                    var thisData = $this.data();

                    // Get the class and text for the option
                    var optionClass = this.className || '',
                        inline = htmlEscape(this.style.cssText),
                        optionContent = thisData.content,
                        text = this.textContent,
                        tokens = thisData.tokens,
                        subtext = thisData.subtext,
                        icon = thisData.icon,
                        $parent = $this.parent(),
                        parent = $parent[0],
                        isOptgroup = parent.tagName === 'OPTGROUP',
                        isOptgroupDisabled = isOptgroup && parent.disabled,
                        isDisabled = this.disabled || isOptgroupDisabled,
                        prevHiddenIndex,
                        showDivider = this.previousElementSibling && this.previousElementSibling.tagName === 'OPTGROUP',
                        textElement;

                    var parentData = $parent.data();

                    if (thisData.hidden === true || that.options.hideDisabled && (isDisabled && !isOptgroup || isOptgroupDisabled)) {
                        // set prevHiddenIndex - the index of the first hidden option in a group of hidden options
                        // used to determine whether or not a divider should be placed after an optgroup if there are
                        // hidden options between the optgroup and the first visible option
                        prevHiddenIndex = thisData.prevHiddenIndex;
                        $this.next().data('prevHiddenIndex', (prevHiddenIndex !== undefined ? prevHiddenIndex : index));

                        liIndex--;

                        // if previous element is not an optgroup
                        if (!showDivider) {
                            if (prevHiddenIndex !== undefined) {
                                // select the element **before** the first hidden element in the group
                                var prevHidden = $selectOptions[prevHiddenIndex].previousElementSibling;

                                if (prevHidden && prevHidden.tagName === 'OPTGROUP' && !prevHidden.disabled) {
                                    showDivider = true;
                                }
                            }
                        }

                        if (showDivider && mainData[mainData.length - 1].type !== 'divider') {
                            liIndex++;
                            mainElements.push(
                                generateLI(
                                    false,
                                    classNames.DIVIDER,
                                    optID + 'div'
                                )
                            );
                            mainData.push({
                                type: 'divider',
                                optID: optID
                            });
                        }

                        return;
                    }

                    if (isOptgroup && thisData.divider !== true) {
                        if (that.options.hideDisabled && isDisabled) {
                            if (parentData.allOptionsDisabled === undefined) {
                                var $options = $parent.children();
                                $parent.data('allOptionsDisabled', $options.filter(':disabled').length === $options.length);
                            }

                            if ($parent.data('allOptionsDisabled')) {
                                liIndex--;
                                return;
                            }
                        }

                        var optGroupClass = ' ' + parent.className || '';

                        if (!this.previousElementSibling) { // Is it the first option of the optgroup?
                            optID += 1;

                            // Get the opt group label
                            var label = parent.label,
                                labelEscaped = htmlEscape(label),
                                labelSubtext = parentData.subtext,
                                labelIcon = parentData.icon;

                            if (index !== 0 && mainElements.length > 0) { // Is it NOT the first option of the select && are there elements in the dropdown?
                                liIndex++;
                                mainElements.push(
                                    generateLI(
                                        false,
                                        classNames.DIVIDER,
                                        optID + 'div'
                                    )
                                );
                                mainData.push({
                                    type: 'divider',
                                    optID: optID
                                });
                            }
                            liIndex++;

                            var labelElement = generateLabel({
                                labelEscaped: labelEscaped,
                                labelSubtext: labelSubtext,
                                labelIcon: labelIcon
                            });

                            mainElements.push(generateLI(labelElement, 'dropdown-header' + optGroupClass, optID));
                            mainData.push({
                                content: labelEscaped,
                                subtext: labelSubtext,
                                type: 'optgroup-label',
                                optID: optID
                            });

                            headerIndex = liIndex - 1;
                        }

                        if (that.options.hideDisabled && isDisabled || thisData.hidden === true) {
                            liIndex--;
                            return;
                        }

                        textElement = generateText({
                            text: text,
                            optionContent: optionContent,
                            optionSubtext: subtext,
                            optionIcon: icon
                        });

                        mainElements.push(generateLI(generateA(textElement, 'opt ' + optionClass + optGroupClass, inline), '', optID));
                        mainData.push({
                            content: optionContent || text,
                            subtext: subtext,
                            tokens: tokens,
                            type: 'option',
                            optID: optID,
                            headerIndex: headerIndex,
                            lastIndex: headerIndex + parent.childElementCount,
                            originalIndex: index,
                            data: thisData
                        });

                        availableOptionsCount++;
                    } else if (thisData.divider === true) {
                        mainElements.push(generateLI(false, classNames.DIVIDER));
                        mainData.push({
                            type: 'divider',
                            originalIndex: index,
                            data: thisData
                        });
                    } else {
                        // if previous element is not an optgroup and hideDisabled is true
                        if (!showDivider && that.options.hideDisabled) {
                            prevHiddenIndex = thisData.prevHiddenIndex;

                            if (prevHiddenIndex !== undefined) {
                                // select the element **before** the first hidden element in the group
                                var prevHidden = $selectOptions[prevHiddenIndex].previousElementSibling;

                                if (prevHidden && prevHidden.tagName === 'OPTGROUP' && !prevHidden.disabled) {
                                    showDivider = true;
                                }
                            }
                        }

                        if (showDivider && mainData[mainData.length - 1].type !== 'divider') {
                            liIndex++;
                            mainElements.push(
                                generateLI(
                                    false,
                                    classNames.DIVIDER,
                                    optID + 'div'
                                )
                            );
                            mainData.push({
                                type: 'divider',
                                optID: optID
                            });
                        }

                        textElement = generateText({
                            text: text,
                            optionContent: optionContent,
                            optionSubtext: subtext,
                            optionIcon: icon
                        });

                        mainElements.push(generateLI(generateA(textElement, optionClass, inline)));
                        mainData.push({
                            content: optionContent || text,
                            subtext: subtext,
                            tokens: tokens,
                            type: 'option',
                            originalIndex: index,
                            data: thisData
                        });

                        availableOptionsCount++;
                    }

                    that.selectpicker.main.map.newIndex[index] = liIndex;
                    that.selectpicker.main.map.originalIndex[liIndex] = index;

                    // get the most recent option info added to mainData
                    var _mainDataLast = mainData[mainData.length - 1];

                    _mainDataLast.disabled = isDisabled;

                    var combinedLength = 0;

                    // count the number of characters in the option - not perfect, but should work in most cases
                    if (_mainDataLast.content) combinedLength += _mainDataLast.content.length;
                    if (_mainDataLast.subtext) combinedLength += _mainDataLast.subtext.length;
                    // if there is an icon, ensure this option's width is checked
                    if (icon) combinedLength += 1;

                    if (combinedLength > widestOptionLength) {
                        widestOptionLength = combinedLength;

                        // guess which option is the widest
                        // use this when calculating menu width
                        // not perfect, but it's fast, and the width will be updating accordingly when scrolling
                        widestOption = mainElements[mainElements.length - 1];
                    }
                });

                this.selectpicker.main.elements = mainElements;
                this.selectpicker.main.data = mainData;

                this.selectpicker.current = this.selectpicker.main;

                this.selectpicker.view.widestOption = widestOption;
                this.selectpicker.view.availableOptionsCount = availableOptionsCount; // faster way to get # of available options without filter
            },

            findLis: function () {
                return this.$menuInner.find('.inner > li');
            },

            render: function () {
                var that = this,
                    $selectOptions = this.$element.find('option'),
                    selectedItems = [],
                    selectedItemsInTitle = [];

                this.togglePlaceholder();

                this.tabIndex();

                for (var i = 0, len = this.selectpicker.main.elements.length; i < len; i++) {
                    var index = this.selectpicker.main.map.originalIndex[i],
                        option = $selectOptions[index];

                    if (option && option.selected) {
                        selectedItems.push(option);

                        if (selectedItemsInTitle.length < 100 && that.options.selectedTextFormat !== 'count' || selectedItems.length === 1) {
                            if (that.options.hideDisabled && (option.disabled || option.parentNode.tagName === 'OPTGROUP' && option.parentNode.disabled)) return;

                            var thisData = this.selectpicker.main.data[i].data,
                                icon = thisData.icon && that.options.showIcon ? '<i class="' + that.options.iconBase + ' ' + thisData.icon + '"></i> ' : '',
                                subtext,
                                titleItem;

                            if (that.options.showSubtext && thisData.subtext && !that.multiple) {
                                subtext = ' <small class="text-muted">' + thisData.subtext + '</small>';
                            } else {
                                subtext = '';
                            }

                            if (option.title) {
                                titleItem = option.title;
                            } else if (thisData.content && that.options.showContent) {
                                titleItem = thisData.content.toString();
                            } else {
                                titleItem = icon + option.innerHTML.trim() + subtext;
                            }

                            selectedItemsInTitle.push(titleItem);
                        }
                    }
                }

                //Fixes issue in IE10 occurring when no default option is selected and at least one option is disabled
                //Convert all the values into a comma delimited string
                var title = !this.multiple ? selectedItemsInTitle[0] : selectedItemsInTitle.join(this.options.multipleSeparator);

                // add ellipsis
                if (selectedItems.length > 50) title += '...';

                // If this is a multiselect, and selectedTextFormat is count, then show 1 of 2 selected etc..
                if (this.multiple && this.options.selectedTextFormat.indexOf('count') !== -1) {
                    var max = this.options.selectedTextFormat.split('>');

                    if ((max.length > 1 && selectedItems.length > max[1]) || (max.length === 1 && selectedItems.length >= 2)) {
                        var totalCount = this.selectpicker.view.availableOptionsCount,
                            tr8nText = (typeof this.options.countSelectedText === 'function') ? this.options.countSelectedText(selectedItems.length, totalCount) : this.options.countSelectedText;

                        title = tr8nText.replace('{0}', selectedItems.length.toString()).replace('{1}', totalCount.toString());
                    }
                }

                if (this.options.title == undefined) {
                    // use .attr to ensure undefined is returned if title attribute is not set
                    this.options.title = this.$element.attr('title');
                }

                if (this.options.selectedTextFormat == 'static') {
                    title = this.options.title;
                }

                //If we dont have a title, then use the default, or if nothing is set at all, use the not selected text
                if (!title) {
                    title = typeof this.options.title !== 'undefined' ? this.options.title : this.options.noneSelectedText;
                }

                //strip all HTML tags and trim the result, then unescape any escaped tags
                this.$button[0].title = htmlUnescape(title.replace(/<[^>]*>?/g, '').trim());
                this.$button.find('.filter-option-inner-inner')[0].innerHTML = title;

                this.$element.trigger('rendered.bs.select');
            },

            /**
             * @param [style]
             * @param [status]
             */
            setStyle: function (style, status) {
                if (this.$element.attr('class')) {
                    this.$newElement.addClass(this.$element.attr('class').replace(/selectpicker|mobile-device|bs-select-hidden|validate\[.*\]/gi, ''));
                }

                var buttonClass = style ? style : this.options.style;

                if (status == 'add') {
                    this.$button.addClass(buttonClass);
                } else if (status == 'remove') {
                    this.$button.removeClass(buttonClass);
                } else {
                    this.$button.removeClass(this.options.style);
                    this.$button.addClass(buttonClass);
                }
            },

            liHeight: function (refresh) {
                if (!refresh && (this.options.size === false || this.sizeInfo)) return;

                if (!this.sizeInfo) this.sizeInfo = {};

                var newElement = document.createElement('div'),
                    menu = document.createElement('div'),
                    menuInner = document.createElement('div'),
                    menuInnerInner = document.createElement('ul'),
                    divider = document.createElement('li'),
                    dropdownHeader = document.createElement('li'),
                    li = document.createElement('li'),
                    a = document.createElement('a'),
                    text = document.createElement('span'),
                    header = this.options.header && this.$menu.find('.' + classNames.POPOVERHEADER).length > 0 ? this.$menu.find('.' + classNames.POPOVERHEADER)[0].cloneNode(true) : null,
                    search = this.options.liveSearch ? document.createElement('div') : null,
                    actions = this.options.actionsBox && this.multiple && this.$menu.find('.bs-actionsbox').length > 0 ? this.$menu.find('.bs-actionsbox')[0].cloneNode(true) : null,
                    doneButton = this.options.doneButton && this.multiple && this.$menu.find('.bs-donebutton').length > 0 ? this.$menu.find('.bs-donebutton')[0].cloneNode(true) : null,
                    firstOption = this.$element.find('option')[0];

                this.sizeInfo.selectWidth = this.$newElement[0].offsetWidth;

                text.className = 'text';
                a.className = 'dropdown-item ' + (firstOption ? firstOption.className : '');
                newElement.className = this.$menu[0].parentNode.className + ' ' + classNames.SHOW;
                newElement.style.width = this.sizeInfo.selectWidth + 'px';
                if (this.options.width === 'auto') menu.style.minWidth = 0;
                menu.className = classNames.MENU + ' ' + classNames.SHOW;
                menuInner.className = 'inner ' + classNames.SHOW;
                menuInnerInner.className = classNames.MENU + ' inner ' + (version.major === '4' ? classNames.SHOW : '');
                divider.className = classNames.DIVIDER;
                dropdownHeader.className = 'dropdown-header';

                text.appendChild(document.createTextNode('\u200b'));
                a.appendChild(text);
                li.appendChild(a);
                dropdownHeader.appendChild(text.cloneNode(true));

                if (this.selectpicker.view.widestOption) {
                    menuInnerInner.appendChild(this.selectpicker.view.widestOption.cloneNode(true));
                }

                menuInnerInner.appendChild(li);
                menuInnerInner.appendChild(divider);
                menuInnerInner.appendChild(dropdownHeader);
                if (header) menu.appendChild(header);
                if (search) {
                    var input = document.createElement('input');
                    search.className = 'bs-searchbox';
                    input.className = 'form-control';
                    search.appendChild(input);
                    menu.appendChild(search);
                }
                if (actions) menu.appendChild(actions);
                menuInner.appendChild(menuInnerInner);
                menu.appendChild(menuInner);
                if (doneButton) menu.appendChild(doneButton);
                newElement.appendChild(menu);

                document.body.appendChild(newElement);

                var liHeight = a.offsetHeight,
                    dropdownHeaderHeight = dropdownHeader ? dropdownHeader.offsetHeight : 0,
                    headerHeight = header ? header.offsetHeight : 0,
                    searchHeight = search ? search.offsetHeight : 0,
                    actionsHeight = actions ? actions.offsetHeight : 0,
                    doneButtonHeight = doneButton ? doneButton.offsetHeight : 0,
                    dividerHeight = $(divider).outerHeight(true),
                    // fall back to jQuery if getComputedStyle is not supported
                    menuStyle = window.getComputedStyle ? window.getComputedStyle(menu) : false,
                    menuWidth = menu.offsetWidth,
                    $menu = menuStyle ? null : $(menu),
                    menuPadding = {
                        vert: toInteger(menuStyle ? menuStyle.paddingTop : $menu.css('paddingTop')) +
                            toInteger(menuStyle ? menuStyle.paddingBottom : $menu.css('paddingBottom')) +
                            toInteger(menuStyle ? menuStyle.borderTopWidth : $menu.css('borderTopWidth')) +
                            toInteger(menuStyle ? menuStyle.borderBottomWidth : $menu.css('borderBottomWidth')),
                        horiz: toInteger(menuStyle ? menuStyle.paddingLeft : $menu.css('paddingLeft')) +
                            toInteger(menuStyle ? menuStyle.paddingRight : $menu.css('paddingRight')) +
                            toInteger(menuStyle ? menuStyle.borderLeftWidth : $menu.css('borderLeftWidth')) +
                            toInteger(menuStyle ? menuStyle.borderRightWidth : $menu.css('borderRightWidth'))
                    },
                    menuExtras = {
                        vert: menuPadding.vert +
                            toInteger(menuStyle ? menuStyle.marginTop : $menu.css('marginTop')) +
                            toInteger(menuStyle ? menuStyle.marginBottom : $menu.css('marginBottom')) + 2,
                        horiz: menuPadding.horiz +
                            toInteger(menuStyle ? menuStyle.marginLeft : $menu.css('marginLeft')) +
                            toInteger(menuStyle ? menuStyle.marginRight : $menu.css('marginRight')) + 2
                    },
                    scrollBarWidth;

                menuInner.style.overflowY = 'scroll';

                scrollBarWidth = menu.offsetWidth - menuWidth;

                document.body.removeChild(newElement);

                this.sizeInfo.liHeight = liHeight;
                this.sizeInfo.dropdownHeaderHeight = dropdownHeaderHeight;
                this.sizeInfo.headerHeight = headerHeight;
                this.sizeInfo.searchHeight = searchHeight;
                this.sizeInfo.actionsHeight = actionsHeight;
                this.sizeInfo.doneButtonHeight = doneButtonHeight;
                this.sizeInfo.dividerHeight = dividerHeight;
                this.sizeInfo.menuPadding = menuPadding;
                this.sizeInfo.menuExtras = menuExtras;
                this.sizeInfo.menuWidth = menuWidth;
                this.sizeInfo.totalMenuWidth = this.sizeInfo.menuWidth;
                this.sizeInfo.scrollBarWidth = scrollBarWidth;
                this.sizeInfo.selectHeight = this.$newElement[0].offsetHeight;

                this.setPositionData();
            },

            getSelectPosition: function () {
                var that = this,
                    $window = $(window),
                    pos = that.$newElement.offset(),
                    $container = $(that.options.container),
                    containerPos;

                if (that.options.container && !$container.is('body')) {
                    containerPos = $container.offset();
                    containerPos.top += parseInt($container.css('borderTopWidth'));
                    containerPos.left += parseInt($container.css('borderLeftWidth'));
                } else {
                    containerPos = { top: 0, left: 0 };
                }

                var winPad = that.options.windowPadding;

                this.sizeInfo.selectOffsetTop = pos.top - containerPos.top - $window.scrollTop();
                this.sizeInfo.selectOffsetBot = $window.height() - this.sizeInfo.selectOffsetTop - this.sizeInfo['selectHeight'] - containerPos.top - winPad[2];
                this.sizeInfo.selectOffsetLeft = pos.left - containerPos.left - $window.scrollLeft();
                this.sizeInfo.selectOffsetRight = $window.width() - this.sizeInfo.selectOffsetLeft - this.sizeInfo['selectWidth'] - containerPos.left - winPad[1];
                this.sizeInfo.selectOffsetTop -= winPad[0];
                this.sizeInfo.selectOffsetLeft -= winPad[3];
            },

            setMenuSize: function (isAuto) {
                this.getSelectPosition();

                var selectWidth = this.sizeInfo['selectWidth'],
                    liHeight = this.sizeInfo['liHeight'],
                    headerHeight = this.sizeInfo['headerHeight'],
                    searchHeight = this.sizeInfo['searchHeight'],
                    actionsHeight = this.sizeInfo['actionsHeight'],
                    doneButtonHeight = this.sizeInfo['doneButtonHeight'],
                    divHeight = this.sizeInfo['dividerHeight'],
                    menuPadding = this.sizeInfo['menuPadding'],
                    menuInnerHeight,
                    menuHeight,
                    divLength = 0,
                    minHeight,
                    _minHeight,
                    maxHeight,
                    menuInnerMinHeight,
                    estimate;

                if (this.options.dropupAuto) {
                    // Get the estimated height of the menu without scrollbars.
                    // This is useful for smaller menus, where there might be plenty of room
                    // below the button without setting dropup, but we can't know
                    // the exact height of the menu until createView is called later
                    estimate = liHeight * this.selectpicker.current.elements.length + menuPadding.vert;
                    this.$newElement.toggleClass(classNames.DROPUP, this.sizeInfo.selectOffsetTop - this.sizeInfo.selectOffsetBot > this.sizeInfo.menuExtras.vert && estimate + this.sizeInfo.menuExtras.vert + 50 > this.sizeInfo.selectOffsetBot);
                }

                if (this.options.size === 'auto') {
                    _minHeight = this.selectpicker.current.elements.length > 3 ? this.sizeInfo.liHeight * 3 + this.sizeInfo.menuExtras.vert - 2 : 0;
                    menuHeight = this.sizeInfo.selectOffsetBot - this.sizeInfo.menuExtras.vert;
                    minHeight = _minHeight + headerHeight + searchHeight + actionsHeight + doneButtonHeight;
                    menuInnerMinHeight = Math.max(_minHeight - menuPadding.vert, 0);

                    if (this.$newElement.hasClass(classNames.DROPUP)) {
                        menuHeight = this.sizeInfo.selectOffsetTop - this.sizeInfo.menuExtras.vert;
                    }

                    maxHeight = menuHeight;
                    menuInnerHeight = menuHeight - headerHeight - searchHeight - actionsHeight - doneButtonHeight - menuPadding.vert;
                } else if (this.options.size && this.options.size != 'auto' && this.selectpicker.current.elements.length > this.options.size) {
                    for (var i = 0; i < this.options.size; i++) {
                        if (this.selectpicker.current.data[i].type === 'divider') divLength++;
                    }

                    menuHeight = liHeight * this.options.size + divLength * divHeight + menuPadding.vert;
                    menuInnerHeight = menuHeight - menuPadding.vert;
                    maxHeight = menuHeight + headerHeight + searchHeight + actionsHeight + doneButtonHeight;
                    minHeight = menuInnerMinHeight = '';
                }

                if (this.options.dropdownAlignRight === 'auto') {
                    this.$menu.toggleClass(classNames.MENURIGHT, this.sizeInfo.selectOffsetLeft > this.sizeInfo.selectOffsetRight && this.sizeInfo.selectOffsetRight < (this.$menu[0].offsetWidth - selectWidth));
                }

                this.$menu.css({
                    'max-height': maxHeight + 'px',
                    'overflow': 'hidden',
                    'min-height': minHeight + 'px'
                });

                this.$menuInner.css({
                    'max-height': menuInnerHeight + 'px',
                    'overflow-y': 'auto',
                    'min-height': menuInnerMinHeight + 'px'
                });

                this.sizeInfo['menuInnerHeight'] = menuInnerHeight;

                if (this.selectpicker.current.data.length && this.selectpicker.current.data[this.selectpicker.current.data.length - 1].position > this.sizeInfo.menuInnerHeight) {
                    this.sizeInfo.hasScrollBar = true;
                    this.sizeInfo.totalMenuWidth = this.sizeInfo.menuWidth + this.sizeInfo.scrollBarWidth;

                    this.$menu.css('min-width', this.sizeInfo.totalMenuWidth);
                }

                if (this.dropdown && this.dropdown._popper) this.dropdown._popper.update();
            },

            setSize: function (refresh) {
                this.liHeight(refresh);

                if (this.options.header) this.$menu.css('padding-top', 0);
                if (this.options.size === false) return;

                var that = this,
                    $window = $(window),
                    selectedIndex,
                    offset = 0;

                this.setMenuSize();

                if (this.options.size === 'auto') {
                    this.$searchbox.off('input.setMenuSize propertychange.setMenuSize').on('input.setMenuSize propertychange.setMenuSize', function () {
                        return that.setMenuSize();
                    });
                    $window.off('resize.setMenuSize scroll.setMenuSize').on('resize.setMenuSize scroll.setMenuSize', function () {
                        return that.setMenuSize();
                    });
                } else if (this.options.size && this.options.size != 'auto' && this.selectpicker.current.elements.length > this.options.size) {
                    this.$searchbox.off('input.setMenuSize propertychange.setMenuSize');
                    $window.off('resize.setMenuSize scroll.setMenuSize');
                }

                if (refresh) {
                    offset = this.$menuInner[0].scrollTop;
                } else if (!that.multiple) {
                    selectedIndex = that.selectpicker.main.map.newIndex[that.$element[0].selectedIndex];

                    if (typeof selectedIndex === 'number' && that.options.size !== false) {
                        offset = that.sizeInfo.liHeight * selectedIndex;
                        offset = offset - (that.sizeInfo.menuInnerHeight / 2) + (that.sizeInfo.liHeight / 2);
                    }
                }

                that.createView(false, offset);
            },

            setWidth: function () {
                var that = this;

                if (this.options.width === 'auto') {
                    requestAnimationFrame(function () {
                        that.$menu.css('min-width', '0');
                        that.liHeight();
                        that.setMenuSize();

                        // Get correct width if element is hidden
                        var $selectClone = that.$newElement.clone().appendTo('body'),
                            btnWidth = $selectClone.css('width', 'auto').children('button').outerWidth();

                        $selectClone.remove();

                        // Set width to whatever's larger, button title or longest option
                        that.sizeInfo.selectWidth = Math.max(that.sizeInfo.totalMenuWidth, btnWidth);
                        that.$newElement.css('width', that.sizeInfo.selectWidth + 'px');
                    });
                } else if (this.options.width === 'fit') {
                    // Remove inline min-width so width can be changed from 'auto'
                    this.$menu.css('min-width', '');
                    this.$newElement.css('width', '').addClass('fit-width');
                } else if (this.options.width) {
                    // Remove inline min-width so width can be changed from 'auto'
                    this.$menu.css('min-width', '');
                    this.$newElement.css('width', this.options.width);
                } else {
                    // Remove inline min-width/width so width can be changed
                    this.$menu.css('min-width', '');
                    this.$newElement.css('width', '');
                }
                // Remove fit-width class if width is changed programmatically
                if (this.$newElement.hasClass('fit-width') && this.options.width !== 'fit') {
                    this.$newElement.removeClass('fit-width');
                }
            },

            selectPosition: function () {
                this.$bsContainer = $('<div class="bs-container" />');

                var that = this,
                    $container = $(this.options.container),
                    pos,
                    containerPos,
                    actualHeight,
                    getPlacement = function ($element) {
                        var containerPosition = {},
                            // fall back to dropdown's default display setting if display is not manually set
                            display = that.options.display || (
                                // Bootstrap 3 doesn't have $.fn.dropdown.Constructor.Default
                                $.fn.dropdown.Constructor.Default ? $.fn.dropdown.Constructor.Default.display
                                    : false
                            );

                        that.$bsContainer.addClass($element.attr('class').replace(/form-control|fit-width/gi, '')).toggleClass(classNames.DROPUP, $element.hasClass(classNames.DROPUP));
                        pos = $element.offset();

                        if (!$container.is('body')) {
                            containerPos = $container.offset();
                            containerPos.top += parseInt($container.css('borderTopWidth')) - $container.scrollTop();
                            containerPos.left += parseInt($container.css('borderLeftWidth')) - $container.scrollLeft();
                        } else {
                            containerPos = { top: 0, left: 0 };
                        }

                        actualHeight = $element.hasClass(classNames.DROPUP) ? 0 : $element[0].offsetHeight;

                        // Bootstrap 4+ uses Popper for menu positioning
                        if (version.major < 4 || display === 'static') {
                            containerPosition['top'] = pos.top - containerPos.top + actualHeight;
                            containerPosition['left'] = pos.left - containerPos.left;
                        }

                        containerPosition['width'] = $element[0].offsetWidth;

                        that.$bsContainer.css(containerPosition);
                    };

                this.$button.on('click.bs.dropdown.data-api', function () {
                    if (that.isDisabled()) {
                        return;
                    }

                    getPlacement(that.$newElement);

                    that.$bsContainer
                        .appendTo(that.options.container)
                        .toggleClass(classNames.SHOW, !that.$button.hasClass(classNames.SHOW))
                        .append(that.$menu);
                });

                $(window).on('resize scroll', function () {
                    getPlacement(that.$newElement);
                });

                this.$element.on('hide.bs.select', function () {
                    that.$menu.data('height', that.$menu.height());
                    that.$bsContainer.detach();
                });
            },

            setOptionStatus: function () {
                var that = this,
                    $selectOptions = this.$element.find('option');

                that.noScroll = false;

                if (that.selectpicker.view.visibleElements && that.selectpicker.view.visibleElements.length) {
                    for (var i = 0; i < that.selectpicker.view.visibleElements.length; i++) {
                        var index = that.selectpicker.current.map.originalIndex[i + that.selectpicker.view.position0], // faster than $(li).data('originalIndex')
                            option = $selectOptions[index];

                        if (option) {
                            var liIndex = this.selectpicker.main.map.newIndex[index],
                                li = this.selectpicker.main.elements[liIndex];

                            that.setDisabled(
                                index,
                                option.disabled || option.parentNode.tagName === 'OPTGROUP' && option.parentNode.disabled,
                                liIndex,
                                li
                            );

                            that.setSelected(
                                index,
                                option.selected,
                                liIndex,
                                li
                            );
                        }
                    }
                }
            },

            /**
             * @param {number} index - the index of the option that is being changed
             * @param {boolean} selected - true if the option is being selected, false if being deselected
             */
            setSelected: function (index, selected, liIndex, li) {
                var activeIndexIsSet = this.activeIndex !== undefined,
                    thisIsActive = this.activeIndex === index,
                    prevActiveIndex,
                    prevActive,
                    a,
                    // if current option is already active
                    // OR
                    // if the current option is being selected, it's NOT multiple, and
                    // activeIndex is undefined:
                    //  - when the menu is first being opened, OR
                    //  - after a search has been performed, OR
                    //  - when retainActive is false when selecting a new option (i.e. index of the newly selected option is not the same as the current activeIndex)
                    keepActive = thisIsActive || selected && !this.multiple && !activeIndexIsSet;

                if (!liIndex) liIndex = this.selectpicker.main.map.newIndex[index];
                if (!li) li = this.selectpicker.main.elements[liIndex];

                a = li.firstChild;

                if (selected) {
                    this.selectedIndex = index;
                }

                li.classList.toggle('selected', selected);
                li.classList.toggle('active', keepActive);

                if (keepActive) {
                    this.selectpicker.view.currentActive = li;
                    this.activeIndex = index;
                }

                if (a) {
                    a.classList.toggle('selected', selected);
                    a.classList.toggle('active', keepActive);
                    a.setAttribute('aria-selected', selected);
                }

                if (!keepActive) {
                    if (!activeIndexIsSet && selected && this.prevActiveIndex !== undefined) {
                        prevActiveIndex = this.selectpicker.main.map.newIndex[this.prevActiveIndex];
                        prevActive = this.selectpicker.main.elements[prevActiveIndex];

                        prevActive.classList.remove('active');
                        if (prevActive.firstChild) {
                            prevActive.firstChild.classList.remove('active');
                        }
                    }
                }
            },

            /**
             * @param {number} index - the index of the option that is being disabled
             * @param {boolean} disabled - true if the option is being disabled, false if being enabled
             */
            setDisabled: function (index, disabled, liIndex, li) {
                var a;

                if (!liIndex) liIndex = this.selectpicker.main.map.newIndex[index];
                if (!li) li = this.selectpicker.main.elements[liIndex];

                a = li.firstChild;

                li.classList.toggle(classNames.DISABLED, disabled);

                if (a) {
                    if (version.major === '4') a.classList.toggle(classNames.DISABLED, disabled);

                    a.setAttribute('aria-disabled', disabled);

                    if (disabled) {
                        a.setAttribute('tabindex', -1);
                    } else {
                        a.setAttribute('tabindex', 0);
                    }
                }
            },

            isDisabled: function () {
                return this.$element[0].disabled;
            },

            checkDisabled: function () {
                var that = this;

                if (this.isDisabled()) {
                    this.$newElement.addClass(classNames.DISABLED);
                    this.$button.addClass(classNames.DISABLED).attr('tabindex', -1).attr('aria-disabled', true);
                } else {
                    if (this.$button.hasClass(classNames.DISABLED)) {
                        this.$newElement.removeClass(classNames.DISABLED);
                        this.$button.removeClass(classNames.DISABLED).attr('aria-disabled', false);
                    }

                    if (this.$button.attr('tabindex') == -1 && !this.$element.data('tabindex')) {
                        this.$button.removeAttr('tabindex');
                    }
                }

                this.$button.click(function () {
                    return !that.isDisabled();
                });
            },

            togglePlaceholder: function () {
                // much faster than calling $.val()
                var element = this.$element[0],
                    selectedIndex = element.selectedIndex,
                    nothingSelected = selectedIndex === -1;

                if (!nothingSelected && !element.options[selectedIndex].value) nothingSelected = true;

                this.$button.toggleClass('bs-placeholder', nothingSelected);
            },

            tabIndex: function () {
                if (this.$element.data('tabindex') !== this.$element.attr('tabindex') &&
                    (this.$element.attr('tabindex') !== -98 && this.$element.attr('tabindex') !== '-98')) {
                    this.$element.data('tabindex', this.$element.attr('tabindex'));
                    this.$button.attr('tabindex', this.$element.data('tabindex'));
                }

                this.$element.attr('tabindex', -98);
            },

            clickListener: function () {
                var that = this,
                    $document = $(document);

                $document.data('spaceSelect', false);

                this.$button.on('keyup', function (e) {
                    if (/(32)/.test(e.keyCode.toString(10)) && $document.data('spaceSelect')) {
                        e.preventDefault();
                        $document.data('spaceSelect', false);
                    }
                });

                this.$newElement.on('show.bs.dropdown', function () {
                    if (version.major > 3 && !that.dropdown) {
                        that.dropdown = that.$button.data('bs.dropdown');
                        that.dropdown._menu = that.$menu[0];
                    }
                });

                this.$button.on('click.bs.dropdown.data-api', function () {
                    if (!that.$newElement.hasClass(classNames.SHOW)) {
                        that.setSize();
                    }
                });

                function setFocus() {
                    if (that.options.liveSearch) {
                        that.$searchbox.focus();
                    } else {
                        that.$menuInner.focus();
                    }
                }

                function checkPopperExists() {
                    if (that.dropdown && that.dropdown._popper && that.dropdown._popper.state.isCreated) {
                        setFocus();
                    } else {
                        requestAnimationFrame(checkPopperExists);
                    }
                }

                this.$element.on('shown.bs.select', function () {
                    if (that.$menuInner[0].scrollTop !== that.selectpicker.view.scrollTop) {
                        that.$menuInner[0].scrollTop = that.selectpicker.view.scrollTop;
                    }

                    if (version.major > 3) {
                        requestAnimationFrame(checkPopperExists);
                    } else {
                        setFocus();
                    }
                });

                this.$menuInner.on('click', 'li a', function (e, retainActive) {
                    var $this = $(this),
                        position0 = that.isVirtual() ? that.selectpicker.view.position0 : 0,
                        clickedIndex = that.selectpicker.current.map.originalIndex[$this.parent().index() + position0],
                        prevValue = getSelectValues(that.$element[0]),
                        prevIndex = that.$element.prop('selectedIndex'),
                        triggerChange = true;

                    // Don't close on multi choice menu
                    if (that.multiple && that.options.maxOptions !== 1) {
                        e.stopPropagation();
                    }

                    e.preventDefault();

                    //Don't run if we have been disabled
                    if (!that.isDisabled() && !$this.parent().hasClass(classNames.DISABLED)) {
                        var $options = that.$element.find('option'),
                            $option = $options.eq(clickedIndex),
                            state = $option.prop('selected'),
                            $optgroup = $option.parent('optgroup'),
                            $optgroupOptions = $optgroup.find('option'),
                            maxOptions = that.options.maxOptions,
                            maxOptionsGrp = $optgroup.data('maxOptions') || false;

                        if (clickedIndex === that.activeIndex) retainActive = true;

                        if (!retainActive) {
                            that.prevActiveIndex = that.activeIndex;
                            that.activeIndex = undefined;
                        }

                        if (!that.multiple) { // Deselect all others if not multi select box
                            $options.prop('selected', false);
                            $option.prop('selected', true);
                            that.setSelected(clickedIndex, true);
                        } else { // Toggle the one we have chosen if we are multi select.
                            $option.prop('selected', !state);

                            that.setSelected(clickedIndex, !state);
                            $this.blur();

                            if (maxOptions !== false || maxOptionsGrp !== false) {
                                var maxReached = maxOptions < $options.filter(':selected').length,
                                    maxReachedGrp = maxOptionsGrp < $optgroup.find('option:selected').length;

                                if ((maxOptions && maxReached) || (maxOptionsGrp && maxReachedGrp)) {
                                    if (maxOptions && maxOptions == 1) {
                                        $options.prop('selected', false);
                                        $option.prop('selected', true);

                                        for (var i = 0; i < $options.length; i++) {
                                            that.setSelected(i, false);
                                        }

                                        that.setSelected(clickedIndex, true);
                                    } else if (maxOptionsGrp && maxOptionsGrp == 1) {
                                        $optgroup.find('option:selected').prop('selected', false);
                                        $option.prop('selected', true);

                                        for (var i = 0; i < $optgroupOptions.length; i++) {
                                            var option = $optgroupOptions[i];
                                            that.setSelected($options.index(option), false);
                                        }

                                        that.setSelected(clickedIndex, true);
                                    } else {
                                        var maxOptionsText = typeof that.options.maxOptionsText === 'string' ? [that.options.maxOptionsText, that.options.maxOptionsText] : that.options.maxOptionsText,
                                            maxOptionsArr = typeof maxOptionsText === 'function' ? maxOptionsText(maxOptions, maxOptionsGrp) : maxOptionsText,
                                            maxTxt = maxOptionsArr[0].replace('{n}', maxOptions),
                                            maxTxtGrp = maxOptionsArr[1].replace('{n}', maxOptionsGrp),
                                            $notify = $('<div class="notify"></div>');
                                        // If {var} is set in array, replace it
                                        /** @deprecated */
                                        if (maxOptionsArr[2]) {
                                            maxTxt = maxTxt.replace('{var}', maxOptionsArr[2][maxOptions > 1 ? 0 : 1]);
                                            maxTxtGrp = maxTxtGrp.replace('{var}', maxOptionsArr[2][maxOptionsGrp > 1 ? 0 : 1]);
                                        }

                                        $option.prop('selected', false);

                                        that.$menu.append($notify);

                                        if (maxOptions && maxReached) {
                                            $notify.append($('<div>' + maxTxt + '</div>'));
                                            triggerChange = false;
                                            that.$element.trigger('maxReached.bs.select');
                                        }

                                        if (maxOptionsGrp && maxReachedGrp) {
                                            $notify.append($('<div>' + maxTxtGrp + '</div>'));
                                            triggerChange = false;
                                            that.$element.trigger('maxReachedGrp.bs.select');
                                        }

                                        setTimeout(function () {
                                            that.setSelected(clickedIndex, false);
                                        }, 10);

                                        $notify.delay(750).fadeOut(300, function () {
                                            $(this).remove();
                                        });
                                    }
                                }
                            }
                        }

                        if (!that.multiple || (that.multiple && that.options.maxOptions === 1)) {
                            that.$button.focus();
                        } else if (that.options.liveSearch) {
                            that.$searchbox.focus();
                        }

                        // Trigger select 'change'
                        if (triggerChange) {
                            if ((prevValue != getSelectValues(that.$element[0]) && that.multiple) || (prevIndex != that.$element.prop('selectedIndex') && !that.multiple)) {
                                // $option.prop('selected') is current option state (selected/unselected). prevValue is the value of the select prior to being changed.
                                changed_arguments = [clickedIndex, $option.prop('selected'), prevValue];
                                that.$element
                                    .triggerNative('change');
                            }
                        }
                    }
                });

                this.$menu.on('click', 'li.' + classNames.DISABLED + ' a, .' + classNames.POPOVERHEADER + ', .' + classNames.POPOVERHEADER + ' :not(.close)', function (e) {
                    if (e.currentTarget == this) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (that.options.liveSearch && !$(e.target).hasClass('close')) {
                            that.$searchbox.focus();
                        } else {
                            that.$button.focus();
                        }
                    }
                });

                this.$menuInner.on('click', '.divider, .dropdown-header', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (that.options.liveSearch) {
                        that.$searchbox.focus();
                    } else {
                        that.$button.focus();
                    }
                });

                this.$menu.on('click', '.' + classNames.POPOVERHEADER + ' .close', function () {
                    that.$button.click();
                });

                this.$searchbox.on('click', function (e) {
                    e.stopPropagation();
                });

                this.$menu.on('click', '.actions-btn', function (e) {
                    if (that.options.liveSearch) {
                        that.$searchbox.focus();
                    } else {
                        that.$button.focus();
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    if ($(this).hasClass('bs-select-all')) {
                        that.selectAll();
                    } else {
                        that.deselectAll();
                    }
                });

                this.$element.on({
                    'change': function () {
                        that.render();
                        that.$element.trigger('changed.bs.select', changed_arguments);
                        changed_arguments = null;
                    },
                    'focus': function () {
                        if (!that.options.mobile) that.$button.focus();
                    }
                });
            },

            liveSearchListener: function () {
                var that = this,
                    no_results = document.createElement('li');

                this.$button.on('click.bs.dropdown.data-api', function () {
                    if (!!that.$searchbox.val()) {
                        that.$searchbox.val('');
                    }
                });

                this.$searchbox.on('click.bs.dropdown.data-api focus.bs.dropdown.data-api touchend.bs.dropdown.data-api', function (e) {
                    e.stopPropagation();
                });

                this.$searchbox.on('input propertychange', function () {
                    var searchValue = that.$searchbox.val();

                    that.selectpicker.search.map.newIndex = {};
                    that.selectpicker.search.map.originalIndex = {};
                    that.selectpicker.search.elements = [];
                    that.selectpicker.search.data = [];

                    if (searchValue) {
                        var i,
                            searchMatch = [],
                            q = searchValue.toUpperCase(),
                            cache = {},
                            cacheArr = [],
                            searchStyle = that._searchStyle(),
                            normalizeSearch = that.options.liveSearchNormalize;

                        that._$lisSelected = that.$menuInner.find('.selected');

                        for (var i = 0; i < that.selectpicker.main.data.length; i++) {
                            var li = that.selectpicker.main.data[i];

                            if (!cache[i]) {
                                cache[i] = stringSearch(li, q, searchStyle, normalizeSearch);
                            }

                            if (cache[i] && li.headerIndex !== undefined && cacheArr.indexOf(li.headerIndex) === -1) {
                                if (li.headerIndex > 0) {
                                    cache[li.headerIndex - 1] = true;
                                    cacheArr.push(li.headerIndex - 1);
                                }

                                cache[li.headerIndex] = true;
                                cacheArr.push(li.headerIndex);

                                cache[li.lastIndex + 1] = true;
                            }

                            if (cache[i] && li.type !== 'optgroup-label') cacheArr.push(i);
                        }

                        for (var i = 0, cacheLen = cacheArr.length; i < cacheLen; i++) {
                            var index = cacheArr[i],
                                prevIndex = cacheArr[i - 1],
                                li = that.selectpicker.main.data[index],
                                liPrev = that.selectpicker.main.data[prevIndex];

                            if (li.type !== 'divider' || (li.type === 'divider' && liPrev && liPrev.type !== 'divider' && cacheLen - 1 !== i)) {
                                that.selectpicker.search.data.push(li);
                                searchMatch.push(that.selectpicker.main.elements[index]);

                                if (li.hasOwnProperty('originalIndex')) {
                                    that.selectpicker.search.map.newIndex[li.originalIndex] = searchMatch.length - 1;
                                    that.selectpicker.search.map.originalIndex[searchMatch.length - 1] = li.originalIndex;
                                }
                            }
                        }

                        that.activeIndex = undefined;
                        that.noScroll = true;
                        that.$menuInner.scrollTop(0);
                        that.selectpicker.search.elements = searchMatch;
                        that.createView(true);

                        if (!searchMatch.length) {
                            no_results.className = 'no-results';
                            no_results.innerHTML = that.options.noneResultsText.replace('{0}', '"' + htmlEscape(searchValue) + '"');
                            that.$menuInner[0].firstChild.appendChild(no_results);
                        }
                    } else {
                        that.$menuInner.scrollTop(0);
                        that.createView(false);
                    }
                });
            },

            _searchStyle: function () {
                return this.options.liveSearchStyle || 'contains';
            },

            val: function (value) {
                if (typeof value !== 'undefined') {
                    this.$element.val(value);
                    this.render();
                    this.$element.trigger('changed.bs.select', changed_arguments);
                    changed_arguments = null;

                    return this.$element;
                } else {
                    return this.$element.val();
                }
            },

            changeAll: function (status) {
                if (!this.multiple) return;
                if (typeof status === 'undefined') status = true;

                var $selectOptions = this.$element.find('option'),
                    previousSelected = 0,
                    currentSelected = 0,
                    prevValue = getSelectValues(this.$element[0]);

                this.$element.addClass('bs-select-hidden');

                for (var i = 0; i < this.selectpicker.current.elements.length; i++) {
                    var liData = this.selectpicker.current.data[i],
                        index = this.selectpicker.current.map.originalIndex[i], // faster than $(li).data('originalIndex')
                        option = $selectOptions[index];

                    if (option && !option.disabled && liData.type !== 'divider') {
                        if (option.selected) previousSelected++;
                        option.selected = status;
                        if (option.selected) currentSelected++;
                    }
                }

                this.$element.removeClass('bs-select-hidden');

                if (previousSelected === currentSelected) return;

                this.setOptionStatus();

                this.togglePlaceholder();

                changed_arguments = [null, null, prevValue];

                this.$element
                    .triggerNative('change');
            },

            selectAll: function () {
                return this.changeAll(true);
            },

            deselectAll: function () {
                return this.changeAll(false);
            },

            toggle: function (e) {
                e = e || window.event;

                if (e) e.stopPropagation();

                this.$button.trigger('click.bs.dropdown.data-api');
            },

            keydown: function (e) {
                var $this = $(this),
                    isToggle = $this.hasClass('dropdown-toggle'),
                    $parent = isToggle ? $this.closest('.dropdown') : $this.closest(Selector.MENU),
                    that = $parent.data('this'),
                    $items = that.findLis(),
                    index,
                    isActive,
                    liActive,
                    activeLi,
                    offset,
                    updateScroll = false,
                    downOnTab = e.which === keyCodes.TAB && !isToggle && !that.options.selectOnTab,
                    isArrowKey = REGEXP_ARROW.test(e.which) || downOnTab,
                    scrollTop = that.$menuInner[0].scrollTop,
                    isVirtual = that.isVirtual(),
                    position0 = isVirtual === true ? that.selectpicker.view.position0 : 0;

                isActive = that.$newElement.hasClass(classNames.SHOW);

                if (
                    !isActive &&
                    (
                        isArrowKey ||
                        e.which >= 48 && e.which <= 57 ||
                        e.which >= 96 && e.which <= 105 ||
                        e.which >= 65 && e.which <= 90
                    )
                ) {
                    that.$button.trigger('click.bs.dropdown.data-api');
                }

                if (e.which === keyCodes.ESCAPE && isActive) {
                    e.preventDefault();
                    that.$button.trigger('click.bs.dropdown.data-api').focus();
                }

                if (isArrowKey) { // if up or down
                    if (!$items.length) return;

                    // $items.index/.filter is too slow with a large list and no virtual scroll
                    index = isVirtual === true ? $items.index($items.filter('.active')) : that.selectpicker.current.map.newIndex[that.activeIndex];

                    if (index === undefined) index = -1;

                    if (index !== -1) {
                        liActive = that.selectpicker.current.elements[index + position0];
                        liActive.classList.remove('active');
                        if (liActive.firstChild) liActive.firstChild.classList.remove('active');
                    }

                    if (e.which === keyCodes.ARROW_UP) { // up
                        if (index !== -1) index--;
                        if (index + position0 < 0) index += $items.length;

                        if (!that.selectpicker.view.canHighlight[index + position0]) {
                            index = that.selectpicker.view.canHighlight.slice(0, index + position0).lastIndexOf(true) - position0;
                            if (index === -1) index = $items.length - 1;
                        }
                    } else if (e.which === keyCodes.ARROW_DOWN || downOnTab) { // down
                        index++;
                        if (index + position0 >= that.selectpicker.view.canHighlight.length) index = 0;

                        if (!that.selectpicker.view.canHighlight[index + position0]) {
                            index = index + 1 + that.selectpicker.view.canHighlight.slice(index + position0 + 1).indexOf(true);
                        }
                    }

                    e.preventDefault();

                    var liActiveIndex = position0 + index;

                    if (e.which === keyCodes.ARROW_UP) { // up
                        // scroll to bottom and highlight last option
                        if (position0 === 0 && index === $items.length - 1) {
                            that.$menuInner[0].scrollTop = that.$menuInner[0].scrollHeight;

                            liActiveIndex = that.selectpicker.current.elements.length - 1;
                        } else {
                            activeLi = that.selectpicker.current.data[liActiveIndex];
                            offset = activeLi.position - activeLi.height;

                            updateScroll = offset < scrollTop;
                        }
                    } else if (e.which === keyCodes.ARROW_DOWN || downOnTab) { // down
                        // scroll to top and highlight first option
                        if (index === 0) {
                            that.$menuInner[0].scrollTop = 0;

                            liActiveIndex = 0;
                        } else {
                            activeLi = that.selectpicker.current.data[liActiveIndex];
                            offset = activeLi.position - that.sizeInfo.menuInnerHeight;

                            updateScroll = offset > scrollTop;
                        }
                    }

                    liActive = that.selectpicker.current.elements[liActiveIndex];

                    if (liActive) {
                        liActive.classList.add('active');
                        if (liActive.firstChild) liActive.firstChild.classList.add('active');
                    }

                    that.activeIndex = that.selectpicker.current.map.originalIndex[liActiveIndex];

                    that.selectpicker.view.currentActive = liActive;

                    if (updateScroll) that.$menuInner[0].scrollTop = offset;

                    if (that.options.liveSearch) {
                        that.$searchbox.focus();
                    } else {
                        $this.focus();
                    }
                } else if (
                    !$this.is('input') &&
                    !REGEXP_TAB_OR_ESCAPE.test(e.which) ||
                    (e.which === keyCodes.SPACE && that.selectpicker.keydown.keyHistory)
                ) {
                    var searchMatch,
                        matches = [],
                        keyHistory;

                    e.preventDefault();

                    that.selectpicker.keydown.keyHistory += keyCodeMap[e.which];

                    if (that.selectpicker.keydown.resetKeyHistory.cancel) clearTimeout(that.selectpicker.keydown.resetKeyHistory.cancel);
                    that.selectpicker.keydown.resetKeyHistory.cancel = that.selectpicker.keydown.resetKeyHistory.start();

                    keyHistory = that.selectpicker.keydown.keyHistory;

                    // if all letters are the same, set keyHistory to just the first character when searching
                    if (/^(.)\1+$/.test(keyHistory)) {
                        keyHistory = keyHistory.charAt(0);
                    }

                    // find matches
                    for (var i = 0; i < that.selectpicker.current.data.length; i++) {
                        var li = that.selectpicker.current.data[i],
                            hasMatch;

                        hasMatch = stringSearch(li, keyHistory, 'startsWith', true);

                        if (hasMatch && that.selectpicker.view.canHighlight[i]) {
                            li.index = i;
                            matches.push(li.originalIndex);
                        }
                    }

                    if (matches.length) {
                        var matchIndex = 0;

                        $items.removeClass('active').find('a').removeClass('active');

                        // either only one key has been pressed or they are all the same key
                        if (keyHistory.length === 1) {
                            matchIndex = matches.indexOf(that.activeIndex);

                            if (matchIndex === -1 || matchIndex === matches.length - 1) {
                                matchIndex = 0;
                            } else {
                                matchIndex++;
                            }
                        }

                        searchMatch = that.selectpicker.current.map.newIndex[matches[matchIndex]];

                        activeLi = that.selectpicker.current.data[searchMatch];

                        if (scrollTop - activeLi.position > 0) {
                            offset = activeLi.position - activeLi.height;
                            updateScroll = true;
                        } else {
                            offset = activeLi.position - that.sizeInfo.menuInnerHeight;
                            // if the option is already visible at the current scroll position, just keep it the same
                            updateScroll = activeLi.position > scrollTop + that.sizeInfo.menuInnerHeight;
                        }

                        liActive = that.selectpicker.current.elements[searchMatch];
                        liActive.classList.add('active');
                        if (liActive.firstChild) liActive.firstChild.classList.add('active');
                        that.activeIndex = matches[matchIndex];

                        liActive.firstChild.focus();

                        if (updateScroll) that.$menuInner[0].scrollTop = offset;

                        $this.focus();
                    }
                }

                // Select focused option if "Enter", "Spacebar" or "Tab" (when selectOnTab is true) are pressed inside the menu.
                if (
                    isActive &&
                    (
                        (e.which === keyCodes.SPACE && !that.selectpicker.keydown.keyHistory) ||
                        e.which === keyCodes.ENTER ||
                        (e.which === keyCodes.TAB && that.options.selectOnTab)
                    )
                ) {
                    if (e.which !== keyCodes.SPACE) e.preventDefault();

                    if (!that.options.liveSearch || e.which !== keyCodes.SPACE) {
                        that.$menuInner.find('.active a').trigger('click', true); // retain active class
                        $this.focus();

                        if (!that.options.liveSearch) {
                            // Prevent screen from scrolling if the user hits the spacebar
                            e.preventDefault();
                            // Fixes spacebar selection of dropdown items in FF & IE
                            $(document).data('spaceSelect', true);
                        }
                    }
                }
            },

            mobile: function () {
                this.$element.addClass('mobile-device');
            },

            refresh: function () {
                // update options if data attributes have been changed
                var config = $.extend({}, this.options, this.$element.data());
                this.options = config;

                this.selectpicker.main.map.newIndex = {};
                this.selectpicker.main.map.originalIndex = {};
                this.createLi();
                this.checkDisabled();
                this.render();
                this.setStyle();
                this.setWidth();

                this.setSize(true);

                this.$element.trigger('refreshed.bs.select');
            },

            hide: function () {
                this.$newElement.hide();
            },

            show: function () {
                this.$newElement.show();
            },

            remove: function () {
                this.$newElement.remove();
                this.$element.remove();
            },

            destroy: function () {
                this.$newElement.before(this.$element).remove();

                if (this.$bsContainer) {
                    this.$bsContainer.remove();
                } else {
                    this.$menu.remove();
                }

                this.$element
                    .off('.bs.select')
                    .removeData('selectpicker')
                    .removeClass('bs-select-hidden selectpicker');
            }
        };

        // SELECTPICKER PLUGIN DEFINITION
        // ==============================
        function Plugin(option) {
            // get the args of the outer function..
            var args = arguments;
            // The arguments of the function are explicitly re-defined from the argument list, because the shift causes them
            // to get lost/corrupted in android 2.3 and IE9 #715 #775
            var _option = option;

            [].shift.apply(args);

            // if the version was not set successfully
            if (!version.success) {
                // try to retreive it again
                try {
                    version.full = ($.fn.dropdown.Constructor.VERSION || '').split(' ')[0].split('.');
                }
                // fall back to use BootstrapVersion
                catch (err) {
                    version.full = Selectpicker.BootstrapVersion.split(' ')[0].split('.');
                }

                version.major = version.full[0];
                version.success = true;

                if (version.major === '4') {
                    classNames.DIVIDER = 'dropdown-divider';
                    classNames.SHOW = 'show';
                    classNames.BUTTONCLASS = 'btn-light';
                    Selectpicker.DEFAULTS.style = classNames.BUTTONCLASS = 'btn-light';
                    classNames.POPOVERHEADER = 'popover-header';
                }
            }

            var value;
            var chain = this.each(function () {
                var $this = $(this);
                if ($this.is('select')) {
                    var data = $this.data('selectpicker'),
                        options = typeof _option == 'object' && _option;

                    if (!data) {
                        var config = $.extend({}, Selectpicker.DEFAULTS, $.fn.selectpicker.defaults || {}, $this.data(), options);
                        config.template = $.extend({}, Selectpicker.DEFAULTS.template, ($.fn.selectpicker.defaults ? $.fn.selectpicker.defaults.template : {}), $this.data().template, options.template);
                        $this.data('selectpicker', (data = new Selectpicker(this, config)));
                    } else if (options) {
                        for (var i in options) {
                            if (options.hasOwnProperty(i)) {
                                data.options[i] = options[i];
                            }
                        }
                    }

                    if (typeof _option == 'string') {
                        if (data[_option] instanceof Function) {
                            value = data[_option].apply(data, args);
                        } else {
                            value = data.options[_option];
                        }
                    }
                }
            });

            if (typeof value !== 'undefined') {
                //noinspection JSUnusedAssignment
                return value;
            } else {
                return chain;
            }
        }

        var old = $.fn.selectpicker;
        $.fn.selectpicker = Plugin;
        $.fn.selectpicker.Constructor = Selectpicker;

        // SELECTPICKER NO CONFLICT
        // ========================
        $.fn.selectpicker.noConflict = function () {
            $.fn.selectpicker = old;
            return this;
        };

        $(document)
            .off('keydown.bs.dropdown.data-api')
            .on('keydown.bs.select', '.bootstrap-select [data-toggle="dropdown"], .bootstrap-select [role="listbox"], .bs-searchbox input', Selectpicker.prototype.keydown)
            .on('focusin.modal', '.bootstrap-select [data-toggle="dropdown"], .bootstrap-select [role="listbox"], .bs-searchbox input', function (e) {
                e.stopPropagation();
            });

        // SELECTPICKER DATA-API
        // =====================
        $(window).on('load.bs.select.data-api', function () {
            $('.selectpicker').each(function () {
                var $selectpicker = $(this);
                Plugin.call($selectpicker, $selectpicker.data());
            })
        });
    })(jQuery);


}));
