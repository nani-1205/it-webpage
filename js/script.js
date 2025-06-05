// Function to initialize all the scripts that depend on the DOM being ready
function initializePageScripts() {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const isHomePage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html') || window.location.pathname.endsWith('/'); // Adjust if your homepage path is different

        // Function to handle navbar scroll state
        const handleNavbarScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                // Only remove 'scrolled' class if on homepage and at the top
                if (isHomePage) {
                    navbar.classList.remove('scrolled');
                }
            }
        };

        // Apply 'scrolled' class immediately on subpages
        if (!isHomePage) {
            navbar.classList.add('scrolled');
        } else {
            // For homepage, check initial scroll position
            handleNavbarScroll(); // Call once to set initial state on homepage
        }

        window.addEventListener('scroll', handleNavbarScroll);
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
    setTimeout(handleScrollAnimation, 200);

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
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.length > 1 && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
                if (navMenu && navMenu.classList.contains('active')) {
                    if (hamburger) hamburger.classList.remove('active');
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
                while (tempDiv.firstChild) {
                    el.parentNode.insertBefore(tempDiv.firstChild, el);
                }
                el.parentNode.removeChild(el);
            })
            .catch(error => {
                console.error('Error loading module:', error);
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
        initializePageScripts();
    } catch (error) {
        console.error("Error loading one or more modules:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadModules);