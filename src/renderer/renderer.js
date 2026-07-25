const dog = document.querySelector('#dog');
let mode = 'wandering';
let bounceTimer = null;

function renderMode(nextMode) {
  mode = nextMode;
  const isCute = mode === 'cute';
  dog.classList.toggle('cute', isCute);
  dog.setAttribute('aria-pressed', String(isCute));
}

function setMode(nextMode) {
  renderMode(nextMode);
  const isCute = mode === 'cute';
  window.desktopPet.setPaused(isCute);
}

dog.addEventListener('click', () => {
  setMode(mode === 'wandering' ? 'cute' : 'wandering');
});

window.desktopPet.onDirection(({ x, y, bounced }) => {
  if (mode !== 'wandering') return;
  dog.classList.toggle('facing-left', x < 0);
  dog.classList.toggle('walking-up', y < 0);

  if (bounced) {
    clearTimeout(bounceTimer);
    dog.classList.remove('bounced');
    void dog.offsetWidth;
    dog.classList.add('bounced');
    bounceTimer = setTimeout(() => dog.classList.remove('bounced'), 180);
  }
});

window.desktopPet.onPaused((paused) => {
  renderMode(paused ? 'cute' : 'wandering');
});
