<!DOCTYPE html>
<html lang="en-US">
    <head>
        <meta charset="UTF-8">
        <script>
            if (navigator.userAgent.match(/MSIE|Internet Explorer/i) || navigator.userAgent.match(/Trident\/7\..*?rv:11/i)) {
                var href = document.location.href;
                if (!href.match(/[?&]nowprocket/)) {
                    if (href.indexOf("?") == -1) {
                        if (href.indexOf("#") == -1) {
                            document.location.href = href + "?nowprocket=1"
                        } else {
                            document.location.href = href.replace("#", "?nowprocket=1#")
                        }
                    } else {
                        if (href.indexOf("#") == -1) {
                            document.location.href = href + "&nowprocket=1"
                        } else {
                            document.location.href = href.replace("#", "&nowprocket=1#")
                        }
                    }
                }
            }
        </script>
        <script>
            class RocketLazyLoadScripts {
                constructor(e) {
                    this.triggerEvents = e,
                    this.eventOptions = {
                        passive: !0
                    },
                    this.userEventListener = this.triggerListener.bind(this),
                    this.delayedScripts = {
                        normal: [],
                        async: [],
                        defer: []
                    },
                    this.allJQueries = []
                }
                _addUserInteractionListener(e) {
                    this.triggerEvents.forEach((t=>window.addEventListener(t, e.userEventListener, e.eventOptions)))
                }
                _removeUserInteractionListener(e) {
                    this.triggerEvents.forEach((t=>window.removeEventListener(t, e.userEventListener, e.eventOptions)))
                }
                triggerListener() {
                    this._removeUserInteractionListener(this),
                    "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", this._loadEverythingNow.bind(this)) : this._loadEverythingNow()
                }
                async _loadEverythingNow() {
                    this._delayEventListeners(),
                    this._delayJQueryReady(this),
                    this._handleDocumentWrite(),
                    this._registerAllDelayedScripts(),
                    this._preloadAllScripts(),
                    await this._loadScriptsFromList(this.delayedScripts.normal),
                    await this._loadScriptsFromList(this.delayedScripts.defer),
                    await this._loadScriptsFromList(this.delayedScripts.async),
                    await this._triggerDOMContentLoaded(),
                    await this._triggerWindowLoad(),
                    window.dispatchEvent(new Event("rocket-allScriptsLoaded"))
                }
                _registerAllDelayedScripts() {
                    document.querySelectorAll("script[type=rocketlazyloadscript]").forEach((e=>{
                        e.hasAttribute("src") ? e.hasAttribute("async") && !1 !== e.async ? this.delayedScripts.async.push(e) : e.hasAttribute("defer") && !1 !== e.defer || "module" === e.getAttribute("data-rocket-type") ? this.delayedScripts.defer.push(e) : this.delayedScripts.normal.push(e) : this.delayedScripts.normal.push(e)
                    }
                    ))
                }
                async _transformScript(e) {
                    return await this._requestAnimFrame(),
                    new Promise((t=>{
                        const n = document.createElement("script");
                        let r;
                        [...e.attributes].forEach((e=>{
                            let t = e.nodeName;
                            "type" !== t && ("data-rocket-type" === t && (t = "type",
                            r = e.nodeValue),
                            n.setAttribute(t, e.nodeValue))
                        }
                        )),
                        e.hasAttribute("src") ? (n.addEventListener("load", t),
                        n.addEventListener("error", t)) : (n.text = e.text,
                        t()),
                        e.parentNode.replaceChild(n, e)
                    }
                    ))
                }
                async _loadScriptsFromList(e) {
                    const t = e.shift();
                    return t ? (await this._transformScript(t),
                    this._loadScriptsFromList(e)) : Promise.resolve()
                }
                _preloadAllScripts() {
                    var e = document.createDocumentFragment();
                    [...this.delayedScripts.normal, ...this.delayedScripts.defer, ...this.delayedScripts.async].forEach((t=>{
                        const n = t.getAttribute("src");
                        if (n) {
                            const t = document.createElement("link");
                            t.href = n,
                            t.rel = "preload",
                            t.as = "script",
                            e.appendChild(t)
                        }
                    }
                    )),
                    document.head.appendChild(e)
                }
                _delayEventListeners() {
                    let e = {};
                    function t(t, n) {
                        !function(t) {
                            function n(n) {
                                return e[t].eventsToRewrite.indexOf(n) >= 0 ? "rocket-" + n : n
                            }
                            e[t] || (e[t] = {
                                originalFunctions: {
                                    add: t.addEventListener,
                                    remove: t.removeEventListener
                                },
                                eventsToRewrite: []
                            },
                            t.addEventListener = function() {
                                arguments[0] = n(arguments[0]),
                                e[t].originalFunctions.add.apply(t, arguments)
                            }
                            ,
                            t.removeEventListener = function() {
                                arguments[0] = n(arguments[0]),
                                e[t].originalFunctions.remove.apply(t, arguments)
                            }
                            )
                        }(t),
                        e[t].eventsToRewrite.push(n)
                    }
                    function n(e, t) {
                        let n = e[t];
                        Object.defineProperty(e, t, {
                            get: ()=>n || function() {}
                            ,
                            set(r) {
                                e["rocket" + t] = n = r
                            }
                        })
                    }
                    t(document, "DOMContentLoaded"),
                    t(window, "DOMContentLoaded"),
                    t(window, "load"),
                    t(window, "pageshow"),
                    t(document, "readystatechange"),
                    n(document, "onreadystatechange"),
                    n(window, "onload"),
                    n(window, "onpageshow")
                }
                _delayJQueryReady(e) {
                    let t = window.jQuery;
                    Object.defineProperty(window, "jQuery", {
                        get: ()=>t,
                        set(n) {
                            if (n && n.fn && !e.allJQueries.includes(n)) {
                                n.fn.ready = n.fn.init.prototype.ready = function(t) {
                                    e.domReadyFired ? t.bind(document)(n) : document.addEventListener("rocket-DOMContentLoaded", (()=>t.bind(document)(n)))
                                }
                                ;
                                const t = n.fn.on;
                                n.fn.on = n.fn.init.prototype.on = function() {
                                    if (this[0] === window) {
                                        function e(e) {
                                            return e.split(" ").map((e=>"load" === e || 0 === e.indexOf("load.") ? "rocket-jquery-load" : e)).join(" ")
                                        }
                                        "string" == typeof arguments[0] || arguments[0]instanceof String ? arguments[0] = e(arguments[0]) : "object" == typeof arguments[0] && Object.keys(arguments[0]).forEach((t=>{
                                            delete Object.assign(arguments[0], {
                                                [e(t)]: arguments[0][t]
                                            })[t]
                                        }
                                        ))
                                    }
                                    return t.apply(this, arguments),
                                    this
                                }
                                ,
                                e.allJQueries.push(n)
                            }
                            t = n
                        }
                    })
                }
                async _triggerDOMContentLoaded() {
                    this.domReadyFired = !0,
                    await this._requestAnimFrame(),
                    document.dispatchEvent(new Event("rocket-DOMContentLoaded")),
                    await this._requestAnimFrame(),
                    window.dispatchEvent(new Event("rocket-DOMContentLoaded")),
                    await this._requestAnimFrame(),
                    document.dispatchEvent(new Event("rocket-readystatechange")),
                    await this._requestAnimFrame(),
                    document.rocketonreadystatechange && document.rocketonreadystatechange()
                }
                async _triggerWindowLoad() {
                    await this._requestAnimFrame(),
                    window.dispatchEvent(new Event("rocket-load")),
                    await this._requestAnimFrame(),
                    window.rocketonload && window.rocketonload(),
                    await this._requestAnimFrame(),
                    this.allJQueries.forEach((e=>e(window).trigger("rocket-jquery-load"))),
                    window.dispatchEvent(new Event("rocket-pageshow")),
                    await this._requestAnimFrame(),
                    window.rocketonpageshow && window.rocketonpageshow()
                }
                _handleDocumentWrite() {
                    const e = new Map;
                    document.write = document.writeln = function(t) {
                        const n = document.currentScript
                          , r = document.createRange()
                          , i = n.parentElement;
                        let o = e.get(n);
                        void 0 === o && (o = n.nextSibling,
                        e.set(n, o));
                        const a = document.createDocumentFragment();
                        r.setStart(a, 0),
                        a.appendChild(r.createContextualFragment(t)),
                        i.insertBefore(a, o)
                    }
                }
                async _requestAnimFrame() {
                    return new Promise((e=>requestAnimationFrame(e)))
                }
                static run() {
                    const e = new RocketLazyLoadScripts(["keydown", "mousemove", "touchmove", "touchstart", "touchend", "wheel"]);
                    e._addUserInteractionListener(e)
                }
            }
            RocketLazyLoadScripts.run();
        </script>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
        <script type="rocketlazyloadscript">
            document.documentElement.className = document.documentElement.className + ' yes-js js_active js'
        </script>
        <title>Products &#8211;Marketo</title>
        <style id="rocket-critical-css">
            :root {
                --woocommerce:#a46497;--wc-green:#7ad03a;--wc-red:#a00;--wc-orange:#ffba00;--wc-blue:#2ea2cc;--wc-primary:#a46497;--wc-primary-text:white;--wc-secondary:#ebe9eb;--wc-secondary-text:#515151;--wc-highlight:#77a464;--wc-highligh-text:white;--wc-content-bg:#fff;--wc-subtext:#767676}

            @font-face {
                font-display:swap;font-family: star;
                src: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.eot);
                src: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.eot?#iefix) format("embedded-opentype"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.woff) format("woff"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.ttf) format("truetype"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.svg#star) format("svg");
                font-weight: 400;
                font-style: normal
            }

            .yith-wcwl-add-to-wishlist {
                margin-top: 10px
            }

            .yith-wcwl-add-button>a i {
                margin-right: 10px
            }

            .yith-wcwl-add-button a.add_to_wishlist {
                margin: 0;
                box-shadow: none;
                text-shadow: none
            }

            :root {
                --woocommerce:#a46497;--wc-green:#7ad03a;--wc-red:#a00;--wc-orange:#ffba00;--wc-blue:#2ea2cc;--wc-primary:#a46497;--wc-primary-text:white;--wc-secondary:#ebe9eb;--wc-secondary-text:#515151;--wc-highlight:#77a464;--wc-highligh-text:white;--wc-content-bg:#fff;--wc-subtext:#767676}

            :root {
                --woocommerce:#a46497;--wc-green:#7ad03a;--wc-red:#a00;--wc-orange:#ffba00;--wc-blue:#2ea2cc;--wc-primary:#a46497;--wc-primary-text:white;--wc-secondary:#ebe9eb;--wc-secondary-text:#515151;--wc-highlight:#77a464;--wc-highligh-text:white;--wc-content-bg:#fff;--wc-subtext:#767676}

            @font-face {
                font-display:swap;font-family: star;
                src: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.eot);
                src: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.eot?#iefix) format("embedded-opentype"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.woff) format("woff"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.ttf) format("truetype"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/fonts/star.svg#star) format("svg");
                font-weight: 400;
                font-style: normal
            }

            .woocommerce .star-rating {
                float: right;
                overflow: hidden;
                position: relative;
                height: 1em;
                line-height: 1;
                font-size: 1em;
                width: 5.4em;
                font-family: star
            }

            .woocommerce .star-rating::before {
                content: "sssss";
                color: #d3ced2;
                float: left;
                top: 0;
                left: 0;
                position: absolute
            }

            .woocommerce .star-rating span {
                overflow: hidden;
                float: left;
                top: 0;
                left: 0;
                position: absolute;
                padding-top: 1.5em
            }

            .woocommerce .star-rating span::before {
                content: "SSSSS";
                top: 0;
                position: absolute;
                left: 0
            }

            .clearfix:before,.clearfix:after {
                content: " ";
                display: table
            }

            .clearfix:after {
                clear: both
            }

            img {
                max-width: 100%
            }

            img {
                height: auto
            }

            .elementor-screen-only {
                position: absolute;
                top: -10000em;
                width: 1px;
                height: 1px;
                margin: -1px;
                padding: 0;
                overflow: hidden;
                clip: rect(0,0,0,0);
                border: 0
            }

            .elementor {
                -webkit-hyphens: manual;
                -ms-hyphens: manual;
                hyphens: manual
            }

            .elementor *,.elementor :after,.elementor :before {
                -webkit-box-sizing: border-box;
                box-sizing: border-box
            }

            .elementor a {
                -webkit-box-shadow: none;
                box-shadow: none;
                text-decoration: none
            }

            .elementor hr {
                margin: 0;
                background-color: transparent
            }

            .elementor img {
                height: auto;
                max-width: 100%;
                border: none;
                -webkit-border-radius: 0;
                border-radius: 0;
                -webkit-box-shadow: none;
                box-shadow: none
            }

            .elementor .elementor-widget:not(.elementor-widget-text-editor):not(.elementor-widget-theme-post-content) figure {
                margin: 0
            }

            .elementor-widget-wrap>.elementor-element.elementor-absolute {
                position: absolute
            }

            .elementor-widget-wrap .elementor-element.elementor-widget__width-auto {
                max-width: 100%
            }

            .elementor-element.elementor-absolute {
                z-index: 1
            }

            .elementor-align-right {
                text-align: right
            }

            :root {
                --page-title-display:block}

            .elementor-section {
                position: relative
            }

            .elementor-section .elementor-container {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                margin-right: auto;
                margin-left: auto;
                position: relative
            }

            @media (max-width: 1024px) {
                .elementor-section .elementor-container {
                    -ms-flex-wrap:wrap;
                    flex-wrap: wrap
                }
            }

            .elementor-section.elementor-section-boxed>.elementor-container {
                max-width: 1140px
            }

            .elementor-section.elementor-section-stretched {
                position: relative;
                width: 100%
            }

            .elementor-section.elementor-section-items-middle>.elementor-container {
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center
            }

            .elementor-widget-wrap {
                position: relative;
                width: 100%;
                -ms-flex-wrap: wrap;
                flex-wrap: wrap;
                -ms-flex-line-pack: start;
                align-content: flex-start
            }

            .elementor:not(.elementor-bc-flex-widget) .elementor-widget-wrap {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex
            }

            .elementor-widget-wrap>.elementor-element {
                width: 100%
            }

            .elementor-widget {
                position: relative
            }

            .elementor-widget:not(:last-child) {
                margin-bottom: 20px
            }

            .elementor-widget:not(:last-child).elementor-widget__width-auto {
                margin-bottom: 0
            }

            .elementor-column {
                min-height: 1px
            }

            .elementor-column {
                position: relative;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex
            }

            .elementor-column-gap-default>.elementor-column>.elementor-element-populated {
                padding: 10px
            }

            .elementor-inner-section .elementor-column-gap-no .elementor-element-populated {
                padding: 0
            }

            @media (min-width: 768px) {
                .elementor-column.elementor-col-25 {
                    width:25%
                }

                .elementor-column.elementor-col-33 {
                    width: 33.333%
                }

                .elementor-column.elementor-col-50 {
                    width: 50%
                }

                .elementor-column.elementor-col-100 {
                    width: 100%
                }
            }

            @media (max-width: 767px) {
                .elementor-column {
                    width:100%
                }
            }

            ul.elementor-icon-list-items.elementor-inline-items {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -ms-flex-wrap: wrap;
                flex-wrap: wrap
            }

            ul.elementor-icon-list-items.elementor-inline-items .elementor-inline-item {
                word-break: break-word
            }

            @media (min-width: 1025px) {
                #elementor-device-mode:after {
                    content:"desktop"
                }
            }

            @media (min-width: -1px) {
                #elementor-device-mode:after {
                    content:"widescreen"
                }
            }

            @media (max-width: -1px) {
                #elementor-device-mode:after {
                    content:"laptop";
                    content: "tablet_extra"
                }
            }

            @media (max-width: 1024px) {
                #elementor-device-mode:after {
                    content:"tablet"
                }
            }

            @media (max-width: -1px) {
                #elementor-device-mode:after {
                    content:"mobile_extra"
                }
            }

            @media (max-width: 767px) {
                #elementor-device-mode:after {
                    content:"mobile"
                }
            }

            .elementor-icon {
                display: inline-block;
                line-height: 1;
                color: #818a91;
                font-size: 50px;
                text-align: center
            }

            .elementor-icon i,.elementor-icon svg {
                width: 1em;
                height: 1em;
                position: relative;
                display: block
            }

            .elementor-icon i:before,.elementor-icon svg:before {
                position: absolute;
                left: 50%;
                -webkit-transform: translateX(-50%);
                -ms-transform: translateX(-50%);
                transform: translateX(-50%)
            }

            .swiper-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                z-index: 1;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-sizing: content-box;
                box-sizing: content-box
            }

            .swiper-wrapper {
                -webkit-transform: translateZ(0);
                transform: translateZ(0)
            }

            .swiper-slide {
                -ms-flex-negative: 0;
                flex-shrink: 0;
                width: 100%;
                height: 100%;
                position: relative
            }

            .animated {
                -webkit-animation-duration: 1.25s;
                animation-duration: 1.25s
            }

            .animated.animated-fast {
                -webkit-animation-duration: .75s;
                animation-duration: .75s
            }

            @media (prefers-reduced-motion:reduce) {
                .animated {
                    -webkit-animation: none;
                    animation: none
                }
            }

            .elementor .elementor-element ul.elementor-icon-list-items {
                padding: 0
            }

            @media (max-width: 767px) {
                .elementor .elementor-hidden-phone {
                    display:none
                }
            }

            @media (min-width: 768px) and (max-width:1024px) {
                .elementor .elementor-hidden-tablet {
                    display:none
                }
            }

            @media (min-width: 1025px) and (max-width:99999px) {
                .elementor .elementor-hidden-desktop {
                    display:none
                }
            }

            .elementor-kit-6 {
                --e-global-color-primary:#6EC1E4;--e-global-color-secondary:#54595F;--e-global-color-text:#7A7A7A;--e-global-color-accent:#61CE70}

            .elementor-section.elementor-section-boxed>.elementor-container {
                max-width: 1140px
            }

            .elementor-widget:not(:last-child) {
                margin-bottom: 20px
            }

            @media (max-width: 1024px) {
                .elementor-section.elementor-section-boxed>.elementor-container {
                    max-width:1024px
                }
            }

            @media (max-width: 767px) {
                .elementor-section.elementor-section-boxed>.elementor-container {
                    max-width:767px
                }
            }

            .elementor-widget-image .widget-image-caption {
                color: var(--e-global-color-text);
                font-family: var(--e-global-typography-text-font-family),Sans-serif;
                font-weight: var(--e-global-typography-text-font-weight)
            }

            .elementor-widget-text-editor {
                color: var(--e-global-color-text);
                font-family: var(--e-global-typography-text-font-family),Sans-serif;
                font-weight: var(--e-global-typography-text-font-weight)
            }

            .elementor-widget-icon-box.elementor-view-default .elementor-icon {
                fill: var(--e-global-color-primary);
                color: var(--e-global-color-primary);
                border-color: var(--e-global-color-primary)
            }

            .elementor-widget-icon-box .elementor-icon-box-title {
                color: var(--e-global-color-primary)
            }

            .elementor-widget-icon-box .elementor-icon-box-title,.elementor-widget-icon-box .elementor-icon-box-title a {
                font-family: var(--e-global-typography-primary-font-family),Sans-serif;
                font-weight: var(--e-global-typography-primary-font-weight)
            }

            .elementor-widget-icon-list .elementor-icon-list-item:not(:last-child):after {
                border-color: var(--e-global-color-text)
            }

            .elementor-widget-icon-list .elementor-icon-list-icon i {
                color: var(--e-global-color-primary)
            }

            .elementor-widget-icon-list .elementor-icon-list-text {
                color: var(--e-global-color-secondary)
            }

            .elementor-widget-icon-list .elementor-icon-list-item>.elementor-icon-list-text {
                font-family: var(--e-global-typography-text-font-family),Sans-serif;
                font-weight: var(--e-global-typography-text-font-weight)
            }

            .elementor-259 .elementor-element.elementor-element-23d0ed5 {
                overflow: hidden;
                margin-top: 0px;
                margin-bottom: 30px;
                padding: 0% 4% 0% 4%;
                z-index: 0
            }

            .elementor-259 .elementor-element.elementor-element-e4d132d>.elementor-element-populated {
                padding: 0px 10px 0px 0px
            }

            .elementor-259 .elementor-element.elementor-element-511ab59>.elementor-element-populated {
                padding: 0px 00px 10px 10px
            }

            .elementor-259 .elementor-element.elementor-element-97fdc7a {
                padding: 0% 4% 0% 4%
            }

            .elementor-259 .elementor-element.elementor-element-d1b2f7f>.elementor-element-populated {
                padding: 0px 10px 0px 0px
            }

            .elementor-259 .elementor-element.elementor-element-10053f9>.elementor-element-populated {
                padding: 0px 10px 0px 10px
            }

            .elementor-259 .elementor-element.elementor-element-8193d58>.elementor-element-populated {
                padding: 0px 0px 0px 10px
            }

            @media (max-width: 1024px) {
                .elementor-259 .elementor-element.elementor-element-bc5d5b8>.elementor-widget-container {
                    margin:0px 0px 32px 0px
                }

                .elementor-259 .elementor-element.elementor-element-511ab59>.elementor-element-populated {
                    padding: 0px 0px 0px 0px
                }
            }

            @media (min-width: 768px) {
                .elementor-259 .elementor-element.elementor-element-e4d132d {
                    width:69.1%
                }

                .elementor-259 .elementor-element.elementor-element-511ab59 {
                    width: 30.9%
                }
            }

            @media (max-width: 1024px) and (min-width:768px) {
                .elementor-259 .elementor-element.elementor-element-e4d132d {
                    width:100%
                }

                .elementor-259 .elementor-element.elementor-element-511ab59 {
                    width: 100%
                }
            }

            @media (max-width: 767px) {
                .elementor-259 .elementor-element.elementor-element-e4d132d>.elementor-element-populated {
                    padding:0px 0px 0px 0px
                }
            }

            .fa {
                -moz-osx-font-smoothing: grayscale;
                -webkit-font-smoothing: antialiased;
                display: inline-block;
                font-style: normal;
                font-variant: normal;
                text-rendering: auto;
                line-height: 1
            }

            @font-face {
                font-family: "Font Awesome 5 Free";
                font-style: normal;
                font-weight: 400;
                font-display:swap;src: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-regular-400.eot);
                src: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-regular-400.eot?#iefix) format("embedded-opentype"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-regular-400.woff2) format("woff2"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-regular-400.woff) format("woff"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-regular-400.ttf) format("truetype"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-regular-400.svg#fontawesome) format("svg")
            }

            @font-face {
                font-family: "Font Awesome 5 Free";
                font-style: normal;
                font-weight: 900;
                font-display:swap;src: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.eot);
                src: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.eot?#iefix) format("embedded-opentype"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.woff2) format("woff2"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.woff) format("woff"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.ttf) format("truetype"),url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.svg#fontawesome) format("svg")
            }

            .fa {
                font-family: "Font Awesome 5 Free"
            }

            .fa {
                font-weight: 900
            }

            .fa.fa-heart-o {
                font-family: "Font Awesome 5 Free";
                font-weight: 400
            }

            .fa.fa-heart-o:before {
                content: "\f004"
            }

            :root {
                --blue:#007bff;--indigo:#6610f2;--purple:#6f42c1;--pink:#e83e8c;--red:#dc3545;--orange:#fd7e14;--yellow:#ffc107;--green:#28a745;--teal:#20c997;--cyan:#17a2b8;--white:#fff;--gray:#6c757d;--gray-dark:#343a40;--primary:#007bff;--secondary:#6c757d;--success:#28a745;--info:#17a2b8;--warning:#ffc107;--danger:#dc3545;--light:#f8f9fa;--dark:#343a40;--breakpoint-xs:0;--breakpoint-sm:576px;--breakpoint-md:768px;--breakpoint-lg:992px;--breakpoint-xl:1200px;--font-family-sans-serif:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";--font-family-monospace:SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}

            *,::after,::before {
                box-sizing: border-box
            }

            html {
                font-family: sans-serif;
                line-height: 1.15;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                -ms-overflow-style: scrollbar
            }

            @-ms-viewport {
                width: device-width
            }

            figcaption,figure,section {
                display: block
            }

            body {
                margin: 0;
                font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
                font-size: 1rem;
                font-weight: 400;
                line-height: 1.5;
                color: #212529;
                text-align: left;
                background-color: #fff
            }

            hr {
                box-sizing: content-box;
                height: 0;
                overflow: visible
            }

            h2,h3,h4 {
                margin-top: 0;
                margin-bottom: .5rem
            }

            p {
                margin-top: 0;
                margin-bottom: 1rem
            }

            ul {
                margin-top: 0;
                margin-bottom: 1rem
            }

            ul ul {
                margin-bottom: 0
            }

            strong {
                font-weight: bolder
            }

            small {
                font-size: 80%
            }

            a {
                color: #007bff;
                text-decoration: none;
                background-color: transparent;
                -webkit-text-decoration-skip: objects
            }

            figure {
                margin: 0 0 1rem
            }

            img {
                vertical-align: middle;
                border-style: none
            }

            svg:not(:root) {
                overflow: hidden
            }

            button {
                border-radius: 0
            }

            button,input,select {
                margin: 0;
                font-family: inherit;
                font-size: inherit;
                line-height: inherit
            }

            button,input {
                overflow: visible
            }

            button,select {
                text-transform: none
            }

            [type=submit],button,html [type=button] {
                -webkit-appearance: button
            }

            [type=button]::-moz-focus-inner,[type=submit]::-moz-focus-inner,button::-moz-focus-inner {
                padding: 0;
                border-style: none
            }

            [type=search] {
                outline-offset: -2px;
                -webkit-appearance: none
            }

            [type=search]::-webkit-search-cancel-button,[type=search]::-webkit-search-decoration {
                -webkit-appearance: none
            }

            ::-webkit-file-upload-button {
                font: inherit;
                -webkit-appearance: button
            }

            h2,h3,h4 {
                margin-bottom: .5rem;
                font-family: inherit;
                font-weight: 500;
                line-height: 1.2;
                color: inherit
            }

            h2 {
                font-size: 2rem
            }

            h3 {
                font-size: 1.75rem
            }

            h4 {
                font-size: 1.5rem
            }

            .lead {
                font-size: 1.25rem;
                font-weight: 300
            }

            hr {
                margin-top: 1rem;
                margin-bottom: 1rem;
                border: 0;
                border-top: 1px solid rgba(0,0,0,.1)
            }

            .small,small {
                font-size: 80%;
                font-weight: 400
            }

            .row {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -ms-flex-wrap: wrap;
                flex-wrap: wrap;
                margin-right: -15px;
                margin-left: -15px
            }

            .no-gutters {
                margin-right: 0;
                margin-left: 0
            }

            .no-gutters>[class*=col-] {
                padding-right: 0;
                padding-left: 0
            }

            .col-lg-3,.col-lg-4,.col-md-6 {
                position: relative;
                width: 100%;
                min-height: 1px;
                padding-right: 15px;
                padding-left: 15px
            }

            @media (min-width: 768px) {
                .col-md-6 {
                    -webkit-box-flex:0;
                    -ms-flex: 0 0 50%;
                    flex: 0 0 50%;
                    max-width: 50%
                }
            }

            @media (min-width: 992px) {
                .col-lg-3 {
                    -webkit-box-flex:0;
                    -ms-flex: 0 0 25%;
                    flex: 0 0 25%;
                    max-width: 25%
                }

                .col-lg-4 {
                    -webkit-box-flex: 0;
                    -ms-flex: 0 0 33.333333%;
                    flex: 0 0 33.333333%;
                    max-width: 33.333333%
                }
            }

            .form-control {
                display: block;
                width: 100%;
                padding: .375rem .75rem;
                font-size: 1rem;
                line-height: 1.5;
                color: #495057;
                background-color: #fff;
                background-clip: padding-box;
                border: 1px solid #ced4da;
                border-radius: .25rem
            }

            .form-control::-ms-expand {
                background-color: transparent;
                border: 0
            }

            .form-control::-webkit-input-placeholder {
                color: #6c757d;
                opacity: 1
            }

            .form-control::-moz-placeholder {
                color: #6c757d;
                opacity: 1
            }

            .form-control:-ms-input-placeholder {
                color: #6c757d;
                opacity: 1
            }

            .form-control::-ms-input-placeholder {
                color: #6c757d;
                opacity: 1
            }

            .btn {
                display: inline-block;
                font-weight: 400;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                border: 1px solid transparent;
                padding: .375rem .75rem;
                font-size: 1rem;
                line-height: 1.5;
                border-radius: .25rem
            }

            .btn-primary {
                color: #fff;
                background-color: #007bff;
                border-color: #007bff
            }

            .btn-outline-primary {
                color: #007bff;
                background-color: transparent;
                background-image: none;
                border-color: #007bff
            }

            .btn-lg {
                padding: .5rem 1rem;
                font-size: 1.25rem;
                line-height: 1.5;
                border-radius: .3rem
            }

            .fade {
                opacity: 0
            }

            .dropdown-item {
                display: block;
                width: 100%;
                padding: .25rem 1.5rem;
                clear: both;
                font-weight: 400;
                color: #212529;
                text-align: inherit;
                white-space: nowrap;
                background-color: transparent;
                border: 0
            }

            .input-group {
                position: relative;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -ms-flex-wrap: wrap;
                flex-wrap: wrap;
                -webkit-box-align: stretch;
                -ms-flex-align: stretch;
                align-items: stretch;
                width: 100%
            }

            .input-group>.form-control {
                position: relative;
                -webkit-box-flex: 1;
                -ms-flex: 1 1 auto;
                flex: 1 1 auto;
                width: 1%;
                margin-bottom: 0
            }

            .input-group>.form-control:not(:last-child) {
                border-top-right-radius: 0;
                border-bottom-right-radius: 0
            }

            .nav {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -ms-flex-wrap: wrap;
                flex-wrap: wrap;
                padding-left: 0;
                margin-bottom: 0;
                list-style: none
            }

            .nav-link {
                display: block;
                padding: .5rem 1rem
            }

            .tab-content>.tab-pane {
                display: none
            }

            .progress {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                height: 1rem;
                overflow: hidden;
                font-size: .75rem;
                background-color: #e9ecef;
                border-radius: .25rem
            }

            .progress-bar {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal;
                -ms-flex-direction: column;
                flex-direction: column;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                color: #fff;
                text-align: center;
                background-color: #007bff
            }

            .media {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: start;
                -ms-flex-align: start;
                align-items: flex-start
            }

            .media-body {
                -webkit-box-flex: 1;
                -ms-flex: 1;
                flex: 1
            }

            .clearfix::after {
                display: block;
                clear: both;
                content: ""
            }

            .d-flex {
                display: -webkit-box!important;
                display: -ms-flexbox!important;
                display: flex!important
            }

            .flex-column {
                -webkit-box-orient: vertical!important;
                -webkit-box-direction: normal!important;
                -ms-flex-direction: column!important;
                flex-direction: column!important
            }

            .align-self-center {
                -ms-flex-item-align: center!important;
                align-self: center!important
            }

            .fa,.icon {
                -moz-osx-font-smoothing: grayscale
            }

            .form-control {
                box-shadow: none
            }

            .form-control {
                border: 1px solid #f1f1f1;
                padding: .375rem .75rem;
                height: 50px;
                background: 0 0;
                color: #959595;
                font-size: 1rem;
                border-radius: 0
            }

            select {
                border: 1px solid #e3e3e3!important
            }

            .input-group-btn {
                color: #fff;
                background: #2154cf
            }

            .wp-caption {
                color: #666;
                font-size: 13px;
                font-style: italic;
                margin-bottom: 1.5em;
                max-width: 100%
            }

            .wp-caption .wp-caption-text {
                margin: .8075em 0
            }

            .wp-caption {
                background: #fff;
                border: 1px solid #f0f0f0;
                max-width: 96%;
                padding: 5px 3px 10px;
                text-align: center;
                overflow: hidden
            }

            .wp-caption img {
                border: 0;
                height: auto;
                margin: 0;
                max-width: 98.5%;
                padding: 0;
                width: auto
            }

            img {
                -ms-interpolation-mode: bicubic;
                border: 0;
                height: auto;
                max-width: 100%;
                vertical-align: middle
            }

            a,h2,h3,h4,p,span {
                overflow-wrap: break-word
            }

            .fa {
                display: inline-block
            }

            .megamenu-list {
                width: 100%;
                margin: 0 0 15px;
                padding: 0;
                display: inline-block;
                float: left;
                list-style: none
            }

            .megamenu-list:last-child {
                margin: 0;
                border: none
            }

            .megamenu-list>li>a {
                width: 100%;
                padding: 10px 15px;
                display: inline-block;
                color: #70798b;
                text-decoration: none;
                font-size: 13px
            }

            @font-face {
                font-family: marketo-icons;
                src: url(https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/fonts/marketo-icons.eot?d0ud5n);
                src: url(https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/fonts/marketo-icons.eot?d0ud5n#iefix) format('embedded-opentype'),url(https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/fonts/marketo-icons.ttf?d0ud5n) format('truetype'),url(https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/fonts/marketo-icons.woff?d0ud5n) format('woff'),url(https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/fonts/marketo-icons.svg?d0ud5n#marketo-icons) format('svg');
                font-weight: 400;
                font-style: normal;
                font-display:swap}

            .xsicon {
                font-family: marketo-icons!important;
                speak: never;
                font-style: normal;
                font-weight: 400;
                font-variant: normal;
                text-transform: none;
                line-height: 1;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale
            }

            .xsicon-bars:before {
                content: "\e90b"
            }

            .xsicon-facebook-f:before {
                content: "\e92c"
            }

            .xsicon-globe-europe:before {
                content: "\e935"
            }

            .xsicon-instagram:before {
                content: "\e93d"
            }

            .xsicon-pinterest-p:before {
                content: "\e951"
            }

            .xsicon-search:before {
                content: "\e962"
            }

            .xsicon-twitter:before {
                content: "\e979"
            }

            .xsicon-user-regular:before {
                content: "\e97b"
            }

            .xsicon-angle-down:before {
                content: "\e904"
            }

            .xsicon-heart-regular:before {
                content: "\e91a"
            }

            .xsicon-shopping-bag:before {
                content: "\e928"
            }

            .xsicon-shuttle-van:before {
                content: "\e92b"
            }

            .xsicon-ul-list:before {
                content: "\e930"
            }

            .xsicon-cross:before {
                content: "\ea0f"
            }

            :root {
                --swiper-theme-color:#007aff}

            .swiper {
                margin-left: auto;
                margin-right: auto;
                position: relative;
                overflow: hidden;
                list-style: none;
                padding: 0;
                z-index: 1
            }

            .swiper-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                z-index: 1;
                display: flex;
                box-sizing: content-box
            }

            .swiper-wrapper {
                transform: translate3d(0px,0,0)
            }

            .swiper-slide {
                flex-shrink: 0;
                width: 100%;
                height: 100%;
                position: relative
            }

            :root {
                --swiper-navigation-size:44px}

            img {
                border: none
            }

            .xs-product-offer-label {
                -webkit-box-orient: vertical;
                -webkit-box-direction: normal
            }

            body {
                font-weight: 400;
                font-size: 14px;
                line-height: 25px;
                color: #4a4a4a;
                background-color: #fff;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                overflow-x: hidden;
                font-display: swap
            }

            h2,h3,h4 {
                font-display: swap
            }

            a,div,li,ul {
                -moz-outline-: none
            }

            input {
                -moz-outline: none;
                outline: 0
            }

            img:not([draggable]) {
                max-width: 100%;
                height: auto
            }

            a,a:visited {
                text-decoration: none;
                outline: 0
            }

            img {
                max-width: 100%
            }

            li,ul {
                list-style: none;
                padding: 0;
                margin: 0
            }

            h2,h3,h4 {
                color: #1c1c24;
                font-weight: 600
            }

            h2 {
                font-size: 2rem
            }

            h3 {
                font-size: 1.75rem
            }

            h4 {
                font-size: 1.5rem
            }

            .xs-wish-list-item {
                padding: 26px 0;
                text-align: right;
                display: flex;
                justify-content: flex-end;
                align-items: center
            }

            .xs-wish-list {
                margin-right: 30px;
                display: inline-block
            }

            .xs-single-wishList {
                font-size: 2.14286em;
                color: #555;
                position: relative
            }

            .xs-single-wishList .xs-item-count {
                font-size: .4em;
                color: #565656;
                font-weight: 500;
                position: absolute;
                top: -5px;
                right: -5px;
                display: inline-block;
                width: 21px;
                height: 21px;
                line-height: 17px;
                border: 3px solid #fff;
                text-align: center;
                background-color: #f0f0f0;
                border-radius: 100%
            }

            .xs-single-wishList .xs-item-count.highlight {
                background-color: #0063d1;
                color: #fff
            }

            @keyframes fadeIn {
                from {
                    opacity: 0
                }

                to {
                    opacity: 1
                }
            }

            .xs-navbar-search {
                height: 60px;
                border: 2px solid #e7e7e7;
                border-radius: 4px;
                position: relative
            }

            .xs-navbar-search .input-group {
                height: 100%
            }

            .xs-navbar-search input:not([type=submit]) {
                border: 0;
                border-radius: 0;
                padding-left: 28px;
                font-size: 1em
            }

            .xs-navbar-search .xs-category-select-wraper {
                position: relative
            }

            .xs-navbar-search .xs-category-select-wraper::before {
                position: absolute;
                content: "";
                left: 0;
                top: 50%;
                -webkit-transform: translateY(-50%);
                transform: translateY(-50%);
                height: 40px;
                width: 1px;
                background-color: #e7e7e7;
                z-index: 1
            }

            .xs-navbar-search .btn[type=submit] {
                height: calc(100% + 4px);
                background-color: #0063d1;
                width: 68px;
                font-size: 1em;
                color: #f7f8fa;
                border-radius: 0 4px 4px 0;
                margin-right: -2px;
                margin-top: -2px;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center
            }

            .xs-navDown {
                padding-bottom: 10px
            }

            .xs-navDown .btn:not([type=submit]) {
                width: 100%;
                font-size: 12px;
                color: #797979!important;
                letter-spacing: .2px;
                padding: 8px 12px;
                border: 2px solid #e7e7e7
            }

            .xs-navDown .btn:not([type=submit]) strong {
                display: block;
                font-size: 16px;
                text-transform: uppercase;
                color: #0063d1
            }

            .price del {
                padding-left: 5px
            }

            .xs-product-header {
                position: relative;
                margin-bottom: 5px;
                z-index: 2
            }

            .product-title {
                font-size: 1.14286em;
                font-weight: 500;
                margin-bottom: 10px;
                line-height: 1.625
            }

            .product-title {
                color: #222;
                display: inline-block
            }

            .product-title.small {
                font-size: 1em
            }

            .price {
                color: #83b735;
                font-size: 1.28571em
            }

            .price del {
                color: #d4d4d4
            }

            .price.small {
                font-size: 1em
            }

            .xs-banner-campaign {
                display: block;
                position: relative;
                overflow: hidden
            }

            .xs-banner-campaign::before {
                position: absolute;
                content: "";
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,.5);
                -webkit-transform: scale3d(1.9,1.4,1) rotate3d(0,0,1,45deg) translate3d(0,-200%,0);
                transform: scale3d(1.9,1.4,1) rotate3d(0,0,1,45deg) translate3d(0,-200%,0)
            }

            .xs-product-widget {
                margin-bottom: 30px;
                background-color: #fff;
                border: 1px solid #e3e3e3;
                position: relative
            }

            .xs-product-widget img {
                opacity: 1
            }

            .xs-product-widget:last-child {
                margin-bottom: 0
            }

            .xs-product-widget .product-widget-content {
                padding: 30px
            }

            .xs-product-widget.version-2 {
                border: 0
            }

            .product-thumb-version .xs-product-widget {
                border: 0;
                border-right: 1px solid #ededed;
                margin-bottom: 30px
            }

            .product-thumb-version .xs-product-widget .price {
                color: #0063d1
            }

            .product-thumb-version .xs-product-widget img {
                padding-left: 6px
            }

            .product-thumb-version [class^=col-]:last-child .xs-product-widget {
                border-right: 0
            }

            .xs-deal-blocks {
                padding-bottom: 28px;
                padding-left: 28px!important;
                padding-right: 28px!important;
                text-align: center
            }

            .xs-deal-blocks img {
                display: block;
                margin: 0 auto;
                opacity: 1;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden;
                padding: 10px
            }

            .xs-deal-blocks hr {
                border-color: #f4f4f4;
                margin: 0 auto 15px
            }

            .xs-deal-blocks .xs-countdown-timer {
                padding: 0 75px
            }

            .xs-deal-stock-limit {
                margin-bottom: 10px
            }

            .xs-deal-stock-limit .product-sold {
                float: left
            }

            .xs-deal-stock-limit .product-available {
                float: right
            }

            .product-available,.product-sold {
                font-size: .85714em
            }

            .xs-progress {
                height: 10px;
                background-color: #f5f5f5;
                border-radius: 5px;
                margin-bottom: 28px
            }

            .xs-progress .progress-bar {
                background-color: #83b735;
                border-radius: 5px
            }

            .xs-deal-blocks.deal-block-v2 h4 {
                font-size: 1em;
                color: #777;
                font-weight: 400;
                margin-bottom: 24px
            }

            .xs-deal-blocks.deal-block-v2 h4 span {
                font-weight: 500;
                font-size: 1.28571em
            }

            .xs-deal-blocks.deal-block-v2 {
                position: relative;
                background-color: #fff;
                border-right: 1px solid #ededed
            }

            .xs-deal-blocks.deal-block-v2 .product-title {
                text-align: center
            }

            .xs-deal-blocks.deal-block-v2 .xs-product-offer-label {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 70px;
                height: 70px
            }

            .xs-deal-blocks.deal-block-v2 .xs-product-offer-label span {
                font-size: 1.28571em
            }

            .xs-deal-blocks.deal-block-v2 .price {
                color: #0063d1;
                display: block;
                text-align: center
            }

            .xs-deal-blocks.deal-block-v2 hr {
                width: calc(100% - 56px)
            }

            .price {
                margin-bottom: 25px
            }

            @-webkit-keyframes fadeIn {
                0% {
                    opacity: 0;
                    -webkit-transform: scale(.6);
                    transform: scale(.6)
                }

                100% {
                    opacity: 100%;
                    -webkit-transform: scale(1);
                    transform: scale(1)
                }
            }

            @keyframes fadeIn {
                0% {
                    opacity: 0
                }

                100% {
                    opacity: 100%
                }
            }

            .widget {
                margin-bottom: 40px
            }

            .block-product-cate-wraper {
                position: relative;
                z-index: 1;
                text-align: center;
                color: #fff;
                padding: 19px;
                background-repeat: no-repeat;
                background-position: center center;
                background-size: cover;
                height: 100%
            }

            .block-product-cate-wraper .block-cate-header {
                font-size: 1.42857em;
                margin-bottom: 4px
            }

            .block-product-cate-wraper .nav .nav-link {
                color: #fff;
                padding: 10px 0;
                font-size: 1em;
                font-weight: 700
            }

            .block-product-cate-wraper .nav .nav-item:last-child .nav-link {
                padding-bottom: 0
            }

            .xs-minicart-widget,.xs-sidebar-group .xs-overlay {
                position: fixed;
                top: 0;
                bottom: 0;
                overflow: hidden;
                opacity: 0;
                width: 100%;
                visibility: hidden
            }

            .xs-sidebar-group .xs-overlay {
                left: 0;
                height: 100%;
                z-index: 9999
            }

            .xs-minicart-widget {
                right: -100%;
                max-width: 360px;
                z-index: 999999;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                background-color: #fff;
                padding: 30px
            }

            .xs-minicart-widget .widget-heading {
                padding-bottom: 20px;
                margin-bottom: 20px;
                border-bottom: 1px solid #eaeaea
            }

            .xs-minicart-widget .widget-heading .widget-title {
                margin-bottom: 0;
                font-size: 1.28571em
            }

            .close-side-widget {
                color: #222;
                font-size: 13px;
                display: block;
                height: 30px;
                max-width: 30px;
                background-color: #ededed;
                margin-left: auto;
                text-align: center;
                line-height: 30px;
                border-radius: 100%
            }

            .xs-heading-sub {
                color: #0063d1;
                font-size: 1.28571em;
                font-weight: 400;
                margin-bottom: 10px
            }

            .btn:not([data-toggle=popover]) {
                display: inline-block;
                font-size: .85714em;
                font-weight: 500;
                padding: 16px 35px;
                letter-spacing: .3px;
                position: relative;
                z-index: 1;
                overflow: hidden;
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden
            }

            .btn:not([data-toggle=popover]).btn-outline-primary {
                color: #0063d1
            }

            .btn:not([data-toggle=popover]).btn-primary {
                background-color: #0063d1
            }

            .btn:not([data-toggle=popover])::before {
                content: "";
                z-index: -1;
                position: absolute;
                top: 50%;
                left: 100%;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background-color: #222;
                -webkit-transform-origin: 100% 50%;
                transform-origin: 100% 50%;
                -webkit-transform: scale3d(1,2,1);
                transform: scale3d(1,2,1);
                -webkit-backface-visibility: hidden;
                backface-visibility: hidden
            }

            .btn:not([data-toggle=popover]).btn-primary {
                border: 0
            }

            .btn:not([data-toggle=popover]).btn-primary::before {
                background-color: #83b735
            }

            .xs-product-offer-label {
                width: 100px;
                height: 100px;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                text-align: center;
                -ms-flex-direction: column;
                flex-direction: column;
                border-radius: 100%;
                background-color: #62ab00;
                color: #fff
            }

            .xs-product-offer-label span {
                font-weight: 700;
                font-size: 1.57143em;
                line-height: 1;
                margin-bottom: 4px
            }

            .xs-product-offer-label small {
                font-size: 1em;
                line-height: 1
            }

            .star-rating {
                position: relative;
                height: auto;
                width: 100%;
                display: inline-block
            }

            .add_to_wishlist {
                color: #83b735;
                font-size: .85714em
            }

            .xs-countdown-timer {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                text-align: center;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center
            }

            .color-primary {
                color: #0063d1
            }

            .bg-black {
                background-color: #000
            }

            .xs-overlay {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                opacity: .5;
                z-index: 0
            }

            .lead {
                font-size: 1.14286em;
                font-weight: 400
            }

            @media (max-width: 991px) {
                .xs-single-wishList .xs-item-count.highlight {
                    display:none
                }
            }

            input[type=search],select {
                display: block;
                width: 100%;
                height: 45px;
                border: 2px solid #e3e3e3;
                border-radius: 0;
                background-color: #fff;
                padding: 0 8px;
                font-size: 1em!important
            }

            p.lead {
                margin-bottom: 25px;
                margin-top: 15px
            }

            ins {
                text-decoration: none
            }

            .woocommerce-Price-amount.amount {
                color: #83b735;
                padding-left: 5px
            }

            del .woocommerce-Price-amount.amount {
                padding-left: 0
            }

            del,del .woocommerce-Price-amount.amount {
                color: #d4d4d4
            }

            .woocommerce .star-rating::before {
                color: #fed700
            }

            .woocommerce .star-rating span::before {
                color: #fed700
            }

            .xs-product-header {
                display: block
            }

            .xs-product-header .yith-wcwl-add-to-wishlist {
                float: right
            }

            .xs-product-header .star-rating {
                float: left
            }

            .xs-wishlist a.add_to_wishlist:before {
                content: "\e91a";
                font: normal normal normal 14px/1 'marketo-icons'!important;
                width: 100%
            }

            .xs-wishlist>div a {
                font-size: 0;
                display: inline-block
            }

            .xs-wishlist .yith-wcwl-add-button a.add_to_wishlist {
                border-radius: 100%;
                line-height: 40px
            }

            .xs-wishlist .yith-wcwl-add-to-wishlist {
                position: relative
            }

            .xs-product-header.media.xs-wishlist {
                height: 30px
            }

            .yith-wcwl-add-button .single_add_to_wishlist>span {
                display: none
            }

            .xs-sidebar-group .xs-overlay {
                position: fixed;
                top: 0;
                left: 0;
                height: 100%;
                bottom: 0;
                width: 100%;
                overflow: hidden;
                z-index: 9999;
                opacity: 0;
                visibility: hidden
            }

            .xs-minicart-widget {
                position: fixed;
                right: -100%;
                top: 0;
                bottom: 0;
                width: 100%;
                max-width: 360px;
                z-index: 999999;
                overflow: hidden;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
                background-color: #fff;
                padding: 30px;
                visibility: hidden;
                opacity: 0
            }

            .close-side-widget {
                color: #222;
                font-size: 13px;
                display: block;
                height: 30px;
                max-width: 30px;
                background-color: #ededed;
                margin-left: auto;
                text-align: center;
                line-height: 30px;
                border-radius: 100%
            }

            .megamenu.menu-item {
                position: initial
            }

            .xs-product-header.media.xs-wishlist {
                justify-content: space-between
            }

            .xs-product-header.media .star-rating {
                text-align: left
            }

            .xs-product-widget.media .woocommerce-Price-amount.amount {
                padding-left: 0
            }

            .product-title {
                margin-bottom: 5px;
                display: block
            }

            .product-thumb-version .xs-product-widget a~.product-widget-content {
                padding: 0 10px
            }

            .xs-product-widget a~.product-widget-content {
                padding: 0 20px
            }

            .xs_product_img_link {
                display: block
            }

            .xs-category-select-wraper>i {
                position: absolute;
                left: -30px;
                top: 38%;
                font-size: 1em;
                z-index: 99
            }

            .xs-ele-nav-search-widget .form-control {
                background-color: transparent
            }

            .xs-navbar-search .xs-category-select-wraper {
                width: 30%
            }

            .xs-deal-blocks .xs_product_img_link {
                display: block
            }

            .xs-product-widget.media .yith-wcwl-add-to-wishlist {
                margin-top: 0
            }

            .xs-product-widget.media .xs-wishlist .yith-wcwl-add-button a.add_to_wishlist {
                border-radius: 100%;
                line-height: 0
            }

            .ekit-vertical-menu-tigger {
                position: relative;
                z-index: 25
            }

            .xs-navbar-search .input-group .form-control {
                height: 100%
            }

            .xs-ele-nav-search-widget .btn:not([data-toggle=popover]) {
                padding: 0;
                align-items: center
            }

            .elementskit-navbar-nav .elementskit-dropdown li:first-child {
                margin-top: 0
            }

            .elementskit-navbar-nav .elementskit-dropdown li:last-child {
                margin-bottom: 0
            }

            .xs-navbar-search .btn[type=submit] {
                align-items: center
            }

            .elementskit-navbar-nav-default .megamenu-v2 .megamenu-list>li {
                border-left: 2px solid #3d404a
            }

            .elementskit-navbar-nav-default .megamenu-v2 .megamenu-list>li>a {
                position: relative
            }

            .elementskit-navbar-nav-default .megamenu-v2 .megamenu-list>li>a::before {
                position: absolute;
                left: -2px;
                top: 0;
                content: "";
                height: 100%;
                width: 2px;
                background-color: #0063d1;
                opacity: 0
            }

            .elementskit-navbar-nav-default .megamenu-list>li>a {
                color: rgba(255,255,255,.8)
            }

            .yith-wcwl-add-to-wishlist {
                margin-top: 0
            }

            .xs-wishlist .yith-wcwl-add-button a.add_to_wishlist {
                line-height: unset;
                display: flex;
                align-items: center
            }

            .xs-navDown.xs-ele-nav-button {
                padding-bottom: 0
            }

            .elementskit-navbar-nav-default .ekit-menu-badge>.ekit-menu-badge-arrow {
                bottom: -6px;
                left: 0;
                transform: none;
                border-width: 3px
            }

            .elementskit-navbar-nav-default .ekit-menu-badge {
                top: -11px;
                padding: 6px 8px;
                border-radius: 0;
                right: 11px;
                font-size: 11px;
                font-weight: 500
            }

            @media only screen and (max-width: 1024px) {
                .elementskit-navbar-nav-default .elementskit-megamenu-panel {
                    width:auto!important
                }
            }

            @media (min-width: 1025px) {
                .elementskit-menu-po-center .elementskit-megamenu-has.top_position.elementskit-dropdown-menu-custom_width .elementskit-megamenu-panel {
                    transform:translateY(-10px) translateX(-50%);
                    left: 50%
                }

                .xs-category-select-wraper select.xs-ele-nav-search-select {
                    border: 0!important;
                    height: 100%
                }
            }

            @media (max-width: 1024px) {
                .ekit-wid-con .elementskit-menu-overlay {
                    z-index:144
                }

                .ekit-vertical-navbar-nav .elementskit-submenu-indicator {
                    padding: 3px 10px;
                    border: 1px solid;
                    border-radius: 30px
                }
            }

            .product-widget-content .price del {
                padding-left: 0
            }

            .block-product-cate-wraper .block-cate-header {
                color: #fff
            }

            @media (min-width: 1025px) {
                .elementskit-navbar-nav-default .elementskit-megamenu-has .elementskit-megamenu-panel {
                    display:none
                }

                .ekit-vertical-navbar-nav .elementskit-megamenu-panel {
                    max-height: 600px;
                    min-height: 600px;
                    overflow-y: auto;
                    overflow-x: hidden
                }
            }

            .animated {
                animation-fill-mode: backwards!important
            }

            .price del {
                opacity: .5
            }

            .close-side-widget>i {
                padding-right: 0
            }

            .elementskit-submenu-indicator {
                transform: rotate(-90deg)
            }

            body .elementskit-navbar-nav-default.elementskit_none .elementskit-submenu-indicator::before {
                content: "\e905"!important;
                font-family: marketo-icons;
                transform: rotate(45deg)
            }

            html:not(.is-active-page) section .elementor-section:not(:nth-child(-n+2)) {
                background-image: none!important
            }

            @media (min-width: 992px) and (max-width:1199px) {
                body {
                    font-size:14px
                }

                .xs-slider-main {
                    float: left;
                    width: 48%;
                    margin-right: 15px
                }

                .xs-slider-main+.xs-slider-main {
                    float: right
                }
            }

            @media (max-width: 991px) {
                html {
                    font-size:90%
                }

                .btn {
                    padding: 10px 25px
                }

                .product-title {
                    font-size: 1em
                }

                .price {
                    font-size: 1em
                }

                .xs-banner-campaign img {
                    width: 100%
                }

                [class*=xs-product-slider] {
                    margin-bottom: 30px
                }

                .xs-deal-blocks.deal-block-v2 {
                    text-align: center;
                    margin-bottom: 30px
                }

                .block-product-cate-wraper .nav .nav-link {
                    padding: 18px 0
                }

                .xs-deal-blocks .xs-countdown-timer {
                    padding: 0 10px
                }

                .xs-product-widget {
                    padding-bottom: 30px
                }
            }

            @media (max-width: 767px) {
                html {
                    font-size:80%
                }

                .xs-wish-list-item .xs-miniCart-dropdown {
                    text-align: left
                }

                .xs-product-offer-label {
                    width: 80px;
                    height: 80px
                }

                .xs-product-offer-label span {
                    font-size: 1.27143em
                }

                .xs-countdown-timer {
                    -ms-flex-wrap: wrap;
                    flex-wrap: wrap
                }

                .block-product-cate-wraper {
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden
                }

                .block-product-cate-wraper .nav .nav-link {
                    padding: 10px 0
                }
            }

            @media (max-width: 480px) {
                html {
                    font-size:65%
                }
            }

            @media (max-width: 320px) {
                html {
                    font-size:60.5%
                }
            }

            .ekit-wid-con .nav::after,.ekit-wid-con .nav::before {
                display: table;
                content: " "
            }

            .ekit-wid-con .nav::after {
                clear: both
            }

            :focus {
                outline: 0
            }

            button::-moz-focus-inner {
                padding: 0;
                border: 0
            }

            .elementskit-menu-container {
                z-index: 10000
            }

            .ekit-menu-badge {
                position: absolute;
                top: 5px;
                left: 50%;
                background-color: #bbb;
                color: #fff;
                font-size: 16px;
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 8px;
                line-height: 1;
                -webkit-transform: translateX(-50%);
                transform: translateX(-50%);
                white-space: nowrap;
                z-index: 10
            }

            .ekit-menu-badge>.ekit-menu-badge-arrow {
                position: absolute;
                top: 100%;
                left: 50%;
                -webkit-transform: translateX(-50%);
                transform: translateX(-50%);
                border-left: solid transparent;
                border-right: solid transparent;
                border-top: solid #bbb;
                border-bottom: solid transparent;
                border-width: 6px
            }

            .elementskit-dropdown li {
                position: relative
            }

            .elementskit-navbar-nav-default .elementskit-navbar-nav {
                padding-left: 0;
                margin-bottom: 0;
                list-style: none;
                margin-left: 0
            }

            .elementskit-navbar-nav-default .elementskit-navbar-nav>li {
                position: relative
            }

            .elementskit-navbar-nav-default .elementskit-navbar-nav>li>a {
                height: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                text-decoration: none
            }

            .elementskit-navbar-nav-default .elementskit-navbar-nav>li.elementskit-megamenu-has {
                position: static
            }

            .elementskit-navbar-nav-default .elementskit-navbar-nav>li>a {
                text-transform: none;
                font-weight: 500;
                letter-spacing: normal
            }

            .elementskit-navbar-nav-default .elementskit-dropdown {
                border-top: 1px solid #dadada;
                border-left: 1px solid #dadada;
                border-bottom: 1px solid #dadada;
                border-right: 1px solid #dadada;
                background-color: #f4f4f4;
                border-bottom-right-radius: 0;
                border-bottom-left-radius: 0;
                border-top-right-radius: 0;
                border-top-left-radius: 0;
                padding-left: 0;
                list-style: none;
                opacity: 0;
                visibility: hidden
            }

            .elementskit-navbar-nav-default .elementskit-dropdown>li>.elementskit-dropdown {
                left: 100%;
                top: 0
            }

            .elementskit-navbar-nav-default .elementskit-submenu-panel>li>a {
                display: block;
                padding-top: 15px;
                padding-left: 10px;
                padding-bottom: 15px;
                padding-right: 10px;
                color: #000;
                font-weight: 400;
                font-size: 14px
            }

            .elementskit-navbar-nav-default .elementskit-megamenu-panel {
                width: 100%
            }

            .elementskit-navbar-nav-default .elementskit-nav-identity-panel {
                display: none
            }

            .elementskit-navbar-nav-default .elementskit-menu-close {
                border: 1px solid rgba(0,0,0,.5);
                color: rgba(51,51,51,.5);
                float: right;
                margin-top: 20px;
                margin-left: 20px;
                margin-right: 20px;
                margin-bottom: 20px
            }

            .elementskit-navbar-nav-default .elementskit-dropdown-has>a {
                position: relative
            }

            .elementskit-navbar-nav-default .elementskit-dropdown-has>a .elementskit-submenu-indicator {
                margin-left: 6px;
                display: block;
                float: right;
                position: relative;
                font-weight: 900;
                font-style: normal;
                font-size: 11px
            }

            @media (max-width: 1024px) {
                .elementskit-navbar-nav-default .elementskit-dropdown-has>a .elementskit-submenu-indicator {
                    padding:4px 15px
                }
            }

            .elementskit-navbar-nav-default.elementskit_none .elementskit-submenu-indicator::before {
                content: ""!important
            }

            .elementskit-navbar-nav-default.elementskit-menu-container {
                background: transparent;
                background: -webkit-gradient(linear,left bottom,left top,from(rgba(255,255,255,0)),to(rgba(255,255,255,0)));
                background: linear-gradient(0deg,rgba(255,255,255,0) 0,rgba(255,255,255,0) 100%);
                border-bottom-right-radius: 0;
                border-bottom-left-radius: 0;
                border-top-right-radius: 0;
                border-top-left-radius: 0;
                position: relative;
                height: 100px;
                z-index: 90000
            }

            .elementskit-navbar-nav-default .elementskit-dropdown {
                min-width: 250px;
                margin-left: 0
            }

            .elementskit-navbar-nav-default .elementskit-navbar-nav {
                height: 100%;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -ms-flex-wrap: wrap;
                flex-wrap: wrap;
                -webkit-box-pack: start;
                -ms-flex-pack: start;
                justify-content: flex-start
            }

            .elementskit-navbar-nav-default .elementskit-navbar-nav>li>a {
                font-size: 15px;
                color: #000;
                padding-left: 15px;
                padding-right: 15px
            }

            .elementskit-navbar-nav-default .elementskit-navbar-nav.elementskit-menu-po-center {
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center
            }

            @media (min-width: 1025px) {
                .elementskit-navbar-nav-default .elementskit-dropdown {
                    -webkit-box-shadow:0 10px 30px 0 rgba(45,45,45,.2);
                    box-shadow: 0 10px 30px 0 rgba(45,45,45,.2);
                    position: absolute;
                    top: 100%;
                    left: 0;
                    -webkit-transform: translateY(-10px);
                    transform: translateY(-10px);
                    max-height: none;
                    z-index: 999
                }

                .elementskit-navbar-nav-default .elementskit-megamenu-panel {
                    -webkit-transform: translateY(-10px);
                    transform: translateY(-10px);
                    opacity: 0;
                    visibility: hidden;
                    margin-left: 0;
                    position: absolute;
                    left: 0;
                    top: 100%;
                    display: block;
                    z-index: 999
                }
            }

            @media (max-width: 1024px) {
                .ekit_menu_responsive_tablet>.elementskit-navbar-nav-default {
                    background-color:#f7f7f7
                }

                .elementskit-navbar-nav-default.elementskit-menu-offcanvas-elements {
                    width: 100%;
                    position: fixed;
                    top: 0;
                    left: -100vw;
                    height: 100%;
                    -webkit-box-shadow: 0 10px 30px 0 transparent;
                    box-shadow: 0 10px 30px 0 transparent;
                    overflow-y: auto;
                    overflow-x: hidden;
                    padding-top: 0;
                    padding-left: 0;
                    padding-right: 0;
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-orient: vertical;
                    -webkit-box-direction: reverse;
                    -ms-flex-direction: column-reverse;
                    flex-direction: column-reverse;
                    -webkit-box-pack: end;
                    -ms-flex-pack: end;
                    justify-content: flex-end
                }

                .elementskit-navbar-nav-default .elementskit-nav-identity-panel {
                    display: block;
                    position: relative;
                    z-index: 5;
                    width: 100%
                }

                .elementskit-navbar-nav-default .elementskit-nav-identity-panel .elementskit-site-title {
                    float: left
                }

                .elementskit-navbar-nav-default .elementskit-nav-identity-panel .elementskit-menu-close {
                    float: right
                }

                .elementskit-navbar-nav-default .elementskit-navbar-nav>li>a {
                    color: #000;
                    font-size: 12px;
                    padding-top: 5px;
                    padding-left: 10px;
                    padding-right: 5px;
                    padding-bottom: 5px
                }

                .elementskit-navbar-nav-default .elementskit-submenu-panel>li>a {
                    color: #000;
                    font-size: 12px;
                    padding-top: 7px;
                    padding-left: 7px;
                    padding-right: 7px;
                    padding-bottom: 7px
                }

                .elementskit-navbar-nav-default .elementskit-dropdown {
                    display: block;
                    border: 0;
                    margin-left: 0
                }

                .elementskit-navbar-nav-default .elementskit-megamenu-panel {
                    display: none
                }

                .elementskit-navbar-nav-default .elementskit-navbar-nav>.elementskit-dropdown-has>.elementskit-dropdown li a {
                    padding-left: 15px
                }
            }

            @media (min-width: 1025px) {
                .ekit-nav-dropdown-hover .elementskit-dropdown-has .elementskit-dropdown {
                    -webkit-box-shadow:0 10px 30px 0 rgba(45,45,45,.2);
                    box-shadow: 0 10px 30px 0 rgba(45,45,45,.2);
                    position: absolute;
                    top: 100%;
                    left: 0;
                    -webkit-transform: translateY(-10px);
                    transform: translateY(-10px);
                    max-height: none;
                    z-index: 999
                }
            }

            @media only screen and (max-width: 1024px) and (min-width:766px) {
                .ekit_menu_responsive_tablet .elementskit-navbar-nav-default .elementskit-dropdown {
                    display:none
                }

                .ekit_menu_responsive_tablet .elementskit-navbar-nav-default .elementskit-navbar-nav {
                    overflow-y: auto
                }

                .ekit_menu_responsive_tablet .elementskit-navbar-nav-default .elementskit-dropdown>li>.elementskit-dropdown {
                    left: 0
                }
            }

            .elementskit-menu-close,.elementskit-menu-hamburger {
                display: none
            }

            .elementskit-menu-hamburger {
                color: #000
            }

            @media (max-width: 1024px) {
                .elementskit-menu-overlay {
                    display:block;
                    position: fixed;
                    z-index: 14;
                    top: 0;
                    left: -100vw;
                    height: 100%;
                    width: 100%;
                    background-color: rgba(51,51,51,.5);
                    opacity: 1;
                    visibility: visible
                }

                .elementskit-menu-hamburger {
                    border: 1px solid rgba(0,0,0,.2);
                    float: right
                }

                .elementskit-menu-close,.elementskit-menu-hamburger {
                    padding: 8px;
                    background-color: transparent;
                    border-radius: .25rem;
                    position: relative;
                    z-index: 10;
                    width: 45px
                }

                .elementskit-navbar-nav .ekit-menu-badge {
                    font-size: 7px
                }
            }

            .dropdown-item,.ekit-menu-nav-link {
                position: relative
            }

            .dropdown-item>i,.ekit-menu-nav-link>i {
                padding-right: 5px
            }

            .elementskit-nav-logo {
                display: inline-block
            }

            @media (max-width: 1024px) {
                .elementor-widget-ekit-nav-menu {
                    -webkit-animation:none!important;
                    animation: none!important
                }

                .ekit-wid-con:not(.ekit_menu_responsive_mobile) .elementskit-navbar-nav {
                    display: block
                }
            }

            @media (max-width: 1024px) {
                .elementskit-menu-close,.elementskit-menu-hamburger {
                    display:block
                }

                .elementskit-menu-container {
                    max-width: 350px
                }

                .elementskit-menu-offcanvas-elements {
                    height: 100%!important;
                    padding-bottom: 10px
                }

                .elementskit-dropdown {
                    position: relative;
                    max-height: 0;
                    -webkit-box-shadow: none;
                    box-shadow: none
                }

                .ekit_menu_responsive_tablet .ekit-menu-badge {
                    position: static;
                    margin-left: 10px;
                    -webkit-box-ordinal-group: 2;
                    -ms-flex-order: 1;
                    order: 1;
                    -webkit-transform: none;
                    transform: none
                }

                .ekit_menu_responsive_tablet .ekit-menu-badge>.ekit-menu-badge-arrow {
                    display: none
                }

                .ekit_menu_responsive_tablet .elementskit-navbar-nav-default .elementskit-dropdown-has>a .elementskit-submenu-indicator {
                    margin-left: auto
                }

                .ekit_menu_responsive_tablet .elementskit-submenu-indicator {
                    -webkit-box-ordinal-group: 3;
                    -ms-flex-order: 2;
                    order: 2;
                    border: 1px solid;
                    border-radius: 30px
                }
            }

            @media (max-width: 767px) {
                .ekit_menu_responsive_tablet .elementskit-navbar-nav-default .elementskit-dropdown {
                    display:none
                }

                .ekit_menu_responsive_tablet .elementskit-navbar-nav-default .elementskit-navbar-nav {
                    overflow-y: auto
                }

                .ekit_menu_responsive_tablet .elementskit-navbar-nav-default .elementskit-dropdown>li>.elementskit-dropdown {
                    left: 0
                }
            }

            @media (min-width: 1025px) {
                .elementskit-megamenu-panel .elementor-section-wrap>.elementor-section>.elementor-container {
                    max-width:none
                }
            }

            @media (min-width: 1025px) {
                .ekit_menu_responsive_tablet .ekit-nav-menu--overlay {
                    display:none
                }
            }

            .ekit-vertical-menu-tigger {
                display: block;
                background: #ffb25d;
                -webkit-box-shadow: 0 7px 15px rgba(255,178,93,.3);
                box-shadow: 0 7px 15px rgba(255,178,93,.3);
                padding-top: 16px;
                padding-bottom: 16px;
                padding-left: 20px;
                padding-right: 16px;
                font-size: 14px;
                color: #fff;
                font-weight: 500;
                line-height: 1
            }

            .vertical-menu-right-icon {
                margin-right: 7px
            }

            .vertical-menu-left-icon {
                float: right
            }

            .ekit-vertical-navbar-nav {
                padding-left: 0;
                list-style: none;
                -webkit-box-shadow: 0 10px 25px rgba(0,0,0,.1);
                box-shadow: 0 10px 25px rgba(0,0,0,.1);
                background-color: #fff;
                margin-left: 0;
                margin-bottom: 0;
                list-style: none
            }

            .ekit-vertical-navbar-nav .elementskit-megamenu-panel {
                margin-left: 0;
                list-style: none;
                margin-bottom: 0
            }

            .ekit-vertical-navbar-nav>li:not(:last-child) {
                border-bottom: 1px solid #ededed
            }

            .ekit-vertical-navbar-nav>li>a {
                font-size: 14px;
                font-weight: 500;
                color: #101010;
                display: block;
                padding-top: 12px;
                padding-bottom: 12px;
                padding-left: 25px;
                padding-right: 19px;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center
            }

            .ekit-vertical-navbar-nav li.elementskit-dropdown-has {
                position: relative
            }

            @media (min-width: 1025px) {
                .ekit-vertical-navbar-nav li.elementskit-megamenu-has.relative_position {
                    position:relative
                }
            }

            @media (max-width: 1024px) {
                .ekit-vertical-navbar-nav .elementskit-megamenu-panel {
                    display:none;
                    width: auto!important
                }
            }

            @media (min-width: 1025px) {
                .ekit-vertical-navbar-nav .elementskit-megamenu-panel {
                    position:absolute;
                    left: 100%;
                    top: 0;
                    z-index: 100;
                    -webkit-transform: translateY(10px);
                    transform: translateY(10px);
                    opacity: 0;
                    visibility: hidden;
                    width: 100%
                }
            }

            .ekit-vertical-navbar-nav .elementskit-submenu-indicator {
                display: block;
                line-height: 1;
                margin-left: auto;
                position: relative;
                font-weight: 900;
                font-style: normal;
                font-family: "font awesome 5 free";
                -webkit-box-ordinal-group: 3;
                -ms-flex-order: 2;
                order: 2
            }

            .ekit-vertical-navbar-nav .elementskit-submenu-indicator::before {
                content: "\f105"
            }

            .ekit-vertical-main-menu-on-click {
                position: relative
            }

            .ekit-vertical-main-menu-on-click .ekit-vertical-menu-container {
                position: absolute;
                top: 100%;
                z-index: 1111;
                left: 0;
                width: 100%
            }

            .ekit-vertical-main-menu-on-click .ekit-vertical-menu-container {
                opacity: 0;
                visibility: hidden
            }

            .ekit-wid-con .elementor-inline-items {
                margin: 0!important
            }

            .ekit-wid-con .elementor-inline-items .elementor-icon-list-item {
                display: inline-block
            }

            .ekit-wid-con .elementor-inline-items .elementor-icon-list-item::after {
                display: inline-block
            }

            .elementor-widget .ekit-wid-con .elementor-inline-items .elementor-icon-list-item::after {
                position: absolute
            }

            .ekit-wid-con .elementor-inline-items .elementor-icon-list-item:last-child::after {
                display: none
            }

            .elementor-widget-elementskit-page-list:not(.ekit-has-divider-yes) .ekit-wid-con .elementor-inline-items .elementor-icon-list-item::after {
                display: none
            }

            .ekit-wid-con .elementor-icon-list-item>a {
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                position: relative;
                display: -webkit-inline-box;
                display: -ms-inline-flexbox;
                display: inline-flex
            }

            .ekit-wid-con .ekit_page_list_content {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex
            }

            .elementor-widget-elementskit-page-list.elementor-align-right .ekit-wid-con .ekit_page_list_content {
                -webkit-box-align: end;
                -ms-flex-align: end;
                align-items: flex-end
            }

            .ekit-wid-con .nav {
                margin: 0;
                padding: 0;
                list-style: none
            }

            .ekit-wid-con .ekit-review-card--date,.ekit-wid-con .ekit-review-card--desc {
                grid-area: date
            }

            .ekit-wid-con .ekit-review-card--image {
                width: 60px;
                height: 60px;
                grid-area: thumbnail;
                min-width: 60px;
                border-radius: 50%;
                background-color: #eae9f7;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                padding: 1rem;
                position: relative
            }

            .ekit-wid-con .ekit-review-card--thumbnail {
                grid-area: thumbnail;
                padding-right: 1rem
            }

            .ekit-wid-con .ekit-review-card--name {
                grid-area: name;
                font-size: 14px;
                font-weight: 700;
                margin: 0 0 .25rem
            }

            .ekit-wid-con .ekit-review-card--stars {
                grid-area: stars;
                color: #f4be28;
                font-size: 13px;
                line-height: 20px
            }

            .ekit-wid-con .ekit-review-card--comment {
                grid-area: comment;
                font-size: 16px;
                line-height: 22px;
                font-weight: 400;
                color: #32323d
            }

            .ekit-wid-con .ekit-review-card--actions {
                grid-area: actions
            }

            .ekit-wid-con .ekit-review-card--posted-on {
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                grid-area: posted-on
            }

            .ekit-wid-con img:not([draggable]) {
                max-width: 100%;
                height: auto
            }

            .ekit-wid-con a,.ekit-wid-con button {
                text-decoration: none;
                outline: 0
            }

            .ekit-wid-con a:visited {
                text-decoration: none;
                outline: 0
            }

            .ekit-wid-con img {
                border: none;
                max-width: 100%
            }

            .ekit-wid-con li,.ekit-wid-con ul {
                margin: 0;
                padding: 0
            }

            .ekit-wid-con p {
                margin-bottom: 10px
            }

            .ekit-wid-con .elementskit-navbar-nav-default.elementskit-menu-container {
                z-index: 1000
            }

            .ekit-wid-con .elementor-icon-list-item .elementor-icon-list-text {
                display: block;
                margin-bottom: 0
            }

            @media (min-width: 1025px) {
                .ekit-wid-con .elementskit-menu-po-center .elementskit-megamenu-has.top_position.elementskit-dropdown-menu-custom_width .elementskit-megamenu-panel {
                    -webkit-transform:translateY(-10px) translateX(-50%);
                    transform: translateY(-10px) translateX(-50%);
                    left: 50%
                }
            }

            @media (max-width: 1024px) {
                .ekit-wid-con .ekit-vertical-navbar-nav .elementskit-submenu-indicator {
                    padding:3px 10px;
                    border: 1px solid;
                    border-radius: 30px
                }
            }

            @-webkit-keyframes fadeIn {
                from {
                    opacity: 0
                }

                to {
                    opacity: 1
                }
            }

            @keyframes fadeIn {
                from {
                    opacity: 0
                }

                to {
                    opacity: 1
                }
            }

            .ekit-wid-con .ekit-heading {
                position: relative
            }

            .ekit-wid-con .elementskit-section-title {
                margin: 0;
                margin-bottom: 20px
            }

            .ekit-wid-con .elementskit-section-subtitle {
                font-weight: 700;
                color: rgba(0,0,0,.5)
            }

            .ekit-wid-con .elementskit-section-subtitle.elementskit-style-border {
                display: inline-block;
                position: relative;
                vertical-align: middle
            }

            .ekit-wid-con .elementskit-section-subtitle.elementskit-style-border::after,.ekit-wid-con .elementskit-section-subtitle.elementskit-style-border::before {
                content: "";
                width: 40px;
                height: 3px;
                background-color: #d7d7d7;
                display: inline-block;
                vertical-align: middle
            }

            .ekit-wid-con .elementskit-section-subtitle.elementskit-style-border::before {
                margin-right: 15px
            }

            .ekit-wid-con .elementskit-section-subtitle.elementskit-style-border::after {
                margin-left: 15px
            }

            .ekit-wid-con .elementskit-section-title {
                font-weight: 500
            }

            .ekit-wid-con .elementskit-section-title-wraper.text_left {
                text-align: left
            }

            .ekit-heading--subtitle {
                margin-top: 8px;
                margin-bottom: 16px
            }

            .elementor-2234 .elementor-element.elementor-element-f09ae29>.elementor-container>.elementor-column>.elementor-widget-wrap {
                align-content: center;
                align-items: center
            }

            .elementor-2234 .elementor-element.elementor-element-f09ae29:not(.elementor-motion-effects-element-type-background) {
                background-color: #f5f5f5
            }

            .elementor-2234 .elementor-element.elementor-element-f09ae29 {
                margin-top: 0;
                margin-bottom: 10px;
                padding: 0 60px
            }

            .elementor-2234 .elementor-element.elementor-element-92d8f8e .elementor-icon-list-icon i {
                color: #222
            }

            .elementor-2234 .elementor-element.elementor-element-92d8f8e {
                --e-icon-list-icon-size:15.6px;width: auto;
                max-width: auto
            }

            .elementor-2234 .elementor-element.elementor-element-92d8f8e .elementor-icon-list-text {
                color: #222;
                padding-left: 12px
            }

            .elementor-2234 .elementor-element.elementor-element-92d8f8e .elementor-icon-list-item>.elementor-icon-list-text {
                font-family: rubik,Sans-serif;
                font-size: 13px;
                font-weight: 400;
                line-height: 1em
            }

            .elementor-2234 .elementor-element.elementor-element-92d8f8e>.elementor-widget-container {
                margin: 0 14px 0 0;
                padding: 0 20px 0 0;
                border-style: solid;
                border-width: 0 1px 0 0;
                border-color: #d7d7d7
            }

            .elementor-2234 .elementor-element.elementor-element-abbd5b0 .elementor-icon-list-icon i {
                color: #222
            }

            .elementor-2234 .elementor-element.elementor-element-abbd5b0 {
                --e-icon-list-icon-size:15.6px;width: auto;
                max-width: auto
            }

            .elementor-2234 .elementor-element.elementor-element-abbd5b0 .elementor-icon-list-text {
                color: #222;
                padding-left: 12px
            }

            .elementor-2234 .elementor-element.elementor-element-abbd5b0 .elementor-icon-list-item>.elementor-icon-list-text {
                font-family: rubik,Sans-serif;
                font-size: 13px;
                font-weight: 400;
                line-height: 1em
            }

            .elementor-2234 .elementor-element.elementor-element-abbd5b0>.elementor-widget-container {
                margin: 0 40px 0 0;
                padding: 0 20px 0 0;
                border-style: solid;
                border-width: 0 1px 0 0;
                border-color: #d7d7d7
            }

            .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item {
                margin-right: calc(0px/2);
                margin-left: calc(0px/2)
            }

            .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-items.elementor-inline-items {
                margin-right: calc(-0px/2);
                margin-left: calc(-0px/2)
            }

            body:not(.rtl) .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:after {
                right: calc(-0px/2)
            }

            .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-icon i {
                color: #222
            }

            .elementor-2234 .elementor-element.elementor-element-5c2c6b9 {
                --e-icon-list-icon-size:13px;--e-icon-list-icon-align:right;--e-icon-list-icon-margin:0 0 0 calc(var(--e-icon-list-icon-size, 1em) * 0.25);width: auto;
                max-width: auto
            }

            .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-text {
                color: #222;
                padding-left: 15px
            }

            .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-item>.elementor-icon-list-text {
                font-family: rubik,Sans-serif;
                font-size: 13px;
                font-weight: 400;
                line-height: 1em
            }

            .elementor-2234 .elementor-element.elementor-element-5c2c6b9>.elementor-widget-container {
                padding: 0;
                border-style: solid;
                border-width: 0;
                border-color: #d7d7d7
            }

            .elementor-2234 .elementor-element.elementor-element-016abeb .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-2234 .elementor-element.elementor-element-016abeb .elementor-icon-list-text {
                color: #222
            }

            .elementor-2234 .elementor-element.elementor-element-016abeb .elementor-icon-list-item {
                font-family: rubik,Sans-serif;
                font-size: 13px;
                font-weight: 400;
                line-height: 1em
            }

            .elementor-2234 .elementor-element.elementor-element-9085b26>.elementor-container {
                min-height: 80px
            }

            .elementor-2234 .elementor-element.elementor-element-9085b26 {
                border-style: solid;
                border-width: 0;
                border-color: #f1f1f1;
                margin-top: 0;
                margin-bottom: 0;
                padding: 0 50px;
                z-index: 30
            }

            .elementor-2234 .elementor-element.elementor-element-1935717>.elementor-container>.elementor-column>.elementor-widget-wrap {
                align-content: center;
                align-items: center
            }

            .elementor-2234 .elementor-element.elementor-element-1935717 {
                margin-top: 0;
                margin-bottom: 0
            }

            .elementor-2234 .elementor-element.elementor-element-54570e8 {
                text-align: left
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-container {
                height: 60px;
                border-radius: 0 0 0 0
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-navbar-nav>li>a {
                font-family: rubik,Sans-serif;
                font-size: 14px;
                font-weight: 500;
                color: #464646;
                padding: 0 13px
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-navbar-nav .elementskit-submenu-panel>li>a {
                font-size: 14px;
                font-weight: 400;
                padding: 14px 15px;
                color: #464646;
                background-color: #fff;
                border-style: solid;
                border-width: 0 0 1px;
                border-color: #f1f1f1
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-navbar-nav .elementskit-submenu-panel>li:last-child>a {
                border-style: solid;
                border-width: 0;
                border-color: transparent
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-navbar-nav .elementskit-submenu-panel>li:first-child>a {
                border-style: solid;
                border-width: 0 0 1px;
                border-color: #f1f1f1
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-submenu-panel {
                padding: 15px 0
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-navbar-nav .elementskit-submenu-panel {
                border-style: solid;
                border-width: 1px;
                border-color: transparent;
                background-color: transparent;
                border-radius: 0 0 5px 5px;
                min-width: 180px;
                box-shadow: 15px 15px 30px 0 rgba(0,0,0,.16)
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-hamburger {
                float: right;
                border-style: solid;
                border-color: transparent
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-hamburger>.ekit-menu-icon {
                font-size: 24px;
                color: #222
            }

            .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-close {
                color: #333
            }

            .elementor-2234 .elementor-element.elementor-element-97ea551 .xs-wish-list-item {
                text-align: right;
                padding: 0
            }

            .elementor-2234 .elementor-element.elementor-element-97ea551 .xs-wish-list {
                margin: 0 24px 0 0
            }

            .elementor-2234 .elementor-element.elementor-element-97ea551 .xs-wish-list .xs-single-wishList {
                color: #222!important
            }

            .elementor-2234 .elementor-element.elementor-element-97ea551 .xs-miniCart-dropdown .xs-single-wishList {
                color: #222!important
            }

            .elementor-2234 .elementor-element.elementor-element-b6991a5 {
                margin-top: 0;
                margin-bottom: 20px;
                padding: 0 50px
            }

            .elementor-2234 .elementor-element.elementor-element-8324410 {
                margin-top: 0;
                margin-bottom: 0;
                padding: 0
            }

            .elementor-2234 .elementor-element.elementor-element-5dc90ef .ekit-vertical-menu-tigger {
                font-family: rubik,Sans-serif;
                font-size: 1.14286em;
                font-weight: 500;
                background-color: #fed700;
                padding: 21px 40px;
                border-radius: 5px 5px 5px 5px
            }

            .elementor-2234 .elementor-element.elementor-element-5dc90ef .ekit-vertical-navbar-nav>li>a {
                font-family: rubik,Sans-serif;
                font-size: 1.14286em;
                font-weight: 400;
                color: #222;
                padding: 12px 20px
            }

            .elementor-2234 .elementor-element.elementor-element-725fec0 .elementor-search-wrapper .elementor-search-button button {
                background-color: #fed700
            }

            .elementor-2234 .elementor-element.elementor-element-725fec0>.elementor-widget-container {
                padding: 0 10px
            }

            .elementor-2234 .elementor-element.elementor-element-fd5a24a .xs-ele-nav-button .btn:not([type=submit]) {
                padding: 8px 70px 7px
            }

            .elementor-2234 .elementor-element.elementor-element-fd5a24a .xs-navDown .btn:not([type=submit]) strong {
                font-family: rubik,Sans-serif;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: .2px
            }

            .elementor-2234 .elementor-element.elementor-element-fd5a24a .xs-navDown .btn:not([type=submit]) span {
                font-family: rubik,Sans-serif;
                font-size: 12px;
                font-weight: 500;
                letter-spacing: .2px
            }

            .elementor-2234 .elementor-element.elementor-element-fd5a24a>.elementor-widget-container {
                margin: 0 0 -10px
            }

            @media (max-width: 1024px) {
                .elementor-2234 .elementor-element.elementor-element-f09ae29 {
                    padding:0 10px
                }

                .elementor-2234 .elementor-element.elementor-element-5c2c6b9>.elementor-widget-container {
                    border-width: 0
                }

                .elementor-2234 .elementor-element.elementor-element-9085b26 {
                    border-width: 0;
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-8cab53a.elementor-column.elementor-element[data-element_type=column]>.elementor-widget-wrap.elementor-element-populated {
                    align-content: center;
                    align-items: center
                }

                .elementor-2234 .elementor-element.elementor-element-8cab53a>.elementor-element-populated {
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-nav-identity-panel {
                    padding: 10px 0
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-container {
                    max-width: 350px;
                    border-radius: 0 0 0 0
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-navbar-nav>li>a {
                    color: #000;
                    padding: 10px 15px
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-navbar-nav .elementskit-submenu-panel>li>a {
                    padding: 15px
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-navbar-nav .elementskit-submenu-panel {
                    border-radius: 0 0 0 0
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-hamburger {
                    padding: 0 8px 5px;
                    width: 45px;
                    border-radius: 3px
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-hamburger>.ekit-menu-icon {
                    font-size: 24px
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-close {
                    padding: 8px;
                    margin: 12px;
                    width: 45px;
                    border-radius: 3px
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-nav-logo>img {
                    max-width: 160px;
                    max-height: 60px
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-nav-logo {
                    margin: 5px 0;
                    padding: 5px
                }

                .elementor-2234 .elementor-element.elementor-element-97ea551 .xs-wish-list-item {
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-97ea551 .xs-wish-list {
                    margin: 0 5px 0 0
                }

                .elementor-2234 .elementor-element.elementor-element-b6991a5 {
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-5dc90ef .ekit-vertical-menu-tigger {
                    font-size: 12px;
                    padding: 21px 10px
                }

                .elementor-2234 .elementor-element.elementor-element-725fec0 .xs-navbar-search {
                    height: 53px
                }

                .elementor-2234 .elementor-element.elementor-element-725fec0>.elementor-widget-container {
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-fd5a24a .xs-ele-nav-button .btn:not([type=submit]) {
                    padding: 9px 0 8px
                }

                .elementor-2234 .elementor-element.elementor-element-fd5a24a .xs-navDown .btn:not([type=submit]) strong {
                    font-size: 10px
                }

                .elementor-2234 .elementor-element.elementor-element-fd5a24a .xs-navDown .btn:not([type=submit]) span {
                    font-size: 8px
                }
            }

            @media (max-width: 767px) {
                .elementor-2234 .elementor-element.elementor-element-f09ae29 {
                    padding:5px
                }

                .elementor-2234 .elementor-element.elementor-element-a72b422 {
                    width: 60%
                }

                .elementor-2234 .elementor-element.elementor-element-a72b422>.elementor-element-populated {
                    margin: -10px 0 0;
                    --e-column-margin-right:0px;--e-column-margin-left:0px}

                .elementor-2234 .elementor-element.elementor-element-92d8f8e>.elementor-widget-container {
                    margin: 0 0 5px;
                    border-width: 0
                }

                .elementor-2234 .elementor-element.elementor-element-abbd5b0>.elementor-widget-container {
                    margin: 0 0 5px;
                    border-width: 0
                }

                .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item {
                    margin-right: calc(10px/2);
                    margin-left: calc(10px/2)
                }

                .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-items.elementor-inline-items {
                    margin-right: calc(-10px/2);
                    margin-left: calc(-10px/2)
                }

                body:not(.rtl) .elementor-2234 .elementor-element.elementor-element-5c2c6b9 .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:after {
                    right: calc(-10px/2)
                }

                .elementor-2234 .elementor-element.elementor-element-5c2c6b9>.elementor-widget-container {
                    margin: 0;
                    padding: 0;
                    border-width: 0
                }

                .elementor-2234 .elementor-element.elementor-element-a225316 {
                    width: 40%
                }

                .elementor-2234 .elementor-element.elementor-element-a225316>.elementor-element-populated {
                    margin: -10px 0 0;
                    --e-column-margin-right:0px;--e-column-margin-left:0px}

                .elementor-2234 .elementor-element.elementor-element-9085b26 {
                    border-width: 0 0 1px;
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-088fd24 {
                    width: 34%
                }

                .elementor-2234 .elementor-element.elementor-element-8cab53a {
                    width: 32%
                }

                .elementor-2234 .elementor-element.elementor-element-8cab53a.elementor-column.elementor-element[data-element_type=column]>.elementor-widget-wrap.elementor-element-populated {
                    align-content: center;
                    align-items: center
                }

                .elementor-2234 .elementor-element.elementor-element-8cab53a>.elementor-element-populated {
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-hamburger>.ekit-menu-icon {
                    font-size: 24px
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-menu-hamburger {
                    border-width: 1px
                }

                .elementor-2234 .elementor-element.elementor-element-07b37b0 .elementskit-nav-logo>img {
                    max-width: 120px;
                    max-height: 50px
                }

                .elementor-2234 .elementor-element.elementor-element-bea39b2 {
                    width: 34%
                }

                .elementor-2234 .elementor-element.elementor-element-97ea551 .xs-wish-list-item {
                    text-align: right;
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-97ea551 .xs-wish-list {
                    margin: 0 10px 0 0
                }

                .elementor-2234 .elementor-element.elementor-element-b6991a5 {
                    padding: 0
                }

                .elementor-2234 .elementor-element.elementor-element-725fec0>.elementor-widget-container {
                    padding: 0
                }
            }

            @media (min-width: 768px) {
                .elementor-2234 .elementor-element.elementor-element-a72b422 {
                    width:85.067%
                }

                .elementor-2234 .elementor-element.elementor-element-a225316 {
                    width: 14.651%
                }

                .elementor-2234 .elementor-element.elementor-element-088fd24 {
                    width: 14.934%
                }

                .elementor-2234 .elementor-element.elementor-element-8cab53a {
                    width: 73.01%
                }

                .elementor-2234 .elementor-element.elementor-element-bea39b2 {
                    width: 11.732%
                }

                .elementor-2234 .elementor-element.elementor-element-a48d572 {
                    width: 24.211%
                }

                .elementor-2234 .elementor-element.elementor-element-2816d5a {
                    width: 50.965%
                }

                .elementor-2234 .elementor-element.elementor-element-d9f1f10 {
                    width: 24.5%
                }
            }

            @media (max-width: 1024px) and (min-width:768px) {
                .elementor-2234 .elementor-element.elementor-element-a72b422 {
                    width:80%
                }

                .elementor-2234 .elementor-element.elementor-element-a225316 {
                    width: 20%
                }

                .elementor-2234 .elementor-element.elementor-element-088fd24 {
                    width: 30%
                }

                .elementor-2234 .elementor-element.elementor-element-8cab53a {
                    width: 50%
                }

                .elementor-2234 .elementor-element.elementor-element-bea39b2 {
                    width: 20%
                }

                .elementor-2234 .elementor-element.elementor-element-a48d572 {
                    width: 25%
                }

                .elementor-2234 .elementor-element.elementor-element-2816d5a {
                    width: 50%
                }

                .elementor-2234 .elementor-element.elementor-element-d9f1f10 {
                    width: 25%
                }
            }

            .elementor-3640 .elementor-element.elementor-element-c9c41:not(.elementor-motion-effects-element-type-background) {
                background-color: #fff
            }

            .elementor-3640 .elementor-element.elementor-element-c9c41 {
                border-style: solid;
                border-width: 0 1px 1px;
                border-color: #f0f0f0;
                box-shadow: 15px 15px 30px 0 rgba(0,0,0,.16);
                margin-top: 0;
                margin-bottom: 10px
            }

            .elementor-3640 .elementor-element.elementor-element-c9c41 {
                border-radius: 0 0 5px 5px
            }

            .elementor-3640 .elementor-element.elementor-element-5617289 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-5617289>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-52611f7 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-52611f7>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-1d8ef2b8 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-1d8ef2b8>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-2897f507 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-2897f507>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-1e92c27d .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-1e92c27d>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-734f2af9 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-734f2af9>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-3ec0f07b .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-3ec0f07b>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-160864d7 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-160864d7>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-11fdcf7c .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-11fdcf7c>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-79f6761c .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-79f6761c>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-6ba7cd68 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-6ba7cd68>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-3d7eedd0 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-3d7eedd0>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-2e54881 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-2e54881>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-3a01f7ef .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-3a01f7ef>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-5d703874 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-5d703874>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-32bff9d .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-32bff9d>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-7e01baf5 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-7e01baf5>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-5f333f93 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-5f333f93>.elementor-widget-container {
                padding: 0
            }

            .elementor-3640 .elementor-element.elementor-element-45cafc93 .widget-image-caption {
                color: #222;
                font-size: 15px;
                font-weight: 500;
                font-style: normal
            }

            .elementor-3640 .elementor-element.elementor-element-45cafc93>.elementor-widget-container {
                padding: 0
            }

            .elementor-3672 .elementor-element.elementor-element-e54c871>.elementor-container {
                max-width: 1140px
            }

            .elementor-3672 .elementor-element.elementor-element-e54c871:not(.elementor-motion-effects-element-type-background) {
                background-color: #1e212a;
                background-image: url(https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/menu-bg-wave.png);
                background-position: bottom right;
                background-repeat: no-repeat
            }

            .elementor-3672 .elementor-element.elementor-element-e54c871 {
                border-style: solid;
                border-width: 0;
                padding: 40px
            }

            .elementor-3672 .elementor-element.elementor-element-5d163f1d .xs-heading-sub {
                text-align: left;
                color: #fff;
                font-size: 1.28571em;
                margin-bottom: 8px
            }

            .elementor-3672 .elementor-element.elementor-element-5d163f1d p.lead {
                text-align: left;
                color: #999;
                margin-bottom: 0
            }

            .elementor-3672 .elementor-element.elementor-element-5d163f1d p.lead {
                font-size: .85714em
            }

            .elementor-3672 .elementor-element.elementor-element-19c8d3>.elementor-widget-container {
                background-color: transparent
            }

            .elementor-3672 .elementor-element.elementor-element-7a27e73f .xs-heading-sub {
                text-align: left;
                color: #fff;
                font-size: 1.28571em;
                margin-bottom: 8px
            }

            .elementor-3672 .elementor-element.elementor-element-7a27e73f p.lead {
                text-align: left;
                color: #999;
                margin-bottom: 0
            }

            .elementor-3672 .elementor-element.elementor-element-7a27e73f p.lead {
                font-size: .85714em
            }

            .elementor-3672 .elementor-element.elementor-element-674319f6>.elementor-widget-container {
                background-color: transparent
            }

            .elementor-3672 .elementor-element.elementor-element-1d4899b6 .xs-heading-sub {
                text-align: left;
                color: #fff;
                font-size: 1.28571em;
                margin-bottom: 8px
            }

            .elementor-3672 .elementor-element.elementor-element-1d4899b6 p.lead {
                text-align: left;
                color: #999;
                margin-bottom: 0
            }

            .elementor-3672 .elementor-element.elementor-element-1d4899b6 p.lead {
                font-size: .85714em
            }

            .elementor-3672 .elementor-element.elementor-element-53b82d65>.elementor-widget-container {
                background-color: transparent
            }

            .elementor-3672 .elementor-element.elementor-element-52406f2b .xs-heading-sub {
                text-align: left;
                color: #fff;
                font-size: 1.28571em;
                margin-bottom: 8px
            }

            .elementor-3672 .elementor-element.elementor-element-52406f2b p.lead {
                text-align: left;
                color: #999;
                margin-bottom: 0
            }

            .elementor-3672 .elementor-element.elementor-element-52406f2b p.lead {
                font-size: .85714em
            }

            @media (max-width: 1024px) and (min-width:768px) {
                .elementor-3672 .elementor-element.elementor-element-18493375 {
                    width:100%
                }

                .elementor-3672 .elementor-element.elementor-element-797836c0 {
                    width: 100%
                }

                .elementor-3672 .elementor-element.elementor-element-3b07acfb {
                    width: 100%
                }

                .elementor-3672 .elementor-element.elementor-element-1febf676 {
                    width: 100%
                }
            }

            .elementor-3685 .elementor-element.elementor-element-5201d5fb:not(.elementor-motion-effects-element-type-background) {
                background-color: #fff
            }

            .elementor-3685 .elementor-element.elementor-element-235edf66>.elementor-widget-wrap>.elementor-widget:not(.elementor-widget__width-auto):not(.elementor-widget__width-initial):not(:last-child):not(.elementor-absolute) {
                margin-bottom: -40px
            }

            .elementor-3685 .elementor-element.elementor-element-6977554a .block-product-cate-wraper {
                text-align: left
            }

            .elementor-3685 .elementor-element.elementor-element-6977554a h3.block-cate-header {
                color: #222;
                font-size: 1.14286em;
                font-weight: 500;
                margin-bottom: 10px;
                border-color: #ebebeb
            }

            .elementor-3685 .elementor-element.elementor-element-6977554a .block-product-cate-wraper .nav .nav-link {
                color: #222;
                font-size: .92857em;
                font-weight: 400;
                padding-top: 3px;
                padding-bottom: 3px
            }

            .elementor-3685 .elementor-element.elementor-element-6977554a>.elementor-widget-container {
                margin: 0 0 35px
            }

            .elementor-3685 .elementor-element.elementor-element-572ae0d8 .block-product-cate-wraper {
                text-align: left
            }

            .elementor-3685 .elementor-element.elementor-element-572ae0d8 h3.block-cate-header {
                color: #222;
                font-size: 1.14286em;
                font-weight: 500;
                margin-bottom: 10px;
                padding-bottom: 0;
                border-color: #ebebeb
            }

            .elementor-3685 .elementor-element.elementor-element-572ae0d8 .block-product-cate-wraper .nav .nav-link {
                color: #222;
                font-size: .92857em;
                font-weight: 400;
                padding-top: 3px;
                padding-bottom: 3px
            }

            .elementor-3685 .elementor-element.elementor-element-b9924c4>.elementor-widget-wrap>.elementor-widget:not(.elementor-widget__width-auto):not(.elementor-widget__width-initial):not(:last-child):not(.elementor-absolute) {
                margin-bottom: -40px
            }

            .elementor-3685 .elementor-element.elementor-element-3c8fc817 .block-product-cate-wraper {
                text-align: left
            }

            .elementor-3685 .elementor-element.elementor-element-3c8fc817 h3.block-cate-header {
                color: #222;
                font-size: 1.14286em;
                font-weight: 500;
                margin-bottom: 10px;
                padding-bottom: 0;
                border-color: #ebebeb
            }

            .elementor-3685 .elementor-element.elementor-element-3c8fc817 .block-product-cate-wraper .nav .nav-link {
                color: #222;
                font-size: .92857em;
                font-weight: 400;
                padding-top: 3px;
                padding-bottom: 3px
            }

            .elementor-3685 .elementor-element.elementor-element-3c8fc817>.elementor-widget-container {
                margin: 0 0 35px
            }

            .elementor-3685 .elementor-element.elementor-element-628504dc .block-product-cate-wraper {
                text-align: left
            }

            .elementor-3685 .elementor-element.elementor-element-628504dc h3.block-cate-header {
                color: #222;
                font-size: 1.14286em;
                font-weight: 500;
                margin-bottom: 10px;
                padding-bottom: 0;
                border-color: #ebebeb
            }

            .elementor-3685 .elementor-element.elementor-element-628504dc .block-product-cate-wraper .nav .nav-link {
                color: #222;
                font-size: .92857em;
                font-weight: 400;
                padding-top: 3px;
                padding-bottom: 3px
            }

            .elementor-3685 .elementor-element.elementor-element-3cae6ecf>.elementor-widget-wrap>.elementor-widget:not(.elementor-widget__width-auto):not(.elementor-widget__width-initial):not(:last-child):not(.elementor-absolute) {
                margin-bottom: -40px
            }

            .elementor-3685 .elementor-element.elementor-element-52e7cacd .block-product-cate-wraper {
                text-align: left
            }

            .elementor-3685 .elementor-element.elementor-element-52e7cacd h3.block-cate-header {
                color: #222;
                font-size: 1.14286em;
                font-weight: 500;
                margin-bottom: 10px;
                padding-bottom: 0;
                border-color: #ebebeb
            }

            .elementor-3685 .elementor-element.elementor-element-52e7cacd .block-product-cate-wraper .nav .nav-link {
                color: #222;
                font-size: .92857em;
                font-weight: 400;
                padding-top: 3px;
                padding-bottom: 3px
            }

            .elementor-3685 .elementor-element.elementor-element-52e7cacd>.elementor-widget-container {
                margin: 0 0 35px
            }

            .elementor-3685 .elementor-element.elementor-element-363f710f .block-product-cate-wraper {
                text-align: left
            }

            .elementor-3685 .elementor-element.elementor-element-363f710f h3.block-cate-header {
                color: #222;
                font-size: 1.14286em;
                font-weight: 500;
                margin-bottom: 10px;
                padding-bottom: 0;
                border-color: #ebebeb
            }

            .elementor-3685 .elementor-element.elementor-element-363f710f .block-product-cate-wraper .nav .nav-link {
                color: #222;
                font-size: .92857em;
                font-weight: 400;
                padding-top: 3px;
                padding-bottom: 3px
            }

            @media (max-width: 1024px) and (min-width:768px) {
                .elementor-3685 .elementor-element.elementor-element-235edf66 {
                    width:100%
                }

                .elementor-3685 .elementor-element.elementor-element-b9924c4 {
                    width: 100%
                }

                .elementor-3685 .elementor-element.elementor-element-3cae6ecf {
                    width: 100%
                }
            }

            .elementor-3690 .elementor-element.elementor-element-54002cb2 {
                overflow: hidden;
                box-shadow: 0 10px 25px 0 rgba(0,0,0,.1)
            }

            .elementor-3690 .elementor-element.elementor-element-54002cb2:not(.elementor-motion-effects-element-type-background) {
                background-color: #fff
            }

            .elementor-3690 .elementor-element.elementor-element-4268f217 {
                margin-top: 5px;
                margin-bottom: 15px
            }

            .elementor-3690 .elementor-element.elementor-element-5d1e583e>.elementor-element-populated {
                padding: 35px 0 30px 30px
            }

            .elementor-3690 .elementor-element.elementor-element-11618089 .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3690 .elementor-element.elementor-element-11618089 .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3690 .elementor-element.elementor-element-11618089 .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3690 .elementor-element.elementor-element-11618089 .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3690 .elementor-element.elementor-element-11618089 .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3690 .elementor-element.elementor-element-254f7ee7 .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3690 .elementor-element.elementor-element-254f7ee7 .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3690 .elementor-element.elementor-element-254f7ee7 .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3690 .elementor-element.elementor-element-7686a311 .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3690 .elementor-element.elementor-element-7686a311 .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3690 .elementor-element.elementor-element-7686a311 .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3690 .elementor-element.elementor-element-7686a311 .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3690 .elementor-element.elementor-element-7686a311 .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3690 .elementor-element.elementor-element-54ad3c17 .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3690 .elementor-element.elementor-element-54ad3c17 .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3690 .elementor-element.elementor-element-54ad3c17 .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3690 .elementor-element.elementor-element-2216bfef>.elementor-element-populated {
                padding: 35px 0 30px 30px
            }

            .elementor-3690 .elementor-element.elementor-element-3445e427 .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3690 .elementor-element.elementor-element-3445e427 .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3690 .elementor-element.elementor-element-3445e427 .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3690 .elementor-element.elementor-element-3445e427 .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3690 .elementor-element.elementor-element-3445e427 .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3690 .elementor-element.elementor-element-893169 .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3690 .elementor-element.elementor-element-893169 .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3690 .elementor-element.elementor-element-893169 .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3690 .elementor-element.elementor-element-5977eb9d .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3690 .elementor-element.elementor-element-5977eb9d .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3690 .elementor-element.elementor-element-5977eb9d .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3690 .elementor-element.elementor-element-5977eb9d .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3690 .elementor-element.elementor-element-5977eb9d .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3690 .elementor-element.elementor-element-c01b4c2 .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3690 .elementor-element.elementor-element-c01b4c2 .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3690 .elementor-element.elementor-element-c01b4c2 .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3690 .elementor-element.elementor-element-671577f1>.elementor-element-populated {
                padding: 35px 0 30px 30px
            }

            .elementor-3690 .elementor-element.elementor-element-671577f1 {
                z-index: 2
            }

            .elementor-3690 .elementor-element.elementor-element-d892ca1 .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3690 .elementor-element.elementor-element-d892ca1 .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3690 .elementor-element.elementor-element-d892ca1 .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3690 .elementor-element.elementor-element-d892ca1 .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3690 .elementor-element.elementor-element-d892ca1 .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3690 .elementor-element.elementor-element-99945d2 .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3690 .elementor-element.elementor-element-99945d2 .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3690 .elementor-element.elementor-element-99945d2 .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3690 .elementor-element.elementor-element-2dce9452>.elementor-element-populated {
                padding: 35px 0 30px 30px
            }

            .elementor-3690 .elementor-element.elementor-element-2dce9452 {
                z-index: 2
            }

            .elementor-3690 .elementor-element.elementor-element-436c57ad .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3690 .elementor-element.elementor-element-436c57ad .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3690 .elementor-element.elementor-element-436c57ad .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3690 .elementor-element.elementor-element-436c57ad .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3690 .elementor-element.elementor-element-436c57ad .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3690 .elementor-element.elementor-element-7aad8600 .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3690 .elementor-element.elementor-element-7aad8600 .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3690 .elementor-element.elementor-element-7aad8600 .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3690 .elementor-element.elementor-element-7aad8600>.elementor-widget-container {
                margin: 0
            }

            .elementor-3690 .elementor-element.elementor-element-3ecb6bfd {
                width: auto;
                max-width: auto;
                bottom: -106px
            }

            body:not(.rtl) .elementor-3690 .elementor-element.elementor-element-3ecb6bfd {
                right: -89px
            }

            @media (max-width: 1024px) {
                body:not(.rtl) .elementor-3690 .elementor-element.elementor-element-3ecb6bfd {
                    right:-99.5px
                }

                .elementor-3690 .elementor-element.elementor-element-3ecb6bfd {
                    bottom: -122px
                }
            }

            @media (max-width: 1024px) and (min-width:768px) {
                .elementor-3690 .elementor-element.elementor-element-5d1e583e {
                    width:100%
                }

                .elementor-3690 .elementor-element.elementor-element-2216bfef {
                    width: 100%
                }

                .elementor-3690 .elementor-element.elementor-element-671577f1 {
                    width: 100%
                }

                .elementor-3690 .elementor-element.elementor-element-2dce9452 {
                    width: 100%
                }
            }

            .elementor-3697 .elementor-element.elementor-element-b76f6e8:not(.elementor-motion-effects-element-type-background) {
                background-color: #fff
            }

            .elementor-3697 .elementor-element.elementor-element-b76f6e8 {
                box-shadow: 0 10px 25px 0 rgba(0,0,0,.1)
            }

            .elementor-3697 .elementor-element.elementor-element-194f1349 {
                margin-top: 0;
                margin-bottom: 0
            }

            .elementor-3697 .elementor-element.elementor-element-246df8c9>.elementor-element-populated {
                border-style: solid;
                border-width: 0 1px 0 0;
                border-color: #ededed;
                padding: 30px 0 30px 30px
            }

            .elementor-3697 .elementor-element.elementor-element-4bea6322>.elementor-widget-container {
                margin: 0 0 3px
            }

            .elementor-3697 .elementor-element.elementor-element-24c40deb .elementskit-section-title-wraper .elementskit-section-title {
                color: #101010;
                margin: 0;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase
            }

            .elementor-3697 .elementor-element.elementor-element-155d3afd .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3697 .elementor-element.elementor-element-155d3afd .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3697 .elementor-element.elementor-element-155d3afd .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3697 .elementor-element.elementor-element-167545f4>.elementor-element-populated {
                border-style: solid;
                border-width: 0 1px 0 0;
                border-color: #ededed;
                padding: 30px 0 30px 30px
            }

            .elementor-3697 .elementor-element.elementor-element-1c6c4404>.elementor-widget-container {
                margin: 0 0 3px
            }

            .elementor-3697 .elementor-element.elementor-element-5a2a4520 .elementskit-section-title-wraper .elementskit-section-title {
                color: #101010;
                margin: 0;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase
            }

            .elementor-3697 .elementor-element.elementor-element-1490c32f .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3697 .elementor-element.elementor-element-1490c32f .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3697 .elementor-element.elementor-element-1490c32f .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3697 .elementor-element.elementor-element-1acf0bcb>.elementor-element-populated {
                border-style: solid;
                border-width: 0 1px 0 0;
                border-color: #ededed;
                padding: 30px 0 30px 30px
            }

            .elementor-3697 .elementor-element.elementor-element-68408a68>.elementor-widget-container {
                margin: 0 0 3px
            }

            .elementor-3697 .elementor-element.elementor-element-1f313d70 .elementskit-section-title-wraper .elementskit-section-title {
                color: #101010;
                margin: 0;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase
            }

            .elementor-3697 .elementor-element.elementor-element-5cb4ce66 .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3697 .elementor-element.elementor-element-5cb4ce66 .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3697 .elementor-element.elementor-element-5cb4ce66 .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3697 .elementor-element.elementor-element-7b03bd78>.elementor-element-populated {
                padding: 30px 0 30px 30px
            }

            .elementor-3697 .elementor-element.elementor-element-53228ead>.elementor-widget-container {
                margin: 0 0 3px
            }

            .elementor-3697 .elementor-element.elementor-element-566a4a7f .elementskit-section-title-wraper .elementskit-section-title {
                color: #101010;
                margin: 0;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase
            }

            .elementor-3697 .elementor-element.elementor-element-12a2bace .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3697 .elementor-element.elementor-element-12a2bace .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3697 .elementor-element.elementor-element-12a2bace .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            @media (max-width: 1024px) and (min-width:768px) {
                .elementor-3697 .elementor-element.elementor-element-246df8c9 {
                    width:100%
                }

                .elementor-3697 .elementor-element.elementor-element-167545f4 {
                    width: 100%
                }

                .elementor-3697 .elementor-element.elementor-element-1acf0bcb {
                    width: 100%
                }

                .elementor-3697 .elementor-element.elementor-element-7b03bd78 {
                    width: 100%
                }
            }

            .elementor-3706 .elementor-element.elementor-element-7fb45ac7:not(.elementor-motion-effects-element-type-background) {
                background-color: #fff
            }

            .elementor-3706 .elementor-element.elementor-element-7fb45ac7 {
                box-shadow: 0 10px 25px 0 rgba(0,0,0,.1)
            }

            .elementor-3706 .elementor-element.elementor-element-7490f7a6 {
                margin-top: 0;
                margin-bottom: 0
            }

            .elementor-3706 .elementor-element.elementor-element-3429abc7>.elementor-element-populated {
                padding: 35px 0 30px 30px
            }

            .elementor-3706 .elementor-element.elementor-element-487980d5 .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3706 .elementor-element.elementor-element-487980d5 .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3706 .elementor-element.elementor-element-487980d5 .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3706 .elementor-element.elementor-element-487980d5 .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3706 .elementor-element.elementor-element-487980d5 .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3706 .elementor-element.elementor-element-fee8d8a .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3706 .elementor-element.elementor-element-fee8d8a .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3706 .elementor-element.elementor-element-fee8d8a .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3706 .elementor-element.elementor-element-d7b129e .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3706 .elementor-element.elementor-element-d7b129e .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3706 .elementor-element.elementor-element-d7b129e .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3706 .elementor-element.elementor-element-d7b129e .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3706 .elementor-element.elementor-element-d7b129e .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3706 .elementor-element.elementor-element-4d6b6499 .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3706 .elementor-element.elementor-element-4d6b6499 .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3706 .elementor-element.elementor-element-4d6b6499 .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3706 .elementor-element.elementor-element-3f666da>.elementor-element-populated {
                padding: 35px 0 30px 30px
            }

            .elementor-3706 .elementor-element.elementor-element-247e7426 .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3706 .elementor-element.elementor-element-247e7426 .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3706 .elementor-element.elementor-element-247e7426 .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3706 .elementor-element.elementor-element-247e7426 .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3706 .elementor-element.elementor-element-247e7426 .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3706 .elementor-element.elementor-element-3d5a93bd .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3706 .elementor-element.elementor-element-3d5a93bd .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3706 .elementor-element.elementor-element-3d5a93bd .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3706 .elementor-element.elementor-element-7d1fdcb2 .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3706 .elementor-element.elementor-element-7d1fdcb2 .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3706 .elementor-element.elementor-element-7d1fdcb2 .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3706 .elementor-element.elementor-element-7d1fdcb2 .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3706 .elementor-element.elementor-element-7d1fdcb2 .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3706 .elementor-element.elementor-element-10c9405d .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3706 .elementor-element.elementor-element-10c9405d .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3706 .elementor-element.elementor-element-10c9405d .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3706 .elementor-element.elementor-element-6c4dcc6f>.elementor-element-populated {
                padding: 35px 0 30px 30px
            }

            .elementor-3706 .elementor-element.elementor-element-6c4dcc6f {
                z-index: 2
            }

            .elementor-3706 .elementor-element.elementor-element-7dcbe5f3 .elementskit-section-title-wraper .elementskit-section-subtitle {
                color: #101010;
                font-family: roboto,Sans-serif;
                font-size: 16px;
                font-weight: 500;
                text-transform: uppercase;
                line-height: 1em;
                margin: 0
            }

            .elementor-3706 .elementor-element.elementor-element-7dcbe5f3 .elementskit-section-subtitle.elementskit-style-border::before {
                background-color: #ffb25d;
                width: 6px;
                margin: 0 5px 0 0
            }

            .elementor-3706 .elementor-element.elementor-element-7dcbe5f3 .elementskit-section-subtitle.elementskit-style-border::after {
                width: 0
            }

            .elementor-3706 .elementor-element.elementor-element-7dcbe5f3 .elementskit-section-subtitle.elementskit-style-border::before,.elementor-3706 .elementor-element.elementor-element-7dcbe5f3 .elementskit-section-subtitle.elementskit-style-border::after {
                height: 6px;
                transform: translateY(-2px);
                -webkit-transform: translateY(-2px);
                -ms-transform: translateY(-2px)
            }

            .elementor-3706 .elementor-element.elementor-element-607f56eb .ekit_page_list_content {
                flex-direction: row
            }

            .elementor-3706 .elementor-element.elementor-element-607f56eb .elementor-icon-list-text {
                color: #777;
                margin: 0 0 15px
            }

            .elementor-3706 .elementor-element.elementor-element-607f56eb .elementor-icon-list-item {
                font-size: 13px;
                line-height: 1em
            }

            .elementor-3706 .elementor-element.elementor-element-7b548343 {
                width: auto;
                max-width: auto;
                bottom: 0
            }

            body:not(.rtl) .elementor-3706 .elementor-element.elementor-element-7b548343 {
                right: -40px
            }

            @media (max-width: 1024px) {
                body:not(.rtl) .elementor-3706 .elementor-element.elementor-element-7b548343 {
                    right:-32.5px
                }

                .elementor-3706 .elementor-element.elementor-element-7b548343 {
                    bottom: 1px
                }
            }

            @media (max-width: 1024px) and (min-width:768px) {
                .elementor-3706 .elementor-element.elementor-element-3429abc7 {
                    width:100%
                }

                .elementor-3706 .elementor-element.elementor-element-3f666da {
                    width: 100%
                }

                .elementor-3706 .elementor-element.elementor-element-6c4dcc6f {
                    width: 100%
                }
            }

            .elementor-2235 .elementor-element.elementor-element-91c9ed4 {
                border-style: solid;
                border-width: 1px 0 0;
                border-color: #f1f1f1
            }

            .elementor-2235 .elementor-element.elementor-element-5c0e557 {
                margin-top: 0;
                margin-bottom: 0
            }

            .elementor-2235 .elementor-element.elementor-element-9740208.elementor-view-default .elementor-icon {
                fill: #222;
                color: #222;
                border-color: #222
            }

            .elementor-2235 .elementor-element.elementor-element-9740208.elementor-position-top .elementor-icon-box-icon {
                margin-bottom: 0
            }

            .elementor-2235 .elementor-element.elementor-element-9740208 .elementor-icon {
                font-size: 30px
            }

            .elementor-2235 .elementor-element.elementor-element-9740208 .elementor-icon-box-wrapper {
                text-align: center
            }

            .elementor-2235 .elementor-element.elementor-element-9740208 .elementor-icon-box-title {
                margin-bottom: 0;
                color: #222
            }

            .elementor-2235 .elementor-element.elementor-element-9740208 .elementor-icon-box-title,.elementor-2235 .elementor-element.elementor-element-9740208 .elementor-icon-box-title a {
                font-size: 14px;
                font-weight: 400
            }

            .elementor-2235 .elementor-element.elementor-element-9693105.elementor-view-default .elementor-icon {
                fill: #222;
                color: #222;
                border-color: #222
            }

            .elementor-2235 .elementor-element.elementor-element-9693105.elementor-position-top .elementor-icon-box-icon {
                margin-bottom: 0
            }

            .elementor-2235 .elementor-element.elementor-element-9693105 .elementor-icon {
                font-size: 30px
            }

            .elementor-2235 .elementor-element.elementor-element-9693105 .elementor-icon i {
                transform: rotate(0deg)
            }

            .elementor-2235 .elementor-element.elementor-element-9693105 .elementor-icon-box-wrapper {
                text-align: center
            }

            .elementor-2235 .elementor-element.elementor-element-9693105 .elementor-icon-box-title {
                margin-bottom: 0;
                color: #222
            }

            .elementor-2235 .elementor-element.elementor-element-9693105 .elementor-icon-box-title,.elementor-2235 .elementor-element.elementor-element-9693105 .elementor-icon-box-title a {
                font-size: 14px;
                font-weight: 400
            }

            .elementor-2235 .elementor-element.elementor-element-887d1bc.elementor-view-default .elementor-icon {
                fill: #222;
                color: #222;
                border-color: #222
            }

            .elementor-2235 .elementor-element.elementor-element-887d1bc.elementor-position-top .elementor-icon-box-icon {
                margin-bottom: 0
            }

            .elementor-2235 .elementor-element.elementor-element-887d1bc .elementor-icon {
                font-size: 30px
            }

            .elementor-2235 .elementor-element.elementor-element-887d1bc .elementor-icon i {
                transform: rotate(0deg)
            }

            .elementor-2235 .elementor-element.elementor-element-887d1bc .elementor-icon-box-wrapper {
                text-align: center
            }

            .elementor-2235 .elementor-element.elementor-element-887d1bc .elementor-icon-box-title {
                margin-bottom: 0;
                color: #222
            }

            .elementor-2235 .elementor-element.elementor-element-887d1bc .elementor-icon-box-title,.elementor-2235 .elementor-element.elementor-element-887d1bc .elementor-icon-box-title a {
                font-size: 14px;
                font-weight: 400
            }

            .elementor-2235 .elementor-element.elementor-element-64bb8b2.elementor-view-default .elementor-icon {
                fill: #222;
                color: #222;
                border-color: #222
            }

            .elementor-2235 .elementor-element.elementor-element-64bb8b2.elementor-position-top .elementor-icon-box-icon {
                margin-bottom: 0
            }

            .elementor-2235 .elementor-element.elementor-element-64bb8b2 .elementor-icon {
                font-size: 30px
            }

            .elementor-2235 .elementor-element.elementor-element-64bb8b2 .elementor-icon i {
                transform: rotate(0deg)
            }

            .elementor-2235 .elementor-element.elementor-element-64bb8b2 .elementor-icon-box-wrapper {
                text-align: center
            }

            .elementor-2235 .elementor-element.elementor-element-64bb8b2 .elementor-icon-box-title {
                margin-bottom: 0;
                color: #222
            }

            .elementor-2235 .elementor-element.elementor-element-64bb8b2 .elementor-icon-box-title,.elementor-2235 .elementor-element.elementor-element-64bb8b2 .elementor-icon-box-title a {
                font-size: 14px;
                font-weight: 400
            }

            @media (max-width: 767px) {
                .elementor-2235 .elementor-element.elementor-element-898d034 {
                    width:25%
                }

                .elementor-2235 .elementor-element.elementor-element-9740208 .elementor-icon-box-icon {
                    margin-bottom: 0
                }

                .elementor-2235 .elementor-element.elementor-element-2743931 {
                    width: 25%
                }

                .elementor-2235 .elementor-element.elementor-element-9693105 .elementor-icon-box-icon {
                    margin-bottom: 0
                }

                .elementor-2235 .elementor-element.elementor-element-1fb8e80 {
                    width: 25%
                }

                .elementor-2235 .elementor-element.elementor-element-887d1bc .elementor-icon-box-icon {
                    margin-bottom: 0
                }

                .elementor-2235 .elementor-element.elementor-element-93b2e1c {
                    width: 25%
                }

                .elementor-2235 .elementor-element.elementor-element-64bb8b2 .elementor-icon-box-icon {
                    margin-bottom: 0
                }
            }

            .ekit-wid-con .ekit-review-card-trustpilot--title {
                grid-area: title;
                font-size: 18px;
                font-weight: 700;
                margin-top: 1rem!important;
                white-space: normal!important
            }

            .ekit-wid-con .ekit-review-card-trustpilot--max-reviewed {
                font-size: 12px;
                color: #000032;
                grid-area: max-reviewed;
                font-weight: 700;
                margin: .5rem 0
            }

            .ekit-wid-con .ekit-review-card-trustpilot--stars {
                grid-area: stars;
                display: flex;
                align-items: center
            }

            @keyframes fadeIn {
                from {
                    opacity: 0
                }

                to {
                    opacity: 1
                }
            }

            .fadeIn {
                animation-name: fadeIn
            }

            .rs-p-wp-fix {
                display: none!important;
                margin: 0!important;
                height: 0!important
            }

            rs-module-wrap {
                visibility: hidden
            }

            rs-module-wrap,rs-module-wrap * {
                box-sizing: border-box
            }

            rs-module-wrap {
                position: relative;
                z-index: 1;
                width: 100%;
                display: block
            }

            rs-module {
                position: relative;
                overflow: hidden;
                display: block
            }

            rs-module img {
                max-width: none!important;
                margin: 0;
                padding: 0;
                border: none
            }

            rs-slides,rs-slide,rs-slide:before {
                position: absolute;
                text-indent: 0;
                top: 0;
                left: 0
            }

            rs-slide,rs-slide:before {
                display: block;
                visibility: hidden
            }
        </style>
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css?family=Rubik%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CRoboto%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic&#038;display=swap"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CRoboto%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic&#038;display=swap" media="print" onload="this.media='all'"/>
        <noscript>
            <link rel="preload" href="https://fonts.googleapis.com/css?family=Rubik%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CRoboto%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic&#038;display=swap" data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'"/>
        </noscript>
        <meta name='robots' content='max-image-preview:large'/>
        <link href='https://fonts.gstatic.com' crossorigin rel='preconnect'/>
        <link rel="alternate" type="application/rss+xml" title="Marketo &raquo; Feed" href="https://demo.xpeedstudio.com/marketov2/feed/"/>
        <link rel="alternate" type="application/rss+xml" title="Marketo &raquo; Comments Feed" href="https://demo.xpeedstudio.com/marketov2/comments/feed/"/>
        <link rel="alternate" type="application/rss+xml" title="Marketo &raquo; Products Feed" href="https://demo.xpeedstudio.com/marketov2/shop/feed/"/>
        <style type="text/css">
            img.wp-smiley, img.emoji {
                display: inline !important;
                border: none !important;
                box-shadow: none !important;
                height: 1em !important;
                width: 1em !important;
                margin: 0 0.07em !important;
                vertical-align: -0.1em !important;
                background: none !important;
                padding: 0 !important;
            }
        </style>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/packages/woocommerce-blocks/build/wc-blocks-vendors-style.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/packages/woocommerce-blocks/build/wc-blocks-style.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <style id='global-styles-inline-css' type='text/css'>
            body {
                --wp--preset--color--black: #000000;--wp--preset--color--cyan-bluish-gray: #abb8c3;--wp--preset--color--white: #ffffff;--wp--preset--color--pale-pink: #f78da7;--wp--preset--color--vivid-red: #cf2e2e;--wp--preset--color--luminous-vivid-orange: #ff6900;--wp--preset--color--luminous-vivid-amber: #fcb900;--wp--preset--color--light-green-cyan: #7bdcb5;--wp--preset--color--vivid-green-cyan: #00d084;--wp--preset--color--pale-cyan-blue: #8ed1fc;--wp--preset--color--vivid-cyan-blue: #0693e3;--wp--preset--color--vivid-purple: #9b51e0;--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple: linear-gradient(135deg,rgba(6,147,227,1) 0%,rgb(155,81,224) 100%);--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan: linear-gradient(135deg,rgb(122,220,180) 0%,rgb(0,208,130) 100%);--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange: linear-gradient(135deg,rgba(252,185,0,1) 0%,rgba(255,105,0,1) 100%);--wp--preset--gradient--luminous-vivid-orange-to-vivid-red: linear-gradient(135deg,rgba(255,105,0,1) 0%,rgb(207,46,46) 100%);--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray: linear-gradient(135deg,rgb(238,238,238) 0%,rgb(169,184,195) 100%);--wp--preset--gradient--cool-to-warm-spectrum: linear-gradient(135deg,rgb(74,234,220) 0%,rgb(151,120,209) 20%,rgb(207,42,186) 40%,rgb(238,44,130) 60%,rgb(251,105,98) 80%,rgb(254,248,76) 100%);--wp--preset--gradient--blush-light-purple: linear-gradient(135deg,rgb(255,206,236) 0%,rgb(152,150,240) 100%);--wp--preset--gradient--blush-bordeaux: linear-gradient(135deg,rgb(254,205,165) 0%,rgb(254,45,45) 50%,rgb(107,0,62) 100%);--wp--preset--gradient--luminous-dusk: linear-gradient(135deg,rgb(255,203,112) 0%,rgb(199,81,192) 50%,rgb(65,88,208) 100%);--wp--preset--gradient--pale-ocean: linear-gradient(135deg,rgb(255,245,203) 0%,rgb(182,227,212) 50%,rgb(51,167,181) 100%);--wp--preset--gradient--electric-grass: linear-gradient(135deg,rgb(202,248,128) 0%,rgb(113,206,126) 100%);--wp--preset--gradient--midnight: linear-gradient(135deg,rgb(2,3,129) 0%,rgb(40,116,252) 100%);--wp--preset--duotone--dark-grayscale: url('#wp-duotone-dark-grayscale');--wp--preset--duotone--grayscale: url('#wp-duotone-grayscale');--wp--preset--duotone--purple-yellow: url('#wp-duotone-purple-yellow');--wp--preset--duotone--blue-red: url('#wp-duotone-blue-red');--wp--preset--duotone--midnight: url('#wp-duotone-midnight');--wp--preset--duotone--magenta-yellow: url('#wp-duotone-magenta-yellow');--wp--preset--duotone--purple-green: url('#wp-duotone-purple-green');--wp--preset--duotone--blue-orange: url('#wp-duotone-blue-orange');--wp--preset--font-size--small: 13px;--wp--preset--font-size--medium: 20px;--wp--preset--font-size--large: 36px;--wp--preset--font-size--x-large: 42px;}

            .has-black-color {
                color: var(--wp--preset--color--black) !important;
            }

            .has-cyan-bluish-gray-color {
                color: var(--wp--preset--color--cyan-bluish-gray) !important;
            }

            .has-white-color {
                color: var(--wp--preset--color--white) !important;
            }

            .has-pale-pink-color {
                color: var(--wp--preset--color--pale-pink) !important;
            }

            .has-vivid-red-color {
                color: var(--wp--preset--color--vivid-red) !important;
            }

            .has-luminous-vivid-orange-color {
                color: var(--wp--preset--color--luminous-vivid-orange) !important;
            }

            .has-luminous-vivid-amber-color {
                color: var(--wp--preset--color--luminous-vivid-amber) !important;
            }

            .has-light-green-cyan-color {
                color: var(--wp--preset--color--light-green-cyan) !important;
            }

            .has-vivid-green-cyan-color {
                color: var(--wp--preset--color--vivid-green-cyan) !important;
            }

            .has-pale-cyan-blue-color {
                color: var(--wp--preset--color--pale-cyan-blue) !important;
            }

            .has-vivid-cyan-blue-color {
                color: var(--wp--preset--color--vivid-cyan-blue) !important;
            }

            .has-vivid-purple-color {
                color: var(--wp--preset--color--vivid-purple) !important;
            }

            .has-black-background-color {
                background-color: var(--wp--preset--color--black) !important;
            }

            .has-cyan-bluish-gray-background-color {
                background-color: var(--wp--preset--color--cyan-bluish-gray) !important;
            }

            .has-white-background-color {
                background-color: var(--wp--preset--color--white) !important;
            }

            .has-pale-pink-background-color {
                background-color: var(--wp--preset--color--pale-pink) !important;
            }

            .has-vivid-red-background-color {
                background-color: var(--wp--preset--color--vivid-red) !important;
            }

            .has-luminous-vivid-orange-background-color {
                background-color: var(--wp--preset--color--luminous-vivid-orange) !important;
            }

            .has-luminous-vivid-amber-background-color {
                background-color: var(--wp--preset--color--luminous-vivid-amber) !important;
            }

            .has-light-green-cyan-background-color {
                background-color: var(--wp--preset--color--light-green-cyan) !important;
            }

            .has-vivid-green-cyan-background-color {
                background-color: var(--wp--preset--color--vivid-green-cyan) !important;
            }

            .has-pale-cyan-blue-background-color {
                background-color: var(--wp--preset--color--pale-cyan-blue) !important;
            }

            .has-vivid-cyan-blue-background-color {
                background-color: var(--wp--preset--color--vivid-cyan-blue) !important;
            }

            .has-vivid-purple-background-color {
                background-color: var(--wp--preset--color--vivid-purple) !important;
            }

            .has-black-border-color {
                border-color: var(--wp--preset--color--black) !important;
            }

            .has-cyan-bluish-gray-border-color {
                border-color: var(--wp--preset--color--cyan-bluish-gray) !important;
            }

            .has-white-border-color {
                border-color: var(--wp--preset--color--white) !important;
            }

            .has-pale-pink-border-color {
                border-color: var(--wp--preset--color--pale-pink) !important;
            }

            .has-vivid-red-border-color {
                border-color: var(--wp--preset--color--vivid-red) !important;
            }

            .has-luminous-vivid-orange-border-color {
                border-color: var(--wp--preset--color--luminous-vivid-orange) !important;
            }

            .has-luminous-vivid-amber-border-color {
                border-color: var(--wp--preset--color--luminous-vivid-amber) !important;
            }

            .has-light-green-cyan-border-color {
                border-color: var(--wp--preset--color--light-green-cyan) !important;
            }

            .has-vivid-green-cyan-border-color {
                border-color: var(--wp--preset--color--vivid-green-cyan) !important;
            }

            .has-pale-cyan-blue-border-color {
                border-color: var(--wp--preset--color--pale-cyan-blue) !important;
            }

            .has-vivid-cyan-blue-border-color {
                border-color: var(--wp--preset--color--vivid-cyan-blue) !important;
            }

            .has-vivid-purple-border-color {
                border-color: var(--wp--preset--color--vivid-purple) !important;
            }

            .has-vivid-cyan-blue-to-vivid-purple-gradient-background {
                background: var(--wp--preset--gradient--vivid-cyan-blue-to-vivid-purple) !important;
            }

            .has-light-green-cyan-to-vivid-green-cyan-gradient-background {
                background: var(--wp--preset--gradient--light-green-cyan-to-vivid-green-cyan) !important;
            }

            .has-luminous-vivid-amber-to-luminous-vivid-orange-gradient-background {
                background: var(--wp--preset--gradient--luminous-vivid-amber-to-luminous-vivid-orange) !important;
            }

            .has-luminous-vivid-orange-to-vivid-red-gradient-background {
                background: var(--wp--preset--gradient--luminous-vivid-orange-to-vivid-red) !important;
            }

            .has-very-light-gray-to-cyan-bluish-gray-gradient-background {
                background: var(--wp--preset--gradient--very-light-gray-to-cyan-bluish-gray) !important;
            }

            .has-cool-to-warm-spectrum-gradient-background {
                background: var(--wp--preset--gradient--cool-to-warm-spectrum) !important;
            }

            .has-blush-light-purple-gradient-background {
                background: var(--wp--preset--gradient--blush-light-purple) !important;
            }

            .has-blush-bordeaux-gradient-background {
                background: var(--wp--preset--gradient--blush-bordeaux) !important;
            }

            .has-luminous-dusk-gradient-background {
                background: var(--wp--preset--gradient--luminous-dusk) !important;
            }

            .has-pale-ocean-gradient-background {
                background: var(--wp--preset--gradient--pale-ocean) !important;
            }

            .has-electric-grass-gradient-background {
                background: var(--wp--preset--gradient--electric-grass) !important;
            }

            .has-midnight-gradient-background {
                background: var(--wp--preset--gradient--midnight) !important;
            }

            .has-small-font-size {
                font-size: var(--wp--preset--font-size--small) !important;
            }

            .has-medium-font-size {
                font-size: var(--wp--preset--font-size--medium) !important;
            }

            .has-large-font-size {
                font-size: var(--wp--preset--font-size--large) !important;
            }

            .has-x-large-font-size {
                font-size: var(--wp--preset--font-size--x-large) !important;
            }
        </style>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/assets/css/woocommerce-layout.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/assets/css/woocommerce-smallscreen.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='only screen and (max-width: 768px)'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/assets/css/woocommerce.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <style id='woocommerce-inline-inline-css' type='text/css'>
            .woocommerce form .form-row .required {
                visibility: visible;
            }
        </style>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/yith-woocommerce-compare/assets/css/colorbox.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/unyson/framework/extensions/builder/static/css/frontend-grid.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/unyson/framework/extensions/forms/static/css/frontend.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woo-variation-swatches/assets/css/frontend.min.css?ver=1.1.19' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <style id='woo-variation-swatches-inline-css' type='text/css'>
            .variable-item:not(.radio-variable-item) {
                width : 30px;
                height : 30px;
            }

            .wvs-style-squared .button-variable-item {
                min-width : 30px;
            }

            .button-variable-item span {
                font-size : 16px;
            }
        </style>
        <link rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woo-variation-swatches/assets/css/wvs-theme-override.min.css?ver=1.1.19' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woo-variation-swatches/assets/css/frontend-tooltip.min.css?ver=1.1.19' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/css/bootstrap.min.css?ver=4.6.2' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/plugins.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/xs-icon-font.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/xs-icon-font.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/swiper.min.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/style.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/responsive.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementskit-lite/widgets/init/assets/css/widget-styles.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementskit-lite/widgets/init/assets/css/responsive.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
        <style id='rocket-lazyload-inline-css' type='text/css'>
            .rll-youtube-player {
                position: relative;
                padding-bottom: 56.23%;
                height: 0;
                overflow: hidden;
                max-width: 100%;
            }

            .rll-youtube-player iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 100;
                background: 0 0
            }

            .rll-youtube-player img {
                bottom: 0;
                display: block;
                left: 0;
                margin: auto;
                max-width: 100%;
                width: 100%;
                position: absolute;
                right: 0;
                top: 0;
                border: none;
                height: auto;
                cursor: pointer;
                -webkit-transition: .4s all;
                -moz-transition: .4s all;
                transition: .4s all
            }

            .rll-youtube-player img:hover {
                -webkit-filter: brightness(75%)
            }

            .rll-youtube-player .play {
                height: 72px;
                width: 72px;
                left: 50%;
                top: 50%;
                margin-left: -36px;
                margin-top: -36px;
                position: absolute;
                background: url(https://demo.xpeedstudio.com/marketov2/wp-content/plugins/wp-rocket/assets/img/youtube.png) no-repeat;
                cursor: pointer
            }
        </style>
        <script type="text/template" id="tmpl-variation-template">
            
	<div class="woocommerce-variation-description">{{{ data.variation.variation_description }}}</div>
	<div class="woocommerce-variation-price">{{{ data.variation.price_html }}}</div>
	<div class="woocommerce-variation-availability">{{{ data.variation.availability_html }}}</div>

        </script>
        <script type="text/template" id="tmpl-unavailable-variation-template">
            
	<p>Sorry, this product is unavailable. Please choose a different combination.</p>

        </script>
        <script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-includes/js/jquery/jquery.min.js?ver=3.6.0' id='jquery-core-js'></script>
        <script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-includes/js/jquery/jquery-migrate.min.js?ver=3.3.2' id='jquery-migrate-js'></script>
        <link rel="https://api.w.org/" href="https://demo.xpeedstudio.com/marketov2/wp-json/"/>
        <link rel="EditURI" type="application/rsd+xml" title="RSD" href="https://demo.xpeedstudio.com/marketov2/xmlrpc.php?rsd"/>
        <link rel="wlwmanifest" type="application/wlwmanifest+xml" href="https://demo.xpeedstudio.com/marketov2/wp-includes/wlwmanifest.xml"/>
        <meta name="generator" content="WordPress 5.9.5"/>
        <meta name="generator" content="WooCommerce 6.2.2"/>
        <meta name="description" content="WordPress Theme"/>
        <noscript>
            <style>
                .woocommerce-product-gallery {
                    opacity: 1 !important;
                }
            </style>
        </noscript>
        <style type="text/css">
            .recentcomments a {
                display: inline !important;
                padding: 0 !important;
                margin: 0 !important;
            }
        </style>
        <meta name="generator" content="Powered by Slider Revolution 6.5.8 - responsive, Mobile-Friendly Slider Plugin for WordPress with comfortable drag and drop interface."/>
        <script type="rocketlazyloadscript" data-rocket-type="text/javascript">
            function setREVStartSize(e){
			//window.requestAnimationFrame(function() {				 
				window.RSIW = window.RSIW===undefined ? window.innerWidth : window.RSIW;	
				window.RSIH = window.RSIH===undefined ? window.innerHeight : window.RSIH;	
				try {								
					var pw = document.getElementById(e.c).parentNode.offsetWidth,
						newh;
					pw = pw===0 || isNaN(pw) ? window.RSIW : pw;
					e.tabw = e.tabw===undefined ? 0 : parseInt(e.tabw);
					e.thumbw = e.thumbw===undefined ? 0 : parseInt(e.thumbw);
					e.tabh = e.tabh===undefined ? 0 : parseInt(e.tabh);
					e.thumbh = e.thumbh===undefined ? 0 : parseInt(e.thumbh);
					e.tabhide = e.tabhide===undefined ? 0 : parseInt(e.tabhide);
					e.thumbhide = e.thumbhide===undefined ? 0 : parseInt(e.thumbhide);
					e.mh = e.mh===undefined || e.mh=="" || e.mh==="auto" ? 0 : parseInt(e.mh,0);		
					if(e.layout==="fullscreen" || e.l==="fullscreen") 						
						newh = Math.max(e.mh,window.RSIH);					
					else{					
						e.gw = Array.isArray(e.gw) ? e.gw : [e.gw];
						for (var i in e.rl) if (e.gw[i]===undefined || e.gw[i]===0) e.gw[i] = e.gw[i-1];					
						e.gh = e.el===undefined || e.el==="" || (Array.isArray(e.el) && e.el.length==0)? e.gh : e.el;
						e.gh = Array.isArray(e.gh) ? e.gh : [e.gh];
						for (var i in e.rl) if (e.gh[i]===undefined || e.gh[i]===0) e.gh[i] = e.gh[i-1];
											
						var nl = new Array(e.rl.length),
							ix = 0,						
							sl;					
						e.tabw = e.tabhide>=pw ? 0 : e.tabw;
						e.thumbw = e.thumbhide>=pw ? 0 : e.thumbw;
						e.tabh = e.tabhide>=pw ? 0 : e.tabh;
						e.thumbh = e.thumbhide>=pw ? 0 : e.thumbh;					
						for (var i in e.rl) nl[i] = e.rl[i]<window.RSIW ? 0 : e.rl[i];
						sl = nl[0];									
						for (var i in nl) if (sl>nl[i] && nl[i]>0) { sl = nl[i]; ix=i;}															
						var m = pw>(e.gw[ix]+e.tabw+e.thumbw) ? 1 : (pw-(e.tabw+e.thumbw)) / (e.gw[ix]);					
						newh =  (e.gh[ix] * m) + (e.tabh + e.thumbh);
					}
					var el = document.getElementById(e.c);
					if (el!==null && el) el.style.height = newh+"px";					
					el = document.getElementById(e.c+"_wrapper");
					if (el!==null && el) {
						el.style.height = newh+"px";
						el.style.display = "block";
					}
				} catch(e){
					console.log("Failure at Presize of Slider:" + e)
				}					   
			//});
		  };
        </script>
        <style type="text/css" id="wp-custom-css">
            .owl-item.last-child .xs-product-widget {
                border: 1px solid #e3e3e3;
            }

            .xs-addcart-v2 a.button, .xs-addcart-v2 a.added_to_cart.wc-forward {
                background: #fed700;
            }

            .xs-menus .nav-menu > li > a:hover {
                color: #0063d1 !important;
            }

            .xs-countdown-timer .timer-count {
                background-color: #fed700;
            }

            .product-block-slider .owl-dots .owl-dot.active span {
                background-color: #fed700;
            }

            .xs-progress .progress-bar {
                background-color: #fed700;
            }

            /* ------------------------------
 * Header 
 * ------------------------------ */
            /* All Categories Button */
            .elementor-2234 .elementor-element .vertical-menu-right-icon {
                margin-right: 20px;
                padding: 0;
            }

            .elementor-2234 .elementor-element.elementor-element-3f0a4d8 .ekit-vertical-menu-tigger {
                transition: all .4s ease;
            }

            .elementor-2234 .elementor-element.elementor-element-3f0a4d8 .ekit-vertical-menu-tigger:hover {
                background-color: #83b735;
            }

            /* Nav Menu Dropdown Arrow Icon */
            .ekit-menu-nav-link>i {
                padding-right: 0px;
            }

            /* Wishlist icon padding fix */
            .wishlist-icons a>i {
                padding-right: 0;
            }

            /*blog category*/
            .post-meta-left span.post-author {
                display: block;
            }

            /*shop page product hover centent center*/
            .list-group.xs-list-group.xs-product-content {
                text-align: center;
            }

            /*home price color*/
            .woocommerce-Price-amount.amount {
                color: #0564d2;
            }

            /*product category border*/
            .tab-content .xs-tab-slider-item .xs-product-widget {
                border: 1px solid #e3e3e3;
            }

            @media only screen and (max-width: 1024px) {
                /*whishlist pages table css*/ .wishlist_table.mobile li {
                    margin-bottom: 10px;
                    display: flex;
                    border: 1px solid rgba(0,0,0,.1);
                    align-items: center;
                }

                .additional-info tr td:first-child {
                    display: none;
                }
            }

            .elementor-top-section.ekit-sticky {
                z-index: 111;
            }

            @media only screen and (max-width: 320px) {
                .small-offer-banner-v2 .offer-banner-content h3 {
                    color: #fff;
                }
            }

            @media (min-width: 1025px) and (max-width: 2560px) {
                .ekit-vertical-navbar-nav .elementskit-megamenu-panel {
                    width: 750px !important;
                }
            }

            .ekit-vertical-navbar-nav .elementskit-submenu-indicator::before {
                content: "\e906" !important;
                font-family: 'marketo-icons';
            }

            .ekit-vertical-navbar-nav .elementskit-submenu-indicator {
                transform: rotate( -90deg );
                transition: ease 0.5s;
            }

            .ekit-vertical-navbar-nav>li:hover .elementskit-submenu-indicator {
                transform: rotate(0deg);
            }

            .elementskit-navbar-nav .elementskit-submenu-panel {
                background-color: #ffffff !important;
            }

            .woocommerce table.shop_table td del, .price del {
                opacity: 1;
            }

            .price del {
                color: #949292 !important;
            }

            del, del .woocommerce-Price-amount.amount {
                color: #949292;
            }

            .xsicon-align-justify:before {
                content: "\e901" !important;
            }

            .elementskit-navbar-nav-default .ekit-menu-badge {
                left: unset;
                right: -8px;
                text-align: center;
            }

            .elementskit-navbar-nav-default.elementskit_none .elementskit-submenu-indicator::before {
                content: "\e905" !important;
                font-family: 'marketo-icons';
                transform: rotate(45deg);
            }

            .elementskit-navbar-nav-default .elementskit-dropdown-has>a .elementskit-submenu-indicator {
                margin-left: 7px;
                font-size: 9px;
                transform: rotate(-90deg);
            }
        </style>
        <style id="kirki-inline-styles">
            .xs-content-header.background-version, .xs-nav-tab .nav-link::before, .swiper-pagination .swiper-pagination-bullet-active, .xs-map-popup.btn-warning, .single_add_to_cart_button::before, p.woocommerce-mini-cart__buttons.buttons a, .woocommerce input.button, .woocommerce button.button, .woocommerce a.button.alt, .woocommerce button.button.alt {
                background-color: #fed700;
            }

            .xs-nav-tab .nav-link::after {
                border-top: 8px solid #fed700;
            }

            .xs-deal-of-the-week {
                border: 2px solid #fed700;
            }

            .product-feature-ribbon {
                border-right-color: #fed700;
                border-top-color: #fed700;
            }

            .xs-single-wishList .xs-item-count.highlight {
                background-color: #fed700;
            }

            .xs-single-wishList, .woocommerce .star-rating::before, .woocommerce .star-rating span::before, .add_to_wishlist, .woocommerce div.product .stock, .rate-list li .star-rating::before, .woocommerce-tabs #review_form_wrapper .comment-form-rating .stars a, .xs-wishlist .yith-wcwl-add-to-wishlist .yith-wcwl-wishlistaddedbrowse a:before, .xs-nav-tab.version-4 .nav-item .nav-link.active, .xs-nav-tab.version-4 .nav-item .nav-link:hover, .summary.entry-summary .yith-wcwl-add-to-wishlist .yith-wcwl-wishlistexistsbrowse a:before, .yith-wcwl-wishlistexistsbrowse a, .xs-nav-tab .nav-link.active, .xs-nav-tab .nav-link:hover {
                color: #fed700;
            }

            a.xs-map-popup.btn.btn-primary {
                background-color: #fed700;
            }

            .xs-copyright {
                background-color: #fed700;
            }

            .xs-progress .progress-bar {
                background-color: #fed700;
            }

            .xs-countdown-timer .timer-count {
                background-color: #fed700;
            }

            .product-block-slider .swiper-pagination .swiper-pagination-bullet-active {
                background-color: #fed700;
            }

            .select-options li:hover {
                background-color: #fed700;
            }

            .shop-archive .widget_price_filter .ui-slider .ui-slider-handle, .shop-archive .widget_price_filter .ui-slider .ui-slider-range {
                background-color: #fed700;
            }

            .product-title-v2 a {
                color: #fed700;
            }

            .color-primary, .shop-view-nav .nav-item .nav-link.active {
                color: #fed700;
            }

            .entry-header .entry-title a:hover {
                color: #fed700;
            }

            .sidebar .widget-title {
                border-color: #fed700;
            }

            .fonts-loaded body {
                font-family: Roboto;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.5;
            }

            .fonts-loaded h1 {
                font-family: Roboto;
            }

            .fonts-loaded h2 {
                font-family: Roboto;
                font-weight: 500;
            }

            .fonts-loaded h3 {
                font-family: Roboto;
            }

            .fonts-loaded h4 {
                font-family: Roboto;
            }

            .fonts-loaded h5 {
                font-family: Roboto;
            }

            .fonts-loaded h6 {
                font-family: Roboto;
            }

            .fonts-loaded p {
                font-family: Roboto;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu72xMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu5mxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7mxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu4WxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7WxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7GxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu4mxMKTU1Kg.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCRc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fABc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCBc-AMP6lbBP.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fBxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fChc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fBBc-AMP6lQ.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCRc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfABc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCBc-AMP6lbBP.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfBxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfChc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfBBc-AMP6lQ.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu72xMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu5mxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7mxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu4WxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7WxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7GxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu4mxMKTU1Kg.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCRc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fABc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCBc-AMP6lbBP.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fBxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fChc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fBBc-AMP6lQ.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCRc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfABc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCBc-AMP6lbBP.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfBxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfChc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfBBc-AMP6lQ.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu72xMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu5mxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7mxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu4WxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7WxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7GxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu4mxMKTU1Kg.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCRc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fABc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCBc-AMP6lbBP.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fBxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fChc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fBBc-AMP6lQ.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCRc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfABc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCBc-AMP6lbBP.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfBxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfChc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfBBc-AMP6lQ.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu72xMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu5mxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7mxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu4WxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7WxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu7GxMKTU1Kvnz.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 400;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOmCnqEu92Fr1Mu4mxMKTU1Kg.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCRc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fABc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCBc-AMP6lbBP.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fBxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fCxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fChc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 500;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmEU9fBBc-AMP6lQ.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }

            /* cyrillic-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCRc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
            }

            /* cyrillic */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfABc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
            }

            /* greek-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCBc-AMP6lbBP.woff) format('woff');
                unicode-range: U+1F00-1FFF;
            }

            /* greek */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfBxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0370-03FF;
            }

            /* vietnamese */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfCxc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB;
            }

            /* latin-ext */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfChc-AMP6lbBP.woff) format('woff');
                unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }

            /* latin */
            @font-face {
                font-family: 'Roboto';
                font-style: normal;
                font-weight: 700;
                font-display: swap; src: url(https://demo.xpeedstudio.com/marketov2/wp-content/fonts/roboto/KFOlCnqEu92Fr1MmWUlfBBc-AMP6lQ.woff) format('woff');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
        </style>
        <noscript>
            <style id="rocket-lazyload-nojs-css">
                .rll-youtube-player, [data-lazy-src] {
                    display: none !important;
                }
            </style>
        </noscript>
        <script type="rocketlazyloadscript">
            
/*! loadCSS rel=preload polyfill. [c]2017 Filament Group, Inc. MIT License */
(function(w){"use strict";if(!w.loadCSS){w.loadCSS=function(){}}
var rp=loadCSS.relpreload={};rp.support=(function(){var ret;try{ret=w.document.createElement("link").relList.supports("preload")}catch(e){ret=!1}
return function(){return ret}})();rp.bindMediaToggle=function(link){var finalMedia=link.media||"all";function enableStylesheet(){link.media=finalMedia}
if(link.addEventListener){link.addEventListener("load",enableStylesheet)}else if(link.attachEvent){link.attachEvent("onload",enableStylesheet)}
setTimeout(function(){link.rel="stylesheet";link.media="only x"});setTimeout(enableStylesheet,3000)};rp.poly=function(){if(rp.support()){return}
var links=w.document.getElementsByTagName("link");for(var i=0;i<links.length;i++){var link=links[i];if(link.rel==="preload"&&link.getAttribute("as")==="style"&&!link.getAttribute("data-loadcss")){link.setAttribute("data-loadcss",!0);rp.bindMediaToggle(link)}}};if(!rp.support()){rp.poly();var run=w.setInterval(rp.poly,500);if(w.addEventListener){w.addEventListener("load",function(){rp.poly();w.clearInterval(run)})}else if(w.attachEvent){w.attachEvent("onload",function(){rp.poly();w.clearInterval(run)})}}
if(typeof exports!=="undefined"){exports.loadCSS=loadCSS}
else{w.loadCSS=loadCSS}}(typeof global!=="undefined"?global:this))

        </script>
    </head>
    <body class="archive post-type-archive post-type-archive-product  theme-marketo woocommerce-shop woocommerce woocommerce-page woocommerce-no-js woo-variation-swatches wvs-theme-marketo wvs-theme-child-marketo wvs-style-squared wvs-attr-behavior-blur wvs-tooltip wvs-css wvs-show-label sidebar-active elementor-default elementor-kit-6" data-spy="scroll" data-target="#header">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;">
            <defs>
                <filter id="wp-duotone-dark-grayscale">
                    <feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "/>
                    <feComponentTransfer color-interpolation-filters="sRGB">
                        <feFuncR type="table" tableValues="0 0.49803921568627"/>
                        <feFuncG type="table" tableValues="0 0.49803921568627"/>
                        <feFuncB type="table" tableValues="0 0.49803921568627"/>
                        <feFuncA type="table" tableValues="1 1"/>
                    </feComponentTransfer>
                    <feComposite in2="SourceGraphic" operator="in"/>
                </filter>
            </defs>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;">
            <defs>
                <filter id="wp-duotone-grayscale">
                    <feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "/>
                    <feComponentTransfer color-interpolation-filters="sRGB">
                        <feFuncR type="table" tableValues="0 1"/>
                        <feFuncG type="table" tableValues="0 1"/>
                        <feFuncB type="table" tableValues="0 1"/>
                        <feFuncA type="table" tableValues="1 1"/>
                    </feComponentTransfer>
                    <feComposite in2="SourceGraphic" operator="in"/>
                </filter>
            </defs>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;">
            <defs>
                <filter id="wp-duotone-purple-yellow">
                    <feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "/>
                    <feComponentTransfer color-interpolation-filters="sRGB">
                        <feFuncR type="table" tableValues="0.54901960784314 0.98823529411765"/>
                        <feFuncG type="table" tableValues="0 1"/>
                        <feFuncB type="table" tableValues="0.71764705882353 0.25490196078431"/>
                        <feFuncA type="table" tableValues="1 1"/>
                    </feComponentTransfer>
                    <feComposite in2="SourceGraphic" operator="in"/>
                </filter>
            </defs>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;">
            <defs>
                <filter id="wp-duotone-blue-red">
                    <feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "/>
                    <feComponentTransfer color-interpolation-filters="sRGB">
                        <feFuncR type="table" tableValues="0 1"/>
                        <feFuncG type="table" tableValues="0 0.27843137254902"/>
                        <feFuncB type="table" tableValues="0.5921568627451 0.27843137254902"/>
                        <feFuncA type="table" tableValues="1 1"/>
                    </feComponentTransfer>
                    <feComposite in2="SourceGraphic" operator="in"/>
                </filter>
            </defs>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;">
            <defs>
                <filter id="wp-duotone-midnight">
                    <feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "/>
                    <feComponentTransfer color-interpolation-filters="sRGB">
                        <feFuncR type="table" tableValues="0 0"/>
                        <feFuncG type="table" tableValues="0 0.64705882352941"/>
                        <feFuncB type="table" tableValues="0 1"/>
                        <feFuncA type="table" tableValues="1 1"/>
                    </feComponentTransfer>
                    <feComposite in2="SourceGraphic" operator="in"/>
                </filter>
            </defs>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;">
            <defs>
                <filter id="wp-duotone-magenta-yellow">
                    <feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "/>
                    <feComponentTransfer color-interpolation-filters="sRGB">
                        <feFuncR type="table" tableValues="0.78039215686275 1"/>
                        <feFuncG type="table" tableValues="0 0.94901960784314"/>
                        <feFuncB type="table" tableValues="0.35294117647059 0.47058823529412"/>
                        <feFuncA type="table" tableValues="1 1"/>
                    </feComponentTransfer>
                    <feComposite in2="SourceGraphic" operator="in"/>
                </filter>
            </defs>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;">
            <defs>
                <filter id="wp-duotone-purple-green">
                    <feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "/>
                    <feComponentTransfer color-interpolation-filters="sRGB">
                        <feFuncR type="table" tableValues="0.65098039215686 0.40392156862745"/>
                        <feFuncG type="table" tableValues="0 1"/>
                        <feFuncB type="table" tableValues="0.44705882352941 0.4"/>
                        <feFuncA type="table" tableValues="1 1"/>
                    </feComponentTransfer>
                    <feComposite in2="SourceGraphic" operator="in"/>
                </filter>
            </defs>
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 0 0" width="0" height="0" focusable="false" role="none" style="visibility: hidden; position: absolute; left: -9999px; overflow: hidden;">
            <defs>
                <filter id="wp-duotone-blue-orange">
                    <feColorMatrix color-interpolation-filters="sRGB" type="matrix" values=" .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 .299 .587 .114 0 0 "/>
                    <feComponentTransfer color-interpolation-filters="sRGB">
                        <feFuncR type="table" tableValues="0.098039215686275 1"/>
                        <feFuncG type="table" tableValues="0 0.66274509803922"/>
                        <feFuncB type="table" tableValues="0.84705882352941 0.41960784313725"/>
                        <feFuncA type="table" tableValues="1 1"/>
                    </feComponentTransfer>
                    <feComposite in2="SourceGraphic" operator="in"/>
                </filter>
            </defs>
        </svg>
        <div class="xs-sidebar-group">
            <div class="xs-overlay bg-black"></div>
            <div class="xs-minicart-widget">
                <div class="widget-heading media">
                    <h3 class="widget-title align-self-center d-flex">Shopping cart</h3>
                    <div class="media-body">
                        <a href="#" class="close-side-widget">
                            <i class="xsicon xsicon-cross"></i>
                        </a>
                    </div>
                </div>
                <div class="widget woocommerce widget_shopping_cart">
                    <div class="widget_shopping_cart_content"></div>
                </div>
            </div>
        </div>
        <div data-elementor-type="wp-post" data-elementor-id="2234" class="elementor elementor-2234" data-elementor-settings="[]">
            <div class="elementor-section-wrap">
                <section class="elementor-section elementor-top-section elementor-element elementor-element-f09ae29 elementor-section-full_width elementor-section-content-middle elementor-hidden-phone animated-fast elementor-section-height-default elementor-section-height-default elementor-invisible" data-id="f09ae29" data-element_type="section" data-settings="{&quot;background_background&quot;:&quot;classic&quot;,&quot;animation&quot;:&quot;fadeIn&quot;}">
                    <div class="elementor-container elementor-column-gap-default">
                        <div class="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-a72b422" data-id="a72b422" data-element_type="column">
                            <div class="elementor-widget-wrap elementor-element-populated">
                                <div class="elementor-element elementor-element-92d8f8e elementor-widget__width-auto elementor-icon-list--layout-traditional elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="92d8f8e" data-element_type="widget" data-widget_type="icon-list.default">
                                    <div class="elementor-widget-container">
                                        <style>
                                            /*! elementor - v3.5.6 - 28-02-2022 */
                                            .elementor-widget.elementor-icon-list--layout-inline .elementor-widget-container {
                                                overflow: hidden
                                            }

                                            .elementor-widget .elementor-icon-list-items.elementor-inline-items {
                                                margin-right: -8px;
                                                margin-left: -8px
                                            }

                                            .elementor-widget .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item {
                                                margin-right: 8px;
                                                margin-left: 8px
                                            }

                                            .elementor-widget .elementor-icon-list-items.elementor-inline-items .elementor-icon-list-item:after {
                                                width: auto;
                                                left: auto;
                                                right: auto;
                                                position: relative;
                                                height: 100%;
                                                border-top: 0;
                                                border-bottom: 0;
                                                border-right: 0;
                                                border-left-width: 1px;
                                                border-style: solid;
                                                right: -8px
                                            }

                                            .elementor-widget .elementor-icon-list-items {
                                                list-style-type: none;
                                                margin: 0;
                                                padding: 0
                                            }

                                            .elementor-widget .elementor-icon-list-item {
                                                margin: 0;
                                                padding: 0;
                                                position: relative
                                            }

                                            .elementor-widget .elementor-icon-list-item:after {
                                                position: absolute;
                                                bottom: 0;
                                                width: 100%
                                            }

                                            .elementor-widget .elementor-icon-list-item,.elementor-widget .elementor-icon-list-item a {
                                                display: -webkit-box;
                                                display: -ms-flexbox;
                                                display: flex;
                                                -webkit-box-align: center;
                                                -ms-flex-align: center;
                                                align-items: center;
                                                font-size: inherit
                                            }

                                            .elementor-widget .elementor-icon-list-icon+.elementor-icon-list-text {
                                                -ms-flex-item-align: center;
                                                align-self: center;
                                                padding-left: 5px
                                            }

                                            .elementor-widget .elementor-icon-list-icon {
                                                display: -webkit-box;
                                                display: -ms-flexbox;
                                                display: flex
                                            }

                                            .elementor-widget .elementor-icon-list-icon svg {
                                                width: var(--e-icon-list-icon-size,1em);
                                                height: var(--e-icon-list-icon-size,1em)
                                            }

                                            .elementor-widget .elementor-icon-list-icon i {
                                                width: 1.25em;
                                                font-size: var(--e-icon-list-icon-size)
                                            }

                                            .elementor-widget.elementor-widget-icon-list .elementor-icon-list-icon {
                                                text-align: var(--e-icon-list-icon-align)
                                            }

                                            .elementor-widget.elementor-widget-icon-list .elementor-icon-list-icon svg {
                                                margin: var(--e-icon-list-icon-margin,0 calc(var(--e-icon-list-icon-size, 1em) * .25) 0 0)
                                            }

                                            .elementor-widget.elementor-list-item-link-full_width a {
                                                width: 100%
                                            }

                                            .elementor-widget.elementor-align-center .elementor-icon-list-item,.elementor-widget.elementor-align-center .elementor-icon-list-item a {
                                                -webkit-box-pack: center;
                                                -ms-flex-pack: center;
                                                justify-content: center
                                            }

                                            .elementor-widget.elementor-align-center .elementor-icon-list-item:after {
                                                margin: auto
                                            }

                                            .elementor-widget.elementor-align-center .elementor-inline-items {
                                                -webkit-box-pack: center;
                                                -ms-flex-pack: center;
                                                justify-content: center
                                            }

                                            .elementor-widget.elementor-align-left .elementor-icon-list-item,.elementor-widget.elementor-align-left .elementor-icon-list-item a {
                                                -webkit-box-pack: start;
                                                -ms-flex-pack: start;
                                                justify-content: flex-start;
                                                text-align: left
                                            }

                                            .elementor-widget.elementor-align-left .elementor-inline-items {
                                                -webkit-box-pack: start;
                                                -ms-flex-pack: start;
                                                justify-content: flex-start
                                            }

                                            .elementor-widget.elementor-align-right .elementor-icon-list-item,.elementor-widget.elementor-align-right .elementor-icon-list-item a {
                                                -webkit-box-pack: end;
                                                -ms-flex-pack: end;
                                                justify-content: flex-end;
                                                text-align: right
                                            }

                                            .elementor-widget.elementor-align-right .elementor-icon-list-items {
                                                -webkit-box-pack: end;
                                                -ms-flex-pack: end;
                                                justify-content: flex-end
                                            }

                                            .elementor-widget:not(.elementor-align-right) .elementor-icon-list-item:after {
                                                left: 0
                                            }

                                            .elementor-widget:not(.elementor-align-left) .elementor-icon-list-item:after {
                                                right: 0
                                            }

                                            @media (max-width: 1024px) {
                                                .elementor-widget.elementor-tablet-align-center .elementor-icon-list-item,.elementor-widget.elementor-tablet-align-center .elementor-icon-list-item a,.elementor-widget.elementor-tablet-align-center .elementor-icon-list-items {
                                                    -webkit-box-pack:center;
                                                    -ms-flex-pack: center;
                                                    justify-content: center
                                                }

                                                .elementor-widget.elementor-tablet-align-center .elementor-icon-list-item:after {
                                                    margin: auto
                                                }

                                                .elementor-widget.elementor-tablet-align-left .elementor-icon-list-items {
                                                    -webkit-box-pack: start;
                                                    -ms-flex-pack: start;
                                                    justify-content: flex-start
                                                }

                                                .elementor-widget.elementor-tablet-align-left .elementor-icon-list-item,.elementor-widget.elementor-tablet-align-left .elementor-icon-list-item a {
                                                    -webkit-box-pack: start;
                                                    -ms-flex-pack: start;
                                                    justify-content: flex-start;
                                                    text-align: left
                                                }

                                                .elementor-widget.elementor-tablet-align-right .elementor-icon-list-items {
                                                    -webkit-box-pack: end;
                                                    -ms-flex-pack: end;
                                                    justify-content: flex-end
                                                }

                                                .elementor-widget.elementor-tablet-align-right .elementor-icon-list-item,.elementor-widget.elementor-tablet-align-right .elementor-icon-list-item a {
                                                    -webkit-box-pack: end;
                                                    -ms-flex-pack: end;
                                                    justify-content: flex-end;
                                                    text-align: right
                                                }

                                                .elementor-widget:not(.elementor-tablet-align-right) .elementor-icon-list-item:after {
                                                    left: 0
                                                }

                                                .elementor-widget:not(.elementor-tablet-align-left) .elementor-icon-list-item:after {
                                                    right: 0
                                                }
                                            }

                                            @media (max-width: 767px) {
                                                .elementor-widget.elementor-mobile-align-center .elementor-icon-list-item,.elementor-widget.elementor-mobile-align-center .elementor-icon-list-item a,.elementor-widget.elementor-mobile-align-center .elementor-icon-list-items {
                                                    -webkit-box-pack:center;
                                                    -ms-flex-pack: center;
                                                    justify-content: center
                                                }

                                                .elementor-widget.elementor-mobile-align-center .elementor-icon-list-item:after {
                                                    margin: auto
                                                }

                                                .elementor-widget.elementor-mobile-align-left .elementor-icon-list-items {
                                                    -webkit-box-pack: start;
                                                    -ms-flex-pack: start;
                                                    justify-content: flex-start
                                                }

                                                .elementor-widget.elementor-mobile-align-left .elementor-icon-list-item,.elementor-widget.elementor-mobile-align-left .elementor-icon-list-item a {
                                                    -webkit-box-pack: start;
                                                    -ms-flex-pack: start;
                                                    justify-content: flex-start;
                                                    text-align: left
                                                }

                                                .elementor-widget.elementor-mobile-align-right .elementor-icon-list-items {
                                                    -webkit-box-pack: end;
                                                    -ms-flex-pack: end;
                                                    justify-content: flex-end
                                                }

                                                .elementor-widget.elementor-mobile-align-right .elementor-icon-list-item,.elementor-widget.elementor-mobile-align-right .elementor-icon-list-item a {
                                                    -webkit-box-pack: end;
                                                    -ms-flex-pack: end;
                                                    justify-content: flex-end;
                                                    text-align: right
                                                }

                                                .elementor-widget:not(.elementor-mobile-align-right) .elementor-icon-list-item:after {
                                                    left: 0
                                                }

                                                .elementor-widget:not(.elementor-mobile-align-left) .elementor-icon-list-item:after {
                                                    right: 0
                                                }
                                            }
                                        </style>
                                        <ul class="elementor-icon-list-items">
                                            <li class="elementor-icon-list-item">
                                                <span class="elementor-icon-list-icon">
                                                    <i aria-hidden="true" class="xsicon xsicon-shuttle-van"></i>
                                                </span>
                                                <span class="elementor-icon-list-text">Free Delivery</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="elementor-element elementor-element-abbd5b0 elementor-widget__width-auto elementor-icon-list--layout-traditional elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="abbd5b0" data-element_type="widget" data-widget_type="icon-list.default">
                                    <div class="elementor-widget-container">
                                        <ul class="elementor-icon-list-items">
                                            <li class="elementor-icon-list-item">
                                                <span class="elementor-icon-list-icon">
                                                    <i aria-hidden="true" class="xsicon xsicon-globe-europe"></i>
                                                </span>
                                                <span class="elementor-icon-list-text">Returns Policy</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="elementor-element elementor-element-5c2c6b9 elementor-icon-list--layout-inline elementor-widget__width-auto elementor-list-item-link-full_width elementor-widget elementor-widget-icon-list" data-id="5c2c6b9" data-element_type="widget" data-widget_type="icon-list.default">
                                    <div class="elementor-widget-container">
                                        <ul class="elementor-icon-list-items elementor-inline-items">
                                            <li class="elementor-icon-list-item elementor-inline-item">
                                                <span class="elementor-icon-list-text">Follow Us</span>
                                            </li>
                                            <li class="elementor-icon-list-item elementor-inline-item">
                                                <span class="elementor-icon-list-icon">
                                                    <i aria-hidden="true" class="xsicon xsicon-facebook-f"></i>
                                                </span>
                                                <span class="elementor-icon-list-text"></span>
                                            </li>
                                            <li class="elementor-icon-list-item elementor-inline-item">
                                                <span class="elementor-icon-list-icon">
                                                    <i aria-hidden="true" class="xsicon xsicon-twitter"></i>
                                                </span>
                                                <span class="elementor-icon-list-text"></span>
                                            </li>
                                            <li class="elementor-icon-list-item elementor-inline-item">
                                                <span class="elementor-icon-list-icon">
                                                    <i aria-hidden="true" class="xsicon xsicon-pinterest-p"></i>
                                                </span>
                                                <span class="elementor-icon-list-text"></span>
                                            </li>
                                            <li class="elementor-icon-list-item elementor-inline-item">
                                                <span class="elementor-icon-list-icon">
                                                    <i aria-hidden="true" class="xsicon xsicon-instagram"></i>
                                                </span>
                                                <span class="elementor-icon-list-text"></span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-a225316" data-id="a225316" data-element_type="column">
                            <div class="elementor-widget-wrap elementor-element-populated">
                                <div class="elementor-element elementor-element-016abeb elementor-align-right elementor-widget elementor-widget-elementskit-page-list" data-id="016abeb" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                    <div class="elementor-widget-container">
                                        <div class="ekit-wid-con">
                                            <div class="elementor-icon-list-items  elementor-inline-items">
                                                <div class="elementor-icon-list-item   ">
                                                    <a target=_blank rel="" href="https://demo.xpeedstudio.com/marketov2/my-account/" class="elementor-repeater-item-d798e09 ekit_badge_left">
                                                        <div class="ekit_page_list_content">
                                                            <span class="elementor-icon-list-text">
                                                                <span class="ekit_page_list_title_title">Login</span>
                                                            </span>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="elementor-section elementor-top-section elementor-element elementor-element-9085b26 elementor-section-full_width ekit-sticky--top elementor-section-height-min-height animated-fast elementor-section-height-default elementor-section-items-middle elementor-invisible" data-id="9085b26" data-element_type="section" data-settings="{&quot;ekit_sticky&quot;:&quot;top&quot;,&quot;animation&quot;:&quot;fadeIn&quot;,&quot;ekit_sticky_offset&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;size&quot;:0,&quot;sizes&quot;:[]},&quot;ekit_sticky_on&quot;:&quot;desktop_tablet_mobile&quot;,&quot;ekit_sticky_effect_offset&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;size&quot;:0,&quot;sizes&quot;:[]}}">
                    <div class="elementor-container elementor-column-gap-no">
                        <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-375a7e7" data-id="375a7e7" data-element_type="column">
                            <div class="elementor-widget-wrap elementor-element-populated">
                                <section class="elementor-section elementor-inner-section elementor-element elementor-element-1935717 elementor-section-content-middle xs_megamenu_has elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="1935717" data-element_type="section">
                                    <div class="elementor-container elementor-column-gap-default">
                                        <div class="elementor-column elementor-col-33 elementor-inner-column elementor-element elementor-element-088fd24" data-id="088fd24" data-element_type="column">
                                            <div class="elementor-widget-wrap elementor-element-populated">
                                                <div class="elementor-element elementor-element-54570e8 elementor-widget elementor-widget-image" data-id="54570e8" data-element_type="widget" data-widget_type="image.default">
                                                    <div class="elementor-widget-container">
                                                        <style>
                                                            /*! elementor - v3.5.6 - 28-02-2022 */
                                                            .elementor-widget-image {
                                                                text-align: center
                                                            }

                                                            .elementor-widget-image a {
                                                                display: inline-block
                                                            }

                                                            .elementor-widget-image a img[src$=".svg"] {
                                                                width: 48px
                                                            }

                                                            .elementor-widget-image img {
                                                                vertical-align: middle;
                                                                display: inline-block
                                                            }
                                                        </style>
                                                        <a href="https://demo.xpeedstudio.com/marketov2/">
                                                            <img width="125" height="21" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%2021'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/logo_home-1.png"/>
                                                            <noscript>
                                                                <img width="125" height="21" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/logo_home-1.png" class="attachment-full size-full" alt=""/>
                                                            </noscript>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="elementor-column elementor-col-33 elementor-inner-column elementor-element elementor-element-8cab53a" data-id="8cab53a" data-element_type="column">
                                            <div class="elementor-widget-wrap elementor-element-populated">
                                                <div class="elementor-element elementor-element-07b37b0 elementor-widget elementor-widget-ekit-nav-menu" data-id="07b37b0" data-element_type="widget" data-widget_type="ekit-nav-menu.default">
                                                    <div class="elementor-widget-container">
                                                        <div class="ekit-wid-con ekit_menu_responsive_tablet" data-hamburger-icon="xsicon xsicon-bars" data-hamburger-icon-type="icon" data-responsive-breakpoint="1024">
                                                            <button class="elementskit-menu-hamburger elementskit-menu-toggler">
                                                                <i aria-hidden="true" class="ekit-menu-icon xsicon xsicon-bars"></i>
                                                            </button>
                                                            <div id="ekit-megamenu-main-menu" class="elementskit-menu-container elementskit-menu-offcanvas-elements elementskit-navbar-nav-default elementskit_none ekit-nav-menu-one-page-no ekit-nav-dropdown-hover">
                                                                <ul id="menu-main-menu" class="elementskit-navbar-nav elementskit-menu-po-center submenu-click-on-icon">
                                                                    <li id="menu-item-3581" class="megamenu menu-item menu-item-type-custom menu-item-object-custom menu-item-3581 nav-item elementskit-dropdown-has top_position elementskit-dropdown-menu-custom_width elementskit-megamenu-has elementskit-mobile-builder-content" data-vertical-menu=1140>
                                                                        <a href="#" class="ekit-menu-nav-link">
                                                                            Home<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                        </a>
                                                                        <ul class="elementskit-megamenu-panel">
                                                                            <div data-elementor-type="wp-post" data-elementor-id="3640" class="elementor elementor-3640" data-elementor-settings="[]">
                                                                                <div class="elementor-section-wrap">
                                                                                    <div class="elementor-section elementor-top-section elementor-element elementor-element-c9c41 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="c9c41" data-element_type="section" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                        <div class="elementor-container elementor-column-gap-default">
                                                                                            <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-7d95b908" data-id="7d95b908" data-element_type="column">
                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                    <section class="elementor-section elementor-inner-section elementor-element elementor-element-c940d93 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="c940d93" data-element_type="section">
                                                                                                        <div class="elementor-container elementor-column-gap-default">
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-44b0f751" data-id="44b0f751" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-5617289 xs-home-images elementor-widget elementor-widget-image" data-id="5617289" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-one.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-one.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 01</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-63062850" data-id="63062850" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-52611f7 xs-home-images elementor-widget elementor-widget-image" data-id="52611f7" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home2">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-two1.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-two1.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 02</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-4f43ffa7" data-id="4f43ffa7" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-1d8ef2b8 xs-home-images elementor-widget elementor-widget-image" data-id="1d8ef2b8" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home3">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-three1.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-three1.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 03</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-153184ce" data-id="153184ce" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-2897f507 xs-home-images elementor-widget elementor-widget-image" data-id="2897f507" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home4">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-four1.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-four1.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 04</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </section>
                                                                                                    <section class="elementor-section elementor-inner-section elementor-element elementor-element-5d8af90e elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="5d8af90e" data-element_type="section">
                                                                                                        <div class="elementor-container elementor-column-gap-default">
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-6174b5d5" data-id="6174b5d5" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-1e92c27d xs-home-images elementor-widget elementor-widget-image" data-id="1e92c27d" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home5">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-six1.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-six1.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 05</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-41856f2d" data-id="41856f2d" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-734f2af9 xs-home-images elementor-widget elementor-widget-image" data-id="734f2af9" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home6">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-eight1.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-eight1.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 06</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-61ba14ec" data-id="61ba14ec" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-3ec0f07b xs-home-images elementor-widget elementor-widget-image" data-id="3ec0f07b" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home7">
                                                                                                                                    <img width="1920" height="1704" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201920%201704'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-seven1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="1920" height="1704" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-seven1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 07</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-1e3baa70" data-id="1e3baa70" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-160864d7 xs-home-images elementor-widget elementor-widget-image" data-id="160864d7" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home8">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-nine1.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-nine1.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 08</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </section>
                                                                                                    <section class="elementor-section elementor-inner-section elementor-element elementor-element-1f24f5c3 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="1f24f5c3" data-element_type="section">
                                                                                                        <div class="elementor-container elementor-column-gap-default">
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-59cc5b63" data-id="59cc5b63" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-11fdcf7c xs-home-images elementor-widget elementor-widget-image" data-id="11fdcf7c" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home9">
                                                                                                                                    <img width="1920" height="1704" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201920%201704'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-nine1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="1920" height="1704" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-nine1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home 09</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-544433d3" data-id="544433d3" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-79f6761c xs-home-images elementor-widget elementor-widget-image" data-id="79f6761c" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/home10">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-one.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-one.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Wc Marketplace</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-cecafee" data-id="cecafee" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-6ba7cd68 xs-home-images elementor-widget elementor-widget-image" data-id="6ba7cd68" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/marketovendor/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-one.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-one.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Dokan Marketplace</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-7113d35d" data-id="7113d35d" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-3d7eedd0 xs-home-images elementor-widget elementor-widget-image" data-id="3d7eedd0" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/furniture/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Furniture-1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Furniture-1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Furniture</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </section>
                                                                                                    <section class="elementor-section elementor-inner-section elementor-element elementor-element-2eb383fb elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="2eb383fb" data-element_type="section">
                                                                                                        <div class="elementor-container elementor-column-gap-default">
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-398d2d69" data-id="398d2d69" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-2e54881 xs-home-images elementor-widget elementor-widget-image" data-id="2e54881" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/grocery/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Grocery-1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Grocery-1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Grocery</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-6f79d9e1" data-id="6f79d9e1" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-3a01f7ef xs-home-images elementor-widget elementor-widget-image" data-id="3a01f7ef" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/parts/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Parts-1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Parts-1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Auto Parts</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-446afe36" data-id="446afe36" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-5d703874 xs-home-images elementor-widget elementor-widget-image" data-id="5d703874" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/watch/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Watch-1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Watch-1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Watch</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-5d0057da" data-id="5d0057da" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-32bff9d xs-home-images elementor-widget elementor-widget-image" data-id="32bff9d" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/shoe/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Shoe-1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Shoe-1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Shoe</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </section>
                                                                                                    <section class="elementor-section elementor-inner-section elementor-element elementor-element-2082dde0 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="2082dde0" data-element_type="section">
                                                                                                        <div class="elementor-container elementor-column-gap-default">
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-6a2f8cdc" data-id="6a2f8cdc" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-7e01baf5 xs-home-images elementor-widget elementor-widget-image" data-id="7e01baf5" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/eyeglass/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Eye-Glass-1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Eye-Glass-1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Eye Glass</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-5d999cda" data-id="5d999cda" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-5f333f93 xs-home-images elementor-widget elementor-widget-image" data-id="5f333f93" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/jewelry/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Jewelry-1.png"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/Jewelry-1.png" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Jewelry</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-34b96a7f" data-id="34b96a7f" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                    <div class="elementor-element elementor-element-45cafc93 xs-home-images elementor-widget elementor-widget-image" data-id="45cafc93" data-element_type="widget" data-widget_type="image.default">
                                                                                                                        <div class="elementor-widget-container">
                                                                                                                            <figure class="wp-caption">
                                                                                                                                <a href="/marketov2/rtl/">
                                                                                                                                    <img width="500" height="444" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20500%20444'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-one.jpg"/>
                                                                                                                                    <noscript>
                                                                                                                                        <img width="500" height="444" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/home-one.jpg" class="attachment-full size-full" alt=""/>
                                                                                                                                    </noscript>
                                                                                                                                </a>
                                                                                                                                <figcaption class="widget-image-caption wp-caption-text">Home RTL</figcaption>
                                                                                                                            </figure>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                            <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-706e8d45" data-id="706e8d45" data-element_type="column">
                                                                                                                <div class="elementor-widget-wrap"></div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </section>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </ul>
                                                                    </li>
                                                                    <li id="menu-item-3582" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-3582 nav-item elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                        <a href="#" class="ekit-menu-nav-link ekit-menu-dropdown-toggle">
                                                                            Pages<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                        </a>
                                                                        <ul class="elementskit-dropdown elementskit-submenu-panel">
                                                                            <li id="menu-item-3661" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3661 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                <a href="https://demo.xpeedstudio.com/marketov2/about-us/" class=" dropdown-item">About Us</a>
                                                                            <li id="menu-item-3662" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3662 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                <a href="https://demo.xpeedstudio.com/marketov2/contact/" class=" dropdown-item">Contact</a>
                                                                            <li id="menu-item-3663" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3663 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                <a href="https://demo.xpeedstudio.com/marketov2/faq/" class=" dropdown-item">FAQ</a>
                                                                            <li id="menu-item-3664" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3664 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                <a href="https://demo.xpeedstudio.com/marketov2/terms-and-conditions/" class=" dropdown-item">Terms and Conditions</a>
                                                                            <li id="menu-item-3665" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-3665 nav-item elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                <a href="#" class=" dropdown-item">
                                                                                    Products<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                                </a>
                                                                                <ul class="elementskit-dropdown elementskit-submenu-panel">
                                                                                    <li id="menu-item-3666" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3666 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                        <a href="https://demo.xpeedstudio.com/marketov2/product-category/" class=" dropdown-item">Product Category</a>
                                                                                    <li id="menu-item-3667" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-3667 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                        <a href="https://demo.xpeedstudio.com/marketov2/product-category-v2/" class=" dropdown-item">Product Category V2</a>
                                                                                </ul>
                                                                        </ul>
                                                                    </li>
                                                                    <li id="menu-item-3669" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-3669 nav-item elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                        <a href="#" class="ekit-menu-nav-link ekit-menu-dropdown-toggle">
                                                                            <span style="background:#83b735; color:#ffffff" class="ekit-menu-badge">
                                                                                New<i style="border-top-color:#83b735" class="ekit-menu-badge-arrow"></i>
                                                                            </span>
                                                                            Shop<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                        </a>
                                                                        <ul class="elementskit-dropdown elementskit-submenu-panel">
                                                                            <li id="menu-item-3668" class="menu-item menu-item-type-post_type menu-item-object-page current-menu-item current_page_item menu-item-3668 nav-item elementskit-mobile-builder-content active" data-vertical-menu=750px>
                                                                                <a href="https://demo.xpeedstudio.com/marketov2/shop/" class=" dropdown-item active">Shop</a>
                                                                            <li id="menu-item-3670" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3670 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                <a href="https://demo.xpeedstudio.com/marketov2/product/kotion-headset/" class=" dropdown-item">Product Details</a>
                                                                        </ul>
                                                                    </li>
                                                                    <li id="menu-item-3584" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-3584 nav-item elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                        <a href="#" class="ekit-menu-nav-link ekit-menu-dropdown-toggle">
                                                                            Blogs<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                        </a>
                                                                        <ul class="elementskit-dropdown elementskit-submenu-panel">
                                                                            <li id="menu-item-3678" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3678 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                <a href="/marketov2/blog" class=" dropdown-item">Blog</a>
                                                                            <li id="menu-item-3599" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3599 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                                <a href="https://demo.xpeedstudio.com/marketov2/seating-collection-inspiration-is-not-enough-for-people-2/" class=" dropdown-item">Blog Single</a>
                                                                        </ul>
                                                                    </li>
                                                                    <li id="menu-item-3600" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3600 nav-item elementskit-dropdown-has top_position elementskit-dropdown-menu-custom_width elementskit-megamenu-has elementskit-mobile-builder-content" data-vertical-menu=1140>
                                                                        <a href="#" class="ekit-menu-nav-link">
                                                                            <span style="background:#fed700; color:#ffffff" class="ekit-menu-badge">
                                                                                Hot<i style="border-top-color:#fed700" class="ekit-menu-badge-arrow"></i>
                                                                            </span>
                                                                            Gallery<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                        </a>
                                                                        <ul class="elementskit-megamenu-panel">
                                                                            <div data-elementor-type="wp-post" data-elementor-id="3672" class="elementor elementor-3672" data-elementor-settings="[]">
                                                                                <div class="elementor-section-wrap">
                                                                                    <section class="elementor-section elementor-top-section elementor-element elementor-element-e54c871 megamenu-v2 elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="e54c871" data-element_type="section" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                        <div class="elementor-container elementor-column-gap-default">
                                                                                            <div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-18493375" data-id="18493375" data-element_type="column" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                    <div class="elementor-element elementor-element-5d163f1d elementor-widget elementor-widget-xs-heading" data-id="5d163f1d" data-element_type="widget" data-widget_type="xs-heading.default">
                                                                                                        <div class="elementor-widget-container">
                                                                                                            <h2 class="xs-heading-sub">Theme Elements</h2>
                                                                                                            <p class="lead">Pages that every website needs.</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div class="elementor-element elementor-element-19c8d3 elementor-widget elementor-widget-xs-woo-page-list-link" data-id="19c8d3" data-element_type="widget" data-widget_type="xs-woo-page-list-link.default">
                                                                                                        <div class="elementor-widget-container">
                                                                                                            <div class="megamenu-v2">
                                                                                                                <ul class="megamenu-list">
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/product-category/accessories/">Accessories</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/product-category/camera/">Camera</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/product-category/headphone/">Headphone</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/product-category/gamepad/">Gamepad</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/product-category/laptop/">Laptop</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/product-category/mobile/">Mobile</a>
                                                                                                                    </li>
                                                                                                                </ul>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-797836c0" data-id="797836c0" data-element_type="column" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                    <div class="elementor-element elementor-element-7a27e73f elementor-widget elementor-widget-xs-heading" data-id="7a27e73f" data-element_type="widget" data-widget_type="xs-heading.default">
                                                                                                        <div class="elementor-widget-container">
                                                                                                            <h2 class="xs-heading-sub">Theme Elements</h2>
                                                                                                            <p class="lead">Pages that every website needs.</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div class="elementor-element elementor-element-674319f6 elementor-widget elementor-widget-xs-woo-page-list-link" data-id="674319f6" data-element_type="widget" data-widget_type="xs-woo-page-list-link.default">
                                                                                                        <div class="elementor-widget-container">
                                                                                                            <div class="megamenu-v2">
                                                                                                                <ul class="megamenu-list">
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/shop">Shop</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/product/fuers-outdoor/">Product Details</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/wishlist/">Wishlist</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/product-category/">Product Categoy</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/blog/">Blog</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="/marketo/seating-collection-inspiration-is-not-enough-for-people-2/">Blog Single</a>
                                                                                                                    </li>
                                                                                                                </ul>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-3b07acfb" data-id="3b07acfb" data-element_type="column" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                    <div class="elementor-element elementor-element-1d4899b6 elementor-widget elementor-widget-xs-heading" data-id="1d4899b6" data-element_type="widget" data-widget_type="xs-heading.default">
                                                                                                        <div class="elementor-widget-container">
                                                                                                            <h2 class="xs-heading-sub">Theme Elements</h2>
                                                                                                            <p class="lead">Pages that every website needs.</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div class="elementor-element elementor-element-53b82d65 elementor-widget elementor-widget-xs-woo-page-list-link" data-id="53b82d65" data-element_type="widget" data-widget_type="xs-woo-page-list-link.default">
                                                                                                        <div class="elementor-widget-container">
                                                                                                            <div class="megamenu-v2">
                                                                                                                <ul class="megamenu-list">
                                                                                                                    <li>
                                                                                                                        <a href="https://demo.xpeedstudio.com/marketov2/product-category-v2/">Product Category V2</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="https://demo.xpeedstudio.com/marketov2/contact/">Contact</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="https://demo.xpeedstudio.com/marketov2/terms-and-conditions/">Terms and Conditions</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="https://demo.xpeedstudio.com/marketov2/faq/">FAQ</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="https://demo.xpeedstudio.com/marketov2/about-us/">About Us</a>
                                                                                                                    </li>
                                                                                                                    <li>
                                                                                                                        <a href="https://demo.xpeedstudio.com/marketov2/?attachment_id=7">woocommerce-placeholder</a>
                                                                                                                    </li>
                                                                                                                </ul>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-1febf676" data-id="1febf676" data-element_type="column">
                                                                                                <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                    <div class="elementor-element elementor-element-52406f2b elementor-widget elementor-widget-xs-heading" data-id="52406f2b" data-element_type="widget" data-widget_type="xs-heading.default">
                                                                                                        <div class="elementor-widget-container">
                                                                                                            <h2 class="xs-heading-sub">Theme Elements</h2>
                                                                                                            <p class="lead">Pages that every website needs.</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div class="elementor-element elementor-element-684df36 elementor-widget elementor-widget-text-editor" data-id="684df36" data-element_type="widget" data-widget_type="text-editor.default">
                                                                                                        <div class="elementor-widget-container">
                                                                                                            <style>
                                                                                                                /*! elementor - v3.5.6 - 28-02-2022 */
                                                                                                                .elementor-widget-text-editor.elementor-drop-cap-view-stacked .elementor-drop-cap {
                                                                                                                    background-color: #818a91;
                                                                                                                    color: #fff
                                                                                                                }

                                                                                                                .elementor-widget-text-editor.elementor-drop-cap-view-framed .elementor-drop-cap {
                                                                                                                    color: #818a91;
                                                                                                                    border: 3px solid;
                                                                                                                    background-color: transparent
                                                                                                                }

                                                                                                                .elementor-widget-text-editor:not(.elementor-drop-cap-view-default) .elementor-drop-cap {
                                                                                                                    margin-top: 8px
                                                                                                                }

                                                                                                                .elementor-widget-text-editor:not(.elementor-drop-cap-view-default) .elementor-drop-cap-letter {
                                                                                                                    width: 1em;
                                                                                                                    height: 1em
                                                                                                                }

                                                                                                                .elementor-widget-text-editor .elementor-drop-cap {
                                                                                                                    float: left;
                                                                                                                    text-align: center;
                                                                                                                    line-height: 1;
                                                                                                                    font-size: 50px
                                                                                                                }

                                                                                                                .elementor-widget-text-editor .elementor-drop-cap-letter {
                                                                                                                    display: inline-block
                                                                                                                }
                                                                                                            </style>
                                                                                                            The Apple Watch, with its inbuilt speaker<br>
                                                                                                            and microphone, gives you the freedom <br>
                                                                                                            to call your friends directly from your<br>wrist. This splash-resistant. 
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </section>
                                                                                </div>
                                                                            </div>
                                                                        </ul>
                                                                    </li>
                                                                    <li id="menu-item-3671" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3671 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                        <a href="#" class="ekit-menu-nav-link">Doakn</a>
                                                                    </li>
                                                                </ul>
                                                                <div class="elementskit-nav-identity-panel">
                                                                    <div class="elementskit-site-title">
                                                                        <a class="elementskit-nav-logo" href="https://demo.xpeedstudio.com/marketov2" target="_self" rel="">
                                                                            <img width="125" height="21" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%2021'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/logo_home-1.png"/>
                                                                            <noscript>
                                                                                <img width="125" height="21" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/logo_home-1.png" class="attachment-full size-full" alt=""/>
                                                                            </noscript>
                                                                        </a>
                                                                    </div>
                                                                    <button class="elementskit-menu-close elementskit-menu-toggler" type="button">X</button>
                                                                </div>
                                                            </div>
                                                            <div class="elementskit-menu-overlay elementskit-menu-offcanvas-elements elementskit-menu-toggler ekit-nav-menu--overlay"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="elementor-column elementor-col-33 elementor-inner-column elementor-element elementor-element-bea39b2" data-id="bea39b2" data-element_type="column">
                                            <div class="elementor-widget-wrap elementor-element-populated">
                                                <div class="elementor-element elementor-element-97ea551 elementor-widget elementor-widget-xs-nav-cart" data-id="97ea551" data-element_type="widget" data-widget_type="xs-nav-cart.default">
                                                    <div class="elementor-widget-container">
                                                        <div class="xs-wish-list-item clearfix">
                                                            <span class="xs-wish-list">
                                                                <a href="https://demo.xpeedstudio.com/marketov2/wishlist/" class="xs-single-wishList">
                                                                    <span class="xs-item-count xswhishlist">0</span>
                                                                    <i class="xsicon xsicon-heart-regular"></i>
                                                                </a>
                                                            </span>
                                                            <div class="xs-miniCart-dropdown">
                                                                <a href="https://demo.xpeedstudio.com/marketov2/cart/" class="xs-single-wishList offset-cart-menu">
                                                                    <span class="xs-item-count highlight xscart">0</span>
                                                                    <i class="xsicon xsicon-shopping-bag"></i>
                                                                </a>
                                                            </div>
                                                            <div class="xs-sidebar-group">
                                                                <div class="xs-overlay bg-black"></div>
                                                                <div class="xs-minicart-widget">
                                                                    <div class="widget-heading media">
                                                                        <h3 class="widget-title align-self-center d-flex">Shopping cart</h3>
                                                                        <div class="media-body">
                                                                            <a href="#" class="close-side-widget">
                                                                                <i class="xsicon xsicon-cross"></i>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <div class="widget woocommerce widget_shopping_cart">
                                                                        <div class="widget_shopping_cart_content"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </section>
                <section class="elementor-section elementor-top-section elementor-element elementor-element-b6991a5 elementor-section-full_width xs_vertical_cat_menu elementor-hidden-phone animated-fast elementor-section-height-default elementor-section-height-default elementor-invisible" data-id="b6991a5" data-element_type="section" data-settings="{&quot;animation&quot;:&quot;fadeIn&quot;}">
                    <div class="elementor-container elementor-column-gap-no">
                        <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-b6fe4e1" data-id="b6fe4e1" data-element_type="column">
                            <div class="elementor-widget-wrap elementor-element-populated">
                                <section class="elementor-section elementor-inner-section elementor-element elementor-element-8324410 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="8324410" data-element_type="section">
                                    <div class="elementor-container elementor-column-gap-default">
                                        <div class="elementor-column elementor-col-33 elementor-inner-column elementor-element elementor-element-a48d572" data-id="a48d572" data-element_type="column">
                                            <div class="elementor-widget-wrap elementor-element-populated">
                                                <div class="elementor-element elementor-element-a49ffa0 elementor-widget elementor-widget-ekit-vertical-menu" data-id="a49ffa0" data-element_type="widget" data-widget_type="ekit-vertical-menu.default">
                                                    <div class="elementor-widget-container">
                                                        <div class="ekit-wid-con">
                                                            <div class="ekit-vertical-main-menu-wraper ekit-vertical-main-menu-on-click  badge-position-left">
                                                                <a href="#" class="ekit-vertical-menu-tigger">
                                                                    <i class="xsicon xsicon-bars vertical-menu-right-icon vertical-menu-icon"></i>
                                                                    <span class="ekit-vertical-menu-tigger-title">All Categories</span>
                                                                    <i class="xsicon xsicon-angle-down vertical-menu-left-icon vertical-menu-icon"></i>
                                                                </a>
                                                                <div id="ekit-vertical-megamenu-a49ffa0" class="ekit-vertical-menu-container">
                                                                    <ul id="vertical-main-menu" class="ekit-vertical-navbar-nav">
                                                                        <li id="menu-item-3608" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3608 nav-item elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width elementskit-megamenu-has elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="#" class="ekit-menu-nav-link">
                                                                                Electronics<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                            </a>
                                                                            <ul class="elementskit-megamenu-panel">
                                                                                <div data-elementor-type="wp-post" data-elementor-id="3685" class="elementor elementor-3685" data-elementor-settings="[]">
                                                                                    <div class="elementor-section-wrap">
                                                                                        <section class="elementor-section elementor-top-section elementor-element elementor-element-5201d5fb elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="5201d5fb" data-element_type="section" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                            <div class="elementor-container elementor-column-gap-default">
                                                                                                <div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-235edf66" data-id="235edf66" data-element_type="column">
                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                        <div class="elementor-element elementor-element-6977554a elementor-widget elementor-widget-xs-woo-cats-list-link" data-id="6977554a" data-element_type="widget" data-widget_type="xs-woo-cats-list-link.default">
                                                                                                            <div class="elementor-widget-container">
                                                                                                                <div class="block-product-cate-wraper">
                                                                                                                    <h3 class="block-cate-header">Accessories</h3>
                                                                                                                    <ul class="nav flex-column">
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/3d-glass/google-glass/">Google Glass</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/headphone/">Headphone</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/laptop/">Laptop</a>
                                                                                                                        </li>
                                                                                                                    </ul>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div class="elementor-element elementor-element-572ae0d8 elementor-widget elementor-widget-xs-woo-cats-list-link" data-id="572ae0d8" data-element_type="widget" data-widget_type="xs-woo-cats-list-link.default">
                                                                                                            <div class="elementor-widget-container">
                                                                                                                <div class="block-product-cate-wraper">
                                                                                                                    <h3 class="block-cate-header">Tops</h3>
                                                                                                                    <ul class="nav flex-column">
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/3d-glass/google-glass/">Google Glass</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/headphone/">Headphone</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/laptop/">Laptop</a>
                                                                                                                        </li>
                                                                                                                    </ul>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-b9924c4" data-id="b9924c4" data-element_type="column">
                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                        <div class="elementor-element elementor-element-3c8fc817 elementor-widget elementor-widget-xs-woo-cats-list-link" data-id="3c8fc817" data-element_type="widget" data-widget_type="xs-woo-cats-list-link.default">
                                                                                                            <div class="elementor-widget-container">
                                                                                                                <div class="block-product-cate-wraper">
                                                                                                                    <h3 class="block-cate-header">Bottoms</h3>
                                                                                                                    <ul class="nav flex-column">
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/projector/">Projector</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/speaker/">Speaker</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/light/">Light</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                    </ul>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div class="elementor-element elementor-element-628504dc elementor-widget elementor-widget-xs-woo-cats-list-link" data-id="628504dc" data-element_type="widget" data-widget_type="xs-woo-cats-list-link.default">
                                                                                                            <div class="elementor-widget-container">
                                                                                                                <div class="block-product-cate-wraper">
                                                                                                                    <h3 class="block-cate-header">Hot Categories</h3>
                                                                                                                    <ul class="nav flex-column">
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/projector/">Projector</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/speaker/">Speaker</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/light/">Light</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                    </ul>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div class="elementor-column elementor-col-33 elementor-top-column elementor-element elementor-element-3cae6ecf" data-id="3cae6ecf" data-element_type="column">
                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                        <div class="elementor-element elementor-element-52e7cacd elementor-widget elementor-widget-xs-woo-cats-list-link" data-id="52e7cacd" data-element_type="widget" data-widget_type="xs-woo-cats-list-link.default">
                                                                                                            <div class="elementor-widget-container">
                                                                                                                <div class="block-product-cate-wraper">
                                                                                                                    <h3 class="block-cate-header">Bottoms</h3>
                                                                                                                    <ul class="nav flex-column">
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/projector/">Projector</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/mobile/">Mobile</a>
                                                                                                                        </li>
                                                                                                                    </ul>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <div class="elementor-element elementor-element-363f710f elementor-widget elementor-widget-xs-woo-cats-list-link" data-id="363f710f" data-element_type="widget" data-widget_type="xs-woo-cats-list-link.default">
                                                                                                            <div class="elementor-widget-container">
                                                                                                                <div class="block-product-cate-wraper">
                                                                                                                    <h3 class="block-cate-header">Outwear</h3>
                                                                                                                    <ul class="nav flex-column">
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/projector/">Projector</a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href=""></a>
                                                                                                                        </li>
                                                                                                                        <li class="nav-item">
                                                                                                                            <a class="nav-link" href="https://demo.xpeedstudio.com/marketov2/product-category/mobile/">Mobile</a>
                                                                                                                        </li>
                                                                                                                    </ul>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </section>
                                                                                    </div>
                                                                                </div>
                                                                            </ul>
                                                                        </li>
                                                                        <li id="menu-item-3611" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3611 nav-item elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width elementskit-megamenu-has elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="#" class="ekit-menu-nav-link">
                                                                                Men &#8217;s Fashion<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                            </a>
                                                                            <ul class="elementskit-megamenu-panel">
                                                                                <div data-elementor-type="wp-post" data-elementor-id="3690" class="elementor elementor-3690" data-elementor-settings="[]">
                                                                                    <div class="elementor-section-wrap">
                                                                                        <section class="elementor-section elementor-top-section elementor-element elementor-element-54002cb2 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="54002cb2" data-element_type="section" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                            <div class="elementor-container elementor-column-gap-no">
                                                                                                <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-5800eee" data-id="5800eee" data-element_type="column">
                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                        <section class="elementor-section elementor-inner-section elementor-element elementor-element-4268f217 elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="4268f217" data-element_type="section">
                                                                                                            <div class="elementor-container elementor-column-gap-default">
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-5d1e583e" data-id="5d1e583e" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-11618089 elementor-widget elementor-widget-elementskit-heading" data-id="11618089" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">furniture</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-254f7ee7 elementor-widget elementor-widget-elementskit-page-list" data-id="254f7ee7" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Dining Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Counter &amp;Bar Stools</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Occasional Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Daybeds &amp;Chaises</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-7686a311 elementor-widget elementor-widget-elementskit-heading" data-id="7686a311" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">lightings</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-54ad3c17 elementor-widget elementor-widget-elementskit-page-list" data-id="54ad3c17" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Benches &amp;Ottomans</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Dining Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Coffee &amp;Cocktail Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Consoles &amp;Desks</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-2216bfef" data-id="2216bfef" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-3445e427 elementor-widget elementor-widget-elementskit-heading" data-id="3445e427" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">accessories</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-893169 elementor-widget elementor-widget-elementskit-page-list" data-id="893169" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Cabinets &amp;Bookcases</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Screens</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Outdoor Furniture</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Floor Samples</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-5977eb9d elementor-widget elementor-widget-elementskit-heading" data-id="5977eb9d" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">Texture lab</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-c01b4c2 elementor-widget elementor-widget-elementskit-page-list" data-id="c01b4c2" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Side Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Beside Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Sideboards &amp;Drawers</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Lounge Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-671577f1" data-id="671577f1" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-d892ca1 elementor-widget elementor-widget-elementskit-heading" data-id="d892ca1" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">what’s new</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-99945d2 elementor-widget elementor-widget-elementskit-page-list" data-id="99945d2" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Benches &amp;Ottomans</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Cocktail Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Dining Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Consoles &amp;Desks</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-2dce9452" data-id="2dce9452" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-436c57ad elementor-widget elementor-widget-elementskit-heading" data-id="436c57ad" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">Flash sales</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-7aad8600 elementor-widget elementor-widget-elementskit-page-list" data-id="7aad8600" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Easy to Customise</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Simple and intuitive</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Highly customisable</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Coding skills</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </section>
                                                                                                        <div class="elementor-element elementor-element-3ecb6bfd elementor-widget__width-auto elementor-absolute elementor-hidden-tablet elementor-hidden-phone elementor-widget elementor-widget-image" data-id="3ecb6bfd" data-element_type="widget" data-settings="{&quot;_position&quot;:&quot;absolute&quot;}" data-widget_type="image.default">
                                                                                                            <div class="elementor-widget-container">
                                                                                                                <img width="436" height="318" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20436%20318'%3E%3C/svg%3E" class="attachment-large size-large" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/sofa.png"/>
                                                                                                                <noscript>
                                                                                                                    <img width="436" height="318" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/sofa.png" class="attachment-large size-large" alt=""/>
                                                                                                                </noscript>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </section>
                                                                                    </div>
                                                                                </div>
                                                                            </ul>
                                                                        </li>
                                                                        <li id="menu-item-3612" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3612 nav-item elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width elementskit-megamenu-has elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="#" class="ekit-menu-nav-link">
                                                                                Women &#8217;s Fashion<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                            </a>
                                                                            <ul class="elementskit-megamenu-panel">
                                                                                <div data-elementor-type="wp-post" data-elementor-id="3697" class="elementor elementor-3697" data-elementor-settings="[]">
                                                                                    <div class="elementor-section-wrap">
                                                                                        <section class="elementor-section elementor-top-section elementor-element elementor-element-b76f6e8 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="b76f6e8" data-element_type="section" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                            <div class="elementor-container elementor-column-gap-no">
                                                                                                <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-456cef3f" data-id="456cef3f" data-element_type="column">
                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                        <section class="elementor-section elementor-inner-section elementor-element elementor-element-194f1349 elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="194f1349" data-element_type="section">
                                                                                                            <div class="elementor-container elementor-column-gap-default">
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-246df8c9" data-id="246df8c9" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-4bea6322 elementor-widget elementor-widget-image" data-id="4bea6322" data-element_type="widget" data-widget_type="image.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <img width="90" height="100" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2090%20100'%3E%3C/svg%3E" class="attachment-large size-large" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/yearphone.png"/>
                                                                                                                                <noscript>
                                                                                                                                    <img width="90" height="100" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/yearphone.png" class="attachment-large size-large" alt=""/>
                                                                                                                                </noscript>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-24c40deb elementor-widget elementor-widget-elementskit-heading" data-id="24c40deb" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--title elementskit-section-title ">Electronics
</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-155d3afd elementor-widget elementor-widget-elementskit-page-list" data-id="155d3afd" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Easy to Customise</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Simple and intuitive</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Highly customisable</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Coding skills</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-4b5902e ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Easy to Customise</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-167545f4" data-id="167545f4" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-1c6c4404 elementor-widget elementor-widget-image" data-id="1c6c4404" data-element_type="widget" data-widget_type="image.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <img width="75" height="100" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2075%20100'%3E%3C/svg%3E" class="attachment-large size-large" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/IP_camera.png"/>
                                                                                                                                <noscript>
                                                                                                                                    <img width="75" height="100" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/IP_camera.png" class="attachment-large size-large" alt=""/>
                                                                                                                                </noscript>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-5a2a4520 elementor-widget elementor-widget-elementskit-heading" data-id="5a2a4520" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--title elementskit-section-title ">Security Tools
</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-1490c32f elementor-widget elementor-widget-elementskit-page-list" data-id="1490c32f" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Benches &amp;Ottomans</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Dining Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Coffee &amp;Cocktail Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Consoles &amp;Desks</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-4b5902e ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Cocktail Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-1acf0bcb" data-id="1acf0bcb" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-68408a68 elementor-widget elementor-widget-image" data-id="68408a68" data-element_type="widget" data-widget_type="image.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <img width="97" height="100" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2097%20100'%3E%3C/svg%3E" class="attachment-large size-large" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/travel_usb.png"/>
                                                                                                                                <noscript>
                                                                                                                                    <img width="97" height="100" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/travel_usb.png" class="attachment-large size-large" alt=""/>
                                                                                                                                </noscript>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-1f313d70 elementor-widget elementor-widget-elementskit-heading" data-id="1f313d70" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--title elementskit-section-title ">Brand Gadget
</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-5cb4ce66 elementor-widget elementor-widget-elementskit-page-list" data-id="5cb4ce66" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Side Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Beside Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Sideboards &amp;Drawers</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Lounge Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-4b5902e ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Consoles &amp;Desks</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-7b03bd78" data-id="7b03bd78" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-53228ead elementor-widget elementor-widget-image" data-id="53228ead" data-element_type="widget" data-widget_type="image.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <img width="93" height="100" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2093%20100'%3E%3C/svg%3E" class="attachment-large size-large" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/wristband.png"/>
                                                                                                                                <noscript>
                                                                                                                                    <img width="93" height="100" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/wristband.png" class="attachment-large size-large" alt=""/>
                                                                                                                                </noscript>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-566a4a7f elementor-widget elementor-widget-elementskit-heading" data-id="566a4a7f" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--title elementskit-section-title ">Smartwatch
</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-12a2bace elementor-widget elementor-widget-elementskit-page-list" data-id="12a2bace" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Dining Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Counter &amp;Bar Stools</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Occasional Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Daybeds &amp;Chaises</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-4b5902e ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Benches &amp;Ottomans</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </section>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </section>
                                                                                    </div>
                                                                                </div>
                                                                            </ul>
                                                                        </li>
                                                                        <li id="menu-item-3613" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-3613 nav-item elementskit-dropdown-has relative_position elementskit-dropdown-menu-default_width elementskit-megamenu-has elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="#" class="ekit-menu-nav-link">
                                                                                Office &#038;Security<i class="icon icon-down-arrow1 elementskit-submenu-indicator"></i>
                                                                            </a>
                                                                            <ul class="elementskit-megamenu-panel">
                                                                                <div data-elementor-type="wp-post" data-elementor-id="3706" class="elementor elementor-3706" data-elementor-settings="[]">
                                                                                    <div class="elementor-section-wrap">
                                                                                        <section class="elementor-section elementor-top-section elementor-element elementor-element-7fb45ac7 elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="7fb45ac7" data-element_type="section" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
                                                                                            <div class="elementor-container elementor-column-gap-no">
                                                                                                <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-56492565" data-id="56492565" data-element_type="column">
                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                        <section class="elementor-section elementor-inner-section elementor-element elementor-element-7490f7a6 elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="7490f7a6" data-element_type="section">
                                                                                                            <div class="elementor-container elementor-column-gap-default">
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-3429abc7" data-id="3429abc7" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-487980d5 elementor-widget elementor-widget-elementskit-heading" data-id="487980d5" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">furniture</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-fee8d8a elementor-widget elementor-widget-elementskit-page-list" data-id="fee8d8a" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Dining Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Counter &amp;Bar Stools</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Occasional Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Daybeds &amp;Chaises</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-d7b129e elementor-widget elementor-widget-elementskit-heading" data-id="d7b129e" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">lightings</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-4d6b6499 elementor-widget elementor-widget-elementskit-page-list" data-id="4d6b6499" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Benches &amp;Ottomans</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Dining Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Coffee &amp;Cocktail Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Consoles &amp;Desks</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-3f666da" data-id="3f666da" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-247e7426 elementor-widget elementor-widget-elementskit-heading" data-id="247e7426" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">accessories</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-3d5a93bd elementor-widget elementor-widget-elementskit-page-list" data-id="3d5a93bd" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Cabinets &amp;Bookcases</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Screens</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Outdoor Furniture</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Floor Samples</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-7d1fdcb2 elementor-widget elementor-widget-elementskit-heading" data-id="7d1fdcb2" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">Texture lab</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-10c9405d elementor-widget elementor-widget-elementskit-page-list" data-id="10c9405d" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Side Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Beside Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Sideboards &amp;Drawers</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Lounge Chairs</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-6c4dcc6f" data-id="6c4dcc6f" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap elementor-element-populated">
                                                                                                                        <div class="elementor-element elementor-element-7dcbe5f3 elementor-widget elementor-widget-elementskit-heading" data-id="7dcbe5f3" data-element_type="widget" data-widget_type="elementskit-heading.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                                                                                                                        <h2 class="ekit-heading--subtitle elementskit-section-subtitle  elementskit-style-border">what’s new</h2>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                        <div class="elementor-element elementor-element-607f56eb elementor-widget elementor-widget-elementskit-page-list" data-id="607f56eb" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                                                                                                                            <div class="elementor-widget-container">
                                                                                                                                <div class="ekit-wid-con">
                                                                                                                                    <div class="elementor-icon-list-items ">
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-18cb473 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Benches &amp;Ottomans</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-3b0de6f ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Cocktail Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2517b40 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Dining Tables</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                        <div class="elementor-icon-list-item   ">
                                                                                                                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-195fca0 ekit_badge_left">
                                                                                                                                                <div class="ekit_page_list_content">
                                                                                                                                                    <span class="elementor-icon-list-text">
                                                                                                                                                        <span class="ekit_page_list_title_title">Consoles &amp;Desks</span>
                                                                                                                                                    </span>
                                                                                                                                                </div>
                                                                                                                                            </a>
                                                                                                                                        </div>
                                                                                                                                    </div>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </div>
                                                                                                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-6f2e6c5f" data-id="6f2e6c5f" data-element_type="column">
                                                                                                                    <div class="elementor-widget-wrap"></div>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </section>
                                                                                                        <div class="elementor-element elementor-element-7b548343 elementor-widget__width-auto elementor-absolute elementor-hidden-tablet elementor-hidden-phone elementor-widget elementor-widget-image" data-id="7b548343" data-element_type="widget" data-settings="{&quot;_position&quot;:&quot;absolute&quot;}" data-widget_type="image.default">
                                                                                                            <div class="elementor-widget-container">
                                                                                                                <img width="441" height="350" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20441%20350'%3E%3C/svg%3E" class="attachment-large size-large" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/hand.png"/>
                                                                                                                <noscript>
                                                                                                                    <img width="441" height="350" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2021/10/hand.png" class="attachment-large size-large" alt=""/>
                                                                                                                </noscript>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </section>
                                                                                    </div>
                                                                                </div>
                                                                            </ul>
                                                                        </li>
                                                                        <li id="menu-item-3602" class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-3602 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="https://demo.xpeedstudio.com/marketov2/product-category/camera/" class="ekit-menu-nav-link">Camera</a>
                                                                        </li>
                                                                        <li id="menu-item-3603" class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-3603 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="https://demo.xpeedstudio.com/marketov2/product-category/drone/" class="ekit-menu-nav-link">Drone</a>
                                                                        </li>
                                                                        <li id="menu-item-3604" class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-3604 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="https://demo.xpeedstudio.com/marketov2/product-category/gamepad/" class="ekit-menu-nav-link">Gamepad</a>
                                                                        </li>
                                                                        <li id="menu-item-3605" class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-3605 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="https://demo.xpeedstudio.com/marketov2/product-category/mobile/" class="ekit-menu-nav-link">Mobile</a>
                                                                        </li>
                                                                        <li id="menu-item-3606" class="menu-item menu-item-type-taxonomy menu-item-object-product_cat menu-item-3606 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="https://demo.xpeedstudio.com/marketov2/product-category/speaker/" class="ekit-menu-nav-link">Speaker</a>
                                                                        </li>
                                                                        <li id="menu-item-3607" class="menu-item menu-item-type-post_type menu-item-object-mega_menu menu-item-3607 nav-item elementskit-mobile-builder-content" data-vertical-menu=750px>
                                                                            <a href="https://demo.xpeedstudio.com/marketov2/blog/mega_menu/all-categories/" class="ekit-menu-nav-link">All Categories</a>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="elementor-column elementor-col-33 elementor-inner-column elementor-element elementor-element-2816d5a" data-id="2816d5a" data-element_type="column">
                                            <div class="elementor-widget-wrap elementor-element-populated">
                                                <div class="elementor-element elementor-element-725fec0 elementor-widget elementor-widget-xs-nav-serch" data-id="725fec0" data-element_type="widget" data-widget_type="xs-nav-serch.default">
                                                    <div class="elementor-widget-container">
                                                        <div class="xs-ele-search-form-area">
                                                            <form class="xs-navbar-search xs-ele-nav-search-widget xs-navbar-search-wrapper elementor-search-wrapper" action="https://demo.xpeedstudio.com/marketov2/" method="get" id="header_form_725fec0">
                                                                <div class="input-group">
                                                                    <input type="search" name="s" class="form-control" placeholder="Find your product">
                                                                    <div class="xs-category-select-wraper">
                                                                        <i class="xs-spin"></i>
                                                                        <select class="xs-ele-nav-search-select" name="product_cat">
                                                                            <option value="-1">All Categories</option>
                                                                            <option class="child-category" value="50">Portable</option>
                                                                            <option class="" value="46">Watch</option>
                                                                            <option class="" value="44">Speaker</option>
                                                                            <option class="" value="41">Projector</option>
                                                                            <option class="" value="38">Mobile</option>
                                                                            <option class="" value="34">Light</option>
                                                                            <option class="" value="32">Laptop</option>
                                                                            <option class="" value="31">Headphone</option>
                                                                            <option class="child-category" value="29">Google Glass</option>
                                                                            <option class="" value="27">Gamepad</option>
                                                                            <option class="" value="23">Drone</option>
                                                                            <option class="" value="21">Camera</option>
                                                                            <option class="" value="19">3d Glass</option>
                                                                            <option class="" value="15">Uncategorized</option>
                                                                        </select>
                                                                    </div>
                                                                    <div class="input-group-btn elementor-search-button">
                                                                        <input type="hidden" id="search-param" name="post_type" value="product">
                                                                        <button type="submit" class="btn btn-primary">
                                                                            <i class="xsicon xsicon-search"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="elementor-column elementor-col-33 elementor-inner-column elementor-element elementor-element-d9f1f10" data-id="d9f1f10" data-element_type="column">
                                            <div class="elementor-widget-wrap elementor-element-populated">
                                                <div class="elementor-element elementor-element-fd5a24a elementor-widget elementor-widget-xs-nav-button" data-id="fd5a24a" data-element_type="widget" data-widget_type="xs-nav-button.default">
                                                    <div class="elementor-widget-container">
                                                        <div class="xs-navDown xs-ele-nav-button">
                                                            <a href="https://demo.xpeedstudio.com/marketo/product/voyo-vbook-v3pro/" target="_blank" rel="nofollow" class="btn btn-outline-primary btn-lg">
                                                                <strong>BLACK FRIDAY</strong>
                                                                <span>Get 45% Off! </span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
        <div class="xs-breadcumb">
            <div class="container">
                <nav aria-label="breadcrumb-shop">
                    <ol class="breadcrumb-shop">
                        <li class="breadcrumb-item">
                            <a href="https://demo.xpeedstudio.com/marketov2">Home</a>
                        </li>
                        <li class="breadcrumb-item">Shop</li>
                    </ol>
                </nav>
            </div>
        </div>
        <div class="xs-section-padding ">
            <div class="shop-archive">
                <div class="container">
                    <div class="row">
                        <div id="primary" class="content-area col-md-12">
                            <div class="media-body xs-shop-notice mb-3"></div>
                            <div class="woocommerce-products-header">
                                <h5 class="woocommerce-products-header__title page-title">Shop</h5>
                                <div class="media woocommerce-filter-content">
                                    <div class="media-body xs-before-shop-loop">
                                        <div class="woocommerce-notices-wrapper"></div>
                                        <p class="before-default-sorting">Sort by</p>
                                        <form class="woocommerce-ordering" method="get">
                                            <select name="orderby" class="orderby" aria-label="Shop order">
                                                <option value="menu_order" selected='selected'>Sorting</option>
                                                <option value="popularity">Popularity</option>
                                                <option value="rating">Average rating</option>
                                                <option value="date">Newness</option>
                                                <option value="price">Price: low to high</option>
                                                <option value="price-desc">Price: high to low</option>
                                            </select>
                                            <input type="hidden" name="paged" value="1"/>
                                        </form>
                                    </div>
                                    <div class="media">
                                        <h6>View</h6>
                                        <ul class="nav nav-tabs shop-view-nav" id="myTab" role="tablist">
                                            <li class="nav-item">
                                                <a class="nav-link active" id="grid-tab" data-toggle="tab" href="#grid" role="tab" aria-controls="grid" aria-selected="true">
                                                    <i class="xsicon xsicon-th"></i>
                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" id="list-tab" data-toggle="tab" href="#list" role="tab" aria-controls="list" aria-selected="false">
                                                    <i class="xsicon xsicon-align-justify"></i>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div class="feature-product-v4">
                                <div class="row">
                                    <div class="col-md-6 xs-list-view">
                                        <div class="xs-product-widget media xs-md-20">
                                            <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="3D Glass" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-Virtual-Reality-1.jpg"/>
                                            <noscript>
                                                <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-Virtual-Reality-1.jpg" class="attachment-125x125 size-125x125" alt="3D Glass"/>
                                            </noscript>
                                            <div class="media-body align-self-center product-widget-content">
                                                <div class="xs-product-header media xs-wishlist">
                                                    <div class="star-rating" role="img" aria-label="Rated 4.33 out of 5">
                                                        <span style="width:86.6%">
                                                            Rated <strong class="rating">4.33</strong>
                                                            out of 5
                                                        </span>
                                                    </div>
                                                    <div class="yith-wcwl-add-to-wishlist add-to-wishlist-22  wishlist-fragment on-first-load" data-fragment-ref="22" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:22,&quot;parent_product_id&quot;:22,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                        <div class="yith-wcwl-add-button">
                                                            <a href="?add_to_wishlist=22&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="22" data-product-type="simple" data-original-product-id="22" data-title="Add to wishlist" rel="nofollow">
                                                                <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                <span>Add to wishlist</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <h4 class="product-title">
                                                    <a href="https://demo.xpeedstudio.com/marketov2/product/3d-glass/">3D Glass</a>
                                                </h4>
                                                <span class="price">
                                                    <del aria-hidden="true">
                                                        <span class="woocommerce-Price-amount amount">
                                                            <bdi>
                                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                640.00
                                                            </bdi>
                                                        </span>
                                                    </del>
                                                    <ins>
                                                        <span class="woocommerce-Price-amount amount">
                                                            <bdi>
                                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                540.00
                                                            </bdi>
                                                        </span>
                                                    </ins>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-lg-3 col-sm- col- product type-product post-22 status-publish first outofstock product_cat-3d-glass has-post-thumbnail sale featured shipping-taxable purchasable product-type-simple">
                                        <div class="xs-single-product">
                                            <div class="xs-product-wraper text-center">
                                                <a href="https://demo.xpeedstudio.com/marketov2/product/3d-glass/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                                                    <span class="onsale">Sale!</span>
                                                    <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/3d-glass/">
                                                        <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-Virtual-Reality-1.jpg"/>
                                                        <noscript>
                                                            <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-Virtual-Reality-1.jpg" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                                                        </noscript>
                                                    </a>
                                                    <ul class="product-item-meta">
                                                        <li class="xs-cart-wrapper">
                                                            <a href="https://demo.xpeedstudio.com/marketov2/product/3d-glass/" data-quantity="1" class="button product_type_simple" data-product_id="22" data-product_sku="" aria-label="Read more about &ldquo;3D Glass&rdquo;" rel="nofollow">Read more</a>
                                                        </li>
                                                        <li>
                                                            <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-22">
                                                                <i class="xsicon xsicon-eye"></i>
                                                            </a>
                                                        </li>
                                                        <li class="xs-wishlist-wrapper xs-wishlist">
                                                            <div class="yith-wcwl-add-to-wishlist add-to-wishlist-22  wishlist-fragment on-first-load" data-fragment-ref="22" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:22,&quot;parent_product_id&quot;:22,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                                <div class="yith-wcwl-add-button">
                                                                    <a href="?add_to_wishlist=22&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="22" data-product-type="simple" data-original-product-id="22" data-title="Add to wishlist" rel="nofollow">
                                                                        <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                        <span>Add to wishlist</span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </li>
                                                        <li class="xs-wishlist-wrapper xs-wishlist product">
                                                            <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=22" class="add-to-compare-link compare" data-product_id="22">
                                                                <i class="xsicon xsicon-repeat"></i>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                    <div class="xs-product-content">
                                                        <h4 class="product-title">
                                                            <a href="https://demo.xpeedstudio.com/marketov2/product/3d-glass/">3D Glass</a>
                                                        </h4>
                                                        <span class="price">
                                                            <del aria-hidden="true">
                                                                <span class="woocommerce-Price-amount amount">
                                                                    <bdi>
                                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                        640.00
                                                                    </bdi>
                                                                </span>
                                                            </del>
                                                            <ins>
                                                                <span class="woocommerce-Price-amount amount">
                                                                    <bdi>
                                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                        540.00
                                                                    </bdi>
                                                                </span>
                                                            </ins>
                                                        </span>
                                                    </div>
                                                    <div class="xs-product-content">
                                                </a>
                                            </div>
                                        </div>
                                        <div class="list-group xs-list-group xs-product-content">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget,&hellip;</div>
                                        <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-22 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                            <div class="modal-dialog" role="document">
                                                <div class="modal-content">
                                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                        <span class="xsicon xsicon-cross"></span>
                                                    </button>
                                                    <div class="container">
                                                        <div class="row">
                                                            <div class="col-md-6">
                                                                <div class="images">
                                                                    <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-Virtual-Reality-1.jpg"/>
                                                                    <noscript>
                                                                        <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-Virtual-Reality-1.jpg" class="attachment-full size-full wp-post-image" alt=""/>
                                                                    </noscript>
                                                                </div>
                                                            </div>
                                                            <div class="col-md-6 align-self-center">
                                                                <div class="summary-content entry-summary">
                                                                    <h1 class="product_title entry-title">3D Glass</h1>
                                                                    <div class="product_meta">
                                                                        <span class="posted_in">
                                                                            Category: <a href="https://demo.xpeedstudio.com/marketov2/product-category/3d-glass/" rel="tag">3d Glass</a>
                                                                        </span>
                                                                    </div>
                                                                    <div class="woocommerce-product-rating">
                                                                        <div class="star-rating" role="img" aria-label="Rated 4.33 out of 5">
                                                                            <span style="width:86.6%">
                                                                                Rated <strong class="rating">4.33</strong>
                                                                                out of 5 based on <span class="rating">3</span>
                                                                                customer ratings
                                                                            </span>
                                                                        </div>
                                                                        <a href="#reviews" class="woocommerce-review-link" rel="nofollow">
                                                                            (<span class="count">3</span>
                                                                            customer reviews)
                                                                        </a>
                                                                    </div>
                                                                    <div class="woocommerce-product-details__short-description">
                                                                        <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>
                                                                    </div>
                                                                    <p class="price">
                                                                        <del aria-hidden="true">
                                                                            <span class="woocommerce-Price-amount amount">
                                                                                <bdi>
                                                                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                                    640.00
                                                                                </bdi>
                                                                            </span>
                                                                        </del>
                                                                        <ins>
                                                                            <span class="woocommerce-Price-amount amount">
                                                                                <bdi>
                                                                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                                    540.00
                                                                                </bdi>
                                                                            </span>
                                                                        </ins>
                                                                    </p>
                                                                    <p class="stock out-of-stock">Out of stock</p>
                                                                    <div class="yith-wcwl-add-to-wishlist add-to-wishlist-22  wishlist-fragment on-first-load" data-fragment-ref="22" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:22,&quot;parent_product_id&quot;:22,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                                        <div class="yith-wcwl-add-button">
                                                                            <a href="?add_to_wishlist=22&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="22" data-product-type="simple" data-original-product-id="22" data-title="Add to wishlist" rel="nofollow">
                                                                                <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                                <span>Add to wishlist</span>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=22" class="compare button" data-product_id="22" rel="nofollow">Compare</a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 xs-list-view">
                                    <div class="xs-product-widget media xs-md-20">
                                        <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="3D VR Glass" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-1.jpg"/>
                                        <noscript>
                                            <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-1.jpg" class="attachment-125x125 size-125x125" alt="3D VR Glass"/>
                                        </noscript>
                                        <div class="media-body align-self-center product-widget-content">
                                            <div class="xs-product-header media xs-wishlist">
                                                <div class="star-rating" role="img" aria-label="Rated 1.00 out of 5">
                                                    <span style="width:20%">
                                                        Rated <strong class="rating">1.00</strong>
                                                        out of 5
                                                    </span>
                                                </div>
                                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-67  wishlist-fragment on-first-load" data-fragment-ref="67" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:67,&quot;parent_product_id&quot;:67,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                    <div class="yith-wcwl-add-button">
                                                        <a href="?add_to_wishlist=67&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="67" data-product-type="simple" data-original-product-id="67" data-title="Add to wishlist" rel="nofollow">
                                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                            <span>Add to wishlist</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <h4 class="product-title">
                                                <a href="https://demo.xpeedstudio.com/marketov2/product/3d-vr-glass/">3D VR Glass</a>
                                            </h4>
                                            <span class="price">
                                                <span class="woocommerce-Price-amount amount">
                                                    <bdi>
                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                        245.00
                                                    </bdi>
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-lg-3 col-sm- col- product type-product post-67 status-publish instock product_cat-3d-glass product_cat-camera product_cat-google-glass has-post-thumbnail shipping-taxable purchasable product-type-simple">
                                    <div class="xs-single-product">
                                        <div class="xs-product-wraper text-center">
                                            <a href="https://demo.xpeedstudio.com/marketov2/product/3d-vr-glass/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                                                <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/3d-vr-glass/">
                                                    <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-1.jpg"/>
                                                    <noscript>
                                                        <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-1.jpg" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                                                    </noscript>
                                                </a>
                                                <ul class="product-item-meta">
                                                    <li class="xs-cart-wrapper">
                                                        <a href="?add-to-cart=67" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="67" data-product_sku="" aria-label="Add &ldquo;3D VR Glass&rdquo; to your cart" rel="nofollow">Add to cart</a>
                                                    </li>
                                                    <li>
                                                        <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-67">
                                                            <i class="xsicon xsicon-eye"></i>
                                                        </a>
                                                    </li>
                                                    <li class="xs-wishlist-wrapper xs-wishlist">
                                                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-67  wishlist-fragment on-first-load" data-fragment-ref="67" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:67,&quot;parent_product_id&quot;:67,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                            <div class="yith-wcwl-add-button">
                                                                <a href="?add_to_wishlist=67&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="67" data-product-type="simple" data-original-product-id="67" data-title="Add to wishlist" rel="nofollow">
                                                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                    <span>Add to wishlist</span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </li>
                                                    <li class="xs-wishlist-wrapper xs-wishlist product">
                                                        <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=67" class="add-to-compare-link compare" data-product_id="67">
                                                            <i class="xsicon xsicon-repeat"></i>
                                                        </a>
                                                    </li>
                                                </ul>
                                                <div class="xs-product-content">
                                                    <h4 class="product-title">
                                                        <a href="https://demo.xpeedstudio.com/marketov2/product/3d-vr-glass/">3D VR Glass</a>
                                                    </h4>
                                                    <span class="price">
                                                        <span class="woocommerce-Price-amount amount">
                                                            <bdi>
                                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                245.00
                                                            </bdi>
                                                        </span>
                                                    </span>
                                                </div>
                                                <div class="xs-product-content">
                                            </a>
                                        </div>
                                    </div>
                                    <div class="list-group xs-list-group xs-product-content">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget,&hellip;</div>
                                    <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-67 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                        <div class="modal-dialog" role="document">
                                            <div class="modal-content">
                                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                    <span class="xsicon xsicon-cross"></span>
                                                </button>
                                                <div class="container">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="images">
                                                                <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-1.jpg"/>
                                                                <noscript>
                                                                    <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/3D-VR-Glass-1.jpg" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                                                </noscript>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6 align-self-center">
                                                            <div class="summary-content entry-summary">
                                                                <h1 class="product_title entry-title">3D VR Glass</h1>
                                                                <div class="product_meta">
                                                                    <span class="posted_in">
                                                                        Categories: <a href="https://demo.xpeedstudio.com/marketov2/product-category/3d-glass/" rel="tag">3d Glass</a>
                                                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/camera/" rel="tag">Camera</a>
                                                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/3d-glass/google-glass/" rel="tag">Google Glass</a>
                                                                    </span>
                                                                </div>
                                                                <div class="woocommerce-product-rating">
                                                                    <div class="star-rating" role="img" aria-label="Rated 1.00 out of 5">
                                                                        <span style="width:20%">
                                                                            Rated <strong class="rating">1.00</strong>
                                                                            out of 5 based on <span class="rating">1</span>
                                                                            customer rating
                                                                        </span>
                                                                    </div>
                                                                    <a href="#reviews" class="woocommerce-review-link" rel="nofollow">
                                                                        (<span class="count">1</span>
                                                                        customer review)
                                                                    </a>
                                                                </div>
                                                                <div class="woocommerce-product-details__short-description">
                                                                    <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>
                                                                </div>
                                                                <p class="price">
                                                                    <span class="woocommerce-Price-amount amount">
                                                                        <bdi>
                                                                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                            245.00
                                                                        </bdi>
                                                                    </span>
                                                                </p>
                                                                <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/3d-vr-glass/" method="post" enctype='multipart/form-data'>
                                                                    <div class="quantity">
                                                                        <input type="button" value="-" class="minus"/>
                                                                        <label class="screen-reader-text" for="quantity_641887cd5e5e3">3D VR Glass quantity</label>
                                                                        <input type="number" id="quantity_641887cd5e5e3" class="input-text qty text" step="1" min="1" max="" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                                                        <input type="button" value="+" class="plus"/>
                                                                    </div>
                                                                    <button type="submit" name="add-to-cart" value="67" class="single_add_to_cart_button button alt">Add to cart</button>
                                                                </form>
                                                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-67  wishlist-fragment on-first-load" data-fragment-ref="67" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:67,&quot;parent_product_id&quot;:67,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                                    <div class="yith-wcwl-add-button">
                                                                        <a href="?add_to_wishlist=67&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="67" data-product-type="simple" data-original-product-id="67" data-title="Add to wishlist" rel="nofollow">
                                                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                            <span>Add to wishlist</span>
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                                <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=67" class="compare button" data-product_id="67" rel="nofollow">Compare</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 xs-list-view">
                                <div class="xs-product-widget media xs-md-20">
                                    <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="7th Generation" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/13-2.png"/>
                                    <noscript>
                                        <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/13-2.png" class="attachment-125x125 size-125x125" alt="7th Generation"/>
                                    </noscript>
                                    <div class="media-body align-self-center product-widget-content">
                                        <div class="xs-product-header media xs-wishlist">
                                            <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1263  wishlist-fragment on-first-load" data-fragment-ref="1263" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1263,&quot;parent_product_id&quot;:1263,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                <div class="yith-wcwl-add-button">
                                                    <a href="?add_to_wishlist=1263&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1263" data-product-type="simple" data-original-product-id="1263" data-title="Add to wishlist" rel="nofollow">
                                                        <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                        <span>Add to wishlist</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <h4 class="product-title">
                                            <a href="https://demo.xpeedstudio.com/marketov2/product/7th-generation/">7th Generation</a>
                                        </h4>
                                        <span class="price">
                                            <del aria-hidden="true">
                                                <span class="woocommerce-Price-amount amount">
                                                    <bdi>
                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                        560.00
                                                    </bdi>
                                                </span>
                                            </del>
                                            <ins>
                                                <span class="woocommerce-Price-amount amount">
                                                    <bdi>
                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                        520.00
                                                    </bdi>
                                                </span>
                                            </ins>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-3 col-sm- col- product type-product post-1263 status-publish last instock product_cat-laptop has-post-thumbnail sale shipping-taxable purchasable product-type-simple">
                                <div class="xs-single-product">
                                    <div class="xs-product-wraper text-center">
                                        <a href="https://demo.xpeedstudio.com/marketov2/product/7th-generation/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                                            <span class="onsale">Sale!</span>
                                            <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/7th-generation/">
                                                <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/13-2.png"/>
                                                <noscript>
                                                    <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/13-2.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                                                </noscript>
                                            </a>
                                            <ul class="product-item-meta">
                                                <li class="xs-cart-wrapper">
                                                    <a href="?add-to-cart=1263" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="1263" data-product_sku="" aria-label="Add &ldquo;7th Generation&rdquo; to your cart" rel="nofollow">Add to cart</a>
                                                </li>
                                                <li>
                                                    <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-1263">
                                                        <i class="xsicon xsicon-eye"></i>
                                                    </a>
                                                </li>
                                                <li class="xs-wishlist-wrapper xs-wishlist">
                                                    <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1263  wishlist-fragment on-first-load" data-fragment-ref="1263" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1263,&quot;parent_product_id&quot;:1263,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                        <div class="yith-wcwl-add-button">
                                                            <a href="?add_to_wishlist=1263&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1263" data-product-type="simple" data-original-product-id="1263" data-title="Add to wishlist" rel="nofollow">
                                                                <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                <span>Add to wishlist</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li class="xs-wishlist-wrapper xs-wishlist product">
                                                    <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1263" class="add-to-compare-link compare" data-product_id="1263">
                                                        <i class="xsicon xsicon-repeat"></i>
                                                    </a>
                                                </li>
                                            </ul>
                                            <div class="xs-product-content">
                                                <h4 class="product-title">
                                                    <a href="https://demo.xpeedstudio.com/marketov2/product/7th-generation/">7th Generation</a>
                                                </h4>
                                                <span class="price">
                                                    <del aria-hidden="true">
                                                        <span class="woocommerce-Price-amount amount">
                                                            <bdi>
                                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                560.00
                                                            </bdi>
                                                        </span>
                                                    </del>
                                                    <ins>
                                                        <span class="woocommerce-Price-amount amount">
                                                            <bdi>
                                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                520.00
                                                            </bdi>
                                                        </span>
                                                    </ins>
                                                </span>
                                            </div>
                                            <div class="xs-product-content">
                                        </a>
                                    </div>
                                </div>
                                <div class="list-group xs-list-group xs-product-content"></div>
                                <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-1263 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                    <div class="modal-dialog" role="document">
                                        <div class="modal-content">
                                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                                <span class="xsicon xsicon-cross"></span>
                                            </button>
                                            <div class="container">
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <div class="images">
                                                            <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/13-2.png"/>
                                                            <noscript>
                                                                <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/13-2.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                                            </noscript>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-6 align-self-center">
                                                        <div class="summary-content entry-summary">
                                                            <h1 class="product_title entry-title">7th Generation</h1>
                                                            <div class="product_meta">
                                                                <span class="posted_in">
                                                                    Category: <a href="https://demo.xpeedstudio.com/marketov2/product-category/laptop/" rel="tag">Laptop</a>
                                                                </span>
                                                            </div>
                                                            <p class="price">
                                                                <del aria-hidden="true">
                                                                    <span class="woocommerce-Price-amount amount">
                                                                        <bdi>
                                                                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                            560.00
                                                                        </bdi>
                                                                    </span>
                                                                </del>
                                                                <ins>
                                                                    <span class="woocommerce-Price-amount amount">
                                                                        <bdi>
                                                                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                            520.00
                                                                        </bdi>
                                                                    </span>
                                                                </ins>
                                                            </p>
                                                            <p class="stock in-stock">11 in stock</p>
                                                            <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/7th-generation/" method="post" enctype='multipart/form-data'>
                                                                <div class="quantity">
                                                                    <input type="button" value="-" class="minus"/>
                                                                    <label class="screen-reader-text" for="quantity_641887cd5fa34">7th Generation quantity</label>
                                                                    <input type="number" id="quantity_641887cd5fa34" class="input-text qty text" step="1" min="1" max="11" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                                                    <input type="button" value="+" class="plus"/>
                                                                </div>
                                                                <button type="submit" name="add-to-cart" value="1263" class="single_add_to_cart_button button alt">Add to cart</button>
                                                            </form>
                                                            <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1263  wishlist-fragment on-first-load" data-fragment-ref="1263" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1263,&quot;parent_product_id&quot;:1263,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                                <div class="yith-wcwl-add-button">
                                                                    <a href="?add_to_wishlist=1263&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1263" data-product-type="simple" data-original-product-id="1263" data-title="Add to wishlist" rel="nofollow">
                                                                        <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                        <span>Add to wishlist</span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1263" class="compare button" data-product_id="1263" rel="nofollow">Compare</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 xs-list-view">
                            <div class="xs-product-widget media xs-md-20">
                                <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Apple iPhone 6s" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/21-1.png"/>
                                <noscript>
                                    <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/21-1.png" class="attachment-125x125 size-125x125" alt="Apple iPhone 6s"/>
                                </noscript>
                                <div class="media-body align-self-center product-widget-content">
                                    <div class="xs-product-header media xs-wishlist">
                                        <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                                            <span style="width:100%">
                                                Rated <strong class="rating">5.00</strong>
                                                out of 5
                                            </span>
                                        </div>
                                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1312  wishlist-fragment on-first-load" data-fragment-ref="1312" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1312,&quot;parent_product_id&quot;:1312,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                            <div class="yith-wcwl-add-button">
                                                <a href="?add_to_wishlist=1312&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1312" data-product-type="simple" data-original-product-id="1312" data-title="Add to wishlist" rel="nofollow">
                                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                    <span>Add to wishlist</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 class="product-title">
                                        <a href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-6s/">Apple iPhone 6s</a>
                                    </h4>
                                    <span class="price">
                                        <span class="woocommerce-Price-amount amount">
                                            <bdi>
                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                299.00
                                            </bdi>
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-sm- col- product type-product post-1312 status-publish first instock product_cat-google-glass product_cat-light product_cat-mobile product_cat-projector has-post-thumbnail featured shipping-taxable purchasable product-type-simple">
                            <div class="xs-single-product">
                                <div class="xs-product-wraper text-center">
                                    <a href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-6s/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                                        <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-6s/">
                                            <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/21-1.png"/>
                                            <noscript>
                                                <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/21-1.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                                            </noscript>
                                        </a>
                                        <ul class="product-item-meta">
                                            <li class="xs-cart-wrapper">
                                                <a href="?add-to-cart=1312" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="1312" data-product_sku="" aria-label="Add &ldquo;Apple iPhone 6s&rdquo; to your cart" rel="nofollow">Add to cart</a>
                                            </li>
                                            <li>
                                                <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-1312">
                                                    <i class="xsicon xsicon-eye"></i>
                                                </a>
                                            </li>
                                            <li class="xs-wishlist-wrapper xs-wishlist">
                                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1312  wishlist-fragment on-first-load" data-fragment-ref="1312" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1312,&quot;parent_product_id&quot;:1312,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                    <div class="yith-wcwl-add-button">
                                                        <a href="?add_to_wishlist=1312&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1312" data-product-type="simple" data-original-product-id="1312" data-title="Add to wishlist" rel="nofollow">
                                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                            <span>Add to wishlist</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </li>
                                            <li class="xs-wishlist-wrapper xs-wishlist product">
                                                <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1312" class="add-to-compare-link compare" data-product_id="1312">
                                                    <i class="xsicon xsicon-repeat"></i>
                                                </a>
                                            </li>
                                        </ul>
                                        <div class="xs-product-content">
                                            <h4 class="product-title">
                                                <a href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-6s/">Apple iPhone 6s</a>
                                            </h4>
                                            <span class="price">
                                                <span class="woocommerce-Price-amount amount">
                                                    <bdi>
                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                        299.00
                                                    </bdi>
                                                </span>
                                            </span>
                                        </div>
                                        <div class="xs-product-content">
                                    </a>
                                </div>
                            </div>
                            <div class="list-group xs-list-group xs-product-content">Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. </div>
                            <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-1312 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                                <div class="modal-dialog" role="document">
                                    <div class="modal-content">
                                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                            <span class="xsicon xsicon-cross"></span>
                                        </button>
                                        <div class="container">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <div class="images">
                                                        <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/21-1.png"/>
                                                        <noscript>
                                                            <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/21-1.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                                        </noscript>
                                                    </div>
                                                </div>
                                                <div class="col-md-6 align-self-center">
                                                    <div class="summary-content entry-summary">
                                                        <h1 class="product_title entry-title">Apple iPhone 6s</h1>
                                                        <div class="product_meta">
                                                            <span class="posted_in">
                                                                Categories: <a href="https://demo.xpeedstudio.com/marketov2/product-category/3d-glass/google-glass/" rel="tag">Google Glass</a>
                                                                , <a href="https://demo.xpeedstudio.com/marketov2/product-category/light/" rel="tag">Light</a>
                                                                , <a href="https://demo.xpeedstudio.com/marketov2/product-category/mobile/" rel="tag">Mobile</a>
                                                                , <a href="https://demo.xpeedstudio.com/marketov2/product-category/projector/" rel="tag">Projector</a>
                                                            </span>
                                                        </div>
                                                        <div class="woocommerce-product-rating">
                                                            <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                                                                <span style="width:100%">
                                                                    Rated <strong class="rating">5.00</strong>
                                                                    out of 5 based on <span class="rating">1</span>
                                                                    customer rating
                                                                </span>
                                                            </div>
                                                            <a href="#reviews" class="woocommerce-review-link" rel="nofollow">
                                                                (<span class="count">1</span>
                                                                customer review)
                                                            </a>
                                                        </div>
                                                        <div class="woocommerce-product-details__short-description">
                                                            <p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.</p>
                                                        </div>
                                                        <p class="price">
                                                            <span class="woocommerce-Price-amount amount">
                                                                <bdi>
                                                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                    299.00
                                                                </bdi>
                                                            </span>
                                                        </p>
                                                        <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-6s/" method="post" enctype='multipart/form-data'>
                                                            <div class="quantity">
                                                                <input type="button" value="-" class="minus"/>
                                                                <label class="screen-reader-text" for="quantity_641887cd609c1">Apple iPhone 6s quantity</label>
                                                                <input type="number" id="quantity_641887cd609c1" class="input-text qty text" step="1" min="1" max="" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                                                <input type="button" value="+" class="plus"/>
                                                            </div>
                                                            <button type="submit" name="add-to-cart" value="1312" class="single_add_to_cart_button button alt">Add to cart</button>
                                                        </form>
                                                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1312  wishlist-fragment on-first-load" data-fragment-ref="1312" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1312,&quot;parent_product_id&quot;:1312,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                            <div class="yith-wcwl-add-button">
                                                                <a href="?add_to_wishlist=1312&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1312" data-product-type="simple" data-original-product-id="1312" data-title="Add to wishlist" rel="nofollow">
                                                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                    <span>Add to wishlist</span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                        <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1312" class="compare button" data-product_id="1312" rel="nofollow">Compare</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6 xs-list-view">
                        <div class="xs-product-widget media xs-md-20">
                            <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Apple iPhone 7s" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/24-1.png"/>
                            <noscript>
                                <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/24-1.png" class="attachment-125x125 size-125x125" alt="Apple iPhone 7s"/>
                            </noscript>
                            <div class="media-body align-self-center product-widget-content">
                                <div class="xs-product-header media xs-wishlist">
                                    <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                                        <span style="width:100%">
                                            Rated <strong class="rating">5.00</strong>
                                            out of 5
                                        </span>
                                    </div>
                                    <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1319  wishlist-fragment on-first-load" data-fragment-ref="1319" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1319,&quot;parent_product_id&quot;:1319,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                        <div class="yith-wcwl-add-button">
                                            <a href="?add_to_wishlist=1319&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1319" data-product-type="simple" data-original-product-id="1319" data-title="Add to wishlist" rel="nofollow">
                                                <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                <span>Add to wishlist</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <h4 class="product-title">
                                    <a href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-7s/">Apple iPhone 7s</a>
                                </h4>
                                <span class="price">
                                    <del aria-hidden="true">
                                        <span class="woocommerce-Price-amount amount">
                                            <bdi>
                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                690.00
                                            </bdi>
                                        </span>
                                    </del>
                                    <ins>
                                        <span class="woocommerce-Price-amount amount">
                                            <bdi>
                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                660.00
                                            </bdi>
                                        </span>
                                    </ins>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-3 col-sm- col- product type-product post-1319 status-publish outofstock product_cat-google-glass product_cat-light product_cat-mobile product_cat-projector has-post-thumbnail sale shipping-taxable purchasable product-type-simple">
                        <div class="xs-single-product">
                            <div class="xs-product-wraper text-center">
                                <a href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-7s/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                                    <span class="onsale">Sale!</span>
                                    <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-7s/">
                                        <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/24-1.png"/>
                                        <noscript>
                                            <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/24-1.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                                        </noscript>
                                    </a>
                                    <ul class="product-item-meta">
                                        <li class="xs-cart-wrapper">
                                            <a href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-7s/" data-quantity="1" class="button product_type_simple" data-product_id="1319" data-product_sku="" aria-label="Read more about &ldquo;Apple iPhone 7s&rdquo;" rel="nofollow">Read more</a>
                                        </li>
                                        <li>
                                            <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-1319">
                                                <i class="xsicon xsicon-eye"></i>
                                            </a>
                                        </li>
                                        <li class="xs-wishlist-wrapper xs-wishlist">
                                            <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1319  wishlist-fragment on-first-load" data-fragment-ref="1319" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1319,&quot;parent_product_id&quot;:1319,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                <div class="yith-wcwl-add-button">
                                                    <a href="?add_to_wishlist=1319&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1319" data-product-type="simple" data-original-product-id="1319" data-title="Add to wishlist" rel="nofollow">
                                                        <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                        <span>Add to wishlist</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </li>
                                        <li class="xs-wishlist-wrapper xs-wishlist product">
                                            <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1319" class="add-to-compare-link compare" data-product_id="1319">
                                                <i class="xsicon xsicon-repeat"></i>
                                            </a>
                                        </li>
                                    </ul>
                                    <div class="xs-product-content">
                                        <h4 class="product-title">
                                            <a href="https://demo.xpeedstudio.com/marketov2/product/apple-iphone-7s/">Apple iPhone 7s</a>
                                        </h4>
                                        <span class="price">
                                            <del aria-hidden="true">
                                                <span class="woocommerce-Price-amount amount">
                                                    <bdi>
                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                        690.00
                                                    </bdi>
                                                </span>
                                            </del>
                                            <ins>
                                                <span class="woocommerce-Price-amount amount">
                                                    <bdi>
                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                        660.00
                                                    </bdi>
                                                </span>
                                            </ins>
                                        </span>
                                    </div>
                                    <div class="xs-product-content">
                                </a>
                            </div>
                        </div>
                        <div class="list-group xs-list-group xs-product-content">Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. </div>
                        <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-1319 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                            <div class="modal-dialog" role="document">
                                <div class="modal-content">
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span class="xsicon xsicon-cross"></span>
                                    </button>
                                    <div class="container">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="images">
                                                    <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/24-1.png"/>
                                                    <noscript>
                                                        <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/24-1.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                                    </noscript>
                                                </div>
                                            </div>
                                            <div class="col-md-6 align-self-center">
                                                <div class="summary-content entry-summary">
                                                    <h1 class="product_title entry-title">Apple iPhone 7s</h1>
                                                    <div class="product_meta">
                                                        <span class="posted_in">
                                                            Categories: <a href="https://demo.xpeedstudio.com/marketov2/product-category/3d-glass/google-glass/" rel="tag">Google Glass</a>
                                                            , <a href="https://demo.xpeedstudio.com/marketov2/product-category/light/" rel="tag">Light</a>
                                                            , <a href="https://demo.xpeedstudio.com/marketov2/product-category/mobile/" rel="tag">Mobile</a>
                                                            , <a href="https://demo.xpeedstudio.com/marketov2/product-category/projector/" rel="tag">Projector</a>
                                                        </span>
                                                    </div>
                                                    <div class="woocommerce-product-rating">
                                                        <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                                                            <span style="width:100%">
                                                                Rated <strong class="rating">5.00</strong>
                                                                out of 5 based on <span class="rating">1</span>
                                                                customer rating
                                                            </span>
                                                        </div>
                                                        <a href="#reviews" class="woocommerce-review-link" rel="nofollow">
                                                            (<span class="count">1</span>
                                                            customer review)
                                                        </a>
                                                    </div>
                                                    <div class="woocommerce-product-details__short-description">
                                                        <p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.</p>
                                                    </div>
                                                    <p class="price">
                                                        <del aria-hidden="true">
                                                            <span class="woocommerce-Price-amount amount">
                                                                <bdi>
                                                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                    690.00
                                                                </bdi>
                                                            </span>
                                                        </del>
                                                        <ins>
                                                            <span class="woocommerce-Price-amount amount">
                                                                <bdi>
                                                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                                    660.00
                                                                </bdi>
                                                            </span>
                                                        </ins>
                                                    </p>
                                                    <p class="stock out-of-stock">Out of stock</p>
                                                    <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1319  wishlist-fragment on-first-load" data-fragment-ref="1319" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1319,&quot;parent_product_id&quot;:1319,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                        <div class="yith-wcwl-add-button">
                                                            <a href="?add_to_wishlist=1319&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1319" data-product-type="simple" data-original-product-id="1319" data-title="Add to wishlist" rel="nofollow">
                                                                <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                                <span>Add to wishlist</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1319" class="compare button" data-product_id="1319" rel="nofollow">Compare</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 xs-list-view">
                    <div class="xs-product-widget media xs-md-20">
                        <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Bevigac Gamepad" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/47-1.png"/>
                        <noscript>
                            <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/47-1.png" class="attachment-125x125 size-125x125" alt="Bevigac Gamepad"/>
                        </noscript>
                        <div class="media-body align-self-center product-widget-content">
                            <div class="xs-product-header media xs-wishlist">
                                <div class="star-rating" role="img" aria-label="Rated 4.00 out of 5">
                                    <span style="width:80%">
                                        Rated <strong class="rating">4.00</strong>
                                        out of 5
                                    </span>
                                </div>
                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1333  wishlist-fragment on-first-load" data-fragment-ref="1333" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1333,&quot;parent_product_id&quot;:1333,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                    <div class="yith-wcwl-add-button">
                                        <a href="?add_to_wishlist=1333&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1333" data-product-type="simple" data-original-product-id="1333" data-title="Add to wishlist" rel="nofollow">
                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                            <span>Add to wishlist</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <h4 class="product-title">
                                <a href="https://demo.xpeedstudio.com/marketov2/product/bevigac-gamepad/">Bevigac Gamepad</a>
                            </h4>
                            <span class="price">
                                <span class="woocommerce-Price-amount amount">
                                    <bdi>
                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                        220.00
                                    </bdi>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-sm- col- product type-product post-1333 status-publish last instock product_cat-gamepad product_cat-headphone product_cat-mobile has-post-thumbnail shipping-taxable purchasable product-type-simple">
                    <div class="xs-single-product">
                        <div class="xs-product-wraper text-center">
                            <a href="https://demo.xpeedstudio.com/marketov2/product/bevigac-gamepad/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                                <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/bevigac-gamepad/">
                                    <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/47-1.png"/>
                                    <noscript>
                                        <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/47-1.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                                    </noscript>
                                </a>
                                <ul class="product-item-meta">
                                    <li class="xs-cart-wrapper">
                                        <a href="?add-to-cart=1333" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="1333" data-product_sku="" aria-label="Add &ldquo;Bevigac Gamepad&rdquo; to your cart" rel="nofollow">Add to cart</a>
                                    </li>
                                    <li>
                                        <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-1333">
                                            <i class="xsicon xsicon-eye"></i>
                                        </a>
                                    </li>
                                    <li class="xs-wishlist-wrapper xs-wishlist">
                                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1333  wishlist-fragment on-first-load" data-fragment-ref="1333" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1333,&quot;parent_product_id&quot;:1333,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                            <div class="yith-wcwl-add-button">
                                                <a href="?add_to_wishlist=1333&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1333" data-product-type="simple" data-original-product-id="1333" data-title="Add to wishlist" rel="nofollow">
                                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                    <span>Add to wishlist</span>
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                    <li class="xs-wishlist-wrapper xs-wishlist product">
                                        <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1333" class="add-to-compare-link compare" data-product_id="1333">
                                            <i class="xsicon xsicon-repeat"></i>
                                        </a>
                                    </li>
                                </ul>
                                <div class="xs-product-content">
                                    <h4 class="product-title">
                                        <a href="https://demo.xpeedstudio.com/marketov2/product/bevigac-gamepad/">Bevigac Gamepad</a>
                                    </h4>
                                    <span class="price">
                                        <span class="woocommerce-Price-amount amount">
                                            <bdi>
                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                220.00
                                            </bdi>
                                        </span>
                                    </span>
                                </div>
                                <div class="xs-product-content">
                            </a>
                        </div>
                    </div>
                    <div class="list-group xs-list-group xs-product-content">Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. </div>
                    <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-1333 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span class="xsicon xsicon-cross"></span>
                                </button>
                                <div class="container">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="images">
                                                <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/47-1.png"/>
                                                <noscript>
                                                    <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/47-1.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                                </noscript>
                                            </div>
                                        </div>
                                        <div class="col-md-6 align-self-center">
                                            <div class="summary-content entry-summary">
                                                <h1 class="product_title entry-title">Bevigac Gamepad</h1>
                                                <div class="product_meta">
                                                    <span class="posted_in">
                                                        Categories: <a href="https://demo.xpeedstudio.com/marketov2/product-category/gamepad/" rel="tag">Gamepad</a>
                                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/headphone/" rel="tag">Headphone</a>
                                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/mobile/" rel="tag">Mobile</a>
                                                    </span>
                                                </div>
                                                <div class="woocommerce-product-rating">
                                                    <div class="star-rating" role="img" aria-label="Rated 4.00 out of 5">
                                                        <span style="width:80%">
                                                            Rated <strong class="rating">4.00</strong>
                                                            out of 5 based on <span class="rating">1</span>
                                                            customer rating
                                                        </span>
                                                    </div>
                                                    <a href="#reviews" class="woocommerce-review-link" rel="nofollow">
                                                        (<span class="count">1</span>
                                                        customer review)
                                                    </a>
                                                </div>
                                                <div class="woocommerce-product-details__short-description">
                                                    <p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.</p>
                                                </div>
                                                <p class="price">
                                                    <span class="woocommerce-Price-amount amount">
                                                        <bdi>
                                                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                            220.00
                                                        </bdi>
                                                    </span>
                                                </p>
                                                <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/bevigac-gamepad/" method="post" enctype='multipart/form-data'>
                                                    <div class="quantity">
                                                        <input type="button" value="-" class="minus"/>
                                                        <label class="screen-reader-text" for="quantity_641887cd6306c">Bevigac Gamepad quantity</label>
                                                        <input type="number" id="quantity_641887cd6306c" class="input-text qty text" step="1" min="1" max="" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                                        <input type="button" value="+" class="plus"/>
                                                    </div>
                                                    <button type="submit" name="add-to-cart" value="1333" class="single_add_to_cart_button button alt">Add to cart</button>
                                                </form>
                                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1333  wishlist-fragment on-first-load" data-fragment-ref="1333" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1333,&quot;parent_product_id&quot;:1333,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                    <div class="yith-wcwl-add-button">
                                                        <a href="?add_to_wishlist=1333&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1333" data-product-type="simple" data-original-product-id="1333" data-title="Add to wishlist" rel="nofollow">
                                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                            <span>Add to wishlist</span>
                                                        </a>
                                                    </div>
                                                </div>
                                                <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1333" class="compare button" data-product_id="1333" rel="nofollow">Compare</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 xs-list-view">
                <div class="xs-product-widget media xs-md-20">
                    <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Black Solid Color Full Sleeve" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/30-1.png"/>
                    <noscript>
                        <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/30-1.png" class="attachment-125x125 size-125x125" alt="Black Solid Color Full Sleeve"/>
                    </noscript>
                    <div class="media-body align-self-center product-widget-content">
                        <div class="xs-product-header media xs-wishlist">
                            <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1691  wishlist-fragment on-first-load" data-fragment-ref="1691" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1691,&quot;parent_product_id&quot;:1691,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                <div class="yith-wcwl-add-button">
                                    <a href="?add_to_wishlist=1691&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1691" data-product-type="simple" data-original-product-id="1691" data-title="Add to wishlist" rel="nofollow">
                                        <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                        <span>Add to wishlist</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <h4 class="product-title">
                            <a href="https://demo.xpeedstudio.com/marketov2/product/black-solid-color-full-sleeve/">Black Solid Color Full Sleeve</a>
                        </h4>
                        <span class="price">
                            <span class="woocommerce-Price-amount amount">
                                <bdi>
                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                    29.00
                                </bdi>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-sm- col- product type-product post-1691 status-publish first instock product_cat-uncategorized has-post-thumbnail shipping-taxable purchasable product-type-simple">
                <div class="xs-single-product">
                    <div class="xs-product-wraper text-center">
                        <a href="https://demo.xpeedstudio.com/marketov2/product/black-solid-color-full-sleeve/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                            <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/black-solid-color-full-sleeve/">
                                <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/30-1.png"/>
                                <noscript>
                                    <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/30-1.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                                </noscript>
                            </a>
                            <ul class="product-item-meta">
                                <li class="xs-cart-wrapper">
                                    <a href="?add-to-cart=1691" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="1691" data-product_sku="" aria-label="Add &ldquo;Black Solid Color Full Sleeve&rdquo; to your cart" rel="nofollow">Add to cart</a>
                                </li>
                                <li>
                                    <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-1691">
                                        <i class="xsicon xsicon-eye"></i>
                                    </a>
                                </li>
                                <li class="xs-wishlist-wrapper xs-wishlist">
                                    <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1691  wishlist-fragment on-first-load" data-fragment-ref="1691" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1691,&quot;parent_product_id&quot;:1691,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                        <div class="yith-wcwl-add-button">
                                            <a href="?add_to_wishlist=1691&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1691" data-product-type="simple" data-original-product-id="1691" data-title="Add to wishlist" rel="nofollow">
                                                <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                <span>Add to wishlist</span>
                                            </a>
                                        </div>
                                    </div>
                                </li>
                                <li class="xs-wishlist-wrapper xs-wishlist product">
                                    <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1691" class="add-to-compare-link compare" data-product_id="1691">
                                        <i class="xsicon xsicon-repeat"></i>
                                    </a>
                                </li>
                            </ul>
                            <div class="xs-product-content">
                                <h4 class="product-title">
                                    <a href="https://demo.xpeedstudio.com/marketov2/product/black-solid-color-full-sleeve/">Black Solid Color Full Sleeve</a>
                                </h4>
                                <span class="price">
                                    <span class="woocommerce-Price-amount amount">
                                        <bdi>
                                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                            29.00
                                        </bdi>
                                    </span>
                                </span>
                            </div>
                            <div class="xs-product-content">
                        </a>
                    </div>
                </div>
                <div class="list-group xs-list-group xs-product-content">Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. </div>
                <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-1691 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span class="xsicon xsicon-cross"></span>
                            </button>
                            <div class="container">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="images">
                                            <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/30-1.png"/>
                                            <noscript>
                                                <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/30-1.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                            </noscript>
                                        </div>
                                    </div>
                                    <div class="col-md-6 align-self-center">
                                        <div class="summary-content entry-summary">
                                            <h1 class="product_title entry-title">Black Solid Color Full Sleeve</h1>
                                            <div class="product_meta">
                                                <span class="posted_in">
                                                    Category: <a href="https://demo.xpeedstudio.com/marketov2/product-category/uncategorized/" rel="tag">Uncategorized</a>
                                                </span>
                                            </div>
                                            <div class="woocommerce-product-details__short-description">
                                                <p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.</p>
                                            </div>
                                            <p class="price">
                                                <span class="woocommerce-Price-amount amount">
                                                    <bdi>
                                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                        29.00
                                                    </bdi>
                                                </span>
                                            </p>
                                            <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/black-solid-color-full-sleeve/" method="post" enctype='multipart/form-data'>
                                                <div class="quantity">
                                                    <input type="button" value="-" class="minus"/>
                                                    <label class="screen-reader-text" for="quantity_641887cd641dd">Black Solid Color Full Sleeve quantity</label>
                                                    <input type="number" id="quantity_641887cd641dd" class="input-text qty text" step="1" min="1" max="" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                                    <input type="button" value="+" class="plus"/>
                                                </div>
                                                <button type="submit" name="add-to-cart" value="1691" class="single_add_to_cart_button button alt">Add to cart</button>
                                            </form>
                                            <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1691  wishlist-fragment on-first-load" data-fragment-ref="1691" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1691,&quot;parent_product_id&quot;:1691,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                                <div class="yith-wcwl-add-button">
                                                    <a href="?add_to_wishlist=1691&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1691" data-product-type="simple" data-original-product-id="1691" data-title="Add to wishlist" rel="nofollow">
                                                        <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                        <span>Add to wishlist</span>
                                                    </a>
                                                </div>
                                            </div>
                                            <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1691" class="compare button" data-product_id="1691" rel="nofollow">Compare</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-6 xs-list-view">
            <div class="xs-product-widget media xs-md-20">
                <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Bluetooth Gamepad" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/45-1.png"/>
                <noscript>
                    <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/45-1.png" class="attachment-125x125 size-125x125" alt="Bluetooth Gamepad"/>
                </noscript>
                <div class="media-body align-self-center product-widget-content">
                    <div class="xs-product-header media xs-wishlist">
                        <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                            <span style="width:100%">
                                Rated <strong class="rating">5.00</strong>
                                out of 5
                            </span>
                        </div>
                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1322  wishlist-fragment on-first-load" data-fragment-ref="1322" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1322,&quot;parent_product_id&quot;:1322,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                            <div class="yith-wcwl-add-button">
                                <a href="?add_to_wishlist=1322&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1322" data-product-type="simple" data-original-product-id="1322" data-title="Add to wishlist" rel="nofollow">
                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                    <span>Add to wishlist</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <h4 class="product-title">
                        <a href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-gamepad/">Bluetooth Gamepad</a>
                    </h4>
                    <span class="price">
                        <span class="woocommerce-Price-amount amount">
                            <bdi>
                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                199.00
                            </bdi>
                        </span>
                    </span>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-sm- col- product type-product post-1322 status-publish instock product_cat-drone product_cat-gamepad product_cat-laptop product_cat-mobile has-post-thumbnail featured shipping-taxable purchasable product-type-simple">
            <div class="xs-single-product">
                <div class="xs-product-wraper text-center">
                    <a href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-gamepad/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                        <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-gamepad/">
                            <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/45-1.png"/>
                            <noscript>
                                <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/45-1.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                            </noscript>
                        </a>
                        <ul class="product-item-meta">
                            <li class="xs-cart-wrapper">
                                <a href="?add-to-cart=1322" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="1322" data-product_sku="" aria-label="Add &ldquo;Bluetooth Gamepad&rdquo; to your cart" rel="nofollow">Add to cart</a>
                            </li>
                            <li>
                                <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-1322">
                                    <i class="xsicon xsicon-eye"></i>
                                </a>
                            </li>
                            <li class="xs-wishlist-wrapper xs-wishlist">
                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1322  wishlist-fragment on-first-load" data-fragment-ref="1322" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1322,&quot;parent_product_id&quot;:1322,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                    <div class="yith-wcwl-add-button">
                                        <a href="?add_to_wishlist=1322&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1322" data-product-type="simple" data-original-product-id="1322" data-title="Add to wishlist" rel="nofollow">
                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                            <span>Add to wishlist</span>
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li class="xs-wishlist-wrapper xs-wishlist product">
                                <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1322" class="add-to-compare-link compare" data-product_id="1322">
                                    <i class="xsicon xsicon-repeat"></i>
                                </a>
                            </li>
                        </ul>
                        <div class="xs-product-content">
                            <h4 class="product-title">
                                <a href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-gamepad/">Bluetooth Gamepad</a>
                            </h4>
                            <span class="price">
                                <span class="woocommerce-Price-amount amount">
                                    <bdi>
                                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                        199.00
                                    </bdi>
                                </span>
                            </span>
                        </div>
                        <div class="xs-product-content">
                    </a>
                </div>
            </div>
            <div class="list-group xs-list-group xs-product-content">Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. </div>
            <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-1322 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span class="xsicon xsicon-cross"></span>
                        </button>
                        <div class="container">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="images">
                                        <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/45-1.png"/>
                                        <noscript>
                                            <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/45-1.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                        </noscript>
                                    </div>
                                </div>
                                <div class="col-md-6 align-self-center">
                                    <div class="summary-content entry-summary">
                                        <h1 class="product_title entry-title">Bluetooth Gamepad</h1>
                                        <div class="product_meta">
                                            <span class="posted_in">
                                                Categories: <a href="https://demo.xpeedstudio.com/marketov2/product-category/drone/" rel="tag">Drone</a>
                                                , <a href="https://demo.xpeedstudio.com/marketov2/product-category/gamepad/" rel="tag">Gamepad</a>
                                                , <a href="https://demo.xpeedstudio.com/marketov2/product-category/laptop/" rel="tag">Laptop</a>
                                                , <a href="https://demo.xpeedstudio.com/marketov2/product-category/mobile/" rel="tag">Mobile</a>
                                            </span>
                                        </div>
                                        <div class="woocommerce-product-rating">
                                            <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                                                <span style="width:100%">
                                                    Rated <strong class="rating">5.00</strong>
                                                    out of 5 based on <span class="rating">1</span>
                                                    customer rating
                                                </span>
                                            </div>
                                            <a href="#reviews" class="woocommerce-review-link" rel="nofollow">
                                                (<span class="count">1</span>
                                                customer review)
                                            </a>
                                        </div>
                                        <div class="woocommerce-product-details__short-description">
                                            <p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.</p>
                                        </div>
                                        <p class="price">
                                            <span class="woocommerce-Price-amount amount">
                                                <bdi>
                                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                    199.00
                                                </bdi>
                                            </span>
                                        </p>
                                        <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/bluetooth-gamepad/" method="post" enctype='multipart/form-data'>
                                            <div class="quantity">
                                                <input type="button" value="-" class="minus"/>
                                                <label class="screen-reader-text" for="quantity_641887cd650f2">Bluetooth Gamepad quantity</label>
                                                <input type="number" id="quantity_641887cd650f2" class="input-text qty text" step="1" min="1" max="" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                                <input type="button" value="+" class="plus"/>
                                            </div>
                                            <button type="submit" name="add-to-cart" value="1322" class="single_add_to_cart_button button alt">Add to cart</button>
                                        </form>
                                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1322  wishlist-fragment on-first-load" data-fragment-ref="1322" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1322,&quot;parent_product_id&quot;:1322,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                            <div class="yith-wcwl-add-button">
                                                <a href="?add_to_wishlist=1322&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1322" data-product-type="simple" data-original-product-id="1322" data-title="Add to wishlist" rel="nofollow">
                                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                                    <span>Add to wishlist</span>
                                                </a>
                                            </div>
                                        </div>
                                        <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1322" class="compare button" data-product_id="1322" rel="nofollow">Compare</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
</div>
<div class="col-md-6 xs-list-view">
    <div class="xs-product-widget media xs-md-20">
        <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Bluetooth Speaker" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/HTB1olbtmlDH8KJj-1.jpg"/>
        <noscript>
            <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/HTB1olbtmlDH8KJj-1.jpg" class="attachment-125x125 size-125x125" alt="Bluetooth Speaker"/>
        </noscript>
        <div class="media-body align-self-center product-widget-content">
            <div class="xs-product-header media xs-wishlist">
                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-599  wishlist-fragment on-first-load" data-fragment-ref="599" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:599,&quot;parent_product_id&quot;:599,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                    <div class="yith-wcwl-add-button">
                        <a href="?add_to_wishlist=599&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="599" data-product-type="simple" data-original-product-id="599" data-title="Add to wishlist" rel="nofollow">
                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                            <span>Add to wishlist</span>
                        </a>
                    </div>
                </div>
            </div>
            <h4 class="product-title">
                <a href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-speaker/">Bluetooth Speaker</a>
            </h4>
            <span class="price">
                <span class="woocommerce-Price-amount amount">
                    <bdi>
                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                        70.00
                    </bdi>
                </span>
            </span>
        </div>
    </div>
</div>
<div class="col-lg-3 col-sm- col- product type-product post-599 status-publish last outofstock product_cat-camera product_cat-headphone product_cat-light product_cat-speaker has-post-thumbnail featured shipping-taxable purchasable product-type-simple">
    <div class="xs-single-product">
        <div class="xs-product-wraper text-center">
            <a href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-speaker/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-speaker/">
                    <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/HTB1olbtmlDH8KJj-1.jpg"/>
                    <noscript>
                        <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/HTB1olbtmlDH8KJj-1.jpg" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                    </noscript>
                </a>
                <ul class="product-item-meta">
                    <li class="xs-cart-wrapper">
                        <a href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-speaker/" data-quantity="1" class="button product_type_simple" data-product_id="599" data-product_sku="" aria-label="Read more about &ldquo;Bluetooth Speaker&rdquo;" rel="nofollow">Read more</a>
                    </li>
                    <li>
                        <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-599">
                            <i class="xsicon xsicon-eye"></i>
                        </a>
                    </li>
                    <li class="xs-wishlist-wrapper xs-wishlist">
                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-599  wishlist-fragment on-first-load" data-fragment-ref="599" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:599,&quot;parent_product_id&quot;:599,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                            <div class="yith-wcwl-add-button">
                                <a href="?add_to_wishlist=599&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="599" data-product-type="simple" data-original-product-id="599" data-title="Add to wishlist" rel="nofollow">
                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                    <span>Add to wishlist</span>
                                </a>
                            </div>
                        </div>
                    </li>
                    <li class="xs-wishlist-wrapper xs-wishlist product">
                        <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=599" class="add-to-compare-link compare" data-product_id="599">
                            <i class="xsicon xsicon-repeat"></i>
                        </a>
                    </li>
                </ul>
                <div class="xs-product-content">
                    <h4 class="product-title">
                        <a href="https://demo.xpeedstudio.com/marketov2/product/bluetooth-speaker/">Bluetooth Speaker</a>
                    </h4>
                    <span class="price">
                        <span class="woocommerce-Price-amount amount">
                            <bdi>
                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                70.00
                            </bdi>
                        </span>
                    </span>
                </div>
                <div class="xs-product-content">
            </a>
        </div>
    </div>
    <div class="list-group xs-list-group xs-product-content">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et &hellip;</div>
    <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-599 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span class="xsicon xsicon-cross"></span>
                </button>
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="images">
                                <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/HTB1olbtmlDH8KJj-1.jpg"/>
                                <noscript>
                                    <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2013/06/HTB1olbtmlDH8KJj-1.jpg" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                </noscript>
                            </div>
                        </div>
                        <div class="col-md-6 align-self-center">
                            <div class="summary-content entry-summary">
                                <h1 class="product_title entry-title">Bluetooth Speaker</h1>
                                <div class="product_meta">
                                    <span class="posted_in">
                                        Categories: <a href="https://demo.xpeedstudio.com/marketov2/product-category/camera/" rel="tag">Camera</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/headphone/" rel="tag">Headphone</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/light/" rel="tag">Light</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/speaker/" rel="tag">Speaker</a>
                                    </span>
                                </div>
                                <p class="price">
                                    <span class="woocommerce-Price-amount amount">
                                        <bdi>
                                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                            70.00
                                        </bdi>
                                    </span>
                                </p>
                                <p class="stock out-of-stock">Out of stock</p>
                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-599  wishlist-fragment on-first-load" data-fragment-ref="599" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:599,&quot;parent_product_id&quot;:599,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                    <div class="yith-wcwl-add-button">
                                        <a href="?add_to_wishlist=599&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="599" data-product-type="simple" data-original-product-id="599" data-title="Add to wishlist" rel="nofollow">
                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                            <span>Add to wishlist</span>
                                        </a>
                                    </div>
                                </div>
                                <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=599" class="compare button" data-product_id="599" rel="nofollow">Compare</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
<div class="col-md-6 xs-list-view">
    <div class="xs-product-widget media xs-md-20">
        <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Bracelet Watch" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/43-1.png"/>
        <noscript>
            <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/43-1.png" class="attachment-125x125 size-125x125" alt="Bracelet Watch"/>
        </noscript>
        <div class="media-body align-self-center product-widget-content">
            <div class="xs-product-header media xs-wishlist">
                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1305  wishlist-fragment on-first-load" data-fragment-ref="1305" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1305,&quot;parent_product_id&quot;:1305,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                    <div class="yith-wcwl-add-button">
                        <a href="?add_to_wishlist=1305&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1305" data-product-type="simple" data-original-product-id="1305" data-title="Add to wishlist" rel="nofollow">
                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                            <span>Add to wishlist</span>
                        </a>
                    </div>
                </div>
            </div>
            <h4 class="product-title">
                <a href="https://demo.xpeedstudio.com/marketov2/product/bracelet-watch/">Bracelet Watch</a>
            </h4>
            <span class="price">
                <span class="woocommerce-Price-amount amount">
                    <bdi>
                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                        40.00
                    </bdi>
                </span>
            </span>
        </div>
    </div>
</div>
<div class="col-lg-3 col-sm- col- product type-product post-1305 status-publish first instock product_cat-drone product_cat-gamepad product_cat-laptop product_cat-watch has-post-thumbnail shipping-taxable purchasable product-type-simple">
    <div class="xs-single-product">
        <div class="xs-product-wraper text-center">
            <a href="https://demo.xpeedstudio.com/marketov2/product/bracelet-watch/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/bracelet-watch/">
                    <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/43-1.png"/>
                    <noscript>
                        <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/43-1.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                    </noscript>
                </a>
                <ul class="product-item-meta">
                    <li class="xs-cart-wrapper">
                        <a href="?add-to-cart=1305" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="1305" data-product_sku="" aria-label="Add &ldquo;Bracelet Watch&rdquo; to your cart" rel="nofollow">Add to cart</a>
                    </li>
                    <li>
                        <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-1305">
                            <i class="xsicon xsicon-eye"></i>
                        </a>
                    </li>
                    <li class="xs-wishlist-wrapper xs-wishlist">
                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1305  wishlist-fragment on-first-load" data-fragment-ref="1305" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1305,&quot;parent_product_id&quot;:1305,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                            <div class="yith-wcwl-add-button">
                                <a href="?add_to_wishlist=1305&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1305" data-product-type="simple" data-original-product-id="1305" data-title="Add to wishlist" rel="nofollow">
                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                    <span>Add to wishlist</span>
                                </a>
                            </div>
                        </div>
                    </li>
                    <li class="xs-wishlist-wrapper xs-wishlist product">
                        <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1305" class="add-to-compare-link compare" data-product_id="1305">
                            <i class="xsicon xsicon-repeat"></i>
                        </a>
                    </li>
                </ul>
                <div class="xs-product-content">
                    <h4 class="product-title">
                        <a href="https://demo.xpeedstudio.com/marketov2/product/bracelet-watch/">Bracelet Watch</a>
                    </h4>
                    <span class="price">
                        <span class="woocommerce-Price-amount amount">
                            <bdi>
                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                40.00
                            </bdi>
                        </span>
                    </span>
                </div>
                <div class="xs-product-content">
            </a>
        </div>
    </div>
    <div class="list-group xs-list-group xs-product-content">Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. </div>
    <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-1305 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span class="xsicon xsicon-cross"></span>
                </button>
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="images">
                                <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/43-1.png"/>
                                <noscript>
                                    <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/43-1.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                </noscript>
                            </div>
                        </div>
                        <div class="col-md-6 align-self-center">
                            <div class="summary-content entry-summary">
                                <h1 class="product_title entry-title">Bracelet Watch</h1>
                                <div class="product_meta">
                                    <span class="posted_in">
                                        Categories: <a href="https://demo.xpeedstudio.com/marketov2/product-category/drone/" rel="tag">Drone</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/gamepad/" rel="tag">Gamepad</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/laptop/" rel="tag">Laptop</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/watch/" rel="tag">Watch</a>
                                    </span>
                                </div>
                                <div class="woocommerce-product-details__short-description">
                                    <p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.</p>
                                </div>
                                <p class="price">
                                    <span class="woocommerce-Price-amount amount">
                                        <bdi>
                                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                            40.00
                                        </bdi>
                                    </span>
                                </p>
                                <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/bracelet-watch/" method="post" enctype='multipart/form-data'>
                                    <div class="quantity">
                                        <input type="button" value="-" class="minus"/>
                                        <label class="screen-reader-text" for="quantity_641887cd673ac">Bracelet Watch quantity</label>
                                        <input type="number" id="quantity_641887cd673ac" class="input-text qty text" step="1" min="1" max="" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                        <input type="button" value="+" class="plus"/>
                                    </div>
                                    <button type="submit" name="add-to-cart" value="1305" class="single_add_to_cart_button button alt">Add to cart</button>
                                </form>
                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1305  wishlist-fragment on-first-load" data-fragment-ref="1305" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1305,&quot;parent_product_id&quot;:1305,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                    <div class="yith-wcwl-add-button">
                                        <a href="?add_to_wishlist=1305&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1305" data-product-type="simple" data-original-product-id="1305" data-title="Add to wishlist" rel="nofollow">
                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                            <span>Add to wishlist</span>
                                        </a>
                                    </div>
                                </div>
                                <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1305" class="compare button" data-product_id="1305" rel="nofollow">Compare</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
<div class="col-md-6 xs-list-view">
    <div class="xs-product-widget media xs-md-20">
        <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Branch Apple" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/08-1-1.png"/>
        <noscript>
            <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/08-1-1.png" class="attachment-125x125 size-125x125" alt="Branch Apple"/>
        </noscript>
        <div class="media-body align-self-center product-widget-content">
            <div class="xs-product-header media xs-wishlist">
                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1566  wishlist-fragment on-first-load" data-fragment-ref="1566" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1566,&quot;parent_product_id&quot;:1566,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                    <div class="yith-wcwl-add-button">
                        <a href="?add_to_wishlist=1566&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1566" data-product-type="simple" data-original-product-id="1566" data-title="Add to wishlist" rel="nofollow">
                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                            <span>Add to wishlist</span>
                        </a>
                    </div>
                </div>
            </div>
            <h4 class="product-title">
                <a href="https://demo.xpeedstudio.com/marketov2/product/branch-apple/">Branch Apple</a>
            </h4>
            <span class="price">
                <span class="woocommerce-Price-amount amount">
                    <bdi>
                        <span class="woocommerce-Price-currencySymbol">&#36;</span>
                        12.00
                    </bdi>
                </span>
            </span>
        </div>
    </div>
</div>
<div class="col-lg-3 col-sm- col- product type-product post-1566 status-publish instock product_cat-uncategorized has-post-thumbnail shipping-taxable purchasable product-type-simple">
    <div class="xs-single-product">
        <div class="xs-product-wraper text-center">
            <a href="https://demo.xpeedstudio.com/marketov2/product/branch-apple/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/branch-apple/">
                    <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/08-1-1.png"/>
                    <noscript>
                        <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/08-1-1.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                    </noscript>
                </a>
                <ul class="product-item-meta">
                    <li class="xs-cart-wrapper">
                        <a href="?add-to-cart=1566" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="1566" data-product_sku="" aria-label="Add &ldquo;Branch Apple&rdquo; to your cart" rel="nofollow">Add to cart</a>
                    </li>
                    <li>
                        <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-1566">
                            <i class="xsicon xsicon-eye"></i>
                        </a>
                    </li>
                    <li class="xs-wishlist-wrapper xs-wishlist">
                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1566  wishlist-fragment on-first-load" data-fragment-ref="1566" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1566,&quot;parent_product_id&quot;:1566,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                            <div class="yith-wcwl-add-button">
                                <a href="?add_to_wishlist=1566&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1566" data-product-type="simple" data-original-product-id="1566" data-title="Add to wishlist" rel="nofollow">
                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                    <span>Add to wishlist</span>
                                </a>
                            </div>
                        </div>
                    </li>
                    <li class="xs-wishlist-wrapper xs-wishlist product">
                        <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1566" class="add-to-compare-link compare" data-product_id="1566">
                            <i class="xsicon xsicon-repeat"></i>
                        </a>
                    </li>
                </ul>
                <div class="xs-product-content">
                    <h4 class="product-title">
                        <a href="https://demo.xpeedstudio.com/marketov2/product/branch-apple/">Branch Apple</a>
                    </h4>
                    <span class="price">
                        <span class="woocommerce-Price-amount amount">
                            <bdi>
                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                12.00
                            </bdi>
                        </span>
                    </span>
                </div>
                <div class="xs-product-content">
            </a>
        </div>
    </div>
    <div class="list-group xs-list-group xs-product-content">Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. </div>
    <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-1566 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span class="xsicon xsicon-cross"></span>
                </button>
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="images">
                                <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/08-1-1.png"/>
                                <noscript>
                                    <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/05/08-1-1.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                </noscript>
                            </div>
                        </div>
                        <div class="col-md-6 align-self-center">
                            <div class="summary-content entry-summary">
                                <h1 class="product_title entry-title">Branch Apple</h1>
                                <div class="product_meta">
                                    <span class="posted_in">
                                        Category: <a href="https://demo.xpeedstudio.com/marketov2/product-category/uncategorized/" rel="tag">Uncategorized</a>
                                    </span>
                                </div>
                                <div class="woocommerce-product-details__short-description">
                                    <p>Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.</p>
                                </div>
                                <p class="price">
                                    <span class="woocommerce-Price-amount amount">
                                        <bdi>
                                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                            12.00
                                        </bdi>
                                    </span>
                                </p>
                                <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/branch-apple/" method="post" enctype='multipart/form-data'>
                                    <div class="quantity">
                                        <input type="button" value="-" class="minus"/>
                                        <label class="screen-reader-text" for="quantity_641887cd68274">Branch Apple quantity</label>
                                        <input type="number" id="quantity_641887cd68274" class="input-text qty text" step="1" min="1" max="" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                        <input type="button" value="+" class="plus"/>
                                    </div>
                                    <button type="submit" name="add-to-cart" value="1566" class="single_add_to_cart_button button alt">Add to cart</button>
                                </form>
                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-1566  wishlist-fragment on-first-load" data-fragment-ref="1566" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:1566,&quot;parent_product_id&quot;:1566,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                    <div class="yith-wcwl-add-button">
                                        <a href="?add_to_wishlist=1566&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="1566" data-product-type="simple" data-original-product-id="1566" data-title="Add to wishlist" rel="nofollow">
                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                            <span>Add to wishlist</span>
                                        </a>
                                    </div>
                                </div>
                                <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=1566" class="compare button" data-product_id="1566" rel="nofollow">Compare</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</div>
<div class="col-md-6 xs-list-view">
    <div class="xs-product-widget media xs-md-20">
        <img width="125" height="125" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20125%20125'%3E%3C/svg%3E" class="attachment-125x125 size-125x125" alt="Camera Drone" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/04/camera-drone-1.png"/>
        <noscript>
            <img width="125" height="125" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/04/camera-drone-1.png" class="attachment-125x125 size-125x125" alt="Camera Drone"/>
        </noscript>
        <div class="media-body align-self-center product-widget-content">
            <div class="xs-product-header media xs-wishlist">
                <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                    <span style="width:100%">
                        Rated <strong class="rating">5.00</strong>
                        out of 5
                    </span>
                </div>
                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-643  wishlist-fragment on-first-load" data-fragment-ref="643" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:643,&quot;parent_product_id&quot;:643,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                    <div class="yith-wcwl-add-button">
                        <a href="?add_to_wishlist=643&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="643" data-product-type="simple" data-original-product-id="643" data-title="Add to wishlist" rel="nofollow">
                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                            <span>Add to wishlist</span>
                        </a>
                    </div>
                </div>
            </div>
            <h4 class="product-title">
                <a href="https://demo.xpeedstudio.com/marketov2/product/camera-drone/">Camera Drone</a>
            </h4>
            <span class="price">
                <del aria-hidden="true">
                    <span class="woocommerce-Price-amount amount">
                        <bdi>
                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                            720.00
                        </bdi>
                    </span>
                </del>
                <ins>
                    <span class="woocommerce-Price-amount amount">
                        <bdi>
                            <span class="woocommerce-Price-currencySymbol">&#36;</span>
                            540.00
                        </bdi>
                    </span>
                </ins>
            </span>
        </div>
    </div>
</div>
<div class="col-lg-3 col-sm- col- product type-product post-643 status-publish last instock product_cat-drone product_cat-google-glass product_cat-headphone product_cat-light product_cat-mobile product_cat-projector product_cat-speaker has-post-thumbnail sale featured shipping-taxable purchasable product-type-simple">
    <div class="xs-single-product">
        <div class="xs-product-wraper text-center">
            <a href="https://demo.xpeedstudio.com/marketov2/product/camera-drone/" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                <span class="onsale">Sale!</span>
                <a class="xs_product_img_link" href="https://demo.xpeedstudio.com/marketov2/product/camera-drone/">
                    <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/04/camera-drone-1.png"/>
                    <noscript>
                        <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/04/camera-drone-1.png" class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail" alt=""/>
                    </noscript>
                </a>
                <ul class="product-item-meta">
                    <li class="xs-cart-wrapper">
                        <a href="?add-to-cart=643" data-quantity="1" class="button product_type_simple add_to_cart_button ajax_add_to_cart" data-product_id="643" data-product_sku="" aria-label="Add &ldquo;Camera Drone&rdquo; to your cart" rel="nofollow">Add to cart</a>
                    </li>
                    <li>
                        <a href="#" data-toggle="modal" data-target=".xs-quick-view-modal-643">
                            <i class="xsicon xsicon-eye"></i>
                        </a>
                    </li>
                    <li class="xs-wishlist-wrapper xs-wishlist">
                        <div class="yith-wcwl-add-to-wishlist add-to-wishlist-643  wishlist-fragment on-first-load" data-fragment-ref="643" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:643,&quot;parent_product_id&quot;:643,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                            <div class="yith-wcwl-add-button">
                                <a href="?add_to_wishlist=643&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="643" data-product-type="simple" data-original-product-id="643" data-title="Add to wishlist" rel="nofollow">
                                    <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                    <span>Add to wishlist</span>
                                </a>
                            </div>
                        </div>
                    </li>
                    <li class="xs-wishlist-wrapper xs-wishlist product">
                        <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=643" class="add-to-compare-link compare" data-product_id="643">
                            <i class="xsicon xsicon-repeat"></i>
                        </a>
                    </li>
                </ul>
                <div class="xs-product-content">
                    <h4 class="product-title">
                        <a href="https://demo.xpeedstudio.com/marketov2/product/camera-drone/">Camera Drone</a>
                    </h4>
                    <span class="price">
                        <del aria-hidden="true">
                            <span class="woocommerce-Price-amount amount">
                                <bdi>
                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                    720.00
                                </bdi>
                            </span>
                        </del>
                        <ins>
                            <span class="woocommerce-Price-amount amount">
                                <bdi>
                                    <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                    540.00
                                </bdi>
                            </span>
                        </ins>
                    </span>
                </div>
                <div class="xs-product-content">
            </a>
        </div>
    </div>
    <div class="list-group xs-list-group xs-product-content">Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget,&hellip;</div>
    <div class="woocommerce xs-modal xs-modal-quick-view xs-quick-view-modal-643 modal fade" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span class="xsicon xsicon-cross"></span>
                </button>
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="images">
                                <img width="640" height="640" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20640%20640'%3E%3C/svg%3E" class="attachment-full size-full wp-post-image" alt="" loading="lazy" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/04/camera-drone-1.png"/>
                                <noscript>
                                    <img width="640" height="640" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2018/04/camera-drone-1.png" class="attachment-full size-full wp-post-image" alt="" loading="lazy"/>
                                </noscript>
                            </div>
                        </div>
                        <div class="col-md-6 align-self-center">
                            <div class="summary-content entry-summary">
                                <h1 class="product_title entry-title">Camera Drone</h1>
                                <div class="product_meta">
                                    <span class="posted_in">
                                        Categories: <a href="https://demo.xpeedstudio.com/marketov2/product-category/drone/" rel="tag">Drone</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/3d-glass/google-glass/" rel="tag">Google Glass</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/headphone/" rel="tag">Headphone</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/light/" rel="tag">Light</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/mobile/" rel="tag">Mobile</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/projector/" rel="tag">Projector</a>
                                        , <a href="https://demo.xpeedstudio.com/marketov2/product-category/speaker/" rel="tag">Speaker</a>
                                    </span>
                                </div>
                                <div class="woocommerce-product-rating">
                                    <div class="star-rating" role="img" aria-label="Rated 5.00 out of 5">
                                        <span style="width:100%">
                                            Rated <strong class="rating">5.00</strong>
                                            out of 5 based on <span class="rating">1</span>
                                            customer rating
                                        </span>
                                    </div>
                                    <a href="#reviews" class="woocommerce-review-link" rel="nofollow">
                                        (<span class="count">1</span>
                                        customer review)
                                    </a>
                                </div>
                                <div class="woocommerce-product-details__short-description">
                                    <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p>
                                </div>
                                <p class="price">
                                    <del aria-hidden="true">
                                        <span class="woocommerce-Price-amount amount">
                                            <bdi>
                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                720.00
                                            </bdi>
                                        </span>
                                    </del>
                                    <ins>
                                        <span class="woocommerce-Price-amount amount">
                                            <bdi>
                                                <span class="woocommerce-Price-currencySymbol">&#36;</span>
                                                540.00
                                            </bdi>
                                        </span>
                                    </ins>
                                </p>
                                <p class="stock in-stock">4 in stock</p>
                                <form class="cart" action="https://demo.xpeedstudio.com/marketov2/product/camera-drone/" method="post" enctype='multipart/form-data'>
                                    <div class="quantity">
                                        <input type="button" value="-" class="minus"/>
                                        <label class="screen-reader-text" for="quantity_641887cd692d8">Camera Drone quantity</label>
                                        <input type="number" id="quantity_641887cd692d8" class="input-text qty text" step="1" min="1" max="4" name="quantity" value="1" title="Qty" size="4" inputmode="numeric"/>
                                        <input type="button" value="+" class="plus"/>
                                    </div>
                                    <button type="submit" name="add-to-cart" value="643" class="single_add_to_cart_button button alt">Add to cart</button>
                                </form>
                                <div class="yith-wcwl-add-to-wishlist add-to-wishlist-643  wishlist-fragment on-first-load" data-fragment-ref="643" data-fragment-options="{&quot;base_url&quot;:&quot;&quot;,&quot;in_default_wishlist&quot;:false,&quot;is_single&quot;:false,&quot;show_exists&quot;:false,&quot;product_id&quot;:643,&quot;parent_product_id&quot;:643,&quot;product_type&quot;:&quot;simple&quot;,&quot;show_view&quot;:false,&quot;browse_wishlist_text&quot;:&quot;Browse wishlist&quot;,&quot;already_in_wishslist_text&quot;:&quot;The product is already in your wishlist!&quot;,&quot;product_added_text&quot;:&quot;Product added!&quot;,&quot;heading_icon&quot;:&quot;fa-heart-o&quot;,&quot;available_multi_wishlist&quot;:false,&quot;disable_wishlist&quot;:false,&quot;show_count&quot;:false,&quot;ajax_loading&quot;:false,&quot;loop_position&quot;:&quot;after_add_to_cart&quot;,&quot;item&quot;:&quot;add_to_wishlist&quot;}">
                                    <div class="yith-wcwl-add-button">
                                        <a href="?add_to_wishlist=643&#038;_wpnonce=8ebcfc6472" class="add_to_wishlist single_add_to_wishlist" data-product-id="643" data-product-type="simple" data-original-product-id="643" data-title="Add to wishlist" rel="nofollow">
                                            <i class="yith-wcwl-icon fa fa-heart-o"></i>
                                            <span>Add to wishlist</span>
                                        </a>
                                    </div>
                                </div>
                                <a href="https://demo.xpeedstudio.com/marketov2?action=yith-woocompare-add-product&id=643" class="compare button" data-product_id="643" rel="nofollow">Compare</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</div></div></div>
<nav class="woocommerce-pagination">
    <ul class='page-numbers'>
        <li>
            <span aria-current="page" class="page-numbers current">1</span>
        </li>
        <li>
            <a class="page-numbers" href="https://demo.xpeedstudio.com/marketov2/shop/page/2/">2</a>
        </li>
        <li>
            <a class="page-numbers" href="https://demo.xpeedstudio.com/marketov2/shop/page/3/">3</a>
        </li>
        <li>
            <a class="page-numbers" href="https://demo.xpeedstudio.com/marketov2/shop/page/4/">4</a>
        </li>
        <li>
            <span class="page-numbers dots">&hellip;</span>
        </li>
        <li>
            <a class="page-numbers" href="https://demo.xpeedstudio.com/marketov2/shop/page/6/">6</a>
        </li>
        <li>
            <a class="page-numbers" href="https://demo.xpeedstudio.com/marketov2/shop/page/7/">7</a>
        </li>
        <li>
            <a class="page-numbers" href="https://demo.xpeedstudio.com/marketov2/shop/page/8/">8</a>
        </li>
        <li>
            <a class="next page-numbers" href="https://demo.xpeedstudio.com/marketov2/shop/page/2/">&rarr;</a>
        </li>
    </ul>
</nav>
</div></div></div></div></div>
<div data-elementor-type="wp-post" data-elementor-id="2235" class="elementor elementor-2235" data-elementor-settings="[]">
    <div class="elementor-section-wrap">
        <section class="elementor-section elementor-top-section elementor-element elementor-element-10a5c9f elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="10a5c9f" data-element_type="section">
            <div class="elementor-container elementor-column-gap-default">
                <div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-d0d6414" data-id="d0d6414" data-element_type="column">
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <div class="elementor-element elementor-element-c8f78e1 elementor-widget elementor-widget-image" data-id="c8f78e1" data-element_type="widget" data-widget_type="image.default">
                            <div class="elementor-widget-container">
                                <a href="https://demo.xpeedstudio.com/marketov2/">
                                    <img width="129" height="21" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20129%2021'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/logo_3-1.png"/>
                                    <noscript>
                                        <img width="129" height="21" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/logo_3-1.png" class="attachment-full size-full" alt=""/>
                                    </noscript>
                                </a>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-ea20223 elementor-widget elementor-widget-elementskit-heading" data-id="ea20223" data-element_type="widget" data-widget_type="elementskit-heading.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                        <h2 class="ekit-heading--title elementskit-section-title ">Got Question? Call us 24/7
</h2>
                                        <h3 class="ekit-heading--subtitle elementskit-section-subtitle  ">[80] 1017 197</h3>
                                        <div class='ekit-heading__description'>
                                            <p>17 Princess Road, London, Greater London NW1 8JR, UK</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-7fe3b96 elementor-widget elementor-widget-elementskit-button" data-id="7fe3b96" data-element_type="widget" data-widget_type="elementskit-button.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <div class="ekit-btn-wraper">
                                        <a href="https://goo.gl/maps/9rqYVpJUVzBPvKyt7" target="_blank" rel="nofollow" class="elementskit-btn  whitespace--normal">
                                            <i aria-hidden="true" class="xsicon xsicon-map-marker"></i>
                                            View On Map 
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-063fbf2" data-id="063fbf2" data-element_type="column">
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <div class="elementor-element elementor-element-fa2f7d0 elementor-widget elementor-widget-elementskit-heading" data-id="fa2f7d0" data-element_type="widget" data-widget_type="elementskit-heading.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                        <h2 class="ekit-heading--title elementskit-section-title ">We Using
</h2>
                                        <h3 class="ekit-heading--subtitle elementskit-section-subtitle  ">Safe Payments</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-683fff2 elementor-widget__width-auto elementor-widget elementor-widget-image" data-id="683fff2" data-element_type="widget" data-widget_type="image.default">
                            <div class="elementor-widget-container">
                                <img width="41" height="15" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2041%2015'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/skril-1-1.png"/>
                                <noscript>
                                    <img width="41" height="15" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/skril-1-1.png" class="attachment-full size-full" alt=""/>
                                </noscript>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-0e1cbf3 elementor-widget__width-auto elementor-widget elementor-widget-image" data-id="0e1cbf3" data-element_type="widget" data-widget_type="image.default">
                            <div class="elementor-widget-container">
                                <img width="51" height="15" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2051%2015'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/palypal-1-1.png"/>
                                <noscript>
                                    <img width="51" height="15" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/palypal-1-1.png" class="attachment-full size-full" alt=""/>
                                </noscript>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-c629534 elementor-widget__width-auto elementor-widget elementor-widget-image" data-id="c629534" data-element_type="widget" data-widget_type="image.default">
                            <div class="elementor-widget-container">
                                <img width="51" height="17" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2051%2017'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/american_express-1-1.png"/>
                                <noscript>
                                    <img width="51" height="17" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/american_express-1-1.png" class="attachment-full size-full" alt=""/>
                                </noscript>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-e9bff14 elementor-widget elementor-widget-heading" data-id="e9bff14" data-element_type="widget" data-widget_type="heading.default">
                            <div class="elementor-widget-container">
                                <style>
                                    /*! elementor - v3.5.6 - 28-02-2022 */
                                    .elementor-heading-title {
                                        padding: 0;
                                        margin: 0;
                                        line-height: 1
                                    }

                                    .elementor-widget-heading .elementor-heading-title[class*=elementor-size-]>a {
                                        color: inherit;
                                        font-size: inherit;
                                        line-height: inherit
                                    }

                                    .elementor-widget-heading .elementor-heading-title.elementor-size-small {
                                        font-size: 15px
                                    }

                                    .elementor-widget-heading .elementor-heading-title.elementor-size-medium {
                                        font-size: 19px
                                    }

                                    .elementor-widget-heading .elementor-heading-title.elementor-size-large {
                                        font-size: 29px
                                    }

                                    .elementor-widget-heading .elementor-heading-title.elementor-size-xl {
                                        font-size: 39px
                                    }

                                    .elementor-widget-heading .elementor-heading-title.elementor-size-xxl {
                                        font-size: 59px
                                    }
                                </style>
                                <h2 class="elementor-heading-title elementor-size-default">Secured by:</h2>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-e927276 elementor-widget__width-auto elementor-widget elementor-widget-image" data-id="e927276" data-element_type="widget" data-widget_type="image.default">
                            <div class="elementor-widget-container">
                                <img width="83" height="32" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2083%2032'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/norton_av_logo1-1.png"/>
                                <noscript>
                                    <img width="83" height="32" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/norton_av_logo1-1.png" class="attachment-full size-full" alt=""/>
                                </noscript>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-27cf90a elementor-widget__width-auto elementor-widget elementor-widget-image" data-id="27cf90a" data-element_type="widget" data-widget_type="image.default">
                            <div class="elementor-widget-container">
                                <img width="106" height="33" src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20106%2033'%3E%3C/svg%3E" class="attachment-full size-full" alt="" data-lazy-src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/mcAfee_logo1-1.png"/>
                                <noscript>
                                    <img width="106" height="33" src="https://demo.xpeedstudio.com/marketov2/wp-content/uploads/2020/06/mcAfee_logo1-1.png" class="attachment-full size-full" alt=""/>
                                </noscript>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-6c9e194" data-id="6c9e194" data-element_type="column">
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <div class="elementor-element elementor-element-b3b05df elementor-widget elementor-widget-elementskit-heading" data-id="b3b05df" data-element_type="widget" data-widget_type="elementskit-heading.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                        <h2 class="ekit-heading--title elementskit-section-title ">Our Stores
</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-73635b5 elementor-widget elementor-widget-elementskit-page-list" data-id="73635b5" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <div class="elementor-icon-list-items ">
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-5d2d678 ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">New York</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-ef1480a ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">London SF</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-54abc1c ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Cockfosters BP</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-da308ec ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Los Angeles</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2d84694 ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Chicago</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-6497772 ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Las Vegas</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-7b83a26 ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Albarto</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="elementor-column elementor-col-25 elementor-top-column elementor-element elementor-element-65a93b4" data-id="65a93b4" data-element_type="column">
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <div class="elementor-element elementor-element-330c3a4 elementor-widget elementor-widget-elementskit-heading" data-id="330c3a4" data-element_type="widget" data-widget_type="elementskit-heading.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-">
                                        <h2 class="ekit-heading--title elementskit-section-title ">Quick Links
</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="elementor-element elementor-element-61f0766 elementor-widget elementor-widget-elementskit-page-list" data-id="61f0766" data-element_type="widget" data-widget_type="elementskit-page-list.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <div class="elementor-icon-list-items ">
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-5d2d678 ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Support Center</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-ef1480a ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Term &amp;Conditions</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-54abc1c ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Shipping</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-da308ec ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Privacy Policy</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-2d84694 ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Help</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-6497772 ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">Products Return</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div class="elementor-icon-list-item   ">
                                            <a target=_blank rel="" href="#" class="elementor-repeater-item-7b83a26 ekit_badge_left">
                                                <div class="ekit_page_list_content">
                                                    <span class="elementor-icon-list-text">
                                                        <span class="ekit_page_list_title_title">FAQS</span>
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="elementor-section elementor-top-section elementor-element elementor-element-04a5181 elementor-section-stretched elementor-section-full_width elementor-section-height-default elementor-section-height-default" data-id="04a5181" data-element_type="section" data-settings="{&quot;stretch_section&quot;:&quot;section-stretched&quot;}">
            <div class="elementor-container elementor-column-gap-default">
                <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-8f60ae7" data-id="8f60ae7" data-element_type="column">
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <div class="elementor-element elementor-element-b9f5266 elementor-widget elementor-widget-xs-back-to-top" data-id="b9f5266" data-element_type="widget" data-widget_type="xs-back-to-top.default">
                            <div class="elementor-widget-container">
                                <div class="xs-back-to-top-wraper">
                                    <a href="#" class="xs-back-to-top btn btn-success">
                                        Back top<i class="xsicon xsicon-arrow-right"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="elementor-section elementor-top-section elementor-element elementor-element-8f9eb7b elementor-section-full_width elementor-section-content-middle elementor-section-height-default elementor-section-height-default" data-id="8f9eb7b" data-element_type="section" data-settings="{&quot;background_background&quot;:&quot;classic&quot;}">
            <div class="elementor-container elementor-column-gap-default">
                <div class="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-8d06d0c" data-id="8d06d0c" data-element_type="column">
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <div class="elementor-element elementor-element-57665aa elementor-widget elementor-widget-elementskit-heading" data-id="57665aa" data-element_type="widget" data-widget_type="elementskit-heading.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <div class="ekit-heading elementskit-section-title-wraper text_left   ekit_heading_tablet-   ekit_heading_mobile-text_center">
                                        <h2 class="ekit-heading--title elementskit-section-title ">
                                            © 2021 <span>XpeedStudio</span>
                                            All Rights Reserved

                                        </h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="elementor-column elementor-col-50 elementor-top-column elementor-element elementor-element-02a395b" data-id="02a395b" data-element_type="column">
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <div class="elementor-element elementor-element-149b3e7 elementor-widget elementor-widget-elementskit-social-media" data-id="149b3e7" data-element_type="widget" data-widget_type="elementskit-social-media.default">
                            <div class="elementor-widget-container">
                                <div class="ekit-wid-con">
                                    <ul class="ekit_social_media">
                                        <li class="elementor-repeater-item-8318e77">
                                            <a href="https://facebook.com" class="f">
                                                <i aria-hidden="true" class="xsicon xsicon-facebook-f"></i>
                                                Facebook 
                                            </a>
                                        </li>
                                        <li class="elementor-repeater-item-b7df304">
                                            <a href="https://facebook.com" class="twitter">
                                                <i aria-hidden="true" class="xsicon xsicon-twitter"></i>
                                                Twitter 
                                            </a>
                                        </li>
                                        <li class="elementor-repeater-item-ba3eff1">
                                            <a href="https://facebook.com" class="p">
                                                <i aria-hidden="true" class="xsicon xsicon-pinterest-p"></i>
                                                Pinterest 
                                            </a>
                                        </li>
                                        <li class="elementor-repeater-item-c7ff063">
                                            <a href="https://facebook.com" class="instagram">
                                                <i aria-hidden="true" class="xsicon xsicon-instagram"></i>
                                                Instragram 
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="elementor-section elementor-top-section elementor-element elementor-element-91c9ed4 ekit-sticky--bottom xs_marketo_mobile_categpry_item elementor-hidden-desktop elementor-hidden-tablet elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="91c9ed4" data-element_type="section" data-settings="{&quot;ekit_sticky&quot;:&quot;bottom&quot;,&quot;ekit_sticky_offset&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;size&quot;:0,&quot;sizes&quot;:[]},&quot;ekit_sticky_on&quot;:&quot;desktop_tablet_mobile&quot;,&quot;ekit_sticky_effect_offset&quot;:{&quot;unit&quot;:&quot;px&quot;,&quot;size&quot;:0,&quot;sizes&quot;:[]}}">
            <div class="elementor-container elementor-column-gap-no">
                <div class="elementor-column elementor-col-100 elementor-top-column elementor-element elementor-element-72c7ff9" data-id="72c7ff9" data-element_type="column">
                    <div class="elementor-widget-wrap elementor-element-populated">
                        <section class="elementor-section elementor-inner-section elementor-element elementor-element-5c0e557 elementor-section-boxed elementor-section-height-default elementor-section-height-default" data-id="5c0e557" data-element_type="section">
                            <div class="elementor-container elementor-column-gap-default">
                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-898d034" data-id="898d034" data-element_type="column">
                                    <div class="elementor-widget-wrap elementor-element-populated">
                                        <div class="elementor-element elementor-element-9740208 elementor-view-default elementor-position-top elementor-vertical-align-top elementor-widget elementor-widget-icon-box" data-id="9740208" data-element_type="widget" data-widget_type="icon-box.default">
                                            <div class="elementor-widget-container">
                                                <style>
                                                    /*! elementor - v3.5.6 - 28-02-2022 */
                                                    @media (min-width: 768px) {
                                                        .elementor-widget-icon-box.elementor-position-left .elementor-icon-box-wrapper,.elementor-widget-icon-box.elementor-position-right .elementor-icon-box-wrapper {
                                                            display:-webkit-box;
                                                            display: -ms-flexbox;
                                                            display: flex
                                                        }

                                                        .elementor-widget-icon-box.elementor-position-left .elementor-icon-box-icon,.elementor-widget-icon-box.elementor-position-right .elementor-icon-box-icon {
                                                            display: -webkit-inline-box;
                                                            display: -ms-inline-flexbox;
                                                            display: inline-flex;
                                                            -webkit-box-flex: 0;
                                                            -ms-flex: 0 0 auto;
                                                            flex: 0 0 auto
                                                        }

                                                        .elementor-widget-icon-box.elementor-position-right .elementor-icon-box-wrapper {
                                                            text-align: right;
                                                            -webkit-box-orient: horizontal;
                                                            -webkit-box-direction: reverse;
                                                            -ms-flex-direction: row-reverse;
                                                            flex-direction: row-reverse
                                                        }

                                                        .elementor-widget-icon-box.elementor-position-left .elementor-icon-box-wrapper {
                                                            text-align: left;
                                                            -webkit-box-orient: horizontal;
                                                            -webkit-box-direction: normal;
                                                            -ms-flex-direction: row;
                                                            flex-direction: row
                                                        }

                                                        .elementor-widget-icon-box.elementor-position-top .elementor-icon-box-img {
                                                            margin: auto
                                                        }

                                                        .elementor-widget-icon-box.elementor-vertical-align-top .elementor-icon-box-wrapper {
                                                            -webkit-box-align: start;
                                                            -ms-flex-align: start;
                                                            align-items: flex-start
                                                        }

                                                        .elementor-widget-icon-box.elementor-vertical-align-middle .elementor-icon-box-wrapper {
                                                            -webkit-box-align: center;
                                                            -ms-flex-align: center;
                                                            align-items: center
                                                        }

                                                        .elementor-widget-icon-box.elementor-vertical-align-bottom .elementor-icon-box-wrapper {
                                                            -webkit-box-align: end;
                                                            -ms-flex-align: end;
                                                            align-items: flex-end
                                                        }
                                                    }

                                                    @media (max-width: 767px) {
                                                        .elementor-widget-icon-box .elementor-icon-box-icon {
                                                            margin-left:auto!important;
                                                            margin-right: auto!important;
                                                            margin-bottom: 15px
                                                        }
                                                    }

                                                    .elementor-widget-icon-box .elementor-icon-box-wrapper {
                                                        text-align: center
                                                    }

                                                    .elementor-widget-icon-box .elementor-icon-box-title a {
                                                        color: inherit
                                                    }

                                                    .elementor-widget-icon-box .elementor-icon-box-content {
                                                        -webkit-box-flex: 1;
                                                        -ms-flex-positive: 1;
                                                        flex-grow: 1
                                                    }

                                                    .elementor-widget-icon-box .elementor-icon-box-description {
                                                        margin: 0
                                                    }
                                                </style>
                                                <div class="elementor-icon-box-wrapper">
                                                    <div class="elementor-icon-box-icon">
                                                        <a class="elementor-icon elementor-animation-" href="/marketo/">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                                                                <path d="M575.8 255.5C575.8 273.5 560.8 287.6 543.8 287.6H511.8L512.5 447.7C512.5 450.5 512.3 453.1 512 455.8V472C512 494.1 494.1 512 472 512H456C454.9 512 453.8 511.1 452.7 511.9C451.3 511.1 449.9 512 448.5 512H392C369.9 512 352 494.1 352 472V384C352 366.3 337.7 352 320 352H256C238.3 352 224 366.3 224 384V472C224 494.1 206.1 512 184 512H128.1C126.6 512 125.1 511.9 123.6 511.8C122.4 511.9 121.2 512 120 512H104C81.91 512 64 494.1 64 472V360C64 359.1 64.03 358.1 64.09 357.2V287.6H32.05C14.02 287.6 0 273.5 0 255.5C0 246.5 3.004 238.5 10.01 231.5L266.4 8.016C273.4 1.002 281.4 0 288.4 0C295.4 0 303.4 2.004 309.5 7.014L564.8 231.5C572.8 238.5 576.9 246.5 575.8 255.5L575.8 255.5z"></path>
                                                            </svg>
                                                        </a>
                                                    </div>
                                                    <div class="elementor-icon-box-content">
                                                        <h3 class="elementor-icon-box-title">
                                                            <a href="/marketo/"></a>
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-2743931" data-id="2743931" data-element_type="column">
                                    <div class="elementor-widget-wrap elementor-element-populated">
                                        <div class="elementor-element elementor-element-9693105 elementor-view-default elementor-position-top elementor-vertical-align-top elementor-widget elementor-widget-icon-box" data-id="9693105" data-element_type="widget" data-widget_type="icon-box.default">
                                            <div class="elementor-widget-container">
                                                <div class="elementor-icon-box-wrapper">
                                                    <div class="elementor-icon-box-icon">
                                                        <a class="elementor-icon elementor-animation-" href="#">
                                                            <i aria-hidden="true" class="xsicon xsicon-user-regular"></i>
                                                        </a>
                                                    </div>
                                                    <div class="elementor-icon-box-content">
                                                        <h3 class="elementor-icon-box-title">
                                                            <a href="#"></a>
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-1fb8e80" data-id="1fb8e80" data-element_type="column">
                                    <div class="elementor-widget-wrap elementor-element-populated">
                                        <div class="elementor-element elementor-element-887d1bc elementor-view-default elementor-position-top elementor-vertical-align-top elementor-widget elementor-widget-icon-box" data-id="887d1bc" data-element_type="widget" data-widget_type="icon-box.default">
                                            <div class="elementor-widget-container">
                                                <div class="elementor-icon-box-wrapper">
                                                    <div class="elementor-icon-box-icon">
                                                        <a class="elementor-icon elementor-animation-" href="#">
                                                            <i aria-hidden="true" class="xsicon xsicon-shopping-bag"></i>
                                                        </a>
                                                    </div>
                                                    <div class="elementor-icon-box-content">
                                                        <h3 class="elementor-icon-box-title">
                                                            <a href="#"></a>
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="elementor-column elementor-col-25 elementor-inner-column elementor-element elementor-element-93b2e1c" data-id="93b2e1c" data-element_type="column">
                                    <div class="elementor-widget-wrap elementor-element-populated">
                                        <div class="elementor-element elementor-element-64bb8b2 elementor-view-default elementor-position-top elementor-vertical-align-top elementor-widget elementor-widget-icon-box" data-id="64bb8b2" data-element_type="widget" data-widget_type="icon-box.default">
                                            <div class="elementor-widget-container">
                                                <div class="elementor-icon-box-wrapper">
                                                    <div class="elementor-icon-box-icon">
                                                        <a class="elementor-icon elementor-animation-" href="#">
                                                            <i aria-hidden="true" class="xsicon xsicon-bars"></i>
                                                        </a>
                                                    </div>
                                                    <div class="elementor-icon-box-content">
                                                        <h3 class="elementor-icon-box-title">
                                                            <a href="#"></a>
                                                        </h3>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>
<script type="rocketlazyloadscript" data-rocket-type="text/javascript">
    
			window.RS_MODULES = window.RS_MODULES || {};
			window.RS_MODULES.modules = window.RS_MODULES.modules || {};
			window.RS_MODULES.waiting = window.RS_MODULES.waiting || [];
			window.RS_MODULES.defered = true;
			window.RS_MODULES.moduleWaiting = window.RS_MODULES.moduleWaiting || {};
			window.RS_MODULES.type = 'compiled';
		
</script>
<script type="application/ld+json">
    {"@context":"https:\/\/schema.org\/","@graph":[{"@context":"https:\/\/schema.org\/","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"item":{"name":"Home","@id":"https:\/\/demo.xpeedstudio.com\/marketov2"}},{"@type":"ListItem","position":2,"item":{"name":"Shop","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/shop\/"}}]},{"@context":"https:\/\/schema.org\/","@graph":[{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/3d-glass\/#product","name":"3D Glass","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/3d-glass\/","description":"Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2013\/06\/3D-VR-Glass-Virtual-Reality-1.jpg","sku":22,"offers":[{"@type":"Offer","price":"540.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"540.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/OutOfStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/3d-glass\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.33","reviewCount":3},"review":[{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"5","worstRating":"1"},"author":{"@type":"Person","name":"Stuart"},"reviewBody":"Great T-shirt quality, Great Design and Great Service.","datePublished":"2013-06-07T13:02:14+00:00"},{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"4","worstRating":"1"},"author":{"@type":"Person","name":"Cobus Bester"},"reviewBody":"Very comfortable shirt, and I love the graphic!","datePublished":"2013-06-07T11:55:15+00:00"},{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"4","worstRating":"1"},"author":{"@type":"Person","name":"James Koster"},"reviewBody":"Nice T-shirt, I got one in black. Goes with anything!","datePublished":"2013-06-07T11:43:13+00:00"}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/3d-vr-glass\/#product","name":"3D VR Glass","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/3d-vr-glass\/","description":"Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2013\/06\/3D-VR-Glass-1.jpg","sku":67,"offers":[{"@type":"Offer","price":"245.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"245.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/3d-vr-glass\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"1.00","reviewCount":1},"review":[{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"1","worstRating":"1"},"author":{"@type":"Person","name":"admin"},"reviewBody":"nice","datePublished":"2018-04-20T11:24:51+00:00"}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/7th-generation\/#product","name":"7th Generation","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/7th-generation\/","description":"","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/05\/13-2.png","sku":1263,"offers":[{"@type":"Offer","price":"520.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"520.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/7th-generation\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/apple-iphone-6s\/#product","name":"Apple iPhone 6s","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/apple-iphone-6s\/","description":"Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/05\/21-1.png","sku":1312,"offers":[{"@type":"Offer","price":"299.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"299.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/apple-iphone-6s\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.00","reviewCount":1},"review":[{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"5","worstRating":"1"},"author":{"@type":"Person","name":"Marketo@demo"},"reviewBody":"One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his","datePublished":"2018-07-10T06:26:15+00:00"}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/apple-iphone-7s\/#product","name":"Apple iPhone 7s","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/apple-iphone-7s\/","description":"Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/05\/24-1.png","sku":1319,"offers":[{"@type":"Offer","price":"660.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"660.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/OutOfStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/apple-iphone-7s\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.00","reviewCount":1},"review":[{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"5","worstRating":"1"},"author":{"@type":"Person","name":"Marketo@demo"},"reviewBody":"One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his","datePublished":"2018-07-18T11:56:47+00:00"}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bevigac-gamepad\/#product","name":"Bevigac Gamepad","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bevigac-gamepad\/","description":"Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/05\/47-1.png","sku":1333,"offers":[{"@type":"Offer","price":"220.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"220.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bevigac-gamepad\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.00","reviewCount":1},"review":[{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"4","worstRating":"1"},"author":{"@type":"Person","name":"Marketo@demo"},"reviewBody":"One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his","datePublished":"2018-07-18T11:56:09+00:00"}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/black-solid-color-full-sleeve\/#product","name":"Black Solid Color Full Sleeve","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/black-solid-color-full-sleeve\/","description":"Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/05\/30-1.png","sku":1691,"offers":[{"@type":"Offer","price":"29.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"29.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/black-solid-color-full-sleeve\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bluetooth-gamepad\/#product","name":"Bluetooth Gamepad","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bluetooth-gamepad\/","description":"Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/05\/45-1.png","sku":1322,"offers":[{"@type":"Offer","price":"199.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"199.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bluetooth-gamepad\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.00","reviewCount":1},"review":[{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"5","worstRating":"1"},"author":{"@type":"Person","name":"Marketo@demo"},"reviewBody":"One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his","datePublished":"2018-07-10T06:26:08+00:00"}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bluetooth-speaker\/#product","name":"Bluetooth Speaker","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bluetooth-speaker\/","description":"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.\r\n\r\nDonec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2013\/06\/HTB1olbtmlDH8KJj-1.jpg","sku":599,"offers":[{"@type":"Offer","price":"70.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"70.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/OutOfStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bluetooth-speaker\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bracelet-watch\/#product","name":"Bracelet Watch","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bracelet-watch\/","description":"Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/05\/43-1.png","sku":1305,"offers":[{"@type":"Offer","price":"40.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"40.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/bracelet-watch\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/branch-apple\/#product","name":"Branch Apple","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/branch-apple\/","description":"Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/05\/08-1-1.png","sku":1566,"offers":[{"@type":"Offer","price":"12.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"12.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/branch-apple\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}]},{"@type":"Product","@id":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/camera-drone\/#product","name":"Camera Drone","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/camera-drone\/","description":"Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.","image":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/uploads\/2018\/04\/camera-drone-1.png","sku":643,"offers":[{"@type":"Offer","price":"540.00","priceValidUntil":"2024-12-31","priceSpecification":{"price":"540.00","priceCurrency":"USD","valueAddedTaxIncluded":"false"},"priceCurrency":"USD","availability":"http:\/\/schema.org\/InStock","url":"https:\/\/demo.xpeedstudio.com\/marketov2\/product\/camera-drone\/","seller":{"@type":"Organization","name":"Marketo","url":"https:\/\/demo.xpeedstudio.com\/marketov2"}}],"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.00","reviewCount":1},"review":[{"@type":"Review","reviewRating":{"@type":"Rating","bestRating":"5","ratingValue":"5","worstRating":"1"},"author":{"@type":"Person","name":"Marketo@demo"},"reviewBody":"One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his","datePublished":"2018-07-10T06:20:49+00:00"}]}]}]}
</script>
<script type="rocketlazyloadscript" data-rocket-type="text/javascript">
    
		(function () {
			var c = document.body.className;
			c = c.replace(/woocommerce-no-js/, 'woocommerce-js');
			document.body.className = c;
		})();
	
</script>
<link rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/css/frontend-lite.min.css?ver=3.5.6' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-2234.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css?ver=1651168236' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css?ver=3.5.6' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3640.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3672.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3685.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3690.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3697.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3706.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-2235.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-6.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/global.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/widget-styles-pro.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/animations/animations.min.css?ver=3.5.6' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<link data-minify="1" rel='preload' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/revslider/public/assets/css/rs6.css?ver=1651166584' data-rocket-async="style" as="style" onload="this.onload=null;this.rel='stylesheet'" type='text/css' media='all'/>
<style id='rs-plugin-settings-inline-css' type='text/css'>
    #rs-demo-id {
    }
</style>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/yith-woocommerce-wishlist/assets/js/jquery.selectBox.min.js?ver=1.2.0' id='jquery-selectBox-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='//demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/js/prettyPhoto/jquery.prettyPhoto.min.js?ver=3.1.6' id='prettyPhoto-js' defer></script>
<script type='text/javascript' id='jquery-yith-wcwl-js-extra'>
    /* <![CDATA[ */
    var yith_wcwl_l10n = {
        "ajax_url": "\/marketov2\/wp-admin\/admin-ajax.php",
        "redirect_to_cart": "no",
        "multi_wishlist": "",
        "hide_add_button": "1",
        "enable_ajax_loading": "",
        "ajax_loader_url": "https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/plugins\/yith-woocommerce-wishlist\/assets\/images\/ajax-loader-alt.svg",
        "remove_from_wishlist_after_add_to_cart": "1",
        "is_wishlist_responsive": "1",
        "time_to_close_prettyphoto": "3000",
        "fragments_index_glue": ".",
        "reload_on_found_variation": "1",
        "mobile_media_query": "768",
        "labels": {
            "cookie_disabled": "We are sorry, but this feature is available only if cookies on your browser are enabled.",
            "added_to_cart_message": "<div class=\"woocommerce-notices-wrapper\"><div class=\"woocommerce-message\" role=\"alert\">Product added to cart successfully<\/div><\/div>"
        },
        "actions": {
            "add_to_wishlist_action": "add_to_wishlist",
            "remove_from_wishlist_action": "remove_from_wishlist",
            "reload_wishlist_and_adding_elem_action": "reload_wishlist_and_adding_elem",
            "load_mobile_action": "load_mobile",
            "delete_item_action": "delete_item",
            "save_title_action": "save_title",
            "save_privacy_action": "save_privacy",
            "load_fragments": "load_fragments"
        },
        "nonce": {
            "add_to_wishlist_nonce": "8ebcfc6472",
            "remove_from_wishlist_nonce": "69ae737e87",
            "reload_wishlist_and_adding_elem_nonce": "4f8af297d8",
            "load_mobile_nonce": "3291f8366d",
            "delete_item_nonce": "6edab8d120",
            "save_title_nonce": "34d596d500",
            "save_privacy_nonce": "336d35cbbd",
            "load_fragments_nonce": "ed29186224"
        }
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/yith-woocommerce-wishlist/assets/js/jquery.yith-wcwl.min.js?ver=3.6.0' id='jquery-yith-wcwl-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/revslider/public/assets/js/rbtools.min.js?ver=6.5.8' defer async id='tp-tools-js'></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/revslider/public/assets/js/rs6.min.js?ver=6.5.8' defer async id='revmin-js'></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/js/jquery-blockui/jquery.blockUI.min.js?ver=2.7.0-wc.6.2.2' id='jquery-blockui-js' defer></script>
<script type='text/javascript' id='wc-add-to-cart-js-extra'>
    /* <![CDATA[ */
    var wc_add_to_cart_params = {
        "ajax_url": "\/marketov2\/wp-admin\/admin-ajax.php",
        "wc_ajax_url": "\/marketov2\/?wc-ajax=%%endpoint%%",
        "i18n_view_cart": "View cart",
        "cart_url": "https:\/\/demo.xpeedstudio.com\/marketov2\/cart\/",
        "is_cart": "",
        "cart_redirect_after_add": "no"
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart.min.js?ver=6.2.2' id='wc-add-to-cart-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/js/js-cookie/js.cookie.min.js?ver=2.1.4-wc.6.2.2' id='js-cookie-js' defer></script>
<script type='text/javascript' id='woocommerce-js-extra'>
    /* <![CDATA[ */
    var woocommerce_params = {
        "ajax_url": "\/marketov2\/wp-admin\/admin-ajax.php",
        "wc_ajax_url": "\/marketov2\/?wc-ajax=%%endpoint%%"
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/js/frontend/woocommerce.min.js?ver=6.2.2' id='woocommerce-js' defer></script>
<script type='text/javascript' id='wc-cart-fragments-js-extra'>
    /* <![CDATA[ */
    var wc_cart_fragments_params = {
        "ajax_url": "\/marketov2\/wp-admin\/admin-ajax.php",
        "wc_ajax_url": "\/marketov2\/?wc-ajax=%%endpoint%%",
        "cart_hash_key": "wc_cart_hash_12053ea65b2ad61c4d64d29cd5c62685",
        "fragment_name": "wc_fragments_12053ea65b2ad61c4d64d29cd5c62685",
        "request_timeout": "5000"
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/js/frontend/cart-fragments.min.js?ver=6.2.2' id='wc-cart-fragments-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' id='rocket-browser-checker-js-after'>
    
"use strict";var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||!1,descriptor.configurable=!0,"value"in descriptor&&(descriptor.writable=!0),Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){return protoProps&&defineProperties(Constructor.prototype,protoProps),staticProps&&defineProperties(Constructor,staticProps),Constructor}}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor))throw new TypeError("Cannot call a class as a function")}var RocketBrowserCompatibilityChecker=function(){function RocketBrowserCompatibilityChecker(options){_classCallCheck(this,RocketBrowserCompatibilityChecker),this.passiveSupported=!1,this._checkPassiveOption(this),this.options=!!this.passiveSupported&&options}return _createClass(RocketBrowserCompatibilityChecker,[{key:"_checkPassiveOption",value:function(self){try{var options={get passive(){return!(self.passiveSupported=!0)}};window.addEventListener("test",null,options),window.removeEventListener("test",null,options)}catch(err){self.passiveSupported=!1}}},{key:"initRequestIdleCallback",value:function(){!1 in window&&(window.requestIdleCallback=function(cb){var start=Date.now();return setTimeout(function(){cb({didTimeout:!1,timeRemaining:function(){return Math.max(0,50-(Date.now()-start))}})},1)}),!1 in window&&(window.cancelIdleCallback=function(id){return clearTimeout(id)})}},{key:"isDataSaverModeOn",value:function(){return"connection"in navigator&&!0===navigator.connection.saveData}},{key:"supportsLinkPrefetch",value:function(){var elem=document.createElement("link");return elem.relList&&elem.relList.supports&&elem.relList.supports("prefetch")&&window.IntersectionObserver&&"isIntersecting"in IntersectionObserverEntry.prototype}},{key:"isSlowConnection",value:function(){return"connection"in navigator&&"effectiveType"in navigator.connection&&("2g"===navigator.connection.effectiveType||"slow-2g"===navigator.connection.effectiveType)}}]),RocketBrowserCompatibilityChecker}();

</script>
<script type='text/javascript' id='rocket-preload-links-js-extra'>
    /* <![CDATA[ */
    var RocketPreloadLinksConfig = {
        "excludeUris": "\/marketov2(\/(.+\/)?feed\/?.+\/?|\/(?:.+\/)?embed\/|\/checkout\/|\/cart\/|\/my-account\/|\/wc-api\/v(.*)|(\/[^\/]+)?\/(index\\.php\/)?wp\\-json(\/.*|$))|\/wp-admin\/|\/logout\/|\/wp-login.php",
        "usesTrailingSlash": "1",
        "imageExt": "jpg|jpeg|gif|png|tiff|bmp|webp|avif",
        "fileExt": "jpg|jpeg|gif|png|tiff|bmp|webp|avif|php|pdf|html|htm",
        "siteUrl": "https:\/\/demo.xpeedstudio.com\/marketov2",
        "onHoverDelay": "100",
        "rateThrottle": "3"
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' id='rocket-preload-links-js-after'>
    
(function() {
"use strict";var r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},e=function(){function i(e,t){for(var n=0;n<t.length;n++){var i=t[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}return function(e,t,n){return t&&i(e.prototype,t),n&&i(e,n),e}}();function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var t=function(){function n(e,t){i(this,n),this.browser=e,this.config=t,this.options=this.browser.options,this.prefetched=new Set,this.eventTime=null,this.threshold=1111,this.numOnHover=0}return e(n,[{key:"init",value:function(){!this.browser.supportsLinkPrefetch()||this.browser.isDataSaverModeOn()||this.browser.isSlowConnection()||(this.regex={excludeUris:RegExp(this.config.excludeUris,"i"),images:RegExp(".("+this.config.imageExt+")$","i"),fileExt:RegExp(".("+this.config.fileExt+")$","i")},this._initListeners(this))}},{key:"_initListeners",value:function(e){-1<this.config.onHoverDelay&&document.addEventListener("mouseover",e.listener.bind(e),e.listenerOptions),document.addEventListener("mousedown",e.listener.bind(e),e.listenerOptions),document.addEventListener("touchstart",e.listener.bind(e),e.listenerOptions)}},{key:"listener",value:function(e){var t=e.target.closest("a"),n=this._prepareUrl(t);if(null!==n)switch(e.type){case"mousedown":case"touchstart":this._addPrefetchLink(n);break;case"mouseover":this._earlyPrefetch(t,n,"mouseout")}}},{key:"_earlyPrefetch",value:function(t,e,n){var i=this,r=setTimeout(function(){if(r=null,0===i.numOnHover)setTimeout(function(){return i.numOnHover=0},1e3);else if(i.numOnHover>i.config.rateThrottle)return;i.numOnHover++,i._addPrefetchLink(e)},this.config.onHoverDelay);t.addEventListener(n,function e(){t.removeEventListener(n,e,{passive:!0}),null!==r&&(clearTimeout(r),r=null)},{passive:!0})}},{key:"_addPrefetchLink",value:function(i){return this.prefetched.add(i.href),new Promise(function(e,t){var n=document.createElement("link");n.rel="prefetch",n.href=i.href,n.onload=e,n.onerror=t,document.head.appendChild(n)}).catch(function(){})}},{key:"_prepareUrl",value:function(e){if(null===e||"object"!==(void 0===e?"undefined":r(e))||!1 in e||-1===["http:","https:"].indexOf(e.protocol))return null;var t=e.href.substring(0,this.config.siteUrl.length),n=this._getPathname(e.href,t),i={original:e.href,protocol:e.protocol,origin:t,pathname:n,href:t+n};return this._isLinkOk(i)?i:null}},{key:"_getPathname",value:function(e,t){var n=t?e.substring(this.config.siteUrl.length):e;return n.startsWith("/")||(n="/"+n),this._shouldAddTrailingSlash(n)?n+"/":n}},{key:"_shouldAddTrailingSlash",value:function(e){return this.config.usesTrailingSlash&&!e.endsWith("/")&&!this.regex.fileExt.test(e)}},{key:"_isLinkOk",value:function(e){return null!==e&&"object"===(void 0===e?"undefined":r(e))&&(!this.prefetched.has(e.href)&&e.origin===this.config.siteUrl&&-1===e.href.indexOf("?")&&-1===e.href.indexOf("#")&&!this.regex.excludeUris.test(e.href)&&!this.regex.images.test(e.href))}}],[{key:"run",value:function(){"undefined"!=typeof RocketPreloadLinksConfig&&new n(new RocketBrowserCompatibilityChecker({capture:!0,passive:!0}),RocketPreloadLinksConfig).init()}}]),n}();t.run();
}());

</script>
<script type='text/javascript' id='yith-woocompare-main-js-extra'>
    /* <![CDATA[ */
    var yith_woocompare = {
        "ajaxurl": "\/marketov2\/?wc-ajax=%%endpoint%%",
        "actionadd": "yith-woocompare-add-product",
        "actionremove": "yith-woocompare-remove-product",
        "actionview": "yith-woocompare-view-table",
        "actionreload": "yith-woocompare-reload-product",
        "added_label": "Added",
        "table_title": "Product Comparison",
        "auto_open": "yes",
        "loader": "https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/plugins\/yith-woocommerce-compare\/assets\/images\/loader.gif",
        "button_text": "Compare",
        "cookie_name": "yith_woocompare_list_1",
        "close_label": "Close"
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/yith-woocommerce-compare/assets/js/woocompare.min.js?ver=2.11.0' id='yith-woocompare-main-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/yith-woocommerce-compare/assets/js/jquery.colorbox-min.js?ver=1.4.21' id='jquery-colorbox-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementskit-lite/libs/framework/assets/js/frontend-script.js?ver=1649587914' id='elementskit-framework-js-frontend-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' id='elementskit-framework-js-frontend-js-after'>
    
		var elementskit = {
            resturl: 'https://demo.xpeedstudio.com/marketov2/wp-json/elementskit/v1/',
        }

		

</script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementskit-lite/widgets/init/assets/js/widget-scripts.js?ver=1649587914' id='ekit-widget-scripts-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-includes/js/underscore.min.js?ver=1.13.1' id='underscore-js' defer></script>
<script type='text/javascript' id='wp-util-js-extra'>
    /* <![CDATA[ */
    var _wpUtilSettings = {
        "ajax": {
            "url": "\/marketov2\/wp-admin\/admin-ajax.php"
        }
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-includes/js/wp-util.min.js?ver=5.9.5' id='wp-util-js' defer></script>
<script type='text/javascript' id='wc-add-to-cart-variation-js-extra'>
    /* <![CDATA[ */
    var wc_add_to_cart_variation_params = {
        "wc_ajax_url": "\/marketov2\/?wc-ajax=%%endpoint%%",
        "i18n_no_matching_variations_text": "Sorry, no products matched your selection. Please choose a different combination.",
        "i18n_make_a_selection_text": "Please select some product options before adding this product to your cart.",
        "i18n_unavailable_text": "Sorry, this product is unavailable. Please choose a different combination."
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woocommerce/assets/js/frontend/add-to-cart-variation.min.js?ver=6.2.2' id='wc-add-to-cart-variation-js' defer></script>
<script type='text/javascript' id='woo-variation-swatches-js-extra'>
    /* <![CDATA[ */
    var woo_variation_swatches_options = {
        "is_product_page": "",
        "show_variation_label": "1",
        "variation_label_separator": ":",
        "wvs_nonce": "46fa7b2f19"
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woo-variation-swatches/assets/js/frontend.min.js?ver=1.1.19' id='woo-variation-swatches-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/js/plugins.js?ver=1649587914' id='marketo-plugins-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/js/bootstrap.min.js?ver=4.6.2' id='bootstrap-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/js/jquery.menu-aim.js?ver=1649587914' id='menu-aim-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/js/vertical-menu.js?ver=1649587914' id='vertical-menu-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/js/swiper.min.js?ver=4.6.2' id='swiper-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/js/fontfaceobserver.js?ver=1649587914' id='fontfaceobserver-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' id='marketo-main-js-before'>
    
var fontList = ["Roboto","Roboto","Roboto","Roboto","Roboto","Roboto","Roboto","Roboto"]

</script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/js/main.js?ver=1649587914' id='marketo-main-js' defer></script>
<script type='text/javascript' id='marketo-ajax-setting-js-extra'>
    /* <![CDATA[ */
    var xs_ajax_obj = {
        "ajaxurl": "https:\/\/demo.xpeedstudio.com\/marketov2\/wp-admin\/admin-ajax.php",
        "product_added": "Product Added Succefully",
        "marketpess_nonce": "82055b8fbf"
    };
    var xs_product_timers = {
        "xs_date": "Days",
        "xs_hours": "Hours",
        "xs_minutes": "Minutes",
        "xs_secods": "Seconds",
        "xs_acc_or": "or"
    };
    var ajax_load_more_product = {
        "enabled": ""
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/js/ajax-script.js?ver=1649587914' id='marketo-ajax-setting-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/js/v4-shims.min.js?ver=3.5.6' id='font-awesome-4-shim-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js?ver=3.5.6' id='elementor-webpack-runtime-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/js/frontend-modules.min.js?ver=3.5.6' id='elementor-frontend-modules-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/waypoints/waypoints.min.js?ver=4.0.2' id='elementor-waypoints-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-includes/js/jquery/ui/core.min.js?ver=1.13.1' id='jquery-ui-core-js' defer></script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' id='elementor-frontend-js-before'>
    
var elementorFrontendConfig = {"environmentMode":{"edit":false,"wpPreview":false,"isScriptDebug":false},"i18n":{"shareOnFacebook":"Share on Facebook","shareOnTwitter":"Share on Twitter","pinIt":"Pin it","download":"Download","downloadImage":"Download image","fullscreen":"Fullscreen","zoom":"Zoom","share":"Share","playVideo":"Play Video","previous":"Previous","next":"Next","close":"Close"},"is_rtl":false,"breakpoints":{"xs":0,"sm":480,"md":768,"lg":1025,"xl":1440,"xxl":1600},"responsive":{"breakpoints":{"mobile":{"label":"Mobile","value":767,"default_value":767,"direction":"max","is_enabled":true},"mobile_extra":{"label":"Mobile Extra","value":880,"default_value":880,"direction":"max","is_enabled":false},"tablet":{"label":"Tablet","value":1024,"default_value":1024,"direction":"max","is_enabled":true},"tablet_extra":{"label":"Tablet Extra","value":1200,"default_value":1200,"direction":"max","is_enabled":false},"laptop":{"label":"Laptop","value":1366,"default_value":1366,"direction":"max","is_enabled":false},"widescreen":{"label":"Widescreen","value":2400,"default_value":2400,"direction":"min","is_enabled":false}}},"version":"3.5.6","is_static":false,"experimentalFeatures":{"e_dom_optimization":true,"e_optimized_assets_loading":true,"e_optimized_css_loading":true,"a11y_improvements":true,"e_import_export":true,"additional_custom_breakpoints":true,"e_hidden_wordpress_widgets":true,"landing-pages":true,"elements-color-picker":true,"favorite-widgets":true,"admin-top-bar":true},"urls":{"assets":"https:\/\/demo.xpeedstudio.com\/marketov2\/wp-content\/plugins\/elementor\/assets\/"},"settings":{"editorPreferences":[]},"kit":{"active_breakpoints":["viewport_mobile","viewport_tablet"],"global_image_lightbox":"yes","lightbox_enable_counter":"yes","lightbox_enable_fullscreen":"yes","lightbox_enable_zoom":"yes","lightbox_enable_share":"yes","lightbox_title_src":"title","lightbox_description_src":"description"},"post":{"id":0,"title":"Products &#8211; Marketo","excerpt":"<p>This is where you can browse products in this store.<\/p>\n"}};

</script>
<script type="rocketlazyloadscript" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/js/frontend.min.js?ver=3.5.6' id='elementor-frontend-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/js/elementor.js?ver=1649587914' id='xs-main-elementor-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/js/widget-scripts-pro.js?ver=1649587914' id='marketo-widget-scripts-pro-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementskit-lite/widgets/init/assets/js/animate-circle.js?ver=1649587914' id='animate-circle-js' defer></script>
<script type='text/javascript' id='elementskit-elementor-js-extra'>
    /* <![CDATA[ */
    var ekit_config = {
        "ajaxurl": "https:\/\/demo.xpeedstudio.com\/marketov2\/wp-admin\/admin-ajax.php",
        "nonce": "5338c1da77"
    };
    /* ]]> */
</script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementskit-lite/widgets/init/assets/js/elementor.js?ver=1649587914' id='elementskit-elementor-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/marketo-features/elements/sticky-content/assets/js/jquery.sticky.js?ver=1649587914' id='elementskit-sticky-content-script-js' defer></script>
<script type="rocketlazyloadscript" data-minify="1" data-rocket-type='text/javascript' src='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/marketo-features/elements/sticky-content/assets/js/init.js?ver=1649587914' id='elementskit-sticky-content-script-init-js' defer></script>
<script>
    window.lazyLoadOptions = {
        elements_selector: "img[data-lazy-src],.rocket-lazyload,iframe[data-lazy-src]",
        data_src: "lazy-src",
        data_srcset: "lazy-srcset",
        data_sizes: "lazy-sizes",
        class_loading: "lazyloading",
        class_loaded: "lazyloaded",
        threshold: 300,
        callback_loaded: function(element) {
            if (element.tagName === "IFRAME" && element.dataset.rocketLazyload == "fitvidscompatible") {
                if (element.classList.contains("lazyloaded")) {
                    if (typeof window.jQuery != "undefined") {
                        if (jQuery.fn.fitVids) {
                            jQuery(element).parent().fitVids()
                        }
                    }
                }
            }
        }
    };
    window.addEventListener('LazyLoad::Initialized', function(e) {
        var lazyLoadInstance = e.detail.instance;
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                var image_count = 0;
                var iframe_count = 0;
                var rocketlazy_count = 0;
                mutations.forEach(function(mutation) {
                    for (i = 0; i < mutation.addedNodes.length; i++) {
                        if (typeof mutation.addedNodes[i].getElementsByTagName !== 'function') {
                            continue
                        }
                        if (typeof mutation.addedNodes[i].getElementsByClassName !== 'function') {
                            continue
                        }
                        images = mutation.addedNodes[i].getElementsByTagName('img');
                        is_image = mutation.addedNodes[i].tagName == "IMG";
                        iframes = mutation.addedNodes[i].getElementsByTagName('iframe');
                        is_iframe = mutation.addedNodes[i].tagName == "IFRAME";
                        rocket_lazy = mutation.addedNodes[i].getElementsByClassName('rocket-lazyload');
                        image_count += images.length;
                        iframe_count += iframes.length;
                        rocketlazy_count += rocket_lazy.length;
                        if (is_image) {
                            image_count += 1
                        }
                        if (is_iframe) {
                            iframe_count += 1
                        }
                    }
                });
                if (image_count > 0 || iframe_count > 0 || rocketlazy_count > 0) {
                    lazyLoadInstance.update()
                }
            }
            );
            var b = document.getElementsByTagName("body")[0];
            var config = {
                childList: !0,
                subtree: !0
            };
            observer.observe(b, config)
        }
    }, !1)
</script>
<script data-no-minify="1" async src="https://demo.xpeedstudio.com/marketov2/wp-content/plugins/wp-rocket/assets/js/lazyload/16.1/lazyload.min.js"></script>
<script>
    function lazyLoadThumb(e) {
        var t = '<img loading="lazy" data-lazy-src="https://i.ytimg.com/vi/ID/hqdefault.jpg" alt="" width="480" height="360"><noscript><img src="https://i.ytimg.com/vi/ID/hqdefault.jpg" alt="" width="480" height="360"></noscript>'
          , a = '<div class="play"></div>';
        return t.replace("ID", e) + a
    }
    function lazyLoadYoutubeIframe() {
        var e = document.createElement("iframe")
          , t = "ID?autoplay=1";
        t += 0 === this.dataset.query.length ? '' : '&' + this.dataset.query;
        e.setAttribute("src", t.replace("ID", this.dataset.src)),
        e.setAttribute("frameborder", "0"),
        e.setAttribute("allowfullscreen", "1"),
        e.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"),
        this.parentNode.replaceChild(e, this)
    }
    document.addEventListener("DOMContentLoaded", function() {
        var e, t, a = document.getElementsByClassName("rll-youtube-player");
        for (t = 0; t < a.length; t++)
            e = document.createElement("div"),
            e.setAttribute("data-id", a[t].dataset.id),
            e.setAttribute("data-query", a[t].dataset.query),
            e.setAttribute("data-src", a[t].dataset.src),
            e.innerHTML = lazyLoadThumb(a[t].dataset.id),
            e.onclick = lazyLoadYoutubeIframe,
            a[t].appendChild(e)
    });
</script>
<script type="rocketlazyloadscript">
    "use strict";var wprRemoveCPCSS=function wprRemoveCPCSS(){var elem;document.querySelector('link[data-rocket-async="style"][rel="preload"]')?setTimeout(wprRemoveCPCSS,200):(elem=document.getElementById("rocket-critical-css"))&&"remove"in elem&&elem.remove()};window.addEventListener?window.addEventListener("load",wprRemoveCPCSS):window.attachEvent&&window.attachEvent("onload",wprRemoveCPCSS);
</script>
<script>
    class RocketElementorAnimation {
        constructor() {
            this.deviceMode = document.createElement("span"),
            this.deviceMode.id = "elementor-device-mode",
            this.deviceMode.setAttribute("class", "elementor-screen-only"),
            document.body.appendChild(this.deviceMode)
        }
        _detectAnimations() {
            let t = getComputedStyle(this.deviceMode, ":after").content.replace(/"/g, "");
            this.animationSettingKeys = this._listAnimationSettingsKeys(t),
            document.querySelectorAll(".elementor-invisible[data-settings]").forEach(t=>{
                const e = t.getBoundingClientRect();
                if (e.bottom >= 0 && e.top <= window.innerHeight)
                    try {
                        this._animateElement(t)
                    } catch (t) {}
            }
            )
        }
        _animateElement(t) {
            const e = JSON.parse(t.dataset.settings)
              , i = e._animation_delay || e.animation_delay || 0
              , n = e[this.animationSettingKeys.find(t=>e[t])];
            if ("none" === n)
                return void t.classList.remove("elementor-invisible");
            t.classList.remove(n),
            this.currentAnimation && t.classList.remove(this.currentAnimation),
            this.currentAnimation = n;
            let s = setTimeout(()=>{
                t.classList.remove("elementor-invisible"),
                t.classList.add("animated", n),
                this._removeAnimationSettings(t, e)
            }
            , i);
            window.addEventListener("rocket-startLoading", function() {
                clearTimeout(s)
            })
        }
        _listAnimationSettingsKeys(t="mobile") {
            const e = [""];
            switch (t) {
            case "mobile":
                e.unshift("_mobile");
            case "tablet":
                e.unshift("_tablet");
            case "desktop":
                e.unshift("_desktop")
            }
            const i = [];
            return ["animation", "_animation"].forEach(t=>{
                e.forEach(e=>{
                    i.push(t + e)
                }
                )
            }
            ),
            i
        }
        _removeAnimationSettings(t, e) {
            this._listAnimationSettingsKeys().forEach(t=>delete e[t]),
            t.dataset.settings = JSON.stringify(e)
        }
        static run() {
            const t = new RocketElementorAnimation;
            requestAnimationFrame(t._detectAnimations.bind(t))
        }
    }
    document.addEventListener("DOMContentLoaded", RocketElementorAnimation.run);
</script>
<noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CRoboto%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic&#038;display=swap"/>
    <link data-minify="1" rel='stylesheet' id='wc-blocks-vendors-style-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/packages/woocommerce-blocks/build/wc-blocks-vendors-style.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='wc-blocks-style-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/packages/woocommerce-blocks/build/wc-blocks-style.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='woocommerce-layout-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/assets/css/woocommerce-layout.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='woocommerce-smallscreen-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/assets/css/woocommerce-smallscreen.css?ver=1651166584' type='text/css' media='only screen and (max-width: 768px)'/>
    <link data-minify="1" rel='stylesheet' id='woocommerce-general-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/woocommerce/assets/css/woocommerce.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='jquery-colorbox-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/yith-woocommerce-compare/assets/css/colorbox.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='fw-ext-builder-frontend-grid-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/unyson/framework/extensions/builder/static/css/frontend-grid.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='fw-ext-forms-default-styles-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/unyson/framework/extensions/forms/static/css/frontend.css?ver=1651166584' type='text/css' media='all'/>
    <link rel='stylesheet' id='woo-variation-swatches-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woo-variation-swatches/assets/css/frontend.min.css?ver=1.1.19' type='text/css' media='all'/>
    <link rel='stylesheet' id='woo-variation-swatches-theme-override-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woo-variation-swatches/assets/css/wvs-theme-override.min.css?ver=1.1.19' type='text/css' media='all'/>
    <link rel='stylesheet' id='woo-variation-swatches-tooltip-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/woo-variation-swatches/assets/css/frontend-tooltip.min.css?ver=1.1.19' type='text/css' media='all'/>
    <link rel='stylesheet' id='bootstrap-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/themes/marketo/assets/css/bootstrap.min.css?ver=4.6.2' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='marketo-plugins-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/plugins.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-icons-shared-0-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/xs-icon-font.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-icons-icon-marketo-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/xs-icon-font.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='swiper-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/swiper.min.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='marketo-style-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/style.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='marketo-responsive-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/responsive.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='ekit-widget-styles-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementskit-lite/widgets/init/assets/css/widget-styles.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='ekit-responsive-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementskit-lite/widgets/init/assets/css/responsive.css?ver=1651166584' type='text/css' media='all'/>
    <link rel='stylesheet' id='elementor-frontend-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/css/frontend-lite.min.css?ver=3.5.6' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-2234-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-2234.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='font-awesome-5-all-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css?ver=1651168236' type='text/css' media='all'/>
    <link rel='stylesheet' id='font-awesome-4-shim-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css?ver=3.5.6' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-3640-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3640.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-3672-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3672.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-3685-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3685.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-3690-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3690.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-3697-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3697.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-3706-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-3706.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-2235-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-2235.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-post-6-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/post-6.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='elementor-global-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/uploads/elementor/css/global.css?ver=1651166584' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='marketo-widget-styles-pro-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/themes/marketo/assets/css/widget-styles-pro.css?ver=1651166584' type='text/css' media='all'/>
    <link rel='stylesheet' id='e-animations-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/plugins/elementor/assets/lib/animations/animations.min.css?ver=3.5.6' type='text/css' media='all'/>
    <link data-minify="1" rel='stylesheet' id='rs-plugin-settings-css' href='https://demo.xpeedstudio.com/marketov2/wp-content/cache/min/1/marketov2/wp-content/plugins/revslider/public/assets/css/rs6.css?ver=1651166584' type='text/css' media='all'/>
</noscript>
</body></html>
