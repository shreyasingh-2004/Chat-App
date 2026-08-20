import{r as i,u as F,c as Y,j as e,L}from"./index-CxciGOYN.js";import{c as C,z as N,a as x,C as y}from"./index-BbAzW9jL.js";import{a as k,U as O,C as V,S as Z}from"./user-CfWZBqjw.js";import{M as T,L as q,E as P,a as S}from"./mail-BuhHXBxn.js";/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=C("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=C("ShieldCheck",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]),X=()=>{const[s,c]=i.useState(!1),{setAuthUser:f}=F();return{signup:async({fullName:u,username:b,password:n,confirmPassword:g,age:r})=>{if(!u||!b||!n||!g||!r){N.error("Please fill all fields");return}if(n!==g){N.error("Passwords don't match");return}c(!0);try{const d=await Y("/api/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fullName:u,username:b,password:n,confirmPassword:g,age:parseInt(r)})}),t=await d.json();if(!d.ok)throw new Error(t.error||"Signup failed");if(t.error)throw new Error(t.error);localStorage.setItem("chat-user",JSON.stringify(t)),localStorage.setItem("token",t.token),f(t),N.success("Account created successfully!")}catch(d){N.error(d.message)}finally{c(!1)}},loading:s}},H=()=>{const[s,c]=i.useState({fullName:"",username:"",password:"",confirmPassword:"",age:""}),[f,v]=i.useState(!1),[u,b]=i.useState(!1),[n,g]=i.useState({}),[r,d]=i.useState({}),[t,A]=i.useState(!1),[m,I]=i.useState({score:0,text:"",color:"",width:"0%"}),[z,U]=i.useState(!1),{loading:j,signup:$}=X(),E=a=>{let l=0;return a.length>=6&&l++,a.length>=10&&l++,/[A-Z]/.test(a)&&l++,/[0-9]/.test(a)&&l++,/[^A-Za-z0-9]/.test(a)&&l++,{score:l,...{0:{text:"Very Weak",color:"bg-red-500",width:"10%"},1:{text:"Weak",color:"bg-orange-500",width:"25%"},2:{text:"Fair",color:"bg-yellow-500",width:"40%"},3:{text:"Good",color:"bg-blue-500",width:"60%"},4:{text:"Strong",color:"bg-green-500",width:"80%"},5:{text:"Very Strong",color:"bg-emerald-500",width:"100%"}}[l]}};i.useEffect(()=>{const a={};if((r.fullName||t)&&(s.fullName.trim()?s.fullName.trim().length<2?a.fullName="Name must be at least 2 characters":s.fullName.trim().length>50?a.fullName="Name is too long":/^[a-zA-Z\s]+$/.test(s.fullName)||(a.fullName="Name can only contain letters and spaces"):a.fullName="Full name is required"),(r.username||t)&&(s.username.trim()?s.username.length<3?a.username="Username must be at least 3 characters":s.username.length>20?a.username="Username must be less than 20 characters":/^[a-zA-Z0-9_]+$/.test(s.username)||(a.username="Only letters, numbers, and underscores"):a.username="Username is required"),(r.password||t)&&(s.password?s.password.length<6?a.password="Password must be at least 6 characters":s.password.length>50&&(a.password="Password is too long"):a.password="Password is required"),(r.confirmPassword||t)&&(s.confirmPassword?s.password!==s.confirmPassword&&(a.confirmPassword="Passwords don't match"):a.confirmPassword="Please confirm your password"),r.age||t)if(!s.age)a.age="Age is required";else{const l=parseInt(s.age);isNaN(l)?a.age="Please enter a valid age":l<13?a.age="You must be at least 13 years old":l>120&&(a.age="Please enter a valid age (13-120)")}g(a),s.password&&I(E(s.password)),U(s.fullName.trim().length>=2&&/^[a-zA-Z\s]+$/.test(s.fullName)&&s.username.trim().length>=3&&/^[a-zA-Z0-9_]+$/.test(s.username)&&s.password.length>=6&&s.password===s.confirmPassword&&parseInt(s.age)>=13&&parseInt(s.age)<=120&&Object.keys(a).length===0)},[s,r,t]);const h=a=>{d({...r,[a]:!0})},M=async a=>{a.preventDefault(),A(!0),d({fullName:!0,username:!0,password:!0,confirmPassword:!0,age:!0}),z&&await $(s)},o=a=>r[a]||t?n[a]?"error":"success":null,p=a=>{const l=o(a);let w="w-full pl-10 pr-10 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 outline-none";return l==="error"&&(w+=" border-red-500 bg-red-50 dark:bg-red-950/20"),l==="success"&&(w+=" border-green-500 focus:border-green-500"),n[a]&&(r[a]||t)&&(w+=" error-shake"),w},B=()=>m.score<=1?e.jsx(J,{className:"w-3 h-3 text-red-500"}):m.score<=3?e.jsx(Z,{className:"w-3 h-3 text-yellow-500"}):e.jsx(D,{className:"w-3 h-3 text-green-500"});return e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4 overflow-y-auto",children:[e.jsx("div",{className:"w-full max-w-md my-8 animate-slide-up",children:e.jsxs("div",{className:"relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8",children:[e.jsx("div",{className:"absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float"}),e.jsx("div",{className:"absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-float",style:{animationDelay:"2s"}}),e.jsxs("div",{className:"relative text-center mb-6",children:[e.jsx("div",{className:"inline-flex p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg mb-4 animate-scale-in",children:e.jsx(k,{className:"w-8 h-8 text-white"})}),e.jsx("h1",{className:"text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent",children:"Create Account"}),e.jsx("p",{className:"text-gray-500 dark:text-gray-400 mt-2",children:"Join our community today"})]}),e.jsxs("form",{onSubmit:M,className:"relative space-y-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Full Name"}),e.jsxs("div",{className:"relative",children:[e.jsx(O,{className:`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${o("fullName")==="error"?"text-red-400":o("fullName")==="success"?"text-green-500":"text-gray-400"}`}),e.jsx("input",{type:"text",placeholder:"John Doe",className:p("fullName"),value:s.fullName,onChange:a=>c({...s,fullName:a.target.value}),onBlur:()=>h("fullName")}),o("fullName")==="success"&&e.jsx(x,{className:"absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in"})]}),n.fullName&&(r.fullName||t)&&e.jsxs("p",{className:"text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(y,{className:"w-3 h-3"}),n.fullName]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Username"}),e.jsxs("div",{className:"relative",children:[e.jsx(T,{className:`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${o("username")==="error"?"text-red-400":o("username")==="success"?"text-green-500":"text-gray-400"}`}),e.jsx("input",{type:"text",placeholder:"@username",className:p("username"),value:s.username,onChange:a=>c({...s,username:a.target.value}),onBlur:()=>h("username")}),o("username")==="success"&&e.jsx(x,{className:"absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in"})]}),n.username&&(r.username||t)&&e.jsxs("p",{className:"text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(y,{className:"w-3 h-3"}),n.username]}),r.username&&!n.username&&s.username.length>=3&&e.jsxs("p",{className:"text-green-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(x,{className:"w-3 h-3"}),"Username is available"]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(q,{className:`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${o("password")==="error"?"text-red-400":o("password")==="success"?"text-green-500":"text-gray-400"}`}),e.jsx("input",{type:f?"text":"password",placeholder:"Create a strong password",className:p("password"),value:s.password,onChange:a=>c({...s,password:a.target.value}),onBlur:()=>h("password")}),e.jsx("button",{type:"button",onClick:()=>v(!f),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10",children:f?e.jsx(P,{className:"w-4 h-4"}):e.jsx(S,{className:"w-4 h-4"})})]}),s.password&&(r.password||t)&&e.jsxs("div",{className:"space-y-1 mt-2 animate-fade-in",children:[e.jsxs("div",{className:"flex items-center justify-between text-xs",children:[e.jsxs("span",{className:"flex items-center gap-1",children:[B(),e.jsx("span",{className:"text-gray-600 dark:text-gray-400",children:"Password Strength:"})]}),e.jsx("span",{className:`font-semibold ${m.score<=1?"text-red-500":m.score<=3?"text-yellow-500":"text-green-500"}`,children:m.text})]}),e.jsx("div",{className:"h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",children:e.jsx("div",{className:`h-full ${m.color} transition-all duration-500 rounded-full`,style:{width:m.width}})}),e.jsxs("div",{className:"flex justify-between text-[10px] text-gray-400 mt-1",children:[e.jsx("span",{children:"6+ chars"}),e.jsx("span",{children:"Uppercase"}),e.jsx("span",{children:"Number"}),e.jsx("span",{children:"Special"})]})]}),n.password&&(r.password||t)&&e.jsxs("p",{className:"text-red-500 text-xs flex items-center gap-1 mt-1 animate-fade-in",children:[e.jsx(y,{className:"w-3 h-3"}),n.password]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Confirm Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(x,{className:`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${o("confirmPassword")==="error"?"text-red-400":o("confirmPassword")==="success"?"text-green-500":"text-gray-400"}`}),e.jsx("input",{type:u?"text":"password",placeholder:"Confirm your password",className:p("confirmPassword"),value:s.confirmPassword,onChange:a=>c({...s,confirmPassword:a.target.value}),onBlur:()=>h("confirmPassword")}),e.jsx("button",{type:"button",onClick:()=>b(!u),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10",children:u?e.jsx(P,{className:"w-4 h-4"}):e.jsx(S,{className:"w-4 h-4"})})]}),n.confirmPassword&&(r.confirmPassword||t)&&e.jsxs("p",{className:"text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(y,{className:"w-3 h-3"}),n.confirmPassword]}),r.confirmPassword&&!n.confirmPassword&&s.confirmPassword&&s.password===s.confirmPassword&&e.jsxs("p",{className:"text-green-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(x,{className:"w-3 h-3"}),"Passwords match"]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Age"}),e.jsxs("div",{className:"relative",children:[e.jsx(V,{className:`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${o("age")==="error"?"text-red-400":o("age")==="success"?"text-green-500":"text-gray-400"}`}),e.jsx("input",{type:"number",placeholder:"18",min:"13",max:"120",className:p("age"),value:s.age,onChange:a=>c({...s,age:a.target.value}),onBlur:()=>h("age")}),o("age")==="success"&&e.jsx(x,{className:"absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in"})]}),n.age&&(r.age||t)&&e.jsxs("p",{className:"text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(y,{className:"w-3 h-3"}),n.age]})]}),e.jsxs("button",{type:"submit",disabled:j,className:"relative overflow-hidden bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] w-full mt-6 group",children:[e.jsx("span",{className:"relative z-10 flex items-center justify-center gap-2",children:j?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"}),e.jsx("span",{children:"Creating account..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(k,{className:"w-4 h-4"}),e.jsx("span",{children:"Create Account"})]})}),!j&&e.jsx("div",{className:"absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500"})]}),e.jsxs("p",{className:"text-center text-sm text-gray-600 dark:text-gray-400 mt-4",children:["Already have an account?"," ",e.jsx(L,{to:"/login",className:"text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-all hover:scale-105 inline-block",children:"Sign in"})]})]})]})}),e.jsx("style",{jsx:!0,children:`
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        .error-shake {
          animation: errorShake 0.5s ease-in-out;
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        input:focus {
          border-color: #6366f1;
          ring: 4px solid rgba(99, 102, 241, 0.2);
        }

        input.error:focus {
          ring-color: rgba(239, 68, 68, 0.2);
        }

        /* Remove number input spinners */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `})]})};export{H as default};
