(function setupImageUpload() {
  const input = document.getElementById("imageInput");
  const canvas = document.getElementById("chartCanvas");
  const detectBtn = document.getElementById("detectBtn");

  if (!input || !canvas) {
    console.error("Upload elements not found", {
      input: !!input,
      canvas: !!canvas
    });
    return;
  }

  const ctx = canvas.getContext("2d");

  input.addEventListener("change", function () {
    const file = input.files && input.files[0];

    if (!file) {
      console.warn("No image selected");
      return;
    }

    console.log("Uploading image:", file.name);

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = function () {
      const scale = Math.min(
        1,
        1400 / Math.max(img.width, img.height)
      );

      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (detectBtn) detectBtn.disabled = false;

      console.log(
        "IMAGE LOADED SUCCESSFULLY",
        canvas.width,
        canvas.height
      );

      URL.revokeObjectURL(url);
    };

    img.onerror = function () {
      console.error("Failed to decode uploaded image");
      alert("Image could not be opened. Try a PNG or JPG.");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });

  console.log("V3 IMAGE UPLOAD LISTENER INSTALLED");
})();
