console.log("Hello World from app.js");

document.addEventListener("click", (e) => {
  if (e.target.dataset.shorturl) {
    const url = `${window.location.origin}/${e.target.dataset.shorturl}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log("Text copied to clipboard...");
      })
      .catch((err) => {
        console.log("Something went wrong", err);
      });
  }
});
