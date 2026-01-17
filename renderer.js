document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggle = document.getElementById('theme-toggle');

  if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('theme-dark');
  }

  toggle.addEventListener('click', () => {
    body.classList.toggle('theme-dark');
    localStorage.setItem(
      'theme',
      body.classList.contains('theme-dark') ? 'dark' : 'light'
    );
  });

  // Reveal animations
  const items = document.querySelectorAll('section, .profile-card, .author-card');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(15px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
});
