class CloudSystem {
    constructor() {
        this.clouds = [];
        this.container = null;
        this.isRunning = false;
        
        // Cloud configurations with different sizes, speeds, and positions
        this.cloudConfigs = [
            { size: 1.0, speed: 0.3, y: 15, opacity: 0.8, delay: 0 },
            { size: 0.8, speed: 0.5, y: 25, opacity: 0.7, delay: 2 },
            { size: 1.2, speed: 0.2, y: 10, opacity: 0.9, delay: 4 },
            { size: 0.6, speed: 0.8, y: 35, opacity: 0.6, delay: 1 },
            { size: 1.1, speed: 0.4, y: 20, opacity: 0.75, delay: 3 },
            { size: 0.9, speed: 0.6, y: 30, opacity: 0.65, delay: 5 },
            { size: 0.7, speed: 0.7, y: 40, opacity: 0.7, delay: 2.5 },
            { size: 1.3, speed: 0.25, y: 8, opacity: 0.8, delay: 1.5 }
        ];
    }

    init() {
        this.createContainer();
        this.createClouds();
        this.start();
        this.setupParallax();
        
        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'cloud-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 10;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);
    }

    async createClouds() {
        // Load cloud SVG
        const cloudSvg = await this.loadCloudSvg();
        
        this.cloudConfigs.forEach((config, index) => {
            const cloudElement = this.createCloudElement(cloudSvg, config, index);
            this.container.appendChild(cloudElement);
            this.clouds.push({
                element: cloudElement,
                config: config,
                currentX: -200, // Start off-screen
                id: index
            });
        });
    }

    async loadCloudSvg() {
        try {
            const response = await fetch('cloud.svg');
            return await response.text();
        } catch (error) {
            console.warn('Could not load cloud.svg, using fallback');
            return this.getFallbackCloud();
        }
    }

    getFallbackCloud() {
        return `<div style="
            width: 100px; 
            height: 40px; 
            background: white; 
            border-radius: 50px;
            position: relative;
        ">
            <div style="
                position: absolute;
                top: -15px;
                left: 20px;
                width: 50px;
                height: 50px;
                background: white;
                border-radius: 50%;
            "></div>
            <div style="
                position: absolute;
                top: -10px;
                right: 15px;
                width: 30px;
                height: 30px;
                background: white;
                border-radius: 50%;
            "></div>
        </div>`;
    }

    createCloudElement(cloudSvg, config, index) {
        const cloudDiv = document.createElement('div');
        cloudDiv.className = 'cloud';
        cloudDiv.setAttribute('data-cloud-id', index);
        
        const screenWidth = window.innerWidth;
        const startX = -200 - (Math.random() * 500); // Random start position off-screen
        
        cloudDiv.style.cssText = `
            position: absolute;
            top: ${config.y}%;
            left: ${startX}px;
            transform: scale(${config.size});
            opacity: ${config.opacity};
            z-index: ${10 - index};
            transition: opacity 0.3s ease;
        `;
        
        cloudDiv.innerHTML = cloudSvg.includes('<svg') ? cloudSvg : cloudSvg;
        
        return cloudDiv;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        const screenWidth = window.innerWidth;
        
        this.clouds.forEach(cloud => {
            // Move cloud to the right
            cloud.currentX += cloud.config.speed;
            
            // Reset position when cloud goes off-screen
            if (cloud.currentX > screenWidth + 200) {
                cloud.currentX = -200 - (Math.random() * 300);
            }
            
            // Update position
            cloud.element.style.left = `${cloud.currentX}px`;
        });

        requestAnimationFrame(() => this.animate());
    }

    setupParallax() {
        const castle = document.getElementById('castle');
        if (!castle) return;

        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5; // Parallax speed
            castle.style.transform = `translateY(${rate}px)`;
        };

        const handleResize = () => {
            // Adjust castle position based on screen size
            const screenWidth = window.innerWidth;
            const castle = document.getElementById('castle');
            if (!castle) return;

            if (screenWidth < 768) {
                // Mobile: ensure castle stays visible
                castle.style.right = '10%';
                castle.style.transform = 'scale(0.8)';
            } else {
                // Desktop: normal position
                castle.style.right = '15%';
                castle.style.transform = 'scale(1)';
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
    }

    handleResize() {
        // Recalculate cloud positions on resize
        this.clouds.forEach(cloud => {
            if (cloud.currentX > window.innerWidth + 200) {
                cloud.currentX = -200;
            }
        });
    }

    // Method to add interactive effects
    addInteractivity() {
        this.clouds.forEach(cloud => {
            cloud.element.addEventListener('mouseenter', () => {
                cloud.element.style.transform = `scale(${cloud.config.size * 1.1})`;
                cloud.element.style.opacity = Math.min(1, cloud.config.opacity + 0.2);
            });

            cloud.element.addEventListener('mouseleave', () => {
                cloud.element.style.transform = `scale(${cloud.config.size})`;
                cloud.element.style.opacity = cloud.config.opacity;
            });
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const cloudSystem = new CloudSystem();
    cloudSystem.init();
    
    // Add interactivity after a short delay
    setTimeout(() => {
        cloudSystem.addInteractivity();
    }, 1000);
});

// Export for potential external use
window.CloudSystem = CloudSystem;