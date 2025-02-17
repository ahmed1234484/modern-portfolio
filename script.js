// smoth aniamtion
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});





// Toggle Mobile Menu
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

menuToggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('max-h-0')) {
        mobileMenu.classList.remove('max-h-0');
        mobileMenu.classList.add('max-h-96');
    } else {
        mobileMenu.classList.remove('max-h-96');
        mobileMenu.classList.add('max-h-0');
    }
});

// Close Mobile Menu When a Link is Clicked
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('max-h-96');
        mobileMenu.classList.add('max-h-0');
    });
});

// Close Mobile Menu When Clicking Outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('#mobile-menu') && !event.target.closest('#menu-toggle')) {
        mobileMenu.classList.remove('max-h-96');
        mobileMenu.classList.add('max-h-0');
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll("nav a");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("id");

                    navLinks.forEach((link) => {
                        link.classList.remove("active");
                    });

                    document.querySelector(`nav a[href="#${id}"]`).classList.add("active");
                }
            });
        },
        { threshold: 0.5 }
    );

    sections.forEach((section) => {
        observer.observe(section);
    });
});


// Text Animation Script
const textElement = document.getElementById("dynamic-text");
const texts = [
    "Full Stack Developer & AI Interested",
    "I'm waiting for you to request your project."
];

let currentTextIndex = 0;
let currentCharIndex = 0;
let typingInterval;
let deletingInterval;
let isDeleting = false;

function typeText() {
    if (isDeleting) {
        deleteText();
        return;
    }

    if (currentCharIndex < texts[currentTextIndex].length) {
        textElement.textContent += texts[currentTextIndex].charAt(currentCharIndex);
        currentCharIndex++;
    } else {
        setTimeout(() => {
            isDeleting = true;
        }, 2000);
    }
}

function deleteText() {
    if (currentCharIndex > 0) {
        textElement.textContent = texts[currentTextIndex].substring(0, currentCharIndex - 1);
        currentCharIndex--;
    } else {
        currentTextIndex = (currentTextIndex + 1) % texts.length;
        isDeleting = false;
    }
}

typingInterval = setInterval(typeText, 100);


document.getElementById("contactButton").addEventListener("click", function () {
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  });
  


  document.getElementById("projectsButton").addEventListener("click", function () {
   
    document.getElementById("projectsBtn").click();
    

    document.getElementById("projectsContent").scrollIntoView({ behavior: "smooth" });
  });
  

  document.getElementById("view-projects").addEventListener("click", function () {

    document.getElementById("projectsBtn").click();
    
    
    document.getElementById("projectsContent").scrollIntoView({ behavior: "smooth" });
  });
 

  
  document.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:7000/counts")
      .then((response) => response.json())
      .then((data) => {
        animateCounter("projectsCounter", data.projects);
        animateCounter("certificationsCounter", data.certificates);
      })
      .catch((error) => console.error("Error fetching counts:", error));
  });
  
  function animateCounter(id, target) {
    let counter = document.getElementById(id);
    let startTime = null;
    let duration = 2000;
  
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      let progress = (timestamp - startTime) / duration; 
      let count = Math.floor(progress * target);
  
      if (count <= target) {
        counter.textContent = count;
        requestAnimationFrame(step);
      } else {
        counter.textContent = target; 
      }
    }
  
    requestAnimationFrame(step);
  }
  
  

  
//3D Model Start Code 
const containers = {
  desktop: document.getElementById('3d-container'),
  mobile: document.getElementById('3d-container-mobile')
};


function create3DModel(container) {
  if (!container) return;


  const scene = new THREE.Scene();


  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);


  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);


  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);


  const loader = new THREE.GLTFLoader();
  loader.load(
      'model.glb',
      (gltf) => {
          const model = gltf.scene;
          model.position.set(0, 0, 0);
          model.scale.set(1, 1, 1);
          scene.add(model);
      },
      (xhr) => {
          console.log(`Download the model: ${(xhr.loaded / xhr.total) * 100}%`);
      },
      (error) => {
          console.error('Error loading form:', error);
      }
  );


  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 1, 0);
  controls.minDistance = 5;  
  controls.maxDistance = 7; 
 
  function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
  }
  animate();


  window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
  });
}


create3DModel(containers.desktop);
create3DModel(containers.mobile);







// Show More/Less Projects & Certifications Script

function createButtons(container, items, limit) {
  if (items.length <= limit) return;

  let visibleItems = limit;
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'flex justify-start mt-4 mb-8';

  const seeMoreButton = document.createElement('a');
  seeMoreButton.className = 'text-sm text-purple-400 hover:text-purple-600 hover:underline cursor-pointer transition-all duration-300 px-4 py-2 border border-purple-400 rounded-lg mr-4';
  seeMoreButton.innerHTML = 'See More <i class="fas fa-chevron-down ml-1"></i>';

  const seeLessButton = document.createElement('a');
  seeLessButton.className = 'text-sm text-purple-400 hover:text-purple-600 hover:underline cursor-pointer transition-all duration-300 px-4 py-2 border border-purple-400 rounded-lg';
  seeLessButton.innerHTML = 'See Less <i class="fas fa-chevron-up ml-1"></i>';
  seeLessButton.style.display = 'none';

  buttonsContainer.append(seeMoreButton, seeLessButton);
  container.appendChild(buttonsContainer);

  let isInitialLoad = true; 

  const toggleContent = (showMore) => {
    const previousVisible = visibleItems;
    visibleItems = showMore ? visibleItems + limit : limit;
    
    items.forEach((item, index) => {
      item.style.display = index < visibleItems ? 'block' : 'none';
    });

   
    if (!isInitialLoad) {
      if (showMore) {
        const firstNewItem = items[previousVisible];
        if (firstNewItem) {
          firstNewItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      } else {
        container.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    
    isInitialLoad = false; 

    seeMoreButton.style.display = visibleItems >= items.length ? 'none' : 'block';
    seeLessButton.style.display = visibleItems > limit ? 'block' : 'none';
  };

  seeMoreButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleContent(true);
  });

  seeLessButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleContent(false);
  });

  toggleContent(false); 
}



async function loadProjects() {
  const container = document.getElementById('projectsContent');
  const limit = 3;

  try {
    container.innerHTML = `
      <div class="col-span-3 text-center py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p class="mt-4 text-gray-400">Loading projects...</p>
      </div>
    `;

    const response = await fetch('http://localhost:7000/projects');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Failed to fetch data');

    if (!result.data?.length) {
      container.innerHTML = `
        <div class="col-span-3 text-center py-8">
          <p class="text-gray-400">No Projects Currently Available ! </p>
        </div>
      `;
      return;
    }

    
    container.innerHTML = result.data.map(project => `
      <div class="relative rounded-xl border-2 border-purple-800 shadow-xl overflow-hidden 
                bg-transparent backdrop-blur-md transition-all duration-500 hover:scale-105 
                hover:shadow-[0_0_25px_rgba(126,58,242,0.5)]">
        <img src="/uploads/${project.photo_path}" 
             alt="${project.name}"
             class="w-full h-48 object-cover"
             onerror="this.src='/placeholder.jpg'">
        
        <div class="p-6 text-left">
          <h3 class="text-xl font-bold text-white mb-3">${project.name}</h3>
          <p class="text-gray-400 text-sm mb-4">
            ${project.description.length > 100 ? 
              project.description.substring(0, 100) + "..." : 
              project.description}
          </p>
          
          <div class="flex justify-between items-center">
            <a href="${project.live_demo}" 
               target="_blank"
               class="flex items-center justify-center gap-2 px-5 py-3 bg-purple-600/90 
                     hover:bg-purple-600 text-white rounded-lg transition-all 
                     hover:shadow-lg hover:shadow-purple-500/30">
              <i class="fas fa-external-link-alt text-sm"></i>
              <span class="font-medium">Live Demo</span>
            </a>
            <a href="project-details.html?id=${project.id}"
               class="flex items-center justify-center gap-2 px-5 py-3 border-2 
                     border-purple-600/50 text-purple-300 hover:bg-purple-600/20 
                     rounded-lg transition-all hover:border-purple-400">
              <i class="fas fa-info-circle text-sm"></i>
              <span class="font-medium">Details</span>
            </a>
          </div>
        </div>
      </div>
    `).join('');

    
    const projectItems = container.querySelectorAll('#projectsContent > div');
    createButtons(container, projectItems, limit);

  } catch (error) {
    console.error('ERROR', error);
    container.innerHTML = `
      <div class="col-span-3 text-center py-8">
        <p class="text-red-500 mb-4">⚠️ ${error.message}</p>
        <button onclick="window.location.reload()" 
                class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
          Try Again
        </button>
      </div>
    `;
  }
}


window.onload = function() {
  const certifications = document.querySelectorAll('#certificationsContent > div');
  const limit = 3;
  if (certifications.length > 0) {
    createButtons(
      document.getElementById('certificationsContent'),
      certifications,
      limit
    );
  }
};


document.addEventListener('DOMContentLoaded', loadProjects);






















// Icon Color Change Script
function changeIconColor(field) {
    const iconElement = document.getElementById(`${field}-icon`);
    iconElement.classList.remove("text-gray-400");
    iconElement.classList.add("text-purple-600");
}

function resetIconColor(field) {
    const iconElement = document.getElementById(`${field}-icon`);
    iconElement.classList.remove("text-purple-600");
    iconElement.classList.add("text-gray-400");
}


// Section Toggle Script
function toggleSection(buttonId, sectionToShow) {
    const sections = ['projectsContent', 'certificationsContent', 'techStackContent'];

    sections.forEach(section => {
        document.getElementById(section).classList.add("hidden");
        document.getElementById(section).classList.remove("fade-in");
    });

    document.getElementById(sectionToShow).classList.remove("hidden");
    setTimeout(() => {
        document.getElementById(sectionToShow).classList.add("fade-in");
    }, 10);

    const buttons = ['projectsBtn', 'certificationsBtn', 'techStackBtn'];
    buttons.forEach(button => {
        document.getElementById(button).classList.remove("active");
    });

    document.getElementById(buttonId).classList.add("active");
}

document.getElementById("projectsBtn").addEventListener("click", function() {
    toggleSection("projectsBtn", "projectsContent");
});

document.getElementById("certificationsBtn").addEventListener("click", function() {
    toggleSection("certificationsBtn", "certificationsContent");
});

document.getElementById("techStackBtn").addEventListener("click", function() {
    toggleSection("techStackBtn", "techStackContent");
});

document.addEventListener("DOMContentLoaded", function() {
    toggleSection("certificationsBtn", "certificationsContent");
});





document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__fadeIn');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    elements.forEach(element => {
        observer.observe(element);
    });
});





document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    
    const name = document.getElementById('name-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    const message = document.getElementById('message-input').value.trim();

    
    if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
    }

    
    const sendButton = document.getElementById('send-btn');
    const sendIcon = document.getElementById('send-icon');
    const sendText = document.getElementById('send-text');

    
    sendIcon.classList.remove('fa-paper-plane');
    sendIcon.classList.add('fa-spinner', 'fa-spin');
    sendText.textContent = "Sending...";
    sendButton.disabled = true;

   
    fetch('/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
    })
    .then(response => response.json())
    .then(data => {
        const statusMessage = document.getElementById('status-message');
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');

        statusMessage.classList.remove('hidden');

        if (data.success) {
            successMessage.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            document.getElementById('name-input').value = '';
            document.getElementById('email-input').value = '';
            document.getElementById('message-input').value = '';
            
            setTimeout(() => {
                successMessage.classList.add('hidden');
                window.location.reload(); 
            }, 3000);
        } else {
            errorMessage.classList.remove('hidden');
            successMessage.classList.add('hidden');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('status-message').classList.remove('hidden');
        document.getElementById('error-message').classList.remove('hidden');
    })
    .finally(() => {
       
        sendIcon.classList.remove('fa-spinner', 'fa-spin');
        sendIcon.classList.add('fa-paper-plane');
        sendText.textContent = "Send Message";
        sendButton.disabled = false;
    });
});



  
  const sections = {
    projects: {
      btn: document.getElementById('projectsBtn'),
      content: document.getElementById('projectsContent')
    },
    certifications: {
      btn: document.getElementById('certificationsBtn'),
      content: document.getElementById('certificationsContent')
    },
    techStack: {
      btn: document.getElementById('techStackBtn'),
      content: document.getElementById('techStackContent')
    }
  };

 
  Object.keys(sections).forEach(key => {
    sections[key].btn.addEventListener('click', () => {
      
      Object.values(sections).forEach(section => {
        section.btn.classList.remove('active-btn');
        section.content.classList.add('hidden');
      });
      
      
      sections[key].btn.classList.add('active-btn');
      sections[key].content.classList.remove('hidden');
      
      
      sections[key].content.style.opacity = '0';
      setTimeout(() => {
        sections[key].content.style.opacity = '1';
      }, 50);
    });
  });


























// api get Skills and show in basic screen section portfolio  
fetch('/api/skills')
.then(response => response.json())
.then(skills => {
  const skillsContainer = document.getElementById('techStackContent');
  skillsContainer.innerHTML = skills.map(skill => `
    <div class="flex flex-col items-center justify-center">
      <div class="w-24 h-24 rounded-xl overflow-hidden shadow-lg bg-transparent 
                  hover:scale-110 transition-transform duration-300 ease-out">
        <img src="/uploads/${skill.image}" alt="${skill.text}" 
             class="w-full h-full object-contain transition-all duration-300 
                     hover:rotate-3">
      </div>
      <span class="text-sm font-semibold text-gray-200 mt-3 tracking-wide uppercase 
                    
                   ">
        ${skill.text}
      </span>
    </div>
  `).join('');
})
.catch(err => console.error('Error fetching skills:', err));

// api get certificates and show in basic screen section portfolio  
fetch('/api/certificates')
.then(response => response.json())
.then(certificates => {
  const certificatesContainer = document.getElementById('certificationsContent');

  certificates.forEach(cert => {
    const div = document.createElement('div');
    div.className = "relative p-3 bg-gray-900 text-white rounded-xl group cursor-pointer overflow-hidden shadow-lg transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl";

    
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = "relative w-full h-auto rounded-lg transition-all duration-300 transform group-hover:blur-sm";

    const canvas = document.createElement('canvas');
    canvas.className = "w-full h-auto rounded-lg";

    canvasWrapper.appendChild(canvas);

    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "absolute inset-0 flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300";

   
    const buttonBaseStyle = "flex items-center px-5 py-2 rounded-full font-semibold text-white transition-transform transform shadow-md backdrop-blur-md bg-opacity-20 border border-white/20";

    
    const viewButton = document.createElement('button');
    viewButton.className = `${buttonBaseStyle} bg-blue-500 hover:bg-blue-600 hover:scale-110`;
    viewButton.innerHTML = '<i class="fas fa-eye mr-2"></i> View';

    viewButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const certificateImg = canvas.toDataURL();
      document.getElementById('certificateImage').src = certificateImg;
      document.getElementById('certificateModal').classList.remove('hidden');
    });

    
    const linkButton = document.createElement('a');
    linkButton.href = cert.link;
    linkButton.target = "_blank";
    linkButton.className = `${buttonBaseStyle} bg-purple-500 hover:bg-purple-600 hover:scale-110`;
    linkButton.innerHTML = '<i class="fas fa-external-link-alt mr-2"></i> Open';

    buttonContainer.appendChild(viewButton);
    buttonContainer.appendChild(linkButton);

    div.appendChild(canvasWrapper);
    div.appendChild(buttonContainer);
    certificatesContainer.appendChild(div);

    
    const loadingTask = pdfjsLib.getDocument(`/uploads/${cert.pdf}`);
    loadingTask.promise.then(pdf => {
      pdf.getPage(1).then(page => {
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        const renderContext = { canvasContext: context, viewport: viewport };
        page.render(renderContext);
      });
    });
  });
})
.catch(err => console.error('Error fetching certificates:', err));


document.getElementById('closeModalBtn').addEventListener('click', function() {
document.getElementById('certificateModal').classList.add('hidden');
});










// change photo icon when choose
document.getElementById('profileInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('profilePreview');
      const icon = document.getElementById('cameraIcon');
      preview.style.backgroundImage = `url(${e.target.result})`;
      preview.style.backgroundSize = 'cover';
      preview.style.backgroundPosition = 'center';
      preview.innerHTML = ''; 
    }
    reader.readAsDataURL(file);
  }
});










  // api get comments and load in comments list 
  document.addEventListener('DOMContentLoaded', loadComments);
  
  
  document.getElementById('comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorDiv = document.getElementById('comment-error');
  
    try {
      const fileInput = form.querySelector('input[type="file"]');
      if (fileInput.files[0]?.size > 50 * 1024 * 1024) {
  throw new Error('File size exceeds 50MB!');
}
  
      const formData = new FormData(form);
      const response = await fetch('/api/comments', {
        method: 'POST',
        body: formData
      });
  
      if (!response.ok) throw new Error(await response.text());
      
      const newComment = await response.json();
      addComment(newComment);
      form.reset();
      updateCounter();
      errorDiv.classList.add('hidden');
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.classList.remove('hidden');
      setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    }
  });
  
 
  function addComment(comment) {
    const commentsList = document.getElementById('comments-list');
    const commentElement = createCommentElement(comment);
    
    commentsList.insertAdjacentHTML('afterbegin', commentElement);
    animateComment(commentsList.firstElementChild);
  }
  
 
  function createCommentElement(comment) {
    return `
      <div class="comment-container opacity-0 translate-x-[-20px] transition-all duration-500">
        <div class="flex items-start gap-4">
          <img src="/uploads/${comment.profile_picture}" 
               class="w-12 h-12 rounded-full object-cover shadow-lg
                      border-2 border-purple-500 hover:scale-105 transition-all">
          
          <div class="comment-box relative bg-gradient-to-r from-gray-800 to-gray-900 
                      p-4 rounded-xl shadow-lg shadow-gray-900 max-w-md flex-1">
            <div class="absolute -left-2 top-3 w-4 h-4 bg-gray-800 rotate-45"></div>
            
            <div class="flex flex-wrap items-baseline gap-2 mb-2">
              <h3 class="font-bold text-purple-400">${comment.name}</h3>
              <span class="text-gray-500 text-xs">${new Date(comment.created_at).toLocaleString()}</span>
            </div>
            
            <p class="text-gray-300 text-sm leading-relaxed">${comment.message}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  
  function animateComment(element) {
    requestAnimationFrame(() => {
      element.classList.remove('opacity-0', 'translate-x-[-20px]');
    });
  }
  
  
  async function loadComments() {
    try {
      const response = await fetch('/api/comments');
      if (!response.ok) throw new Error('Failed to load comments');
      
      const comments = await response.json();
      displayAllComments(comments);
      updateCounter();
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  }
  
 
  function displayAllComments(comments) {
    const commentsList = document.getElementById('comments-list');
    commentsList.innerHTML = '';
    
    comments.reverse().forEach(comment => {
      const commentElement = createCommentElement(comment);
      commentsList.insertAdjacentHTML('beforeend', commentElement);
    });
    
   
    setTimeout(() => {
      Array.from(commentsList.children).forEach((child, index) => {
        setTimeout(() => animateComment(child), index * 50);
      });
    }, 100);
  }
  
  
  function updateCounter() {
    const count = document.getElementById('comments-list').children.length;
    document.getElementById('comment-count').textContent = count;
  }
  

  document.querySelector('#gender').addEventListener('change', function() {
    this.setCustomValidity(this.value ? '' : 'Please select a gender');
  });
  
  








  particlesJS("particles-js", {
    particles: {
      number: {
        value: 200, 
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: "#9F7AEA",
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000",
        },
        polygon: {
          nb_sides: 5,
        },
      },
      opacity: {
        value: 0.6, 
        random: true,
      },
      size: {
        value: 4, 
        random: true,
      },
      line_linked: {
        enable: true, 
        distance: 150,
        color: "#9F7AEA",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 5,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: {
          enable: true,
          mode: "repulse", 
        },
        onclick: {
          enable: true,
          mode: "push", 
        },
      },
      modes: {
        repulse: {
          distance: 100, 
        },
        push: {
          particles_nb: 4,
        },
      },
    },
    retina_detect: true,
  });


  AOS.init({
    duration: 1200,  
    easing: "ease-out", 
    once: false,  
    delay: 200,  
    mirror: true,  
  });
  





