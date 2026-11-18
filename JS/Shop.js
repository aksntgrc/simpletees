// SimpleTees order form
// This front-end form prepares an email for the store. It does not send mail
// automatically; the customer reviews and sends the message from their email app.
(function () {
  "use strict";

  const ORDER_EMAIL = "orders@examplewebsite142.com";
  const UNIT_PRICE = 499;
  const MIN_QUANTITY = 1;
  const MAX_QUANTITY = 99;

  function money(amount) {
    return "PHP " + amount.toFixed(2);
  }

  function createOrderDialog() {
    if (document.getElementById("order-form-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "order-form-overlay";
    overlay.className = "order-form-overlay";
    overlay.innerHTML = `
      <section class="order-form-dialog" role="dialog" aria-modal="true"
        aria-labelledby="order-form-title">
        <button type="button" class="order-form-close" aria-label="Close order form">&times;</button>
        <p class="order-form-eyebrow">SIMPLE TEES</p>
        <h2 id="order-form-title">Complete your order</h2>
        <p class="order-form-intro">Enter your contact and delivery details. Your order will be prepared in an email for review.</p>

        <form id="customer-order-form">
          <div class="order-form-summary">
            <p><strong>Product:</strong> <span id="summary-product"></span></p>
            <p><strong>Size:</strong> <span id="summary-size"></span></p>
            <p><strong>Quantity:</strong> <span id="summary-quantity"></span></p>
            <p><strong>Total:</strong> <span id="summary-total"></span></p>
          </div>

          <div class="order-form-fields">
            <div class="order-field">
              <label for="customer-name">Full name *</label>
              <input id="customer-name" name="customerName" type="text" autocomplete="name" required maxlength="100">
            </div>
            <div class="order-field">
              <label for="customer-email">Email address *</label>
              <input id="customer-email" name="customerEmail" type="email" autocomplete="email" required maxlength="150">
            </div>
            <div class="order-field">
              <label for="customer-phone">Contact number *</label>
              <input id="customer-phone" name="customerPhone" type="tel" autocomplete="tel" required maxlength="30">
            </div>
            <div class="order-field order-field-full">
              <label for="customer-address">Complete delivery address *</label>
              <textarea id="customer-address" name="customerAddress" autocomplete="street-address" rows="3" required maxlength="500"></textarea>
            </div>
            <div class="order-field order-field-full">
              <label for="customer-notes">Additional notes (optional)</label>
              <textarea id="customer-notes" name="customerNotes" rows="2" maxlength="500" placeholder="Delivery instructions or other notes"></textarea>
            </div>
          </div>

          <p class="order-form-required">* Required fields</p>
          <button type="submit" class="order-form-submit">CONTINUE TO EMAIL</button>
          <p class="order-form-disclaimer">Your email app will open with the order details addressed to SimpleTees. Review the message and press Send to submit your order.</p>
        </form>
      </section>
    `;

    document.body.appendChild(overlay);
    return overlay;
  }

  function initProductOrder() {
    const productName = document.body.dataset.productName;
    const sizeButtons = document.querySelectorAll(".size-option");
    const quantityInput = document.getElementById("quantity");
    const orderButton = document.getElementById("order-now-button");

    if (!productName || !quantityInput || !orderButton) return;

    let selectedSize = "";
    const overlay = createOrderDialog();
    const form = document.getElementById("customer-order-form");
    const closeButton = overlay.querySelector(".order-form-close");

    sizeButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        selectedSize = button.dataset.size;
        sizeButtons.forEach(function (item) {
          const isSelected = item === button;
          item.classList.toggle("selected", isSelected);
          item.setAttribute("aria-pressed", String(isSelected));
        });
      });
    });

    function closeDialog() {
      overlay.classList.remove("is-open");
      orderButton.focus();
    }

    function getValidQuantity() {
      const quantity = Number.parseInt(quantityInput.value, 10);
      if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
        window.alert("Please enter a quantity between 1 and 99.");
        quantityInput.focus();
        return null;
      }
      return quantity;
    }

    orderButton.addEventListener("click", function () {
      if (!selectedSize) {
        window.alert("Please select a shirt size before ordering.");
        const firstSize = document.querySelector(".size-option");
        if (firstSize) firstSize.focus();
        return;
      }

      const quantity = getValidQuantity();
      if (quantity === null) return;

      document.getElementById("summary-product").textContent = productName;
      document.getElementById("summary-size").textContent = selectedSize;
      document.getElementById("summary-quantity").textContent = String(quantity);
      document.getElementById("summary-total").textContent = money(UNIT_PRICE * quantity);

      overlay.classList.add("is-open");
      const firstField = document.getElementById("customer-name");
      firstField.focus();
    });

    closeButton.addEventListener("click", closeDialog);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeDialog();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeDialog();
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) return;

      const quantity = getValidQuantity();
      if (quantity === null) return;

      const customerName = document.getElementById("customer-name").value.trim();
      const customerEmail = document.getElementById("customer-email").value.trim();
      const customerPhone = document.getElementById("customer-phone").value.trim();
      const customerAddress = document.getElementById("customer-address").value.trim();
      const customerNotes = document.getElementById("customer-notes").value.trim();
      const total = UNIT_PRICE * quantity;

      const subject = "SimpleTees Order - " + productName;
      const body = [
        "Hello SimpleTees,",
        "",
        "I would like to place the following order:",
        "",
        "ORDER DETAILS",
        "Product: " + productName,
        "Size: " + selectedSize,
        "Quantity: " + quantity,
        "Unit price: " + money(UNIT_PRICE),
        "Total: " + money(total),
        "",
        "CUSTOMER DETAILS",
        "Full name: " + customerName,
        "Email: " + customerEmail,
        "Contact number: " + customerPhone,
        "Delivery address: " + customerAddress,
        "Additional notes: " + (customerNotes || "None"),
        "",
        "Please contact me to confirm availability, delivery, and payment.",
        "Thank you!"
      ].join("\r\n");

      const mailtoUrl = "mailto:" + ORDER_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      // Trigger the email application from the form submission gesture.
      window.location.href = mailtoUrl;
      closeDialog();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProductOrder);
  } else {
    initProductOrder();
  }
})();
