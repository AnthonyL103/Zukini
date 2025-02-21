import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight/1.42), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      alpha: true,
      antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight/1.42);
    camera.position.z = 5;

    // Add grid helper
    const size = 20;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions, 0x67d7cc, 0x67d7cc);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Add floating math symbols with better distribution
    const mathSymbols = ['π', '∑', '∫', '√', '∞', 'θ', 'Δ', '±', 'φ', 'λ', 'μ', 'σ', '∏', '∂'];
    const symbolInstances = 5; // Increased number of instances
    const mathObjects = [];
    
    // Create a function to generate a random position within a sphere
    const getRandomSpherePosition = (radius) => {
      const phi = Math.random() * Math.PI * 2; // Random angle around Y axis
      const costheta = Math.random() * 2 - 1; // Random height
      const theta = Math.acos(costheta); // Convert to angle
      
      return {
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta)
      };
    };
    
    mathSymbols.forEach((symbol) => {
      for (let i = 0; i < symbolInstances; i++) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        
        // Draw symbol on canvas with varying colors
        const hue = Math.random() * 180 + 160; // Range from cyan to blue
        context.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
        context.font = '80px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(symbol, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ 
          map: texture,
          transparent: true,
          opacity: 0.7
        });
        
        const sprite = new THREE.Sprite(material);
        
        // Position within a sphere
        const radius = 8; // Increased radius for better distribution
        const pos = getRandomSpherePosition(radius);
        sprite.position.set(pos.x, pos.y, pos.z);
        
        // Randomize scale for depth effect
        const scale = 1 + Math.random() * 0.4;
        sprite.scale.set(scale, scale, scale);
        
        // Enhanced animation parameters
        sprite.userData = {
          phaseOffset: Math.random() * Math.PI * 2,
          floatSpeed: 0.2 + Math.random() * 0.3,
          rotationSpeed: 0.1 + Math.random() * 0.2,
          orbitRadius: Math.random() * 2 + 3,
          orbitSpeed: 0.1 + Math.random() * 0.2,
          initialPosition: { ...pos }
        };
        
        mathObjects.push(sprite);
        scene.add(sprite);
      }
    });

    // Create geometric lines (rest of the lines code remains the same)
    const lines = [];
    for(let i = 0; i < 100; i++) {
      const geometry = new THREE.BufferGeometry();
      const points = [];
      
      points.push(new THREE.Vector3(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      ));
      points.push(new THREE.Vector3(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      ));
      
      geometry.setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x67d7cc,
        transparent: true,
        opacity: 0.3
      });
      
      const line = new THREE.Line(geometry, material);
      line.userData.rotationSpeedX = (Math.random() - 0.5) * 0.002;
      line.userData.rotationSpeedY = (Math.random() - 0.5) * 0.002;
      lines.push(line);
      scene.add(line);
    }

    // Enhanced animation loop
    let lastTime = 0;
    const animate = (currentTime) => {
      requestAnimationFrame(animate);
      
      const time = currentTime * 0.001;
      const deltaTime = lastTime === 0 ? 0 : time - lastTime;
      lastTime = time;
      
      // Update lines
      lines.forEach(line => {
        line.rotation.x += line.userData.rotationSpeedX;
        line.rotation.y += line.userData.rotationSpeedY;
      });

      // Update math symbols with complex motion
      mathObjects.forEach(sprite => {
        const userData = sprite.userData;
        
        // Orbital motion
        const orbitAngle = time * userData.orbitSpeed + userData.phaseOffset;
        const newX = userData.initialPosition.x + Math.cos(orbitAngle) * userData.orbitRadius;
        const newZ = userData.initialPosition.z + Math.sin(orbitAngle) * userData.orbitRadius;
        
        // Vertical floating motion
        const floatOffset = Math.sin((time + userData.phaseOffset) * userData.floatSpeed) * 0.5;
        
        sprite.position.set(
          newX,
          userData.initialPosition.y + floatOffset,
          newZ
        );
        
        // Gentle rotation
        sprite.rotation.z += userData.rotationSpeed * deltaTime;
      });

      // Smooth grid rotation
      gridHelper.rotation.x = Math.sin(time * 0.1) * 0.1;
      gridHelper.rotation.y = Math.cos(time * 0.15) * 0.1;
      
      renderer.render(scene, camera);
    };

    animate(0);

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / (window.innerHeight/1.42);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight/1.42);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      lines.forEach(line => {
        line.geometry.dispose();
        line.material.dispose();
      });
      mathObjects.forEach(sprite => {
        sprite.material.map.dispose();
        sprite.material.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-[70vh] bg-primary relative mb-3 pt-16">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'linear-gradient(to bottom, #0f0647, #67d7cc)' }}
        />
        <div className="absolute inset-x-0 -bottom-3 h-20 bg-gradient-to-t from-white to-transparent" />
      </div>
  
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 max-w-xl w-full px-4">
        <div className="backdrop-blur-sm bg-white/20 rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-[#f0f0f0] to-[#67d7cc] bg-clip-text text-transparent">
            AI Study Buddy
          </h1>
          <p className="text-lg text-center text-[#f0f0f0] mb-4">
            Transform your study materials into interactive learning experiences. 
            Upload your notes and let our AI create personalized flashcards and 
            mock tests to enhance your learning journey.
          </p>
        </div>

        <div className="backdrop-blur-sm bg-white/20 rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-semibold mb-4 text-[#67d7cc]">Ready to Start?</h2>
          <button
            onClick={() => navigate('/files')}
            className="px-8 py-4 bg-primary text-white rounded-xl 
                      hover:bg-primary-hover transition-all duration-300 
                      transform hover:scale-105 active:translate-y-1"
          >
            Upload Your Notes
          </button>
        </div>
      </div>

      <div className="py-16 bg-gradient-to-b from-white to-gray-50">
      <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#67d7cc] to-[#2c5d63] bg-clip-text text-transparent">
          How to Start
      </h2>
        
        <div className="max-w-6xl mx-auto px-4">
          {/* Video Container */}
          <div className="aspect-w-16 aspect-h-9 mb-16 rounded-3xl overflow-hidden shadow-2xl">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <div className="text-center transform transition-all hover:scale-105">
                <svg className="w-20 h-20 text-primary/40 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12l-18 12v-24l18 12z"/>
                </svg>
                <p className="text-gray-600 text-lg font-medium">Tutorial video coming soon</p>
              </div>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {[
              {
                step: 1,
                title: "Upload Notes",
                description: "Upload your study materials in PDF or image format",
                color: "from-blue-500 to-cyan-400"
              },
              {
                step: 2,
                title: "Choose Format",
                description: "Select between flashcards, practice tests, or summary notes",
                color: "from-cyan-400 to-teal-400"
              },
              {
                step: 3,
                title: "Start Learning",
                description: "Begin studying with your personalized materials",
                color: "from-teal-400 to-emerald-400"
              }
            ].map((item, index, array) => (
              <div key={index} className="flex flex-col items-center text-center group relative">
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform transition-all group-hover:scale-110 group-hover:rotate-3`}>
                  <span className="text-white font-bold text-2xl">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                
                {/* Add arrows between steps (except for the last item) */}
                {index < array.length - 1 && (
                  <>
                    {/* Arrow for desktop */}
                    <div className="hidden md:block absolute top-8 -right-6 w-12 transform translate-x-full">
                      <svg className="w-full h-6 text-primary/30" fill="none" viewBox="0 0 24 8">
                        <path d="M0 4H22M22 4L19 1M22 4L19 7" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    
                    {/* Arrow for mobile */}
                    <div className="md:hidden absolute -bottom-6 left-1/2 transform -translate-x-1/2 rotate-90">
                      <svg className="w-12 h-6 text-primary/30" fill="none" viewBox="0 0 24 8">
                        <path d="M0 4H22M22 4L19 1M22 4L19 7" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#67d7cc] to-[#2c5d63] bg-clip-text text-transparent">
          What do you want to make?
        </h2>
        
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Flashcards",
              description: "Convert your notes into interactive flashcards for efficient memorization and quick review sessions.",
              icon: <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM4 6H20V18H4V6Z"/>
            },
            {
              title: "Practice Tests",
              description: "Generate custom mock tests to assess your knowledge and prepare for exams effectively.",
              icon: <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15V3H9V5ZM7 7H17V19H7V7ZM9 9V11H15V9H9ZM9 13V15H15V13H9Z"/>
            },
            {
              title: "Summary Notes",
              description: "Create concise summaries of your study materials with key concepts highlighted.",
              icon: <path d="M19.5 3.5L18 2L16.5 3.5L15 2L13.5 3.5L12 2L10.5 3.5L9 2L7.5 3.5L6 2V22L7.5 20.5L9 22L10.5 20.5L12 22L13.5 20.5L15 22L16.5 20.5L18 22L19.5 20.5L21 22V2L19.5 3.5ZM19 19.09H5V4.91H19V19.09Z"/>
            }
          ].map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.1)] hover:shadow-[0_0_50px_rgba(0,0,0,0.15)] transition-all duration-300 text-center group hover:-translate-y-2">
              <div className="h-20 w-20 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-colors duration-300">
                <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  {item.icon}
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;