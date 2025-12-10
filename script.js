document.addEventListener("DOMContentLoaded", () => {
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const body = document.body;

    // Get particle colors from CSS variables
    function getParticleColors() {
        const styles = getComputedStyle(document.documentElement);
        return [
            styles.getPropertyValue('--particle-color-1').trim(),
            styles.getPropertyValue('--particle-color-2').trim(),
            styles.getPropertyValue('--particle-color-3').trim(),
            styles.getPropertyValue('--particle-color-4').trim()
        ];
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    // Toggle theme
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');

        // Update icon
        if (body.classList.contains('dark-theme')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }

        // Reinitialize particles with new colors
        if (typeof init === 'function') {
            init();
        }
    });

    // Modern Particle Network Animation
    const canvas = document.getElementById('canvas-bg');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particlesArray = [];
        let mouse = {
            x: null,
            y: null,
            radius: 150
        };

        // Set canvas dimensions to full document height
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = document.documentElement.scrollHeight;
        }
        resizeCanvas();

        // Track mouse position
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y + window.scrollY;
        });

        // Handle Resize
        window.addEventListener('resize', () => {
            resizeCanvas();
            init();
        });

        // Recalculate canvas height on scroll (for dynamic content)
        window.addEventListener('scroll', () => {
            if (canvas.height < document.documentElement.scrollHeight) {
                resizeCanvas();
            }
        });

        // Create Modern Particle Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.directionX = (Math.random() * 1) - 0.5;
                this.directionY = (Math.random() * 1) - 0.5;
                this.size = Math.random() * 3 + 1;

                // Get colors from CSS variables
                const colors = getParticleColors();
                const colorVariant = Math.random();
                if (colorVariant < 0.25) {
                    this.color = colors[0];
                } else if (colorVariant < 0.5) {
                    this.color = colors[1];
                } else if (colorVariant < 0.75) {
                    this.color = colors[2];
                } else {
                    this.color = colors[3];
                }

                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
            }

            // Method to draw individual particle with glow
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);

                // Add stronger glow effect for dark theme
                ctx.shadowBlur = 20;
                ctx.shadowColor = this.color;
                ctx.fillStyle = this.color;
                ctx.fill();

                // Reset shadow for performance
                ctx.shadowBlur = 0;
            }

            // Method to update particle position with mouse interaction
            update() {
                // Mouse interaction - particles move away from cursor
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                let directionX = forceDirectionX * force * this.density;
                let directionY = forceDirectionY * force * this.density;

                if (distance < mouse.radius) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to base position
                    if (this.x !== this.baseX) {
                        let dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        let dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }

                // Move particle
                this.baseX += this.directionX;
                this.baseY += this.directionY;

                // Check boundaries and bounce
                if (this.baseX > canvas.width || this.baseX < 0) {
                    this.directionX = -this.directionX;
                }
                if (this.baseY > canvas.height || this.baseY < 0) {
                    this.directionY = -this.directionY;
                }

                // Draw particle
                this.draw();
            }
        }

        // Create particle array
        function init() {
            particlesArray = [];
            let numberOfParticles = (canvas.height * canvas.width) / 12000;
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }

        // Connect particles with gradient lines
        function connect() {
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let dx = particlesArray[a].x - particlesArray[b].x;
                    let dy = particlesArray[a].y - particlesArray[b].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        let opacityValue = 1 - (distance / 120);

                        // Create gradient for connecting lines
                        let gradient = ctx.createLinearGradient(
                            particlesArray[a].x, particlesArray[a].y,
                            particlesArray[b].x, particlesArray[b].y
                        );
                        gradient.addColorStop(0, particlesArray[a].color + Math.floor(opacityValue * 255).toString(16).padStart(2, '0'));
                        gradient.addColorStop(1, particlesArray[b].color + Math.floor(opacityValue * 255).toString(16).padStart(2, '0'));

                        ctx.strokeStyle = gradient;
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            connect();
        }

        init();
        animate();
    }

    // Form Submission & Toast Notification
    const form = document.getElementById("contact-form");
    const toast = document.getElementById("toast");

    if (form) {
        async function handleSubmit(event) {
            event.preventDefault();
            const data = new FormData(event.target);

            fetch(event.target.action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    showToast("Message Sent Successfully!");
                    form.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            showToast(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            showToast("Oops! There was a problem submitting your form");
                        }
                    }).catch(() => {
                        showToast("Oops! There was a problem submitting your form");
                    });
                }
            }).catch(error => {
                showToast("Oops! There was a problem submitting your form");
            });
        }

        form.addEventListener("submit", handleSubmit);
    }

    function showToast(message) {
        if (!toast) return;
        toast.innerText = message;
        toast.className = "show";
        setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
    }
});

// Form Submission & Toast Notification
const form = document.getElementById("contact-form");
const toast = document.getElementById("toast");

async function handleSubmit(event) {
    event.preventDefault();
    const status = document.getElementById("contact-form-status");
    const data = new FormData(event.target);

    fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            showToast("Message Sent Successfully!");
            form.reset();
        } else {
            response.json().then(data => {
                if (Object.hasOwn(data, 'errors')) {
                    showToast(data["errors"].map(error => error["message"]).join(", "));
                } else {
                    showToast("Oops! There was a problem submitting your form");
                }
            })
        }
    }).catch(error => {
        showToast("Oops! There was a problem submitting your form");
    });
}

form.addEventListener("submit", handleSubmit);

function showToast(message) {
    toast.innerText = message;
    toast.className = "show";
    setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
}