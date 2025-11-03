from typing import Any, Dict, Optional


def validate_invoice_data(invoice_data: Dict[str, Any]) -> Optional[str]:
    """
    Minimal schema validation for invoice payloads.

    Requirements:
    - customer: object with name (required); email optional
    - items: non-empty array with description (str), quantity (num), price (num)
    - invoice_id optional at this layer (route sanitizes/sets default)

    Returns
    - None when valid
    - Error message string when invalid
    """
    if not isinstance(invoice_data, dict):
        return 'payload must be a JSON object'

    customer = invoice_data.get('customer')
    if not isinstance(customer, dict):
        return '"customer" must be an object'
    name = str(customer.get('name') or '').strip()
    if not name:
        return 'customer.name is required'

    items = invoice_data.get('items')
    if not isinstance(items, list) or not items:
        return '"items" must be a non-empty array'
    for idx, it in enumerate(items):
        if not isinstance(it, dict):
            return f'"items[{idx}]" must be an object'
        desc = str(it.get('description') or '').strip()
        if not desc:
            return f'"items[{idx}].description" is required'
        try:
            qty = float(it.get('quantity'))
        except Exception:
            return f'"items[{idx}].quantity" must be a number'
        try:
            price = float(it.get('price'))
        except Exception:
            return f'"items[{idx}].price" must be a number'
        if qty <= 0:
            return f'"items[{idx}].quantity" must be > 0'
        if price < 0:
            return f'"items[{idx}].price" must be >= 0'

    return None

