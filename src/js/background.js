/**
 * Manages the fetching and display of the background image.
 */
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