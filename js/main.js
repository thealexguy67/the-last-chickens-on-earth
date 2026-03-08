// ============================================================
// INITIALIZATION
// ============================================================
function init() {
  setupCanvas();
  preRenderAssets();
  buildGrid();
  buildPath();
  precomputePathPixels();
  changeState('MENU');
  requestAnimationFrame(gameLoop);
}

window.addEventListener('load', init);
