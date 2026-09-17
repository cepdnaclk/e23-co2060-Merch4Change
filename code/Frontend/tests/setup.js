import "@testing-library/jest-dom";

// jsdom doesn't implement scrollIntoView, but several components (Navbar's
// in-page section links, HelpAndSupport's category/filter jumps) call it on
// click. Without a stub, those clicks throw "scrollIntoView is not a
// function" in every test that exercises them.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function () {};
}
