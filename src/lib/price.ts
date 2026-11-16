const euro = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

const priceInput = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEuro(cents: number) {
  return euro.format(cents / 100);
}

export function formatPriceInput(cents: number) {
  return priceInput.format(cents / 100);
}

/** Dutch user input: comma decimals, optional thousands separators. */
export function parsePriceToCents(input: string): number | null {
  let value = input.trim().replace(/\s/g, "").replace(/€/g, "");
  if (!value) return null;

  if (value.includes(",") && value.includes(".")) {
    if (value.lastIndexOf(",") > value.lastIndexOf(".")) {
      value = value.replace(/\./g, "").replace(",", ".");
    } else {
      value = value.replace(/,/g, "");
    }
  } else if (value.includes(",")) {
    value = value.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(value)) {
    value = value.replace(/\./g, "");
  }

  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount > 999_999) return null;
  return Math.round(amount * 100);
}

/** Schema.org and Open Graph prices use a dot as the decimal mark. */
export function parseMetadataPriceToCents(raw: string): number | null {
  let value = raw.trim().replace(/\s/g, "").replace(/€/g, "").replace(/eur/gi, "");
  if (!value) return null;

  if (value.includes(",") && value.includes(".")) {
    if (value.lastIndexOf(",") > value.lastIndexOf(".")) {
      value = value.replace(/\./g, "").replace(",", ".");
    } else {
      value = value.replace(/,/g, "");
    }
  } else if (value.includes(",")) {
    value = value.replace(",", ".");
  }

  if (!/^\d+(\.\d{1,4})?$/.test(value)) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount > 999_999) return null;
  return Math.round(amount * 100);
}
