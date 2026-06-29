# app/services/settings_service.py
# Admin controls: delivery charges, store settings

from app.db.mongodb import get_database
from datetime import datetime, timezone


DEFAULT_SETTINGS = {
    "delivery": {
        "flat_rate":       200,       # PKR — default flat rate
        "free_above":      5000,      # PKR — free delivery above this amount (0 = never free)
        "city_rates": {               # Optional city-specific rates
            "Karachi":   250,
            "Lahore":    200,
            "Islamabad": 180,
            "Rawalpindi": 180,
            "Peshawar":  300,
            "Quetta":    350,
        },
        "use_city_rates":  False,     # If True, use city_rates instead of flat_rate
    },
    "tax": {
        "enabled":    False,          # Tax is OFF by default
        "rate":       0.0,            # 0% — change to 0.17 for 17% GST when needed
        "label":      "GST",
    },
    "store": {
        "name":     "GlistonWorld",
        "currency": "PKR",
        "cod_enabled":       True,
        "cod_max_amount":    50000,   # Max order amount for COD
    }
}


class SettingsService:
    def __init__(self):
        self.db  = get_database()
        self.col = self.db.settings

    async def get_all(self) -> dict:
        doc = await self.col.find_one({"_id": "store_settings"})
        if not doc:
            await self._create_defaults()
            return DEFAULT_SETTINGS.copy()
        doc.pop("_id", None)
        return doc

    async def get_delivery(self) -> dict:
        settings = await self.get_all()
        return settings.get("delivery", DEFAULT_SETTINGS["delivery"])

    async def get_tax(self) -> dict:
        settings = await self.get_all()
        return settings.get("tax", DEFAULT_SETTINGS["tax"])

    async def update_delivery(self, data: dict) -> dict:
        await self.col.update_one(
            {"_id": "store_settings"},
            {"$set": {
                "delivery":   data,
                "updatedAt":  datetime.now(timezone.utc),
            }},
            upsert=True,
        )
        return await self.get_delivery()

    async def update_tax(self, data: dict) -> dict:
        await self.col.update_one(
            {"_id": "store_settings"},
            {"$set": {
                "tax":       data,
                "updatedAt": datetime.now(timezone.utc),
            }},
            upsert=True,
        )
        return await self.get_tax()

    async def calculate_order_totals(self, subtotal: float, city: str = None) -> dict:
        """
        Calculate shipping and tax for an order.
        Called during order placement.
        """
        delivery = await self.get_delivery()
        tax_cfg  = await self.get_tax()

        # --- Shipping ---
        if delivery.get("free_above", 0) > 0 and subtotal >= delivery["free_above"]:
            shipping = 0.0
            shipping_label = "Free Delivery"
        elif delivery.get("use_city_rates") and city:
            city_rates = delivery.get("city_rates", {})
            shipping   = city_rates.get(city, delivery.get("flat_rate", 200))
            shipping_label = f"Delivery to {city}"
        else:
            shipping = delivery.get("flat_rate", 200)
            shipping_label = "Standard Delivery"

        # --- Tax ---
        tax = 0.0
        if tax_cfg.get("enabled") and tax_cfg.get("rate", 0) > 0:
            tax = round(subtotal * tax_cfg["rate"], 2)

        total = round(subtotal + shipping + tax, 2)

        return {
            "subtotal":       round(subtotal, 2),
            "shipping":       shipping,
            "shipping_label": shipping_label,
            "tax":            tax,
            "tax_rate":       tax_cfg.get("rate", 0),
            "tax_label":      tax_cfg.get("label", "Tax"),
            "tax_enabled":    tax_cfg.get("enabled", False),
            "total":          total,
        }

    async def _create_defaults(self):
        doc = {"_id": "store_settings", **DEFAULT_SETTINGS, "updatedAt": datetime.now(timezone.utc)}
        await self.col.insert_one(doc)
