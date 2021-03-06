/**
 * @class Ext.layout.CardLayout
 * @extends Ext.layout.FitLayout
 * <p>This layout manages multiple child Components, each is fit to the Container, where only a single child Component
 * can be visible at any given time.  This layout style is most commonly used for wizards, tab implementations, etc.
 * This class is intended to be extended or created via the layout:'card' {@link Ext.Container#layout} config,
 * and should generally not need to be created directly via the new keyword.</p>
 * <p>The CardLayout's focal method is {@link #setActiveItem}.  Since only one panel is displayed at a time,
 * the only way to move from one Component to the next is by calling setActiveItem, passing the id or index of
 * the next panel to display.  The layout itself does not provide a user interface for handling this navigation,
 * so that functionality must be provided by the developer.</p>
 */

Ext.layout.CardLayout = Ext.extend(Ext.layout.FitLayout, {
    type: 'card',
    hideOnDeactivate: true,

    onLayout : function() {
        Ext.layout.CardLayout.superclass.onLayout.apply(this, arguments);

        if (!this.layedOut && this.activeItem) {
            if (this.activeItem.fireEvent('beforeactivate', this.activeItem) !== false) {
                this.activeItem.fireEvent('activate', this.activeItem);
            }
        }
    },

    setOwner : function(owner) {
        Ext.layout.CardLayout.superclass.setOwner.call(this, owner);

        Ext.applyIf(owner, {
            setCard : function(item, animation) {
                this.layout.setActiveItem(item, animation);
            }
        });
    },

    /**
     * Sets the active (visible) item in the layout.
     * @param {String/Number} item The string component id or numeric index of the item to activate
     */
    setActiveItem : function(item, animation) {
        var me = this,
            doc = Ext.getDoc(),
            old = me.activeItem;

        item = this.parseActiveItem(item);
        // Is this a valid, different card?
        if (item && old != item) {
            if (!item.rendered) {
                this.renderItem(item, this.owner.items.length, this.getTarget());
                this.configureItem(item, 0);
            }

            // This will show and size the new activeItem
            item.show();
            this.setItemBox(item, this.getTargetBox());

            if (item.fireEvent('beforeactivate', item, old) === false) {
                return;
            }
            if (old && old.fireEvent('beforedeactivate', old, item) === false) {
                return;
            }

            if (animation) {
                function preventDefault(e) {
                    e.preventDefault();
                };
                doc.on('click', preventDefault, this, {single: true});

                var inConfig = {}, inAnim;

                if (Ext.isObject(animation) && !animation.run) {
                    inConfig = Ext.apply({}, animation || {});
                    inAnim = inConfig.type;
                }
                else if (Ext.isString(animation)) {
                    inAnim = animation;
                }
                else if (animation.run) {
                    // Can't? need to set after manually...
                    // Assign after to activate?
                }

                inConfig.after = function() {
                    (function() {
                        doc.un('click', preventDefault, this);
                    }).defer(50, this);
                    item.fireEvent('activate', item, old);
                };
                inConfig.scope = this;

                inConfig.out = false;
                inConfig.autoClear = true;

                Ext.anims[inAnim].run(item.el, inConfig);

            }
            else {
                Ext.repaint();
                item.fireEvent('activate', item, old);
            }

            if (old && animation) {
                var outConfig = {}, outAnim;

                if (Ext.isObject(animation) && !animation.run) {
                    outConfig = Ext.apply({}, animation || {});
                    outAnim = outConfig.type;
                }
                else if (Ext.isString(animation)) {
                    outAnim = animation;
                }

                outConfig.after = function() {
                    old.fireEvent('deactivate', old, item);
                    if (me.hideOnDeactivate && me.activeItem != old) {
                        old.hide();
                    }
                };

                outConfig.out = true;
                outConfig.autoClear = true;

                Ext.anims[outAnim].run(old.el, outConfig);
            }
            else if (old) {
                if (me.hideOnDeactivate) {
                    old.hide();
                }
                old.fireEvent('deactivate', old, item);
            }

            // Change activeItem reference
            me.activeItem = item;

            me.owner.fireEvent('cardswitch', item, old)
        }
    },

    /**
     * Return the active (visible) component in the layout to the next card, optional wrap parameter to wrap to the first
     * card when the end of the stack is reached.
     * @param {boolean} wrap Wrap to the first card when the end of the stack is reached.
     * @returns {Ext.Component}
     */
    getNext : function(wrap) {
        var items = this.getLayoutItems(),
            index = items.indexOf(this.activeItem);
        return items[index+1] || (wrap ? items[0] : false);
    },

    /**
     * Sets the active (visible) component in the layout to the next card, optional wrap parameter to wrap to the first
     * card when the end of the stack is reached.
     * @param {Mixed} anim Animation to use for the card transition
     * @param {boolean} wrap Wrap to the first card when the end of the stack is reached.
     */
    next : function(anim, wrap) {
        this.setActiveItem(this.getNext(wrap), anim);
    },

    /**
     * Return the active (visible) component in the layout to the previous card, optional wrap parameter to wrap to
     * the last card when the beginning of the stack is reached.
     * @param {boolean} wrap Wrap to the first card when the end of the stack is reached.
     * @returns {Ext.Component}
     */
    getPrev : function(wrap) {
        var items = this.getLayoutItems(),
            index = items.indexOf(this.activeItem);
        return items[index-1] || (wrap ? items[items.length-1] : false);
    },

    /**
     * Sets the active (visible) component in the layout to the previous card, optional wrap parameter to wrap to
     * the last card when the beginning of the stack is reached.
     * @param {Mixed} anim Animation to use for the card transition
     * @param {boolean} wrap Wrap to the first card when the end of the stack is reached.
     */
    prev : function(anim, wrap) {
        this.setActiveItem(this.getPrev(wrap), anim);
    }
});

Ext.layout.TYPES['card'] = Ext.layout.CardLayout;