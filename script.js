const menuIcon = document.querySelector('#menu-icon');
const navLinks = document.querySelector('.nav-links'); // Correctly targets the container

menuIcon.onclick = () => {
    navLinks.classList.toggle('open'); // Toggles the 'open' class
};