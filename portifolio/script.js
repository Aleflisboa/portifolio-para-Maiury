(function(){
const root=document.getElementById('revista');
const anterior=document.getElementById('anterior');
const proxima=document.getElementById('proxima');
const contador=document.getElementById('contador');
const upload=document.getElementById('uploadImagem');
const destino=document.getElementById('fotoDestino');
const urls=new Map();
if(!window.St || !St.PageFlip){alert('Não foi possível carregar StPageFlip. Verifique a conexão com a internet.');return;}
const pageFlip=new St.PageFlip(root,{
 width:650,height:920,size:'stretch',minWidth:180,maxWidth:1600,minHeight:254,maxHeight:2250,
 showCover:true,drawShadow:true,maxShadowOpacity:.45,flippingTime:900,usePortrait:true,
 mobileScrollSupport:false,showPageCorners:true,disableFlipByClick:true,autoSize:true
});
pageFlip.loadFromHTML(root.querySelectorAll('.pagina'));
function atualizar(){const atual=pageFlip.getCurrentPageIndex(),total=pageFlip.getPageCount();contador.textContent=`${atual+1} / ${total}`;anterior.disabled=atual===0;proxima.disabled=atual===total-1;}
anterior.addEventListener('click',()=>pageFlip.flipPrev());
proxima.addEventListener('click',()=>pageFlip.flipNext());
pageFlip.on('flip',atualizar);pageFlip.on('init',atualizar);atualizar();
// O input fica FORA das páginas do StPageFlip.
// Ao trocar a foto, apenas o <img> escolhido é atualizado: não há recriação de folhas.
upload.addEventListener('change',()=>{
 const file=upload.files && upload.files[0];if(!file)return;
 if(!file.type.startsWith('image/')){alert('Selecione um arquivo de imagem.');upload.value='';return;}
 const slot=destino.value;const image=root.querySelector(`img[data-slot="${slot}"]`);
 if(!image)return;
 const next=URL.createObjectURL(file);const previous=urls.get(slot);image.src=next;urls.set(slot,next);
 if(previous)URL.revokeObjectURL(previous);
 upload.value='';
});
window.addEventListener('beforeunload',()=>urls.forEach(url=>URL.revokeObjectURL(url)));
})();