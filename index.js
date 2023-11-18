import sharp from 'sharp'

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

const initCOS = (N) =>
    Array.from({ length: N }, (_, k) =>
        Array.from({ length: N }, (_, n) =>
            Math.cos(((2 * k + 1) / (2.0 * N)) * n * Math.PI)
        )
    )

const COS = initCOS(sampleSize)

const applyDCT = function (f, size, SQRT) {
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

const hashResults = (dct, avg) => {
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

    return { fingerprintBinary, fingerprintHex }
}


async function phash(image, digest = 'binary') {
    const data = await sharp(image, {})
        .greyscale()
        .resize(sampleSize, sampleSize, { fit: 'fill' })
        .rotate()
        .raw()
        .toBuffer()

    const signal = Array.from({ length: sampleSize }, (_, x) =>
        Array.from({ length: sampleSize }, (_, y) => data[sampleSize * y + x])
    )

    // apply 2D DCT II
    const dct = applyDCT(signal, sampleSize, initSQRT(sampleSize))

    // get AVG on high frequencies
    const totalSum = Array.from({ length: lowSize }, (_, x) =>
        Array.from({ length: lowSize }, (_, y) => dct[x + 1][y + 1])
    )
        .flat()
        .reduce((sum, value) => sum + value, 0)

    const avg = totalSum / (lowSize * lowSize)

    const { fingerprintBinary, fingerprintHex } = hashResults(dct, avg)
    if (digest === 'binary') {
        return fingerprintBinary
    } else if (digest === 'hex') {
        return fingerprintHex
    } else {
        return { fingerprintBinary, fingerprintHex }
    }
}

export { phash, calculateDistance }
