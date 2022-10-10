import * as adapter from '@astrojs/vercel/serverless/entrypoint';
import React, { createElement } from 'react';
import ReactDOM from 'react-dom/server';
import { escape } from 'html-escaper';
/* empty css                        */import 'mime';
import 'kleur/colors';
import 'string-width';
import 'path-browserify';
import { compile } from 'path-to-regexp';

/**
 * Astro passes `children` as a string of HTML, so we need
 * a wrapper `div` to render that content as VNodes.
 *
 * As a bonus, we can signal to React that this subtree is
 * entirely static and will never change via `shouldComponentUpdate`.
 */
const StaticHtml = ({ value, name }) => {
	if (!value) return null;
	return createElement('astro-slot', {
		name,
		suppressHydrationWarning: true,
		dangerouslySetInnerHTML: { __html: value },
	});
};

/**
 * This tells React to opt-out of re-rendering this subtree,
 * In addition to being a performance optimization,
 * this also allows other frameworks to attach to `children`.
 *
 * See https://preactjs.com/guide/v8/external-dom-mutations
 */
StaticHtml.shouldComponentUpdate = () => false;

const slotName$1 = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
const reactTypeof = Symbol.for('react.element');

function errorIsComingFromPreactComponent(err) {
	return (
		err.message &&
		(err.message.startsWith("Cannot read property '__H'") ||
			err.message.includes("(reading '__H')"))
	);
}

async function check$1(Component, props, children) {
	// Note: there are packages that do some unholy things to create "components".
	// Checking the $$typeof property catches most of these patterns.
	if (typeof Component === 'object') {
		const $$typeof = Component['$$typeof'];
		return $$typeof && $$typeof.toString().slice('Symbol('.length).startsWith('react');
	}
	if (typeof Component !== 'function') return false;

	if (Component.prototype != null && typeof Component.prototype.render === 'function') {
		return React.Component.isPrototypeOf(Component) || React.PureComponent.isPrototypeOf(Component);
	}

	let error = null;
	let isReactComponent = false;
	function Tester(...args) {
		try {
			const vnode = Component(...args);
			if (vnode && vnode['$$typeof'] === reactTypeof) {
				isReactComponent = true;
			}
		} catch (err) {
			if (!errorIsComingFromPreactComponent(err)) {
				error = err;
			}
		}

		return React.createElement('div');
	}

	await renderToStaticMarkup$1(Tester, props, children, {});

	if (error) {
		throw error;
	}
	return isReactComponent;
}

async function getNodeWritable() {
	let nodeStreamBuiltinModuleName = 'stream';
	let { Writable } = await import(/* @vite-ignore */ nodeStreamBuiltinModuleName);
	return Writable;
}

async function renderToStaticMarkup$1(Component, props, { default: children, ...slotted }, metadata) {
	delete props['class'];
	const slots = {};
	for (const [key, value] of Object.entries(slotted)) {
		const name = slotName$1(key);
		slots[name] = React.createElement(StaticHtml, { value, name });
	}
	// Note: create newProps to avoid mutating `props` before they are serialized
	const newProps = {
		...props,
		...slots,
	};
	if (children != null) {
		newProps.children = React.createElement(StaticHtml, { value: children });
	}
	const vnode = React.createElement(Component, newProps);
	let html;
	if (metadata && metadata.hydrate) {
		html = ReactDOM.renderToString(vnode);
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToPipeableStreamAsync(vnode);
		}
	} else {
		if ('renderToReadableStream' in ReactDOM) {
			html = await renderToReadableStreamAsync(vnode);
		} else {
			html = await renderToStaticNodeStreamAsync(vnode);
		}
	}
	return { html };
}

async function renderToPipeableStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve, reject) => {
		let error = undefined;
		let stream = ReactDOM.renderToPipeableStream(vnode, {
			onError(err) {
				error = err;
				reject(error);
			},
			onAllReady() {
				stream.pipe(
					new Writable({
						write(chunk, _encoding, callback) {
							html += chunk.toString('utf-8');
							callback();
						},
						destroy() {
							resolve(html);
						},
					})
				);
			},
		});
	});
}

async function renderToStaticNodeStreamAsync(vnode) {
	const Writable = await getNodeWritable();
	let html = '';
	return new Promise((resolve) => {
		let stream = ReactDOM.renderToStaticNodeStream(vnode);
		stream.pipe(
			new Writable({
				write(chunk, _encoding, callback) {
					html += chunk.toString('utf-8');
					callback();
				},
				destroy() {
					resolve(html);
				},
			})
		);
	});
}

/**
 * Use a while loop instead of "for await" due to cloudflare and Vercel Edge issues
 * See https://github.com/facebook/react/issues/24169
 */
async function readResult(stream) {
	const reader = stream.getReader();
	let result = '';
	const decoder = new TextDecoder('utf-8');
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			if (value) {
				result += decoder.decode(value);
			} else {
				// This closes the decoder
				decoder.decode(new Uint8Array());
			}

			return result;
		}
		result += decoder.decode(value, { stream: true });
	}
}

async function renderToReadableStreamAsync(vnode) {
	return await readResult(await ReactDOM.renderToReadableStream(vnode));
}

const _renderer1 = {
	check: check$1,
	renderToStaticMarkup: renderToStaticMarkup$1,
};

const ASTRO_VERSION = "1.1.5";
function createDeprecatedFetchContentFn() {
  return () => {
    throw new Error("Deprecated: Astro.fetchContent() has been replaced with Astro.glob().");
  };
}
function createAstroGlobFn() {
  const globHandler = (importMetaGlobResult, globValue) => {
    let allEntries = [...Object.values(importMetaGlobResult)];
    if (allEntries.length === 0) {
      throw new Error(`Astro.glob(${JSON.stringify(globValue())}) - no matches found.`);
    }
    return Promise.all(allEntries.map((fn) => fn()));
  };
  return globHandler;
}
function createAstro(filePathname, _site, projectRootStr) {
  const site = _site ? new URL(_site) : void 0;
  const referenceURL = new URL(filePathname, `http://localhost`);
  const projectRoot = new URL(projectRootStr);
  return {
    site,
    generator: `Astro v${ASTRO_VERSION}`,
    fetchContent: createDeprecatedFetchContentFn(),
    glob: createAstroGlobFn(),
    resolve(...segments) {
      let resolved = segments.reduce((u, segment) => new URL(segment, u), referenceURL).pathname;
      if (resolved.startsWith(projectRoot.pathname)) {
        resolved = "/" + resolved.slice(projectRoot.pathname.length);
      }
      return resolved;
    }
  };
}

const escapeHTML = escape;
class HTMLString extends String {
}
const markHTMLString = (value) => {
  if (value instanceof HTMLString) {
    return value;
  }
  if (typeof value === "string") {
    return new HTMLString(value);
  }
  return value;
};

class Metadata {
  constructor(filePathname, opts) {
    this.modules = opts.modules;
    this.hoisted = opts.hoisted;
    this.hydratedComponents = opts.hydratedComponents;
    this.clientOnlyComponents = opts.clientOnlyComponents;
    this.hydrationDirectives = opts.hydrationDirectives;
    this.mockURL = new URL(filePathname, "http://example.com");
    this.metadataCache = /* @__PURE__ */ new Map();
  }
  resolvePath(specifier) {
    if (specifier.startsWith(".")) {
      const resolved = new URL(specifier, this.mockURL).pathname;
      if (resolved.startsWith("/@fs") && resolved.endsWith(".jsx")) {
        return resolved.slice(0, resolved.length - 4);
      }
      return resolved;
    }
    return specifier;
  }
  getPath(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentUrl) || null;
  }
  getExport(Component) {
    const metadata = this.getComponentMetadata(Component);
    return (metadata == null ? void 0 : metadata.componentExport) || null;
  }
  getComponentMetadata(Component) {
    if (this.metadataCache.has(Component)) {
      return this.metadataCache.get(Component);
    }
    const metadata = this.findComponentMetadata(Component);
    this.metadataCache.set(Component, metadata);
    return metadata;
  }
  findComponentMetadata(Component) {
    const isCustomElement = typeof Component === "string";
    for (const { module, specifier } of this.modules) {
      const id = this.resolvePath(specifier);
      for (const [key, value] of Object.entries(module)) {
        if (isCustomElement) {
          if (key === "tagName" && Component === value) {
            return {
              componentExport: key,
              componentUrl: id
            };
          }
        } else if (Component === value) {
          return {
            componentExport: key,
            componentUrl: id
          };
        }
      }
    }
    return null;
  }
}
function createMetadata(filePathname, options) {
  return new Metadata(filePathname, options);
}

const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7
};
function serializeArray(value) {
  return value.map((v) => convertToSerializedForm(v));
}
function serializeObject(value) {
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v)];
    })
  );
}
function convertToSerializedForm(value) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, JSON.stringify(serializeArray(Array.from(value)))];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, JSON.stringify(serializeArray(value))];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value)];
      } else {
        return [PROP_TYPE.Value, value];
      }
    }
  }
}
function serializeProps(props) {
  return JSON.stringify(serializeObject(props));
}

function serializeListValue(value) {
  const hash = {};
  push(value);
  return Object.keys(hash).join(" ");
  function push(item) {
    if (item && typeof item.forEach === "function")
      item.forEach(push);
    else if (item === Object(item))
      Object.keys(item).forEach((name) => {
        if (item[name])
          push(name);
      });
    else {
      item = item === false || item == null ? "" : String(item).trim();
      if (item) {
        item.split(/\s+/).forEach((name) => {
          hash[name] = true;
        });
      }
    }
  }
}

const HydrationDirectivesRaw = ["load", "idle", "media", "visible", "only"];
const HydrationDirectives = new Set(HydrationDirectivesRaw);
const HydrationDirectiveProps = new Set(HydrationDirectivesRaw.map((n) => `client:${n}`));
function extractDirectives(inputProps) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!HydrationDirectives.has(extracted.hydration.directive)) {
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${Array.from(
                HydrationDirectiveProps
              ).join(", ")}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new Error(
              'Error: Media query must be provided for "client:media", similar to client:media="(max-width: 600px)"'
            );
          }
          break;
        }
      }
    } else if (key === "class:list") {
      extracted.props[key.slice(0, -5)] = serializeListValue(value);
    } else {
      extracted.props[key] = value;
    }
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new Error(
      `Unable to resolve a valid export for "${metadata.displayName}"! Please open an issue at https://astro.build/issues!`
    );
  }
  const island = {
    children: "",
    props: {
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = value;
    }
  }
  island.props["component-url"] = await result.resolve(componentUrl);
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(renderer.clientEntrypoint);
    island.props["props"] = escapeHTML(serializeProps(props));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  island.props["before-hydration-url"] = await result.resolve("astro:scripts/before-hydration.js");
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  return island;
}

var idle_prebuilt_default = `(self.Astro=self.Astro||{}).idle=t=>{const e=async()=>{await(await t())()};"requestIdleCallback"in window?window.requestIdleCallback(e):setTimeout(e,200)},window.dispatchEvent(new Event("astro:idle"));`;

var load_prebuilt_default = `(self.Astro=self.Astro||{}).load=a=>{(async()=>await(await a())())()},window.dispatchEvent(new Event("astro:load"));`;

var media_prebuilt_default = `(self.Astro=self.Astro||{}).media=(s,a)=>{const t=async()=>{await(await s())()};if(a.value){const e=matchMedia(a.value);e.matches?t():e.addEventListener("change",t,{once:!0})}},window.dispatchEvent(new Event("astro:media"));`;

var only_prebuilt_default = `(self.Astro=self.Astro||{}).only=t=>{(async()=>await(await t())())()},window.dispatchEvent(new Event("astro:only"));`;

var visible_prebuilt_default = `(self.Astro=self.Astro||{}).visible=(s,c,n)=>{const r=async()=>{await(await s())()};let i=new IntersectionObserver(e=>{for(const t of e)if(!!t.isIntersecting){i.disconnect(),r();break}});for(let e=0;e<n.children.length;e++){const t=n.children[e];i.observe(t)}},window.dispatchEvent(new Event("astro:visible"));`;

var astro_island_prebuilt_default = `var l;{const c={0:t=>t,1:t=>JSON.parse(t,o),2:t=>new RegExp(t),3:t=>new Date(t),4:t=>new Map(JSON.parse(t,o)),5:t=>new Set(JSON.parse(t,o)),6:t=>BigInt(t),7:t=>new URL(t)},o=(t,i)=>{if(t===""||!Array.isArray(i))return i;const[e,n]=i;return e in c?c[e](n):void 0};customElements.get("astro-island")||customElements.define("astro-island",(l=class extends HTMLElement{constructor(){super(...arguments);this.hydrate=()=>{if(!this.hydrator||this.parentElement&&this.parentElement.closest("astro-island[ssr]"))return;const i=this.querySelectorAll("astro-slot"),e={},n=this.querySelectorAll("template[data-astro-template]");for(const s of n){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("data-astro-template")||"default"]=s.innerHTML,s.remove())}for(const s of i){const r=s.closest(this.tagName);!r||!r.isSameNode(this)||(e[s.getAttribute("name")||"default"]=s.innerHTML)}const a=this.hasAttribute("props")?JSON.parse(this.getAttribute("props"),o):{};this.hydrator(this)(this.Component,a,e,{client:this.getAttribute("client")}),this.removeAttribute("ssr"),window.removeEventListener("astro:hydrate",this.hydrate),window.dispatchEvent(new CustomEvent("astro:hydrate"))}}connectedCallback(){!this.hasAttribute("await-children")||this.firstChild?this.childrenConnectedCallback():new MutationObserver((i,e)=>{e.disconnect(),this.childrenConnectedCallback()}).observe(this,{childList:!0})}async childrenConnectedCallback(){window.addEventListener("astro:hydrate",this.hydrate),await import(this.getAttribute("before-hydration-url")),this.start()}start(){const i=JSON.parse(this.getAttribute("opts")),e=this.getAttribute("client");if(Astro[e]===void 0){window.addEventListener(\`astro:\${e}\`,()=>this.start(),{once:!0});return}Astro[e](async()=>{const n=this.getAttribute("renderer-url"),[a,{default:s}]=await Promise.all([import(this.getAttribute("component-url")),n?import(n):()=>()=>{}]),r=this.getAttribute("component-export")||"default";if(!r.includes("."))this.Component=a[r];else{this.Component=a;for(const d of r.split("."))this.Component=this.Component[d]}return this.hydrator=s,this.hydrate},i,this)}attributeChangedCallback(){this.hydrator&&this.hydrate()}},l.observedAttributes=["props"],l))}`;

function determineIfNeedsHydrationScript(result) {
  if (result._metadata.hasHydrationScript) {
    return false;
  }
  return result._metadata.hasHydrationScript = true;
}
const hydrationScripts = {
  idle: idle_prebuilt_default,
  load: load_prebuilt_default,
  only: only_prebuilt_default,
  media: media_prebuilt_default,
  visible: visible_prebuilt_default
};
function determinesIfNeedsDirectiveScript(result, directive) {
  if (result._metadata.hasDirectives.has(directive)) {
    return false;
  }
  result._metadata.hasDirectives.add(directive);
  return true;
}
function getDirectiveScriptText(directive) {
  if (!(directive in hydrationScripts)) {
    throw new Error(`Unknown directive: ${directive}`);
  }
  const directiveScriptText = hydrationScripts[directive];
  return directiveScriptText;
}
function getPrescripts(type, directive) {
  switch (type) {
    case "both":
      return `<style>astro-island,astro-slot{display:contents}</style><script>${getDirectiveScriptText(directive) + astro_island_prebuilt_default}<\/script>`;
    case "directive":
      return `<script>${getDirectiveScriptText(directive)}<\/script>`;
  }
  return "";
}

const Fragment = Symbol.for("astro:fragment");
const Renderer = Symbol.for("astro:renderer");
function stringifyChunk(result, chunk) {
  switch (chunk.type) {
    case "directive": {
      const { hydration } = chunk;
      let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
      let needsDirectiveScript = hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);
      let prescriptType = needsHydrationScript ? "both" : needsDirectiveScript ? "directive" : null;
      if (prescriptType) {
        let prescripts = getPrescripts(prescriptType, hydration.directive);
        return markHTMLString(prescripts);
      } else {
        return "";
      }
    }
    default: {
      return chunk.toString();
    }
  }
}

function validateComponentProps(props, displayName) {
  var _a;
  if (((_a = {"BASE_URL":"/","MODE":"production","DEV":false,"PROD":true}) == null ? void 0 : _a.DEV) && props != null) {
    for (const prop of Object.keys(props)) {
      if (HydrationDirectiveProps.has(prop)) {
        console.warn(
          `You are attempting to render <${displayName} ${prop} />, but ${displayName} is an Astro component. Astro components do not render in the client and should not have a hydration directive. Please use a framework component for client rendering.`
        );
      }
    }
  }
}
class AstroComponent {
  constructor(htmlParts, expressions) {
    this.htmlParts = htmlParts;
    this.expressions = expressions;
  }
  get [Symbol.toStringTag]() {
    return "AstroComponent";
  }
  async *[Symbol.asyncIterator]() {
    const { htmlParts, expressions } = this;
    for (let i = 0; i < htmlParts.length; i++) {
      const html = htmlParts[i];
      const expression = expressions[i];
      yield markHTMLString(html);
      yield* renderChild(expression);
    }
  }
}
function isAstroComponent(obj) {
  return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object AstroComponent]";
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : !!obj.isAstroComponentFactory;
}
async function* renderAstroComponent(component) {
  for await (const value of component) {
    if (value || value === 0) {
      for await (const chunk of renderChild(value)) {
        switch (chunk.type) {
          case "directive": {
            yield chunk;
            break;
          }
          default: {
            yield markHTMLString(chunk);
            break;
          }
        }
      }
    }
  }
}
async function renderToString(result, componentFactory, props, children) {
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    const response = Component;
    throw response;
  }
  let html = "";
  for await (const chunk of renderAstroComponent(Component)) {
    html += stringifyChunk(result, chunk);
  }
  return html;
}
async function renderToIterable(result, componentFactory, displayName, props, children) {
  validateComponentProps(props, displayName);
  const Component = await componentFactory(result, props, children);
  if (!isAstroComponent(Component)) {
    console.warn(
      `Returning a Response is only supported inside of page components. Consider refactoring this logic into something like a function that can be used in the page.`
    );
    const response = Component;
    throw response;
  }
  return renderAstroComponent(Component);
}
async function renderTemplate(htmlParts, ...expressions) {
  return new AstroComponent(htmlParts, expressions);
}

async function* renderChild(child) {
  child = await child;
  if (child instanceof HTMLString) {
    yield child;
  } else if (Array.isArray(child)) {
    for (const value of child) {
      yield markHTMLString(await renderChild(value));
    }
  } else if (typeof child === "function") {
    yield* renderChild(child());
  } else if (typeof child === "string") {
    yield markHTMLString(escapeHTML(child));
  } else if (!child && child !== 0) ; else if (child instanceof AstroComponent || Object.prototype.toString.call(child) === "[object AstroComponent]") {
    yield* renderAstroComponent(child);
  } else if (typeof child === "object" && Symbol.asyncIterator in child) {
    yield* child;
  } else {
    yield child;
  }
}
async function renderSlot(result, slotted, fallback) {
  if (slotted) {
    let iterator = renderChild(slotted);
    let content = "";
    for await (const chunk of iterator) {
      if (chunk.type === "directive") {
        content += stringifyChunk(result, chunk);
      } else {
        content += chunk;
      }
    }
    return markHTMLString(content);
  }
  return fallback;
}

/**
 * shortdash - https://github.com/bibig/node-shorthash
 *
 * @license
 *
 * (The MIT License)
 *
 * Copyright (c) 2013 Bibig <bibig@me.com>
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0)
    return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}

const voidElementNames = /^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes = /^(allowfullscreen|async|autofocus|autoplay|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|itemscope)$/i;
const htmlEnumAttributes = /^(contenteditable|draggable|spellcheck|value)$/i;
const svgEnumAttributes = /^(autoReverse|externalResourcesRequired|focusable|preserveAlpha)$/i;
const STATIC_DIRECTIVES = /* @__PURE__ */ new Set(["set:html", "set:text"]);
const toIdent = (k) => k.trim().replace(/(?:(?<!^)\b\w|\s+|[^\w]+)/g, (match, index) => {
  if (/[^\w]|\s/.test(match))
    return "";
  return index === 0 ? match : match.toUpperCase();
});
const toAttributeString = (value, shouldEscape = true) => shouldEscape ? String(value).replace(/&/g, "&#38;").replace(/"/g, "&#34;") : value;
const kebab = (k) => k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
const toStyleString = (obj) => Object.entries(obj).map(([k, v]) => `${kebab(k)}:${v}`).join(";");
function defineScriptVars(vars) {
  let output = "";
  for (const [key, value] of Object.entries(vars)) {
    output += `let ${toIdent(key)} = ${JSON.stringify(value)};
`;
  }
  return markHTMLString(output);
}
function formatList(values) {
  if (values.length === 1) {
    return values[0];
  }
  return `${values.slice(0, -1).join(", ")} or ${values[values.length - 1]}`;
}
function addAttribute(value, key, shouldEscape = true) {
  if (value == null) {
    return "";
  }
  if (value === false) {
    if (htmlEnumAttributes.test(key) || svgEnumAttributes.test(key)) {
      return markHTMLString(` ${key}="false"`);
    }
    return "";
  }
  if (STATIC_DIRECTIVES.has(key)) {
    console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
    return "";
  }
  if (key === "class:list") {
    const listValue = toAttributeString(serializeListValue(value));
    if (listValue === "") {
      return "";
    }
    return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
  }
  if (key === "style" && !(value instanceof HTMLString) && typeof value === "object") {
    return markHTMLString(` ${key}="${toStyleString(value)}"`);
  }
  if (key === "className") {
    return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
  }
  if (value === true && (key.startsWith("data-") || htmlBooleanAttributes.test(key))) {
    return markHTMLString(` ${key}`);
  } else {
    return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
  }
}
function internalSpreadAttributes(values, shouldEscape = true) {
  let output = "";
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, shouldEscape);
  }
  return markHTMLString(output);
}
function renderElement$1(name, { props: _props, children = "" }, shouldEscape = true) {
  const { lang: _, "data-astro-id": astroId, "define:vars": defineVars, ...props } = _props;
  if (defineVars) {
    if (name === "style") {
      delete props["is:global"];
      delete props["is:scoped"];
    }
    if (name === "script") {
      delete props.hoist;
      children = defineScriptVars(defineVars) + "\n" + children;
    }
  }
  if ((children == null || children == "") && voidElementNames.test(name)) {
    return `<${name}${internalSpreadAttributes(props, shouldEscape)} />`;
  }
  return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlot(result, slots == null ? void 0 : slots.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName)
    return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}

const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
function guessRenderers(componentUrl) {
  const extname = componentUrl == null ? void 0 : componentUrl.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact"];
    default:
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/vue", "@astrojs/svelte"];
  }
}
function getComponentType(Component) {
  if (Component === Fragment) {
    return "fragment";
  }
  if (Component && typeof Component === "object" && Component["astro:html"]) {
    return "html";
  }
  if (isAstroComponentFactory(Component)) {
    return "astro-factory";
  }
  return "unknown";
}
async function renderComponent(result, displayName, Component, _props, slots = {}) {
  var _a;
  Component = await Component;
  switch (getComponentType(Component)) {
    case "fragment": {
      const children2 = await renderSlot(result, slots == null ? void 0 : slots.default);
      if (children2 == null) {
        return children2;
      }
      return markHTMLString(children2);
    }
    case "html": {
      const children2 = {};
      if (slots) {
        await Promise.all(
          Object.entries(slots).map(
            ([key, value]) => renderSlot(result, value).then((output) => {
              children2[key] = output;
            })
          )
        );
      }
      const html2 = Component.render({ slots: children2 });
      return markHTMLString(html2);
    }
    case "astro-factory": {
      async function* renderAstroComponentInline() {
        let iterable = await renderToIterable(result, Component, displayName, _props, slots);
        yield* iterable;
      }
      return renderAstroComponentInline();
    }
  }
  if (!Component && !_props["client:only"]) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers } = result._metadata;
  const metadata = { displayName };
  const { hydration, isPage, props } = extractDirectives(_props);
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  if (Array.isArray(renderers) && renderers.length === 0 && typeof Component !== "string" && !componentIsHTMLElement(Component)) {
    const message = `Unable to render ${metadata.displayName}!

There are no \`integrations\` set in your \`astro.config.mjs\` file.
Did you mean to add ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`;
    throw new Error(message);
  }
  const children = {};
  if (slots) {
    await Promise.all(
      Object.entries(slots).map(
        ([key, value]) => renderSlot(result, value).then((output) => {
          children[key] = output;
        })
      )
    );
  }
  let renderer;
  if (metadata.hydrate !== "only") {
    if (Component && Component[Renderer]) {
      const rendererName = Component[Renderer];
      renderer = renderers.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error;
      for (const r of renderers) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error ?? (error = e);
        }
      }
      if (!renderer && error) {
        throw error;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = renderHTMLElement(result, Component, _props, slots);
      return output;
    }
  } else {
    if (metadata.hydrateArgs) {
      const passedName = metadata.hydrateArgs;
      const rendererName = rendererAliases.has(passedName) ? rendererAliases.get(passedName) : passedName;
      renderer = renderers.find(
        ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
      );
    }
    if (!renderer && renderers.length === 1) {
      renderer = renderers[0];
    }
    if (!renderer) {
      const extname = (_a = metadata.componentUrl) == null ? void 0 : _a.split(".").pop();
      renderer = renderers.filter(
        ({ name }) => name === `@astrojs/${extname}` || name === extname
      )[0];
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      throw new Error(`Unable to render ${metadata.displayName}!

Using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.
Did you mean to pass <${metadata.displayName} client:only="${probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")}" />
`);
    } else if (typeof Component !== "string") {
      const matchingRenderers = renderers.filter((r) => probableRendererNames.includes(r.name));
      const plural = renderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new Error(`Unable to render ${metadata.displayName}!

There ${plural ? "are" : "is"} ${renderers.length} renderer${plural ? "s" : ""} configured in your \`astro.config.mjs\` file,
but ${plural ? "none were" : "it was not"} able to server-side render ${metadata.displayName}.

Did you mean to enable ${formatList(probableRendererNames.map((r) => "`" + r + "`"))}?`);
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          props,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlot(result, slots == null ? void 0 : slots.fallback);
    } else {
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        props,
        children,
        metadata
      ));
    }
  }
  if (renderer && !renderer.clientEntrypoint && renderer.name !== "@astrojs/lit" && metadata.hydrate) {
    throw new Error(
      `${metadata.displayName} component has a \`client:${metadata.hydrate}\` directive, but no client entrypoint was provided by ${renderer.name}!`
    );
  }
  if (!html && typeof Component === "string") {
    const childSlots = Object.values(children).join("");
    const iterable = renderAstroComponent(
      await renderTemplate`<${Component}${internalSpreadAttributes(props)}${markHTMLString(
        childSlots === "" && voidElementNames.test(Component) ? `/>` : `>${childSlots}</${Component}>`
      )}`
    );
    html = "";
    for await (const chunk of iterable) {
      html += chunk;
    }
  }
  if (!hydration) {
    if (isPage || (renderer == null ? void 0 : renderer.name) === "astro:jsx") {
      return html;
    }
    return markHTMLString(html.replace(/\<\/?astro-slot\>/g, ""));
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        if (!html.includes(key === "default" ? `<astro-slot>` : `<astro-slot name="${key}">`)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${key}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
  }
  async function* renderAll() {
    yield { type: "directive", hydration, result };
    yield markHTMLString(renderElement$1("astro-island", island, false));
  }
  return renderAll();
}

const uniqueElements = (item, index, all) => {
  const props = JSON.stringify(item.props);
  const children = item.children;
  return index === all.findIndex((i) => JSON.stringify(i.props) === props && i.children == children);
};
const alreadyHeadRenderedResults = /* @__PURE__ */ new WeakSet();
function renderHead(result) {
  alreadyHeadRenderedResults.add(result);
  const styles = Array.from(result.styles).filter(uniqueElements).map((style) => renderElement$1("style", style));
  result.styles.clear();
  const scripts = Array.from(result.scripts).filter(uniqueElements).map((script, i) => {
    return renderElement$1("script", script, false);
  });
  const links = Array.from(result.links).filter(uniqueElements).map((link) => renderElement$1("link", link, false));
  return markHTMLString(links.join("\n") + styles.join("\n") + scripts.join("\n"));
}
async function* maybeRenderHead(result) {
  if (alreadyHeadRenderedResults.has(result)) {
    return;
  }
  yield renderHead(result);
}

typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";

new TextEncoder();

function createComponent(cb) {
  cb.isAstroComponentFactory = true;
  return cb;
}
function spreadAttributes(values, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true);
  }
  return markHTMLString(output);
}

const AstroJSX = "astro:jsx";
const Empty = Symbol("empty");
const toSlotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function transformSlots(vnode) {
  if (typeof vnode.type === "string")
    return vnode;
  const slots = {};
  if (isVNode(vnode.props.children)) {
    const child = vnode.props.children;
    if (!isVNode(child))
      return;
    if (!("slot" in child.props))
      return;
    const name = toSlotName(child.props.slot);
    slots[name] = [child];
    slots[name]["$$slot"] = true;
    delete child.props.slot;
    delete vnode.props.children;
  }
  if (Array.isArray(vnode.props.children)) {
    vnode.props.children = vnode.props.children.map((child) => {
      if (!isVNode(child))
        return child;
      if (!("slot" in child.props))
        return child;
      const name = toSlotName(child.props.slot);
      if (Array.isArray(slots[name])) {
        slots[name].push(child);
      } else {
        slots[name] = [child];
        slots[name]["$$slot"] = true;
      }
      delete child.props.slot;
      return Empty;
    }).filter((v) => v !== Empty);
  }
  Object.assign(vnode.props, slots);
}
function markRawChildren(child) {
  if (typeof child === "string")
    return markHTMLString(child);
  if (Array.isArray(child))
    return child.map((c) => markRawChildren(c));
  return child;
}
function transformSetDirectives(vnode) {
  if (!("set:html" in vnode.props || "set:text" in vnode.props))
    return;
  if ("set:html" in vnode.props) {
    const children = markRawChildren(vnode.props["set:html"]);
    delete vnode.props["set:html"];
    Object.assign(vnode.props, { children });
    return;
  }
  if ("set:text" in vnode.props) {
    const children = vnode.props["set:text"];
    delete vnode.props["set:text"];
    Object.assign(vnode.props, { children });
    return;
  }
}
function createVNode(type, props) {
  const vnode = {
    [AstroJSX]: true,
    type,
    props: props ?? {}
  };
  transformSetDirectives(vnode);
  transformSlots(vnode);
  return vnode;
}

const ClientOnlyPlaceholder = "astro-client-only";
const skipAstroJSXCheck = /* @__PURE__ */ new WeakSet();
let originalConsoleError;
let consoleFilterRefs = 0;
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode):
      return markHTMLString(
        (await Promise.all(vnode.map((v) => renderJSX(result, v)))).join("")
      );
  }
  if (isVNode(vnode)) {
    switch (true) {
      case vnode.type === Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case vnode.type.isAstroComponentFactory: {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        return markHTMLString(await renderToString(result, vnode.type, props, slots));
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.type["astro:renderer"]) {
        skipAstroJSXCheck.add(vnode.type);
      }
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function" && !skipAstroJSXCheck.has(vnode.type)) {
        useConsoleFilter();
        try {
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2 && output2[AstroJSX]) {
            return await renderJSX(result, output2);
          } else if (!output2) {
            return await renderJSX(result, output2);
          }
        } catch (e) {
          skipAstroJSXCheck.add(vnode.type);
        } finally {
          finishUsingConsoleFilter();
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0)
              return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder && vnode.props["client:only"]) {
        output = await renderComponent(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponent(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      if (typeof output !== "string" && Symbol.asyncIterator in output) {
        let body = "";
        for await (const chunk of output) {
          let html = stringifyChunk(result, chunk);
          body += html;
        }
        return markHTMLString(body);
      } else {
        return markHTMLString(output);
      }
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children == "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, children)}</${tag}>`
    )}`
  );
}
function useConsoleFilter() {
  consoleFilterRefs++;
  if (!originalConsoleError) {
    originalConsoleError = console.error;
    try {
      console.error = filteredConsoleError;
    } catch (error) {
    }
  }
}
function finishUsingConsoleFilter() {
  consoleFilterRefs--;
}
function filteredConsoleError(msg, ...rest) {
  if (consoleFilterRefs > 0 && typeof msg === "string") {
    const isKnownReactHookError = msg.includes("Warning: Invalid hook call.") && msg.includes("https://reactjs.org/link/invalid-hook-call");
    if (isKnownReactHookError)
      return;
  }
}

const slotName = (str) => str.trim().replace(/[-_]([a-z])/g, (_, w) => w.toUpperCase());
async function check(Component, props, { default: children = null, ...slotted } = {}) {
  if (typeof Component !== "function")
    return false;
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  try {
    const result = await Component({ ...props, ...slots, children });
    return result[AstroJSX];
  } catch (e) {
  }
  return false;
}
async function renderToStaticMarkup(Component, props = {}, { default: children = null, ...slotted } = {}) {
  const slots = {};
  for (const [key, value] of Object.entries(slotted)) {
    const name = slotName(key);
    slots[name] = value;
  }
  const { result } = this;
  const html = await renderJSX(result, createVNode(Component, { ...props, ...slots, children }));
  return { html };
}
var server_default = {
  check,
  renderToStaticMarkup
};

const $$metadata$b = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/layouts/Layout.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$b = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/layouts/Layout.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$Layout = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width">
		<link rel="icon" type="image/svg+xml" href="/favicon.svg">
		<meta name="generator"${addAttribute(Astro2.generator, "content")}>
		<title>${title}</title>
	${renderHead($$result)}</head>
	<body>
		${renderSlot($$result, $$slots["default"])}
	</body></html>`;
});

const $$file$b = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/layouts/Layout.astro";
const $$url$b = undefined;

const $$module1$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$b,
	default: $$Layout,
	file: $$file$b,
	url: $$url$b
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$a = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/AboutLogo.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$a = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/AboutLogo.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$AboutLogo = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$AboutLogo;
  return renderTemplate`${maybeRenderHead($$result)}<a href="./" class="h-12 w-12 hover:text-hoverGreen hover:scale-125 transition duration-300">
	<svg class="fill-white h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100px" height="100px"><path d="M 58.9375 7.1699219 A 1.0001 1.0001 0 0 0 57.962891 8.0917969 L 57.685547 11.113281 C 55.148477 10.951662 52.52494 10.974694 49.818359 11.232422 C 38.639364 12.29702 27.839529 15.166805 19.90625 20.283203 C 11.972971 25.399601 6.8980205 33.139154 8.1347656 42.951172 C 10.017576 57.890479 22.654574 70.346173 41.169922 73.380859 L 41.169922 89 A 2.0002 2.0002 0 0 0 44.777344 90.189453 L 56.876953 73.839844 C 75.57527 74.939397 90.698056 59.709328 91.890625 42.84375 C 92.452121 34.906011 89.049793 27.262747 82.892578 21.453125 A 1.0001 1.0001 0 0 0 83.136719 21.095703 L 84.714844 17.386719 A 1.0001 1.0001 0 0 0 83.787109 15.982422 A 1.0001 1.0001 0 0 0 82.875 16.603516 L 81.382812 20.113281 C 80.627807 19.481654 79.836988 18.876623 79.013672 18.298828 L 80.119141 14.951172 A 1.0001 1.0001 0 0 0 79.177734 13.623047 A 1.0001 1.0001 0 0 0 78.21875 14.324219 L 77.285156 17.152344 C 76.341898 16.56722 75.362312 16.015939 74.345703 15.503906 L 75.650391 11.550781 A 1.0001 1.0001 0 0 0 74.708984 10.224609 A 1.0001 1.0001 0 0 0 73.75 10.923828 L 72.521484 14.644531 C 71.642118 14.256676 70.737789 13.897503 69.8125 13.566406 L 70.103516 11.916016 A 1.0001 1.0001 0 0 0 69.080078 10.730469 A 1.0001 1.0001 0 0 0 68.132812 11.568359 L 67.892578 12.927734 C 66.928516 12.634581 65.937925 12.377847 64.931641 12.148438 L 65.287109 8.2753906 A 1.0001 1.0001 0 0 0 64.269531 7.1699219 A 1.0001 1.0001 0 0 0 63.294922 8.0917969 L 62.958984 11.744141 C 61.886829 11.550531 60.792494 11.39776 59.679688 11.279297 L 59.955078 8.2734375 A 1.0001 1.0001 0 0 0 58.9375 7.1699219 z M 54.419922 15 C 55.65708 14.992454 56.866608 15.041145 58.052734 15.130859 A 1.0001 1.0001 0 0 0 58.623047 15.173828 C 76.933288 16.80234 88.810314 29.697172 87.900391 42.560547 C 86.841376 57.537371 72.952361 71.520973 56.044922 69.875 A 2.0002 2.0002 0 0 0 54.244141 70.675781 L 45.169922 82.933594 L 45.169922 71.746094 A 2.0002 2.0002 0 0 0 43.421875 69.763672 C 42.202807 69.607731 41.016618 69.406283 39.857422 69.167969 L 40.824219 66.240234 A 1.0001 1.0001 0 0 0 39.882812 64.914062 A 1.0001 1.0001 0 0 0 38.923828 65.613281 L 37.900391 68.716797 C 36.83043 68.447031 35.78808 68.142705 34.775391 67.804688 A 1.0002634 1.0002634 0 0 0 34.789062 67.767578 L 36.050781 63.941406 A 1.0001 1.0001 0 0 0 35.109375 62.615234 A 1.0001 1.0001 0 0 0 34.152344 63.314453 L 32.892578 67.128906 C 31.843471 66.721328 30.825009 66.279696 29.845703 65.800781 L 31.582031 60.542969 A 1.0001 1.0001 0 0 0 30.640625 59.214844 A 1.0001 1.0001 0 0 0 29.683594 59.916016 L 28.052734 64.855469 C 26.677969 64.088746 25.382339 63.253002 24.167969 62.351562 L 26.888672 58.529297 A 1.0001 1.0001 0 0 0 26.085938 56.9375 A 1.0001 1.0001 0 0 0 25.259766 57.369141 L 22.59375 61.115234 C 21.788112 60.439862 21.027525 59.73249 20.306641 59 L 23.550781 52.513672 A 1.0001 1.0001 0 0 0 22.611328 51.054688 A 1.0001 1.0001 0 0 0 21.761719 51.619141 L 18.855469 57.429688 C 17.770797 56.165898 16.808535 54.831443 15.966797 53.443359 A 1.0001 1.0001 0 0 0 16.226562 53.080078 L 19.007812 46.966797 A 1.0001 1.0001 0 0 0 18.115234 45.541016 A 1.0001 1.0001 0 0 0 17.1875 46.138672 L 14.816406 51.353516 C 13.969412 49.654177 13.294106 47.887128 12.810547 46.068359 L 14.876953 43.648438 A 1.0001 1.0001 0 0 0 14.117188 41.988281 A 1.0001 1.0001 0 0 0 13.355469 42.351562 L 12.277344 43.615234 C 12.211721 43.229079 12.152605 42.840673 12.103516 42.451172 C 11.061261 34.18219 14.972498 28.226587 22.074219 23.646484 C 29.17594 19.066382 39.461261 16.23725 50.197266 15.214844 C 51.634143 15.078018 53.041851 15.008405 54.419922 15 z M 67.263672 22.630859 C 66.822953 22.576109 66.371016 22.782656 66.134766 23.191406 C 65.819766 23.736406 66.007734 24.434047 66.552734 24.748047 C 67.097734 25.063047 67.794375 24.877031 68.109375 24.332031 C 68.424375 23.787031 68.236406 23.089391 67.691406 22.775391 C 67.555156 22.696641 67.410578 22.649109 67.263672 22.630859 z M 52.287109 24.619141 C 50.400109 24.619141 48.867187 26.152062 48.867188 28.039062 C 48.867188 29.926063 50.400109 31.457031 52.287109 31.457031 C 54.174109 31.457031 55.705078 29.926063 55.705078 28.039062 C 55.705078 26.152062 54.174109 24.619141 52.287109 24.619141 z M 75.640625 29.1875 C 75.199906 29.133125 74.747969 29.340047 74.511719 29.748047 C 74.196719 30.293047 74.384687 30.990687 74.929688 31.304688 C 75.474687 31.619687 76.172328 31.433672 76.486328 30.888672 C 76.801328 30.343672 76.613359 29.645078 76.068359 29.330078 C 75.932109 29.251578 75.787531 29.205625 75.640625 29.1875 z M 68.548828 30.964844 C 68.108109 30.910469 67.658125 31.117391 67.421875 31.525391 C 67.106875 32.070391 67.292891 32.768031 67.837891 33.082031 C 68.382891 33.397031 69.079531 33.211016 69.394531 32.666016 C 69.709531 32.121016 69.523516 31.424375 68.978516 31.109375 C 68.842266 31.030875 68.695734 30.982969 68.548828 30.964844 z M 52.257812 37.408203 A 2.0002 2.0002 0 0 0 50.287109 39.435547 L 50.287109 56.53125 A 2.0002 2.0002 0 1 0 54.287109 56.53125 L 54.287109 39.435547 A 2.0002 2.0002 0 0 0 52.257812 37.408203 z"></path>
	</svg>
</a>`;
});

const $$file$a = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/AboutLogo.astro";
const $$url$a = undefined;

const $$module1$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$a,
	default: $$AboutLogo,
	file: $$file$a,
	url: $$url$a
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$9 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/ContactLogo.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$9 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/ContactLogo.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$ContactLogo = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$ContactLogo;
  return renderTemplate`${maybeRenderHead($$result)}<a href="" class="h-12 w-12 hover:text-hoverGreen hover:scale-125 transition duration-300">
	<img src="../../../assets/contact.png" alt="">
</a>`;
});

const $$file$9 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/ContactLogo.astro";
const $$url$9 = undefined;

const $$module2$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$9,
	default: $$ContactLogo,
	file: $$file$9,
	url: $$url$9
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$8 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/HomeLogo.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$8 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/HomeLogo.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$HomeLogo = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$HomeLogo;
  return renderTemplate`${maybeRenderHead($$result)}<a href="./" class="h-12 w-12 hover:text-hoverGreen hover:scale-125 transition duration-300">
	<img src="../../../assets/compass.png" alt="" class="hover:animate-compass">
</a>`;
});

const $$file$8 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/HomeLogo.astro";
const $$url$8 = undefined;

const $$module3$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$8,
	default: $$HomeLogo,
	file: $$file$8,
	url: $$url$8
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$7 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/ProjectsLogo.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$7 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/ProjectsLogo.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$ProjectsLogo = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$ProjectsLogo;
  return renderTemplate`${maybeRenderHead($$result)}<a href="" class="h-12 w-12 hover:text-hoverGreen hover:scale-125 transition duration-300">
	<svg class="fill-white h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100px" height="100px"><path d="M 57.21875 14.712891 C 56.982382 14.715759 56.744805 14.731512 56.507812 14.759766 L 56.501953 14.759766 C 51.330238 15.362943 46.366074 15.545342 41.578125 15.357422 C 39.62495 15.267932 37.724308 16.032347 36.378906 17.453125 C 35.034809 18.872526 34.371583 20.811004 34.566406 22.757812 C 34.702542 24.119756 34.744441 24.547834 34.828125 25.386719 C 30.54358 25.333681 26.298803 25.208282 22.097656 25.001953 A 2.0002 2.0002 0 0 0 21.644531 25.03125 C 15.548887 26.13178 11.135462 31.023165 10.027344 37.671875 A 2.0002 2.0002 0 0 0 10 37.949219 L 9 77.949219 A 2.0002 2.0002 0 0 0 9.03125 78.349609 C 9.5492536 81.272043 11.145162 83.968973 13.949219 85.701172 A 2.0002 2.0002 0 0 0 14.914062 85.998047 C 36.095834 86.91153 58.273584 86.580545 82.214844 83.988281 A 2.0002 2.0002 0 0 0 82.423828 83.955078 C 83.816943 83.652887 85.292127 83.119663 86.541016 82.033203 C 87.789904 80.946743 88.702752 79.293963 88.980469 77.271484 A 2.0002 2.0002 0 0 0 88.986328 76.759766 C 87.154474 61.658205 86.847393 46.381922 87 31.019531 A 2.0002 2.0002 0 0 0 86.865234 30.279297 C 85.575799 26.941534 83.157721 24.235572 79.611328 23.095703 A 2.0002 2.0002 0 0 0 79.021484 23 A 2.0002 2.0002 0 0 0 78.757812 23.015625 C 73.770656 23.622913 68.85209 24.105166 63.996094 24.474609 C 63.995196 23.637886 63.996253 22.978947 63.990234 21.402344 C 63.990234 19.491161 63.171526 17.667827 61.740234 16.398438 C 60.488893 15.287933 58.873325 14.692814 57.21875 14.712891 z M 57.550781 18.724609 C 58.116133 18.776897 58.653633 19.006976 59.085938 19.390625 C 59.661901 19.90119 59.990234 20.632062 59.990234 21.402344 A 2.0002 2.0002 0 0 0 59.990234 21.410156 C 59.996716 23.116191 59.997329 23.960511 59.998047 24.736328 C 52.82047 25.193661 45.776588 25.40761 38.851562 25.404297 C 38.772913 24.615722 38.704561 23.936926 38.546875 22.359375 C 38.467695 21.568184 38.735301 20.783677 39.283203 20.205078 C 39.829802 19.627856 40.597706 19.317007 41.394531 19.353516 A 2.0002 2.0002 0 0 0 41.408203 19.353516 C 46.412279 19.550655 51.593341 19.360116 56.972656 18.732422 A 2.0002 2.0002 0 0 0 56.978516 18.732422 C 57.170044 18.709414 57.362331 18.70718 57.550781 18.724609 z M 78.623047 27.044922 C 80.753153 27.809499 82.072542 29.224844 83.005859 31.505859 C 82.966803 35.726801 82.970083 39.947837 83.023438 44.167969 L 58.347656 61.53125 C 58.032799 58.751922 57.61173 55.872929 56.978516 52.798828 A 1.0001 1.0001 0 0 0 55.582031 52.091797 C 52.90786 53.322693 48.708864 53.6763 43.119141 53.007812 A 1.0001 1.0001 0 0 0 42.001953 54.060547 C 42.177427 56.944503 42.247525 59.55183 42.261719 62.005859 L 30.222656 55.585938 L 32.935547 48.351562 A 1.0001 1.0001 0 1 0 31.064453 47.648438 L 28.443359 54.636719 L 27.107422 53.923828 L 28.927734 49.371094 A 1.0001 1.0001 0 1 0 27.072266 48.628906 L 25.332031 52.976562 L 13.78125 46.816406 L 13.994141 38.251953 C 14.895015 33.001316 17.860271 29.847663 22.240234 29.007812 C 40.191627 29.87267 58.884903 29.410585 78.623047 27.044922 z M 74 32 A 1 1 0 0 0 74 34 A 1 1 0 0 0 74 32 z M 77.40625 35.949219 A 1 1 0 0 0 77.40625 37.949219 A 1 1 0 0 0 77.40625 35.949219 z M 63 36 A 1 1 0 0 0 63 38 A 1 1 0 0 0 63 36 z M 71 39 A 1 1 0 0 0 71 41 A 1 1 0 0 0 71 39 z M 83.0625 46.587891 C 83.245065 56.700649 83.773489 66.804194 84.978516 76.873047 C 84.797416 77.976662 84.431163 78.567477 83.916016 79.015625 C 83.383422 79.47895 82.588646 79.808964 81.619141 80.025391 C 79.56633 80.246818 77.54267 80.430683 75.515625 80.619141 L 75.949219 79.316406 A 1.0001 1.0001 0 0 0 75.011719 77.986328 A 1.0001 1.0001 0 0 0 74.050781 78.683594 L 73.335938 80.830078 C 71.792396 80.965459 70.271425 81.072403 68.742188 81.189453 L 69.832031 79.554688 A 1.0001 1.0001 0 0 0 68.980469 77.988281 A 1.0001 1.0001 0 0 0 68.167969 78.445312 L 66.208984 81.382812 C 64.925316 81.473235 63.647031 81.556772 62.373047 81.634766 L 62.970703 79.242188 A 1.0001 1.0001 0 0 0 62.033203 77.986328 A 1.0001 1.0001 0 0 0 61.029297 78.757812 L 60.28125 81.751953 C 58.873459 81.83108 57.455025 81.925708 56.058594 81.990234 L 56.949219 79.316406 A 1.0001 1.0001 0 0 0 56.011719 77.986328 A 1.0001 1.0001 0 0 0 55.050781 78.683594 L 54.050781 81.683594 A 1.0005646 1.0005646 0 0 0 54.001953 82.066406 C 52.882857 82.112656 51.770299 82.150264 50.658203 82.1875 L 51.949219 78.316406 A 1.0001 1.0001 0 0 0 51.011719 76.986328 A 1.0001 1.0001 0 0 0 50.050781 77.683594 L 48.523438 82.265625 C 47.342665 82.299323 46.173203 82.317862 45 82.341797 L 45 79 A 1.0001 1.0001 0 0 0 43.984375 77.986328 A 1.0001 1.0001 0 0 0 43 79 L 43 82.376953 C 41.565433 82.399669 40.126914 82.426759 38.703125 82.435547 L 39.927734 79.371094 A 1.0001 1.0001 0 0 0 38.970703 77.988281 A 1.0001 1.0001 0 0 0 38.072266 78.628906 L 36.550781 82.433594 C 35.173002 82.435486 33.792078 82.440141 32.423828 82.429688 L 32.970703 80.242188 A 1.0001 1.0001 0 0 0 32.033203 78.986328 A 1.0001 1.0001 0 0 0 31.029297 79.757812 L 30.367188 82.408203 C 28.960241 82.391223 27.563489 82.363272 26.166016 82.333984 L 27.857422 79.513672 A 1.0001 1.0001 0 0 0 27.033203 77.988281 A 1.0001 1.0001 0 0 0 26.142578 78.486328 L 23.859375 82.291016 C 22.456563 82.254947 21.067745 82.201961 19.673828 82.154297 L 21.857422 78.513672 A 1.0001 1.0001 0 0 0 21.033203 76.988281 A 1.0001 1.0001 0 0 0 20.142578 77.486328 L 17.388672 82.076172 C 16.846285 82.055185 16.296979 82.042176 15.755859 82.019531 C 15.198196 81.633978 14.741735 81.216688 14.361328 80.761719 L 17.832031 75.554688 A 1.0001 1.0001 0 0 0 16.980469 73.988281 A 1.0001 1.0001 0 0 0 16.167969 74.445312 L 13.275391 78.783203 C 13.16811 78.457769 13.076484 78.119738 13.007812 77.755859 L 13.072266 75.154297 L 15.857422 70.513672 A 1.0001 1.0001 0 0 0 15.033203 68.988281 A 1.0001 1.0001 0 0 0 14.142578 69.486328 L 13.173828 71.101562 L 13.724609 49.052734 L 41.529297 63.882812 A 1.0001 1.0001 0 0 0 42.238281 63.980469 C 42.210801 66.095646 42.158771 68.143767 42.003906 69.912109 A 1.0001 1.0001 0 0 0 42.839844 70.986328 C 48.267515 71.861891 53.452405 71.563344 58.314453 69.949219 A 1.0001 1.0001 0 0 0 58.998047 68.933594 C 58.886951 67.274081 58.711862 65.547419 58.550781 63.835938 A 1.0001 1.0001 0 0 0 58.576172 63.818359 L 66.386719 58.322266 L 67.050781 60.316406 A 1.0005646 1.0005646 0 1 0 68.949219 59.683594 L 68.095703 57.121094 L 69.509766 56.125 L 72.142578 60.513672 A 1.0001 1.0001 0 1 0 73.857422 59.486328 L 71.148438 54.970703 L 73.480469 53.330078 L 76.080078 59.394531 A 1.0009551 1.0009551 0 1 0 77.919922 58.605469 L 75.154297 52.152344 L 83.0625 46.587891 z M 55.199219 54.316406 C 56.152618 59.275298 56.617618 63.795512 56.925781 68.197266 C 52.876255 69.415712 48.583048 69.68248 44.037109 69.060547 C 44.325734 65.118052 44.327836 60.459785 44.033203 55.033203 C 48.570332 55.47516 52.33297 55.306204 55.199219 54.316406 z M 49.970703 57.972656 A 2.0002 2.0002 0 0 0 48 60 L 48 65 A 2.0002 2.0002 0 1 0 52 65 L 52 60 A 2.0002 2.0002 0 0 0 49.970703 57.972656 z"></path>
	</svg>
</a>`;
});

const $$file$7 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/ProjectsLogo.astro";
const $$url$7 = undefined;

const $$module4$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$7,
	default: $$ProjectsLogo,
	file: $$file$7,
	url: $$url$7
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$6 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/Navbar.astro", { modules: [{ module: $$module1$1, specifier: "./logos/AboutLogo.astro", assert: {} }, { module: $$module2$1, specifier: "./logos/ContactLogo.astro", assert: {} }, { module: $$module3$1, specifier: "./logos/HomeLogo.astro", assert: {} }, { module: $$module4$1, specifier: "./logos/ProjectsLogo.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$6 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/Navbar.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$Navbar = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$Navbar;
  return renderTemplate`${maybeRenderHead($$result)}<nav class="bg-darkBlue opacity-90 z-10 h-20 fixed rounded-2xl left-1/2 transform translate-x-[-50%] flex items-center gap-4 px-8 my-4">
	${renderComponent($$result, "HomeLogo", $$HomeLogo, {})}
	${renderComponent($$result, "AboutLogo", $$AboutLogo, {})}
	${renderComponent($$result, "ProjectsLogo", $$ProjectsLogo, {})}
	${renderComponent($$result, "ContactLogo", $$ContactLogo, {})}
</nav>`;
});

const $$file$6 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/Navbar.astro";
const $$url$6 = undefined;

const $$module2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$6,
	default: $$Navbar,
	file: $$file$6,
	url: $$url$6
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$5 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/CoderIcon.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$5 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/CoderIcon.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$CoderIcon = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$CoderIcon;
  return renderTemplate`${maybeRenderHead($$result)}<svg viewBox="0 0 3170 2318" fill="none" class="w-[40%]" xmlns="http://www.w3.org/2000/svg"><path d="M2258.58 1777.45C2261.92 1847.89 2205.69 1906.8 2135.18 1906.8V2038.47L1871.04 2031.8L1736.18 2028.32L1195.42 2014.61L1236.92 1781.23H1338.85L1473.93 1494.53C1496.71 1444.04 1537.77 1403.92 1588.77 1382.3L1766.44 1306.92C1776.23 1320.05 1789.58 1330.5 1804.96 1336.95C1807.64 1338.11 1810.4 1339.13 1813.23 1340C1817.44 1341.31 1821.79 1342.32 1826.29 1343.05H1826.36C1829.33 1343.56 1832.31 1343.85 1835.36 1344.07C1837.39 1344.21 1839.35 1344.29 1841.38 1344.29C1842.47 1344.44 1843.56 1344.44 1844.64 1344.44C1850.95 1344.66 1857.34 1344.66 1863.65 1344.44C1866.7 1344.37 1869.67 1344.29 1872.72 1344.08C1875.77 1343.86 1878.81 1343.57 1881.79 1343.06C1886.29 1342.33 1890.64 1341.32 1894.85 1340.01C1897.68 1339.14 1900.44 1338.12 1903.12 1336.96C1928.37 1326.44 1947.88 1305.18 1956.01 1279L2163.49 1397.4C2212.75 1425.55 2244.23 1476.84 2246.92 1533.5L2258.58 1777.45Z" fill="#D64045"></path><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M1813.22 1340L1618.72 1418.13C1567.72 1439.75 1526.66 1479.87 1503.88 1530.36L1380.47 1792.28C1373.34 1807.41 1358.12 1817.06 1341.4 1817.06H1230.52L1236.9 1781.22H1338.83L1473.91 1494.52C1496.69 1444.03 1537.75 1403.91 1588.75 1382.29L1766.42 1306.91C1776.21 1320.04 1789.56 1330.49 1804.94 1336.94C1807.63 1338.11 1810.39 1339.12 1813.22 1340Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1960.27 1170.09V1251.27C1960.27 1260.92 1958.82 1270.21 1955.99 1278.98C1947.86 1305.17 1928.35 1326.43 1903.1 1336.94C1900.42 1338.1 1897.66 1339.12 1894.83 1339.99C1890.62 1341.3 1886.27 1342.31 1881.77 1343.04C1878.8 1343.55 1875.75 1343.84 1872.7 1344.06C1869.65 1344.28 1866.68 1344.35 1863.63 1344.42C1857.32 1344.64 1850.93 1344.64 1844.62 1344.42C1843.53 1344.42 1842.44 1344.35 1841.36 1344.27C1839.33 1344.27 1837.37 1344.2 1835.34 1344.05C1832.29 1343.83 1829.32 1343.54 1826.34 1343.03C1826.27 1342.96 1826.27 1343.03 1826.27 1343.03C1821.77 1342.3 1817.42 1341.29 1813.21 1339.98C1810.45 1339.11 1807.7 1338.09 1804.94 1336.93C1789.56 1330.47 1776.21 1320.03 1766.42 1306.9C1754.74 1291.37 1747.85 1272.15 1747.85 1251.33C1793.48 1257.5 1839.11 1248.43 1884.75 1224.2C1886.85 1223.11 1888.89 1221.95 1890.99 1220.72C1892.95 1219.63 1894.83 1218.54 1896.79 1217.38C1899.55 1215.78 1902.23 1214.19 1904.92 1212.45C1907.02 1211.07 1909.13 1209.69 1911.23 1208.31C1927.63 1197.51 1943.95 1184.82 1960.27 1170.09Z" fill="#FBD6A2"></path><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M1960.27 1170.09V1251.27C1960.27 1260.92 1958.82 1270.21 1955.99 1278.98C1947.86 1305.17 1928.35 1326.43 1903.1 1336.94C1900.42 1338.1 1897.66 1339.12 1894.83 1339.99C1890.62 1341.3 1886.27 1342.31 1881.77 1343.04C1878.8 1343.55 1875.75 1343.84 1872.7 1344.06C1869.65 1344.28 1866.68 1344.35 1863.63 1344.42C1857.32 1344.64 1850.93 1344.64 1844.62 1344.42C1843.53 1344.42 1842.44 1344.35 1841.36 1344.27C1867.55 1327.8 1884.74 1298.78 1884.74 1265.85V1224.21C1886.84 1223.12 1888.88 1221.96 1890.98 1220.73C1892.94 1219.71 1894.82 1218.55 1896.78 1217.39C1899.54 1215.79 1902.22 1214.2 1904.91 1212.46C1907.01 1211.15 1909.12 1209.78 1911.22 1208.32C1927.63 1197.51 1943.95 1184.82 1960.27 1170.09Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1367.08 947.37C1263.74 949.5 1222.28 755.48 1363.32 771.59V916.96C1364.22 927.34 1365.45 937.48 1367.08 947.37Z" fill="#FBD6A2"></path><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M1367.08 947.37C1263.74 949.5 1222.28 755.48 1363.32 771.59V772.9C1284.01 790.23 1302.33 904.12 1365.77 937.89C1366.1 941.08 1366.59 944.26 1367.08 947.37Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1365.44 964.89C1327.36 964.89 1292.47 942.48 1271.81 904.6C1250.28 865.13 1249.63 819.94 1270.15 789.46C1280.92 773.46 1307.6 747.61 1365.31 754.2C1374.15 755.21 1380.83 762.69 1380.83 771.59V916.19C1381.71 926.13 1382.89 935.66 1384.36 944.52C1385.19 949.53 1383.8 954.65 1380.55 958.56C1377.31 962.46 1372.53 964.77 1367.45 964.87C1366.77 964.88 1366.11 964.89 1365.44 964.89ZM1345.82 788.17C1328.46 788.44 1309.88 793.11 1299.18 809.01C1286.28 828.16 1287.66 860.58 1302.54 887.84C1313.27 907.5 1329 921.19 1346.7 926.9C1346.41 924.12 1346.14 921.3 1345.89 918.46C1345.85 917.96 1345.82 917.45 1345.82 916.95V788.17Z" fill="#1E2128"></path><path d="M2079.36 971.74C2083.53 954.33 2086.72 936.01 2088.93 916.96V790.89C2116.65 772.99 2141.09 767.92 2161.12 771.6C2249.34 787.61 2253.67 971.74 2079.36 971.74Z" fill="#FBD6A2"></path><path d="M2079.36 974.23H2076.19L2076.93 971.15C2081.05 953.96 2084.24 935.63 2086.44 916.67L2086.43 789.52L2087.57 788.78C2113.79 771.84 2139.38 765.05 2161.57 769.13C2200.87 776.27 2227.24 817.89 2222.91 865.96C2218.42 915.91 2178.12 974.23 2079.36 974.23ZM2091.43 792.25V916.95C2089.33 935.25 2086.34 952.73 2082.52 969.21C2175.61 967.99 2213.67 912.82 2217.94 865.5C2222.03 820.03 2197.42 780.71 2160.68 774.04C2140.06 770.27 2116.15 776.56 2091.43 792.25Z" fill="#1E2128"></path><path d="M2079.36 989.23C2074 989.23 2068.94 986.78 2065.62 982.57C2062.3 978.36 2061.09 972.87 2062.34 967.66C2066.24 951.35 2069.3 933.96 2071.42 915.94V790.89C2071.42 784.95 2074.43 779.42 2079.42 776.19C2108.9 757.14 2138.23 749.59 2164.27 754.38C2211.23 762.91 2242.87 811.46 2237.84 867.3C2232.79 923.55 2188.24 989.23 2079.36 989.23ZM2106.43 800.75V916.95C2106.43 917.62 2106.39 918.3 2106.31 918.96C2104.96 930.6 2103.25 942.03 2101.19 953.13C2170.52 945.86 2199.43 903.77 2203 864.16C2205.89 832.12 2191.1 794.82 2158 788.81C2142.96 786.05 2125.29 790.17 2106.43 800.75Z" fill="#1E2128"></path><path d="M2088.9 722.44V900.11C2088.9 913.89 2087.59 927.68 2084.84 941.24C2072.51 1002.61 2051.76 1054.63 2023.25 1098.01C2004.97 1126.01 1983.35 1150.39 1958.68 1171.43C1827.01 1283.66 1632.51 1275.1 1501.93 1161.49C1447.96 1114.48 1406.82 1052.53 1379.04 972C1378.17 969.53 1377.37 967.07 1376.65 964.53L1376.58 964.46C1367.73 936.09 1363.3 906.5 1363.3 876.75V475.57L2066.93 485.36L2088.9 722.44Z" fill="#FBD6A2"></path><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M1545.67 1169.11C1591.37 1208.94 1644.99 1235.85 1700.99 1249.13C1629.46 1241.22 1559.52 1211.55 1501.92 1161.49C1447.95 1114.48 1406.81 1052.53 1379.03 972C1368.51 941.39 1363.29 909.17 1363.29 876.75V475.57L2066.92 485.36L2067.57 492.47L1407.03 483.26V884.44C1407.03 916.8 1412.25 949.08 1422.77 979.69C1450.56 1060.22 1491.62 1122.1 1545.67 1169.11Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M2088.9 722.44V900.11C2088.9 913.89 2087.59 927.68 2084.84 941.24C2064.53 1042.3 2021.51 1117.89 1958.68 1171.43C1827.01 1283.66 1632.51 1275.1 1501.93 1161.49C1488.07 1149.38 1475.02 1136.39 1462.9 1122.24C1590.29 1202.91 1757.44 1198.85 1874.75 1098.81C1937.58 1045.27 1980.6 969.68 2000.91 868.62C2003.67 855.13 2004.97 841.27 2004.97 827.49V649.9L1989.59 484.28L2066.92 485.37L2088.9 722.44Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1739.82 1268.79C1736.35 1268.79 1732.88 1268.74 1729.4 1268.64C1642.09 1266.16 1557.23 1232.78 1490.46 1174.67C1432.74 1124.43 1390.89 1060.01 1362.52 977.73C1351.44 945.59 1345.82 911.62 1345.82 876.76V643.48C1345.82 633.81 1353.65 625.98 1363.32 625.98C1372.99 625.98 1380.82 633.81 1380.82 643.48V876.76C1380.82 907.73 1385.8 937.86 1395.61 966.32C1421.92 1042.64 1460.46 1102.15 1513.43 1148.26C1639.09 1257.63 1825.64 1261.85 1947.35 1158.08C2008.26 1106.15 2048.75 1032.03 2067.68 937.78C2070.16 925.43 2071.42 912.75 2071.42 900.08V722.45C2071.42 712.78 2079.26 704.95 2088.92 704.95C2098.58 704.95 2106.42 712.78 2106.42 722.45V900.08C2106.42 915.06 2104.93 930.07 2102 944.68C2081.48 1046.81 2037.09 1127.57 1970.06 1184.72C1906.23 1239.14 1824.83 1268.79 1739.82 1268.79Z" fill="#1E2128"></path><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M2220.87 822.93C2197.03 893.79 2153.05 917.41 2088.93 893.79L2085.52 967.37L2160.47 948.97C2160.47 948.98 2232.22 897.2 2220.87 822.93Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M1310.74 475.59C1395.09 580.7 1530.95 615.89 1709.44 604.91C1709.44 604.91 1559.2 666 1450.53 620.3C1341.86 574.59 1319.93 520.56 1310.74 475.59Z" fill="white"></path>
							</g>
						</g>
					</g>
				</g>
			</g>
		</g><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M1544.19 639.62C1512.08 639.62 1479.23 635.08 1449.56 622.6C1342.25 577.46 1317.92 523.21 1308.29 476.09L1306.22 465.96L1312.69 474.02C1391.31 571.99 1521.03 613.99 1709.28 602.41L1724.51 601.47L1710.37 607.22C1709.28 607.67 1629.36 639.62 1544.19 639.62ZM1315.48 485.22C1326.73 530.29 1353.94 576.96 1451.5 617.99C1537.5 654.16 1651.31 622.23 1692.65 608.31C1516.91 616.25 1393.27 575.91 1315.48 485.22Z" fill="#1E2128"></path>
							</g>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M2161.15 771.55C2141.06 767.92 2116.61 773 2088.89 790.85C2028.82 773.29 2007.71 678.33 2005.75 545.64C1760.4 630.45 1481.09 675.43 1363.28 578.87V711.92C934.75 393.08 1391.36 -196.22 2004.37 177.4C1976.58 57.4101 2119.21 31.0701 2073.29 179.79C2073.29 179.79 2074.02 179.14 2075.39 177.83C2076.33 176.96 2077.2 176.16 2078.15 175.29C2078.95 174.64 2079.89 173.77 2080.91 172.9C2134.45 127.49 2180.44 145.55 2185.09 175.95C2189.01 200.4 2166.16 232.83 2099.12 246.54C2291.23 209.75 2321.92 600.13 2161.15 771.55Z" fill="#090909"></path><path d="M1308.13 464.98C1314 485.9 1322.66 505.72 1333.78 523.33C1344.84 540.82 1358.83 556.33 1374.38 565.32L1352.26 592.45C1343.33 583.21 1336.46 573.02 1330.91 562.59C1325.37 552.14 1321.14 541.38 1317.84 530.54C1311.28 508.84 1308.24 486.73 1308.13 464.98Z" fill="#090909"></path><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M2010.83 190.75C1743.27 38.31 1507.99 68.64 1366.85 176.96C1372.65 232.1 1322.45 298.33 1269.93 287.23C1199.85 410.85 1211.82 569.44 1344.65 697.34C948.47 375.67 1400.51 -190.63 2004.39 177.4C1982.7 83.8101 2064.75 47.18 2080.06 106.23C2057.57 107.26 2032.51 133.07 2033.05 177.29C2033.19 188.96 2020.97 196.53 2010.83 190.75Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M2185.09 175.95C2157.23 170.36 2125.24 182.26 2090.56 205.04C2072.42 215.92 2058.06 202.72 2073.29 179.79C2073.29 179.79 2074.02 179.14 2075.39 177.83C2076.12 177.18 2077.06 176.38 2078.15 175.29C2078.95 174.64 2079.89 173.77 2080.91 172.9C2134.46 127.49 2180.45 145.55 2185.09 175.95Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M2088.93 808.39C2087.28 808.39 2085.63 808.16 2084.02 807.69C2024.29 790.22 1993.84 714.42 1988.87 569.81C1860.67 612.22 1541.74 702.36 1380.83 611.86V711.91C1380.83 718.53 1377.1 724.58 1371.19 727.55C1365.27 730.52 1358.2 729.9 1352.89 725.95C1144.6 570.98 1144.79 363.13 1237.38 225.89C1302.48 129.39 1413.61 63.56 1542.26 45.28C1680.98 25.57 1832.81 59.92 1983.3 144.74C1984.08 106.69 2001.65 81.03 2019.75 69.28C2038.63 57.03 2060.48 57.06 2076.75 69.37C2085.99 76.35 2103.16 95.49 2099.43 139.51C2129.7 124.2 2156.42 125.91 2174.11 134.95C2194.45 145.35 2205.65 166.31 2202.65 188.34C2200.19 206.42 2189.2 222.63 2171.3 235.73C2200.65 247.73 2225.68 271.42 2244.67 305.9C2309.21 423.1 2292.35 657.29 2173.9 783.56C2169.83 787.9 2163.84 789.88 2157.97 788.8C2140.87 785.66 2120.29 791.47 2098.44 805.58C2095.57 807.43 2092.26 808.39 2088.93 808.39ZM2005.78 528.11C2009.33 528.11 2012.85 529.19 2015.83 531.28C2020.42 534.5 2023.2 539.74 2023.28 545.35C2025.22 676.82 2046.66 752.82 2087.03 771.53C2110.2 758.1 2133.17 751.85 2154.22 753.15C2200.09 700.88 2232.37 623.37 2243.23 538.86C2253.86 456.12 2242.93 375.34 2213.99 322.78C2187.41 274.51 2149.9 254.63 2102.44 263.72C2093.03 265.52 2083.86 259.37 2081.98 249.94C2080.11 240.5 2086.21 231.32 2095.63 229.39C2145.82 219.1 2165.95 198.3 2167.94 183.62C2168.95 176.19 2165.38 169.8 2158.15 166.11C2144.61 159.19 2117.44 161.95 2085.36 192.49C2079.59 197.98 2070.83 198.88 2064.08 194.69C2057.31 190.49 2054.23 182.26 2056.58 174.65C2071.73 125.61 2063.1 102.94 2055.62 97.28C2049.46 92.62 2041.8 96.68 2038.78 98.64C2023.78 108.38 2012.59 135.28 2021.43 173.45C2023.02 180.31 2020.34 187.46 2014.63 191.59C2008.91 195.72 2001.29 196.01 1995.27 192.35C1841.99 98.93 1687.03 60.0601 1547.16 79.9301C1428.29 96.8201 1325.94 157.16 1266.37 245.46C1187.39 362.53 1184.1 537.43 1345.81 675.6V578.89C1345.81 572.12 1349.71 565.97 1355.82 563.07C1361.94 560.18 1369.17 561.07 1374.4 565.35C1488.35 658.75 1772.3 607.85 2000.04 529.07C2001.92 528.43 2003.86 528.11 2005.78 528.11Z" fill="#1E2128"></path><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M2161.12 771.59C2141.09 767.91 2116.64 772.98 2088.93 790.88C2028.84 773.3 2007.74 678.3 2005.78 545.6C1760.42 630.47 1481.13 675.43 1363.32 578.88V711.9C1299.14 664.15 1256.38 610.11 1231.85 554.02V553.94C1278.94 594 1304.01 573.66 1311.21 482.34C1370.16 724.55 1812.99 643.06 1963.51 432.09C1984.46 402.73 2035.38 426.93 2051.5 459.19C2143.88 644.08 2319.88 443.7 2175.84 257.41C2175.92 257.41 2176 257.49 2176.17 257.49C2177.4 258.39 2181.32 260.84 2187.45 264.77C2296.03 343.99 2292.84 631.21 2161.12 771.59Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.15"><g opacity="0.15"><g opacity="0.15"><g opacity="0.15"><g opacity="0.15"><g opacity="0.15"><path opacity="0.15" d="M1634.5 290.103C1697.94 278.606 1744.81 244.069 1739.17 212.962C1733.53 181.855 1677.53 165.958 1614.08 177.454C1550.64 188.951 1503.77 223.488 1509.41 254.595C1515.04 285.702 1571.05 301.599 1634.5 290.103Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1552.51 710.5C1539.56 708.65 1527.62 706.59 1516.15 705.13C1504.68 703.65 1493.71 702.92 1483.04 703.09C1472.31 703.09 1462.04 704.78 1451.47 707.54C1440.57 709.86 1430.41 715.04 1417.79 719.71L1417.52 719.81C1416.15 720.32 1414.63 719.62 1414.12 718.25C1413.87 717.57 1413.92 716.85 1414.19 716.24C1419.79 703.94 1428.87 692.42 1441.29 685.19C1453.39 677.64 1467.98 673.19 1482.3 673.12C1496.64 672.77 1510.67 675.86 1523.16 681.47C1535.61 687.23 1546.91 695.04 1555.25 706.33C1556.12 707.51 1555.87 709.17 1554.69 710.04C1554.11 710.47 1553.41 710.63 1552.74 710.53L1552.51 710.5Z" fill="#1E2128"></path><path d="M1746.83 699.46C1754.31 688.11 1764.95 680.09 1776.96 674.27C1789 668.62 1802.79 665.39 1816.9 666.27C1823.92 666.72 1830.97 667.99 1837.67 670.31C1844.34 672.7 1850.66 675.97 1856.29 680.03C1867.44 688.33 1875.87 699.35 1879.96 711.96C1880.42 713.38 1879.64 714.91 1878.21 715.37C1877.53 715.59 1876.82 715.53 1876.22 715.24L1876.16 715.21C1864.56 709.71 1854.51 704.88 1844.61 701.63C1834.71 698.44 1825.19 696.67 1815.29 696.2C1805.41 695.64 1795.14 696.4 1784.32 697.82C1773.48 699.24 1762.14 701.44 1749.74 703.5L1749.48 703.54C1748.03 703.78 1746.65 702.8 1746.41 701.35C1746.31 700.67 1746.48 700 1746.83 699.46Z" fill="#1E2128"></path><path d="M1501.6 952.127C1534.43 952.039 1560.95 916.854 1560.84 873.538C1560.72 830.223 1534.01 795.179 1501.18 795.267C1468.34 795.354 1441.82 830.539 1441.94 873.855C1442.05 917.17 1468.76 952.214 1501.6 952.127Z" fill="#1E2128"></path><path d="M1516.6 881.796C1526.52 881.77 1534.53 869.956 1534.49 855.409C1534.45 840.861 1526.38 829.09 1516.46 829.116C1506.54 829.143 1498.53 840.957 1498.57 855.504C1498.61 870.051 1506.68 881.823 1516.6 881.796Z" fill="white"></path><path d="M1855.84 873.836C1855.96 830.52 1829.43 795.335 1796.6 795.247C1763.77 795.16 1737.06 830.204 1736.94 873.519C1736.83 916.835 1763.35 952.02 1796.18 952.108C1829.02 952.195 1855.73 917.151 1855.84 873.836Z" fill="#1E2128"></path><path d="M1799.21 855.495C1799.24 840.948 1791.23 829.133 1781.32 829.107C1771.4 829.08 1763.32 840.852 1763.29 855.399C1763.25 869.946 1771.26 881.761 1781.18 881.787C1791.09 881.813 1799.17 870.042 1799.21 855.495Z" fill="white"></path><path d="M1533.84 1015.34C1532.98 1015.34 1532.11 1015.32 1531.24 1015.29L1424.57 1011.54C1385.88 1010.18 1354.84 978.8 1353.9 940.09L1350.81 812.63C1350.34 793.44 1357.6 775.44 1371.25 761.94C1384.9 748.44 1402.9 741.39 1422.16 742.05L1552.56 746.63C1571.74 747.3 1589.28 755.62 1601.95 770.04C1614.62 784.46 1620.6 802.93 1618.79 822.04L1606.77 948.97C1603.19 986.66 1571.41 1015.34 1533.84 1015.34ZM1532.13 990.31C1557.59 991.21 1579.47 972.02 1581.87 946.62L1593.89 819.69C1595.04 807.51 1591.23 795.74 1583.16 786.54C1575.09 777.35 1563.9 772.05 1551.68 771.62L1421.28 767.04C1409.08 766.63 1397.53 771.11 1388.83 779.72C1380.13 788.33 1375.5 799.8 1375.8 812.03L1378.89 939.49C1379.51 964.99 1399.96 985.66 1425.45 986.56L1532.13 990.31Z" fill="#1E2128"></path><path d="M1754.07 1008.07C1716.5 1008.07 1684.72 979.39 1681.16 941.71L1669.14 814.78C1667.33 795.67 1673.31 777.2 1685.98 762.78C1698.65 748.36 1716.19 740.04 1735.37 739.37L1865.77 734.79C1884.92 734.14 1903.04 741.18 1916.69 754.68C1930.34 768.18 1937.59 786.18 1937.12 805.37L1934.03 932.83C1933.1 971.53 1902.05 1002.92 1863.36 1004.28L1756.69 1008.02C1755.8 1008.05 1754.93 1008.07 1754.07 1008.07ZM1756.22 995.53H1756.27H1756.22ZM1868.22 759.74C1867.69 759.74 1867.16 759.75 1866.62 759.77L1736.22 764.35C1723.99 764.78 1712.81 770.08 1704.74 779.27C1696.67 788.46 1692.86 800.24 1694.01 812.42L1706.03 939.35C1708.43 964.74 1730.34 983.88 1755.77 983.04L1862.44 979.29C1887.93 978.39 1908.38 957.72 1909 932.22L1912.09 804.75C1912.39 792.52 1907.76 781.05 1899.06 772.44C1890.76 764.22 1879.86 759.74 1868.22 759.74Z" fill="#1E2128"></path><path d="M1681.54 854.44C1679.11 854.44 1676.66 853.73 1674.5 852.26C1653.32 837.8 1633.58 837.8 1612.4 852.26C1606.69 856.15 1598.92 854.68 1595.03 848.99C1591.14 843.29 1592.6 835.51 1598.3 831.62C1627.84 811.45 1659.06 811.45 1688.59 831.62C1694.29 835.51 1695.76 843.29 1691.86 848.99C1689.46 852.54 1685.54 854.44 1681.54 854.44Z" fill="#1E2128"></path><path d="M1924.61 835.44C1918.4 835.44 1913.02 830.82 1912.22 824.5C1911.36 817.65 1916.21 811.4 1923.06 810.54L2078.48 790.98C2085.39 790.13 2091.59 794.98 2092.44 801.82C2093.3 808.67 2088.45 814.92 2081.6 815.78L1926.18 835.34C1925.65 835.4 1925.13 835.44 1924.61 835.44Z" fill="#1E2128"></path><path d="M1956 1296.49C1954.22 1296.49 1952.41 1296.22 1950.62 1295.64C1941.43 1292.67 1936.37 1282.81 1939.34 1273.61C1941.62 1266.54 1942.78 1259.03 1942.78 1251.27V1170.09C1942.78 1160.42 1950.62 1152.59 1960.28 1152.59C1969.94 1152.59 1977.78 1160.42 1977.78 1170.09V1251.27C1977.78 1262.68 1976.06 1273.81 1972.65 1284.36C1970.25 1291.77 1963.38 1296.49 1956 1296.49Z" fill="#1E2128"></path><path d="M1766.44 1324.41C1761.13 1324.41 1755.88 1322 1752.44 1317.43C1737.99 1298.22 1730.35 1275.37 1730.35 1251.34C1730.35 1241.67 1738.18 1233.8 1747.85 1233.8C1757.52 1233.8 1765.35 1241.6 1765.35 1251.26C1765.35 1267.71 1770.56 1283.29 1780.41 1296.38C1786.22 1304.1 1784.67 1315.07 1776.95 1320.88C1773.8 1323.27 1770.1 1324.41 1766.44 1324.41Z" fill="#1E2128"></path><path d="M1783.74 1779.04L1624.6 1738.22C1603.91 1732.91 1582.01 1734.92 1562.63 1743.91L1497.48 1774.11C1476.43 1783.87 1459.81 1801.17 1450.91 1822.59L1435.36 1859.99C1424.98 1884.97 1443.33 1912.47 1470.38 1912.47H1572.72C1577.66 1912.47 1582.56 1911.59 1587.19 1909.86L1640.06 1890.19C1648.74 1887.73 1657.98 1888.13 1666.4 1891.34L1690.12 1900.36C1701.94 1904.86 1714.56 1906.88 1727.19 1906.32L1783.75 1903.78V1779.04H1783.74Z" fill="#FDBD91"></path><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M1783.73 1789.59V1823.18L1635.15 1785.05C1614.52 1779.76 1592.62 1781.77 1573.19 1790.78L1508.1 1820.94C1487.02 1830.7 1470.42 1848.05 1461.48 1869.42L1445.99 1906.88C1445.25 1908.74 1444.57 1910.6 1444.2 1912.47C1433.48 1902.27 1428.93 1885.88 1435.34 1870.54L1450.91 1833.15C1459.85 1811.7 1476.46 1794.42 1497.46 1784.67L1562.63 1754.43C1581.99 1745.49 1603.89 1743.48 1624.59 1748.77L1783.73 1789.59Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1572.71 1929.97H1470.37C1451.81 1929.97 1434.57 1920.75 1424.27 1905.31C1413.96 1889.87 1412.07 1870.42 1419.19 1853.27L1434.73 1815.87C1445.35 1790.33 1465.01 1769.86 1490.1 1758.23L1555.25 1728.03C1578.23 1717.38 1604.4 1714.98 1628.93 1721.27L1788.08 1762.09C1795.82 1764.07 1801.23 1771.05 1801.23 1779.04V1903.79C1801.23 1913.15 1793.86 1920.85 1784.51 1921.27L1727.95 1923.81C1712.83 1924.5 1698.01 1922.11 1683.88 1916.72L1660.17 1907.7C1655.48 1905.92 1650.26 1905.62 1645.4 1906.87L1593.28 1926.26C1586.69 1928.73 1579.77 1929.97 1572.71 1929.97ZM1783.74 1903.79H1783.79H1783.74ZM1601.62 1752.82C1590.76 1752.82 1579.94 1755.16 1569.98 1759.78L1504.83 1789.99C1487.71 1797.92 1474.3 1811.89 1467.05 1829.32L1451.51 1866.72C1448.85 1873.13 1449.53 1880.12 1453.38 1885.9C1457.23 1891.67 1463.42 1894.99 1470.37 1894.99H1572.71C1575.58 1894.99 1578.4 1894.48 1581.08 1893.48L1633.95 1873.81C1634.39 1873.65 1634.83 1873.5 1635.28 1873.38C1647.49 1869.92 1660.75 1870.49 1672.62 1875.01L1696.34 1884.03C1705.98 1887.7 1716.1 1889.33 1726.4 1888.86L1766.24 1887.07V1792.63L1620.25 1755.18C1614.14 1753.6 1607.87 1752.82 1601.62 1752.82Z" fill="#1E2128"></path><path d="M2135.18 2055.97C2135.03 2055.97 2134.88 2055.97 2134.74 2055.97L1194.97 2032.1C1189.87 2031.97 1185.08 2029.62 1181.86 2025.67C1178.64 2021.72 1177.29 2016.56 1178.19 2011.54L1219.69 1778.16C1221.17 1769.81 1228.44 1763.72 1236.92 1763.72H1327.75L1458.1 1487.06C1482.66 1432.62 1526.68 1389.6 1581.94 1366.18L1759.6 1290.81C1767.03 1287.66 1775.64 1290 1780.46 1296.46C1788.44 1307.16 1799.25 1315.59 1811.73 1320.82C1813.99 1321.8 1816.16 1322.6 1818.37 1323.28C1821.58 1324.28 1824.9 1325.07 1828.29 1325.65C1828.79 1325.71 1829.28 1325.78 1829.77 1325.88C1831.67 1326.18 1833.8 1326.41 1836.6 1326.61C1839 1326.79 1841.33 1326.63 1843.68 1326.94C1843.88 1326.96 1844.26 1326.93 1844.64 1326.93C1844.84 1326.93 1845.04 1326.93 1845.24 1326.94C1851.15 1327.15 1857.14 1327.14 1863.04 1326.94C1866.02 1326.87 1868.7 1326.81 1871.45 1326.61C1874.58 1326.39 1876.85 1326.14 1878.83 1325.8C1882.66 1325.18 1886.24 1324.35 1889.64 1323.29C1891.89 1322.6 1894.06 1321.8 1896.15 1320.89C1917.04 1312.19 1932.67 1295.06 1939.27 1273.8C1940.84 1268.73 1944.63 1264.65 1949.56 1262.71C1954.5 1260.77 1960.04 1261.16 1964.65 1263.79L2172.14 1382.19C2226.92 1413.49 2261.39 1469.74 2264.38 1532.66L2276.06 1776.62C2276.06 1776.63 2276.06 1776.63 2276.06 1776.63C2277.9 1815.51 2264.12 1852.44 2237.25 1880.61C2214.45 1904.52 2184.9 1919.31 2152.67 1923.25V2038.48C2152.67 2043.2 2150.77 2047.72 2147.39 2051.01C2144.13 2054.19 2139.74 2055.97 2135.18 2055.97ZM1216.21 1997.63L2117.68 2020.53V1906.8C2117.68 1897.13 2125.52 1889.3 2135.18 1889.3C2164.47 1889.3 2191.72 1877.63 2211.93 1856.45C2232.13 1835.28 2242.49 1807.52 2241.1 1778.29L2229.42 1534.32C2227.01 1483.41 2199.11 1437.9 2154.79 1412.58L1964.39 1303.93C1952.51 1325.88 1933.4 1343.29 1909.83 1353.1C1906.78 1354.42 1903.38 1355.67 1899.96 1356.72C1895.05 1358.24 1889.85 1359.46 1884.56 1360.31C1881.57 1360.82 1878.25 1361.2 1873.95 1361.5C1870.65 1361.74 1867.41 1361.82 1864.1 1361.9C1857.63 1362.12 1850.93 1362.13 1844.33 1361.9C1843.26 1361.9 1841.92 1361.89 1840.4 1361.75C1838.29 1361.73 1836.22 1361.64 1834.09 1361.49C1830.17 1361.21 1827.04 1360.87 1824.05 1360.38C1823.87 1360.36 1823.68 1360.33 1823.5 1360.3C1818.21 1359.45 1813.01 1358.23 1808.04 1356.69C1804.66 1355.65 1801.26 1354.4 1798 1352.99C1784.26 1347.22 1771.8 1338.69 1761.47 1328.01L1595.6 1398.38C1548.47 1418.36 1510.92 1455.05 1489.87 1501.7L1354.67 1788.67C1351.78 1794.8 1345.61 1798.71 1338.84 1798.71H1251.57L1216.21 1997.63Z" fill="#1E2128"></path><path d="M2040.65 1592.89C2047.83 1627.83 2051.47 1662.77 2054.59 1697.71C2055.27 1706.45 2055.95 1715.18 2056.45 1723.92L2056.84 1730.47L2056.94 1732.11C2056.97 1732.7 2056.95 1733.8 2056.95 1734.62C2056.97 1736.4 2056.76 1738.18 2056.52 1739.96C2055.44 1747.06 2052.51 1753.94 2048.07 1759.67C2043.65 1765.44 2037.69 1770.06 2030.87 1772.91C2027.49 1774.37 2023.89 1775.36 2020.24 1775.9L2017.5 1776.23L2015.67 1776.4L2012.41 1776.69C2003.7 1777.47 1995 1778.26 1986.28 1778.84C1951.44 1781.58 1916.53 1783.14 1881.61 1784.43C1846.69 1785.76 1811.77 1787.05 1776.88 1788.93L1793.44 1771.43L1793.42 1906.8L1775.92 1889.3H2135.17C2144.83 1889.3 2152.67 1897.14 2152.67 1906.8C2152.67 1916.47 2144.83 1924.3 2135.17 1924.3H1775.92C1766.25 1924.3 1758.42 1916.47 1758.42 1906.8L1758.39 1771.43C1758.39 1762.1 1765.76 1754.46 1774.96 1753.93C1809.85 1751.98 1844.7 1749.45 1879.55 1746.95C1914.4 1744.41 1949.27 1742.14 1984.2 1741.06C1992.93 1740.68 2001.67 1740.52 2010.4 1740.34L2015.63 1740.23C2016.31 1740.21 2016.99 1740.14 2017.64 1739.93C2018.97 1739.58 2020.22 1738.82 2021.34 1737.83C2022.44 1736.82 2023.28 1735.51 2023.77 1734.02C2023.84 1733.64 2024.04 1733.27 2024.08 1732.86C2024.12 1732.59 2024.18 1732.6 2024.22 1732.1L2024.32 1730.46L2024.72 1723.91C2025.23 1715.18 2025.92 1706.44 2026.6 1697.71C2029.77 1662.77 2033.44 1627.83 2040.65 1592.89Z" fill="#1E2128"></path><path d="M1608.08 1566.99L1590.94 1738.17C1589.97 1747.84 1581.35 1754.89 1571.68 1753.92C1562.01 1752.95 1554.96 1744.33 1555.93 1734.66C1556.05 1733.48 1556.31 1732.25 1556.65 1731.15L1608.08 1566.99Z" fill="#1E2128"></path><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M2135.18 1906.3H2134.68V1906.8V2018.98L1871.02 2031.29L1728.21 2037.91L1736.55 2028.63L1757.59 2005.27L1757.77 2005.08L1757.71 2004.83L1736.71 1912.84L1783.86 1904.22L1784.26 1904.15L1784.27 1903.74L1786.07 1843.33L2092 1821.87C2126.56 1819.45 2152.74 1789.68 2150.72 1755.1L2139.43 1561.41C2137.08 1521.05 2114.68 1484.56 2079.76 1464.2L1874.35 1344.41C1876.87 1344.2 1879.38 1343.93 1881.86 1343.5C1886.38 1342.77 1890.76 1341.75 1894.99 1340.44C1897.83 1339.56 1900.61 1338.54 1903.31 1337.37C1928.5 1326.87 1948.01 1305.74 1956.29 1279.69L2163.23 1397.78C2212.34 1425.85 2243.73 1476.98 2246.41 1533.47L2258.08 1777.47C2261.41 1847.63 2205.4 1906.3 2135.18 1906.3Z" fill="#1E2128" stroke="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1757.04 1962.35C1757.04 1978.75 1750.38 1993.66 1739.62 2004.42C1728.85 2015.19 1713.98 2021.84 1697.55 2021.84H1311.85C1278.98 2021.84 1252.35 1995.17 1252.35 1962.34C1252.35 1945.91 1259.01 1931.03 1269.77 1920.23C1280.54 1909.46 1295.41 1902.81 1311.84 1902.81H1697.54C1730.41 1902.81 1757.04 1929.48 1757.04 1962.35Z" fill="#D0D0D0"></path><path d="M1697.54 2039.35H1311.84C1269.38 2039.35 1234.84 2004.81 1234.84 1962.35C1234.84 1941.81 1242.84 1922.46 1257.37 1907.88C1271.93 1893.32 1291.27 1885.31 1311.84 1885.31H1697.54C1740 1885.31 1774.54 1919.87 1774.54 1962.35C1774.54 1982.92 1766.53 2002.26 1751.99 2016.8C1737.45 2031.34 1718.11 2039.35 1697.54 2039.35ZM1311.84 1920.31C1300.62 1920.31 1290.07 1924.68 1282.14 1932.61C1274.22 1940.56 1269.84 1951.13 1269.84 1962.35C1269.84 1985.51 1288.68 2004.35 1311.84 2004.35H1697.54C1708.76 2004.35 1719.31 1999.98 1727.24 1992.05C1735.17 1984.12 1739.54 1973.57 1739.54 1962.35C1739.54 1939.17 1720.7 1920.31 1697.54 1920.31H1311.84Z" fill="#1E2128"></path><path d="M1311.84 2021.85H472.42C439.55 2021.85 412.89 1995.18 412.89 1962.35C412.89 1945.92 419.55 1931.04 430.35 1920.24C441.12 1909.47 455.99 1902.82 472.42 1902.82H1311.84C1295.41 1902.82 1280.53 1909.48 1269.77 1920.24C1259 1931.04 1252.35 1945.92 1252.35 1962.35C1252.34 1995.18 1278.97 2021.85 1311.84 2021.85Z" fill="#D0D0D0"></path><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M511.65 2021.85H477.41C444.54 2021.85 417.88 1995.18 417.88 1962.35C417.88 1945.92 424.54 1931.04 435.34 1920.24C446.11 1909.47 460.98 1902.82 477.41 1902.82H511.65C495.22 1902.82 480.34 1909.48 469.58 1920.24C458.78 1931.04 452.12 1945.92 452.12 1962.35C452.12 1995.18 478.79 2021.85 511.65 2021.85Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1697.54 2039.35H1311.84C1269.38 2039.35 1234.84 2004.81 1234.84 1962.35C1234.84 1941.81 1242.84 1922.46 1257.37 1907.88C1271.93 1893.32 1291.27 1885.31 1311.84 1885.31H1697.54C1740 1885.31 1774.54 1919.87 1774.54 1962.35C1774.54 1982.92 1766.53 2002.26 1751.99 2016.8C1737.45 2031.34 1718.11 2039.35 1697.54 2039.35ZM1311.84 1920.31C1300.62 1920.31 1290.07 1924.68 1282.14 1932.61C1274.22 1940.56 1269.84 1951.13 1269.84 1962.35C1269.84 1985.51 1288.68 2004.35 1311.84 2004.35H1697.54C1708.76 2004.35 1719.31 1999.98 1727.24 1992.05C1735.17 1984.12 1739.54 1973.57 1739.54 1962.35C1739.54 1939.17 1720.7 1920.31 1697.54 1920.31H1311.84Z" fill="#1E2128"></path><path d="M1311.84 2039.35H472.42C429.94 2039.35 395.39 2004.81 395.39 1962.35C395.39 1941.78 403.41 1922.43 417.98 1907.86C432.52 1893.32 451.86 1885.31 472.43 1885.31H1311.85C1321.52 1885.31 1329.35 1893.14 1329.35 1902.81C1329.35 1912.48 1321.52 1920.31 1311.85 1920.31C1300.63 1920.31 1290.08 1924.68 1282.15 1932.61C1274.23 1940.56 1269.85 1951.13 1269.85 1962.35C1269.85 1985.51 1288.69 2004.35 1311.85 2004.35C1321.52 2004.35 1329.35 2012.18 1329.35 2021.85C1329.34 2031.51 1321.51 2039.35 1311.84 2039.35ZM472.42 1920.31C461.2 1920.31 450.65 1924.68 442.72 1932.61C434.76 1940.57 430.38 1951.13 430.38 1962.35C430.38 1985.51 449.24 2004.35 472.41 2004.35H1247.32C1239.42 1992.26 1234.83 1977.84 1234.83 1962.35C1234.83 1947.21 1239.18 1932.72 1247.28 1920.31H472.42Z" fill="#1E2128"></path><path d="M1228.47 1952.26C1223.87 1953.48 1219.3 1954.12 1214.78 1954.16H412.18C410.58 1954.24 408.98 1954.2 407.42 1954.12C383.91 1952.94 362.76 1936.89 356.29 1912.92L170.12 1227C162.06 1197.25 179.63 1166.59 209.42 1158.45C214.29 1157.12 219.23 1156.47 224.07 1156.47C224.83 1156.47 225.59 1156.47 226.35 1156.58L1025.79 1156.5C1026.4 1156.46 1027.01 1156.46 1027.62 1156.46C1052.27 1156.46 1074.83 1172.86 1081.56 1197.74L1267.74 1883.67C1275.83 1913.46 1258.26 1944.16 1228.47 1952.26Z" fill="#B8C5D3"></path><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M250.99 1156.59H245.28C246.46 1156.51 247.64 1156.48 248.78 1156.48C249.55 1156.47 250.23 1156.47 250.99 1156.59Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M251 1174.09H245.29L244.17 1139.13C245.73 1139.03 247.29 1138.98 248.79 1138.98C249.89 1138.98 251.55 1138.98 253.6 1139.29L251 1174.09Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><path opacity="0.6" d="M1002.43 1156.52L985.99 1186.94H982.96L971.78 1216.1H210.37C204.71 1216.1 200.36 1221.42 201.82 1226.89C201.83 1226.93 201.84 1226.96 201.85 1227L388 1912.94C394.52 1937.07 415.95 1953.19 439.61 1954.17H419.16C393.82 1955.1 370.2 1938.52 363.26 1912.94L177.3 1227.7L177.11 1227C169.05 1197.23 186.61 1166.58 216.38 1158.43C221.27 1157.13 226.21 1156.47 231.05 1156.47C231.8 1156.47 232.54 1156.47 233.33 1156.56H257.97L1002.43 1156.52Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1213.7 1971.72C1180.55 1971.72 1151.72 1949.76 1143.01 1917.5L956.83 1231.59C946.25 1192.59 969.39 1152.2 1008.43 1141.56C1015.99 1139.51 1023.67 1138.41 1031.25 1139.11C1063.09 1140.61 1090.04 1162.26 1098.43 1193.17L1284.62 1879.1C1289.77 1897.97 1287.25 1917.74 1277.52 1934.76C1267.78 1951.79 1251.99 1964 1233.06 1969.14C1233.03 1969.15 1233 1969.16 1232.96 1969.16C1227.45 1970.62 1221.88 1971.47 1216.41 1971.66C1215.5 1971.71 1214.6 1971.72 1213.7 1971.72ZM1228.47 1952.25H1228.52H1228.47ZM1027.66 1173.97C1024.35 1173.97 1020.97 1174.43 1017.61 1175.34C997.2 1180.9 985.08 1202.03 990.62 1222.43L1176.8 1908.36C1181.48 1925.7 1197.22 1937.33 1215.15 1936.7C1218 1936.6 1220.96 1936.14 1223.95 1935.35C1233.82 1932.66 1242.06 1926.28 1247.14 1917.39C1252.23 1908.5 1253.55 1898.17 1250.85 1888.31L1064.66 1202.35C1060.24 1186.08 1046.02 1174.71 1029.28 1174.07C1028.88 1174.05 1028.48 1174.02 1028.08 1173.98L1027.66 1173.97ZM1027.61 1173.92C1027.63 1173.92 1027.65 1173.92 1027.67 1173.93C1027.65 1173.92 1027.63 1173.92 1027.61 1173.92Z" fill="#1E2128"></path><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M1228.47 1959.27C1224.25 1960.39 1219.99 1961.05 1215.77 1961.2C1190.43 1962.11 1166.81 1945.56 1159.9 1919.96L973.71 1234.03C965.63 1204.27 983.21 1173.59 1013.02 1165.47C1017.9 1164.15 1022.82 1163.49 1027.65 1163.49C1028.41 1163.49 1029.17 1163.49 1029.94 1163.59C1053.61 1164.5 1074.99 1180.65 1081.54 1204.78L1267.73 1890.71C1275.85 1920.47 1258.23 1951.2 1228.47 1959.27Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M410.07 1971.7C376.94 1971.7 348.1 1949.74 339.38 1917.5L153.21 1231.59C142.65 1192.61 165.78 1152.23 204.78 1141.57C211.09 1139.85 217.57 1138.97 224.04 1138.97C224.85 1138.97 225.96 1138.97 227.28 1139.08L1025.34 1139C1026.09 1138.97 1026.85 1138.96 1027.61 1138.96C1060.68 1138.96 1089.81 1161.25 1098.45 1193.16L1284.62 1879.07C1295.24 1918.1 1272.11 1958.51 1233.07 1969.13C1233.03 1969.14 1232.99 1969.15 1232.95 1969.16C1226.9 1970.76 1220.84 1971.59 1214.92 1971.64H412.45C411.66 1971.69 410.86 1971.7 410.07 1971.7ZM1228.47 1952.26H1228.52H1228.47ZM224.35 1173.98C220.58 1173.99 217.26 1174.45 214.01 1175.34C193.59 1180.92 181.47 1202.05 186.99 1222.43L373.17 1908.35C377.86 1925.69 393.59 1937.34 411.53 1936.68C411.74 1936.67 411.95 1936.67 412.16 1936.67H1214.78C1217.61 1936.65 1220.74 1936.21 1223.95 1935.36C1244.34 1929.78 1256.4 1908.67 1250.85 1888.27L1064.67 1202.34C1060.15 1185.64 1044.91 1173.98 1027.62 1173.98H1026.88C1026.63 1173.99 1026.05 1174.01 1025.8 1174.01L226.34 1174.09C225.67 1174.09 225 1174.05 224.35 1173.98ZM223.71 1173.89C223.74 1173.89 223.76 1173.9 223.79 1173.9C223.76 1173.9 223.74 1173.9 223.71 1173.89Z" fill="#1E2128"></path><path d="M670.486 1666.47C693.554 1657.85 699.971 1618 684.819 1577.48C669.667 1536.95 638.685 1511.09 615.617 1519.71C592.549 1528.34 586.132 1568.18 601.284 1608.71C616.436 1649.24 647.419 1675.1 670.486 1666.47Z" fill="#1E2128"></path><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M1021.13 1401.67C1074.03 1793.89 858.32 1946.29 480.73 1954.16H1175.94L1163.58 1930.76L1021.13 1401.67Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M1609.39 1970.77H1659.28C1661.83 1970.77 1663.89 1968.7 1663.89 1966.16V1951.51C1663.89 1948.96 1661.82 1946.89 1659.28 1946.89H1609.39C1606.84 1946.89 1604.78 1948.96 1604.78 1951.51V1966.16C1604.78 1968.71 1606.84 1970.77 1609.39 1970.77Z" fill="#1E2128"></path><path d="M1526.63 1970.77H1576.52C1579.07 1970.77 1581.13 1968.7 1581.13 1966.16V1951.51C1581.13 1948.96 1579.06 1946.89 1576.52 1946.89H1526.63C1524.08 1946.89 1522.02 1948.96 1522.02 1951.51V1966.16C1522.02 1968.71 1524.08 1970.77 1526.63 1970.77Z" fill="#1E2128"></path><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M1757.04 1955.36C1757.04 1971.76 1750.38 1986.67 1739.62 1997.43C1728.85 2008.2 1713.98 2014.85 1697.55 2014.85H1311.85C1278.98 2014.85 1252.35 1988.18 1252.35 1955.35C1252.35 1938.92 1259.01 1924.04 1269.77 1913.24C1280.54 1902.47 1295.41 1895.82 1311.84 1895.82H1697.54C1730.41 1895.83 1757.04 1922.49 1757.04 1955.36Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.32"><g opacity="0.32"><g opacity="0.32"><g opacity="0.32"><g opacity="0.32"><g opacity="0.32"><path opacity="0.32" d="M327.31 1475.93C312.34 1416.94 304.11 1368.13 337.82 1359.57C371.53 1351.02 410.99 1391.9 425.96 1450.9C440.93 1509.9 425.73 1564.65 392.02 1573.2C358.31 1581.75 342.28 1534.92 327.31 1475.93Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.32"><g opacity="0.32"><g opacity="0.32"><g opacity="0.32"><g opacity="0.32"><g opacity="0.32"><path opacity="0.32" d="M383.64 1683.86C377.53 1659.76 375.15 1639.58 397.44 1633.92C419.74 1628.26 442.77 1643.21 448.88 1667.31C454.99 1691.41 441.88 1715.52 419.58 1721.18C397.28 1726.83 389.75 1707.95 383.64 1683.86Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M2994.53 2127.58H178.7C149.62 2127.58 126.04 2104 126.04 2074.92C126.04 2045.84 149.62 2022.26 178.7 2022.26H2994.53C3023.61 2022.26 3047.19 2045.84 3047.19 2074.92C3047.19 2104.01 3023.61 2127.58 2994.53 2127.58Z" fill="#666666"></path><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><g opacity="0.55"><path opacity="0.55" d="M3047.2 2074.9C3047.2 2081.57 3045.98 2087.88 3043.72 2093.74C3036.13 2073.98 3016.94 2059.95 2994.51 2059.95H178.71C164.16 2059.95 151 2065.86 141.44 2075.37C136.28 2080.53 132.17 2086.79 129.5 2093.74C127.24 2087.89 126.02 2081.57 126.02 2074.9C126.02 2060.41 131.93 2047.19 141.44 2037.69C151 2028.18 164.16 2022.27 178.71 2022.27H2994.51C3023.61 2022.27 3047.2 2045.86 3047.2 2074.9Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M2994.53 2145.08H178.71C140.02 2145.08 108.55 2113.61 108.55 2074.92C108.55 2036.23 140.02 2004.76 178.71 2004.76H2994.54C3033.23 2004.76 3064.7 2036.23 3064.7 2074.92C3064.69 2113.61 3033.22 2145.08 2994.53 2145.08ZM178.71 2039.76C159.32 2039.76 143.55 2055.53 143.55 2074.92C143.55 2094.31 159.32 2110.08 178.71 2110.08H2994.54C3013.93 2110.08 3029.7 2094.31 3029.7 2074.92C3029.7 2055.53 3013.93 2039.76 2994.54 2039.76H178.71Z" fill="#1E2128"></path><path d="M2345.98 1918C2345.98 1886.97 2371.14 1861.81 2402.17 1861.81H2876.76C2890.24 1861.81 2901.17 1850.88 2901.17 1837.4C2901.17 1823.92 2890.24 1812.99 2876.76 1812.99H2397.69C2339.7 1812.99 2292.69 1860 2292.69 1917.99C2292.69 1975.98 2339.7 2022.99 2397.69 2022.99H2876.76C2890.24 2022.99 2901.17 2012.06 2901.17 1998.58C2901.17 1985.1 2890.24 1974.17 2876.76 1974.17H2402.17C2371.14 1974.19 2345.98 1949.03 2345.98 1918Z" fill="#34A958"></path><path d="M2876.76 2035.5H2397.69C2332.9 2035.5 2280.19 1982.79 2280.19 1918C2280.19 1853.21 2332.9 1800.5 2397.69 1800.5H2876.76C2897.11 1800.5 2913.67 1817.06 2913.67 1837.41C2913.67 1857.76 2897.11 1874.32 2876.76 1874.32H2402.18C2378.09 1874.32 2358.49 1893.92 2358.49 1918.01C2358.49 1942.1 2378.09 1961.7 2402.18 1961.7H2876.76C2897.11 1961.7 2913.67 1978.25 2913.67 1998.6C2913.67 2018.94 2897.11 2035.5 2876.76 2035.5ZM2397.69 1825.5C2346.68 1825.5 2305.19 1866.99 2305.19 1918C2305.19 1969.01 2346.68 2010.5 2397.69 2010.5H2876.76C2883.33 2010.5 2888.67 2005.16 2888.67 1998.59C2888.67 1992.02 2883.33 1986.69 2876.76 1986.69H2402.18C2364.3 1986.69 2333.49 1955.88 2333.49 1918C2333.49 1880.13 2364.3 1849.31 2402.18 1849.31H2876.76C2883.33 1849.31 2888.67 1843.97 2888.67 1837.4C2888.67 1830.83 2883.33 1825.49 2876.76 1825.49H2397.69V1825.5Z" fill="#1E2128"></path><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><path opacity="0.5" d="M2876.76 1985.9H2402.17C2385.43 1985.9 2370.12 1979.78 2358.27 1969.71C2370.73 1984.37 2389.27 1993.71 2409.98 1993.71H2884.57C2886.03 1993.71 2887.4 1994.01 2888.71 1994.46C2886.98 1989.49 2882.3 1985.9 2876.76 1985.9Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><path opacity="0.5" d="M2312.21 1925.81C2312.21 1874.37 2354.06 1832.52 2405.5 1832.52H2884.57C2886.03 1832.52 2887.4 1832.82 2888.71 1833.27C2886.98 1828.31 2882.31 1824.71 2876.77 1824.71H2397.7C2346.26 1824.71 2304.41 1866.56 2304.41 1918C2304.41 1945.7 2316.56 1970.61 2335.8 1987.71C2321.13 1971.23 2312.21 1949.54 2312.21 1925.81Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M2398.65 1861.81C2369.56 1861.81 2345.98 1886.97 2345.98 1918C2345.98 1949.03 2369.56 1974.19 2398.65 1974.19H2868.91V1861.81H2398.65Z" fill="white"></path><path d="M2868.91 1985.9H2398.65C2363.15 1985.9 2334.27 1955.44 2334.27 1918C2334.27 1880.56 2363.15 1850.1 2398.65 1850.1H2868.91C2875.38 1850.1 2880.62 1855.34 2880.62 1861.81V1974.19C2880.62 1980.66 2875.38 1985.9 2868.91 1985.9ZM2398.65 1873.52C2376.07 1873.52 2357.69 1893.47 2357.69 1918C2357.69 1942.53 2376.06 1962.48 2398.65 1962.48H2857.2V1873.53H2398.65V1873.52Z" fill="#1E2128"></path><path d="M2497.52 1997.59L2479.77 1983.39C2476.13 1980.48 2470.95 1980.48 2467.31 1983.39L2449.56 1997.59C2445.6 2000.76 2439.73 1997.94 2439.73 1992.87V1920.73C2439.73 1917.12 2442.66 1914.18 2446.28 1914.18H2500.8C2504.41 1914.18 2507.35 1917.11 2507.35 1920.73V1992.87C2507.35 1997.94 2501.48 2000.76 2497.52 1997.59Z" fill="#FFEB3B"></path><path d="M2445.81 2008.94C2443.45 2008.94 2441.07 2008.41 2438.83 2007.34C2433.22 2004.64 2429.73 1999.1 2429.73 1992.87V1920.73C2429.73 1911.61 2437.15 1904.18 2446.27 1904.18H2500.79C2509.92 1904.18 2517.34 1911.6 2517.34 1920.73V1992.87C2517.34 1999.1 2513.85 2004.64 2508.24 2007.33C2502.62 2010.03 2496.12 2009.29 2491.26 2005.4L2473.52 1991.2L2455.8 2005.4C2452.89 2007.74 2449.37 2008.94 2445.81 2008.94ZM2503.77 1989.78H2503.82H2503.77ZM2473.54 1971.18C2477.94 1971.18 2482.34 1972.65 2486.02 1975.59L2497.34 1984.65V1924.19H2449.73V1984.65L2461.06 1975.59C2464.74 1972.65 2469.14 1971.18 2473.54 1971.18Z" fill="#1E2128"></path><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><path opacity="0.5" d="M2457.31 1923.94H2449.5V1985.15L2457.31 1978.91V1923.94Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><path opacity="0.5" d="M2493.68 1975.78C2490.05 1972.87 2485.7 1971.42 2481.35 1971.42C2480.04 1971.42 2478.74 1971.6 2477.45 1971.86C2480.44 1972.47 2483.34 1973.75 2485.87 1975.78L2497.59 1985.15V1978.91L2493.68 1975.78Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M2510.74 1905.17L2709.83 1912.98L2510.74 1920.79C2506.43 1920.96 2502.8 1917.6 2502.63 1913.29C2502.46 1908.98 2505.82 1905.35 2510.13 1905.18C2510.32 1905.16 2510.54 1905.16 2510.74 1905.17Z" fill="#1E2128"></path><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M2871.82 1892.07L2347.2 1940.26L2361.09 1882.18L2383.87 1860.84H2426.81H2871.82V1892.07Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g>
	<g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><path opacity="0.5" d="M2873.82 49.4675L2812.29 0.355713L2669.72 178.99L2731.25 228.102L2873.82 49.4675Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><path opacity="0.5" d="M2986.99 30.5408L2955.14 5.11475L2812.57 183.749L2844.42 209.176L2986.99 30.5408Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.2"><g opacity="0.2"><g opacity="0.2"><g opacity="0.2"><g opacity="0.2"><g opacity="0.2"><path opacity="0.2" d="M3025.9 109.13C3025.9 109.13 2841.37 480.49 2521.88 466.82L2538.14 493.24H3013.71L3038.1 470.88L3038.05 131.74L3025.9 109.13Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g>

	<svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" data-name="Layer 1" viewBox="0 0 512 512" height="55rem" x="1120" y="930"><path fill="#4a4f60" d="M303.325 505.317h-29.532a15.693 15.693 0 1 1 0-31.386h29.532a59.265 59.265 0 0 0 59.247-59.148v-159.77a50.032 50.032 0 0 1 100.063 0v12.782a15.72 15.72 0 0 1-31.439 0v-12.782a18.593 18.593 0 0 0-37.185 0v159.77a90.713 90.713 0 0 1-90.686 90.534Z"></path><path fill="#3b3f4d" d="M397.604 236.452a18.598 18.598 0 0 0-18.593 18.561v159.77a90.713 90.713 0 0 1-90.686 90.534h15a90.713 90.713 0 0 0 90.686-90.534v-159.77a18.577 18.577 0 0 1 11.093-16.97 18.493 18.493 0 0 0-7.5-1.59zm15-31.385a50.287 50.287 0 0 0-7.5.562 50.05 50.05 0 0 1 42.531 49.384v12.782a15.686 15.686 0 0 1-8.22 13.795 15.728 15.728 0 0 0 23.22-13.795v-12.782a50.046 50.046 0 0 0-50.031-49.946z"></path><path fill="#4a4f60" d="M190.838 53.665q3.63-.091 7.484 0a149.416 149.416 0 0 1 18.781 1.664 7.458 7.458 0 0 0 6.915-2.655A203.907 203.907 0 0 1 274.59 8.317a204.453 204.453 0 0 1 3.085 78.23 7.821 7.821 0 0 0 .546 4.266 120.137 120.137 0 0 1 9.343 38.162 121.967 121.967 0 0 1-9.23 55.94 23.202 23.202 0 0 0 .748 19.443c16.794 33.05 35.716 78.29 44.672 129.121 4.942 28.05 5.236 48.646 0 70.213l-.165.672a84.424 84.424 0 0 1-62.11 61.59 310 310 0 0 1-145.956.019 84.465 84.465 0 0 1-62.176-61.61l-.165-.67c-5.235-21.568-4.941-42.165 0-70.214 8.956-50.83 27.878-96.07 44.672-129.121a23.202 23.202 0 0 0 .749-19.443 121.968 121.968 0 0 1-9.23-55.94 120.135 120.135 0 0 1 9.342-38.162 7.821 7.821 0 0 0 .546-4.267 204.447 204.447 0 0 1 3.085-78.229 204.339 204.339 0 0 1 32.776 25.222 203.789 203.789 0 0 1 17.823 19.167 7.45 7.45 0 0 0 6.86 2.663 172.384 172.384 0 0 1 18.81-1.704c4.276-.152 8.358-.137 12.223 0Z"></path><path fill="#3b3f4d" d="M187.103 55.329a7.45 7.45 0 0 0 5.948-1.692c-.74.007-1.486.01-2.213.028a172.264 172.264 0 0 0-12.224 0q-2.471.088-4.857.243c4.692.29 9.154.781 13.346 1.42zm-81.981-21.79a203.789 203.789 0 0 1 17.823 19.167 7.45 7.45 0 0 0 6.86 2.663 172.384 172.384 0 0 1 18.81-1.704c1.76-.063 3.478-.09 5.17-.1a7.46 7.46 0 0 1-.84-.859 203.789 203.789 0 0 0-17.823-19.167 204.339 204.339 0 0 0-32.776-25.222 205.37 205.37 0 0 0-3.606 19.44q3.173 2.755 6.382 5.782zm218.632 299.94c-8.956-50.83-27.878-96.07-44.672-129.121a23.202 23.202 0 0 1-.749-19.443 121.967 121.967 0 0 0 9.23-55.94 120.137 120.137 0 0 0-9.342-38.162 7.821 7.821 0 0 1-.546-4.266 204.453 204.453 0 0 0-3.085-78.23 204.562 204.562 0 0 0-26.393 19.44 204.168 204.168 0 0 1-.522 58.79 7.821 7.821 0 0 0 .546 4.266 120.137 120.137 0 0 1 9.343 38.162 121.967 121.967 0 0 1-9.23 55.94 23.202 23.202 0 0 0 .748 19.443c16.794 33.05 35.716 78.29 44.672 129.121 4.942 28.05 5.236 48.646 0 70.213l-.165.671a84.424 84.424 0 0 1-62.11 61.591 310.423 310.423 0 0 1-58.012 8.356c5.46.265 10.483.366 15.001.366a310.17 310.17 0 0 0 73.012-8.722 84.424 84.424 0 0 0 62.11-61.59l.164-.672c5.236-21.567 4.942-42.164 0-70.213z"></path><path fill="#3b3f4d" d="M173.47 362.057v127.57a15.726 15.726 0 0 1-15.72 15.69H74.44v-2.41a46.6 46.6 0 0 1 46.63-46.56v-74.29a20 20 0 0 1 20-20Z"></path><path fill="#4a4f60" d="M188.47 362.057v127.57a15.726 15.726 0 0 1-15.72 15.69H89.44v-2.41a46.6 46.6 0 0 1 46.63-46.56v-94.29Z"></path><path fill="#3b3f4d" d="M302.5 502.907v2.41h-83.31a15.726 15.726 0 0 1-15.72-15.69v-127.57h32.4a20 20 0 0 1 20 20v74.29a46.6 46.6 0 0 1 46.63 46.56Z"></path><path fill="#4a4f60" d="M287.5 502.907v2.41h-83.31a15.726 15.726 0 0 1-15.72-15.69v-127.57h52.4v94.29a46.6 46.6 0 0 1 46.63 46.56Z"></path><ellipse cx="148.798" cy="116.058" fill="#d6cea7" rx="15.706" ry="22.213" transform="rotate(-45.144 148.798 116.058)"></ellipse><path fill="#d6cea7" d="M159.913 104.962a23.558 23.558 0 0 0-21.123-6.454 23.514 23.514 0 0 1 16.817 33.244 23.52 23.52 0 0 1-5.712 1.856 23.675 23.675 0 0 0 14.623-1.856 23.516 23.516 0 0 0-4.605-26.79Z"></path><ellipse cx="228.138" cy="116.058" fill="#d6cea7" rx="22.213" ry="15.706" transform="rotate(-44.856 228.138 116.058)"></ellipse><path fill="#d6cea7" d="M243.858 100.364a23.678 23.678 0 0 0-14.267-1.928 23.527 23.527 0 0 1 6.113 1.928 23.526 23.526 0 0 1-17.173 33.316 23.534 23.534 0 0 0 25.327-33.316Z"></path><path fill="#3b3f4d" d="M196.45 362.057v141.22a15.656 15.656 0 0 1-7.98-13.65 15.656 15.656 0 0 1-7.98 13.65v-141.22Z"></path><path fill="#272a33" d="M412.603 196.75a57.554 57.554 0 0 0-57.531 57.446v159.77a51.756 51.756 0 0 1-51.747 51.648H282.05a92.394 92.394 0 0 0 48.824-60.282l.168-.687c5.355-22.056 5.383-43.288.097-73.284-7.502-42.585-22.766-86.733-45.37-131.217a15.69 15.69 0 0 1-.512-13.163 130.06 130.06 0 0 0 9.787-59.383 127.404 127.404 0 0 0-9.923-40.544.365.365 0 0 1-.033-.18 211.965 211.965 0 0 0-3.198-81.097 7.5 7.5 0 0 0-11.25-4.653 212.293 212.293 0 0 0-33.977 26.148 210.114 210.114 0 0 0-18.429 19.826 157.463 157.463 0 0 0-19.723-1.747 157.275 157.275 0 0 0-7.634-.006c-4.16-.142-8.373-.14-12.528.008a175.847 175.847 0 0 0-19.595 1.792 212.058 212.058 0 0 0-18.48-19.873 212.384 212.384 0 0 0-33.977-26.147 7.5 7.5 0 0 0-11.25 4.652 211.976 211.976 0 0 0-3.198 81.098.346.346 0 0 1-.033.18 127.39 127.39 0 0 0-9.923 40.543 130.04 130.04 0 0 0 9.786 59.383 15.69 15.69 0 0 1-.511 13.163c-22.603 44.482-37.869 88.63-45.372 131.217-5.285 29.996-5.256 51.228.1 73.292l.172.698a92.398 92.398 0 0 0 49.709 60.693 53.786 53.786 0 0 0-13.84 36.046v2.41a7.5 7.5 0 0 0 7.5 7.5h83.312a23.143 23.143 0 0 0 15.72-6.142A23.142 23.142 0 0 0 204.186 512H287.5c.218 0 .433-.014.646-.033.213.019.428.033.647.033h14.532c54.14 0 98.185-43.978 98.185-98.034v-159.77a11.093 11.093 0 0 1 22.187 0v12.782a23.22 23.22 0 0 0 46.438 0v-12.782a57.554 57.554 0 0 0-57.532-57.446ZM204.187 497a8.215 8.215 0 0 1-8.219-8.193V361.236a7.5 7.5 0 0 0-15 0v127.571a8.216 8.216 0 0 1-8.22 8.193h-75.48a39.166 39.166 0 0 1 38.803-33.965 7.5 7.5 0 0 0 7.5-7.5v-94.3a7.5 7.5 0 0 0-15 0v87.317a53.784 53.784 0 0 0-19.62 6.784 77.325 77.325 0 0 1-48.326-53.605l-.155-.625c-4.828-19.89-4.8-39.342.098-67.143 7.247-41.126 22.041-83.864 43.973-127.024a30.676 30.676 0 0 0 .986-25.725 112.305 112.305 0 0 1 .085-88.272 15.316 15.316 0 0 0 1.061-8.357 196.826 196.826 0 0 1 .774-64.75 196.96 196.96 0 0 1 22.521 18.337 197.065 197.065 0 0 1 17.168 18.461 15.041 15.041 0 0 0 13.754 5.34 165.48 165.48 0 0 1 17.992-1.63c3.876-.137 7.81-.137 11.69 0 .153.007.306.007.456.003 2.36-.06 4.75-.06 7.106 0a142.403 142.403 0 0 1 17.838 1.58 15.035 15.035 0 0 0 13.853-5.323 196.294 196.294 0 0 1 39.664-36.769 196.783 196.783 0 0 1 .774 64.75 15.32 15.32 0 0 0 1.06 8.355 112.304 112.304 0 0 1 .088 88.275 30.67 30.67 0 0 0 .984 25.725c21.933 43.163 36.728 85.9 43.972 127.024 4.9 27.801 4.928 47.253.093 67.164l-.15.615a77.298 77.298 0 0 1-48.322 53.595 53.784 53.784 0 0 0-19.622-6.785v-87.316a7.5 7.5 0 0 0-15 0v94.299a7.5 7.5 0 0 0 7.5 7.5A39.166 39.166 0 0 1 279.669 497Zm250.948-230.022a8.22 8.22 0 0 1-16.438 0v-12.782a26.093 26.093 0 0 0-52.187 0v159.77A83.203 83.203 0 0 1 303.325 497h-8.564a53.568 53.568 0 0 0-4.22-16.386h12.784a66.773 66.773 0 0 0 66.747-66.648v-159.77a42.532 42.532 0 0 1 85.063 0Zm-226.844-97.959a7.5 7.5 0 0 0-7.5 7.5 12.411 12.411 0 0 1-24.823 0 7.5 7.5 0 0 0-15 0 12.411 12.411 0 0 1-24.822 0 7.5 7.5 0 0 0-15 0 27.398 27.398 0 0 0 47.322 18.787 27.398 27.398 0 0 0 47.323-18.787 7.5 7.5 0 0 0-7.5-7.5Zm-60.545-31.314a7.501 7.501 0 0 0 3.538-3.534 31.06 31.06 0 0 0-41.434-41.394 7.502 7.502 0 0 0-3.538 3.534 31.078 31.078 0 0 0 41.434 41.394Zm-28.87-32.354a16.06 16.06 0 0 1 19.843 19.78 16.06 16.06 0 0 1-19.842-19.78Zm70.314 32.354a31.06 31.06 0 0 0 41.434-41.394 7.502 7.502 0 0 0-3.538-3.534 31.061 31.061 0 0 0-41.434 41.394 7.499 7.499 0 0 0 3.538 3.534Zm13.132-28.253a16.133 16.133 0 0 1 15.737-4.1 16.06 16.06 0 0 1-19.843 19.779 16.048 16.048 0 0 1 4.106-15.679Z"></path>
	</svg>
	<g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><g opacity="0.5"><path opacity="0.5" d="M2491.38 1309.86C2491.38 1306.07 2492.89 1302.53 2495.63 1299.91C2498.37 1297.28 2501.95 1295.9 2505.76 1296.1L2748.89 1306.69C2749.1 1306.7 2749.3 1306.76 2749.51 1306.78C2747.12 1304.1 2743.72 1302.34 2739.85 1302.17L2496.72 1291.58C2492.91 1291.39 2489.33 1292.77 2486.59 1295.39C2483.85 1298.01 2482.34 1301.55 2482.34 1305.34V1320.22H2491.38V1309.86Z" fill="white"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M2464.91 1391.53L2466.16 1405.27L2662.36 1412.04C2695.92 1413.2 2720.75 1443.62 2715.17 1476.74C2697.74 1580.16 2645.72 1776.59 2501.11 1788.96L2501.61 1794.44H2724.7L2761.4 1391.53H2464.91Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><g opacity="0.3"><path opacity="0.3" d="M3077.5 2318H92.5C41.41 2318 0 2276.59 0 2225.5C0 2174.41 41.41 2133 92.5 2133H3077.5C3128.59 2133 3170 2174.41 3170 2225.5C3170 2276.59 3128.59 2318 3077.5 2318Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><path d="M807.32 1034.91C790.71 1034.91 775.84 1026.32 767.53 1011.94L730.85 948.4L637.28 948.39C599.66 948.17 569.13 919.97 569.13 885.54V715.78C569.13 681.12 599.86 652.92 637.64 652.92H977.02C1014.8 652.92 1045.53 681.12 1045.53 715.78V885.54C1045.53 920.21 1014.8 948.41 977.02 948.41H883.8L847.12 1011.95C838.8 1026.32 823.93 1034.91 807.32 1034.91Z" fill="#1E2128"></path><path d="M977.01 668.79C1006.08 668.79 1029.64 689.83 1029.64 715.78V885.54C1029.64 911.49 1006.08 932.53 977.01 932.53H874.62L864.81 949.52L833.35 1004.01C827.56 1014.03 817.44 1019.04 807.31 1019.04C797.18 1019.04 787.06 1014.03 781.27 1004.01L749.81 949.52L740 932.53L637.26 932.52C608.36 932.35 584.98 911.39 584.98 885.55V715.79C584.98 689.84 608.54 668.8 637.61 668.8H977.01V668.79ZM977.01 637.04H637.63C591.1 637.04 553.24 672.36 553.24 715.78V885.54C553.24 928.68 590.85 963.99 637.09 964.27L721.68 964.28L722.33 965.4L753.79 1019.88C764.96 1039.23 784.97 1050.79 807.33 1050.79C829.68 1050.79 849.69 1039.23 860.87 1019.88L892.33 965.39L892.97 964.28H977.02C1023.55 964.28 1061.41 928.96 1061.41 885.54V715.78C1061.39 672.36 1023.54 637.04 977.01 637.04Z" fill="#34a958"></path><path d="M756.26 857.53C753.75 857.53 751.23 856.59 749.28 854.7L697.83 804.63C695.9 802.75 694.81 800.16 694.81 797.46C694.81 794.76 695.9 792.18 697.83 790.29L745.96 743.44C749.92 739.59 756.25 739.67 760.1 743.63C763.95 747.59 763.87 753.92 759.91 757.77L719.15 797.45L763.23 840.36C767.19 844.21 767.27 850.54 763.42 854.5C761.47 856.52 758.87 857.53 756.26 857.53Z" fill="white"></path><path d="M858.37 857.53C855.77 857.53 853.16 856.52 851.2 854.51C847.35 850.55 847.43 844.22 851.39 840.37L895.47 797.46L854.71 757.78C850.75 753.93 850.67 747.6 854.52 743.64C858.37 739.68 864.71 739.6 868.66 743.45L916.79 790.3C918.72 792.18 919.81 794.77 919.81 797.47C919.81 800.17 918.72 802.75 916.79 804.64L865.34 854.71C863.41 856.59 860.89 857.53 858.37 857.53Z" fill="white"></path><path d="M788.24 884.46C787.39 884.46 786.53 884.35 785.68 884.13C780.34 882.72 777.15 877.25 778.57 871.91L818.4 721.15C819.81 715.81 825.3 712.62 830.62 714.04C835.96 715.45 839.15 720.92 837.73 726.26L797.9 877.02C796.72 881.49 792.67 884.46 788.24 884.46Z" fill="white"></path><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><path opacity="0.6" d="M2617.1 1196.63C2612.96 1196.63 2609.6 1193.27 2609.6 1189.13V1178.67C2609.6 1169.05 2601.77 1161.22 2592.15 1161.22H2501.62C2482.21 1161.22 2466.41 1145.42 2466.41 1126.01C2466.41 1106.6 2482.21 1090.8 2501.62 1090.8H2711.79C2720.45 1090.8 2727.49 1083.75 2727.49 1075.09C2727.49 1066.43 2720.44 1059.39 2711.79 1059.39H2537.04C2532.9 1059.39 2529.54 1056.03 2529.54 1051.89C2529.54 1047.75 2532.9 1044.39 2537.04 1044.39H2711.79C2728.72 1044.39 2742.49 1058.16 2742.49 1075.09C2742.49 1092.02 2728.72 1105.8 2711.79 1105.8H2501.62C2490.48 1105.8 2481.41 1114.87 2481.41 1126.01C2481.41 1137.16 2490.48 1146.22 2501.62 1146.22H2592.15C2610.04 1146.22 2624.6 1160.78 2624.6 1178.67V1189.13C2624.6 1193.27 2621.24 1196.63 2617.1 1196.63Z" fill="#FFFAFA"></path>
							</g>
						</g>
					</g>
				</g>
			</g>
		</g><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><path opacity="0.6" d="M2500.2 1059.38H2473.8C2469.66 1059.38 2466.3 1056.02 2466.3 1051.88C2466.3 1047.74 2469.66 1044.38 2473.8 1044.38H2500.2C2504.34 1044.38 2507.7 1047.74 2507.7 1051.88C2507.7 1056.02 2504.34 1059.38 2500.2 1059.38Z" fill="#FFFAFA"></path>
							</g>
						</g>
					</g>
				</g>
			</g>
		</g><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><g opacity="0.6"><path opacity="0.6" d="M2550.35 1011.87H2425.88C2421.74 1011.87 2418.38 1008.51 2418.38 1004.37C2418.38 1000.23 2421.74 996.87 2425.88 996.87H2550.35C2554.49 996.87 2557.85 1000.23 2557.85 1004.37C2557.85 1008.51 2554.49 1011.87 2550.35 1011.87Z" fill="#FFFAFA"></path>
							</g>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g><g opacity="0.2"><g opacity="0.2"><g opacity="0.2"><g opacity="0.2"><g opacity="0.2"><g opacity="0.2"><path opacity="0.2" d="M977.01 668.79H942.01C971.08 668.79 994.64 689.83 994.64 715.78V775.32C980 893 894.3 906.07 856.01 924.97C845.12 930.35 836.02 938.77 829.94 949.29L829.81 949.51L798.35 1004C796.09 1007.92 793.15 1011.05 789.81 1013.43C803.51 1023.24 824.04 1020.12 833.35 1004L862.51 953.5L992.5 940.5L1000.2 927.67C1017.62 920.01 1029.64 904.05 1029.64 885.54V715.78C1029.64 689.83 1006.07 668.79 977.01 668.79Z" fill="#1E2128"></path>
						</g>
					</g>
				</g>
			</g>
		</g>
	</g>
</svg>`;
});

const $$file$5 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/CoderIcon.astro";
const $$url$5 = undefined;

const $$module1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$5,
	default: $$CoderIcon,
	file: $$file$5,
	url: $$url$5
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$4 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/Home.astro", { modules: [{ module: $$module1, specifier: "./logos/CoderIcon.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$4 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/Home.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$Home = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$Home;
  return renderTemplate`${maybeRenderHead($$result)}<section class="container mx-auto w-4/6 mt-20 flex gap-3">
	<article class="flex mt-10 gap-5 flex-col w-[60%]">
		<h1 class="text-white">Hi! I'm Tomas</h1>
		<h2 class="text-softGreen">
			Fullstack developer 💻 <br> Based in Mar del Plata, Argentina.
		</h2>
		<div class="text-lg tracking-wide font-light text-white">
			<p class="text-xl">Cat lover 😺 and music enthusiast</p>
		</div>
	</article>

	${renderComponent($$result, "CoderIcon", $$CoderIcon, {})}
</section>`;
});

const $$file$4 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/Home.astro";
const $$url$4 = undefined;

const $$module3 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$4,
	default: $$Home,
	file: $$file$4,
	url: $$url$4
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$3 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/About.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$3 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/About.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$About = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$About;
  return renderTemplate``;
});

const $$file$3 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/About.astro";
const $$url$3 = undefined;

const $$module4 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$3,
	default: $$About,
	file: $$file$3,
	url: $$url$3
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$2 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/Github.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$2 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/Github.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$Github = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$Github;
  Astro2.props;
  return renderTemplate`${maybeRenderHead($$result)}<a href="https://github.com/tommdq" target="_blank">
    <svg class="h-8 w-8 fill-white hover:fill-hoverGreen hover:scale-125 transition duration-250" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M64 5.103c-33.347 0-60.388 27.035-60.388 60.388 0 26.682 17.303 49.317 41.297 57.303 3.017.56 4.125-1.31 4.125-2.905 0-1.44-.056-6.197-.082-11.243-16.8 3.653-20.345-7.125-20.345-7.125-2.747-6.98-6.705-8.836-6.705-8.836-5.48-3.748.413-3.67.413-3.67 6.063.425 9.257 6.223 9.257 6.223 5.386 9.23 14.127 6.562 17.573 5.02.542-3.903 2.107-6.568 3.834-8.076-13.413-1.525-27.514-6.704-27.514-29.843 0-6.593 2.36-11.98 6.223-16.21-.628-1.52-2.695-7.662.584-15.98 0 0 5.07-1.623 16.61 6.19C53.7 35 58.867 34.327 64 34.304c5.13.023 10.3.694 15.127 2.033 11.526-7.813 16.59-6.19 16.59-6.19 3.287 8.317 1.22 14.46.593 15.98 3.872 4.23 6.215 9.617 6.215 16.21 0 23.194-14.127 28.3-27.574 29.796 2.167 1.874 4.097 5.55 4.097 11.183 0 8.08-.07 14.583-.07 16.572 0 1.607 1.088 3.49 4.148 2.897 23.98-7.994 41.263-30.622 41.263-57.294C124.388 32.14 97.35 5.104 64 5.104z"></path><path d="M26.484 91.806c-.133.3-.605.39-1.035.185-.44-.196-.685-.605-.543-.906.13-.31.603-.395 1.04-.188.44.197.69.61.537.91zm2.446 2.729c-.287.267-.85.143-1.232-.28-.396-.42-.47-.983-.177-1.254.298-.266.844-.14 1.24.28.394.426.472.984.17 1.255zm2.382 3.477c-.37.258-.976.017-1.35-.52-.37-.538-.37-1.183.01-1.44.373-.258.97-.025 1.35.507.368.545.368 1.19-.01 1.452zm3.261 3.361c-.33.365-1.036.267-1.552-.23-.527-.487-.674-1.18-.343-1.544.336-.366 1.045-.264 1.564.23.527.486.686 1.18.333 1.543zm4.5 1.951c-.147.473-.825.688-1.51.486-.683-.207-1.13-.76-.99-1.238.14-.477.823-.7 1.512-.485.683.206 1.13.756.988 1.237zm4.943.361c.017.498-.563.91-1.28.92-.723.017-1.308-.387-1.315-.877 0-.503.568-.91 1.29-.924.717-.013 1.306.387 1.306.88zm4.598-.782c.086.485-.413.984-1.126 1.117-.7.13-1.35-.172-1.44-.653-.086-.498.422-.997 1.122-1.126.714-.123 1.354.17 1.444.663zm0 0"></path>
        </g>
    </svg>
</a>`;
});

const $$file$2 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/Github.astro";
const $$url$2 = undefined;

const $$module5 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$2,
	default: $$Github,
	file: $$file$2,
	url: $$url$2
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata$1 = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/Linkedin.astro", { modules: [], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro$1 = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/Linkedin.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$Linkedin = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Linkedin;
  return renderTemplate`${maybeRenderHead($$result)}<a href="https://www.linkedin.com/in/tom%C3%A1s-buzeta/" target="_blank">
    <svg class="h-8 w-8 fill-white hover:fill-hoverGreen hover:scale-125 transition duration-250" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path d="M116 3H12a8.91 8.91 0 0 0-9 8.8v104.42a8.91 8.91 0 0 0 9 8.78h104a8.93 8.93 0 0 0 9-8.81V11.77A8.93 8.93 0 0 0 116 3zM39.17 107H21.06V48.73h18.11zm-9-66.21a10.5 10.5 0 1 1 10.49-10.5 10.5 10.5 0 0 1-10.54 10.48zM107 107H88.89V78.65c0-6.75-.12-15.44-9.41-15.44s-10.87 7.36-10.87 15V107H50.53V48.73h17.36v8h.24c2.42-4.58 8.32-9.41 17.13-9.41C103.6 47.28 107 59.35 107 75z"></path>
    </svg>
</a>`;
});

const $$file$1 = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/components/logos/Linkedin.astro";
const $$url$1 = undefined;

const $$module6 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata: $$metadata$1,
	default: $$Linkedin,
	file: $$file$1,
	url: $$url$1
}, Symbol.toStringTag, { value: 'Module' }));

const $$metadata = createMetadata("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/pages/index.astro", { modules: [{ module: $$module1$2, specifier: "../layouts/Layout.astro", assert: {} }, { module: $$module2, specifier: "../components/Navbar.astro", assert: {} }, { module: $$module3, specifier: "../components/Home.astro", assert: {} }, { module: $$module4, specifier: "../components/About.astro", assert: {} }, { module: $$module5, specifier: "../components/logos/Github.astro", assert: {} }, { module: $$module6, specifier: "../components/logos/Linkedin.astro", assert: {} }], hydratedComponents: [], clientOnlyComponents: [], hydrationDirectives: /* @__PURE__ */ new Set([]), hoisted: [] });
const $$Astro = createAstro("/@fs/C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/pages/index.astro", "", "file:///C:/Users/regis/OneDrive/Escritorio/Code/portfolio/");
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Tomas Buzeta | Fullstack Developer" }, { "default": () => renderTemplate`${renderComponent($$result, "Navbar", $$Navbar, {})}${maybeRenderHead($$result)}<ul class="flex gap-4">
			${renderComponent($$result, "Github", $$Github, {})}
			${renderComponent($$result, "Linkedin", $$Linkedin, {})}
		</ul>${renderComponent($$result, "Home", $$Home, {})}${renderComponent($$result, "About", $$About, {})}` })}`;
});

const $$file = "C:/Users/regis/OneDrive/Escritorio/Code/portfolio/src/pages/index.astro";
const $$url = "";

const _page0 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	$$metadata,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const pageMap = new Map([['src/pages/index.astro', _page0],]);
const renderers = [Object.assign({"name":"astro:jsx","serverEntrypoint":"astro/jsx/server.js","jsxImportSource":"astro"}, { ssr: server_default }),Object.assign({"name":"@astrojs/react","clientEntrypoint":"@astrojs/react/client.js","serverEntrypoint":"@astrojs/react/server.js","jsxImportSource":"react"}, { ssr: _renderer1 }),];

if (typeof process !== "undefined") {
  if (process.argv.includes("--verbose")) ; else if (process.argv.includes("--silent")) ; else ;
}

const SCRIPT_EXTENSIONS = /* @__PURE__ */ new Set([".js", ".ts"]);
new RegExp(
  `\\.(${Array.from(SCRIPT_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

const STYLE_EXTENSIONS = /* @__PURE__ */ new Set([
  ".css",
  ".pcss",
  ".postcss",
  ".scss",
  ".sass",
  ".styl",
  ".stylus",
  ".less"
]);
new RegExp(
  `\\.(${Array.from(STYLE_EXTENSIONS).map((s) => s.slice(1)).join("|")})($|\\?)`
);

function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return segment[0].spread ? `/:${segment[0].content.slice(3)}(.*)?` : "/" + segment.map((part) => {
      if (part)
        return part.dynamic ? `:${part.content}` : part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return toPath;
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  return {
    ...serializedManifest,
    assets,
    routes
  };
}

const _manifest = Object.assign(deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"","links":["assets/index.dd0a4312.css"],"scripts":[],"routeData":{"route":"/","type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","_meta":{"trailingSlash":"ignore"}}}],"base":"/","markdown":{"drafts":false,"syntaxHighlight":"shiki","shikiConfig":{"langs":[],"theme":"github-dark","wrap":false},"remarkPlugins":[],"rehypePlugins":[],"remarkRehype":{},"extendDefaultPlugins":false,"isAstroFlavoredMd":false},"pageMap":null,"renderers":[],"entryModules":{"\u0000@astrojs-ssr-virtual-entry":"entry.js","@astrojs/react/client.js":"client.bf4f0f8e.js","astro:scripts/before-hydration.js":"data:text/javascript;charset=utf-8,//[no before-hydration script]"},"assets":["/assets/index.dd0a4312.css","/alphabet-t-icon.svg","/client.bf4f0f8e.js","/favicon.svg","/yo.webp"]}), {
	pageMap: pageMap,
	renderers: renderers
});
const _args = undefined;

const _exports = adapter.createExports(_manifest, _args);
const _default = _exports['default'];

const _start = 'start';
if(_start in adapter) {
	adapter[_start](_manifest, _args);
}

export { _default as default };
