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
        const effectiveHeaderOffset = headerOffset + scrollBuffer;


        sections.forEach(section => {
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
        if (currentSectionId === 'hero' && window.pageYOffset < (sections[0].offsetTop - effectiveHeaderOffset)) {
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

    if (backToTopButton) { // Check if button exists
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // === MOBILE MENU TOGGLE ===
    if (menuToggle && navLinksContainer) { // Check if elements exist
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
    if (themeToggle) { // Check if button exists
        const themeIcon = themeToggle.querySelector('i');
        if (themeIcon) themeIcon.className = currentTheme === 'light-mode' ? 'fas fa-moon' : 'fas fa-sun';
        
        themeToggle.addEventListener('click', () => {
            let newTheme = document.documentElement.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
            document.documentElement.className = newTheme;
            localStorage.setItem('theme', newTheme);
            if (themeIcon) themeIcon.className = newTheme === 'light-mode' ? 'fas fa-moon' : 'fas fa-sun';
        });
    }

    // === FOOTER YEAR ===
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // === CONTACT FORM (NETLIFY AJAX SUBMISSION) ===
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const formName = this.getAttribute('name'); // Get form name (e.g., "contact")

            // For Netlify AJAX submission, we need to URL-encode the data
            // and include the "form-name" field.
            const encodedData = new URLSearchParams();
            formData.forEach((value, key) => {
                encodedData.append(key, value);
            });
            // Ensure the hidden "form-name" input from your HTML is part of formData,
            // or add it explicitly if it's not being picked up by new FormData(this)
            // For Netlify, the 'form-name' attribute from the <form> tag itself isn't automatically part of FormData
            // So, we ensure the hidden input <input type="hidden" name="form-name" value="contact"> is processed.
            // If it is, new FormData(this) will include it. If not, you might need to add:
            // encodedData.append('form-name', formName); // Re-check if new FormData(this) includes hidden fields. It should.

            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status-message'; // Reset classes

            try {
                const response = await fetch("/", { // Post to the current page (root) for Netlify
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: encodedData.toString() // Send URL-encoded data
                });

                if (response.ok) {
                    formStatus.textContent = "Message sent successfully! Thanks.";
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else {
                    // Netlify usually returns a 200 OK even for some errors with AJAX if not properly caught server-side,
                    // but actual server errors or network issues would make response.ok false.
                    const responseText = await response.text(); // Get raw response for debugging
                    console.error("Netlify form submission error response:", responseText, response.status);
                    formStatus.textContent = "Oops! Form submission failed. Please try again.";
                    formStatus.classList.add('error');
                }
            } catch (error) {
                console.error('Network or other error during form submission:', error);
                formStatus.textContent = "Oops! Network error. Please try again.";
                formStatus.classList.add('error');
            }

            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.className = 'form-status-message';
            }, 7000);
        });
    }

    // === SCROLL ANIMATIONS (INTERSECTION OBSERVER) ===
    const animatedSections = document.querySelectorAll('main section');
    const sectionObserverOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.05
    };

    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, sectionObserverOptions);

        animatedSections.forEach(section => {
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
    if (typedTextSpan) { // Check if element exists
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

    // Initial call to set active nav link and check section visibility
    // Needs to be called after a slight delay to ensure layout is complete for offsets
    setTimeout(() => {
        updateActiveNavLink();
        // Manually trigger scroll event once to check initial visible sections for animations
        // This helps if sections are already in view on page load
        if ('IntersectionObserver' in window && animatedSections.length > 0) {
            const initialCheckObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Unobserve after initial check
                    }
                });
            }, sectionObserverOptions);
            animatedSections.forEach(section => {
                 if (section.id !== 'hero') {
                    initialCheckObserver.observe(section);
                 }
            });
        }
    }, 100);
});