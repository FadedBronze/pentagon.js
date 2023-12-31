function genGetDeltaMilis() {
  let lastUpdate = Date.now();

  return () => {
    const now = Date.now();
    const dt = now - lastUpdate;
    lastUpdate = now;

    return dt;
  };
}

export default genGetDeltaMilis;
