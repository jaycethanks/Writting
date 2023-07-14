function handleNavgate(template) {
  switch (template) {
    case 'foo':
      window.history.pushState({ name: 'foo' }, '', 'foo.html');
      break;
    case 'bar':
      window.history.pushState({ name: 'bar' }, '', 'bar.html');
      break;
  }
}

window.addEventListener('popstate', () => {
  console.log('trigger');
});

window.addEventListener('hashchange', () => {
  console.log('[location.hash]: ', location.hash);
});
