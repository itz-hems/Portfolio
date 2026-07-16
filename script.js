// Typed role text (guarded: if the CDN is slow/blocked, fall back to
// static text instead of breaking every other script on the page)
if (typeof Typed !== 'undefined') {
  new Typed('#role', {
    strings: ['Full Stack Developer', 'Python Developer', 'Software Developer'],
    typeSpeed: 65,
    backSpeed: 40,
    backDelay: 1400,
    fadeOut: false,
    loop: true
  });
} else {
  document.getElementById('role').textContent = 'Full Stack Developer';
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinksList = document.querySelector('.nav-links');
navToggle.addEventListener('click', () => {
  navLinksList.classList.toggle('open');
  navLinksList.style.display = navLinksList.classList.contains('open') ? 'flex' : '';
});
document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
  navLinksList.classList.remove('open');
  navLinksList.style.display = '';
}));

// Contact form -> opens the visitor's email client with a prefilled message
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('cname').value;
  const email = document.getElementById('cemail').value;
  const msg = document.getElementById('cmsg').value;
  const body = encodeURIComponent(`${msg}\n\n— ${name} (${email})`);
  window.location.href = `mailto:hemanath714@gmail.com?subject=Portfolio contact from ${encodeURIComponent(name)}&body=${body}`;
});

/* =========================================================
   EDIT MODE — lets the site owner preview a new profile
   photo, resume, or certificate right in the browser.
   Everything is stored in localStorage on THIS browser only;
   there is no backend, so visitors elsewhere still see the
   default files that ship in /assets until those files are
   replaced and the site is redeployed.
========================================================= */
const STORAGE_KEY = 'portfolioOverrides';

const editFab = document.getElementById('editOpenBtn');
const editPanel = document.getElementById('editPanel');
const editOverlay = document.getElementById('editOverlay');
const editCloseBtn = document.getElementById('editCloseBtn');
const editStatus = document.getElementById('editStatus');

function openEdit(){ editPanel.classList.add('open'); editOverlay.classList.add('show'); }
function closeEdit(){ editPanel.classList.remove('open'); editOverlay.classList.remove('show'); }
editFab.addEventListener('click', openEdit);
editCloseBtn.addEventListener('click', closeEdit);
editOverlay.addEventListener('click', closeEdit);

function fileToDataURL(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadOverrides(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Could not read saved edits', err);
    return {};
  }
}

function applyOverrides(){
  const data = loadOverrides();

  if (data.photo){
    document.getElementById('profilePhoto').src = data.photo;
    document.getElementById('photoPreview').src = data.photo;
  }

  if (data.resume){
    document.getElementById('navResumeBtn').href = data.resume.dataUrl;
    document.getElementById('heroResumeBtn').href = data.resume.dataUrl;
    document.getElementById('navResumeBtn').setAttribute('download', data.resume.name || 'resume.pdf');
    document.getElementById('heroResumeBtn').setAttribute('download', data.resume.name || 'resume.pdf');
    document.getElementById('resumeFilename').textContent = `Current: ${data.resume.name || 'resume.pdf'} (saved in this browser)`;
  }

  if (data.certificates && data.certificates.length){
    const grid = document.getElementById('certGrid');
    data.certificates.forEach(cert => {
      const card = document.createElement('div');
      card.className = 'cert-card glass';
      card.dataset.savedCert = 'true';
      const isImage = (cert.dataUrl || '').startsWith('data:image');
      card.innerHTML = `
        ${isImage ? `<img class="cert-thumb" src="${cert.dataUrl}" alt="${cert.title}">` : ''}
        <div class="cert-body">
          <h4>${cert.title}</h4>
          <p class="fact-value">${cert.issuer}</p>
          <p class="cert-meta">Saved in this browser</p>
          <a class="btn btn-ghost btn-sm" href="${cert.dataUrl}" target="_blank" rel="noopener">View certificate</a>
        </div>`;
      grid.appendChild(card);
    });
  }
}

document.getElementById('uploadPhoto').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const dataUrl = await fileToDataURL(file);
  document.getElementById('photoPreview').src = dataUrl;
  editFab.dataset.pendingPhoto = dataUrl;
});

document.getElementById('uploadResume').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  editFab.dataset.pendingResumeName = file.name;
});

let pendingCert = null;
document.getElementById('addCertBtn').addEventListener('click', async () => {
  const title = document.getElementById('certTitle').value.trim();
  const issuer = document.getElementById('certIssuer').value.trim();
  const file = document.getElementById('uploadCert').files[0];
  if (!title || !file){
    editStatus.textContent = 'Add a title and choose a file first.';
    return;
  }
  const dataUrl = await fileToDataURL(file);
  const data = loadOverrides();
  data.certificates = data.certificates || [];
  data.certificates.push({ title, issuer: issuer || 'Certificate', dataUrl });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  editStatus.textContent = `Added "${title}". Reloading preview…`;
  setTimeout(() => location.reload(), 700);
});

document.getElementById('saveEditBtn').addEventListener('click', async () => {
  const data = loadOverrides();
  const photoInput = document.getElementById('uploadPhoto');
  const resumeInput = document.getElementById('uploadResume');

  if (photoInput.files[0]){
    data.photo = await fileToDataURL(photoInput.files[0]);
  }
  if (resumeInput.files[0]){
    data.resume = { name: resumeInput.files[0].name, dataUrl: await fileToDataURL(resumeInput.files[0]) };
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  editStatus.textContent = 'Saved to this browser. Reloading preview…';
  setTimeout(() => location.reload(), 700);
});

document.getElementById('resetEditBtn').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  editStatus.textContent = 'Reset. Reloading…';
  setTimeout(() => location.reload(), 500);
});

applyOverrides();
