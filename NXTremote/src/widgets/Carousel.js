/**
 * @class Ext.Carousel
 * @extends Ext.Container
 * @xtype carousel
 *
 * A customized Container which provides the ability to slide back and forth between
 * different child items.
 *
 * <pre><code>
var carousel = new Ext.Carousel({
   items: [{
       html: '&lt;h1&gt;Carousel&lt;/h1&gt;',
       cls: 'card1'
   }, {
       title: 'Tab 2',
       html: '2',
       cls: 'card2'
   }, {
       title: 'Tab 3',
       html: '3',
       cls: 'card3'
   }]
});</code></pre>
 */
Ext.Carousel = Ext.extend(Ext.Container, {
    /**
     * @constructor
     * @param {Object} config
     * Create a new Ext.Carousel
     */

    /**
     * @cfg {String} baseCls
     * The base CSS class to apply to the Carousel's element (defaults to <code>'x-carousel'</code>).
     */
    baseCls: 'x-carousel',

    /**
     * @cfg {Boolean} indicator
     * Provides an indicator while toggling between child items to let the user
     * know where they are in the card stack.
     */
    indicator: true,

    /**
     * @cfg {String} ui
     * Style options for Carousel. Default is 'dark'. 'light' also available.
     */
    ui: null,

    // not yet implemented
    // cycle, wrap : false,

    /**
     * @cfg {String} layout @hide
     */

    // @private
    initComponent: function() {
        // We want absolutely no laying out done, except for rendering
        this.layout = new Ext.layout.ContainerLayout();

        this.scroll = {
            bounces: false,
            momentum: false,
            horizontal: true,
            vertical: false
        };

        /**
         * @event cardswitch
         * @param this {Ext.Carousel}
         * @param item {Ext.Component}
         * @param index {Number}
         */
        this.addEvents('cardswitch');

        if (this.indicator) {
            var cfg = Ext.isObject(this.indicator) ? this.indicator : {};
            this.indicator = new Ext.Carousel.Indicator(Ext.apply({}, cfg, {
                carousel: this,
                ui: this.ui
            }));
        }

        Ext.Carousel.superclass.initComponent.call(this);
    },

    // @private
    afterRender: function() {
        Ext.Carousel.superclass.afterRender.call(this);

        this.scroller.on({
            touchend: this.onTouchEnd,
            scrollend: this.onScrollEnd,
            scope: this
        });
    },

    // @private
    afterLayout: function(layout) {
        var me = this,
            size = this.el.getSize(),
            items = this.items.items,
            ln = items.length,
            width = 0,
            i, item;

        for (i = 0; i < ln; i++) {
            item = items[i];
            item.show();
            item.setSize(size);
            width += size.width;
        }

        if (this.activeItem) {
            var item = this.activeItem;
            delete this.activeItem;
            this.setActiveItem(item, true);
        } else {
            this.setActiveItem(this.items.items[0]);
        }

        Ext.repaint();
    },

    /**
     * Sets one of the cards in the Carousel as active and optionally scrolls to it.
     * @param item {Mixed} The item to make active. This can be represented by an index, an  actual Ext.Component or an itemId/id.
     * @param scrollTo {Boolean} Pass true to scroll to the newly activated card. (Defaults to false)
     * @param animate {Boolean} Pass true to animate the scroll to the newly activated card. (Defaults to false)
     */
    setActiveItem: function(item, scrollTo, animate) {
        if (typeof item == 'number' || item == undefined) {
            item = this.items.items[item || 0];
        }
        else if (item && !item.isComponent) {
            item = this.getComponent(item);
        }
        if (item && this.activeItem != item) {
            if (this.activeItem) {
                this.activeItem.fireEvent('deactivate', this.activeItem, item);
            }
            item.fireEvent('activate', item, this.activeItem);
            var index = this.items.items.indexOf(item);
            this.activeItem = item;
            this.activeItemX = index * this.el.getWidth() * -1;
            if (scrollTo && this.activeItemX != this.scroller.offset.x) {
                this.scroller.scrollTo({x: this.activeItemX, y: 0}, animate ? 'ease-out' : false);
            }
            this.fireEvent('cardswitch', this, item, index);
        }
    },

    next: function(scrollTo, wrap, animate) {
        var items = this.items.items,
            index = items.indexOf(this.activeItem),
            next = items[index+1] || (wrap ? items[0] : false);
        if (next) {
            this.setActiveItem(next, scrollTo, animate);
        }
    },

    previous: function(scrollTo, wrap, animate) {
        var items = this.items.items,
            index = items.indexOf(this.activeItem),
            prev = items[index-1] || (wrap ? items[items.length-1] : false);
        if (prev) {
            this.setActiveItem(prev, scrollTo, animate);
        }
    },

    getActiveItem: function() {
        return this.activeItem;
    },

    // @private
    onTouchEnd: function(e, scroller) {
        var activeItemX = this.activeItemX,
            deltaX = scroller.offset.x - activeItemX,
            layout = this.layout,
            width = this.el.getWidth(),
            destX = activeItemX,
            duration = 2;
        // We are going to the right
        if (deltaX < 0 && Math.abs(deltaX) > 3 && e.previousDeltaX <= 0) {
            destX -= width;
        }
        // We are going to the left
        else if (deltaX > 0 && Math.abs(deltaX) > 3 && e.previousDeltaX >= 0) {
            destX += width;
        }
        scroller.scrollTo({x: destX, y: 0}, Math.min(duration * Math.abs(scroller.offset.x - destX), 350), 'ease-out');
    },

    // @private
    onScrollEnd: function(scroller) {
        var activeX = this.activeItemX,
            deltaX = scroller.offset.x - activeX,
            width = this.el.getWidth();

        // We have gone to the right
        if (deltaX < 0 && Math.abs(deltaX) > width / 2) {
            this.next();
        }
        // We have gone to the left
        else if (deltaX > 0 && Math.abs(deltaX) > width / 2) {
            this.previous();
        }
    }
});

Ext.reg('carousel', Ext.Carousel);

/**
 * @class Ext.Carousel.Indicator
 * @extends Ext.Component
 * @xtype carouselindicator
 * @private
 *
 * A private utility class used by Ext.Carousel to create indicators.
 */
Ext.Carousel.Indicator = Ext.extend(Ext.Component, {
    baseCls: 'x-carousel-indicator',

    initComponent: function() {
        if (this.carousel.rendered) {
            this.render(this.carousel.el);
        }
        else {
            this.carousel.on('render', function() {
                this.render(this.carousel.el);
            }, this, {single: true});
        }
    },

    // @private
    onRender: function() {
        Ext.Carousel.Indicator.superclass.onRender.apply(this, arguments);

        for (var i = 0, ln = this.carousel.items.length; i < ln; i++) {
            this.createIndicator();
        }

        this.mon(this.carousel, {
            cardswitch: this.onCardSwitch,
            add: this.onCardAdd,
            remove: this.onCardRemove,
            scope: this
        });

        this.mon(this.el, {
            tap: this.onTap,
            scope: this
        });
    },

    // @private
    onTap: function(e, t) {
        var box = this.el.getPageBox(),
            centerX = box.left + (box.width / 2);

        if (e.pageX > centerX) {
            this.carousel.next(true, false, true);
        }
        else {
            this.carousel.previous(true, false, true);
        }
    },

    // @private
    createIndicator: function() {
        this.indicators = this.indicators || [];
        this.indicators.push(this.el.createChild({
            tag: 'span'
        }));
    },

    // @private
    onCardSwitch: function(carousel, card, index) {
        this.indicators[index].radioClass('x-carousel-indicator-active');
    },

    // @private
    onCardAdd: function() {
        this.createIndicator();
    },

    // @private
    onCardRemove: function() {
        this.indicators.pop().remove();
    }
});

Ext.reg('carouselindicator', Ext.Carousel.Indicator);
