(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* Mobile menu */
  var toggle = document.querySelector('.site-nav__toggle');
  var menu = document.getElementById('site-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });

    menu.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      }
    });
  }

  /* Current section in the menu */
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav__menu a'));
  var sections = links.map(function (a) {
    return document.getElementById(a.getAttribute('href').slice(1));
  });

  function setCurrent(id) {
    links.forEach(function (a) {
      if (a.getAttribute('href') === '#' + id) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setCurrent(entry.target.id);
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) {
      if (section) navObserver.observe(section);
    });

    /* Reveal on scroll (fallback when GSAP did not load) */
    var revealObserver = hasGsap ? null : new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    if (!hasGsap) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  } else if (!hasGsap) {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (hasGsap) {
    initGsap();
  }

  /* Gentle parallax on the bio photo (desktop only, off with reduced motion) */
  var photo = document.querySelector('.hero__photo');
  if (photo) {
    var ticking = false;
    var update = function () {
      var offset = Math.min(window.scrollY * 0.08, 60);
      photo.style.transform = 'translate3d(0,' + offset + 'px,0)';
      ticking = false;
    };
    var enableParallax = function () {
      window.removeEventListener('scroll', onScroll);
      photo.style.transform = '';
      if (!reduceMotion.matches && window.innerWidth > 900) {
        window.addEventListener('scroll', onScroll, { passive: true });
      }
    };
    var onScroll = function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    enableParallax();
    window.addEventListener('resize', enableParallax);
    reduceMotion.addEventListener('change', enableParallax);
  }

  /* GSAP: intro fade for the nav and scroll reveals via ScrollTrigger.
     Only runs when the user has not asked for less motion; otherwise the
     CSS shows the content as is. */
  function initGsap() {
    root.classList.add('has-gsap');
    gsap.registerPlugin(ScrollTrigger);

    var mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      gsap.from('.site-nav', {
        autoAlpha: 0,
        duration: 0.8,
        ease: 'power1.out'
      });

      gsap.utils.toArray('.reveal').forEach(function (el) {
        gsap.fromTo(el,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            onComplete: function () {
              el.classList.add('is-visible');
            }
          }
        );
      });
    });
  }
})();
