import{r as c}from"./index-CxciGOYN.js";/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),j=(...e)=>e.filter((t,r,o)=>!!t&&o.indexOf(t)===r).join(" ");/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var S={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=c.forwardRef(({color:e="currentColor",size:t=24,strokeWidth:r=2,absoluteStrokeWidth:o,className:s="",children:i,iconNode:a,...n},l)=>c.createElement("svg",{ref:l,...S,width:t,height:t,stroke:e,strokeWidth:o?Number(r)*24/Number(t):r,className:j("lucide",s),...n},[...a.map(([d,m])=>c.createElement(d,m)),...Array.isArray(i)?i:[i]]));/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=(e,t)=>{const r=c.forwardRef(({className:o,...s},i)=>c.createElement(B,{ref:i,iconNode:t,className:j(`lucide-${D(e)}`,o),...s}));return r.displayName=`${e}`,r};/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=z("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=z("CircleCheckBig",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);let P={data:""},q=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||P},M=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,R=/\/\*[^]*?\*\/|  +/g,A=/\n+/g,g=(e,t)=>{let r="",o="",s="";for(let i in e){let a=e[i];i[0]=="@"?i[1]=="i"?r=i+" "+a+";":o+=i[1]=="f"?g(a,i):i+"{"+g(a,i[1]=="k"?"":t)+"}":typeof a=="object"?o+=g(a,t?t.replace(/([^,])+/g,n=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,n):n?n+" "+l:l)):i):a!=null&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=g.p?g.p(i,a):i+":"+a+";")}return r+(t&&s?t+"{"+s+"}":s)+o},u={},L=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+L(e[r]);return t}return e},T=(e,t,r,o,s)=>{let i=L(e),a=u[i]||(u[i]=(l=>{let d=0,m=11;for(;d<l.length;)m=101*m+l.charCodeAt(d++)>>>0;return"go"+m})(i));if(!u[a]){let l=i!==e?e:(d=>{let m,h,b=[{}];for(;m=M.exec(d.replace(R,""));)m[4]?b.shift():m[3]?(h=m[3].replace(A," ").trim(),b.unshift(b[0][h]=b[0][h]||{})):b[0][m[1]]=m[2].replace(A," ").trim();return b[0]})(e);u[a]=g(s?{["@keyframes "+a]:l}:l,r?"":"."+a)}let n=r&&u.g?u.g:null;return r&&(u.g=u[a]),((l,d,m,h)=>{h?d.data=d.data.replace(h,l):d.data.indexOf(l)===-1&&(d.data=m?l+d.data:d.data+l)})(u[a],t,o,n),a},Z=(e,t,r)=>e.reduce((o,s,i)=>{let a=t[i];if(a&&a.call){let n=a(r),l=n&&n.props&&n.props.className||/^go/.test(n)&&n;a=l?"."+l:n&&typeof n=="object"?n.props?"":g(n,""):n===!1?"":n}return o+s+(a??"")},"");function w(e){let t=this||{},r=e.call?e(t.p):e;return T(r.unshift?r.raw?Z(r,[].slice.call(arguments,1),t.p):r.reduce((o,s)=>Object.assign(o,s&&s.call?s(t.p):s),{}):r,q(t.target),t.g,t.o,t.k)}let N,k,$;w.bind({g:1});let f=w.bind({k:1});function H(e,t,r,o){g.p=t,N=e,k=r,$=o}function y(e,t){let r=this||{};return function(){let o=arguments;function s(i,a){let n=Object.assign({},i),l=n.className||s.className;r.p=Object.assign({theme:k&&k()},n),r.o=/ *go\d+/.test(l),n.className=w.apply(r,o)+(l?" "+l:"");let d=e;return e[0]&&(d=n.as||e,delete n.as),$&&d[0]&&$(n),N(d,n)}return s}}var W=e=>typeof e=="function",E=(e,t)=>W(e)?e(t):e,K=(()=>{let e=0;return()=>(++e).toString()})(),Q=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),V=20,I="default",O=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:o}=t;return O(e,{type:e.toasts.find(a=>a.id===o.id)?1:0,toast:o});case 3:let{toastId:s}=t;return{...e,toasts:e.toasts.map(a=>a.id===s||s===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let i=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+i}))}}},Y=[],G={toasts:[],pausedAt:void 0,settings:{toastLimit:V}},x={},_=(e,t=I)=>{x[t]=O(x[t]||G,e),Y.forEach(([r,o])=>{r===t&&o(x[t])})},F=e=>Object.keys(x).forEach(t=>_(e,t)),J=e=>Object.keys(x).find(t=>x[t].toasts.some(r=>r.id===e)),C=(e=I)=>t=>{_(t,e)},U=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||K()}),v=e=>(t,r)=>{let o=U(t,e,r);return C(o.toasterId||J(o.id))({type:2,toast:o}),o.id},p=(e,t)=>v("blank")(e,t);p.error=v("error");p.success=v("success");p.loading=v("loading");p.custom=v("custom");p.dismiss=(e,t)=>{let r={type:3,toastId:e};t?C(t)(r):F(r)};p.dismissAll=e=>p.dismiss(void 0,e);p.remove=(e,t)=>{let r={type:4,toastId:e};t?C(t)(r):F(r)};p.removeAll=e=>p.remove(void 0,e);p.promise=(e,t,r)=>{let o=p.loading(t.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(s=>{let i=t.success?E(t.success,s):void 0;return i?p.success(i,{id:o,...r,...r==null?void 0:r.success}):p.dismiss(o),s}).catch(s=>{let i=t.error?E(t.error,s):void 0;i?p.error(i,{id:o,...r,...r==null?void 0:r.error}):p.dismiss(o)}),e};var X=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,ee=f`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,te=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,re=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${X} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ee} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${te} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,ae=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,oe=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${ae} 1s linear infinite;
`,ie=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,se=f`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,ne=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ie} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${se} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,le=y("div")`
  position: absolute;
`,ce=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,de=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,pe=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${de} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,me=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return t!==void 0?typeof t=="string"?c.createElement(pe,null,t):t:r==="blank"?null:c.createElement(ce,null,c.createElement(oe,{...o}),r!=="loading"&&c.createElement(le,null,r==="error"?c.createElement(re,{...o}):c.createElement(ne,{...o})))},ue=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,fe=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,ge="0%{opacity:0;} 100%{opacity:1;}",ye="0%{opacity:1;} 100%{opacity:0;}",he=y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,be=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,xe=(e,t)=>{let r=e.includes("top")?1:-1,[o,s]=Q()?[ge,ye]:[ue(r),fe(r)];return{animation:t?`${f(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};c.memo(({toast:e,position:t,style:r,children:o})=>{let s=e.height?xe(e.position||t||"top-center",e.visible):{opacity:0},i=c.createElement(me,{toast:e}),a=c.createElement(be,{...e.ariaProps},E(e.message,e));return c.createElement(he,{className:e.className,style:{...s,...r,...e.style}},typeof o=="function"?o({icon:i,message:a}):c.createElement(c.Fragment,null,i,a))});H(c.createElement);w`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var $e=p;export{we as C,ke as a,z as c,$e as z};
