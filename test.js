import { phash, calculateDistance } from "./index.js";
import fs from "fs/promises";

const go = async () => {
  const img1 = await fs.readFile("./test.png");
  const img2 = await fs.readFile("./test1.png");

  const hash1 = await phash(img1);
  const hash2 = await phash(img2);

  console.log(hash1, hash2);
  console.log(calculateDistance(hash1, hash2));
}

go();