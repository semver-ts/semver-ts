// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="index.html">Introduction</a></li><li class="chapter-item expanded affix "><li class="part-title">Background and Basics</li><li class="chapter-item expanded "><a href="1-background.html"><strong aria-hidden="true">1.</strong> TypeScript’s Versioning Policy</a></li><li class="chapter-item expanded "><a href="2-conformance.html"><strong aria-hidden="true">2.</strong> Conformance</a></li><li class="chapter-item expanded "><a href="3-practical-guidance.html"><strong aria-hidden="true">3.</strong> Practical Guidance</a></li><li class="chapter-item expanded affix "><li class="part-title">Formal Specification</li><li class="chapter-item expanded "><a href="formal-spec/index.html"><strong aria-hidden="true">4.</strong> Overview</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="formal-spec/1-definitions.html"><strong aria-hidden="true">4.1.</strong> Definitions</a></li><li class="chapter-item expanded "><a href="formal-spec/2-breaking-changes.html"><strong aria-hidden="true">4.2.</strong> Breaking Changes</a></li><li class="chapter-item expanded "><a href="formal-spec/3-non-breaking-changes.html"><strong aria-hidden="true">4.3.</strong> Non-Breaking Changes</a></li><li class="chapter-item expanded "><a href="formal-spec/4-bug-fixes.html"><strong aria-hidden="true">4.4.</strong> Bug Fixes</a></li><li class="chapter-item expanded "><a href="formal-spec/5-compiler-considerations.html"><strong aria-hidden="true">4.5.</strong> Compiler Considerations</a></li></ol></li><li class="chapter-item expanded "><li class="part-title">Appendices</li><li class="chapter-item expanded "><a href="appendices/index.html"><strong aria-hidden="true">5.</strong> Overview</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="appendices/a-adopters.html"><strong aria-hidden="true">5.1.</strong> Adopters</a></li><li class="chapter-item expanded "><a href="appendices/b-tooling.html"><strong aria-hidden="true">5.2.</strong> Tooling</a></li><li class="chapter-item expanded "><a href="appendices/c-variance-in-typescript.html"><strong aria-hidden="true">5.3.</strong> Variance in TypeScript</a></li><li class="chapter-item expanded "><a href="appendices/d-history.html"><strong aria-hidden="true">5.4.</strong> History</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
