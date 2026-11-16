/** Group the integer part without rounding, dropping decimals or changing a partial sign. */
export function formatNumberText(value, emptyAsZero=false) {
  const plain=value.replace(/[\s\u00a0\u202f]/g,'');
  if(plain==='') return emptyAsZero ? '0' : '';
  const match=/^([-−]?)(\d*)(?:([,.])(\d*))?$/.exec(plain);
  if(!match) return value;
  const [,sign,integer,separator,fraction]=match;
  const grouped=integer.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  return sign+grouped+(separator ? ','+fraction : '');
}

/** Keep selection attached to the same meaningful characters when spaces are inserted. */
export function formatNumberEdit(value,start,end=start) {
  const text=formatNumberText(value);
  const position=offset=>{
    const count=value.slice(0,offset).replace(/[\s\u00a0\u202f]/g,'').length;
    if(count===0) return 0;
    let seen=0;
    for(let i=0;i<text.length;i++) if(!/\s/.test(text[i]) && ++seen===count) return i+1;
    return text.length;
  };
  return {text,start:position(start),end:position(end)};
}
