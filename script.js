document.addEventListener('DOMContentLoaded', () => {
    // -------------------- Lógica del Menú Hamburguesa --------------------
    const hamburger = document.querySelector('.hamburger');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle para abrir/cerrar el menú en móvil
    hamburger.addEventListener('click', () => {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        mainNav.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', !isExpanded);
    });

    // Función para cerrar el menú móvil
    const closeMobileMenu = () => {
        mainNav.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    };

    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            closeMobileMenu();
        });
    });

    // -------------------- Efecto de Scroll en el Header --------------------
    const header = document.getElementById('main-header');
    const scrollThreshold = 50; // Píxeles a desplazar antes de que se active el efecto

    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // -------------------- Lógica de Navegación Activa (ScrollSpy) --------------------
    const sections = document.querySelectorAll('section[id]');

    function updateActiveClass(currentId) {
        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
            if (navLink.getAttribute('href') === currentId) {
                navLink.classList.add('active');
            }
        });
    }

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Cuando una sección está en el centro de la vista, se resalta su enlace.
            if (entry.isIntersecting) {
                const currentId = `#${entry.target.getAttribute('id')}`;
                updateActiveClass(currentId);
            }
        });
    }, {
        rootMargin: "-50% 0px -50% 0px" // Activa la intersección en el centro vertical de la pantalla
    });

    sections.forEach(section => {
        scrollSpyObserver.observe(section);
    });

    // -------------------- Animación al Scroll (Intersection Observer) --------------------
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Opcional: dejar de observar el elemento una vez que es visible
                // para que la animación no se repita al hacer scroll hacia arriba y abajo.
                observer.unobserve(entry.target);
            }
        });
    }, {
        // Opciones del observador
        rootMargin: '0px',
        threshold: 0.1 // El elemento se considera visible cuando el 10% está en pantalla
    });

    animatedElements.forEach(el => {
        observer.observe(el);
    });

    // -------------------- Animación de carga de imágenes de proyectos --------------------
    const projectCardsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.project-card').forEach(card => {
        projectCardsObserver.observe(card);
    });

    // -------------------- Formulario de contacto con validación en tiempo real --------------------
    const contactForm = document.getElementById('contact-form');
    const formInputs = contactForm.querySelectorAll('.form-input, .form-textarea');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formStatus = document.getElementById('form-status');

    const validationRules = {
        name: {
            validate: (value) => value.trim() !== '',
            message: 'Por favor, introduce tu nombre.'
        },
        email: {
            validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Por favor, introduce un email válido.'
        },
        subject: {
            validate: (value) => value.trim() !== '',
            message: 'Por favor, introduce un asunto.'
        },
        message: {
            validate: (value) => value.trim() !== '',
            message: 'Por favor, escribe tu mensaje.'
        }
    };

    const validateField = (field) => {
        const rule = validationRules[field.name];
        const isValid = rule.validate(field.value);
        const errorContainer = document.getElementById(`${field.id}-error`);

        if (!isValid) {
            field.classList.add('invalid');
            field.setAttribute('aria-invalid', 'true');
            errorContainer.textContent = rule.message;
        } else {
            field.classList.remove('invalid');
            field.setAttribute('aria-invalid', 'false');
            errorContainer.textContent = '';
        }
        return isValid;
    };

    const validateForm = () => {
        let isFormValid = true;
        formInputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });
        submitButton.disabled = !isFormValid;
        return isFormValid;
    };

    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            validateField(input);
            validateForm(); // Re-evalúa todo el formulario para habilitar/deshabilitar el botón
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            if (!validateForm()) {
                // Enfocar el primer campo inválido para guiar al usuario
                contactForm.querySelector('.invalid')?.focus();
                return;
            }
            
            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);
    
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
            formStatus.textContent = 'Enviando su mensaje, por favor espere.';
            
            try {
                // La URL del 'action' del formulario se usa para el envío
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });

                if (response.ok) {
                    // Formspree responde con 'ok: true' si el envío es exitoso
                    formStatus.textContent = '¡Gracias! Tu mensaje ha sido enviado correctamente.';
                    contactForm.reset();
                    formInputs.forEach(input => input.classList.remove('invalid'));
                } else {
                    // Si hay un error, Formspree puede devolver detalles en el JSON
                    const result = await response.json();
                    const errorMessage = result.errors?.map(error => error.message).join(', ') || 'Por favor, inténtelo de nuevo.';
                    console.error('Error al enviar el formulario:', result);
                    formStatus.textContent = `Hubo un error al enviar el formulario: ${errorMessage}`;
                }
            } catch (error) {
                console.error('Error de red:', error);
                formStatus.textContent = 'Hubo un problema al conectar con el servidor. Por favor, inténtelo de nuevo más tarde.';
                // alert('Hubo un problema al conectar con el servidor. Inténtalo de nuevo más tarde.');
            } finally {
                submitButton.disabled = false; // Se re-evaluará con el próximo input
                submitButton.textContent = 'Enviar Mensaje'; // Restaura el texto del botón
                // Limpiar el mensaje de estado después de unos segundos
                setTimeout(() => { formStatus.textContent = ''; }, 7000);
            }
        });
    }

    // -------------------- Lógica del Botón "Volver Arriba" --------------------
    const backToTopButton = document.getElementById('back-to-top-btn');

    window.addEventListener('scroll', () => {
        // Muestra el botón si el scroll es mayor a 400px
        if (window.scrollY > 400) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    // El scroll suave ya está manejado por el listener de 'nav-link'
    // pero nos aseguramos de que el botón también lo active.
    // El href="#inicio" ya hace el trabajo principal.

    // -------------------- Efecto Máquina de Escribir --------------------
    const subtitleElement = document.getElementById('typewriter-subtitle');
    const phrases = ["Desarrollador Web", "Creador de Experiencias Digitales", "Apasionado por la Tecnología"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
        const currentPhrase = phrases[phraseIndex];
        let typeSpeed = 150;

        if (isDeleting) {
            // Borrando
            subtitleElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 75;
        } else {
            // Escribiendo
            subtitleElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        // Cambiar de estado
        if (!isDeleting && charIndex === currentPhrase.length) {
            // Pausa al final de la palabra
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
        }

        setTimeout(typeWriter, typeSpeed);
    }

    typeWriter(); // Iniciar la animación

    // -------------------- Efecto Tilt en Tarjetas de Proyecto --------------------
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            // Coordenadas del mouse relativas a la tarjeta (de 0 a width/height)
            const x = e.clientX - left;
            const y = e.clientY - top;

            const centerX = width / 2;
            const centerY = height / 2;

            // Calcular la rotación basada en la distancia desde el centro
            const deltaX = (x - centerX) / centerX; // Rango de -1 a 1
            const deltaY = (y - centerY) / centerY; // Rango de -1 a 1

            const maxRotate = 12; // Grados máximos de rotación (aumentado para mayor efecto)

            const rotateX = -deltaY * maxRotate;
            const rotateY = deltaX * maxRotate;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });

    // -------------------- Lógica del Filtro y "Cargar Más" de Proyectos --------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const allProjectCards = Array.from(document.querySelectorAll('.projects-grid .project-card'));
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.querySelector('.load-more-container');
    const projectsToShowInitially = 2; // Muestra 2 proyectos al inicio
    let visibleProjectsCount = 0;
    let currentFilter = 'all';

    function updateProjectVisibility() {
        const filteredCards = allProjectCards.filter(card => {
            const categories = card.getAttribute('data-category');
            return currentFilter === 'all' || categories.includes(currentFilter);
        });

        allProjectCards.forEach(card => card.classList.add('hide'));

        const cardsToShow = filteredCards.slice(0, visibleProjectsCount);
        cardsToShow.forEach(card => card.classList.remove('hide'));

        // Mostrar u ocultar el botón "Cargar Más"
        if (visibleProjectsCount >= filteredCards.length) {
            loadMoreContainer.classList.add('hidden');
        } else {
            loadMoreContainer.classList.remove('hidden');
        }
    }

    // Evento para los botones de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            currentFilter = button.getAttribute('data-filter');
            visibleProjectsCount = projectsToShowInitially; // Resetea el contador al filtrar
            updateProjectVisibility();
        });
    });

    // Evento para el botón "Cargar Más"
    loadMoreBtn.addEventListener('click', () => {
        visibleProjectsCount += projectsToShowInitially;
        updateProjectVisibility();
    });

    // Carga inicial de proyectos
    visibleProjectsCount = projectsToShowInitially;
    updateProjectVisibility();

    // -------------------- Lógica del Contador Animado --------------------
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counterElements = entry.target.querySelectorAll('.stat-number');
                counterElements.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000; // 2 segundos
                    let startTimestamp = null;

                    const step = (timestamp) => {
                        if (!startTimestamp) startTimestamp = timestamp;
                        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                        const currentValue = Math.floor(progress * target);
                        counter.textContent = currentValue;

                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        } else {
                            counter.textContent = target; // Asegura que el valor final sea exacto
                        }
                    };

                    window.requestAnimationFrame(step);
                });

                // Dejar de observar una vez que la animación ha comenzado
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5 // Activar cuando el 50% del contenedor sea visible
    });

    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }

    // -------------------- Animación de Barras de Progreso de Habilidades --------------------
    const skillsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillProgressBars = entry.target.querySelectorAll('.skill-progress');
                skillProgressBars.forEach(bar => {
                    const progress = bar.getAttribute('data-progress');
                    bar.style.width = `${progress}%`;
                });
                // Dejar de observar una vez que la animación ha comenzado
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2 // Activar cuando el 20% del contenedor sea visible
    });

    // Observar cada categoría de habilidad
    document.querySelectorAll('.skill-category').forEach(category => skillsObserver.observe(category));
});