const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Software Engineer @ TechCorp",
        image: "assets/avatar1.png",
        review: "The AI assistant turned my messy notes into a professional resume in minutes. I landed 3 interviews in my first week of applying. Absolutely a game changer!"
    },
    {
        name: "Mark Thompson",
        role: "Product Manager",
        image: "assets/avatar2.png",
        review: "The ATS optimization is real. I finally stopped getting auto-rejected by the systems. The templates are clean and look incredibly professional."
    },
    {
        name: "Elena Rodriguez",
        role: "Marketing Lead",
        image: "assets/avatar3.png",
        review: "I love how it suggests action verbs and specific impact metrics. It felt like having a career coach sitting right next to me throughout the process."
    }
];

function renderTestimonials() {
    const container = document.getElementById('testimonial-container');
    if (!container) return;

    container.innerHTML = testimonials.map(t => `
        <div class="testimonial-card reveal">
            <div class="testi-header">
                <img src="${t.image}" alt="${t.name}" class="testi-avatar">
                <div class="testi-info">
                    <h4>${t.name}</h4>
                    <p>${t.role}</p>
                </div>
            </div>
            <p class="testi-review">"${t.review}"</p>
        </div>
    `).join('');
}

function initAnimations() {
    const reveals = document.querySelectorAll('.reveal, .fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.id === 'count-resumes' || entry.target.id === 'count-ats') {
                    // Logic handled in separate function or here
                }
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(el => observer.observe(el));
    
    // Live Counter Logic
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetResumes = 10;
                const targetAts = 98;
                animateValue("count-resumes", 0, targetResumes, 2000);
                animateValue("count-ats", 0, targetAts, 2000);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) statsObserver.observe(statsSection);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function initParallax() {
    const visual = document.querySelector('.hero-visual');
    if (!visual) return;

    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 50;
        const y = (window.innerHeight / 2 - e.pageY) / 50;
        visual.style.transform = `translate(${x}px, ${y}px)`;
    });
}

function initScrollTop() {
    const btn = document.getElementById('scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav-links');
    
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderTestimonials();
    initAnimations();
    initMobileMenu();
    initParallax();
    initScrollTop();
});
