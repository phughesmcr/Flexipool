// Copyright (c) 2020 P. Hughes. All rights reserved. MIT license.
"use strict";
/** Generic object pool */
export class Pool {
    /**
     * @param type Object type this pool will contain
     * @param config Optional configuration object
     */
    constructor(type, config) {
        /** The pool's configuration */
        this._config = Object.assign({}, Pool.defaultConfig);
        /** The array of available objects */
        this._objects = [];
        /** The current capacity of the pool */
        this._size = 0;
        if (config)
            this.setConfig(config);
        this.type = type;
        this.empty();
    }
    /** Is the pool at maximum capacity? */
    get atMax() {
        return Boolean(this._config.max && (this._config.max === this._size));
    }
    /** Is the pool at minimum capacity? */
    get atMin() {
        return Boolean(this._config.min === this._size);
    }
    /** The number of objects available in the pool */
    get available() {
        return this._objects.length;
    }
    /** A clone of the pool's config object */
    get config() {
        return Object.assign({}, this._config);
    }
    /** Is debug mode enabled? */
    get debug() {
        return this._config.debug;
    }
    /** The pool's maximum capacity. */
    get max() {
        return this._config.max;
    }
    /** The pool's minimum capacity */
    get min() {
        return this._config.min;
    }
    /** The total capacity of the pool */
    get size() {
        return this._size;
    }
    /** The number of objects in use from this pool */
    get used() {
        return this.size - this.available;
    }
    /**
     * Remove all objects from the pool
     * and resets the pool's size to minimum
     */
    empty() {
        this._size = 0;
        this._objects = [];
        this.resizeTo(this._config.min);
        return this;
    }
    /**
     * Expand the pool's capacity
     * Will do nothing if the pool is already at maximum capacity
     * @param size The desired capacity
     */
    expandBy(size) {
        // Bail early if the pool is already at maximum capacity
        if (size == null || typeof size !== "number") {
            if (this.debug) {
                console.warn(`Flexipool[expandBy()]: Invalid size supplied. Expected 'number', got ${typeof size}. Ignoring.`);
            }
            return this;
        }
        if (this.atMax === true)
            return this;
        // Grow to available space if near maximum capacity
        if (this._config.max && ((this._size + size) > this._config.max)) {
            size = this._config.max - this._size;
        }
        this._size += size;
        while (size) {
            --size;
            this._objects.push(new this.type());
        }
        return this;
    }
    /** Acquire an object from the pool */
    get() {
        if (this.available <= 0 && this.atMax === false) {
            // if there no available capacity but we're not at max
            // attempt to grow the pool by the given expandFactor
            this.expandBy(Math.ceil(this._size * this._config.expandFactor + 0.4));
        }
        if (this.atMax === true && this._config.recycle === true) {
            this.release(this._objects[0]);
        }
        return this._objects.pop();
    }
    /** Resets a given object and makes it available in the pool */
    release(item) {
        if (item == null || !(item instanceof this.type)) {
            if (this.debug) {
                console.warn(`Flexipool[release()]: Invalid item supplied. Ignoring.`);
            }
            return this;
        }
        // Reset the object if possible
        if (Object.prototype.hasOwnProperty.call(item, "reset") &&
            typeof item.reset === "function") {
            item.reset();
        }
        // Only push if we're not already fully free or at maximum capacity
        if (this.available < this._size || this.atMax === false) {
            this._objects.push(item);
        }
        return this;
    }
    /**
     * Set the pool's capacity to an arbitrary size
     * @param size The desired capacity
     */
    resizeTo(size) {
        if (size == null || typeof size !== "number") {
            if (this.debug) {
                console.warn(`Flexipool[resizeTo()]: Invalid size supplied. Expected 'number', got ${typeof size}. Ignoring.`);
            }
            return this;
        }
        if (size !== this._size) {
            if (size > this._size) {
                size = (size - this._size);
                return this.expandBy(size);
            }
            else if (size < this._size) {
                size = (this._size - size);
                return this.shrinkBy(size);
            }
        }
        return this;
    }
    /** Update the pool's configuration */
    setConfig(config) {
        // validate input
        if (!config) {
            if (this.debug) {
                console.warn("Flexipool[setConfig()]: No config object supplied. Ignoring.");
            }
            return this;
        }
        if (config.min != null) {
            if (typeof config.min !== "number") {
                if (this.debug) {
                    console.warn(`Flexipool[setConfig()]: Invalid config property type supplied for 'min'. Expected 'number', got ${typeof config.min}. Ignoring.`);
                }
                delete config.min;
            }
            else if (config.min <= 0) {
                if (this.debug) {
                    console.warn(`Flexipool[setConfig()]: Invalid config property supplied for 'min'. Expected >= 1, got ${config.min}. Setting to 1.`);
                }
                config.min = 1;
            }
        }
        if (config.max != null) {
            if (typeof config.max !== "number") {
                if (this.debug) {
                    console.warn(`Flexipool[setConfig()]: Invalid config property type supplied for 'max'. Expected 'number', got ${typeof config.max}. Ignoring.`);
                }
                delete config.max;
            }
            else if (config.max <
                (config.min != null ? config.min : this._config.min)) {
                if (this.debug) {
                    console.warn(`Flexipool[setConfig()]: Invalid config property supplied for 'max'. Expected >= ${config.min != null ? config.min : this._config.min}, got ${config.max}. Ignoring.`);
                }
                delete config.max;
            }
        }
        if (config.expandFactor != null &&
            typeof config.expandFactor !== "number") {
            if (this.debug) {
                console.warn(`Flexipool[setConfig()]: Invalid config property type supplied for 'expandFactor'. Expected 'number', got ${typeof config.expandFactor}. Ignoring.`);
            }
            delete config.expandFactor;
        }
        if (config.recycle && typeof config.recycle !== "boolean") {
            if (this.debug) {
                console.warn(`Flexipool[setConfig()]: Invalid config property type supplied for 'recycle'. Expected 'boolean', got ${typeof config.recycle}. Ignoring.`);
            }
            delete config.recycle;
        }
        // detect changes to min/max
        const changedMin = config.min && config.min !== this.config.min;
        const changedMax = config.max && config.max !== this.config.max;
        // merge config
        this._config = Object.assign(Object.assign(Object.assign({}, Pool.defaultConfig), this._config), config);
        // adapt pool if min/max have changed
        if (changedMax) {
            if (this._size > this._config.max) {
                this.shrinkBy(this._size - this._config.max);
            }
        }
        if (changedMin) {
            if (this._size < this.config.min) {
                this.expandBy(this.config.min - this._size);
            }
        }
        return this;
    }
    /**
     * Shrink the pool's capacity
     * Will do nothing if the pool is already at minimum capacity
     * @param size The desired capacity
     */
    shrinkBy(size) {
        // Bail early if the pool is already at minimum capacity
        if (size == null || typeof size !== "number") {
            if (this.debug) {
                console.warn(`Flexipool[shrinkBy()]: Invalid size supplied. Expected 'number', got ${typeof size}. Ignoring.`);
            }
            return this;
        }
        if (this.atMin === true)
            return this;
        // Grow to available space if near maximum capacity
        if ((this._size - size) < this._config.min) {
            return this.resizeTo(this._config.min);
        }
        this._size -= size;
        this._objects.splice(0, size);
        return this;
    }
}
/** Default configuration object */
Pool.defaultConfig = {
    debug: false,
    expandFactor: 0.2,
    max: Number.POSITIVE_INFINITY,
    min: 2,
    recycle: false,
};
//# sourceMappingURL=flexipool.js.map