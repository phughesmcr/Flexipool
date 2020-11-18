# :swimmer: Flexipool

An generic object pool written in Typescript, compatible with Browser, Node & Deno.

## Usage

### Typescript

```typescript
import { Pool, Poolable } from "flexipool.ts";

class Entity implements Poolable<Entity> {
  constructor() {
    super();
  }

  // called when entity.destroy() is called
  _onDispose() {
    // your code here
  }
}

const pool: Pool<Entity> = new Pool(Entity);

const item = pool.get(); // returns an Entity

pool.release(item);

```

### Javascript / Browser

`flexipool.js` can be found in `./dist/`.

```javascript
import { Pool } from "flexipool.js";

class Entity implements Poolable<Entity> {
  constructor() {
    super();
  }

  // called when entity.destroy() is called
  _onDispose() {
    // your code here
  }
}

const pool = new Pool(Entity);

const item = pool.get(); // returns an Entity

pool.release(item);
```

### Testing

```bash
npm run test
```

## :books: Docs

See `docs/index.html` for complete docs.

## :gear: Config

The `PoolConfig` type object has several options you can configure:

### expandFactor

If the pool is not at maximum capacity but there are no objects available, the pool will attempt to expand itself by this amount rounded up to the nearest whole number.

For example `expandFactor: 0.2` means the pool size will attempt to expand by 20%.

### min

The minimum capacity of the pool. Cannot be less than 1.

This is the minimum capacity, not the minimum available objects. The minimum available objects is always 0.

### max

The maximum capacity of the pool. Defaults to infinity.

### recycle

If true, pool elements are reused if maximum capacity is reached.

If false, and the pool is at maximum capacity, `get()` will return undefined.

Ignored if max is undefined.

## :sparkles: Contributing

Contributions welcome. Please include tests and stick to the style guide (`.eslintrc.json`).

## :memo: License
MIT License

Copyright (c) 2020 Peter Hughes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
