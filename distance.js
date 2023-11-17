function distance(a, b) {
  return a.reduce((count, value, index) => {
    if (value !== b[index]) {
      count++;
    }
    return count;
  }, 0);
}

export default distance;
