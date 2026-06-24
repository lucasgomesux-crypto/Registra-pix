(function () {
  const demo = document.querySelector('.flow-demo');
  if (!demo) return;

  const totalizerValue = demo.querySelector('.flow-demo__totalizer-value');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FLOW_DURATION = 7500;
  const COUNTER_START_AT = 5200;
  const COUNTER_DURATION = 800;

  const from = parseInt(totalizerValue.dataset.from, 10) || 8420;
  const increment = parseInt(totalizerValue.dataset.increment, 10) || 150;
  const to = from + increment;

  function formatCurrency(value) {
    return 'R$\u00a0' + value.toLocaleString('pt-BR');
  }

  function animateCounter() {
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / COUNTER_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);

      totalizerValue.textContent = formatCurrency(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        totalizerValue.classList.add('is-updated');
        setTimeout(() => totalizerValue.classList.remove('is-updated'), 600);
      }
    }

    totalizerValue.textContent = formatCurrency(from);
    requestAnimationFrame(tick);
  }

  function resetCounter() {
    totalizerValue.textContent = formatCurrency(from);
    totalizerValue.classList.remove('is-updated');
  }

  function updateReceiptPositions() {
    const theater = demo.querySelector('.flow-demo__theater');
    const notification = demo.querySelector('.phone__notification');
    const zoneReceipt = demo.querySelector('.receipt--zone');
    const flying = demo.querySelector('.receipt--flying');

    if (!theater || !notification || !zoneReceipt || !flying) return;

    const theaterRect = theater.getBoundingClientRect();
    const notifRect = notification.getBoundingClientRect();
    const zoneRect = zoneReceipt.getBoundingClientRect();
    const flyingWidth = flying.offsetWidth;

    const startTop = notifRect.top - theaterRect.top + notifRect.height / 2 - flying.offsetHeight / 2;
    const startLeft = notifRect.left - theaterRect.left + notifRect.width / 2 - flyingWidth / 2;

    const endCenterX = zoneRect.left - theaterRect.left + zoneRect.width / 2;
    const endCenterY = zoneRect.top - theaterRect.top + zoneRect.height / 2;

    const dx = endCenterX - (startLeft + flyingWidth / 2);
    const dy = endCenterY - (startTop + flying.offsetHeight / 2);

    demo.style.setProperty('--receipt-top', startTop + 'px');
    demo.style.setProperty('--receipt-left', startLeft + 'px');
    demo.style.setProperty('--receipt-dx', dx + 'px');
    demo.style.setProperty('--receipt-dy', dy + 'px');

    flying.style.marginLeft = '0';
    flying.style.top = startTop + 'px';
    flying.style.left = startLeft + 'px';
  }

  if (reducedMotion) {
    totalizerValue.textContent = formatCurrency(to);
    demo.classList.add('is-playing');
    updateReceiptPositions();
    return;
  }

  let cycleTimer = null;
  let counterTimer = null;

  function startCycle() {
    clearTimeout(cycleTimer);
    clearTimeout(counterTimer);
    updateReceiptPositions();
    resetCounter();

    counterTimer = setTimeout(animateCounter, COUNTER_START_AT);
    cycleTimer = setTimeout(startCycle, FLOW_DURATION);
  }

  function stopCycle() {
    clearTimeout(cycleTimer);
    clearTimeout(counterTimer);
    resetCounter();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries[0].isIntersecting;
      demo.classList.toggle('is-playing', visible);

      if (visible) {
        startCycle();
      } else {
        stopCycle();
      }
    },
    { threshold: 0.3 }
  );

  updateReceiptPositions();
  window.addEventListener('resize', updateReceiptPositions);
  window.addEventListener('load', updateReceiptPositions);

  observer.observe(demo);
})();
