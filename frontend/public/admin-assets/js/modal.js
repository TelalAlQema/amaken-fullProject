// Get elements
const modal = document.getElementById("myModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.querySelector(".close");

// Open the modal
openBtn.onclick = () => {
  modal.style.display = "block";
};

// Close the modal
closeBtn.onclick = () => {
  modal.style.display = "none";
};

// Close when clicking outside the modal
window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};
