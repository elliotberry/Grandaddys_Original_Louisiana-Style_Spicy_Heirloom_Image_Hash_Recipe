# sharp-phash

Sharp-based implementation of perceptual hash (phash) algorithm described [there](http://www.hackerfactor.com/blog/?/archives/432-Looks-Like-It.html).

## Installation

```sh
yarn add sharp-phash
```

## How to use
Takes in file buffer and returns a promise that resolves to a binary phash.

```js
import {phash, distance} from 'sharp-phash'

import fs from 'fs/promises'

const main = async () => {
    const img1 = await fs.readFile('./test.png')
    const img2 = await fs.readFile('./test1.png')

    const hash1 = await phash(img1)
    const hash2 = await phash(img2)
    assert(dist(hash1, hash2) < 5)
}
main()
```
