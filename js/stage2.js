
// Static stage2 logic (no backend).
// Configure the image path and expected answer.
const CONFIG = {
  imageSrc: 'secret.png', // replace with your actual image filename
  expected: '101' // 3-number code as per hint
};

// const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d', { willReadFrequently: true });
// const img = new Image();
// img.crossOrigin = 'anonymous';
// img.src = CONFIG.imageSrc;

// const filters = [
//   { name: 'Original', fn: (d)=>d },
//   { name: 'Grayscale', fn: grayscale },
//   { name: 'High Contrast', fn: contrast(1.4) },
//   { name: 'Sharpen', fn: sharpen },
//   { name: 'Threshold', fn: threshold(140) }
// ];

// let current = 0;
// const prevBtn = document.getElementById('prev');
// const nextBtn = document.getElementById('next');

// function render(index){
//   const w = img.naturalWidth, h = img.naturalHeight;
//   canvas.width = w; canvas.height = h;
//   ctx.drawImage(img, 0, 0, w, h);
//   try {
//     const imageData = ctx.getImageData(0, 0, w, h);
//     const processed = filters[index].fn(imageData);
//     ctx.putImageData(processed, 0, 0);
//   } catch(e){
//     console.error(e);
//   }
// }

// img.onload = ()=> render(current);
// prevBtn.addEventListener('click', ()=>{
//   current = (current - 1 + filters.length) % filters.length;
//   render(current);
// });
// nextBtn.addEventListener('click', ()=>{
//   current = (current + 1) % filters.length;
//   render(current);
// });

// // Helpers
// function grayscale(data){
//   const d = data.data;
//   for(let i=0;i<d.length;i+=4){
//     const y = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
//     d[i]=d[i+1]=d[i+2]=y;
//   }
//   return data;
// }
// function contrast(amount){
//   return (data)=>{
//     const d = data.data;
//     const factor = (259*(amount+255))/(255*(259-amount));
//     // If amount given is like 1.4, map to 0..255 domain
//     const A = typeof amount==='number' && amount<=10 ? (amount-1)*128 : amount;
//     const f = (259*(A+255))/(255*(259-A));
//     for(let i=0;i<d.length;i+=4){
//       d[i] = f*(d[i]-128)+128;
//       d[i+1] = f*(d[i+1]-128)+128;
//       d[i+2] = f*(d[i+2]-128)+128;
//     }
//     return data;
//   };
// }
// function threshold(t){
//   return (data)=>{
//     const d = data.data;
//     for(let i=0;i<d.length;i+=4){
//       const y = 0.2126*d[i] + 0.7152*d[i+1] + 0.0722*d[i+2];
//       const v = y >= t ? 255 : 0;
//       d[i]=d[i+1]=d[i+2]=v;
//     }
//     return data;
//   };
// }
// function sharpen(data){
//   // simple 3x3 kernel
//   const w = data.width, h = data.height;
//   const src = data.data;
//   const out = new Uint8ClampedArray(src.length);
//   const k = [ 0,-1, 0,
//              -1, 5,-1,
//               0,-1, 0 ];
//   const idx = (x,y)=> (y*w+x)*4;
//   for(let y=1;y<h-1;y++){
//     for(let x=1;x<w-1;x++){
//       let r=0,g=0,b=0;
//       let n=0;
//       for(let ky=-1;ky<=1;ky++){
//         for(let kx=-1;kx<=1;kx++){
//           const wgt = k[++n-1];
//           const i = idx(x+kx, y+ky);
//           r += src[i]*wgt;
//           g += src[i+1]*wgt;
//           b += src[i+2]*wgt;
//         }
//       }
//       const o = idx(x,y);
//       out[o]   = Math.min(255, Math.max(0, r));
//       out[o+1] = Math.min(255, Math.max(0, g));
//       out[o+2] = Math.min(255, Math.max(0, b));
//       out[o+3] = src[o+3];
//     }
//   }
//   data.data.set(out);
//   return data;
// }

// // Check answer (static)
// document.getElementById('send2').addEventListener('click', ()=>{
//   const guess = (document.getElementById('guess2').value||'').trim();
//   const box = document.getElementById('res2');
//   if(!guess){ box.innerHTML = '<span class="err">Escribe tu propuesta.</span>'; return; }
//   if(guess === CONFIG.expected){
//     box.innerHTML = '<span class="ok">¡Correcto!</span>';
    // window.location.href = "https://api.whatsapp.com/send/?phone=59174184075&text=Hola%2C+soy+de+los+100+mejores+y+quiero+saber+mas+sobre+la+carrera.&type=phone_number&app_absent=0";
//   }else{
//     box.innerHTML = '<span class="err">Incorrecto. Prueba alternar los filtros y observa con atención.</span>';
//   }
// });

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
img.src = window.SECRET_IMAGE || "/secret.png";

// --- Navegación: solo flechas ---
function prevMode(){ idx = (idx - 1 + modes.length) % modes.length; render(); }
function nextMode(){ idx = (idx + 1) % modes.length; render(); }

prevBtn.addEventListener('click', prevMode);
nextBtn.addEventListener('click', nextMode);

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  prevMode();
  if (e.key === 'ArrowRight') nextMode();
});
// Check answer (static)
document.getElementById('send2').addEventListener('click', ()=>{
  const guess = (document.getElementById('guess2').value||'').trim();
  const box = document.getElementById('res2');
  if(!guess){ box.innerHTML = '<span class="err">Escribe tu propuesta.</span>'; return; }
  if(guess === CONFIG.expected){
    box.innerHTML = '<span class="ok">¡Correcto!</span>';
    window.location.href = "https://api.whatsapp.com/send/?phone=59174184075&text=Hola%2C+soy+de+los+100+mejores+y+quiero+saber+mas+sobre+la+carrera.&type=phone_number&app_absent=0";
  }else{
    box.innerHTML = '<span class="err">Incorrecto. Prueba alternar los filtros y observa con atención.</span>';
  }
});
// --- Validar respuesta ---
// document.getElementById('send2').addEventListener('click', async ()=>{
//   const guess = (guessInput.value || '').trim();
//   if(!guess){ resBox.innerHTML = '<span class="err">Escribe tu propuesta.</span>'; return; }
//   const r = await fetch('/api/check2', {
//     method:'POST',
//     headers:{'Content-Type':'application/json'},
//     body: JSON.stringify({guess})
//   });
//   const j = await r.json();
//   if(j.ok){
//     resBox.innerHTML = '<span class="ok">¡Bien! Enviando a WhatsApp…</span>';
    
//     setTimeout(()=>location.href=j.wa, 400);
//   } else {
//     resBox.innerHTML = '<span class="err">Aún no. Cambia de filtro con las flechas y vuelve a intentar.</span>';
//   }
// });

