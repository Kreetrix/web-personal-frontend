export default class BackButton {
  constructor(contentElement, centerBoxElement) {
      this.content = contentElement;
      this.centerBox = centerBoxElement;
      this.initBackButton();
  }

  initBackButton() {
      const backButton = document.createElement('button');
      backButton.id = "backButton";
      backButton.className = "btn btn-primary";
      backButton.textContent = "Back to Home";
      console.log("button is created");
      backButton.addEventListener("click", () => {
          if (this.centerBox) this.centerBox.style.display = "contents";
          if (this.content) {
              this.content.innerHTML = '';
              this.content.removeAttribute("style");
          }
      });

      this.content.appendChild(backButton);
  }
}