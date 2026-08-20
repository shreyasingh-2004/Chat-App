import{r as l,u as E,c as A,j as e,L as P}from"./index-CxciGOYN.js";import{c as v,z as f,a as h,C as y}from"./index-BbAzW9jL.js";import{M as U,L as z,E as M,a as O}from"./mail-BuhHXBxn.js";/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Y=v("LogIn",[["path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",key:"u53s6r"}],["polyline",{points:"10 17 15 12 10 7",key:"1ail0h"}],["line",{x1:"15",x2:"3",y1:"12",y2:"12",key:"v6grx8"}]]);/**
 * @license lucide-react v0.383.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const B=v("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]),T=()=>{const[t,m]=l.useState(!1),{setAuthUser:r}=E();return{loading:t,login:async(d,u)=>{if(!d||!u)return f.error("Please fill all fields"),!1;m(!0);try{const o=await(await A("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:d,password:u})})).json();if(o.error)throw new Error(o.error);return localStorage.setItem("chat-user",JSON.stringify(o)),localStorage.setItem("token",o.token),r(o),f.success("Login successful!"),!0}catch(s){return f.error(s.message),!1}finally{m(!1)}}}},D=()=>{const[t,m]=l.useState(""),[r,w]=l.useState(""),[d,u]=l.useState(!1),[s,o]=l.useState({}),[n,b]=l.useState({}),[N,S]=l.useState(!1),[c,L]=l.useState(!1),{loading:g,login:I}=T();l.useEffect(()=>{const a={};(n.username||c)&&(t.trim()?t.length<3?a.username="Username must be at least 3 characters":t.length>20?a.username="Username must be less than 20 characters":/^[a-zA-Z0-9_]+$/.test(t)||(a.username="Only letters, numbers, and underscores"):a.username="Username is required"),(n.password||c)&&(r?r.length<6?a.password="Password must be at least 6 characters":r.length>50&&(a.password="Password is too long"):a.password="Password is required"),o(a),S(t.trim().length>=3&&/^[a-zA-Z0-9_]+$/.test(t)&&r.length>=6&&Object.keys(a).length===0)},[t,r,n,c]);const j=a=>{b({...n,[a]:!0})},C=async a=>{a.preventDefault(),L(!0),b({username:!0,password:!0}),N&&await I(t,r)},i=a=>n[a]||c?s[a]?"error":"success":null,k=a=>{const p=i(a);let x="w-full pl-10 pr-10 py-3 rounded-xl border-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 outline-none";return p==="error"&&(x+=" border-red-500 bg-red-50 dark:bg-red-950/20"),p==="success"&&(x+=" border-green-500 focus:border-green-500"),s[a]&&(n[a]||c)&&(x+=" error-shake"),x};return e.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4",children:[e.jsx("div",{className:"w-full max-w-md animate-slide-up",children:e.jsxs("div",{className:"relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8",children:[e.jsx("div",{className:"absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float"}),e.jsx("div",{className:"absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-float",style:{animationDelay:"2s"}}),e.jsxs("div",{className:"relative text-center mb-8",children:[e.jsx("div",{className:"inline-flex p-3 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg mb-4 animate-scale-in",children:e.jsx(B,{className:"w-8 h-8 text-white"})}),e.jsx("h1",{className:"text-4xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent",children:"Welcome Back"}),e.jsx("p",{className:"text-gray-500 dark:text-gray-400 mt-2",children:"Sign in to continue your journey"})]}),e.jsxs("form",{onSubmit:C,className:"relative space-y-5",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Username"}),e.jsxs("div",{className:"relative",children:[e.jsx(U,{className:`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${i("username")==="error"?"text-red-400":i("username")==="success"?"text-green-500":"text-gray-400"}`}),e.jsx("input",{type:"text",placeholder:"Enter your username",className:k("username"),value:t,onChange:a=>{m(a.target.value),s.username&&o({...s,username:""})},onBlur:()=>j("username")}),i("username")==="success"&&e.jsx(h,{className:"absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in"}),i("username")==="error"&&e.jsx(y,{className:"absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 animate-scale-in"})]}),s.username&&(n.username||c)&&e.jsxs("p",{className:"text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(y,{className:"w-3 h-3"}),s.username]}),n.username&&!s.username&&t.length>0&&e.jsxs("p",{className:"text-green-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(h,{className:"w-3 h-3"}),"Username looks good!"]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 dark:text-gray-300",children:"Password"}),e.jsxs("div",{className:"relative",children:[e.jsx(z,{className:`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200
                  ${i("password")==="error"?"text-red-400":i("password")==="success"?"text-green-500":"text-gray-400"}`}),e.jsx("input",{type:d?"text":"password",placeholder:"Enter your password",className:k("password"),value:r,onChange:a=>{w(a.target.value),s.password&&o({...s,password:""})},onBlur:()=>j("password")}),e.jsx("button",{type:"button",onClick:()=>u(!d),className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10",children:d?e.jsx(M,{className:"w-4 h-4"}):e.jsx(O,{className:"w-4 h-4"})}),i("password")==="success"&&e.jsx(h,{className:"absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-scale-in"})]}),s.password&&(n.password||c)&&e.jsxs("p",{className:"text-red-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(y,{className:"w-3 h-3"}),s.password]}),n.password&&!s.password&&r.length>=6&&e.jsxs("p",{className:"text-green-500 text-xs flex items-center gap-1 animate-fade-in mt-1",children:[e.jsx(h,{className:"w-3 h-3"}),"Password is valid"]})]}),e.jsxs("button",{type:"submit",disabled:g,className:"relative overflow-hidden bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] w-full mt-6 group",children:[e.jsx("span",{className:"relative z-10 flex items-center justify-center gap-2",children:g?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"}),e.jsx("span",{children:"Signing in..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(Y,{className:"w-4 h-4"}),e.jsx("span",{children:"Sign In"})]})}),!g&&e.jsx("div",{className:"absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500"})]}),e.jsxs("p",{className:"text-center text-sm text-gray-600 dark:text-gray-400 mt-4",children:["Don't have an account?"," ",e.jsx(P,{to:"/signup",className:"text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-all hover:scale-105 inline-block",children:"Create account"})]})]})]})}),e.jsx("style",{jsx:!0,children:`
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
      `})]})};export{D as default};
