import { phash, calculateDistance } from './index.js'
import fs from 'fs/promises'
import { describe, it, test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'

const originalImg = "./logo.png"
const copyImg = "./logo-copy.png"
describe('Image Comparison Tests', () => {
    beforeEach(async () => {
        const img = await fs.readFile(originalImg)
        await fs.writeFile(copyImg, img)
    })
    afterEach(async () => {
        await fs.unlink(copyImg)
    })
    it('should calculate a low distance for similar images', async () => {
        const img1 = await fs.readFile(originalImg)
        const img2 = await fs.readFile(copyImg)

        const hash1 = await phash(img1)
        const hash2 = await phash(img2)

        const distance = calculateDistance(hash1, hash2)
        console.log(`Distance: ${distance}`)

        // Replace with an appropriate threshold for your test case
        assert(distance < 3, `Distance between images is too high: ${distance}`)
    })

    // Add more tests as needed
})
