/**
 * renderer.js - Mejorado para mejor usabilidad y experiencia
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos principales
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const backToTopBtn = document.getElementById('back-to-top');
    const skipLink = document.querySelector('.skip-link');

    // ============================================
    // 1. ACCESIBILIDAD - Skip Link
    // ============================================
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('main-content');
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }

    // ============================================
    // 2. TEMA CLARO/OSCURO con persistencia
    // ============================================
    function initTheme() {
        const storedTheme = localStorage.getItem('site-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Determinar tema inicial
        let isDark = false;
        
        if (storedTheme === 'dark') {
            isDark = true;
        } else if (storedTheme === 'light') {
            isDark = false;
        } else {
            isDark = prefersDark;
        }
        
        // Aplicar tema
        if (isDark) {
            body.classList.add('dark');
            updateThemeButton(true);
        } else {
            body.classList.remove('dark');
            updateThemeButton(false);
        }
        
        // Guardar preferencia
        localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
        
        return isDark;
    }

    function updateThemeButton(isDark) {
        if (!themeBtn) return;
        
        themeBtn.setAttribute('aria-pressed', String(isDark));
        themeBtn.innerHTML = isDark ? 
            '<i class="fa-regular fa-moon" aria-hidden="true"></i>' :
            '<i class="fa-regular fa-sun" aria-hidden="true"></i>';
        
        // Actualizar title para accesibilidad
        themeBtn.title = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    }

    // Inicializar tema
    let currentTheme = initTheme();

    // Manejar clic en botón de tema
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            currentTheme = !currentTheme;
            body.classList.toggle('dark', currentTheme);
            localStorage.setItem('site-theme', currentTheme ? 'dark' : 'light');
            updateThemeButton(currentTheme);
            
            // Feedback visual
            provideVisualFeedback(themeBtn);
        });
    }

    // ============================================
    // 3. MENÚ MÓVIL
    // ============================================
    function initMobileMenu() {
        if (!menuBtn || !mobileMenu) return;
        
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
            
            // Toggle estado
            menuBtn.setAttribute('aria-expanded', String(!isExpanded));
            mobileMenu.hidden = isExpanded;
            
            // Cambiar icono
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.className = isExpanded ? 'fa-solid fa-bars' : 'fa-solid fa-xmark';
            }
            
            // Bloquear scroll cuando el menú está abierto
            if (!isExpanded) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Cerrar menú al hacer clic en un enlace
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.hidden = true;
                document.body.style.overflow = '';
                
                // Restaurar icono
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-bars';
                }
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!mobileMenu.hidden && 
                !mobileMenu.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                menuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.hidden = true;
                document.body.style.overflow = '';
                
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-bars';
                }
            }
        });
        
        // Cerrar menú con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.hidden) {
                menuBtn.setAttribute('aria-expanded', 'false');
                mobileMenu.hidden = true;
                document.body.style.overflow = '';
                
                const icon = menuBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fa-solid fa-bars';
                }
            }
        });
    }

    // ============================================
    // 4. SCROLL SUAVE
    // ============================================
    function initSmoothScroll() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (!href || href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;
                
                e.preventDefault();
                
                // Calcular offset basado en header
                const headerHeight = document.querySelector('.nav-bar').offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
                
                // Scroll suave o instantáneo según preferencias
                if (prefersReducedMotion) {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'auto'
                    });
                } else {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
                
                // Focus en el target para accesibilidad
                target.setAttribute('tabindex', '-1');
                target.focus();
                
                // Cerrar menú móvil si está abierto
                if (mobileMenu && !mobileMenu.hidden) {
                    menuBtn.setAttribute('aria-expanded', 'false');
                    mobileMenu.hidden = true;
                    document.body.style.overflow = '';
                    
                    const icon = menuBtn.querySelector('i');
                    if (icon) {
                        icon.className = 'fa-solid fa-bars';
                    }
                }
            });
        });
    }

    // ============================================
    // 5. BOTÓN "VOLVER ARRIBA"
    // ============================================
    function initBackToTop() {
        if (!backToTopBtn) return;
        
        // Mostrar/ocultar botón según scroll
        function toggleBackToTop() {
            if (window.scrollY > 500) {
                backToTopBtn.style.opacity = '1';
                backToTopBtn.style.visibility = 'visible';
                backToTopBtn.setAttribute('aria-hidden', 'false');
            } else {
                backToTopBtn.style.opacity = '0';
                backToTopBtn.style.visibility = 'hidden';
                backToTopBtn.setAttribute('aria-hidden', 'true');
            }
        }
        
        // Scroll al top
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Focus en el header para accesibilidad
            const header = document.querySelector('header');
            if (header) {
                header.setAttribute('tabindex', '-1');
                header.focus();
            }
        });
        
        // Inicializar
        toggleBackToTop();
        window.addEventListener('scroll', toggleBackToTop);
    }

    // ============================================
    // 6. ANIMACIONES DE REVELACIÓN
    // ============================================
    function initRevealAnimations() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            // Desactivar animaciones si el usuario prefiere movimiento reducido
            document.querySelectorAll('.animate').forEach(el => {
                el.classList.remove('animate');
            });
            return;
        }
        
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px', // Comienza antes de entrar en vista
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseFloat(el.dataset.delay) || 0;
                    
                    // Aplicar retraso si está configurado
                    setTimeout(() => {
                        el.classList.add('in-view');
                    }, delay * 1000);
                    
                    // Dejar de observar después de que se anime
                    observer.unobserve(el);
                }
            });
        }, observerOptions);
        
        // Observar todos los elementos con clase 'animate'
        document.querySelectorAll('.animate').forEach(el => {
            observer.observe(el);
        });
    }

    // ============================================
    // 7. FEEDBACK TÁCTIL (Ripple Effect)
    // ============================================
    function initRippleEffect() {
        document.addEventListener('pointerdown', (e) => {
            // Solo elementos interactivos
            const target = e.target.closest('.team-card, .tech-card-item, .nav-link, .icon-btn, .footer-btn');
            if (!target) return;
            
            const rect = target.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height) * 1.2;
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(79, 70, 229, 0.15);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                z-index: 1;
            `;
            
            // Asegurar que el contenedor tenga posición relativa
            if (window.getComputedStyle(target).position === 'static') {
                target.style.position = 'relative';
                target.style.overflow = 'hidden';
            }
            
            target.appendChild(ripple);
            
            // Remover después de la animación
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Añadir animación CSS para ripple
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ============================================
    // 8. PRELOAD DE IMÁGENES
    // ============================================
    function preloadImages() {
        const images = [
            'img/henry.jpg',
            'img/nidia.jpg',
            'img/daniel.jpg',
            'img/Omar.jpeg',
            'img/Marily.jpeg'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                console.log(`Imagen precargada: ${src}`);
            };
            img.onerror = () => {
                console.warn(`No se pudo cargar la imagen: ${src}`);
            };
        });
    }

    // ============================================
    // 9. UTILIDADES
    // ============================================
    function provideVisualFeedback(element) {
        if (!element) return;
        
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = '';
        }, 150);
    }
    
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (href === currentSection) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    // ============================================
    // 10. INICIALIZACIÓN
    // ============================================
    function init() {
        console.log('🚀 Inicializando plataforma Saber Pro - Grupo 2');
        
        // Inicializar componentes
        initTheme();
        initMobileMenu();
        initSmoothScroll();
        initBackToTop();
        initRevealAnimations();
        initRippleEffect();
        preloadImages();
        
        // Actualizar enlace activo en scroll
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink(); // Llamar una vez al cargar
        
        // Mejorar accesibilidad de tarjetas de equipo
        document.querySelectorAll('.team-card').forEach((card, index) => {
            card.setAttribute('role', 'article');
            card.setAttribute('aria-label', `Miembro del equipo ${index + 1}`);
            
            // Hacer tarjetas enfocables con teclado
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
            
            // Manejar Enter/Space en tarjetas
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
        
        // Manejar cambios en preferencias del usuario
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('site-theme')) {
                currentTheme = e.matches;
                body.classList.toggle('dark', currentTheme);
                updateThemeButton(currentTheme);
            }
        });
        
        // Mejorar performance en scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateActiveNavLink, 100);
        });
        
        // Log de inicio exitoso
        console.log('✅ Aplicación inicializada correctamente');
        console.log('👥 Grupo 2 - Diplomado MA26');
        console.log('🎯 Plataforma Saber Pro');
    }

    // Iniciar la aplicación
    init();
});

// Manejar errores de carga
window.addEventListener('error', (e) => {
    console.error('Error cargando recursos:', e.message);
});

// Mejorar carga de página
window.addEventListener('load', () => {
    // Eliminar clase de carga si existe
    document.body.classList.remove('loading');
    
    // Mejorar métricas de Core Web Vitals
    setTimeout(() => {
        console.log('📊 Página completamente cargada y lista');
    }, 1000);
});