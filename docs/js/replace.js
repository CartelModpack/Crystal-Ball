// Config

/**
 * Document replacements. Any item in the form `<|key|>` will be replaced with the return value of the function.
 */
const replacements = {
  host: () => {
    return window.location.origin;
  },
};

// Execution

for (const key of Object.keys(replacements)) {
  for (const elm of document.querySelectorAll(".md-sidebar")) {
    elm.innerHTML = elm.innerHTML.replaceAll(`||${key}||`, "");
  }

  document.querySelector(".md-container").innerHTML = document
    .querySelector(".md-container")
    .innerHTML.replaceAll(`||${key}||`, String(replacements[key]()));
}
