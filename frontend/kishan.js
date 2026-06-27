// Initial page setup

// Initialize Particles
   particlesJS('particles-js', {
       particles: {
           number: { value: 80, density: { enable: true, value_area: 800 } },
           color: { value: '#00d9ff' },
           shape: { type: 'circle' },
           opacity: { value: 0.5, random: true },
           size: { value: 3, random: true },
           line_linked: {
               enable: true,
               distance: 150,
               color: '#9d00ff',
               opacity: 0.4,
               width: 1
           },
           move: {
               enable: true,
               speed: 2,
               direction: 'none',
               random: false,
               straight: false,
               out_mode: 'out',
               bounce: false
           }
       },
       interactivity: {
           detect_on: 'canvas',
           events: {
               onhover: { enable: true, mode: 'repulse' },
               onclick: { enable: true, mode: 'push' },
               resize: true
           }
       },
       retina_detect: true
   });

// Custom Cursor ( #const cursor immediately mouse ke saath chalta hai, #cursorfollower slightly delay ke sath follow karta hai smooth trailing effect deta hai.)
   const cursor = document.querySelector('.cursor');
   const cursorFollower = document.querySelector('.cursor-follower');  

   document.addEventListener('mousemove', (e) => {
       cursor.style.left = e.clientX + 'px';
       cursor.style.top = e.clientY + 'px';
       
       setTimeout(() => {
           cursorFollower.style.left = e.clientX + 'px';
           cursorFollower.style.top = e.clientY + 'px';
       }, 100);
   });

// Mobile Navigation open/close hone ke liye hai. ( #Hamburger icon ka style change hota hai (toggle class se ).
   const hamburger = document.querySelector('.hamburger');
   const navLinks = document.querySelector('.nav-links');

   hamburger.addEventListener('click', () => {
       navLinks.classList.toggle('active');
       hamburger.classList.toggle('toggle');
   });

// Close mobile menu when clicking on a link jab user kisi nav item ( Home, About, etc.) par click kare.. Mobile menu close ho jata hai.active aur toggle classes remove ho jaati hain.)
   document.querySelectorAll('.nav-link').forEach(link => {
       link.addEventListener('click', () => {
           navLinks.classList.remove('active');
           hamburger.classList.remove('toggle');
       });
   });

// Smooth Scrolling ( Jaise hi user kisi anchor link (like #about) par click karta hai...Page smooth scroll karta hai us section tak..Default page jump behavior ko prevent karta hai.)
   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
       anchor.addEventListener('click', function (e) {
           e.preventDefault();
           document.querySelector(this.getAttribute('href')).scrollIntoView({
               behavior: 'smooth'
           });
       });
   });

// Show project details in popup on click and close it on outside click or close button
   const projectPopup = document.querySelector('.project-popup');
   const closePopup = document.querySelector('.close-popup');
   const viewDetailsButtons = document.querySelectorAll('.view-details');

   viewDetailsButtons.forEach(button => {
       button.addEventListener('click', function(e) {
           e.preventDefault();
           const card = this.closest('.project-card');
           const title = card.querySelector('.project-title').textContent;
           const desc = card.querySelector('.project-desc').textContent;
           const img = card.querySelector('.project-img').src;
           const techTags = card.querySelectorAll('.tech-tag');
           
           document.querySelector('.project-popup-title').textContent = title;
           document.querySelector('.project-popup-desc').textContent = desc;
           document.querySelector('.project-popup-img').src = img;
           
           const techContainer = document.querySelector('.project-popup-tech');
           techContainer.innerHTML = '';
           techTags.forEach(tag => {
               const techTag = document.createElement('span');
               techTag.className = 'tech-tag';
               techTag.textContent = tag.textContent;
               techContainer.appendChild(techTag);
           });
           
           projectPopup.classList.add('active');
       });
   });

   closePopup.addEventListener('click', function() {
       projectPopup.classList.remove('active');
   });

// Close popup when clicking outside
   projectPopup.addEventListener('click', function(e) {
       if (e.target === projectPopup) {
           projectPopup.classList.remove('active');
       }
   });


// ✅ BACKEND CONTACT FORM INTEGRATION
document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 DOM loaded, setting up backend API email handler...");
    // ✅ Contact Form Handler
    const contactForm = document.getElementById("contact-form");
    const statusDiv = document.getElementById("status");
    if (!contactForm) {
        console.error("❌ Contact form not found!");
        return;
    }
    // ✅ Enhanced Status Display Function
    function showStatus(message, type = 'default', duration = 6000) {
        if (!statusDiv) return;
        statusDiv.innerHTML = message;
        statusDiv.style.display = 'block';
       
        // Remove all previous classes
        statusDiv.classList.remove('status-success', 'status-error');
       
        // Add appropriate class
        if (type === 'success') {
            statusDiv.classList.add('status-success');
        } else if (type === 'error') {
            statusDiv.classList.add('status-error');
        }
       
        // Auto hide after duration
        if (duration > 0) {
            setTimeout(() => {
                statusDiv.style.display = 'none';
                statusDiv.classList.remove('status-success', 'status-error');
            }, duration);
        }
    }
    // ✅ Form Submit Handler
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        console.log("📝 Form submitted!");
        const submitBtn = contactForm.querySelector(".submit-btn");
       
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('from_name');
        const email = formData.get('reply_to');
        const message = formData.get('message');
        const subject = formData.get('subject') || 'Contact Form Message';
        
        // Basic validation
        if (!name || !email || !message) {
            showStatus("❌ Please fill in all required fields.", 'error');
            return;
        }
        
        // Disable submit button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Sending...";
        }
        
        // Show loading status
        showStatus("⏳ Sending your message...", 'default', 0);
        console.log("📤 Sending email via Express API...");
        
        // Determine backend API URL (supports local dev on port 5500/5501 targeting server on port 5000)
        const apiOrigin = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000'
            : 'https://portfolio-3oo4.onrender.com';
        const apiUrl = `${apiOrigin}/api/contact`;

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from_name: name,
                reply_to: email,
                subject: subject,
                message: message
            })
        })
        .then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then(function (data) {
            console.log("✅ API Success:", data);
           
            if (data.emailSent === false) {
                // Inquiry saved locally but email SMTP failed
                showStatus("🎉 Inquiry saved! (Note: Email alert could not be sent. Please double check backend SMTP settings).", 'success', 8000);
            } else {
                showStatus("🎉 Message sent successfully! Thank you for reaching out. I'll get back to you soon.", 'success', 8000);
            }
           
            // Success alert
            setTimeout(() => {
                alert("✅ Your message has been sent successfully!");
            }, 500);
            
            // Reset form
            contactForm.reset();
        })
        .catch(function (error) {
            console.error("❌ API Error:", error);
           
            // Error feedback
            showStatus("😔 Sorry, there was an error sending your message. Kindly check backend connection or email directly.", 'error', 10000);
        })
        .finally(function() {
            // Always re-enable button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = "Send Message";
            }
            console.log("✅ Submission process completed");
        });
    });
    console.log("✅ Email handler setup complete!");
});

// GSAP Animations (ScrollTrigger plugin ko activate karta hai — ye zaroori hai agar tum scroll ke basis pe animations chahte ho.)
   gsap.registerPlugin(ScrollTrigger);

// Hero section Animation (Page load hote hi hero section ke andar ke saare elements (heading, subheading, etc.) niche se fade-in hote hain (animated way me aate hain.)
   gsap.from('.hero-content > *', {
       duration: 1,
       y: 50,
       opacity: 0,
       stagger: 0.2,
       ease: 'power2.out'
   });

 // Section-wise Scroll Animation ( jb  user scroll krkr kisi section tk phochta hai, us section ke andar ke elements animate hoke slide-in hote hain (bottom se...ScrollTrigger ye check karta hai ki kab animation start ya reverse karni hai.
   gsap.utils.toArray('section').forEach(section => {
       gsap.from(section.children, {
           duration: 1,
           y: 50,
           opacity: 0,
           stagger: 0.2,
           ease: 'power2.out',
           scrollTrigger: {
               trigger: section,
               start: 'top 80%',
               end: 'bottom 20%',
               toggleActions: 'play none none reverse'
           }
       });
   });

// Project Cards Animation (  Jab project section dikhna shuru hota hai, tab har project card slide-in hota hai with fade effect...stagger isliye use hua hai taki ek ek karke animate ho.)
   gsap.from('.project-card', {
       duration: 0.8,
       y: 50,
       opacity: 0,
       stagger: 0.2,
       ease: 'power2.out',
       scrollTrigger: {
           trigger: '.projects-grid',
           start: 'top 80%',
           end: 'bottom 20%',
           toggleActions: 'play none none reverse'
       }
   });

// Skill or project serction animation scroll ( A us pure system ko dynamic bana rha hai )
   gsap.from('.skill-category', {
       duration: 0.8,
       y: 50,
       opacity: 0,
       stagger: 0.2,
       ease: 'power2.out',
       scrollTrigger: {
           trigger: '.skills-container',
           start: 'top 80%',
           end: 'bottom 20%',
           toggleActions: 'play none none reverse'
       }
   });

// Navbar Scroll Effect ( A UX ko polish karta hai – taaki wo sticky nav clean lage jab user neeche scroll kare. )
   window.addEventListener('scroll', function() {
       const navbar = document.querySelector('.navbar');
       if (window.scrollY > 50) {
           navbar.style.padding = '1rem 5%';
           navbar.style.background = 'rgba(10, 10, 10, 0.95)';
       } else {
           navbar.style.padding = '1.5rem 5%';
           navbar.style.background = 'rgba(10, 10, 10, 0.8)';
       }
   });