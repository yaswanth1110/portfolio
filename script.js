document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.querySelector('.menu-toggle');
    const themeToggle = document.getElementById('theme-toggle');
    const backToTopButton = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('main section');
    const typedTextSpan = document.getElementById('typed-text');

    const scrollBuffer = 30; // <<<--- ADJUST THIS VALUE (e.g., 20, 30, 40) for spacing

    // === SMOOTH SCROLL & ACTIVE NAV LINK ===
    function smoothScrollTo(targetElement) {
        const headerOffset = header.offsetHeight;
        // Use the defined scrollBuffer
        const effectiveHeaderOffset = headerOffset + scrollBuffer;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - effectiveHeaderOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    smoothScrollTo(targetElement);
                    if (navLinksContainer.classList.contains('active')) {
                        navLinksContainer.classList.remove('active');
                        menuToggle.classList.remove('active');
                        const icon = menuToggle.querySelector('i');
                        if (icon) icon.classList.replace('fa-times', 'fa-bars');
                        document.body.style.overflow = '';
                    }
                }
            }
        });
    });

    function updateActiveNavLink() {
        let currentSectionId = 'hero';
        const headerOffset = header.offsetHeight;
        // Use the defined scrollBuffer for active link detection as well
        const effectiveHeaderOffset = headerOffset + scrollBuffer;


        sections.forEach(section => {
            // Trigger when the top of the section (including its padding) passes the effective header bottom
            const sectionTop = section.offsetTop - effectiveHeaderOffset;
            if (window.pageYOffset >= sectionTop) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
         // Ensure hero is active if at the very top or no other section matches
        if (currentSectionId === 'hero' && window.pageYOffset < sections[0].offsetTop - effectiveHeaderOffset) {
             navLinks.forEach(link => link.classList.remove('active'));
             const homeLink = document.querySelector('.nav-link[href="#hero"]');
             if(homeLink) homeLink.classList.add('active');
        }
    }

    // === HEADER SCROLLED STATE & BACK TO TOP BUTTON ===
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
        updateActiveNavLink();
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // === MOBILE MENU TOGGLE ===
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navLinksContainer.classList.contains('active')) {
                    icon.classList.replace('fa-bars', 'fa-times');
                    document.body.style.overflow = 'hidden';
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                    document.body.style.overflow = '';
                }
            }
        });
    }

    // === THEME TOGGLE (DARK/LIGHT MODE) ===
    const currentTheme = localStorage.getItem('theme') || 'light-mode';
    document.documentElement.className = currentTheme;
    if (themeToggle) {
        themeToggle.querySelector('i').className = currentTheme === 'light-mode' ? 'fas fa-moon' : 'fas fa-sun';
        themeToggle.addEventListener('click', () => {
            let newTheme = document.documentElement.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
            document.documentElement.className = newTheme;
            localStorage.setItem('theme', newTheme);
            themeToggle.querySelector('i').className = newTheme === 'light-mode' ? 'fas fa-moon' : 'fas fa-sun';
        });
    }

    // === FOOTER YEAR ===
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // === CONTACT FORM (FORMSPREE) ===
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status-message';

            try {
                const response = await fetch(this.action, {
                    method: 'POST', body: formData, headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    formStatus.textContent = "Message sent successfully! Thanks.";
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    formStatus.textContent = data.errors ? data.errors.map(err => err.message).join(', ') : "Oops! Form submission failed.";
                    formStatus.classList.add('error');
                }
            } catch (error) {
                console.error("Form Submission Error:", error);
                formStatus.textContent = "Oops! Network error. Please try again.";
                formStatus.classList.add('error');
            }
            setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status-message'; }, 7000);
        });
    }

    // === SCROLL ANIMATIONS (INTERSECTION OBSERVER) ===
    const animatedSections = document.querySelectorAll('main section');
    const sectionObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger when element is 100px from bottom
        threshold: 0.05 // Trigger when 5% of the section is visible
    };

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // observer.unobserve(entry.target); // Uncomment to animate only once
                } else {
                     // entry.target.classList.remove('is-visible'); // Uncomment to re-animate on scroll up
                }
            });
        }, sectionObserverOptions);

        animatedSections.forEach(section => {
            // Hero section has its own animation, no need to observe it for this general reveal
            if (section.id !== 'hero') {
                sectionObserver.observe(section);
            }
        });
    } else {
        animatedSections.forEach(section => {
            if (section.id !== 'hero') {
                section.classList.add('is-visible');
            }
        });
    }

    // === TYPING ANIMATION FOR HERO SUBTITLE ===
    if (typedTextSpan) {
        const roles = ["Software Engineer", "Java Developer", "Spring Enthusiast", "Problem Solver"];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typingSpeed = 100;
        const deletingSpeed = 50;
        const delayBetweenRoles = 1500;

        function type() {
            const currentRole = roles[roleIndex];
            if (isDeleting) {
                typedTextSpan.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typedTextSpan.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                isDeleting = true;
                setTimeout(type, delayBetweenRoles);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(type, typingSpeed / 2);
            } else {
                setTimeout(type, isDeleting ? deletingSpeed : typingSpeed);
            }
        }
        setTimeout(type, 500);
    }

    updateActiveNavLink(); // Initial call
});