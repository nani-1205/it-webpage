// Function to initialize all the scripts that depend on the DOM being ready
function initializePageScripts() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        // Trigger scroll once in case page loads scrolled
        if (window.scrollY > 50) navbar.classList.add('scrolled');
    }

    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Query nav links after they are loaded
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    }

    // Animate on scroll
    // Re-query scrollElements as they are dynamically loaded
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    const elementInView = (el, threshold = 0.8) => {
        if (!el) return false;
        const elementTop = el.getBoundingClientRect().top;
        const elementBottom = el.getBoundingClientRect().bottom;
        return (
            elementTop <= (window.innerHeight || document.documentElement.clientHeight) * threshold &&
            elementBottom >= 0
        );
    };
    const displayScrollElement = (element) => {
        if (element) element.classList.add('animated');
    };
    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (el && !el.classList.contains('animated')) {
                if (elementInView(el, 0.85)) {
                    displayScrollElement(el);
                }
            }
        });
    };
    window.addEventListener('scroll', handleScrollAnimation);
    setTimeout(handleScrollAnimation, 200); // Increased delay slightly for content to settle

    // Scroll progress bar
    const scrollProgress = document.querySelector('.scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = (document.documentElement.scrollHeight || document.body.scrollHeight) - (document.documentElement.clientHeight || document.body.clientHeight);
            const progress = (scrollTop / scrollHeight) * 100;
            scrollProgress.style.width = progress + '%';
        });
    }

    // Current Year for Footer
    // Re-query yearSpan as it's dynamically loaded
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Smooth scroll for anchor links
    // Re-query anchors as they are dynamically loaded
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) { // Ensure navMenu is defined
                    if (hamburger) hamburger.classList.remove('active'); // Ensure hamburger is defined
                    navMenu.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            }
        });
    });
}

// Function to load HTML modules
async function loadModules() {
    const includeElements = document.querySelectorAll('[data-include]');
    const fetchPromises = [];

    includeElements.forEach(el => {
        const filePath = el.getAttribute('data-include');
        const fetchPromise = fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Could not load ${filePath}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                // Insert all children of tempDiv before the placeholder, then remove placeholder
                while (tempDiv.firstChild) {
                    el.parentNode.insertBefore(tempDiv.firstChild, el);
                }
                el.parentNode.removeChild(el);
            })
            .catch(error => {
                console.error('Error loading module:', error);
                // Create a paragraph to show the error message in place of the module
                const errorP = document.createElement('p');
                errorP.style.color = 'red';
                errorP.textContent = `Error loading ${filePath}. Check console.`;
                el.parentNode.insertBefore(errorP, el);
                el.parentNode.removeChild(el);
            });
        fetchPromises.push(fetchPromise);
    });

    try {
        await Promise.all(fetchPromises);
        // All modules are loaded, now initialize scripts
        initializePageScripts();
    } catch (error) {
        console.error("Error loading one or more modules:", error);
    }
}

// Start loading modules when the DOM is initially ready
document.addEventListener('DOMContentLoaded', loadModules);