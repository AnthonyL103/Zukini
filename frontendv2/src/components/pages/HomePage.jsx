import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Three.js scene setup
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

    // Add floating math symbols
    const mathSymbols = ['π', '∑', '∫', '√', '∞', 'θ', 'Δ', '±', 'φ', 'λ', 'μ', 'σ', '∏', '∂'];
    const symbolInstances = 3;
    const mathObjects = [];
    
    mathSymbols.forEach((symbol) => {
      for (let i = 0; i < symbolInstances; i++) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 128;
        
        // Draw symbol on canvas
        context.fillStyle = '#67d7cc';
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
        sprite.position.set(
          Math.random() * 10 - 5,
          Math.random() * 10 - 5,
          Math.random() * 10 - 5
        );
        sprite.scale.set(0.5, 0.5, 0.5);
        
        // Add random phase offset for each sprite
        sprite.userData.phaseOffset = Math.random() * Math.PI * 2;
        sprite.userData.floatSpeed = 0.5 + Math.random() * 0.5; // Random speed multiplier
        sprite.userData.rotationSpeed = 0.2 + Math.random() * 0.3; // Random rotation speed
        
        mathObjects.push(sprite);
        scene.add(sprite);
      }
    });

    // Create geometric lines
    const lines = [];
    for(let i = 0; i < 100; i++) {
      const geometry = new THREE.BufferGeometry();
      const points = [];
      
      // Random line points
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
      // Add random rotation speeds for each line
      line.userData.rotationSpeedX = (Math.random() - 0.5) * 0.002;
      line.userData.rotationSpeedY = (Math.random() - 0.5) * 0.002;
      lines.push(line);
      scene.add(line);
    }

    // Animation loop with time-based updates
    let lastTime = 0;
    const animate = (currentTime) => {
      requestAnimationFrame(animate);
      
      // Convert time to seconds
      const time = currentTime * 0.001;
      const deltaTime = lastTime === 0 ? 0 : time - lastTime;
      lastTime = time;
      
      // Update lines with individual rotation speeds
      lines.forEach(line => {
        line.rotation.x += line.userData.rotationSpeedX;
        line.rotation.y += line.userData.rotationSpeedY;
      });

      // Update math symbols with smooth floating motion
      mathObjects.forEach(sprite => {
        const floatOffset = Math.sin((time + sprite.userData.phaseOffset) * sprite.userData.floatSpeed) * 0.1;
        sprite.position.y = sprite.position.y + (floatOffset - sprite.position.y) * 0.1;
        sprite.rotation.z += sprite.userData.rotationSpeed * deltaTime;
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
      <div className="h-[70vh] bg-primary relative mb-3">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'linear-gradient(to bottom, #0f0647, #67d7cc)' }}
        />
        <div className="absolute inset-x-0 -bottom-3 h-20 bg-gradient-to-t from-white to-transparent" />
      </div>
  
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 max-w-xl w-full px-4">
        <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-[#67d7cc] bg-clip-text text-transparent">
            AI Study Buddy
          </h1>
          <p className="text-lg text-center text-primary mb-4">
            Transform your study materials into interactive learning experiences. 
            Upload your notes and let our AI create personalized flashcards and 
            mock tests to enhance your learning journey.
          </p>
        </div>

        <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Start?</h2>
          <button
            onClick={() => navigate('/files')}
            className="px-8 py-4 bg-black text-white rounded-xl 
                      hover:bg-primary-hover transition-all duration-300 
                      transform hover:scale-105 active:translate-y-1"
          >
            Upload Your Notes
          </button>
        </div>
      </div>

      <div className="h-[50vh] px-4 py-12 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          How to Start
        </h2>
        
        <div className="max-w-4xl mx-auto">
          {/* Video Container */}
          <div className="aspect-w-16 aspect-h-9 mb-8 bg-gray-100 rounded-2xl overflow-hidden">
            {/* Placeholder for video - replace src with actual video URL */}
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <div className="text-center">
                <svg className="w-16 h-16 text-primary/30 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12l-18 12v-24l18 12z"/>
                </svg>
                <p className="text-gray-500">Tutorial video coming soon</p>
              </div>
            </div>
          </div>

          {/* Quick Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Notes</h3>
              <p className="text-gray-600">Upload your study materials in PDF or image format</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">Choose Format</h3>
              <p className="text-gray-600">Select between flashcards, practice tests, or summary notes</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">Start Learning</h3>
              <p className="text-gray-600">Begin studying with your personalized materials</p>
            </div>
          </div>
        </div>
      </div>
        
      <div className="h-[50vh] px-4 py-12 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12 text-primary">
          What do you want to make?
        </h2>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Flashcards Card */}
          <div className="bg-surface p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2">
            <div className="h-16 w-16 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM4 6H20V18H4V6Z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Flashcards</h3>
            <p className="text-gray-600">
              Convert your notes into interactive flashcards for efficient memorization and quick review sessions.
            </p>
          </div>

          {/* Practice Tests Card */}
          <div className="bg-surface p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2">
            <div className="h-16 w-16 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15V3H9V5ZM7 7H17V19H7V7ZM9 9V11H15V9H9ZM9 13V15H15V13H9Z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Practice Tests</h3>
            <p className="text-gray-600">
              Generate custom mock tests to assess your knowledge and prepare for exams effectively.
            </p>
          </div>

          {/* Summary Notes Card */}
          <div className="bg-surface p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2">
            <div className="h-16 w-16 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.5 3.5L18 2L16.5 3.5L15 2L13.5 3.5L12 2L10.5 3.5L9 2L7.5 3.5L6 2V22L7.5 20.5L9 22L10.5 20.5L12 22L13.5 20.5L15 22L16.5 20.5L18 22L19.5 20.5L21 22V2L19.5 3.5ZM19 19.09H5V4.91H19V19.09Z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Summary Notes</h3>
            <p className="text-gray-600">
              Create concise summaries of your study materials with key concepts highlighted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;