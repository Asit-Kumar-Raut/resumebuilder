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

function initSky() {
    const sky = document.getElementById('sky');
    if (!sky) return;

    // Stars
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${Math.random() * 3 + 2}s`);
        sky.appendChild(star);
    }

    // Birds
    const colors = ['#FF4D4D', '#2ECC71', '#3B82F6', '#FACC15', '#A855F7'];
    function createBird() {
        const container = document.createElement('div');
        container.className = 'bird-container';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const startY = Math.random() * 60 + 10;
        const endY = Math.random() * 60 + 10;
        const duration = Math.random() * 10 + 10;
        
        container.style.setProperty('--bird-color', color);
        container.style.setProperty('--start-y', `${startY}%`);
        container.style.setProperty('--end-y', `${endY}%`);
        container.style.setProperty('--duration', `${duration}s`);
        container.style.setProperty('--delay', '0s');

        container.innerHTML = `
            <svg class="bird" viewBox="0 0 24 24">
                <path d="M21 5l-8.5 7.5L4 5l8.5 7.5L21 5z" />
                <path d="M21 12l-8.5 7.5L4 12l8.5 7.5L21 12z" />
            </svg>
        `;

        sky.appendChild(container);
        setTimeout(() => container.remove(), duration * 1000);
    }

    setInterval(createBird, 3000);
    for(let i=0; i<5; i++) setTimeout(createBird, i * 2000);
}

// Modal Logic
function openModal(id) {
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function switchModal(oldId, newId) {
    closeModal(oldId);
    openModal(newId);
}

let signupOTP = "";

async function sendSignupOTP() {
    const fname = document.getElementById('signup-fname').value.trim();
    const lname = document.getElementById('signup-lname').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if(!fname || !lname || !email || !username || !password) {
        return alert("Please fill in all fields before sending the verification code.");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return alert("Please enter a valid email address.");
    }
    
    const btn = document.querySelector('#signup-fields button');
    const oldText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/otp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if(res.ok) {
            signupOTP = data.otp;
            document.getElementById('signup-fields').style.display = 'none';
            document.getElementById('otp-field').style.display = 'block';
            document.getElementById('signup-title').innerText = 'Verify Email';
            alert("OTP sent to your email!");
        } else {
            alert(data.msg || "Failed to send OTP");
        }
    } catch(err) { 
        alert("Error sending OTP"); 
    } finally {
        btn.innerText = oldText;
        btn.disabled = false;
    }
}

async function sendForgotOTP() {
    const email = document.getElementById('forgot-email').value;
    try {
        const res = await fetch('/api/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if(res.ok) {
            document.getElementById('forgot-step-1').style.display = 'none';
            document.getElementById('forgot-step-2').style.display = 'block';
            alert("OTP sent to your email!");
        } else {
            const data = await res.json();
            alert(data.msg);
        }
    } catch(err) { alert("Error"); }
}

function openForgotModal() {
    closeModal('login-modal');
    openModal('forgot-modal');
}

// Update handleAuth to handle the new fields and OTP verification
async function handleAuthLogic() {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const enteredOTP = document.getElementById('signup-otp').value;
            if(enteredOTP !== signupOTP) return alert("Invalid OTP");

            const userData = {
                firstName: document.getElementById('signup-fname').value.trim(),
                lastName: document.getElementById('signup-lname').value.trim(),
                email: document.getElementById('signup-email').value.trim(),
                username: document.getElementById('signup-username').value.trim(),
                password: document.getElementById('signup-password').value
            };

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                
                let data;
                try { data = await res.json(); } catch(e) { throw new Error("Server error"); }

                if(res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.username);
                    alert("Registration successful!");
                    window.location.href = 'builder.html';
                } else alert(data.msg || "Registration failed");
            } catch (err) {
                alert("An error occurred during registration. Please try again.");
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                let data;
                try { data = await res.json(); } catch(e) { throw new Error("Server error"); }

                if(res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.user.username);
                    window.location.href = 'builder.html';
                } else alert(data.msg || "Login failed");
            } catch (err) {
                alert("An error occurred during login. Please try again.");
            }
        });
    }

    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const otp = document.getElementById('forgot-otp').value;
            const newPassword = document.getElementById('forgot-new-pass').value;

            try {
                const res = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, otp, newPassword })
                });
                let data;
                try { data = await res.json(); } catch(e) { throw new Error("Server error"); }
                
                if(res.ok) {
                    alert("Password updated! Please login.");
                    closeModal('forgot-modal');
                    openModal('login-modal');
                } else {
                    alert(data.msg || "Failed to reset password");
                }
            } catch (err) {
                alert("An error occurred resetting password.");
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderTestimonials();
    initAnimations();
    initMobileMenu();
    initParallax();
    initScrollTop();
    initSky();
    
    handleAuthLogic();

    // Check if logged in
    const token = localStorage.getItem('token');
    if (token) {
        const navCta = document.querySelector('.nav-cta');
        if (navCta) {
            navCta.innerHTML = `<a href="builder.html" class="btn btn-primary">Go to Builder</a>`;
        }
    }
});
