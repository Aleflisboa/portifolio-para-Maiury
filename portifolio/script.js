(function(){
const root=document.getElementById('revista');
const anterior=document.getElementById('anterior');
const proxima=document.getElementById('proxima');
const contador=document.getElementById('contador');
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
})();
