let currentStep = 1;
const totalSteps = 3;

function initBuilder() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('username');
    document.getElementById('user-greeting').innerText = `Welcome, ${username}`;

    const selectedTemplate = localStorage.getItem('selectedTemplate') || 'template-modern';
    document.getElementById('resume-preview').className = `resume-paper ${selectedTemplate}`;

    playWelcome();
    setupLivePreview();
}

function playWelcome() {
    const msg = new SpeechSynthesisUtterance();
    msg.text = "Welcome to ASIT resume builder build your resume";
    msg.rate = 0.6; // SLOWER RATE
    msg.pitch = 1;
    window.speechSynthesis.speak(msg);
}

async function uploadPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await fetch('/api/upload-photo', {
            method: 'POST',
            headers: { 'x-auth-token': localStorage.getItem('token') },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('photo-url').value = data.url;
            document.getElementById('p-img').src = data.url;
            updateScore();
        }
    } catch (err) { alert("Upload failed"); }
}

function addProjectField() {
    const container = document.getElementById('projects-container');
    const div = document.createElement('div');
    div.className = 'project-entry';
    div.innerHTML = `
        <input type="text" placeholder="Project Title" class="proj-title">
        <input type="text" placeholder="Project Link" class="proj-link">
        <textarea placeholder="Project Description" class="proj-desc"></textarea>
    `;
    container.appendChild(div);
    
    // Attach listeners to new fields
    div.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', updateProjectsPreview);
    });
}

function updateProjectsPreview() {
    const container = document.getElementById('p-projects-list');
    const entries = document.querySelectorAll('.project-entry');
    container.innerHTML = '';

    entries.forEach(entry => {
        const title = entry.querySelector('.proj-title').value;
        const link = entry.querySelector('.proj-link').value;
        const desc = entry.querySelector('.proj-desc').value;

        if (title || desc) {
            const div = document.createElement('div');
            div.className = 'preview-project-item';
            div.innerHTML = `
                <h5>${title} ${link ? `<a href="${link}" target="_blank" class="proj-url">🔗 Link</a>` : ''}</h5>
                <p>${desc}</p>
            `;
            container.appendChild(div);
        }
    });
    updateScore();
}

function updateScore() {
    let score = 0;
    const fields = [
        'full-name', 'designation', 'email', 'phone', 'address', 'linkedin', 
        'skills', 'education', 'experience', 'objective', 'photo-url'
    ];
    
    fields.forEach(id => {
        if (document.getElementById(id).value.trim()) score += 8;
    });

    const projects = document.querySelectorAll('.project-entry');
    if (projects.length > 0 && projects[0].querySelector('.proj-title').value) score += 12;

    score = Math.min(score, 100);
    document.getElementById('resume-score').innerText = score;
}

function setupLivePreview() {
    const inputs = {
        'full-name': 'p-full-name',
        'designation': 'p-designation',
        'email': 'p-email',
        'phone': 'p-phone',
        'address': 'p-address',
        'linkedin': 'p-linkedin',
        'objective': 'p-objective'
    };

    Object.keys(inputs).forEach(id => {
        const input = document.getElementById(id);
        const target = document.getElementById(inputs[id]);
        input.addEventListener('input', () => {
            target.innerText = input.value || '[Details]';
            updateScore();
        });
    });

    const listInputs = {
        'skills': 'p-skills-list',
        'education': 'p-education-list',
        'experience': 'p-experience-list',
        'certifications': 'p-certifications-list'
    };

    Object.keys(listInputs).forEach(id => {
        const input = document.getElementById(id);
        const target = document.getElementById(listInputs[id]);
        input.addEventListener('input', () => {
            const lines = input.value.split('\n').filter(l => l.trim());
            target.innerHTML = lines.map(line => `<p>• ${line}</p>`).join('');
            updateScore();
        });
    });

    // Project listeners for first project
    document.querySelectorAll('.project-entry input, .project-entry textarea').forEach(el => {
        el.addEventListener('input', updateProjectsPreview);
    });
}

function changeStep(dir) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    currentStep += dir;
    document.getElementById(`step-${currentStep}`).classList.add('active');

    document.getElementById('prev-btn').disabled = currentStep === 1;
    
    if (currentStep === totalSteps) {
        document.getElementById('next-btn').style.display = 'none';
        document.getElementById('download-btn').style.display = 'block';
    } else {
        document.getElementById('next-btn').style.display = 'block';
        document.getElementById('download-btn').style.display = 'none';
    }
}

function downloadPDF() {
    const element = document.getElementById('resume-preview');
    const resumeTitle = document.getElementById('full-name').value;
    
    // Notify Admin
    fetch('/api/notify-download', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ resumeTitle })
    }).catch(err => console.error("Notification failed", err));

    const opt = {
        margin: 0,
        filename: `${resumeTitle || 'my'}-resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', initBuilder);
