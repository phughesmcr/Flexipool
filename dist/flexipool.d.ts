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
    /** The maximum capacity of the pool. Undefined = no limit. */
    max?: number;
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
export declare class Pool<T extends Poolable> {
    /** Default configuration object */
    static defaultConfig: PoolConfig;
    /** The pool's configuration */
    private _config;
    /** The array of available objects */
    private _objects;
    /** The current capacity of the pool */
    private _size;
    /** The type of object this pool contains */
    readonly type: new () => T;
    /**
     * @param type Object type this pool will contain
     * @param config Optional configuration object
     */
    constructor(type: new () => T, config?: Partial<PoolConfig>);
    /** Is the pool at maximum capacity? */
    get atMax(): boolean;
    /** Is the pool at minimum capacity? */
    get atMin(): boolean;
    /** The number of objects available in the pool */
    get available(): number;
    /** A clone of the pool's config object */
    get config(): PoolConfig;
    /** The pool's maximum capacity. Undefined = no limit. */
    get max(): number | undefined;
    /** The pool's minimum capacity */
    get min(): number;
    /** The total capacity of the pool */
    get size(): number;
    /** The number of objects in use from this pool */
    get used(): number;
    /**
     * Remove all objects from the pool
     * and resets the pool's size to minimum
     */
    empty(): this;
    /**
     * Expand the pool's capacity
     * Will do nothing if the pool is already at maximum capacity
     * @param size The desired capacity
     */
    expandBy(size: number): this;
    /** Acquire an object from the pool */
    get(): T | undefined;
    /** Resets a given object and makes it available in the pool */
    release(item: T): this;
    /**
     * Set the pool's capacity to an arbitrary size
     * @param size The desired capacity
     */
    resizeTo(size: number): this;
    /** Update the pool's configuration */
    setConfig(config: Partial<PoolConfig>): this;
    /**
     * Shrink the pool's capacity
     * Will do nothing if the pool is already at minimum capacity
     * @param size The desired capacity
     */
    shrinkBy(size: number): this;
}
//# sourceMappingURL=flexipool.d.ts.map