// Copyright (c) 2020 P. Hughes. All rights reserved. MIT license.
"use strict";

export interface PoolConfig {
  /**
   * Percentage to attempt to expand the pool by,
   * if pool is at capacity but not at maximum capacity
   */
  expandFactor: number;

  /**
   * The minimum capacity of the pool. Cannot be less than 1.
   *
   * This is the minimum capacity, not the minimum available.
   * The minimum available objects is always 0.
   */
  min: number;

  /**
   * The maximum capacity of the pool.
   *
   * Default = Number.POSITIVE_INFINITY
   */
  max: number;

  /**
   * Recycle the pool elements if maximum capacity is reached.
   *
   * Ignored if max is undefined.
   */
  recycle: boolean;
}

/** Generic interface for poolable objects */
export interface Poolable {
  /** Reset the object to it's initial state */
  reset?: () => void;
}

/** Generic object pool */
export class Pool<T extends Poolable> {
  /** Default configuration object */
  static defaultConfig: PoolConfig = {
    expandFactor: 0.2, // i.e. expand by 20%
    min: 2,
    max: Number.POSITIVE_INFINITY,
    recycle: false,
  };

  /** The pool's configuration */
  private _config: PoolConfig = { ...Pool.defaultConfig };

  /** The array of available objects */
  private _objects: T[] = [];

  /** The current capacity of the pool */
  private _size = 0;

  /** The type of object this pool contains */
  readonly type: new () => T;

  /**
   * @param type Object type this pool will contain
   * @param config Optional configuration object
   */
  constructor(type: new () => T, config?: Partial<PoolConfig>) {
    if (config) this.setConfig(config);
    this.type = type;
    this.empty();
  }

  /** Is the pool at maximum capacity? */
  get atMax(): boolean {
    return Boolean(this._config.max && (this._config.max === this._size));
  }

  /** Is the pool at minimum capacity? */
  get atMin(): boolean {
    return Boolean(this._config.min === this._size);
  }

  /** The number of objects available in the pool */
  get available(): number {
    return this._objects.length;
  }

  /** A clone of the pool's config object */
  get config(): PoolConfig {
    return { ...this._config };
  }

  /** The pool's maximum capacity. */
  get max(): number {
    return this._config.max;
  }

  /** The pool's minimum capacity */
  get min(): number {
    return this._config.min;
  }

  /** The total capacity of the pool */
  get size(): number {
    return this._size;
  }

  /** The number of objects in use from this pool */
  get used(): number {
    return this.size - this.available;
  }

  /**
   * Remove all objects from the pool
   * and resets the pool's size to minimum
   */
  empty(): this {
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
  expandBy(size: number): this {
    // Bail early if the pool is already at maximum capacity
    if (size == null || typeof size !== "number" || this.atMax === true) {
      return this;
    }
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
  get(): T | undefined {
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
  release(item: T): this {
    if (item == null || !(item instanceof this.type)) return this;
    // Reset the object if possible
    if (
      Object.prototype.hasOwnProperty.call(item, "reset") &&
      typeof item.reset === "function"
    ) {
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
  resizeTo(size: number): this {
    if (size == null || typeof size !== "number") return this;
    if (size !== this._size) {
      if (size > this._size) {
        size = (size - this._size);
        return this.expandBy(size);
      } else if (size < this._size) {
        size = (this._size - size);
        return this.shrinkBy(size);
      }
    }
    return this;
  }

  /** Update the pool's configuration */
  setConfig(config: Partial<PoolConfig>): this {
    // validate input
    if (!config) return this;
    if (config.min != null) {
      if (typeof config.min !== "number") {
        delete config.min;
      } else if (config.min <= 0) {
        config.min = 1;
      }
    }
    if (config.max != null) {
      if (typeof config.max !== "number") {
        delete config.max;
      } else if (
        config.max <
          (config.min != null ? config.min : this._config.min)
      ) {
        delete config.max;
      }
    }
    if (
      config.expandFactor != null &&
      typeof config.expandFactor !== "number"
    ) {
      delete config.expandFactor;
    }
    if (config.recycle && typeof config.recycle !== "boolean") {
      delete config.recycle;
    }
    // detect changes to min/max
    const changedMin = config.min && config.min !== this.config.min;
    const changedMax = config.max && config.max !== this.config.max;
    // merge config
    this._config = {
      ...Pool.defaultConfig,
      ...this._config,
      ...config,
    };
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
  shrinkBy(size: number): this {
    // Bail early if the pool is already at minimum capacity
    if (size == null || typeof size !== "number" || this.atMin === true) {
      return this;
    }
    // Grow to available space if near maximum capacity
    if ((this._size - size) < this._config.min) {
      return this.resizeTo(this._config.min);
    }
    this._size -= size;
    this._objects.splice(0, size);
    return this;
  }
}
