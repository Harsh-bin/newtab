/**
 * Manages the fetching and display of the background image.
 */
// New function for fetching images form github pages.
const BackgroundManager = {
    fetchRandom() {
        const repoUrl = 'https://harsh-bin.github.io/wallpaper-api';
        const bgImage = document.getElementById("randomBackground");

        // Fetch the list of images from img_list JSON file
        fetch(`${repoUrl}/img_list.json`) 
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load resource: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                const images = data.images;
                const randomIndex = Math.floor(Math.random() * images.length);
                const randomImageFile = images[randomIndex];
                const imageUrl = `${repoUrl}/img/${randomImageFile}`;
                bgImage.src = imageUrl;
                bgImage.onload = () => bgImage.classList.add("active");
                
                bgImage.onerror = () => {
                    console.error("Failed to load selected image:", imageUrl);
                    bgImage.src = "https://picsum.photos/1920/1080";
                    bgImage.classList.add("active");
                };
                
            })
            .catch(error => {
                console.error("Failed to fetch image list:", error);
                bgImage.src = "https://picsum.photos/1920/1080";
                bgImage.classList.add("active");
            });
    },
};

/**
 * Old function uses local server for background images
 const BackgroundManager = {
    fetchRandom() {
        const bgImage = document.getElementById("randomBackground");
        const timestamp = new Date().getTime();
        bgImage.src = `http://localhost:4000/random-image?t=${timestamp}`;
        bgImage.onload = () => bgImage.classList.add("active");
        bgImage.onerror = () => {
            console.error("Failed to load background image");
            bgImage.src = "https://picsum.photos/1920/1080";
            bgImage.classList.add("active");
        };
    },
};
*/ //