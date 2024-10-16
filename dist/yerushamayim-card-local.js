!function(){
/**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
const t=window,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&'adoptedStyleSheets'in Document.prototype&&'replace'in CSSStyleSheet.prototype,i=Symbol(),s=new WeakMap;class n{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=s.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&s.set(i,t))}return t}toString(){return this.cssText}}const o=(t,...e)=>{const s=1===t.length?t[0]:e.reduce(((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if('number'==typeof t)return t;throw Error('Value passed to \'css\' function must be a \'css\' function result: '+t+'. Use \'unsafeCSS\' to pass non-literal values, but take care to ensure page security.')})(i)+t[s+1]),t[0]);return new n(s,t,i)},r=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e='';for(const i of t.cssRules)e+=i.cssText;return(t=>new n('string'==typeof t?t:t+'',void 0,i))(e)})(t):t
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */;var A;const a=window,l=a.trustedTypes,d=l?l.emptyScript:'',h=a.reactiveElementPolyfillSupport,c={toAttribute(t,e){switch(e){case Boolean:t=t?d:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},p=(t,e)=>e!==t&&(e==e||t==t),u={attribute:!0,type:String,converter:c,reflect:!1,hasChanged:p};class v extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u()}static addInitializer(t){var e;null!==(e=this.h)&&void 0!==e||(this.h=[]),this.h.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((e,i)=>{const s=this._$Ep(i,e);void 0!==s&&(this._$Ev.set(s,i),t.push(s))})),t}static createProperty(t,e=u){if(e.state&&(e.attribute=!1),this.finalize(),this.elementProperties.set(t,e),!e.noAccessor&&!this.prototype.hasOwnProperty(t)){const i='symbol'==typeof t?Symbol():'__'+t,s=this.getPropertyDescriptor(t,i,e);void 0!==s&&Object.defineProperty(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(s){const n=this[t];this[e]=s,this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||u}static finalize(){if(this.hasOwnProperty('finalized'))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty('properties')){const t=this.properties,e=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const i of e)this.createProperty(i,t[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Ep(t,e){const i=e.attribute;return!1===i?void 0:'string'==typeof i?i:'string'==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)))}addController(t){var e,i;(null!==(e=this._$ES)&&void 0!==e?e:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(i=t.hostConnected)||void 0===i||i.call(t))}removeController(t){var e;null===(e=this._$ES)||void 0===e||e.splice(this._$ES.indexOf(t)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach(((t,e)=>{this.hasOwnProperty(e)&&(this._$Ei.set(e,this[e]),delete this[e])}))}createRenderRoot(){var i;const s=null!==(i=this.shadowRoot)&&void 0!==i?i:this.attachShadow(this.constructor.shadowRootOptions);return((i,s)=>{e?i.adoptedStyleSheets=s.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):s.forEach((e=>{const s=document.createElement('style'),n=t.litNonce;void 0!==n&&s.setAttribute('nonce',n),s.textContent=e.cssText,i.appendChild(s)}))})(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostConnected)||void 0===e?void 0:e.call(t)}))}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostDisconnected)||void 0===e?void 0:e.call(t)}))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$EO(t,e,i=u){var s;const n=this.constructor._$Ep(t,i);if(void 0!==n&&!0===i.reflect){const o=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:c).toAttribute(e,i.type);this._$El=t,null==o?this.removeAttribute(n):this.setAttribute(n,o),this._$El=null}}_$AK(t,e){var i;const s=this.constructor,n=s._$Ev.get(t);if(void 0!==n&&this._$El!==n){const t=s.getPropertyOptions(n),o='function'==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(i=t.converter)||void 0===i?void 0:i.fromAttribute)?t.converter:c;this._$El=n,this[n]=o.fromAttribute(e,t.type),this._$El=null}}requestUpdate(t,e,i){let s=!0;void 0!==t&&(((i=i||this.constructor.getPropertyOptions(t)).hasChanged||p)(this[t],e)?(this._$AL.has(t)||this._$AL.set(t,e),!0===i.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,e)=>this[e]=t)),this._$Ei=void 0);let e=!1;const i=this._$AL;try{e=this.shouldUpdate(i),e?(this.willUpdate(i),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var e;return null===(e=t.hostUpdate)||void 0===e?void 0:e.call(t)})),this.update(i)):this._$Ek()}catch(t){throw e=!1,this._$Ek(),t}e&&this._$AE(i)}willUpdate(t){}_$AE(t){var e;null===(e=this._$ES)||void 0===e||e.forEach((t=>{var e;return null===(e=t.hostUpdated)||void 0===e?void 0:e.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return!0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,e)=>this._$EO(e,this[e],t))),this._$EC=void 0),this._$Ek()}updated(t){}firstUpdated(t){}}
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
var g;v.finalized=!0,v.elementProperties=new Map,v.elementStyles=[],v.shadowRootOptions={mode:'open'},null==h||h({ReactiveElement:v}),(null!==(A=a.reactiveElementVersions)&&void 0!==A?A:a.reactiveElementVersions=[]).push('1.4.1');const m=window,f=m.trustedTypes,y=f?f.createPolicy('lit-html',{createHTML:t=>t}):void 0,b=`lit$${(Math.random()+'').slice(9)}$`,C='?'+b,w=`<${C}>`,B=document,x=(t='')=>B.createComment(t),E=t=>null===t||'object'!=typeof t&&'function'!=typeof t,T=Array.isArray,S=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,R=/>/g,V=RegExp('>|[ \t\n\f\r](?:([^\\s"\'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r"\'`<>=]|("|\')|))|$)','g'),U=/'/g,O=/"/g,P=/^(?:script|style|textarea|title)$/i,Z=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),L=Symbol.for('lit-noChange'),Y=Symbol.for('lit-nothing'),G=new WeakMap,I=B.createTreeWalker(B,129,null,!1),H=(t,e)=>{const i=t.length-1,s=[];let n,o=2===e?'<svg>':'',r=S;for(let e=0;e<i;e++){const i=t[e];let A,a,l=-1,d=0;for(;d<i.length&&(r.lastIndex=d,a=r.exec(i),null!==a);)d=r.lastIndex,r===S?'!--'===a[1]?r=N:void 0!==a[1]?r=R:void 0!==a[2]?(P.test(a[2])&&(n=RegExp('</'+a[2],'g')),r=V):void 0!==a[3]&&(r=V):r===V?'>'===a[0]?(r=null!=n?n:S,l=-1):void 0===a[1]?l=-2:(l=r.lastIndex-a[2].length,A=a[1],r=void 0===a[3]?V:'"'===a[3]?O:U):r===O||r===U?r=V:r===N||r===R?r=S:(r=V,n=void 0);const h=r===V&&t[e+1].startsWith('/>')?' ':'';o+=r===S?i+w:l>=0?(s.push(A),i.slice(0,l)+'$lit$'+i.slice(l)+b+h):i+b+(-2===l?(s.push(void 0),e):h)}const A=o+(t[i]||'<?>')+(2===e?'</svg>':'');if(!Array.isArray(t)||!t.hasOwnProperty('raw'))throw Error('invalid template strings array');return[void 0!==y?y.createHTML(A):A,s]};class Q{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,o=0;const r=t.length-1,A=this.parts,[a,l]=H(t,e);if(this.el=Q.createElement(a,i),I.currentNode=this.el.content,2===e){const t=this.el.content,e=t.firstChild;e.remove(),t.append(...e.childNodes)}for(;null!==(s=I.nextNode())&&A.length<r;){if(1===s.nodeType){if(s.hasAttributes()){const t=[];for(const e of s.getAttributeNames())if(e.endsWith('$lit$')||e.startsWith(b)){const i=l[o++];if(t.push(e),void 0!==i){const t=s.getAttribute(i.toLowerCase()+'$lit$').split(b),e=/([.?@])?(.*)/.exec(i);A.push({type:1,index:n,name:e[2],strings:t,ctor:'.'===e[1]?q:'?'===e[1]?F:'@'===e[1]?M:z})}else A.push({type:6,index:n})}for(const e of t)s.removeAttribute(e)}if(P.test(s.tagName)){const t=s.textContent.split(b),e=t.length-1;if(e>0){s.textContent=f?f.emptyScript:'';for(let i=0;i<e;i++)s.append(t[i],x()),I.nextNode(),A.push({type:2,index:++n});s.append(t[e],x())}}}else if(8===s.nodeType)if(s.data===C)A.push({type:2,index:n});else{let t=-1;for(;-1!==(t=s.data.indexOf(b,t+1));)A.push({type:7,index:n}),t+=b.length-1}n++}}static createElement(t,e){const i=B.createElement('template');return i.innerHTML=t,i}}function D(t,e,i=t,s){var n,o,r,A;if(e===L)return e;let a=void 0!==s?null===(n=i._$Cl)||void 0===n?void 0:n[s]:i._$Cu;const l=E(e)?void 0:e._$litDirective$;return(null==a?void 0:a.constructor)!==l&&(null===(o=null==a?void 0:a._$AO)||void 0===o||o.call(a,!1),void 0===l?a=void 0:(a=new l(t),a._$AT(t,i,s)),void 0!==s?(null!==(r=(A=i)._$Cl)&&void 0!==r?r:A._$Cl=[])[s]=a:i._$Cu=a),void 0!==a&&(e=D(t,a._$AS(t,e.values),a,s)),e}class K{constructor(t,e){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var e;const{el:{content:i},parts:s}=this._$AD,n=(null!==(e=null==t?void 0:t.creationScope)&&void 0!==e?e:B).importNode(i,!0);I.currentNode=n;let o=I.nextNode(),r=0,A=0,a=s[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new k(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new $(o,this,t)),this.v.push(e),a=s[++A]}r!==(null==a?void 0:a.index)&&(o=I.nextNode(),r++)}return n}m(t){let e=0;for(const i of this.v)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class k{constructor(t,e,i,s){var n;this.type=2,this._$AH=Y,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$C_=null===(n=null==s?void 0:s.isConnected)||void 0===n||n}get _$AU(){var t,e;return null!==(e=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==e?e:this._$C_}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=D(this,t,e),E(t)?t===Y||null==t||''===t?(this._$AH!==Y&&this._$AR(),this._$AH=Y):t!==this._$AH&&t!==L&&this.$(t):void 0!==t._$litType$?this.T(t):void 0!==t.nodeType?this.k(t):(t=>T(t)||'function'==typeof(null==t?void 0:t[Symbol.iterator]))(t)?this.O(t):this.$(t)}S(t,e=this._$AB){return this._$AA.parentNode.insertBefore(t,e)}k(t){this._$AH!==t&&(this._$AR(),this._$AH=this.S(t))}$(t){this._$AH!==Y&&E(this._$AH)?this._$AA.nextSibling.data=t:this.k(B.createTextNode(t)),this._$AH=t}T(t){var e;const{values:i,_$litType$:s}=t,n='number'==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Q.createElement(s.h,this.options)),s);if((null===(e=this._$AH)||void 0===e?void 0:e._$AD)===n)this._$AH.m(i);else{const t=new K(n,this),e=t.p(this.options);t.m(i),this.k(e),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new Q(t)),e}O(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const n of t)s===e.length?e.push(i=new k(this.S(x()),this.S(x()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var e;void 0===this._$AM&&(this._$C_=t,null===(e=this._$AP)||void 0===e||e.call(this,t))}}class z{constructor(t,e,i,s,n){this.type=1,this._$AH=Y,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||''!==i[0]||''!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Y}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,e=this,i,s){const n=this.strings;let o=!1;if(void 0===n)t=D(this,t,e,0),o=!E(t)||t!==this._$AH&&t!==L,o&&(this._$AH=t);else{const s=t;let r,A;for(t=n[0],r=0;r<n.length-1;r++)A=D(this,s[i+r],e,r),A===L&&(A=this._$AH[r]),o||(o=!E(A)||A!==this._$AH[r]),A===Y?t=Y:t!==Y&&(t+=(null!=A?A:'')+n[r+1]),this._$AH[r]=A}o&&!s&&this.P(t)}P(t){t===Y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:'')}}class q extends z{constructor(){super(...arguments),this.type=3}P(t){this.element[this.name]=t===Y?void 0:t}}const X=f?f.emptyScript:'';class F extends z{constructor(){super(...arguments),this.type=4}P(t){t&&t!==Y?this.element.setAttribute(this.name,X):this.element.removeAttribute(this.name)}}class M extends z{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){var i;if((t=null!==(i=D(this,t,e,0))&&void 0!==i?i:Y)===L)return;const s=this._$AH,n=t===Y&&s!==Y||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==Y&&(s===Y||n);n&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e,i;'function'==typeof this._$AH?this._$AH.call(null!==(i=null===(e=this.options)||void 0===e?void 0:e.host)&&void 0!==i?i:this.element,t):this._$AH.handleEvent(t)}}class ${constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){D(this,t)}}const J=m.litHtmlPolyfillSupport;
/**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   */
var W,_;null==J||J(Q,k),(null!==(g=m.litHtmlVersions)&&void 0!==g?g:m.litHtmlVersions=[]).push('2.3.1');class j extends v{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{var s,n;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:e;let r=o._$litPart$;if(void 0===r){const t=null!==(n=null==i?void 0:i.renderBefore)&&void 0!==n?n:null;o._$litPart$=r=new k(e.insertBefore(x(),t),t,void 0,null!=i?i:{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1)}render(){return L}}j.finalized=!0,j._$litElement$=!0,null===(W=globalThis.litElementHydrateSupport)||void 0===W||W.call(globalThis,{LitElement:j});const tt=globalThis.litElementPolyfillSupport;null==tt||tt({LitElement:j}),(null!==(_=globalThis.litElementVersions)&&void 0!==_?_:globalThis.litElementVersions=[]).push('3.2.2');var et='data:image/png;base64,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';!function(t){const e=document.createElement('link');e.type='text/css',e.rel='stylesheet',e.href=t,document.head.appendChild(e)}('https://fonts.googleapis.com/css2?family=Rubik&display=swap');customElements.define('yerushamayim-card',class extends j{static get properties(){return{hass:{},config:{}}}render(){const t=this.config.entity,e=this.hass.states[t],i=e?e.state:'unavailable',s=(this.hass.states['sun.sun'].state,et);return Z`
      <ha-card>
        <div class="container">
        ${'unavailable'!==i&&null!==e.attributes.current_temp?Z`
              <div id="left">
                <div id="status-container">
                  ${e.attributes.status_icon?Z`<div>
                      <img class="icon" src="${e.attributes.status_icon}" title="${e.attributes.status_icon_info}">
                    </div>
                    <div id="icon-info" dir="rtl">
                      <bdi>${e.attributes.status_title}</bdi>
                    </div>
                    `:Z``}
                </div>
                <div>
                  <div class="forecast-icon">
                    <img src="${'data:image/png;base64,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'}">
                    <img src="${'data:image/png;base64,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'}">
                    <img src="${'data:image/png;base64,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'}">
                  </div>
                  <div class="forecast-icon">
                    <bdi>${e.attributes.night_temp} °C</bdi>
                    <bdi>${e.attributes.noon_temp} °C</bdi>
                    <bdi>${e.attributes.morning_temp} °C</bdi>
                  </div>
                  <div class="forecast-icon">
                    <img src="${e.attributes.night_cloth_icon}" title="${e.attributes.night_cloth_info}">
                    <img src="${e.attributes.noon_cloth_icon}" title="${e.attributes.noon_cloth_info}">
                    <img src="${e.attributes.morning_cloth_icon}" title="${e.attributes.morning_cloth_info}">
                  </div>
                </div>
              </div>
              <div id="right" dir="rtl">
                <img class="logo" src="${s}">
                <div class="block" id="current-temp">
                  <bdi>
                    ${e.attributes.current_temp}
                    <span>°C </span>
                  </bdi>
                </div>
                ${e.attributes.feels_like_temp?Z`<div class="block">
                    <span>מרגיש כמו: </span>
                    <bdi>${e.attributes.feels_like_temp} °C</bdi>
                  </div>`:Z`<div class="block">
                    <span>מרגיש כמו: </span>
                    <bdi>${e.attributes.current_temp} °C</bdi>
                  </div>`}
                <div>
                  <bdi>${e.attributes.forecast_text}</bdi>
                </div>
              </div>
            `:Z`No data to show`}
        </div>
      </ha-card>
    `}setConfig(t){if(!t.entity)throw new Error('You need to define an entity');this.config=t}getCardSize(){return 3}static get styles(){return o`
      :host {
        font-family: "Rubik", Arial;
      }
      .container {
        background: linear-gradient(180deg, #3b4d5b 0%, #5e6d97 100%);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var( --ha-card-box-shadow, 0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12) );
        padding: 16px;
        font-size: 16px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
      }
      #left {
        display: flex;
        flex-direction: column;
        flex-basis: 45%;
      }
      #status-container {
        min-height: 105px;
      }
      img.icon {
        height: 60px;
        padding-bottom: 5px;
      }
      #icon-info {
        text-align: left;
        margin-bottom: 15px;
      }
      #forecast-icons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
      }
      .forecast-icon {
        flex-direction: row;
        justify-content: space-between;
        display: flex;
        align-items: center;
      }
      .forecast-icon:not(:last-child) {
        margin-bottom: 5px;
      }
      img.logo {
        width: 50px;
        margin-bottom: 10px;
        filter: brightness(0) invert(1);
      }
      #right {
        flex-basis: 55%;
      }
      .block {
        margin-bottom: 10px;
      }
      #current-temp {
        font-size: 24px;
      }
    `}}),window.customCards=window.customCards||[],window.customCards.push({type:'yerushamayim-card',name:'Yerushamayim Weather Card',preview:!0,description:'Unofficial Yerushamayim Home Assistant dashboard card',documentationURL:'https://github.com/chilikla/yerushamayim-card'})}();
