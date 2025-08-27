const CONFIG = {
  imageSrc: 'static/img/secret.jpg',     // <-- actualizado a .jpg
  expected: '101',
  wa: 'https://api.whatsapp.com/send/?phone=59174184075&text=Hola%2C+soy+de+los+100+mejores+y+quiero+saber+mas+sobre+la+carrera.&type=phone_number&app_absent=0'
};

const modes = [
  { name: "Original", fn: (r,g,b,a)=>[r,g,b,a] },
  { name: "Canal R", fn: (r)=>[r,0,0,255] },
  { name: "Canal G", fn: (r,g)=>[0,g,0,255] },
  { name: "Canal B", fn: (r,g,b)=>[0,0,b,255] },
  { name: "R+G", fn: (r,g)=>[r,g,0,255] },
  { name: "G+B", fn: (r,g,b)=>[0,g,b,255] },
  { name: "B+R", fn: (r,g,b)=>[r,0,b,255] },
  { name: "Grayscale", fn: (r,g,b)=>{const y=(0.299*r+0.587*g+0.114*b)|0; return [y,y,y,255];} },
  { name: "Invertir", fn: (r,g,b)=>[255-r,255-g,255-b,255] },
  { name: "Contraste x2.2", fn: (r,g,b)=>{const f=v=>Math.max(0,Math.min(255,((v-128)*2.2+128))); return [f(r)|0,f(g)|0,f(b)|0,255];} },
  { name: "Umbral 128", fn: (r,g,b)=>{const y=(0.299*r+0.587*g+0.114*b);return y>128?[255,255,255,255]:[0,0,0,255];} },
  { name: "Posterizar (4)", fn: (r,g,b)=>{const q=v=>Math.floor(v/64)*64;return [q(r),q(g),q(b),255];} },
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
img.onload = () => {
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  render();
};
img.src = CONFIG.imageSrc;

function applyMode(imageData, mode){
  const d = imageData.data;
  for (let i=0; i<d.length; i+=4){
    const r=d[i], g=d[i+1], b=d[i+2], a=d[i+3];
    const o = mode.fn(r,g,b,a);
    d[i]=o[0]; d[i+1]=o[1]; d[i+2]=o[2]; d[i+3]=o[3];
  }
  return imageData;
}

function render(){
  const mode = modes[idx];
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  try{
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    imageData = applyMode(imageData, mode);
    ctx.putImageData(imageData, 0, 0);
  }catch(e){
    resBox.innerHTML = '<span class="err">Si estás probando local con file://, usa Live Server o http.server para ver los filtros.</span>';
    console.error(e);
  }
}

function prevMode(){ idx = (idx - 1 + modes.length) % modes.length; render(); }
function nextMode(){ idx = (idx + 1) % modes.length; render(); }

prevBtn.addEventListener('click', prevMode);
nextBtn.addEventListener('click', nextMode);
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  prevMode();
  if (e.key === 'ArrowRight') nextMode();
});

document.getElementById('send2').addEventListener('click', ()=>{
  const guess = (guessInput.value||'').trim();
  if(!guess){ resBox.innerHTML = '<span class="err">Escribe tu propuesta.</span>'; return; }
  if(guess === CONFIG.expected){
    resBox.innerHTML = '<span class="ok">¡Correcto! Abriendo WhatsApp…</span>';
    window.location.href = CONFIG.wa;
  } else {
    resBox.innerHTML = '<span class="err">Incorrecto. Cambia de filtro y observa con atención.</span>';
  }
});
