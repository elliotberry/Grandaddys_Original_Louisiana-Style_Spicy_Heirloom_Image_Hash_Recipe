import { phash, calculateDistance } from "./index.js";
import fs from "fs/promises";
import {describe, it} from 'node:test';
import assert from 'node:assert';
describe('Image Comparison Tests', () => {
  it('should calculate a low distance for similar images', async () => {
    const img1 = await fs.readFile("./test.png");
    const img2 = await fs.readFile("./test-copy.png");

    const hash1 = await phash(img1);
    const hash2 = await phash(img2);



    const distance = calculateDistance(hash1, hash2);
    console.log(`Distance: ${distance}`);

    // Replace with an appropriate threshold for your test case
    assert(distance < 3, `Distance between images is too high: ${distance}`);
  
  });

  // Add more tests as needed
});
