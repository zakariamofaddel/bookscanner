// GSAP ANIMATIONS

let startButton = document.querySelector("#start-button");
let stopButton = document.querySelector("#stop-button");

startButton.addEventListener("click", () => {
	gsap.to("#scanner-container", { y: "0%", duration: 0.5 });
});
stopButton.addEventListener("click", () => {
	gsap.to("#scanner-container", { y: "-130%", duration: 0.5 });
});
