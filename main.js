// Navbar and Scroll Indicator Effect
const navbar = document.querySelector('.navbar');
const scrollIndicator = document.querySelector('.scroll-indicator');

window.addEventListener('scroll', () => {
    // Navbar background
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Fade out scroll indicator based on scroll depth
    if (scrollIndicator) {
        // Opacity goes from 1 to 0 over the first 200px of scrolling
        const opacity = Math.max(0, 1 - (window.scrollY / 200));
        scrollIndicator.style.opacity = opacity;
        // Optionally disable pointer events when fully invisible so it can't be clicked
        scrollIndicator.style.pointerEvents = opacity === 0 ? 'none' : 'auto';
    }
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navRight = document.querySelector('.nav-right');
const navLinks = document.querySelectorAll('.nav-links a, .nav-right .btn-outline');

if (mobileMenuBtn && navRight) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navRight.classList.toggle('active');
        
        // Prevent scrolling when menu is open
        if (navRight.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navRight.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

// Custom Cursor Glow
const cursorGlow = document.getElementById('cursor-glow');

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.opacity = '1';
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

document.addEventListener('mouseleave', () => {
    cursorGlow.style.opacity = '0';
});

// Reveal Animations on Scroll (Simple Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
            
            // Check if it contains stats to animate
            if(entry.target.classList.contains('lab-content')) {
                animateStats();
            }
        }
    });
}, observerOptions);

// Apply initial styles and observe
document.querySelectorAll('.card, .portfolio-item, .section-header, .lab-content').forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Stats Number Animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-value');
    
    stats.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const stepTime = 20; // 20ms per frame
        const steps = duration / stepTime;
        const increment = target / steps;
        
        let current = 0;
        
        const tick = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(tick);
            }
            
            // Format format precision (0, 1 or 2 decimals depending on target)
            if(target % 1 !== 0) {
                if(target < 1) {
                    stat.textContent = current.toFixed(2);
                } else {
                    stat.textContent = current.toFixed(1);
                }
            } else {
                stat.textContent = Math.floor(current);
            }
            
        }, stepTime);
    });
}

// Carousel Navigation
const projectCarousel = document.getElementById('project-carousel');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
let scrollTimeout;
let autoPlayInterval;

if (projectCarousel && prevBtn && nextBtn) {
    const originalCards = Array.from(projectCarousel.querySelectorAll('.carousel-card'));
    const totalOriginals = originalCards.length;

    // Clone first and last for infinite wrap
    const firstClone = originalCards[0].cloneNode(true);
    const lastClone = originalCards[totalOriginals - 1].cloneNode(true);

    firstClone.classList.add('clone');
    lastClone.classList.add('clone');
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');

    projectCarousel.appendChild(firstClone);
    projectCarousel.insertBefore(lastClone, originalCards[0]);

    function startAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(() => {
            const itemWidth = projectCarousel.querySelector('.carousel-card').offsetWidth + 30;
            projectCarousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }, 10000); // 10 seconds
    }

    // Initial position to skip the prepended clone
    setTimeout(() => {
        const itemWidth = projectCarousel.querySelector('.carousel-card').offsetWidth + 30; // 30 is CSS gap
        // Jump without animation
        projectCarousel.style.scrollBehavior = 'auto'; 
        projectCarousel.scrollLeft = itemWidth;
        // Start autoplay after initial setup
        startAutoPlay();
    }, 100);

    const dots = document.querySelectorAll('.carousel-indicators .dot');

    prevBtn.addEventListener('click', () => {
        startAutoPlay(); // Reset timer on user interaction
        const itemWidth = projectCarousel.querySelector('.carousel-card').offsetWidth + 30;
        projectCarousel.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        startAutoPlay(); // Reset timer on user interaction
        const itemWidth = projectCarousel.querySelector('.carousel-card').offsetWidth + 30;
        projectCarousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
    });

    projectCarousel.addEventListener('scroll', () => {
        startAutoPlay(); // Reset timer on scroll
        const itemWidth = projectCarousel.querySelector('.carousel-card').offsetWidth + 30;
        if (itemWidth === 0) return;
        
        const scrollIndex = Math.round(projectCarousel.scrollLeft / itemWidth);
        
        // Update dots mapping (real slides: 1 to totalOriginals)
        let logicalIndex = scrollIndex - 1;
        if (logicalIndex < 0) logicalIndex = totalOriginals - 1;
        if (logicalIndex >= totalOriginals) logicalIndex = 0;
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === logicalIndex);
        });

        // Set up seamless jump after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const currentIndex = Math.round(projectCarousel.scrollLeft / itemWidth);
            if (currentIndex === 0) {
                // Instantly to actual last card
                projectCarousel.style.scrollBehavior = 'auto'; 
                projectCarousel.scrollLeft = itemWidth * totalOriginals;
            } else if (currentIndex === totalOriginals + 1) {
                // Instantly to actual first card
                projectCarousel.style.scrollBehavior = 'auto'; 
                projectCarousel.scrollLeft = itemWidth;
            }
        }, 150); // timeout sufficient for smooth scroll to finish
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            startAutoPlay(); // Reset timer on user interaction
            const itemWidth = projectCarousel.querySelector('.carousel-card').offsetWidth + 30;
            // Map dot index + 1
            projectCarousel.scrollTo({ left: (i + 1) * itemWidth, behavior: 'smooth' });
        });
    });

    // Pause autoplay on mouse hover, resume on leave
    projectCarousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    projectCarousel.addEventListener('mouseleave', startAutoPlay);
}

// Pre-select form checkboxes based on URL parameters
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sujet = urlParams.get('sujet');
    if (sujet) {
        // Handle potential exact matches with the value attribute
        const checkbox = document.querySelector(`input[name="sujet"][value="${sujet}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    }
});
