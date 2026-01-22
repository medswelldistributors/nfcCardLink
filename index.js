/**
 * [FILE ROLE]
 * - handle save contact and dialer
 *
 * [FLOW]
 *  saveContactBtn → navigator.clipboard.writeText → window.location.href
 *
 * [DEPENDENCIES]
 * - none
 */
  document.addEventListener("DOMContentLoaded", function () {
  const saveContactBtn = document.getElementById("save-contact-btn");

  saveContactBtn.addEventListener("click", async () => {
    const nameToCopy = "Medswell Distributor";
    const phoneNumber = "tel:+919904685222";

    // Step 1: Try to copy the name to the clipboard
    try {
      await navigator.clipboard.writeText(nameToCopy);
      // Give feedback to the user that the copy was successful
      alert(`'${nameToCopy}' copied to clipboard. The dialer will now open.`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      // If copy fails, inform the user but still proceed
      alert("Could not copy name. Opening the dialer.");
    }

    // Step 2: Open the phone's dialer
    window.location.href = phoneNumber;
  });
});
