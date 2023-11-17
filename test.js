import phash from "./index.js";
import dist from "./distance.js";
import fs from "fs/promises";

const go = async () => {
  const img1 = await fs.readFile("./test.png");
  const img2 = await fs.readFile("./test1.png");

  const hash1 = await phash(img1);
  const hash2 = await phash(img2);

  console.log(hash1, hash2);
  console.log(dist(hash1, hash2));
}

go();