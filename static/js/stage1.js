const ROT_OK = 17;
const PLAINTEXT = "BIENVENIDO A LA UPB";

const rotSlider = document.getElementById('rot');
const rotVal = document.getElementById('rotVal');
const cipherView = document.getElementById('cipherView');
const sendBtn = document.getElementById('send1');
const resBox = document.getElementById('res1');

function rot(text, n){
  const a = 'a'.charCodeAt(0), z = 'z'.charCodeAt(0);
  const A = 'A'.charCodeAt(0), Z = 'Z'.charCodeAt(0);
  const s = ((n % 26) + 26) % 26;
  let out = '';
  for(const ch of text){
    const c = ch.charCodeAt(0);
    if(c>=a && c<=z) out += String.fromCharCode(((c - a + s) % 26) + a);
    else if(c>=A && c<=Z) out += String.fromCharCode(((c - A + s) % 26) + A);
    else out += ch;
  }
  return out;
}

// Mostramos el texto transformado; en 17 queda legible
function render(){
  const n = parseInt(rotSlider.value, 10);
  rotVal.textContent = n;
  const shift = (ROT_OK - n + 26) % 26;
  cipherView.textContent = rot(PLAINTEXT, shift);
}

rotSlider.addEventListener('input', render);

sendBtn.addEventListener('click', ()=>{
  const n = parseInt(rotSlider.value, 10);
  if(n === ROT_OK){
    resBox.innerHTML = '<span class="ok">¡Correcto! Redirigiendo al Reto 2…</span>';
    setTimeout(()=> location.href='stage2.html', 700);
  } else {
    resBox.innerHTML = '<span class="err">Aún no. Ajusta el control hasta el ROT 17.</span>';
  }
});

render();
