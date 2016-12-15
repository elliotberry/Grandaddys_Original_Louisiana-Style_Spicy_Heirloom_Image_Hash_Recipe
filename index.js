'use strict';

const sharp = require('sharp');
const Promise = require('bluebird');


const SAMPLE_SIZE = 32;

function initSQRT(N) {
  let c = new Array(N);
  for(let i = 1; i < N; i++) {
    c[i]=1;
  }
  c[0] = 1 / Math.sqrt(2.0);
  return c;
}


const SQRT = initSQRT(SAMPLE_SIZE);

function initCOS(N) {
  let cosines = new Array(N);
  for(let k = 0; k < N; k++) {
    cosines[k] = new Array(N);
    for(let n = 0; n < N; n++) {
      cosines[k][n] = Math.cos(((2 * k + 1) / (2.0 * N)) * n * Math.PI);
    }
  }
  return cosines;
}

const COS = initCOS(SAMPLE_SIZE);

function applyDCT(f, size) {
  var N = size;

  var F = new Array(N);
  for(var u = 0; u < N; u++) {
    F[u] = new Array(N);
    for(var v = 0; v < N; v++) {
      var sum = 0;
      for(var i = 0; i < N; i++) {
        for(var j = 0; j < N; j++) {
          sum += COS[i][u] * COS[j][v] * f[i][j];
        }
      }
      sum *= ((SQRT[u] * SQRT[v]) / 4);
      F[u][v] = sum;
    }
  }
  return F;
}

const LOW_SIZE = 8;


module.exports = function phash(image) {
  return new Promise((resolve, reject) => {
    sharp(image)
      .greyscale()
      //.normalise()
      .resize(SAMPLE_SIZE, SAMPLE_SIZE)
      .ignoreAspectRatio()
      .raw()
      .toBuffer(function(err, data) {
        if(err) {
          reject(err);
        } else {

          // copy signal
          let s = new Array(SAMPLE_SIZE);
          for(let x = 0; x < SAMPLE_SIZE; x++) {
            s[x] = new Array(SAMPLE_SIZE);
            for(let y = 0; y < SAMPLE_SIZE; y++) {
              s[x][y] = data[SAMPLE_SIZE * y + x];
            }
          }

          // apply 2D DCT II
          let dct = applyDCT(s, SAMPLE_SIZE);

          // get AVG on high frequencies
          let totalSum = 0;
          for(let x = 0; x < LOW_SIZE; x++) {
            for(let y = 0; y < LOW_SIZE; y++) {
              totalSum += dct[x][y];
            }
          }

          let avg = totalSum / (LOW_SIZE * LOW_SIZE);

          // compute hash
          let fingerprint = '';

          for(let x = 0; x < LOW_SIZE; x++) {
            for(let y = 0; y < LOW_SIZE; y++) {
              fingerprint += dct[x][y] > avg ? "1" : "0";
            }
          }

          resolve(fingerprint);
        }
      });
  });
};