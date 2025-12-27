export function parseBulkProducts(rawText) {
  if (!rawText || typeof rawText !== "string") return [];

  const productBlocks = rawText.trim().split(/\n\s*\n/); // product separator

  return productBlocks
    .map((block, index) => {
      const lines = block.split("\n").map((line) => line.trim());

      // Remove trailing empty lines only
      while (lines.length && lines[lines.length - 1] === "") {
        lines.pop();
      }

      // Required fields count = 8
      if (lines.length < 8) {
        console.warn(`❌ Product ${index + 1} skipped: missing required fields`);
        return null;
      }

      const [
        name,
        content,
        form,
        mg,
        mrp,
        rate,
        unitOfSale,
        unitName,
        imageUrl, // optional
      ] = lines;

      return {
        id: name.toLowerCase().replace(/\s+/g, ""),
        name,
        content,
        form,
        mg,
        mrp: Number(mrp),
        rate: Number(rate),
        unitOfSale,
        unitName,
        imageUrl: imageUrl || null, // ✅ safe default
      };
    })
    .filter(Boolean);
}

