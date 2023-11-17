import sharp from 'sharp'

const sampleSize = 32
const lowSize = 8

function initSQRT(N) {
    const c = new Array(N)
    for (let i = 1; i < N; i++) {
        c[i] = 1
    }
    c[0] = 1 / Math.sqrt(2.0)
    return c
}

const SQRT = initSQRT(sampleSize)

const initCOS = function (N) {
    const cosines = new Array(N)
    for (let k = 0; k < N; k++) {
        cosines[k] = new Array(N)
        for (let n = 0; n < N; n++) {
            cosines[k][n] = Math.cos(((2 * k + 1) / (2.0 * N)) * n * Math.PI)
        }
    }
    return cosines
}

const COS = initCOS(sampleSize)

function applyDCT(f, size) {
    const N = size

    const F = new Array(N)
    for (let u = 0; u < N; u++) {
        F[u] = new Array(N)
        for (let v = 0; v < N; v++) {
            let sum = 0
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    sum += COS[i][u] * COS[j][v] * f[i][j]
                }
            }
            sum *= (SQRT[u] * SQRT[v]) / 4
            F[u][v] = sum
        }
    }
    return F
}

/**
 * Calculates the perceptual hash (phash) of an image using the given sharpOptions.
 * @param {string} image - The path or buffer of the image.
 * @param {object} sharpOptions - The options to be passed to the sharp library.
 * @returns {Promise<string>} The calculated perceptual hash of the image.
 */
export default async function phash(image, sharpOptions, digest = 'hex') {
    const data = await sharp(image, sharpOptions)
        .greyscale()
        .resize(sampleSize, sampleSize, { fit: 'fill' })
        .rotate()
        .raw()
        .toBuffer()

    // copy signal
    const s = new Array(sampleSize)
    for (let x = 0; x < sampleSize; x++) {
        s[x] = new Array(sampleSize)
        for (let y = 0; y < sampleSize; y++) {
            s[x][y] = data[sampleSize * y + x]
        }
    }

    // apply 2D DCT II
    const dct = applyDCT(s, sampleSize)

    // get AVG on high frequencies
    let totalSum = 0
    for (let x = 0; x < lowSize; x++) {
        for (let y = 0; y < lowSize; y++) {
            totalSum += dct[x + 1][y + 1]
        }
    }

    const avg = totalSum / (lowSize * lowSize)

    // compute hash
    let fingerprintBinary = ''

    for (let x = 0; x < lowSize; x++) {
        for (let y = 0; y < lowSize; y++) {
            fingerprintBinary += dct[x + 1][y + 1] > avg ? '1' : '0'
        }
    }

    // Convert binary string to hexadecimal
    let fingerprintHex = ''
    for (let i = 0; i < fingerprintBinary.length; i += 4) {
        let nibble = fingerprintBinary.substring(i, i + 4)
        fingerprintHex += parseInt(nibble, 2).toString(16)
    }

    if (digest === 'binary') {
        return fingerprintBinary
    } else {
        return fingerprintHex
    }
}
