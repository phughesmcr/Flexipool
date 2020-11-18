// Copyright (c) 2020 P. Hughes. All rights reserved. MIT license.
"use strict";

import { Pool, Poolable } from '../dist/flexipool.js';
import { expect } from 'chai';

class Entity extends Poolable<Entity> {
  constructor() {
    super();
  }
}
const pool: Pool<Entity> = new Pool(Entity, {debug: true});

describe('new Pool()', () => {
  it('should construct a new pool' , () => {
    expect(pool).to.not.equal(undefined);
    expect(pool).to.not.equal(null);
  });

  it('should construct a new pool with correct default config' , () => {
    expect(pool.config).to.not.equal(undefined);
    expect(pool.config.debug).to.equal(true);
    expect(pool.config.expandFactor).to.equal(0.2);
    expect(pool.config.max).to.equal(65536);
    expect(pool.config.min).to.equal(2);
    expect(pool.config.recycle).to.equal(false);
  });

  it('should construct a new pool with correct properties' , () => {
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(0);
    expect(pool.type).to.be.an.instanceof(Entity);
  });
});

describe('expandBy()', () => {
  it('should expand the pools size by 2', () => {
    pool.expandBy(2);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(4);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(4);
    expect(pool.used).to.equal(0);
  });

  it('should attempt to expand with invalid input and fail', () => {
    pool.expandBy("hello, world!");
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(4);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(4);
    expect(pool.used).to.equal(0);
  });

  it('should attempt to expand with no input and fail', () => {
    pool.expandBy();
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(4);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(4);
    expect(pool.used).to.equal(0);
  });
});

describe('shrinkBy()', () => {
  it('should shrink the pools size by 2', () => {
    pool.shrinkBy(2);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(0);
  });

  it('should attempt to shrink the pool below minimum and fail', () => {
    pool.shrinkBy(200);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(0);
  });

  it('should attempt to shrink with invalid input and fail' , () => {
    pool.shrinkBy("hello, world");
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(0);
  });

  it('should attempt to shrink with no input and fail' , () => {
    pool.shrinkBy();
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(0);
  });
});

describe('resizeTo()', () => {
  it('should resize the pools size to 10', () => {
    pool.resizeTo(10);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(10);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(10);
    expect(pool.used).to.equal(0);
  });

  it('should resize the pools size to 2', () => {
    pool.resizeTo(2);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(0);
  });

  it('should attempt to resize the pool below minimum and fail', () => {
    pool.resizeTo(1);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(0);
  });

  it('should resize the pools size to 100', () => {
    pool.resizeTo(100);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(100);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(100);
    expect(pool.used).to.equal(0);
  });
});

describe('empty()', () => {
  it('should empty the pool' , () => {
    pool.empty();
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(0);
  });
});

let itemA;
let itemB;
let itemC;

describe('get()', () => {
  it('should get an object from the pool' , () => {
    itemA = pool.get();
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(1);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(1);
  });

  it('should get a second object from the pool' , () => {
    itemB = pool.get();
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(true);
    expect(pool.available).to.equal(0);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(2);
    expect(pool.used).to.equal(2);
  });

  it('should get a third object from the pool' , () => {
    itemC = pool.get();
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(0);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(3);
    expect(pool.used).to.equal(3);
  });
});

describe('release()', () => {
  it('should release an item back to the pool' , () => {
    pool.release(itemA);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(1);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(3);
    expect(pool.used).to.equal(2);
  });

  it('should release a second item back to the pool' , () => {
    pool.release(itemB);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(2);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(3);
    expect(pool.used).to.equal(1);
  });

  it('should release a third item back to the pool' , () => {
    pool.release(itemC);
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(3);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(3);
    expect(pool.used).to.equal(0);
  });

  it('should attempt to release an invalid item back to the pool and fail' , () => {
    pool.release("hello, world!");
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(3);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(3);
    expect(pool.used).to.equal(0);

  });

  it('should attempt to release nothing back to the pool and fail' , () => {
    pool.release();
    expect(pool.atMax).to.equal(false);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(3);
    expect(pool.max).to.equal(65536);
    expect(pool.min).to.equal(2);
    expect(pool.size).to.equal(3);
    expect(pool.used).to.equal(0);
  });
});

describe('setConfig()', () => {
  it('set the expandFactor to 2' , () => {
    pool.setConfig({expandFactor: 2});
    expect(pool.config.expandFactor).to.equal(2);
  });

  it('set the recycle flag to true' , () => {
    pool.setConfig({recycle: true});
    expect(pool.config.recycle).to.equal(true);
  });

  it('set the minimum capacity to 4' , () => {
    pool.setConfig({min: 4});
    expect(pool.config.min).to.equal(4);
    expect(pool.size).to.equal(4);
  });

  it('set the maximum capacity to 10' , () => {
    pool.setConfig({max: 10});
    expect(pool.config.max).to.equal(10);
    expect(pool.size).to.equal(4);
  });


  it('should attempt to expand beyond the maximum capacity and fail' , () => {
    pool.expandBy(100);
    expect(pool.atMax).to.equal(true);
    expect(pool.atMin).to.equal(false);
    expect(pool.available).to.equal(10);
    expect(pool.max).to.equal(10);
    expect(pool.min).to.equal(4);
    expect(pool.size).to.equal(10);
    expect(pool.used).to.equal(0);
  });
});
