document.addEventListener('DOMContentLoaded', () => {

  // ---------- LOADER ----------
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => { if(loader) loader.classList.add('fade-out'); }, 1500);
  });

  // ---------- LANGUE ----------
  const btnFr = document.getElementById('btnFr');
  const btnEn = document.getElementById('btnEn');
  let currentLang = localStorage.getItem('lang') || 'fr';
  applyLang(currentLang);

  btnFr.addEventListener('click', () => applyLang('fr'));
  btnEn.addEventListener('click', () => applyLang('en'));

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    btnFr.classList.toggle('active', lang==='fr');
    btnEn.classList.toggle('active', lang==='en');
    document.querySelectorAll('[data-lang-fr]').forEach(el => {
      el.innerHTML = el.getAttribute(`data-lang-${lang}`);
    });
    updateClock();
  }

  // ---------- MODE SOMBRE / CLAIR + LOGOS ----------
  const modeToggle = document.getElementById('modeToggle');
  const body = document.body;
  const loaderLogo = document.getElementById('loaderLogo');
  const navLogo = document.getElementById('navLogo');
  const loaderFallback = document.getElementById('loaderFallback');
  const navLogoFallback = document.getElementById('navLogoFallback');

  function setLogoWithFallback(imgElement, fallbackElement, src) {
    if (!imgElement) return;
    imgElement.src = src;
    imgElement.style.display = 'block';
    if (fallbackElement) fallbackElement.style.display = 'none';
    imgElement.onload = () => { imgElement.style.display = 'block'; if(fallbackElement) fallbackElement.style.display = 'none'; };
    imgElement.onerror = () => { imgElement.style.display = 'none'; if(fallbackElement) fallbackElement.style.display = 'block'; };
  }

  function setMode(dark) {
    if (dark) {
      body.classList.remove('light-mode');
      modeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', 'dark');
      setLogoWithFallback(loaderLogo, loaderFallback, 'img/logo-dark.png');
      setLogoWithFallback(navLogo, navLogoFallback, 'img/logo-dark.png');
    } else {
      body.classList.add('light-mode');
      modeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem('theme', 'light');
      setLogoWithFallback(loaderLogo, loaderFallback, 'img/logo-light.png');
      setLogoWithFallback(navLogo, navLogoFallback, 'img/logo-light.png');
    }
    initBackground();
  }

  const canvas = document.getElementById('starsCanvas');
  const ctx = canvas.getContext('2d');
  let stars = [], shootingStars = [], clouds = [];
  let animationFrame;
  let moon = { x: 0, y: 0, radius: 50 };
  let sun = { x: 0, y: 0, radius: 60 };

  function initBackground() {
    const isDark = body.classList.contains('light-mode') === false;
    stars = []; shootingStars = []; clouds = [];
    if (isDark) {
      const count = Math.floor((canvas.width * canvas.height) / 4000);
      for (let i = 0; i < count; i++) {
        stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 1.8 + 0.5, twinkle: Math.random() * 0.03 + 0.005 });
      }
      moon.x = canvas.width * 0.85;
      moon.y = canvas.height * 0.15;
      moon.radius = Math.min(canvas.width, canvas.height) * 0.08;
    } else {
      sun.x = canvas.width * 0.85;
      sun.y = canvas.height * 0.18;
      sun.radius = Math.min(canvas.width, canvas.height) * 0.07;
      for (let i = 0; i < 5; i++) {
        clouds.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.5 + 50, width: Math.random() * 120 + 80, speed: Math.random() * 0.5 + 0.2, opacity: Math.random() * 0.4 + 0.3 });
      }
    }
  }

  function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = body.classList.contains('light-mode') === false;
    if (isDark) {
      stars.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.fill(); s.radius += s.twinkle; if(s.radius>2.2||s.radius<0.5) s.twinkle*=-1; });
      for (let i=shootingStars.length-1; i>=0; i--) { let ss=shootingStars[i]; let g=ctx.createLinearGradient(ss.x,ss.y,ss.x+ss.length,ss.y+ss.length); g.addColorStop(0,'rgba(255,255,200,0.9)'); g.addColorStop(1,'transparent'); ctx.beginPath(); ctx.moveTo(ss.x,ss.y); ctx.lineTo(ss.x+ss.length,ss.y+ss.length); ctx.strokeStyle=g; ctx.lineWidth=2; ctx.stroke(); ss.x+=ss.speedX; ss.y+=ss.speedY; ss.length*=0.98; if(ss.x>canvas.width+100||ss.y>canvas.height+100||ss.length<1) shootingStars.splice(i,1); }
      if(Math.random()<0.02) shootingStars.push({ x:Math.random()*canvas.width*0.8, y:Math.random()*canvas.height*0.3, length:Math.random()*80+30, speedX:Math.random()*4+1, speedY:Math.random()*4+1 });
      ctx.beginPath(); ctx.arc(moon.x,moon.y,moon.radius,0,Math.PI*2); ctx.fillStyle='rgba(255,255,240,0.9)'; ctx.shadowColor='rgba(255,255,200,0.6)'; ctx.shadowBlur=20; ctx.fill(); ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.beginPath(); ctx.arc(moon.x-moon.radius*0.3,moon.y-moon.radius*0.3,moon.radius*0.8,0,Math.PI*2); ctx.fillStyle='rgba(30,30,30,0.4)'; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(sun.x,sun.y,sun.radius+15,0,Math.PI*2); ctx.fillStyle='rgba(255,215,0,0.15)'; ctx.fill();
      ctx.save(); ctx.translate(sun.x,sun.y); for(let i=0;i<12;i++){ let a=(i/12)*Math.PI*2; let dx=Math.cos(a)*(sun.radius+10),dy=Math.sin(a)*(sun.radius+10); ctx.beginPath(); ctx.moveTo(Math.cos(a)*(sun.radius-5),Math.sin(a)*(sun.radius-5)); ctx.lineTo(dx,dy); ctx.strokeStyle='rgba(255,200,0,0.5)'; ctx.lineWidth=3; ctx.stroke(); } ctx.restore();
      ctx.beginPath(); ctx.arc(sun.x,sun.y,sun.radius,0,Math.PI*2); let g=ctx.createRadialGradient(sun.x,sun.y,sun.radius*0.2,sun.x,sun.y,sun.radius); g.addColorStop(0,'#FFF9C4'); g.addColorStop(0.5,'#FFD54F'); g.addColorStop(1,'#FFB300'); ctx.fillStyle=g; ctx.fill();
      clouds.forEach(c=>{ ctx.save(); ctx.globalAlpha=c.opacity; ctx.fillStyle='#FFFFFF'; ctx.shadowColor='rgba(0,0,0,0.05)'; ctx.shadowBlur=10; let cx=c.x+c.width/2, by=c.y+c.width*0.25; ctx.beginPath(); ctx.arc(cx-c.width*0.25,by-c.width*0.1,c.width*0.25,0,Math.PI*2); ctx.arc(cx+c.width*0.2,by-c.width*0.12,c.width*0.3,0,Math.PI*2); ctx.arc(cx,by-c.width*0.05,c.width*0.35,0,Math.PI*2); ctx.arc(cx-c.width*0.1,by+c.width*0.05,c.width*0.2,0,Math.PI*2); ctx.arc(cx+c.width*0.15,by+c.width*0.05,c.width*0.25,0,Math.PI*2); ctx.fill(); ctx.restore(); c.x+=c.speed; if(c.x>canvas.width+200){ c.x=-200; c.y=Math.random()*canvas.height*0.5+50; } });
    }
    animationFrame = requestAnimationFrame(drawBackground);
  }

  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initBackground(); }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  drawBackground();

  let isDark = localStorage.getItem('theme') !== 'light';
  setMode(isDark);
  modeToggle.addEventListener('click', () => { isDark = !isDark; setMode(isDark); });

  // ---------- HORLOGE ----------
  function updateClock() {
    const now = new Date();
    const locale = currentLang === 'fr' ? 'fr-FR' : 'en-US';
    document.querySelector('#clock .time').textContent = now.toLocaleTimeString(locale, { timeZone: 'Indian/Antananarivo', hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
    document.querySelector('#clock .date').textContent = now.toLocaleDateString(locale, { timeZone: 'Indian/Antananarivo', weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ---------- MENU MOBILE ----------
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  toggle?.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
  // Fermer le menu quand on clique sur un lien
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('active'));
  });

  // ---------- SCROLL TOP ----------
  const scrollBtn = document.getElementById('scrollTopBtn');
  window.addEventListener('scroll', () => scrollBtn.classList.toggle('visible', window.scrollY > 500));
  scrollBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // ---------- GALERIE SLIDER MANUEL + LIGHTBOX ----------
  const slidesContainer = document.getElementById('gallerySlides');
  const slides = document.querySelectorAll('.gallery-slide');
  const prevBtn = document.getElementById('galleryPrev');
  const nextBtn = document.getElementById('galleryNext');
  const dots = document.querySelectorAll('.gallery-dots .dot');
  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateSlider() {
    slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlider();
  });
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlider();
  });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      currentIndex = parseInt(dot.getAttribute('data-index'));
      updateSlider();
    });
  });

  // Swipe tactile
  let touchStartX = 0;
  let touchEndX = 0;
  slidesContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  slidesContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextBtn.click();
    if (touchEndX > touchStartX + 50) prevBtn.click();
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.querySelector('.lightbox-close');

  document.querySelectorAll('.gallery-slide img, .gallery-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      let src;
      if (trigger.tagName === 'IMG') {
        src = trigger.src;
      } else {
        src = trigger.getAttribute('data-img');
      }
      if (src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
      }
    });
  });

  lightboxClose.addEventListener('click', () => lightbox.classList.remove('active'));
  lightbox.addEventListener('click', e => { if(e.target===lightbox) lightbox.classList.remove('active'); });

  // ---------- MODALES DISPONIBILITÉ & RÉSERVATION ----------
  const availabilityModal = document.getElementById('availabilityModal');
  const bookingModal = document.getElementById('bookingModal');
  function closeAllModals() { availabilityModal.classList.remove('active'); bookingModal.classList.remove('active'); }
  document.querySelectorAll('.open-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-modal');
      closeAllModals();
      if(type==='availability'){ availabilityModal.classList.add('active'); generateCalendar('calendarGridAvailability'); }
      else if(type==='booking') bookingModal.classList.add('active');
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeAllModals));
  window.addEventListener('click', e => { if(e.target.classList.contains('modal-overlay')) closeAllModals(); });

  function generateCalendar(gridId) {
    const grid = document.getElementById(gridId);
    if(!grid) return;
    grid.innerHTML = '';
    const today = new Date();
    for(let i=0;i<14;i++){ let d=new Date(today); d.setDate(today.getDate()+i); let div=document.createElement('div'); div.textContent=d.getDate()+' '+d.toLocaleString('fr-FR',{month:'short'}); let booked=(i===3||i===7||i===10); div.className=booked?'booked':'free'; if(!booked) div.addEventListener('click',()=>alert(currentLang==='fr'?'✅ Date disponible !':'✅ Date available!')); grid.appendChild(div); }
  }

  document.getElementById('bookingForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const cin=document.getElementById('bookCheckin').value, cout=document.getElementById('bookCheckout').value;
    if(!cin||!cout) return alert(currentLang==='fr'?'Veuillez choisir les deux dates.':'Please choose both dates.');
    if(new Date(cin)>=new Date(cout)) return alert(currentLang==='fr'?'La date de départ doit être après l’arrivée.':'Check-out must be after check-in.');
    alert(currentLang==='fr'?'Réservation confirmée (simulation) !':'Booking confirmed (simulation)!');
    bookingModal.classList.remove('active');
  });

  // ---------- RÉVÉLATION SCROLL ----------
  const observer = new IntersectionObserver((entries) => { entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('revealed'); observer.unobserve(e.target); } }) }, { threshold:0.15 });
  document.querySelectorAll('.reveal, .room-card, .service-item, .testimonial-card, .booking-card').forEach(el => observer.observe(el));

  // ---------- EFFET 3D SUR LES CARTES ----------
  document.querySelectorAll('.room-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const rotX = (y - rect.height/2)/10, rotY = (x - rect.width/2)/10;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

});