const auroraColors = [
  'radial-gradient(circle at 30% 50%, rgba(0,255,150,0.3), transparent 70%), radial-gradient(circle at 70% 60%, rgba(0,200,255,0.3), transparent 70%), radial-gradient(circle at 50% 80%, rgba(200,0,255,0.2), transparent 80%)',
  'radial-gradient(circle at 20% 40%, rgba(255,0,200,0.3), transparent 70%), radial-gradient(circle at 60% 70%, rgba(0,150,255,0.3), transparent 70%), radial-gradient(circle at 50% 80%, rgba(0,255,180,0.2), transparent 80%)',
  'radial-gradient(circle at 25% 60%, rgba(200,255,0,0.3), transparent 70%), radial-gradient(circle at 65% 40%, rgba(255,100,150,0.3), transparent 70%), radial-gradient(circle at 55% 75%, rgba(150,0,255,0.2), transparent 80%)'
];

const aurora = document.querySelector('.aurora');
let index = 0;

// Ganti warna tiap 6 detik
setInterval(() => {
  index = (index + 1) % auroraColors.length;
  aurora.style.background = auroraColors[index];
}, 6000);