const sampleSize = 32
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

export default applyDCT