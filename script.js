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

var coll = document.getElementsByClassName("collapsible");
var i;

