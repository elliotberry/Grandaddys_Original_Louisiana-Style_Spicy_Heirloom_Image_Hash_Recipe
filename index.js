import sharp from 'sharp'
import applyDCT from './applyDCT.js'

const sampleSize = 32
const lowSize = 8

const calculateDistance = function (a, b) {
    a = a.split('')
    b = b.split('')
    return a.reduce((count, value, index) => {
        if (value !== b[index]) {
            count++
        }
        return count
    }, 0)
}

function initSQRT(N) {
    const c = new Array(N)
    for (let i = 1; i < N; i++) {
        c[i] = 1
    }
    c[0] = 1 / Math.sqrt(2.0)
    return c
}

const hashResults = (dct, avg, digest = 'hex') => {
    let fingerprintBinary = ''

    for (let x = 0; x < lowSize; x++) {
        for (let y = 0; y < lowSize; y++) {
            fingerprintBinary += dct[x + 1][y + 1] > avg ? '1' : '0'
        }
    }

    if (digest === 'binary') {
        return fingerprintBinary
    } else if (digest === 'hex') {
        // Convert binary string to hexadecimal
        let fingerprintHex = ''
        for (let i = 0; i < fingerprintBinary.length; i += 4) {
            let nibble = fingerprintBinary.substring(i, i + 4)
            fingerprintHex += parseInt(nibble, 2).toString(16)
        }

        return fingerprintHex
    }
    else {
        throw new Error('Invalid digest type')
    }
}

async function phash(image, digest = 'binary') {
    
    if (digest !== 'binary' && digest !== 'hex') {
        throw new Error('Invalid digest type')
    }

    const data = await sharp(image, {})
        .greyscale()
        .resize(sampleSize, sampleSize, { fit: 'fill' })
        .rotate()
        .raw()
        .toBuffer()

    const signal = Array.from({ length: sampleSize }, (_, x) =>
        Array.from({ length: sampleSize }, (_, y) => data[sampleSize * y + x])
    )

    // apply 2D discrete cosine transform II
    const dct = applyDCT(signal, sampleSize, initSQRT(sampleSize))

    // get AVG on high frequencies
    const totalSum = Array.from({ length: lowSize }, (_, x) =>
        Array.from({ length: lowSize }, (_, y) => dct[x + 1][y + 1])
    )
        .flat()
        .reduce((sum, value) => sum + value, 0)

    const avg = totalSum / (lowSize * lowSize)

    return hashResults(dct, avg, digest)
   
}

export { phash, calculateDistance }
