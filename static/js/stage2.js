// ---- Modos tipo "Stegsolve" ----
// Solo se cambia con flechas (botones o teclado), no con clic/tap en canvas.
const modes = [
  { name: "Original", fn: (r,g,b,a)=>[r,g,b,a] },
  // Canales
  { name: "Canal R",  fn: (r)=>[r,0,0,255] },
  { name: "Canal G",  fn: (r,g)=>[0,g,0,255] },
  { name: "Canal B",  fn: (r,g,b)=>[0,0,b,255] },
  // Combinaciones
  { name: "R+G",      fn: (r,g)=>[r,g,0,255] },
  { name: "G+B",      fn: (r,g,b)=>[0,g,b,255] },
  { name: "B+R",      fn: (r,g,b)=>[r,0,b,255] },
  // Luminancia / inversión / contraste
  { name: "Grayscale",fn: (r,g,b)=>{const y=(0.299*r+0.587*g+0.114*b)|0; return [y,y,y,255];} },
  { name: "Invert",   fn: (r,g,b)=>[255-r,255-g,255-b,255] },
  { name: "Contraste x2.2", fn: (r,g,b)=>{const f=v=>Math.max(0,Math.min(255,((v-128)*2.2+128))); return [f(r)|0,f(g)|0,f(b)|0,255];} },
  // Umbral (binarización)
  { name: "Umbral 128", fn: (r,g,b)=>{const y=(0.299*r+0.587*g+0.114*b);return y>128?[255,255,255,255]:[0,0,0,255];} },
  // Posterizar
  { name: "Posterizar (4)", fn: (r,g,b)=>{const q=v=>Math.floor(v/64)*64;return [q(r),q(g),q(b),255];} },
  // Bitplanes por canal (0..7)
  ...Array.from({length:8},(_,k)=>({name:`Bit R${k}`, fn:(r)=>[((r>>k)&1)*255,0,0,255]})),
  ...Array.from({length:8},(_,k)=>({name:`Bit G${k}`, fn:(r,g)=>[0,((g>>k)&1)*255,0,255]})),
  ...Array.from({length:8},(_,k)=>({name:`Bit B${k}`, fn:(r,g,b)=>[0,0,((b>>k)&1)*255,255]})),
];

let idx = 0;
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const guessInput = document.getElementById('guess2');
const resBox = document.getElementById('res2');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const img = new Image();
img.crossOrigin = "anonymous";

// --- Helpers ---
function applyMode(imageData, mode){
  if(!mode.fn) return imageData;
  const data = imageData.data;
  for (let i=0; i<data.length; i+=4){
    const r=data[i], g=data[i+1], b=data[i+2], a=data[i+3];
    const out = mode.fn(r,g,b,a);
    data[i]=out[0]; data[i+1]=out[1]; data[i+2]=out[2]; data[i+3]=out[3];
  }
  return imageData;
}

function render(){
  const mode = modes[idx];
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  imageData = applyMode(imageData, mode);
  ctx.putImageData(imageData, 0, 0);
}

img.onload = () => {
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  render();
};
img.src = window.SECRET_IMAGE || "/static/secret.png";

// --- Navegación: solo flechas ---
function prevMode(){ idx = (idx - 1 + modes.length) % modes.length; render(); }
function nextMode(){ idx = (idx + 1) % modes.length; render(); }

prevBtn.addEventListener('click', prevMode);
nextBtn.addEventListener('click', nextMode);

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  prevMode();
  if (e.key === 'ArrowRight') nextMode();
});

// --- Validar respuesta ---
document.getElementById('send2').addEventListener('click', async ()=>{
  const guess = (guessInput.value || '').trim();
  if(!guess){ resBox.innerHTML = '<span class="err">Escribe tu propuesta.</span>'; return; }
  const r = await fetch('/api/check2', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({guess})
  });
  const j = await r.json();
  if(j.ok){
    resBox.innerHTML = '<span class="ok">¡Bien! Enviando a WhatsApp…</span>';
    setTimeout(()=>location.href=j.wa, 400);
  } else {
    resBox.innerHTML = '<span class="err">Aún no. Cambia de filtro con las flechas y vuelve a intentar.</span>';
  }
});
