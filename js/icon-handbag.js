document.addEventListener("DOMContentLoaded", function () {
    const viewCartIcon = document.getElementById("view-cart");

    if (viewCartIcon) {
        viewCartIcon.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "order-shopping-cart.html";
        });
    }
});
