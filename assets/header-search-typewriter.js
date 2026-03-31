(function () {
  function phrasesFromScript(scriptEl) {
    try {
      var list = JSON.parse(scriptEl.textContent);
      return Array.isArray(list) ? list.filter(function (s) { return typeof s === 'string' && s.trim(); }) : [];
    } catch (e) {
      return [];
    }
  }

  function runTypewriter(input, phrases) {
    var staticPlaceholder = input.getAttribute('data-typewriter-static') || '';
    var timer = null;
    var phraseIndex = 0;
    var charIndex = 0;
    var deleting = false;

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    function applyStatic() {
      clearTimer();
      input.placeholder = staticPlaceholder;
    }

    function step() {
      if (document.hidden || input.value.length > 0 || document.activeElement === input) {
        applyStatic();
        return;
      }

      var phrase = phrases[phraseIndex % phrases.length];
      if (!phrase) {
        phraseIndex++;
        timer = setTimeout(step, 400);
        return;
      }

      if (!deleting) {
        charIndex++;
        input.placeholder = phrase.slice(0, charIndex);
        if (charIndex >= phrase.length) {
          deleting = true;
          timer = setTimeout(step, 1800);
          return;
        }
        timer = setTimeout(step, 85);
      } else {
        charIndex--;
        input.placeholder = phrase.slice(0, Math.max(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex++;
          timer = setTimeout(step, 400);
          return;
        }
        timer = setTimeout(step, 40);
      }
    }

    function start() {
      applyStatic();
      if (document.hidden || input.value.length > 0 || document.activeElement === input || !phrases.length) return;
      charIndex = 0;
      deleting = false;
      step();
    }

    input.addEventListener('focus', applyStatic);
    input.addEventListener('blur', function () {
      if (!input.value) start();
    });
    input.addEventListener('input', function () {
      if (input.value) applyStatic();
      else if (document.activeElement !== input) start();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) applyStatic();
      else start();
    });

    start();
  }

  function init() {
    document.querySelectorAll('script[type="application/json"][data-search-typewriter]').forEach(function (s) {
      var id = s.getAttribute('data-input-id');
      if (!id) return;
      var input = document.getElementById(id);
      if (!input || input.getAttribute('data-search-typewriter') !== 'true') return;
      var phrases = phrasesFromScript(s);
      if (phrases.length) runTypewriter(input, phrases);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
