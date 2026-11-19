document.getElementById('retry').addEventListener('click', async () => {
  const button = document.getElementById('retry');
  button.disabled = true;
  button.textContent = 'Checking connection…';
  try {
    const response = await fetch(
      `/manifest.json?connection-check=${Date.now()}`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) throw new Error('Unavailable');
    window.location.reload();
  } catch {
    document.getElementById('message').textContent =
      'Still unable to connect. Check your connection and try again, or browse saved stories.';
  } finally {
    button.disabled = false;
    button.textContent = 'Retry connection';
  }
});
