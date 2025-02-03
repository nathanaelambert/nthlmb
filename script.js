document.addEventListener("DOMContentLoaded", () => {
  const portfolioItems = document.querySelectorAll(".portfolio-item");

  portfolioItems.forEach(item => {
      item.addEventListener("click", () => {
          // Find the image within this portfolio item
          const img = item.querySelector('img');

          if (img) {
              
              // Create the overlay
              const overlay = document.createElement("div");
              overlay.classList.add("overlay");

              // Create the full-size image
              const fullImage = document.createElement("img");
              fullImage.src = img.src;
              fullImage.alt = img.alt;

              // Append the image to the overlay
              overlay.appendChild(fullImage);

              // Append the overlay to the body
              document.body.appendChild(overlay);

              // Close overlay on click
              overlay.addEventListener("click", () => {
                  document.body.removeChild(overlay);
              });
          }
      });
  });
});

document.addEventListener('DOMContentLoaded', (event) => {
  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Active link indication
  const navLinks = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('section');

  function setActiveLink() {
    let index = sections.length;

    while(--index && window.scrollY + 50 < sections[index].offsetTop) {}
    
    navLinks.forEach((link) => link.classList.remove('active'));
    navLinks[index].classList.add('active');
  }

  setActiveLink();
  window.addEventListener('scroll', setActiveLink);
});

document.querySelectorAll('.skill-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    const skillId = tag.getAttribute('data-skill');
    const skillElement = document.getElementById(skillId);
    if (skillElement) {
      skillElement.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

